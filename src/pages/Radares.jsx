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
import { Button } from "@/components/ui/button";
import RabiExpandableCard from "../components/rabi/RabiExpandableCard";
import RabiReportModal from "../components/rabi/RabiReportModal";
import { useQueryClient } from "@tanstack/react-query";

export default function Radares() {
  const [user, setUser] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
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

        <div className="mt-4 flex flex-wrap gap-3">
          <Button className="bg-[#2C2C2C] text-[#F7D426] border-2 border-[#2C2C2C]" onClick={() => setReportOpen(true)}>
            Gerar Relatório (PDF / E-mail)
          </Button>
        </div>
        <RabiSection title="R.A.B.I — Tendências" subtitle="Leitura antecipada do mercado, movimentos emergentes e apoio à inovação estratégica.">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <RabiExpandableCard title="Movimentos Emergentes" teaser="Sinais fracos ganhando tração.">
              Leitura parcial dos termos e técnicas em ascensão na plataforma. Profissionais com posicionamento antecipado tendem a capturar mais demanda.
            </RabiExpandableCard>
            <RabiExpandableCard title="Adoção por Especialidade" teaser="Distribuição entre perfis profissionais.">
              Cruzamento por profissão e categoria macro para identificar onde a adoção acelera primeiro.
            </RabiExpandableCard>
            <RabiExpandableCard title="Sazonalidade" teaser="Flutuações previsíveis ao longo do ano.">
              Picos e vales esperados. Útil para planejamento de oferta e comunicação.
            </RabiExpandableCard>
          </div>
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
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <RabiExpandableCard title="Recorrência por Categoria" teaser="Ritmo de busca/engajamento por tema.">
              Identifica onde a atenção se mantém no tempo e onde sofre quedas abruptas — um sinal para ajuste de oferta.
            </RabiExpandableCard>
            <RabiExpandableCard title="Ciclo de Retorno do Usuário" teaser="Janela média de reengajamento.">
              Estimativa da janela de retorno entre interações. Útil para cadência de comunicação e promoções.
            </RabiExpandableCard>
            <RabiExpandableCard title="Probabilidade de Conversão" teaser="Sinais que antecedem o agendamento.">
              Leitura combinada de padrões que antecedem eventos de conversão — sem detalhar o algoritmo.
            </RabiExpandableCard>
          </div>
          {user ? (
            <RealtimeStats user={user} subtitle="Leituras contínuas das interações — visão pessoal" />
          ) : (
            <p className="text-sm text-gray-600">Entre para visualizar leituras preditivas da sua frequência.</p>
          )}
        </RabiSection>
        <RabiConsultoriaCTA />
      <RabiReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        userEmail={user?.email}
        summary={"Leitura estratégica (parcial): tendências emergentes por categoria, sazonalidade esperada, padrões de recorrência e sinais de conversão baseados no uso da plataforma. Para diagnóstico completo, solicite nossa consultoria especializada."}
      />
      </div>
      </div>
      );
}