import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, Check, ArrowRight, Shield, Upload, Loader2 } from "lucide-react";

const CATALOGO = [
  { id: "kit-skincare", nome: "Kit Skincare Premium", pontos: 2500, img: "https://images.unsplash.com/photo-1556229010-aa3f7ff66b53?q=80&w=1200&auto=format&fit=crop" },
  { id: "day-spa", nome: "Day Spa Relaxante", pontos: 5000, img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop" },
  { id: "vale-50", nome: "Vale Desconto R$50", pontos: 1000, img: "https://images.unsplash.com/photo-1556740714-a8395b3bf30f?q=80&w=1200&auto=format&fit=crop" },
  { id: "massagem", nome: "Massagem Relaxante", pontos: 1500, img: "https://images.unsplash.com/photo-1600334129128-685c5582fd5c?q=80&w=1200&auto=format&fit=crop" },
  { id: "perfume", nome: "Perfume Exclusivo", pontos: 3500, img: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1200&auto=format&fit=crop" },
  { id: "curso-makeup", nome: "Curso de Automaquiagem", pontos: 2000, img: "https://images.unsplash.com/photo-1605618297881-267bf43bc0dd?q=80&w=1200&auto=format&fit=crop" }
];

const PLAN_POINTS = { cobre: 5, lite: 10, prata: 20, ouro: 50, diamante: 100, platina: 200 };

export default function HubPontos() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selecionado, setSelecionado] = useState(CATALOGO[0].id);
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [valorEq, setValorEq] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const [mostrarSelo, setMostrarSelo] = useState(false);
  const [bulkAtualizando, setBulkAtualizando] = useState(false);

  const itemSelecionado = useMemo(() => CATALOGO.find(i => i.id === selecionado) || CATALOGO[0], [selecionado]);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        setMostrarSelo(!!me?.mostrar_selo_clube);
      } catch (e) {
        setErro("Faça login para acessar.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-center">Carregando...</div>;
  const isAdmin = user?.role === 'admin';
  const tipo = isAdmin ? 'profissional' : user?.tipo_usuario;
  if (tipo !== 'profissional') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800">
            Esta área é exclusiva para profissionais. Faça login como profissional.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const plan = user?.plano_ativo || 'cobre';
  const pontosPorAtendimento = PLAN_POINTS[plan] ?? 5;

  const handleRegistrar = async () => {
    if (!clienteEmail || !clienteNome) { alert('Informe nome e email do cliente.'); return; }
    setSalvando(true);
    try {
      // 1) grava atendimento
      await base44.entities.AtendimentoPontos.create({
        profissional_email: user.email,
        cliente_nome: clienteNome,
        cliente_email: clienteEmail,
        origem: 'beautybanking',
        tratamento_id: itemSelecionado.id,
        tratamento_nome: itemSelecionado.nome,
        pontos_cobrados: itemSelecionado.pontos,
        valor_equivalente: valorEq || 0,
        status: 'concluido',
        data_atendimento: new Date().toISOString(),
      });
      // 2) credita pontos do plano ao profissional
      const novoTotal = (user.pontos_acumulados || 0) + pontosPorAtendimento;
      await base44.auth.updateMe({ pontos_acumulados: novoTotal });
      alert(`Atendimento registrado! Você ganhou +${pontosPorAtendimento} pontos do seu plano.`);
      // garantir sincronização com o contador global
      window.location.reload();
    } finally {
      setSalvando(false);
      setModalOpen(false);
    }
  };

  const handleToggleSelo = async (checked) => {
    setBulkAtualizando(true);
    try {
      // salva preferência do usuário
      await base44.auth.updateMe({ mostrar_selo_clube: checked });
      // atualiza todos os anúncios do usuário para refletir a preferência
      const meus = await base44.entities.Anuncio.filter({ created_by: user.email }, '-created_date', 1000);
      for (const a of meus) {
        try { await base44.entities.Anuncio.update(a.id, { exibir_selo_clube: checked }); } catch {}
      }
      alert('Preferência aplicada nas suas postagens.');
      window.location.reload();
    } finally {
      setBulkAtualizando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Badge className="bg-pink-600 text-white">Hub de Atendimento por Pontos</Badge>
            <h1 className="text-3xl font-bold mt-2">Receber clientes do BeautyBanking</h1>
            <p className="text-gray-600">Registre atendimentos dos tratamentos abaixo. O cliente usa pontos e você recebe o equivalente em saldo.</p>
          </div>
          <div className="flex items-center gap-3 bg-white border rounded-lg p-3">
            <Star className="w-4 h-4 text-amber-500"/>
            <div className="text-sm">Pontos por atendimento no seu plano: <span className="font-bold">+{pontosPorAtendimento}</span></div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-4 h-4 text-pink-600"/>
          <span className="text-sm">Selo do Clube nas minhas postagens</span>
          <Button size="sm" disabled={bulkAtualizando} onClick={() => handleToggleSelo(!mostrarSelo)} className={`${mostrarSelo ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-white text-pink-600 border border-pink-600 hover:bg-pink-50'}`}>
            {bulkAtualizando ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
            {mostrarSelo ? 'Ativo' : 'Desativado'}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CATALOGO.map(item => (
            <Card key={item.id} className="border shadow-md hover:shadow-lg transition-all">
              <div className="h-40 rounded-t-xl overflow-hidden bg-gray-100">
                <img src={item.img} alt={item.nome} className="w-full h-full object-cover"/>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1">{item.nome}</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-600 font-bold text-sm"><Star className="w-4 h-4"/> {item.pontos} pts</div>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700 text-white" onClick={() => { setSelecionado(item.id); setModalOpen(true); }}>Receber</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Atendimento</DialogTitle>
              <DialogDescription>Origem: BeautyBanking • Tratamento: {itemSelecionado.nome} ({itemSelecionado.pontos} pts)</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Nome do Cliente</label>
                  <Input value={clienteNome} onChange={e=>setClienteNome(e.target.value)} placeholder="Ex: Maria Silva"/>
                </div>
                <div>
                  <label className="text-sm">Email do Cliente</label>
                  <Input value={clienteEmail} onChange={e=>setClienteEmail(e.target.value)} placeholder="cliente@email.com"/>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm">Tratamento</label>
                  <Select value={selecionado} onValueChange={setSelecionado}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                      {CATALOGO.map(c => <SelectItem key={c.id} value={c.id}>{c.nome} • {c.pontos} pts</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm">Valor equivalente (R$) • opcional</label>
                  <Input type="number" value={valorEq} onChange={e=>setValorEq(parseFloat(e.target.value)||0)} placeholder="0,00"/>
                </div>
              </div>
              <Button onClick={handleRegistrar} disabled={salvando} className="mt-2">
                {salvando ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Check className="w-4 h-4 mr-2"/>}
                Finalizar Atendimento e Creditar Pontos do Plano
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}