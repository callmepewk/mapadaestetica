import React, { useEffect, useMemo, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import TrendRadar from "./TrendRadar/TrendRadar";
import AestheticRadar from "./AestheticRadar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Shield, Sparkles } from "lucide-react";
import TopAnatomicalAreas24h from "./TopAnatomicalAreas24h";
import ContentTipsForPros from "./ContentTipsForPros";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from "recharts";

const PLAN_LIMITS = { cobre: { views: 1, reports: 1 }, lite: { views: 1, reports: 1 }, prata: { views: 1, reports: 1 }, ouro: { views: 2, reports: 4 }, diamante: { views: 4, reports: 10 }, platina: { views: 4, reports: 10 } };

function useMonthlyUsage(user, tipo) {
  const [usage, setUsage] = useState({ acessos: 0, relatorios: 0, id: null });
  const mes = new Date().toISOString().slice(0,7);
  useEffect(() => {
    if (!user) return;
    (async () => {
      const rows = await base44.entities.RadarUsage.filter({ usuario_email: user.email, tipo, mes }, '-created_date', 1);
      if (rows.length) setUsage({ acessos: rows[0].acessos || 0, relatorios: rows[0].relatorios || 0, id: rows[0].id });
    })();
  }, [user, tipo]);
  const increment = async (field) => {
    if (!user) return usage;
    const next = { ...usage, [field]: (usage[field] || 0) + 1 };
    if (usage.id) {
      await base44.entities.RadarUsage.update(usage.id, { [field]: next[field] });
    } else {
      const created = await base44.entities.RadarUsage.create({ usuario_email: user.email, tipo, mes, acessos: field==='acessos'?1:0, relatorios: field==='relatorios'?1:0 });
      next.id = created.id;
    }
    setUsage(next);
    return next;
  };
  return { usage, increment, mes };
}

function ExportPDFButton({ containerRef, disabled, onBeforeExport }) {
  const handleExport = async () => {
    if (onBeforeExport) {
      const ok = await onBeforeExport();
      if (!ok) return;
    }
    const content = containerRef.current;
    if (!content) return;
    const w = window.open('', 'printWindow');
    if (!w) return;
    w.document.write(`<html><head><title>Relatório</title><style>body{font-family:ui-sans-serif,system-ui; padding:24px} .container{max-width:1200px;margin:0 auto}</style></head><body><div class="container">${content.innerHTML}</div></body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };
  return (
    <Button size="sm" onClick={handleExport} disabled={disabled} className="bg-pink-600 hover:bg-pink-700 text-white">
      <Download className="w-4 h-4 mr-2"/> Exportar PDF
    </Button>
  );
}

export default function RadarSection() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('tendencias');
  const tendenciasRef = useRef(null);
  const frequenciaRef = useRef(null);

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} })(); }, []);
  const isAdmin = user?.role === 'admin';
  const plan = user?.plano_ativo || 'cobre';
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.cobre;

  const tend = useMonthlyUsage(user, 'tendencias');
  const freq = useMonthlyUsage(user, 'frequencia');

  const canView = async (tipo) => {
    if (isAdmin) return true;
    const ctl = tipo==='tendencias'?tend:freq;
    if ((ctl.usage.acessos || 0) >= limits.views) { alert('Limite mensal de acessos atingido para seu plano. Faça upgrade para mais acessos.'); return false; }
    await ctl.increment('acessos');
    return true;
  };

  const beforeExport = async (tipo) => {
    if (isAdmin) return true;
    const ctl = tipo==='tendencias'?tend:freq;
    if ((ctl.usage.relatorios || 0) >= limits.reports) { alert('Limite mensal de relatórios em PDF atingido para seu plano.'); return false; }
    await ctl.increment('relatorios');
    return true;
  };

  const radarData = useMemo(() => (
    tab==='tendencias'
      ? [
          { kpi: 'Crescimento', v: 80 },
          { kpi: 'Interesse', v: 65 },
          { kpi: 'Sazonalidade', v: 50 },
          { kpi: 'Concorrência', v: 40 },
          { kpi: 'Share', v: 70 },
        ]
      : [
          { kpi: 'Frequência', v: 85 },
          { kpi: 'Picos', v: 55 },
          { kpi: 'Recorrência', v: 60 },
          { kpi: 'Conversão', v: 35 },
          { kpi: 'Retenção', v: 45 },
        ]
  ), [tab]);

  return (
    <Card className="border-none shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge className="bg-indigo-600 text-white">Radares</Badge>
            {!isAdmin && (
              <span className="text-xs text-gray-600">
                Acessos: {tend.usage.acessos + freq.usage.acessos}/{limits.views} • Relatórios: {tend.usage.relatorios + freq.usage.relatorios}/{limits.reports}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500"><Shield className="w-4 h-4"/> Limites por plano aplicados</div>
        </div>

        <Tabs value={tab} onValueChange={async (v)=>{ setTab(v); const ok = await canView(v); if (!ok) setTab(tab); }}>
          <TabsList className="mb-4">
            <TabsTrigger value="tendencias">Radar de Tendências</TabsTrigger>
            <TabsTrigger value="frequencia">Radar de Frequência</TabsTrigger>
          </TabsList>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <TabsContent value="tendencias">
                <div ref={tendenciasRef}>
                  <div className="flex justify-end mb-2">
                    <ExportPDFButton containerRef={tendenciasRef} onBeforeExport={()=>beforeExport('tendencias')} />
                  </div>
                  <TrendRadar />
                </div>
              </TabsContent>

              <TabsContent value="frequencia">
                <div ref={frequenciaRef}>
                  <div className="flex justify-end mb-2">
                    <ExportPDFButton containerRef={frequenciaRef} onBeforeExport={()=>beforeExport('frequencia')} />
                  </div>
                  <AestheticRadar />
                </div>
              </TabsContent>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2"><Sparkles className="w-4 h-4 text-pink-600"/><span className="font-semibold">Visão em Radar</span></div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} outerRadius={90}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="kpi" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Tooltip />
                    <Radar name="KPI" dataKey="v" stroke="#ec4899" fill="#ec4899" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-gray-500 mt-2">Resumo visual interativo para comparar métricas-chave desta aba.</p>
            </div>
          </div>
        </Tabs>

        <div className="mt-6 grid lg:grid-cols-2 gap-6">
          <TopAnatomicalAreas24h />
          <ContentTipsForPros />
        </div>
      </CardContent>
    </Card>
  );
}