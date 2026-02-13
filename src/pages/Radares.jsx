import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import RadarSection from "../components/analytics/RadarSection";
import HomeRealtimeStats from "../components/analytics/HomeRealtimeStats";
import ProgramasInsights from "../components/analytics/ProgramasInsights";
import RabiHero from "../components/rabi/RabiHero";
import RabiMicrocopyStrip from "../components/rabi/RabiMicrocopyStrip";
import RabiExplainer from "../components/rabi/RabiExplainer";
import RabiSection from "../components/rabi/RabiSection";
import RabiConsultoriaCTA from "../components/rabi/RabiConsultoriaCTA";


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
        <RabiHero />
        <RabiMicrocopyStrip />
        <RabiExplainer />
        <RabiSection title="R.A.B.I — Tendências" subtitle="Leitura antecipada do mercado, movimentos emergentes e apoio à inovação estratégica.">
          <RadarSection />
        </RabiSection>
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">R.A.B.I — Panorama em Tempo Real</h2>
          <HomeRealtimeStats />
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Data Science • Programas (12 meses)</h2>
          <ProgramasInsights />
        </section>
        <RabiSection title="R.A.B.I — Frequência (IA)" subtitle="Análise de recorrência, padrões comportamentais e inteligência preditiva.">
          {user ? (
            <RealtimeStats user={user} subtitle="Leituras contínuas das interações — visão pessoal" />
          ) : (
            <p className="text-sm text-gray-600">Entre para visualizar leituras preditivas da sua frequência.</p>
          )}
        </RabiSection>
        <RabiConsultoriaCTA />
      </div>
    </div>
  );
}