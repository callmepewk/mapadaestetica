import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";


import RabiHero from "../components/rabi/RabiHero";
import RabiMicrocopyStrip from "../components/rabi/RabiMicrocopyStrip";
import RabiExplainer from "../components/rabi/RabiExplainer";
import RabiTutorial from "../components/rabi/RabiTutorial";
import RabiSection from "../components/rabi/RabiSection";
import RabiConsultoriaCTA from "../components/rabi/RabiConsultoriaCTA";



import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import RabiExpandableCard from "../components/rabi/RabiExpandableCard";
import RabiReportModal from "../components/rabi/RabiReportModal";
import RabiGAUploader from "../components/rabi/RabiGAUploader";
import RabiTrendsChart from "../components/rabi/RabiTrendsChart";
import VisualInsightsGrid from "../components/rabi/VisualInsightsGrid";
import IebCard from "../components/rabi/IebCard";
import TrendsTopList from "../components/rabi/TrendsTopList";
import PricingSummary from "../components/rabi/PricingSummary";

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
  const [miLoading, setMiLoading] = useState(false);
  const [miData, setMiData] = useState(null);


  const [rabiOn, setRabiOn] = useState(false);
  const [planTier, setPlanTier] = useState('free');
  const [loadingRadars, setLoadingRadars] = useState(false);
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
    if (p.includes('premium') || p.includes('platina')) return 'premium';
    if (p.includes('prime') || p.includes('diamante')) return 'prime';
    if (p.includes('pro') || p.includes('ouro')) return 'pro';
    return 'free';
  };

  const getWeekKey = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2,'0');
    const d = date.getDate();
    const w = Math.ceil(d / 7);
    return `${y}-${m}-W${w}`;
  };

  const tryConsumeRabiQuota = async () => {
    const tier = planTier;
    if (!['prime','premium'].includes(tier)) {
      alert('RABI disponível apenas para planos Prime e Premium.');
      return false;
    }
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
    const weekKey = getWeekKey(now);
    const u = await base44.auth.me();
    let { rabi_month_key, rabi_month_count = 0, rabi_week_key, rabi_week_count = 0 } = u || {};
    if (rabi_month_key !== monthKey) { rabi_month_key = monthKey; rabi_month_count = 0; }
    if (rabi_week_key !== weekKey) { rabi_week_key = weekKey; rabi_week_count = 0; }
    const limits = tier === 'premium' ? { month: 8, week: 2 } : { month: 2, week: 1 };
    if (rabi_month_count >= limits.month || rabi_week_count >= limits.week) {
      alert(`Limite de relatórios atingido (${tier === 'premium' ? '2 por semana, 8 por mês' : '1 por semana, 2 por mês'}).`);
      return false;
    }
    await base44.auth.updateMe({
      rabi_month_key, rabi_week_key,
      rabi_month_count: rabi_month_count + 1,
      rabi_week_count: rabi_week_count + 1
    });
    return true;
  };

  const handleGenerateReport = async (skipQuota = false) => {
    // não abrir modal de preview
    setReportLoading(true);
    if (!skipQuota) {
      const ok = await tryConsumeRabiQuota();
      if (!ok) { setReportLoading(false); return; }
    }
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
  const handleGenerateAiReport = async (skipQuota = false) => {
    // não abrir modal de preview
    setReportLoading(true);
    if (!skipQuota) {
      const ok = await tryConsumeRabiQuota();
      if (!ok) { setReportLoading(false); return; }
    }
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
        <div className="space-y-3">
          <div className="text-sm text-gray-700">RABI — Radar de Análise de Beleza Inteligente</div>
          <div className="rounded-xl border-2 border-[#F7D426] bg-gradient-to-r from-[#FFF3A3] to-[#FFE066] p-4 flex items-center justify-between flex-col sm:flex-row gap-3">
            <div className="text-center sm:text-left">
              <p className="text-lg font-bold text-[#2C2C2C]">Ative o R.A.B.I e gere sua leitura estratégica automaticamente</p>
              <p className="text-sm text-[#2C2C2C]/80">As leituras de Tendências serão preenchidas em poucos segundos</p>
            </div>
            <Button
              className="h-12 px-6 text-base font-bold bg-[#2C2C2C] text-[#F7D426] hover:bg-black"
              onClick={async () => {
                if (!rabiOn) { try { await base44.auth.updateMe({ rabi_ativado: true }); } catch {} }
                setRabiOn(true);
                document.getElementById('rabi-trends')?.scrollIntoView({ behavior: 'smooth' });
                setLoadingRadars(true);
                try {
                  const allowed = await tryConsumeRabiQuota();
                  if (!allowed) { return; }
                  await handleGenerateAiReport(true);
                } finally {
                  setLoadingRadars(false);
                }
              }}
            >
              {loadingRadars ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin"/> Analisando dados estratégicos...</>) : (rabiOn ? 'Executar nova análise' : 'Ativar R.A.B.I')}
            </Button>
          </div>
        </div>
        {loadingRadars && (
          <div className="mt-2 rounded-lg border bg-yellow-50 text-yellow-900 p-3 text-sm flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Analisando tendências do mercado estético...
          </div>
        )}
        {planTier==='free' && rabiOn && (
          <div className="mt-2 rounded-lg border bg-yellow-50 text-yellow-900 p-3 text-sm">
            Experiência completa disponível a partir do plano PRO. <a href="/Planos" className="underline">Ver Planos</a>.
          </div>
        )}
        <RabiHero />
        <div className="rounded-xl overflow-hidden border">
          <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/5f1d2b16a_visogeral.jpg" alt="RABI" className="w-full h-auto" />
        </div>
        <RabiMicrocopyStrip />
        <RabiExplainer />
        <RabiTutorial />




        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={async ()=>{
              setMiLoading(true);
              try {
                const { data } = await base44.functions.invoke('rabiMarketIntelligence', { scope: 'br' });
                setMiData(data);
              } catch {}
              finally { setMiLoading(false); }
            }}
          >
            {miLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Atualizando inteligência…</>) : 'Atualizar Inteligência (Brasil)'}
          </Button>

          <Button className="bg-pink-600 hover:bg-pink-700 text-white" onClick={handleGenerateAiReport}>
            Gerar Relatório (IA)
          </Button>
          {(reportSections?.length || 0) > 0 && (
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={async ()=>{
              try {
                const res = await base44.functions.invoke('exportRabiPdf', { summary: reportSummary, sections: reportSections });
                const uri = res?.data?.pdf_data_uri;
                if (uri) { const a = document.createElement('a'); a.href = uri; a.download = 'RABI-relatorio.pdf'; a.click(); }
              } catch {}
            }}>
              <Download className="w-4 h-4 mr-2"/> Exportar PDF
            </Button>
          )}
        </div>
        <div id="rabi-trends"></div>
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









        </RabiSection>

        {miData && (
          <RabiSection title="RABI — Motor de Inteligência de Mercado" subtitle="Google Trends (demanda), preços consolidados e IEB (Brasil)">
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <IebCard value={miData?.ieb?.value} label={miData?.ieb?.label} updatedAt={miData?.updated_at} />
              <TrendsTopList title="Top Procedimentos (tendência)" items={(miData?.trends?.topProcedures && miData.trends.topProcedures.length>0) ? miData.trends.topProcedures : (miData?.googleTrends?.terms || [])} />
              <TrendsTopList title="Áreas Anatômicas em Alta" items={miData?.trends?.topAreas || []} />
            </div>
            <div className="mt-4">
              <PricingSummary procedures={miData?.pricing?.procedures || []} />
            </div>
          </RabiSection>
        )}

        <RabiSection title="Insights Visuais — Tendências e Oportunidades" subtitle="Resumo visual com gráficos e quadros principais do período analisado.">
          <VisualInsightsGrid
            insights={[
              { title: 'Visão Geral do Relatório', subtitle: 'Parâmetros de análise e escopo', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/5f1d2b16a_visogeral.jpg', source: 'Google Trends + RABI' },
              { title: 'Ranking de Interesse — Top 10 termos', subtitle: 'Índice relativo (0–100) — Região Sudeste', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/abb85ed05_rankingdeinteresses.jpg', source: 'RABI' },
              { title: 'Distribuição por Tratamentos', subtitle: 'Participação relativa por macro categoria', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/0cf487bd0_graficodetratamentos.jpg', source: 'RABI' },
              { title: 'Metodologia de Coleta', subtitle: 'Localização, período e filtro saúde', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/d52bbbac0_metodologiadecoleta.jpg', source: 'RABI' },
              { title: 'Procedimentos Corporais e Especializados', subtitle: 'Oportunidades em nichos com diferenciação', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/f7f70819d_procedimentoscorporais.jpg', source: 'RABI' },
              { title: 'Procedimentos Faciais em Destaque', subtitle: 'Rejuvenescimento, melasma, cicatriz e manchas', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/ed2d09de8_procedimentosemdestaquefacial.jpg', source: 'RABI' },
              { title: 'Termos por Indicação Clínica', subtitle: 'Condição/objetivo do paciente', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/40333422d_indicaoclinica.jpg', source: 'RABI' },
              { title: 'Termos de Relevância Intermediária', subtitle: 'Conjunto de termos com relevância intermediária', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/bab9655dc_relevanciaimediata.jpg', source: 'RABI' },
              { title: 'Termos de Alta Relevância', subtitle: 'Tecnologias populares e acessíveis', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/61fcaa2d0_termosdealtarelevancia.jpg', source: 'RABI' },
              { title: 'Tratamentos (sem percentual)', subtitle: 'Visão comparativa sem peso relativo', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/21652ad59_tratamentosempercentual.jpg', source: 'RABI' },
            ]}
          />
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