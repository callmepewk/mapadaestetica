import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import RadarSection from "../components/analytics/RadarSection";
import HomeRealtimeStats from "../components/analytics/HomeRealtimeStats";
import ProgramasInsights from "../components/analytics/ProgramasInsights";
import RealtimeStats from "../components/pro/RealtimeStats";
import { useQueryClient } from "@tanstack/react-query";

export default function Radares() {
  const [user, setUser] = useState(null);
  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} })(); }, []);
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsubs = [
      base44.entities.Produto.subscribe(()=> queryClient.invalidateQueries()),
      base44.entities.AtendimentoPontos.subscribe(()=> queryClient.invalidateQueries()),
      base44.entities.SearchEvent.subscribe(()=> queryClient.invalidateQueries())
    ];
    return () => unsubs.forEach(u=>{ try { u(); } catch {} });
  }, [queryClient]);
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Radares</h1>
          <p className="text-gray-600">Veja as tendências do mercado e relatórios dos seus anúncios em tempo real.</p>
        </div>
        <RadarSection />
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Estatísticas em tempo real da plataforma</h2>
          <HomeRealtimeStats />
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Data Science • Programas (12 meses)</h2>
          <ProgramasInsights />
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Suas métricas em tempo real</h2>
          {user ? (
            <RealtimeStats user={user} subtitle="Acompanhe visualizações, cliques e eventos ao vivo" />
          ) : (
            <p className="text-sm text-gray-600">Entre para ver suas métricas pessoais em tempo real.</p>
          )}
        </section>
      </div>
    </div>
  );
}