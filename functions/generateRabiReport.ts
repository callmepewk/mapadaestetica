import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Coleta de dados principais
    const [anuncios, searchEvents, produtos, agendamentos] = await Promise.all([
      base44.entities.Anuncio.filter({ status: 'ativo' }, '-created_date', 1000),
      base44.entities.SearchEvent.list('-created_date', 2000),
      base44.entities.Produto.filter({ status: 'ativo' }, '-created_date', 1000),
      base44.entities.Agendamento.list('-created_date', 1000)
    ]);

    // Agregações simples
    const countBy = (arr, key) => {
      const m = {};
      for (const it of arr) {
        const k = (it?.[key] || 'N/D').toString();
        m[k] = (m[k] || 0) + 1;
      }
      return Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${k}: ${v}`);
    };

    // Tendências por termos de busca (últimos 60 dias)
    const now = new Date();
    const past60 = new Date(now.getTime() - 60*24*60*60*1000);
    const qMap = {};
    (searchEvents||[]).forEach(ev => {
      const d = ev.created_date ? new Date(ev.created_date) : now;
      if (d < past60) return;
      const q = (ev.query || '').trim().toLowerCase();
      if (!q) return;
      qMap[q] = (qMap[q] || 0) + 1;
    });
    const trendingTerms = Object.entries(qMap).sort((a,b)=>b[1]-a[1]).slice(0, 15).map(([q,c])=>`${q} (${c})`);

    const byCategoria = countBy(anuncios, 'categoria');
    const byCidade = countBy(anuncios, 'cidade');

    // Radar nacional (MVP): cidades líderes e crescimento (heurística simples)
    const monthKey = (d) => `${d.getUTCFullYear()}-${(d.getUTCMonth()+1).toString().padStart(2,'0')}`;
    const monthlyCity = {};
    (anuncios||[]).forEach(a => {
      const d = a.created_date ? new Date(a.created_date) : now;
      const mk = monthKey(d);
      const city = a.cidade || 'N/D';
      monthlyCity[mk] = monthlyCity[mk] || {};
      monthlyCity[mk][city] = (monthlyCity[mk][city] || 0) + 1;
    });
    const months = Object.keys(monthlyCity).sort();
    const growth = {};
    for (let i=1;i<months.length;i++){
      const prev = monthlyCity[months[i-1]];
      const cur = monthlyCity[months[i]];
      const cities = new Set([...Object.keys(prev||{}), ...Object.keys(cur||{})]);
      for (const c of cities){
        const g = (cur?.[c]||0) - (prev?.[c]||0);
        growth[c] = (growth[c] || 0) + g;
      }
    }
    const growthRanking = Object.entries(growth).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([c,g])=>`${c}: ${g>=0?'+':''}${g}`);

    // Relatório por plano
    const plan = (user?.plano || user?.plano_assinatura || user?.assinatura_plano || '').toLowerCase();
    const tier = ['premium','prime','platina','diamante'].some(p=>plan.includes(p)) ? 'premium' : (['pro','ouro'].some(p=>plan.includes(p)) ? 'pro' : 'free');

    const limit = tier==='premium'? 15 : tier==='pro'? 8 : 4;

    const sections = [
      { title: 'Tendências — Termos em Alta (60 dias)', items: trendingTerms.slice(0, limit) },
      { title: 'Oferta por Categoria', items: byCategoria.slice(0, limit) },
      { title: 'Oferta por Cidade', items: byCidade.slice(0, limit) },
      { title: 'Cidades com Maior Crescimento (heurística)', items: growthRanking.slice(0, limit) },
    ];

    const summary = `RABI: termos em alta — ${trendingTerms.slice(0,3).map(s=>s.split(' (')[0]).join(', ')}. Categorias líderes: ${byCategoria.slice(0,3).map(s=>s.split(':')[0]).join(', ')}. Cidades em ascensão: ${growthRanking.slice(0,3).map(s=>s.split(':')[0]).join(', ')}.`;

    return Response.json({ summary, sections });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});