import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, DollarSign, Search } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

function groupCount(list, keyFn) {
  const map = new Map();
  list.forEach((i) => {
    const k = keyFn(i);
    if (!k) return;
    map.set(k, (map.get(k) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([k, v]) => ({ key: k, count: v }))
    .sort((a, b) => b.count - a.count);
}

export default function ProgramasInsights() {
  const [user, setUser] = React.useState(null);
  React.useEffect(()=>{ (async()=>{ try { setUser(await base44.auth.me()); } catch {} })(); },[]);
  const plan = user?.plano_ativo || 'free';

  const { data: programas = [] } = useQuery({
    queryKey: ["programas-12m-radar"],
    queryFn: async () => await base44.entities.Produto.filter({ programa_12_meses: true, status: "ativo" }),
    initialData: [],
    staleTime: 300000,
  });

  const { data: atendimentos = [] } = useQuery({
    queryKey: ["atendimentos-ultimos"],
    queryFn: async () => await base44.entities.AtendimentoPontos.filter({ status: "concluido" }, "-created_date", 500),
    initialData: [],
    staleTime: 300000,
  });

  const { data: buscas = [] } = useQuery({
    queryKey: ["buscas-recentes"],
    queryFn: async () => await base44.entities.SearchEvent.filter({}, "-created_date", 500),
    initialData: [],
    staleTime: 300000,
  });

  // Ticket médio por sessão
  const ticketMedioSessao = (() => {
    const valores = atendimentos.map((a) => Number(a.valor_equivalente)).filter((v) => v > 0);
    if (valores.length > 0) return (valores.reduce((s, v) => s + v, 0) / valores.length);
    // fallback: preço do programa / 12
    const estimados = programas.map((p) => (Number(p.preco_promocional || p.preco || 0) / 12)).filter((v) => v > 0);
    if (estimados.length > 0) return (estimados.reduce((s, v) => s + v, 0) / estimados.length);
    return null;
  })();

  // Marcas em alta/baixa a partir de programas e produtos ativos
  const { data: produtosAtivos = [] } = useQuery({
    queryKey: ["produtos-ativos-marca"],
    queryFn: async () => await base44.entities.Produto.filter({ status: "ativo" }, "-created_date", 1000),
    initialData: [],
    staleTime: 300000,
  });

  const marcasOrdenadas = groupCount(produtosAtivos, (p) => (p.marca || "").trim()).filter((m) => m.key && m.key.length > 0);
  const limit = plan === 'free' ? 3 : 5;
  const marcasAlta = marcasOrdenadas.slice(0, limit);
  const marcasBaixa = marcasOrdenadas.slice(-limit).reverse();

  // Tratamentos mais procurados a partir de buscas
  const topBuscas = groupCount(buscas, (b) => (b.query || "").toLowerCase()).slice(0, limit);

  // Custo por sessão médio nacional (com base em atendimentos)
  const custoNacional = ticketMedioSessao;
  // Internacional: sem fonte confiável no momento
  const custoInternacional = null;

  // Assinaturas para tempo real
  const queryClient = useQueryClient();
  React.useEffect(() => {
    const unsubs = [
      base44.entities.Produto.subscribe(()=> queryClient.invalidateQueries()),
      base44.entities.AtendimentoPontos.subscribe(()=> queryClient.invalidateQueries()),
      base44.entities.SearchEvent.subscribe(()=> queryClient.invalidateQueries())
    ];
    return () => unsubs.forEach(u=> { try { u(); } catch {} });
  }, [queryClient]);

  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
      <Card className="border-2 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-emerald-700">
            <DollarSign className="w-5 h-5" /> Ticket médio por sessão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{ticketMedioSessao ? `R$ ${ticketMedioSessao.toFixed(2)}` : "—"}</p>
          <p className="text-xs text-gray-500 mt-1">Baseado em atendimentos concluídos e/ou estimativa (programa/12)</p>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Activity className="w-5 h-5" /> Custo por sessão (Nacional x Internacional)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Nacional</p>
            <p className="text-2xl font-bold">{custoNacional ? `R$ ${custoNacional.toFixed(2)}` : "—"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Internacional</p>
            <p className="text-2xl font-bold">{custoInternacional ? `US$ ${custoInternacional.toFixed(2)}` : "—"}</p>
            <p className="text-[10px] text-gray-400 mt-1">Sem fonte conectada</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <TrendingUp className="w-5 h-5" /> Marcas em alta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {marcasAlta.length === 0 && <p className="text-sm text-gray-500">—</p>}
          {marcasAlta.map((m) => (
            <div key={m.key} className="flex items-center justify-between text-sm">
              <span>{m.key}</span>
              <Badge className="bg-indigo-100 text-indigo-800">{m.count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2 border-rose-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-rose-700">
            <TrendingDown className="w-5 h-5" /> Marcas em baixa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {marcasBaixa.length === 0 && <p className="text-sm text-gray-500">—</p>}
          {marcasBaixa.map((m) => (
            <div key={m.key} className="flex items-center justify-between text-sm">
              <span>{m.key}</span>
              <Badge className="bg-rose-100 text-rose-800">{m.count}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-2 border-amber-200 xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700">
            <Search className="w-5 h-5" /> Tratamentos mais procurados (buscas)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topBuscas.length === 0 && <p className="text-sm text-gray-500">—</p>}
          {topBuscas.map((b, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="truncate">{b.key}</span>
              <Badge className="bg-amber-100 text-amber-800">{b.count}</Badge>
            </div>
          ))}
          {plan === 'free' && (
            <p className="text-[11px] text-amber-600 mt-2">Plano Free: exibindo amostra. Faça upgrade para ver tudo.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}