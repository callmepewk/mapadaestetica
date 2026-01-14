import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { TrendingUp, Eye, Heart, MousePointerClick, Megaphone } from "lucide-react";

export default function RealtimeStats({ user }) {
  const queryClient = useQueryClient();
  const email = user?.email || "";

  const { data: anuncios = [], refetch: refetchAnuncios } = useQuery({
    queryKey: ["anuncios-prof", email],
    enabled: !!email,
    queryFn: async () => {
      if (!email) return [];
      return await base44.entities.Anuncio.filter({ created_by: email });
    },
    staleTime: 60_000,
  });

  const { data: banners = [], refetch: refetchBanners } = useQuery({
    queryKey: ["banners-prof", email],
    enabled: !!email,
    queryFn: async () => {
      if (!email) return [];
      return await base44.entities.Banner.filter({ created_by: email });
    },
    staleTime: 60_000,
  });

  const [eventFeed, setEventFeed] = React.useState([]);

  React.useEffect(() => {
    if (!email) return;
    const unsubAnuncio = base44.entities.Anuncio.subscribe((event) => {
      if (event?.data?.created_by === email) {
        setEventFeed((prev) => [{
          ts: new Date().toISOString(),
          kind: `Anúncio ${event.type}`,
          title: event?.data?.titulo || "(sem título)"
        }, ...prev].slice(0, 12));
        queryClient.invalidateQueries({ queryKey: ["anuncios-prof", email] });
      }
    });
    const unsubBanner = base44.entities.Banner.subscribe((event) => {
      if (event?.data?.created_by === email) {
        setEventFeed((prev) => [{
          ts: new Date().toISOString(),
          kind: `Campanha ${event.type}`,
          title: event?.data?.titulo || event?.data?.nome_empresa || "(campanha)"
        }, ...prev].slice(0, 12));
        queryClient.invalidateQueries({ queryKey: ["banners-prof", email] });
      }
    });
    return () => { unsubAnuncio(); unsubBanner(); };
  }, [email, queryClient]);

  const totals = React.useMemo(() => {
    const anunciosAtivos = anuncios.filter(a => a.status === "ativo" || a.status === "em_destaque");
    const views = anuncios.reduce((s, a) => s + (Number(a.visualizacoes) || 0), 0);
    const likes = anuncios.reduce((s, a) => s + (Number(a.curtidas) || 0), 0);
    const bannersViews = banners.reduce((s, b) => s + (Number(b.metricas?.visualizacoes) || 0), 0);
    const bannersClicks = banners.reduce((s, b) => s + (Number(b.metricas?.cliques) || 0), 0);
    return { anunciosAtivos: anunciosAtivos.length, views, likes, bannersViews, bannersClicks };
  }, [anuncios, banners]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4"/>Anúncios Ativos</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totals.anunciosAtivos}</p></CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="w-4 h-4"/>Visualizações</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totals.views}</p></CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Heart className="w-4 h-4"/>Curtidas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totals.likes}</p></CardContent>
        </Card>
        <Card className="border-2">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Megaphone className="w-4 h-4"/>Campanha (views/cliques)</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totals.bannersViews} <span className="text-sm text-gray-500">/ {totals.bannersClicks}</span></p></CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-sm">O que está acontecendo agora</CardTitle>
        </CardHeader>
        <CardContent>
          {eventFeed.length === 0 ? (
            <p className="text-sm text-gray-500">Sem eventos recentes. Interações aparecerão aqui em tempo real.</p>
          ) : (
            <div className="space-y-2">
              {eventFeed.map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{e.kind}</Badge>
                    <span className="truncate max-w-[240px] md:max-w-[420px]">{e.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">{new Date(e.ts).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}