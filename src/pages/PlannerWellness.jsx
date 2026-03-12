import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import CardAnuncio from "../components/anuncios/CardAnuncio";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Target, Calendar, Clock, ShieldCheck, Save, MapPin, DollarSign, User } from "lucide-react";
import { createPageUrl } from "@/utils";

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

  const { data: planner = null } = useQuery({
    queryKey: ["wellness-planner", email],
    queryFn: async () => {
      if (!email) return null;
      const list = await base44.entities.WellnessPlanner.filter({ user_email: email }, "-created_date", 1);
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

  const PROCEDURES = ["Botox","Preenchimento","Laser","Limpeza de pele","Tratamento para manchas","Depilação a laser","Rejuvenescimento facial"];
  const [selectedProcs, setSelectedProcs] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [customBudgets, setCustomBudgets] = useState({});
  const [prefCity, setPrefCity] = useState("");
  const [maxDist, setMaxDist] = useState("");
  const [prefType, setPrefType] = useState("indiferente");
  const [matches, setMatches] = useState([]);
  const [loadingMatch, setLoadingMatch] = useState(false);
  const [userLoc, setUserLoc] = useState(null);
  // Wizard (novo fluxo 6 etapas)
  const [objetivo, setObjetivo] = useState(""); // rosto | corpo | cabelo | pele | intimo
  const [dor, setDor] = useState("");
  const [experiencia, setExperiencia] = useState(""); // nunca | uma | regular
  const [conhecimento, setConhecimento] = useState(""); // sim | pouco | nao
  const [investimento, setInvestimento] = useState(""); // ate300 | 300-700 | 700-1500 | 1500-3000 | 3000+
  const [step, setStep] = useState(1);

  useEffect(()=>{
    if (planner) {
      setSelectedProcs((planner.procedures||[]).map(p=>p.nome));
      const b = {}; const c = {};
      (planner.procedures||[]).forEach(p=>{ b[p.nome]=p.faixa||''; if (p.valor_custom) c[p.nome]=p.valor_custom; });
      setBudgets(b); setCustomBudgets(c);
      setPrefCity(planner.cidade||"");
      setMaxDist(planner.distancia_km? String(planner.distancia_km):"");
      setPrefType(planner.preferencia||"indiferente");
    }
  }, [planner]);

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

  const upsertPlanner = useMutation({
    mutationFn: async (payload) => {
      if (!email) return null;
      if (planner?.id) return base44.entities.WellnessPlanner.update(planner.id, payload);
      return base44.entities.WellnessPlanner.create(payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wellness-planner", email] })
  });

  const mapBudgetToFaixas = (code, custom) => {
    switch (code) {
      case 'ate300': return ['$', '$$'];
      case '300-600': return ['$$'];
      case '600-1000': return ['$$$'];
      case '1000+': return ['$$$', '$$$$', '$$$$$'];
      case 'custom': {
        const v = Number(custom||0);
        if (v<=200) return ['$'];
        if (v<=500) return ['$$'];
        if (v<=3000) return ['$$$'];
        if (v<=5000) return ['$$$$'];
        return ['$$$$$'];
      }
      default: return [];
    }
  };

  const haversine = (lat1, lon1, lat2, lon2) => {
    const R=6371; const dLat=(lat2-lat1)*Math.PI/180; const dLon=(lon2-lon1)*Math.PI/180;
    const a=Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
    return 2*R*Math.asin(Math.sqrt(a));
  };

  const generateMatches = async () => {
    setLoadingMatch(true);
    try {
      const anuncios = await base44.entities.Anuncio.filter({ status: 'ativo' }, '-created_date', 500);
      const procSet = new Set(selectedProcs.map(p=>p.toLowerCase()));
      const recs = [];
      anuncios.forEach(a=>{
        const texto = `${a.titulo||''} ${(a.descricao||'')}`.toLowerCase();
        const tags = (a.tags||[]).map(t=> (t||'').toLowerCase());
        const procs = (a.procedimentos_servicos||[]).map(p=>(p||'').toLowerCase());
        const matchProc = [...procSet].some(p=> texto.includes(p) || tags.includes(p) || procs.includes(p));
        if (!matchProc) return;
        // price compatibility
        const anyFaixaOk = [...procSet].some(p=>{
          const code = budgets[p]||''; const custom = customBudgets[p]||null;
          const faixas = mapBudgetToFaixas(code, custom);
          return faixas.includes(a.faixa_preco);
        });
        if (!anyFaixaOk) return;
        // city / distance
        if (prefCity && a.cidade && !a.cidade.toLowerCase().includes(prefCity.toLowerCase())) return;
        let dist = null;
        if (userLoc && a.latitude && a.longitude) {
          dist = haversine(userLoc.lat, userLoc.lng, a.latitude, a.longitude);
          if (maxDist && Number(maxDist)>0 && dist > Number(maxDist)) return;
        }
        const stars = a.estrelas_estabelecimento || 0;
        const pops = a.visualizacoes || 0;
        const priceScore = 1; // matched
        const distScore = dist==null ? 0.5 : (dist<=5?1: dist<=10?0.8: dist<=20?0.6: 0.3);
        const score = priceScore*3 + distScore + stars*0.2 + Math.min(pops/100,1)*0.5;
        recs.push({ a, score, dist });
      });
      recs.sort((x,y)=> y.score - x.score);
      setMatches(recs.slice(0,24).map(r=>r.a));
    } finally { setLoadingMatch(false); }
  };

  const salvarERecomendar = async () => {
    const payload = {
      user_email: email,
      procedures: selectedProcs.map(p=>({ nome: p, faixa: budgets[p]||'', valor_custom: customBudgets[p]||null })),
      cidade: prefCity || undefined,
      distancia_km: maxDist? Number(maxDist): undefined,
      preferencia: prefType
    };
    await upsertPlanner.mutateAsync(payload);
    await generateMatches();
    document.getElementById('recomendacoes-planner')?.scrollIntoView({ behavior: 'smooth' });
  };

  const pedirLocalizacao = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos)=> setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
  };

  const removeSlot = (idx) => setSlots((s)=> s.filter((_,i)=> i!==idx));
  const setSlot = (idx, field, val) => setSlots((s)=> s.map((sl,i)=> i===idx? { ...sl, [field]: val } : sl));

  const totalAg = ags.length;
  const totalProc = procs.length;

  // Profissionais: agregados do planner
  function ProfInsightsInner() {
    const [stats, setStats] = useState({ top: [], dist: [] });
    useEffect(()=>{ (async()=>{
      try {
        const all = await base44.entities.WellnessPlanner.list('-created_date', 1000);
        const procCount = {};
        const budgetCount = {};
        (all||[]).forEach(w=>{
          (w.procedures||[]).forEach(p=>{
            procCount[p.nome] = (procCount[p.nome]||0)+1;
            const k = `${p.nome}|${p.faixa||'custom'}`;
            budgetCount[k] = (budgetCount[k]||0)+1;
          });
        });
        const top = Object.entries(procCount).sort((a,b)=> b[1]-a[1]).slice(0,5);
        const focus = top[0]?.[0];
        const dist = Object.entries(budgetCount)
          .filter(([k])=> k.startsWith((focus||'')+"|"))
          .map(([k,v])=> ({ faixa: k.split('|')[1], v }))
          .sort((a,b)=> b.v-a.v);
        setStats({ top, dist });
      } catch {}
    })(); }, []);
    return (
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-semibold">Mais procurados</h4>
          <ul className="text-sm mt-2 space-y-1">
            {stats.top.map(([nome, v])=> <li key={nome} className="flex items-center justify-between"><span>{nome}</span><span className="text-gray-500">{v}</span></li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold">Faixa de investimento — foco</h4>
          <ul className="text-sm mt-2 space-y-1">
            {stats.dist.map((d)=> <li key={d.faixa} className="flex items-center justify-between"><span>{d.faixa}</span><span className="text-gray-500">{d.v}</span></li>)}
          </ul>
        </div>
      </div>
    );
  }
  const ProfInsights = ProfInsightsInner;

   return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-blue-700" />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Planner de Wellness</h1>
        </div>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-5 space-y-2 text-blue-900">
            <p className="text-sm"><strong>O que é:</strong> seu espaço pessoal para definir metas de saúde/estética, organizar rotinas de autocuidado e acompanhar sua evolução.</p>
            <p className="text-sm"><strong>Para pacientes:</strong> ajuda a planejar tratamentos, registrar objetivos e compartilhar com profissionais quando desejar.</p>
            <p className="text-sm"><strong>Para profissionais:</strong> permite visualizar (se autorizado) as metas do paciente e ajustar protocolos e agendas.</p>
            <p className="text-sm"><strong>Para patrocinadores:</strong> oferece visão de interesses e rotinas (de forma agregada) para ações mais relevantes.</p>
          </CardContent>
        </Card>

        {/* Planner (Paciente) - Passos (novo fluxo 6 etapas) */}
        {!isProf && (
          <Card className="border-2 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700"><Target className="w-5 h-5"/> Wellness Planner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Marketing copy */}
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-900 text-sm">
                <p className="font-semibold">Seu plano de autoestima começa aqui.</p>
                <p>O Wellness Planner analisa seus objetivos estéticos e mostra tratamentos, profissionais e valores médios para você se planejar com segurança.</p>
              </div>

              {/* Progresso */}
              <div>
                <div className="flex items-center justify-between text-sm"><span>Etapa {step} de 6</span><button className="text-blue-600 underline" onClick={pedirLocalizacao}>Usar minha localização</button></div>
                <Progress value={(step/6)*100} className="h-2" />
              </div>

              {/* Etapa 1 — Objetivo estético */}
              {step===1 && (
                <div className="space-y-3 animate-in fade-in">
                  <p className="text-sm text-gray-700">O que você gostaria de melhorar?</p>
                  <div className="flex flex-wrap gap-2">
                    {["rosto","corpo","cabelo","pele","intimo"].map(op=> (
                      <button key={op} onClick={()=> setObjetivo(op)} className={`px-3 py-1 rounded-full border text-sm ${objetivo===op? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-emerald-50'}`}>{op}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Etapa 2 — Dor estética principal */}
              {step===2 && (
                <div className="space-y-3 animate-in fade-in">
                  <p className="text-sm text-gray-700">Qual dessas situações mais afeta sua autoestima hoje?</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      objetivo==="cabelo" ? ["queda de cabelo","calvície","afinamento capilar","oleosidade capilar","caspa","fortalecimento capilar"] :
                      objetivo==="corpo" ? ["gordura localizada","celulite","flacidez corporal","estrias","retenção de líquidos","inchaço corporal","modelagem corporal"] :
                      ["rugas","linhas de expressão","manchas na pele","melasma","olheiras","poros dilatados","pele oleosa","pele seca","pele envelhecida","flacidez facial","rejuvenescimento facial"]
                    ).map(op=> (
                      <button key={op} onClick={()=> setDor(op)} className={`px-3 py-1 rounded-full border text-sm ${dor===op? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-emerald-50'}`}>{op}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Etapa 3 — Experiência anterior */}
              {step===3 && (
                <div className="space-y-3 animate-in fade-in">
                  <p className="text-sm text-gray-700">Você já realizou procedimentos estéticos antes?</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {k:"nunca", l:"nunca fiz"},
                      {k:"uma", l:"fiz uma vez"},
                      {k:"regular", l:"faço regularmente"}
                    ].map(op=> (
                      <button key={op.k} onClick={()=> setExperiencia(op.k)} className={`px-3 py-1 rounded-full border text-sm ${experiencia===op.k? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-emerald-50'}`}>{op.l}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Etapa 4 — Conhecimento de segurança */}
              {step===4 && (
                <div className="space-y-3 animate-in fade-in">
                  <p className="text-sm text-gray-700">Você conhece a importância da segurança técnica nos procedimentos estéticos?</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {k:"sim", l:"sim"},
                      {k:"pouco", l:"pouco"},
                      {k:"nao", l:"não"}
                    ].map(op=> (
                      <button key={op.k} onClick={()=> setConhecimento(op.k)} className={`px-3 py-1 rounded-full border text-sm ${conhecimento===op.k? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-emerald-50'}`}>{op.l}</button>
                    ))}
                  </div>
                  <div className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded p-2">
                    Sempre procure profissionais habilitados pelos conselhos da saúde.
                  </div>
                </div>
              )}

              {/* Etapa 5 — Faixa de investimento */}
              {step===5 && (
                <div className="space-y-3 animate-in fade-in">
                  <p className="text-sm text-gray-700">Quanto você estaria disposto(a) a investir em você?</p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      {k:"ate300", l:"até 300"},
                      {k:"300-700", l:"300 a 700"},
                      {k:"700-1500", l:"700 a 1500"},
                      {k:"1500-3000", l:"1500 a 3000"},
                      {k:"3000+", l:"3000+"}
                    ].map(op=> (
                      <button key={op.k} onClick={()=> setInvestimento(op.k)} className={`px-3 py-2 rounded-lg border text-sm text-left ${investimento===op.k? 'bg-emerald-600 text-white border-emerald-600' : 'hover:bg-emerald-50'}`}>{op.l}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Etapa 6 — Resultado */}
              {step===6 && (
                <div className="space-y-4 animate-in fade-in">
                  <p className="text-sm text-gray-700">Resultado do seu plano:</p>
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="p-3 rounded border bg-white shadow-sm">
                      <p className="text-xs text-gray-500">Tratamentos recomendados</p>
                      <p className="font-semibold">
                        {dor || objetivo || 'Defina sua dor/objetivo'}
                      </p>
                    </div>
                    <div className="p-3 rounded border bg-white shadow-sm">
                      <p className="text-xs text-gray-500">Profissionais próximos</p>
                      <p className="font-semibold">Ver no mapa</p>
                    </div>
                    <div className="p-3 rounded border bg-white shadow-sm">
                      <p className="text-xs text-gray-500">Faixa média de preço</p>
                      <p className="font-semibold">
                        {investimento==="ate300"? "R$ até 300" : investimento==="300-700"? "R$ 300–700" : investimento==="700-1500"? "R$ 700–1500" : investimento==="1500-3000"? "R$ 1500–3000" : investimento==="3000+"? "R$ 3000+" : "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={()=>{
                      const map = {
                        "estrias": {type:'tratamento', value:'estrias'},
                        "gordura localizada": {type:'tratamento', value:'gordura localizada'},
                        "celulite": {type:'tratamento', value:'celulite'},
                        "flacidez corporal": {type:'tratamento', value:'flacidez corporal'},
                        "flacidez facial": {type:'tratamento', value:'flacidez facial'},
                        "manchas na pele": {type:'tratamento', value:'manchas na pele'},
                        "melasma": {type:'tratamento', value:'melasma'},
                        "olheiras": {type:'procedimento', value:'preenchimento de olheiras'},
                        "rugas": {type:'procedimento', value:'toxina botulínica'},
                        "linhas de expressão": {type:'procedimento', value:'toxina botulínica'},
                        "queda de cabelo": {type:'tratamento', value:'queda de cabelo'}
                      };
                      const sel = map[dor?.toLowerCase?.()||""] || (objetivo==="cabelo"? {type:'tratamento', value:'queda de cabelo'} : {type:'procedimento', value:'harmonização facial'});
                      const qs = `${sel.type}=${encodeURIComponent(sel.value)}`;
                      window.location.href = `${createPageUrl('Mapa')}?${qs}`;
                    }}>Ver recomendações no mapa</Button>
                  </div>
                </div>
              )}

              {/* Navegação */}
              <div className="flex justify-between pt-2">
                <Button variant="outline" disabled={step===1} onClick={()=> setStep(s=> Math.max(1, s-1))}>Voltar</Button>
                <Button onClick={()=> setStep(s=> Math.min(6, s+1))}>{step<6? 'Avançar' : 'Concluir'}</Button>
              </div>
            </CardContent>
          </Card>
        )}

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

        {/* Inteligência do Planner (Profissionais) */}
        {isProf && (
          <Card className="border-2 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700"><Target className="w-5 h-5"/> Inteligência do Planner — Visão de Mercado</CardTitle>
            </CardHeader>
            <CardContent>
              <ProfInsights />
            </CardContent>
          </Card>
        )}

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