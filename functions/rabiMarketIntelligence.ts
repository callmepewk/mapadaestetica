import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

    // 1) Coleta interna
    const [searchEvents, anuncios] = await Promise.all([
      base44.entities.SearchEvent.list('-created_date', 5000), // amostra grande
      base44.entities.Anuncio.filter({ status: 'ativo' }, '-created_date', 1000),
    ]);

    const within = (d, from) => {
      try { return new Date(d) >= from; } catch { return false; }
    };

    const se7 = (searchEvents || []).filter((e) => within(e.created_date, daysAgo(7)));
    const se14 = (searchEvents || []).filter((e) => within(e.created_date, daysAgo(14)) && !within(e.created_date, daysAgo(7)));
    const se30 = (searchEvents || []).filter((e) => within(e.created_date, daysAgo(30)));
    const se365 = (searchEvents || []).filter((e) => within(e.created_date, daysAgo(365)));

    // Map de termos
    const countTerms = (arr) => {
      const map = new Map();
      for (const ev of arr) {
        const q = (ev.query || '').trim().toLowerCase();
        if (!q) continue;
        map.set(q, (map.get(q) || 0) + 1);
      }
      return map;
    };

    const m7 = countTerms(se7);
    const mPrev7 = countTerms(se14);
    const m30 = countTerms(se30);

    // TrendScore por termo (versão simplificada)
    const allTerms = new Set([...m30.keys()]);
    const trendList = [];
    let totalSearch30 = 0;

    for (const t of allTerms) {
      const v7 = m7.get(t) || 0;
      const vPrev7 = mPrev7.get(t) || 0;
      const v30 = m30.get(t) || 0;
      totalSearch30 += v30;
      const growthPct = vPrev7 === 0 ? (v7 > 0 ? 100 : 0) : ((v7 - vPrev7) / vPrev7) * 100;
      const trendScore = (v7 / Math.max(v30, 1)) * (1 + growthPct / 100);
      trendList.push({ term: t, v7, v30, growthPct, trendScore });
    }

    trendList.sort((a, b) => b.trendScore - a.trendScore);

    // Adoção por categoria (oferta)
    const catMap = new Map();
    for (const a of (anuncios || [])) {
      const c = (a.categoria || 'N/D').trim();
      catMap.set(c, (catMap.get(c) || 0) + 1);
    }
    const categoryShare = Array.from(catMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Sazonalidade (últimos 12 meses)
    const monthly = new Map();
    for (const ev of (se365 || [])) {
      const d = new Date(ev.created_date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthly.set(key, (monthly.get(key) || 0) + 1);
    }
    const seasonality = Array.from(monthly.entries()).sort(([a], [b]) => (a < b ? -1 : 1)).map(([month, volume]) => ({ month, volume }));

    // Emergentes (crescimento > 25% e mínimo v7 >= 3)
    const emergent = trendList
      .filter((t) => t.growthPct > 25 && t.v7 >= 3)
      .slice(0, 20)
      .map((t) => ({ term: t.term, growthPct: Math.round(t.growthPct * 10) / 10, v7: t.v7 }));

    // 2) Preços (web + internos) via Core.InvokeLLM
    const prompt = `Você é um analista de dados do mercado de estética. Extraia e consolide preços médios no BRASIL a partir das fontes abaixo, aplicando o modelo:
Preço_estimado = (media_clinicas * 0.35) + (media_tabelas_profissionais * 0.25) + (media_marketplaces * 0.25) + (media_profissionais_do_mapa * 0.15)

REGRAS:
- Remova outliers (descartar valores fora de 1.5x IQR) e reporte a faixa baixa/média/alta.
- Retorne preços em BRL (número, não string) e cite as fontes usadas por procedimento.
- Brasil inteiro (sem granular por UF nesta versão).

Fontes (prioridade):
1) Tabela SASEC 2025 (PDF): https://sasec.org.br/wp-content/uploads/2025/04/TABELA-2025-ATUALIZADA-01.2025-VF.pdf
2) Clínicas/Guias:
   - https://cliagenda.com/clinica-de-estetica/sao-paulo/moema/
   - https://cidesp.com.br/blog/qual-o-valor-de-um-botox-no-rosto
   - https://tipoweb.com.br/estrategias/panorama-completo-mercado-estetica-brasil-2025/
3) Unidades (Botox): https://mdbf.com.br/blog/tabela-de-precos-botox
4) Marketplaces:
   - https://www.boaconsulta.com
   - https://www.getninjas.com.br

Liste ao menos: botox, preenchimento labial, bioestimulador, depilação a laser, peeling químico, limpeza de pele, laser para melasma.
Caso uma fonte não esteja acessível, use as demais.
`;

    const responseSchema = {
      type: 'object',
      properties: {
        procedures: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              category: { type: 'string' },
              area: { type: 'string' },
              price_mean_br: { type: 'number' },
              price_low_br: { type: 'number' },
              price_high_br: { type: 'number' },
              unit_price_note: { type: 'string' },
              sources: { type: 'array', items: { type: 'string' } },
            },
            required: ['name', 'price_mean_br']
          }
        }
      },
      required: ['procedures']
    };

    let pricing = { procedures: [] };
    try {
      pricing = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: responseSchema,
      });
    } catch (err) {
      // Fallback básico se web falhar
      pricing = { procedures: [] };
    }

    // 3) Índice Estético Brasileiro (IEB) — escala 0–140
    const avgTrendScore = trendList.slice(0, 50).reduce((s, t) => s + t.trendScore, 0) / Math.max(trendList.slice(0, 50).length, 1);
    const emergentCount = emergent.length;

    // Normalizações simples
    const norm = (v, min, max) => Math.max(0, Math.min(1, (v - min) / Math.max(max - min, 1))));
    const nTrend = norm(avgTrendScore, 0, 2); // TrendScore médio típico 0–2
    const nVol = norm(totalSearch30, 0, 5000); // escala amostral
    // crescimento mensal aproximado (variação entre mês corrente e anterior)
    const last2 = seasonality.slice(-2);
    const monthlyGrowth = last2.length === 2 ? (last2[1].volume - last2[0].volume) / Math.max(last2[0].volume, 1) : 0;
    const nGrowth = norm(monthlyGrowth, -0.2, 0.5);
    const nEmergent = norm(emergentCount, 0, 20);

    const IEB = Math.round((nTrend * 40 + nVol * 30 + nGrowth * 20 + nEmergent * 10) * 100) / 100; // 0–100
    // Reescala para 0–140 aproximando a tabela do usuário (0–50 fraco; 50–80 estável; 80–120 aquecido; 120+ expansão)
    const IEB_scaled = Math.round(IEB * 1.4);
    let IEB_label = 'mercado fraco';
    if (IEB_scaled >= 120) IEB_label = 'mercado em expansão';
    else if (IEB_scaled >= 80) IEB_label = 'mercado aquecido';
    else if (IEB_scaled >= 50) IEB_label = 'mercado estável';

    // Top listas
    const topProcedures = trendList.filter(t => /botox|preenchimento|bioestimulador|laser|peeling|limpeza|melasma/.test(t.term)).slice(0, 15);
    const topAreas = trendList.filter(t => /lábios|labios|olheiras|mandíbula|mandibula|pescoço|testa|nariz|couro cabeludo|abdômen|abdomen|glúteos|gluteos|mãos|maos|pálpebras|palpebras|bochechas/.test(t.term)).slice(0, 15);

    return Response.json({
      scope: 'br',
      updated_at: now.toISOString(),
      trends: {
        topProcedures,
        topAreas,
        trendList: trendList.slice(0, 200),
      },
      pricing,
      categoryShare,
      seasonality,
      emergent,
      ieb: { value: IEB_scaled, label: IEB_label },
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});