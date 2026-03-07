import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Target, Calendar, Clock, ShieldCheck, Save } from "lucide-react";

const SUGESTOES_METAS = [
  "Rejuvenescimento", "Redução de manchas", "Melhorar textura da pele", "Reduzir gordura localizada", "Ganhar tônus", "Relaxamento / bem-estar"
];

const dias = [
  { v: "dom", l: "Domingo" }, { v: "seg", l: "Segunda" }, { v: "ter", l: "Terça" }, { v: "qua", l: "Quarta" }, { v: "qui", l: "Quinta" }, { v: "sex", l: "Sexta" }, { v: "sab", l: "Sábado" }
];

export default function PlannerWellness() {
  const qc = useQueryClient();
  const [user, setUser] = useState(null);
  useEffect(() => { (async()=>{ try { setUser(await base44.auth.me()); } catch{} })(); }, []);
  const email = user?.email || "";
  const isProf = user?.tipo_usuario === "profissional" || user?.role === "admin";

  const { data: meta = null } = useQuery({
    queryKey: ["wellness-meta", email],
    queryFn: async () => {
      if (!email) return null;
      const list = await base44.entities.WellnessMeta.filter({ user_email: email }, "-created_date", 1);
      return list?.[0] || null;
    },
    enabled: !!email,
    initialData: null
  });

  const [objetivos, setObjetivos] = useState("");
  const [metas, setMetas] = useState([]);
  const [compartilhar, setCompartilhar] = useState(true);
  useEffect(() => {
    if (meta) {
      setObjetivos(meta.objetivos || "");
      setMetas(Array.isArray(meta.metas) ? meta.metas : []);
      setCompartilhar(meta.compartilhar_com_profissionais ?? true);
    }
  }, [meta]);

  const upsertMeta = useMutation({
    mutationFn: async () => {
      if (meta?.id) {
        return base44.entities.WellnessMeta.update(meta.id, {
          objetivos, metas, compartilhar_com_profissionais: compartilhar
        });
      }
      return base44.entities.WellnessMeta.create({ user_email: email, objetivos, metas, compartilhar_com_profissionais: compartilhar });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wellness-meta", email] })
  });

  // Métricas do paciente
  const { data: ags = [] } = useQuery({
    queryKey: ["meus-agendamentos", email],
    queryFn: async () => email ? await base44.entities.Agendamento.filter({ cliente_email: email }, "-created_date", 100) : [],
    enabled: !!email,
    initialData: []
  });
  const { data: procs = [] } = useQuery({
    queryKey: ["meus-procedimentos", email],
    queryFn: async () => email ? await base44.entities.AtendimentoPontos.filter({ cliente_email: email, status: "concluido" }, "-created_date", 200) : [],
    enabled: !!email,
    initialData: []
  });

  // Disponibilidade do profissional (opcional)
  const { data: disp = null } = useQuery({
    queryKey: ["minha-disponibilidade", email],
    queryFn: async () => {
      if (!isProf || !email) return null;
      const list = await base44.entities.DisponibilidadeProfissional.filter({ user_email: email }, "-created_date", 1);
      return list?.[0] || null;
    },
    enabled: isProf && !!email,
    initialData: null
  });
  const [slots, setSlots] = useState([]);
  useEffect(() => { if (disp) setSlots(disp.slots || []); }, [disp]);

  const upsertDisp = useMutation({
    mutationFn: async () => {
      if (!isProf) return null;
      if (disp?.id) return base44.entities.DisponibilidadeProfissional.update(disp.id, { slots });
      return base44.entities.DisponibilidadeProfissional.create({ user_email: email, slots });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["minha-disponibilidade", email] })
  });

  const addSlot = () => setSlots((s)=> [...s, { dia_semana: "seg", inicio: "09:00", fim: "18:00" }]);
  const removeSlot = (idx) => setSlots((s)=> s.filter((_,i)=> i!==idx));
  const setSlot = (idx, field, val) => setSlots((s)=> s.map((sl,i)=> i===idx? { ...sl, [field]: val } : sl));

  const totalAg = ags.length;
  const totalProc = procs.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-700" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Planner de Wellness</h1>
        </div>

        {/* Seção Marketing: Explicação do Planner Wellness */}
        <div className="rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Planeje sua jornada de bem-estar com o Planner Wellness</h2>
          <p className="text-sm md:text-base text-gray-700">
            O <strong>Planner Wellness</strong> é uma ferramenta inteligente que ajuda você a organizar procedimentos, acompanhar sua evolução estética, descobrir novos tratamentos e receber recomendações personalizadas.
          </p>
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2"><Target className="w-4 h-4 text-purple-600 mt-0.5"/> Defina metas e protocolos ao longo do tempo</div>
              <div className="flex items-start gap-2"><Calendar className="w-4 h-4 text-purple-600 mt-0.5"/> Organize sessões e acompanhe sua evolução</div>
              <div className="flex items-start gap-2"><Clock className="w-4 h-4 text-purple-600 mt-0.5"/> Receba lembretes e recomendações</div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 text-purple-600 mt-0.5"/> Profissionais: planejem protocolos e fidelizem clientes</div>
              <div className="flex items-start gap-2"><Save className="w-4 h-4 text-purple-600 mt-0.5"/> Histórico centralizado de atendimentos e metas</div>
            </div>
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="border-2 border-emerald-200">
            <CardHeader><CardTitle className="flex items-center gap-2 text-emerald-700"><Calendar className="w-5 h-5"/> Meus Agendamentos</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalAg}</p>
              <p className="text-xs text-gray-500 mt-1">Total registrados na plataforma</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-purple-200">
            <CardHeader><CardTitle className="flex items-center gap-2 text-purple-700"><Target className="w-5 h-5"/> Procedimentos Realizados</CardTitle></CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalProc}</p>
              <p className="text-xs text-gray-500 mt-1">Atendimentos concluídos</p>
            </CardContent>
          </Card>
        </div>

        {/* Metas do Paciente */}
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700"><Target className="w-5 h-5"/> Minhas Metas e Objetivos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SUGESTOES_METAS.map((m)=>{
                const checked = metas.includes(m);
                return (
                  <button key={m} onClick={()=> setMetas((prev)=> checked ? prev.filter(x=>x!==m) : [...prev, m])} className={`px-3 py-1 rounded-full border text-sm ${checked? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-blue-50'}`}>{m}</button>
                );
              })}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Objetivos (livre)</label>
              <Textarea rows={4} value={objetivos} onChange={(e)=> setObjetivos(e.target.value)} placeholder="Descreva seus objetivos estéticos (ex: melhorar tonicidade facial, reduzir manchas, etc.)" />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="compartilhar" checked={compartilhar} onCheckedChange={setCompartilhar} />
              <label htmlFor="compartilhar" className="text-sm text-gray-700 cursor-pointer">Permitir que profissionais que me atenderem vejam minhas metas</label>
            </div>
            <Button onClick={()=> upsertMeta.mutate()} className="bg-blue-600 hover:bg-blue-700 text-white"><Save className="w-4 h-4 mr-2"/>Salvar Metas</Button>
          </CardContent>
        </Card>

        {/* Disponibilidade do Profissional (opcional) */}
        {isProf && (
          <Card className="border-2 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700"><Clock className="w-5 h-5"/> Meus Horários de Disponibilidade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {slots.map((sl, idx)=> (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4">
                    <Select value={sl.dia_semana} onValueChange={(v)=> setSlot(idx, 'dia_semana', v)}>
                      <SelectTrigger><SelectValue placeholder="Dia"/></SelectTrigger>
                      <SelectContent>
                        {dias.map(d=> <SelectItem key={d.v} value={d.v}>{d.l}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3"><Input type="time" value={sl.inicio} onChange={(e)=> setSlot(idx,'inicio', e.target.value)} /></div>
                  <div className="col-span-3"><Input type="time" value={sl.fim} onChange={(e)=> setSlot(idx,'fim', e.target.value)} /></div>
                  <div className="col-span-2 text-right"><Button variant="destructive" size="icon" onClick={()=> removeSlot(idx)}><Trash2 className="w-4 h-4"/></Button></div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={addSlot}><Plus className="w-4 h-4 mr-2"/>Adicionar faixa</Button>
                <Button onClick={()=> upsertDisp.mutate()} className="bg-amber-600 hover:bg-amber-700 text-white"><Save className="w-4 h-4 mr-2"/>Salvar disponibilidade</Button>
              </div>
              <p className="text-xs text-gray-600">Observação: ao expor serviços, aceite-os apenas após o agendamento confirmado na agenda.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}