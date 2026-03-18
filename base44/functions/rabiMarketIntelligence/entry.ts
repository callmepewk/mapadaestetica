import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(()=>({}));
    const inputScope = (body?.scope || 'br');
    const inputProfession = String(body?.profession || '').toLowerCase();

    const now = new Date();
    const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);

    // 1) Coleta interna (demanda e oferta)
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
    const pricingPrompt = `Você é um analista de dados do mercado de estética. Extraia e consolide preços médios no BRASIL a partir das fontes abaixo, aplicando o modelo:
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

    const pricingSchema = {
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
        prompt: pricingPrompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: pricingSchema,
      });
    } catch (err) {
      pricing = { procedures: [] };
    }

    // Profissão do usuário (personalização)
    const userProfession = (inputProfession || user?.profissao || user?.profession || user?.area_profissional || '').toLowerCase();

    const PROF_KEYS = {
      'medico': ['botox','toxina','preench','bioestimul','laser','rejuven','peeling','melasma','cicatriz','ipl','pico','co2'],
      'dermatologista': ['botox','toxina','preench','bioestimul','laser','dermato','rejuven','melasma','cicatriz','rosácea','acne'],
      'biomédico esteta': ['bioestimul','peeling','intraderm','microagulh','toxina','preench','enzimas','rf','hifu'],
      'dentista harmonizador': ['harmonização','preench','botox','mandíbula','mento','lábios','rinomodela','masseter'],
      'enfermeiro esteta': ['peeling','intraderm','microagulh','enzimas','estética facial','protocolos'],
      'farmacêutico esteta': ['peeling','cosmeceut','intraderm','microagulh','protocolos'],
      'fisioterapeuta dermatofuncional': ['radiofrequência','ultrassom','criolipólise','drenagem','massagem','flacidez','estrias','celulite'],
      'esteticista': ['limpeza de pele','protocolo facial','peeling','massagem','drenagem','hidratação','skincare','capilar'],
      'cosmetólogo': ['cosmético','cosmeceut','peeling','skincare','hidratação','rejuvenes'],
      'terapeuta capilar': ['capilar','prp capilar','couro cabeludo','queda capilar','alopecia','crescimento capilar','led capilar'],
      'especialista em micropigmentação': ['micropigment','sobrancelha','lábios','olhos','dermógrafo','fio a fio'],
      'lash designer': ['cílios','lash lifting','extensão de cílios'],
      'designer de sobrancelhas': ['sobrancelha','brow','henna','lamination'],
      'massoterapeuta': ['massagem','relaxante','modeladora','drenagem','spa'],
      'especialista em depilação': ['depilação','laser','cera','fotodepilação'],
      'outra': []
    };

    const profKey = Object.keys(PROF_KEYS).find(k => userProfession.includes(k)) || 'outra';
    const profKeywords = PROF_KEYS[profKey];

    // 3) Google Trends (demanda) — via web context
    const trendsPrompt = `Você é um analista usando Google Trends. Capture os principais termos de estética no BRASIL (últimos 30 dias), com score relativo (0–100) e menções a áreas anatômicas quando aplicável. Inclua botox, preenchimento labial, bioestimulador, depilação a laser, peeling químico, laser para melasma e demais termos relevantes. Se não conseguir dados diretos, infira com base em relatórios confiáveis e deixe uma nota.`;

    const trendsSchema = {
      type: 'object',
      properties: {
        terms: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              term: { type: 'string' },
              rel_score: { type: 'number' },
              note: { type: 'string' }
            },
            required: ['term']
          }
        },
        note: { type: 'string' }
      },
      required: ['terms']
    };

    let googleTrends = { terms: [], note: '' };
    try {
      googleTrends = await base44.integrations.Core.InvokeLLM({
        prompt: trendsPrompt,
        add_context_from_internet: true,
        model: 'gemini_3_flash',
        response_json_schema: trendsSchema,
      });
    } catch (_e) {
      googleTrends = { terms: [], note: 'Sem dados diretos do Google Trends nesta execução.' };
    }

    // Personalização: filtrar listas por profissão
    const matchKeywords = (text) => {
      if (!profKeywords?.length) return true; // se "outra", mantém geral
      const t = (text||'').toLowerCase();
      return profKeywords.some(k => t.includes(k));
    };

    const trendListRelevant = trendList.filter(t => matchKeywords(t.term));
    const topProceduresRelevant = trendListRelevant.filter(t => /botox|preench|bioestimul|laser|peeling|limpeza|melasma|capilar|sobrancelha|cílios|massagem|drenagem|criolip|hifu|radiofrequ/.test(t.term)).slice(0, 15);
    const topAreasRelevant = trendListRelevant.filter(t => /lábios|labios|olheiras|mandíbula|mandibula|pescoço|testa|nariz|couro cabeludo|abdômen|abdomen|glúteos|gluteos|mãos|maos|pálpebras|palpebras|bochechas/.test(t.term)).slice(0, 15);

    const opportunityCloud = trendListRelevant
      .filter(t => t.v7 >= 2)
      .sort((a,b)=> (b.growthPct||0) - (a.growthPct||0))
      .slice(0, 30)
      .map(t => ({ term: t.term, growth: Math.round((t.growthPct||0)*10)/10 }));

    // 4) Índice Estético Brasileiro (IEB) — escala 0–140
    const avgTrendScore = trendList.slice(0, 50).reduce((s, t) => s + t.trendScore, 0) / Math.max(trendList.slice(0, 50).length, 1);
    const emergentCount = emergent.length;

    // Normalizações simples
    const norm = (v, min, max) => Math.max(0, Math.min(1, (v - min) / Math.max(max - min, 1)));
    const nTrend = norm(avgTrendScore, 0, 2); // TrendScore médio típico 0–2
    const nVol = norm(totalSearch30, 0, 5000); // escala amostral
    // crescimento mensal aproximado (variação entre mês corrente e anterior)
    const last2 = seasonality.slice(-2);
    const monthlyGrowth = last2.length === 2 ? (last2[1].volume - last2[0].volume) / Math.max(last2[0].volume, 1) : 0;
    const nGrowth = norm(monthlyGrowth, -0.2, 0.5);
    const nEmergent = norm(emergentCount, 0, 20);

    const IEB = Math.round((nTrend * 40 + nVol * 30 + nGrowth * 20 + nEmergent * 10) * 100) / 100; // 0–100
    const IEB_scaled = Math.round(IEB * 1.4); // reescala 0–140
    let IEB_label = 'mercado fraco';
    if (IEB_scaled >= 120) IEB_label = 'mercado em expansão';
    else if (IEB_scaled >= 80) IEB_label = 'mercado aquecido';
    else if (IEB_scaled >= 50) IEB_label = 'mercado estável';

    // Top listas
    const topProcedures = trendList.filter(t => /botox|preenchimento|bioestimulador|laser|peeling|limpeza|melasma/.test(t.term)).slice(0, 15);
    const topAreas = trendList.filter(t => /lábios|labios|olheiras|mandíbula|mandibula|pescoço|testa|nariz|couro cabeludo|abdômen|abdomen|glúteos|gluteos|mãos|maos|pálpebras|palpebras|bochechas/.test(t.term)).slice(0, 15);

    // 5) Google Analytics (opcional) — Top serviços por conversão
    let gaTop = [];
    try {
      const { accessToken, connectionConfig } = await base44.asServiceRole.connectors.getConnection('google_analytics');
      const propertyId = connectionConfig?.property_id || connectionConfig?.propertyId || Deno.env.get('GA_PROPERTY_ID');
      if (accessToken && propertyId) {
        const body = {
          dateRanges: [{ startDate: new Date(now.getTime()-30*86400000).toISOString().slice(0,10), endDate: now.toISOString().slice(0,10) }],
          dimensions: [{ name: 'pageTitle' }],
          metrics: [{ name: 'conversions' }],
          limit: 25
        };
        const resp = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (resp.ok) {
          const data = await resp.json();
          gaTop = (data?.rows||[]).map(r => ({ name: r?.dimensionValues?.[0]?.value || 'Página', value: Number(r?.metricValues?.[0]?.value || '0') }))
            .filter(it => matchKeywords(it.name))
            .slice(0, 15);
        }
      }
    } catch (_) { /* silencioso */ }

    // Preços relevantes por profissão
    const pricingRelevant = {
      procedures: (pricing?.procedures||[]).filter(p => matchKeywords(`${p.name} ${p.category||''} ${p.area||''}`)).slice(0, 20)
    };

    // Market share relevante
    const categoryShareRelevant = categoryShare.filter(c => matchKeywords(c.name)).slice(0, 20);

    // Interesse regional (top cidades/estados)
    const cityMap = new Map();
    const stateMap = new Map();
    for (const ev of (searchEvents||[])) {
      if (ev.cidade) cityMap.set(ev.cidade, (cityMap.get(ev.cidade)||0)+1);
      if (ev.estado) stateMap.set(ev.estado, (stateMap.get(ev.estado)||0)+1);
    }
    const regionInterest = {
      cities: Array.from(cityMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([name,count])=>({name,count})),
      states: Array.from(stateMap.entries()).sort((a,b)=>b[1]-a[1]).slice(0,15).map(([name,count])=>({name,count})),
    };

    return Response.json({
      scope: inputScope,
      updated_at: now.toISOString(),
      profession: profKey,
      trends: {
        topProcedures: topProceduresRelevant,
        topAreas: topAreasRelevant,
        trendList: trendListRelevant.slice(0, 200),
      },
      googleTrends,
      pricing: pricingRelevant,
      categoryShare: categoryShareRelevant,
      seasonality,
      emergent,
      ieb: { value: IEB_scaled, label: IEB_label },
      opportunityCloud,
      regionInterest,
      ga: { topConversions: gaTop }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});