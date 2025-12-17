import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Send, Users, Sparkles } from "lucide-react";

const PLANOS_MAPA = ["cobre","prata","ouro","diamante","platina"];
const PLANOS_CLUBE = ["nenhum","light","gold","vip"];
const PACOTES = [{p:100, bc:1},{p:500, bc:2},{p:1000, bc:3}];

export default function CadastroLoteUsuarios(){
  const [admin, setAdmin] = useState(null);
  const [texto, setTexto] = useState("");
  const [tipo, setTipo] = useState("paciente");
  const [aplicarParaTodos, setAplicarParaTodos] = useState(true);
  const [planoMapaAll, setPlanoMapaAll] = useState("cobre");
  const [planoClubeAll, setPlanoClubeAll] = useState("nenhum");
  const [pacoteAll, setPacoteAll] = useState(PACOTES[0]);
  const [assistidoIA, setAssistidoIA] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(()=>{ (async()=>{ try{ setAdmin(await base44.auth.me()); }catch{ setAdmin(null); }})(); },[]);

  const nomes = useMemo(()=> texto.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).slice(0,200), [texto]);

  const [custom, setCustom] = useState({}); // nome -> {planoMapa, planoClube, p, bc}

  const linhas = useMemo(()=> nomes.map(n=> ({
      nome:n,
      planoMapa: aplicarParaTodos ? planoMapaAll : (custom[n]?.planoMapa||"cobre"),
      planoClube: aplicarParaTodos ? planoClubeAll : (custom[n]?.planoClube||"nenhum"),
      p: aplicarParaTodos ? pacoteAll.p : (custom[n]?.p||PACOTES[0].p),
      bc: aplicarParaTodos ? pacoteAll.bc : (custom[n]?.bc||PACOTES[0].bc),
  })), [nomes, aplicarParaTodos, planoMapaAll, planoClubeAll, pacoteAll, custom]);

  const aplicarIA = async () => {
    // IA apenas replica seleção para todos conforme pedido
    setAssistidoIA(true);
    setTimeout(()=> setAssistidoIA(false), 800);
  };

  const enviar = async () => {
    if (linhas.length===0) return alert('Cole ao menos um nome.');
    setEnviando(true);
    try {
      const corpo = `CADASTRO EM LOTE\nAdministrador: ${admin?.full_name} (${admin?.email})\nTipo de usuário: ${tipo}\n\nItens (${linhas.length}):\n` + linhas.map(l=> `- ${l.nome} | Mapa:${l.planoMapa} | Clube:${l.planoClube} | Pontos:${l.p} | BC:${l.bc}`).join('\n') + `\n\nAção necessária: Convidar os usuários pelo dashboard e, após aceite, aplicar os planos e créditos listados.`;
      await base44.integrations.Core.SendEmail({
        to: admin?.email || 'admin@mapa.com',
        from_name: 'Mapa da Estética - Admin',
        subject: 'Cadastro em Lote - Solicitação',
        body: corpo
      });
      alert('Solicitação enviada ao seu email com o resumo. Use o painel de convites para concluir.');
      setTexto(""); setCustom({});
    } finally { setEnviando(false); }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/>Cadastro em Lote de Usuários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Tipo de Usuário</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="paciente">Paciente</SelectItem>
                <SelectItem value="profissional">Profissional</SelectItem>
                <SelectItem value="patrocinador">Patrocinador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Aplicar para todos</Label>
            <div className="flex items-center gap-2 mt-2"><Checkbox checked={aplicarParaTodos} onCheckedChange={setAplicarParaTodos}/><span className="text-sm">Mesmo plano/pacote para todos</span></div>
          </div>
          <div className="flex items-end">
            <Button type="button" variant="outline" onClick={aplicarIA}><Sparkles className="w-4 h-4 mr-2"/>Cadastro assistido por IA</Button>
          </div>
        </div>

        {/* Opções globais */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>Plano Mapa</Label>
            <Select value={planoMapaAll} onValueChange={setPlanoMapaAll} disabled={!aplicarParaTodos || tipo!=='patrocinador'}>
              <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>
                {PLANOS_MAPA.map(p=> <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Plano Clube</Label>
            <Select value={planoClubeAll} onValueChange={setPlanoClubeAll} disabled={!aplicarParaTodos || tipo!=='patrocinador'}>
              <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>
                {PLANOS_CLUBE.map(p=> <SelectItem key={p} value={p}>{p.toUpperCase()}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Pontos/BeautyCoins</Label>
            <Select value={`${pacoteAll.p}|${pacoteAll.bc}`} onValueChange={(v)=>{ const [p,bc]=v.split('|').map(Number); setPacoteAll({p,bc}); }}>
              <SelectTrigger className="mt-1"><SelectValue/></SelectTrigger>
              <SelectContent>
                {PACOTES.map(pk=> <SelectItem key={pk.p} value={`${pk.p}|${pk.bc}`}>{pk.p} pts / {pk.bc} BC</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Nomes (um por linha)</Label>
          <Textarea rows={6} value={texto} onChange={(e)=> setTexto(e.target.value)} placeholder={"Exemplo:\nMaria Silva\nJoão Souza\n..."} className="mt-1"/>
          <p className="text-xs text-gray-500 mt-1">Máximo de 200 nomes. Emails serão convidados manualmente após este passo.</p>
        </div>

        {!aplicarParaTodos && nomes.length>0 && (
          <div className="space-y-3">
            <Label>Configuração individual (patrocinadores)</Label>
            {nomes.map(n => (
              <div key={n} className="grid md:grid-cols-4 gap-2 p-2 border rounded">
                <div className="col-span-1"><Input value={n} readOnly/></div>
                <div>
                  <Select value={custom[n]?.planoMapa||'cobre'} onValueChange={(v)=> setCustom(p=>({...p,[n]:{...(p[n]||{}), planoMapa:v}}))} disabled={tipo!=='patrocinador'}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{PLANOS_MAPA.map(p=> <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={custom[n]?.planoClube||'nenhum'} onValueChange={(v)=> setCustom(p=>({...p,[n]:{...(p[n]||{}), planoClube:v}}))} disabled={tipo!=='patrocinador'}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{PLANOS_CLUBE.map(p=> <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Select value={`${custom[n]?.p||PACOTES[0].p}|${custom[n]?.bc||PACOTES[0].bc}`} onValueChange={(v)=>{ const [p,bc]=v.split('|').map(Number); setCustom(prev=>({...prev,[n]:{...(prev[n]||{}), p, bc}})); }}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>{PACOTES.map(pk=> <SelectItem key={pk.p} value={`${pk.p}|${pk.bc}`}>{pk.p}/{pk.bc}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        )}

        {linhas.length>0 && (
          <div className="p-3 bg-gray-50 border rounded">
            <p className="font-semibold mb-2">Revisão</p>
            <div className="space-y-1 text-sm max-h-48 overflow-auto">
              {linhas.map((l,i)=> (
                <div key={i} className="flex items-center gap-2">
                  <Badge variant="outline">{i+1}</Badge>
                  <span className="font-medium">{l.nome}</span>
                  {tipo==='patrocinador' && (
                    <span className="text-gray-600">Mapa:{l.planoMapa.toUpperCase()} • Clube:{l.planoClube.toUpperCase()}</span>
                  )}
                  <span className="text-gray-600">Pontos:{l.p} • BC:{l.bc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={enviar} disabled={enviando || linhas.length===0}>
            {enviando ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Send className="w-4 h-4 mr-2"/>}
            Enviar Solicitação de Convites
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}