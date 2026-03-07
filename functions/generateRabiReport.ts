import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Helper: plan tier and limits
    const planRaw = (user.plano || user.plano_assinatura || user.assinatura_plano || '').toLowerCase();
    const planTier = ['prime','premium','platina','diamante'].includes(planRaw)
      ? 'prime'
      : (['pro','ouro'].includes(planRaw) ? 'pro' : 'free');
    const limit = planTier === 'free' ? 3 : planTier === 'pro' ? 5 : 12;

    // Time windows
    const now = new Date();
    const days = 90;
    const ms = 24 * 60 * 60 * 1000;
    const startNow = new Date(now.getTime() - days * ms);
    const prevStart = new Date(now.getTime() - 2 * days * ms);
    const prevEnd = new Date(now.getTime() - days * ms);

    // Fetch data (best-effort sizes)
    const [anuncios, searchEvents, agendamentos] = await Promise.all([
      base44.entities.Anuncio.filter({ status: 'ativo' }, '-created_date', 1000),
      base44.entities.SearchEvent.list('-created_date', 3000),
      base44.entities.Agendamento ? base44.entities.Agendamento.list('-created_date', 1000) : Promise.resolve([])
    ]);

    // Utility counters
    const countBy = (arr, keyFn) => {
      const m = new Map();
      for (const item of arr) {
        const k = keyFn(item);
        if (!k) continue;
        m.set(k, (m.get(k) || 0) + 1);
      }
      return m;
    };
    const topFromMap = (m) => Array.from(m.entries()).sort((a,b)=>b[1]-a[1]);

    // Filter by time windows
    const inRange = (d, a, b) => { try { const t = new Date(d).getTime(); return t >= a.getTime() && t <= b.getTime(); } catch { return false; } };

    const seCurrent = (searchEvents || []).filter(ev => inRange(ev.created_date || ev.updated_date || ev.createdAt, startNow, now));
    const sePrev = (searchEvents || []).filter(ev => inRange(ev.created_date || ev.updated_date || ev.createdAt, prevStart, prevEnd));

    // Current search queries (normalized)
    const normQ = (q) => (q || '').toString().trim().toLowerCase();
    const mapCurrentQ = countBy(seCurrent, (e) => normQ(e.query));
    const mapPrevQ = countBy(sePrev, (e) => normQ(e.query));

    // Emerging terms: growth from previous window
    const emerging = [];
    for (const [term, cur] of mapCurrentQ.entries()) {
      const prev = mapPrevQ.get(term) || 0;
      const growth = cur - prev;
      const ratio = prev === 0 ? (cur > 0 ? Infinity : 0) : cur / prev;
      if (cur >= 3 && growth > 0) {
        emerging.push({ term, cur, prev, growth, ratio });
      }
    }
    emerging.sort((a,b)=> (b.ratio === Infinity ? Number.MAX_SAFE_INTEGER : b.ratio) - (a.ratio === Infinity ? Number.MAX_SAFE_INTEGER : a.ratio));

    // Regions: by estado and cidade from anúncios ativos
    const byEstado = countBy(anuncios || [], (a) => (a.estado || '').toString().toUpperCase());
    const byCidade = countBy(anuncios || [], (a) => (a.cidade || '').toString());

    // Categories offered
    const byCategoria = countBy(anuncios || [], (a) => (a.categoria || 'N/D'));

    // Offered procedures/services (flatten)
    const procs = [];
    for (const a of anuncios || []) {
      for (const p of (a.procedimentos_servicos || [])) {
        if (p) procs.push((p || '').toString().toLowerCase());
      }
    }
    const byProc = countBy(procs.map((p)=>({p})), (o) => o.p);

    // Agendamentos (demand) by month and city
    const agInRange = (agendamentos || []).filter(a => inRange(a.data_hora || a.created_date || a.updated_date, startNow, now));
    const byCidadeAg = countBy(agInRange, (a) => (a.cidade || '').toString());

    // Prepare context for LLM
    const context = {
      timeframe_days: days,
      top_queries: topFromMap(mapCurrentQ).slice(0, 50),
      top_categories: topFromMap(byCategoria).slice(0, 50),
      top_cities_by_ads: topFromMap(byCidade).slice(0, 50),
      top_states_by_ads: topFromMap(byEstado).slice(0, 50),
      top_procedures_offered: topFromMap(byProc).slice(0, 50),
      top_cities_by_appointments: topFromMap(byCidadeAg).slice(0, 50),
      emerging_terms: emerging.slice(0, 50).map(e => ({ term: e.term, cur: e.cur, prev: e.prev, growth: e.growth, ratio: e.ratio }))
    };

    // Ask LLM to produce a structured report
    let ai;
    try {
      ai = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um analista de mercado da estética. Gere um relatório RABI (Radar de Análise de Beleza Inteligente) em PT-BR, conciso e prático, baseado ESTRITAMENTE nos dados a seguir (JSON):\n\n${JSON.stringify(context)}\n\nEstruture em seções curtas com bullet points. Foque em:\n- Procedimentos em crescimento (emerging_terms)\n- Tendências regionais (top_states_by_ads, top_cities_by_ads, top_cities_by_appointments)\n- Procedimentos mais buscados (top_queries) e mais ofertados (top_procedures_offered)\n- Mudanças de comportamento (compare crescimento entre períodos a partir de emerging_terms).\nNão invente dados externos. Não cite o JSON, apenas interprete.\nAdapte a profundidade ao plano do usuário (free=3 itens/ seção; pro=5; prime=12).`,
        add_context_from_internet: false,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: { type: 'string' },
            sections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  items: { type: 'array', items: { type: 'string' } }
                },
                required: ['title', 'items']
              }
            }
          },
          required: ['summary', 'sections']
        }
      });
    } catch (_) {
      ai = null;
    }

    // Fallback simple sections if AI fails
    const fallbackSections = [
      { title: 'Procedimentos em crescimento', items: emerging.slice(0, limit).map(e => `${e.term} (+${e.growth}, agora ${e.cur})`) },
      { title: 'Tendências regionais — Estados', items: topFromMap(byEstado).slice(0, limit).map(([uf,c]) => `${uf}: ${c} anúncios`) },
      { title: 'Mais buscados (30 dias)', items: topFromMap(mapCurrentQ).slice(0, limit).map(([q,c]) => `${q} (${c})`) },
    ];

    const rawSections = ai?.sections?.length ? ai.sections : fallbackSections;

    // Enforce per-plan limits on each section length
    const limitedSections = (rawSections || []).map((s) => ({
      title: String(s.title || '').replace('R.A.B.I', 'RABI'),
      items: Array.isArray(s.items) ? s.items.slice(0, limit) : []
    }));

    const payload = {
      summary: (ai?.summary || 'Relatório gerado com base nos dados internos da plataforma.').replace('R.A.B.I', 'RABI'),
      sections: limitedSections
    };

    return Response.json(payload, { status: 200 });
  } catch (err) {
    return Response.json({ error: err?.message || 'Internal Error' }, { status: 500 });
  }
});