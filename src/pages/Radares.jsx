import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import RadarSection from "../components/analytics/RadarSection";

import RabiHero from "../components/rabi/RabiHero";
import RabiMicrocopyStrip from "../components/rabi/RabiMicrocopyStrip";
import RabiExplainer from "../components/rabi/RabiExplainer";
import RabiTutorial from "../components/rabi/RabiTutorial";
import RabiSection from "../components/rabi/RabiSection";
import RabiConsultoriaCTA from "../components/rabi/RabiConsultoriaCTA";



import { Button } from "@/components/ui/button";
import RabiExpandableCard from "../components/rabi/RabiExpandableCard";
import RabiReportModal from "../components/rabi/RabiReportModal";
import RabiGAUploader from "../components/rabi/RabiGAUploader";
import RabiTrendsChart from "../components/rabi/RabiTrendsChart";

import { useQueryClient } from "@tanstack/react-query";

export default function Radares() {
  const [user, setUser] = useState(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSections, setReportSections] = useState([]);
  const [reportSummary, setReportSummary] = useState('');
  const [gaTrends, setGaTrends] = useState({ gaMetrics: [], trendsSeries: [] });
  const [alertsOn, setAlertsOn] = useState(false);
  const [schedule, setSchedule] = useState('mensal');


  const [rabiOn, setRabiOn] = useState(false);
  const [planTier, setPlanTier] = useState('free');
  useEffect(() => { (async () => { try { const u = await base44.auth.me(); setUser(u); setRabiOn(!!u?.rabi_ativado); setPlanTier(getPlanTierFromUser(u)); } catch {} })(); }, []);
  const queryClient = useQueryClient();
  useEffect(() => {
    const unsubs = [
      base44.entities.Produto.subscribe(()=> queryClient.invalidateQueries()),
      base44.entities.AtendimentoPontos.subscribe(()=> queryClient.invalidateQueries()),
      base44.entities.SearchEvent.subscribe(()=> queryClient.invalidateQueries())
    ];
    return () => unsubs.forEach(u=>{ try { u(); } catch {} });
  }, [queryClient]);

  const getPlanTierFromUser = (u) => {
    const p = (u?.plano || u?.plano_assinatura || u?.assinatura_plano || '').toLowerCase();
    if (['prime','premium','platina','diamante'].includes(p)) return 'prime';
    if (['pro','ouro'].includes(p)) return 'pro';
    return 'free';
  };

  const handleGenerateReport = async () => {
    setReportOpen(true);
    setReportLoading(true);
    try {
      const [anunciosAll, searchEvents] = await Promise.all([
        base44.entities.Anuncio.filter({ status: 'ativo' }, '-created_date', 500),
        base44.entities.SearchEvent.list('-created_date', 500)
      ]);

      const now = new Date();
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const se30 = (searchEvents || []).filter(ev => ev.created_date ? new Date(ev.created_date) >= past30 : true);

      const qMap = {};
      se30.forEach(ev => {
        const q = (ev.query || '').trim().toLowerCase();
        if (!q) return;
        qMap[q] = (qMap[q] || 0) + 1;
      });
      const trending = Object.entries(qMap).sort((a,b)=>b[1]-a[1]).map(([q,c])=>`${q} (${c})`);

      const catMap = {};
      (anunciosAll || []).forEach(a => {
        const c = a.categoria || 'N/D';
        catMap[c] = (catMap[c] || 0) + 1;
      });
      const cats = Object.entries(catMap).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`${c}: ${n}`);

      const cityMap = {};
      (anunciosAll || []).forEach(a => {
        const city = a.cidade || 'N/D';
        cityMap[city] = (cityMap[city] || 0) + 1;
      });
      const cities = Object.entries(cityMap).sort((a,b)=>b[1]-a[1]).map(([c,n])=>`${c}: ${n}`);

      const plan = getPlanTierFromUser(user);
      const limit = plan === 'free' ? 3 : plan === 'pro' ? 5 : 10;

      const sections = [
        { title: 'Tendências — Consultas (30 dias)', items: trending.slice(0, limit) },
        { title: 'Adoção por Categoria', items: cats.slice(0, limit) },
        { title: 'Cidades com Maior Oferta', items: cities.slice(0, limit) }
      ];

      setReportSections(sections);
      setReportSummary(`Resumo RABI: ${trending.slice(0,3).map(s=>s.split(' (')[0]).join(', ')}; categorias líderes: ${cats.slice(0,3).map(s=>s.split(':')[0]).join(', ')}.`);
    } catch (e) {
      setReportSections([]);
      setReportSummary('Não foi possível gerar o relatório agora. Tente novamente em instantes.');
    } finally {
      setReportLoading(false);
    }
  };





  const handleExternalData = (res) => {
    setGaTrends(res || { gaMetrics: [], trendsSeries: [] });
  };
  const toggleAlerts = async () => {
    setAlertsOn(prev => !prev);
    try { if (user) await base44.auth.updateMe({ rabi_alertas: !alertsOn }); } catch {}
  };
  const setSchedulePref = async (s) => {
    setSchedule(s);
    try { if (user) await base44.auth.updateMe({ rabi_agendamento: s }); } catch {}
  };

  const toggleRabi = async () => {
    const next = !rabiOn;
    setRabiOn(next);
    try { if (user) await base44.auth.updateMe({ rabi_ativado: next }); } catch {}
  };
  const handleGenerateAiReport = async () => {
    setReportOpen(true);
    setReportLoading(true);
    try {
      const { data } = await base44.functions.invoke('generateRabiReport');
      const sections = (data?.sections || []).map((s) => ({ title: s.title, items: s.items }));
      setReportSections(sections);
      setReportSummary(data?.summary || '');
    } catch (e) {
      setReportSections([]);
      setReportSummary('Não foi possível gerar o relatório com IA agora.');
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm text-gray-700">RABI — Radar de Análise de Beleza Inteligente</div>
          <Button size="sm" variant={rabiOn ? 'default' : 'outline'} onClick={() => { const next = !rabiOn; toggleRabi(); if (next) handleGenerateAiReport(); }}>
            {rabiOn ? 'Desativar RABI' : 'Ativar RABI'}
          </Button>
        </div>
        {planTier==='free' && rabiOn && (
          <div className="mt-2 rounded-lg border bg-yellow-50 text-yellow-900 p-3 text-sm">
            Experiência completa disponível a partir do plano PRO. <a href="/Planos" className="underline">Ver Planos</a>.
          </div>
        )}
        <RabiHero />
        <RabiMicrocopyStrip />
        <RabiExplainer />
        <RabiTutorial />




        <div className="mt-4 flex flex-wrap gap-3">
          <Button className="bg-[#2C2C2C] text-[#F7D426] border-2 border-[#2C2C2C]" onClick={handleGenerateReport}>
            Gerar Relatório (MVP)
          </Button>
          <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={handleGenerateAiReport}>
            Gerar Relatório (IA)
          </Button>
        </div>
        <RabiSection title="RABI — Tendências" subtitle="Leitura antecipada do mercado, movimentos emergentes e apoio à inovação estratégica.">
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
        <RabiConsultoriaCTA />
      <RabiReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        userEmail={user?.email}
        summary={reportSummary}
        sections={reportSections}
        loading={reportLoading}
      />
      </div>
      </div>
      );
}