import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function useAggregates() {
  const { data: planners = [] } = useQuery({ queryKey: ['agg-planners'], queryFn: async ()=> await base44.entities.WellnessPlanner.list('-created_date', 1000), initialData: [] });
  const { data: eventosBusca = [] } = useQuery({ queryKey: ['agg-search'], queryFn: async ()=> await base44.entities.SearchEvent.list('-created_date', 1000), initialData: [] });
  const { data: anuncios = [] } = useQuery({ queryKey: ['agg-anuncios'], queryFn: async ()=> await base44.entities.Anuncio.filter({ status: 'ativo' }, '-created_date', 500), initialData: [] });

  const topProcedures = (()=>{
    const m = new Map();
    planners.forEach(w=> (w.procedures||[]).forEach(p=> m.set(p.nome, (m.get(p.nome)||0)+1)));
    const arr = [...m.entries()].sort((a,b)=> b[1]-a[1]).slice(0,5);
    return arr;
  })();

  const avgBudget = (()=>{
    const buckets = {};
    planners.forEach(w=> (w.procedures||[]).forEach(p=>{
      const key = p.nome;
      const val = p.valor_custom || (p.faixa==='ate300'? 300 : p.faixa==='300-600'? 450 : p.faixa==='600-1000'? 800 : p.faixa==='1000+'? 1200 : null);
      if (!val) return;
      buckets[key] = buckets[key] || []; buckets[key].push(val);
    }));
    const out = Object.entries(buckets).map(([k, vals])=>[k, Math.round(vals.reduce((a,b)=>a+b,0)/vals.length)]).sort((a,b)=> b[1]-a[1]).slice(0,5);
    return out;
  })();

  const regionDemand = (()=>{
    const m = new Map();
    eventosBusca.forEach(e=>{ const c = (e.cidade||'').trim(); if (c) m.set(c, (m.get(c)||0)+1); });
    return [...m.entries()].sort((a,b)=> b[1]-a[1]).slice(0,6);
  })();

  const topProfCats = (()=>{
    const m = new Map();
    anuncios.forEach(a=>{ const p=(a.profissao||'').trim(); if (p) m.set(p, (m.get(p)||0)+1); });
    return [...m.entries()].sort((a,b)=> b[1]-a[1]).slice(0,5);
  })();

  const demandTrend = (()=>{
    const m = new Map();
    eventosBusca.forEach(e=>{ const d=(e.created_date||'').slice(0,7); if (d) m.set(d, (m.get(d)||0)+1); });
    return [...m.entries()].sort((a,b)=> a[0].localeCompare(b[0]));
  })();

  return { topProcedures, avgBudget, regionDemand, topProfCats, demandTrend };
}

export default function DashboardPatrocinadorHome() {
  const { topProcedures, avgBudget, regionDemand, topProfCats, demandTrend } = useAggregates();
  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Dashboard de Análise de Mercado</h2>
          <p className="text-sm text-gray-600">Visão agregada da plataforma (sem dados individuais)</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card><CardHeader><CardTitle className="text-sm">Mais buscados</CardTitle></CardHeader><CardContent className="space-y-1">{topProcedures.map(([n,v])=> <div key={n} className="flex items-center justify-between text-sm"><span>{n}</span><Badge className="bg-gray-100 text-gray-800">{v}</Badge></div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Média de preço (R$)</CardTitle></CardHeader><CardContent className="space-y-1">{avgBudget.map(([n,v])=> <div key={n} className="flex items-center justify-between text-sm"><span>{n}</span><span className="font-semibold">{v.toLocaleString('pt-BR')}</span></div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Regiões com demanda</CardTitle></CardHeader><CardContent className="space-y-1">{regionDemand.map(([c,v])=> <div key={c} className="flex items-center justify-between text-sm"><span>{c}</span><Badge className="bg-blue-100 text-blue-800">{v}</Badge></div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Profissionais mais procurados</CardTitle></CardHeader><CardContent className="space-y-1">{topProfCats.map(([p,v])=> <div key={p} className="flex items-center justify-between text-sm"><span>{p}</span><Badge className="bg-purple-100 text-purple-800">{v}</Badge></div>)}</CardContent></Card>
        </div>
        <div className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Evolução de Demanda (mensal)</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 text-xs text-gray-700">
                {demandTrend.map(([m,v])=> (
                  <div key={m} className="p-2 rounded border bg-gray-50 flex items-center justify-between"><span>{m}</span><span className="font-semibold">{v}</span></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}