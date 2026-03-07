import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, Check, ArrowRight, Shield, Upload, Loader2, MessageCircle } from "lucide-react";
import CheckinCalendario from "../components/hub/CheckinCalendario";
import JogosPontos from "../components/hub/JogosPontos";
import { Slider } from "@/components/ui/slider";
import ChatPedido from "../components/chat/ChatPedido";

const CATALOGO = [];

const catalogo = React.useMemo(() => {
  return (produtosMeus || []).map(p => ({
    id: p.id,
    nome: p.nome,
    pontos: (typeof p.pontos_necessarios === 'number' && p.pontos_necessarios > 0)
      ? p.pontos_necessarios
      : (typeof p.preco === 'number' && p.preco > 0 ? Math.max(1, Math.round(p.preco)) : 100),
    img: Array.isArray(p.imagens) ? p.imagens[0] : undefined
  }));
}, [produtosMeus]);

const PLAN_POINTS = { cobre: 5, lite: 10, prata: 20, ouro: 50, diamante: 100, platina: 200 };

export default function HubPontos() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selecionado, setSelecionado] = useState('');
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [valorEq, setValorEq] = useState(0);
  const [salvando, setSalvando] = useState(false);

  const [mostrarSelo, setMostrarSelo] = useState(false);
  const [pesquisa, setPesquisa] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [pontosRange, setPontosRange] = useState([0, 50000]);
  const [locais, setLocais] = useState([]);
  const [modalidade, setModalidade] = useState("entrega");
  const [localSelecionado, setLocalSelecionado] = useState("");
  const [publicoPlano, setPublicoPlano] = useState("free");

  // Filtragem do catálogo (sempre declarar hooks antes de qualquer return)
  const catalogoFiltrado = React.useMemo(() => {
    return catalogo.filter(item => {
      const nome = (item.nome || '').toLowerCase();
      const tipoCalc = /massagem|spa|consulta|sessão|reflexologia|shiatsu/i.test(nome)
        ? 'servicos'
        : /curso|workshop|convenção|evento/i.test(nome)
        ? 'eventos'
        : /dermafellow/i.test(nome)
        ? 'dermafellow'
        : 'produtos';
      const matchBusca = !pesquisa || nome.includes(pesquisa.toLowerCase());
      const matchTipo = filtroTipo === 'todos' || filtroTipo === tipoCalc;
      const matchPontos = item.pontos >= pontosRange[0] && item.pontos <= pontosRange[1];
      return matchBusca && matchTipo && matchPontos;
    });
  }, [pesquisa, filtroTipo, pontosRange, catalogo]);
  const [bulkAtualizando, setBulkAtualizando] = useState(false);
  const [pedidos, setPedidos] = useState([]);
  const [produtosMeus, setProdutosMeus] = useState([]);
  const [pedidoChatId, setPedidoChatId] = useState(null);
  const [modalNovoItem, setModalNovoItem] = useState(false);
  const [novoItem, setNovoItem] = useState({ tipo: 'servico', nome: '', descricao: '', categoria: 'Serviços', pontos_necessarios: 1000, estoque: 1, tipo_oferta: 'sob_demanda' });

  const itemSelecionado = useMemo(() => {
  const lista = catalogo;
  const found = lista.find(i => i.id === selecionado);
  return found || lista[0] || { id: '', nome: '', pontos: 0 };
}, [selecionado, catalogo]);

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

  useEffect(() => {
    if (!user?.email) return;
    (async () => {
      const meus = await base44.entities.Produto.filter({ created_by: user.email }, '-created_date', 200);
      setProdutosMeus(meus);
      const all = await base44.entities.PedidoProduto.list('-created_date', 200);
      setPedidos(all);
      // Locais do profissional a partir dos anúncios cadastrados
      try {
        const anuncios = await base44.entities.Anuncio.filter({ created_by: user.email }, '-created_date', 200);
        const locaisUnicos = Array.from(new Set(anuncios.map(a => [a.cidade, a.estado].filter(Boolean).join(' - ')).filter(Boolean)));
        setLocais(locaisUnicos);
      } catch {}
    })();
    const unsub = base44.entities.PedidoProduto.subscribe((e) => {
      setPedidos(prev => [e.data, ...prev].slice(0,200));
    });
    return () => unsub?.();
  }, [user]);

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

  const awardPoints = async (pts) => {
    const atualSaldo = user?.pontos_saldo ?? user?.pontos_acumulados ?? 0;
    const atualAcum = user?.pontos_acumulados ?? 0;
    await base44.auth.updateMe({ pontos_saldo: atualSaldo + pts, pontos_acumulados: atualAcum + pts });
    try { const me = await base44.auth.me(); setUser(me); } catch {}
  };

  const handleCheckinHoje = async () => {
    const hoje = new Date().toISOString().slice(0,10);
    const lista = Array.isArray(user?.wellness_checkins) ? [...user.wellness_checkins] : [];
    if (lista.includes(hoje)) return;
    lista.push(hoje);
    await base44.auth.updateMe({ wellness_checkins: lista });
    await awardPoints(5);
    alert('Check-in realizado! +5 pontos.');
  };

  const handleRegistrar = async () => {
    if (!clienteEmail || !clienteNome) { alert('Informe nome e email do cliente.'); return; }
    setSalvando(true);
    try {
      // 1) grava atendimento
      await base44.entities.AtendimentoPontos.create({
       profissional_email: user.email,
       cliente_nome: clienteNome,
       cliente_email: clienteEmail,
       origem: 'manual',
       tratamento_id: itemSelecionado.id,
       tratamento_nome: itemSelecionado.nome,
       pontos_cobrados: itemSelecionado.pontos,
       valor_equivalente: valorEq || 0,
       status: 'concluido',
       data_atendimento: new Date().toISOString(),
       observacoes: `modalidade=${modalidade}; local=${localSelecionado||'n/d'}; publico=${publicoPlano}`,
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
            <h1 className="text-3xl font-bold mt-2">Hub de Pontos — Receber clientes</h1>
            <p className="text-gray-600">Registre atendimentos dos tratamentos abaixo. O cliente usa pontos e você recebe o equivalente em saldo.</p>
          </div>
          <div className="flex items-center gap-3 bg-white border rounded-lg p-3">
            <Button size="sm" onClick={()=>window.location.href=createPageUrl('Planos')} className="bg-amber-500 hover:bg-amber-600 text-white">Quero aumentar meus pontos por atendimento</Button>
            <Star className="w-4 h-4 text-amber-500"/>
            <div className="text-sm">Pontos por atendimento no seu plano: <span className="font-bold">+{pontosPorAtendimento}</span></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <CheckinCalendario user={user} onCheckin={handleCheckinHoje} />
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold mb-2">Como funciona o Hub de Pontos?</h3>
            <p className="text-sm text-gray-600">
              Registre atendimentos e conceda recompensas em pontos para seus clientes. O calendário à esquerda permite marcar seu check-in diário e acompanhar sua constância.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
         <div className="grid md:grid-cols-2 gap-3 w-full">
           <Input placeholder="Pesquisar no catálogo..." value={pesquisa} onChange={(e)=>setPesquisa(e.target.value)} />
           <Select value={filtroTipo} onValueChange={setFiltroTipo}>
             <SelectTrigger><SelectValue placeholder="Filtrar" /></SelectTrigger>
             <SelectContent>
               <SelectItem value="todos">todos</SelectItem>
               <SelectItem value="servicos">serviços</SelectItem>
               <SelectItem value="produtos">produtos</SelectItem>
               <SelectItem value="eventos">eventos/convenções</SelectItem>
               <SelectItem value="dermafellow">dermafellow</SelectItem>
             </SelectContent>
           </Select>
         </div>
         <div className="hidden md:flex items-center gap-2">
           <Button size="sm" variant="outline" onClick={()=>setModalNovoItem(true)} className="h-9">+ Adicionar item à Loja</Button>
         </div>
         <div className="w-full md:w-auto md:min-w-[280px]">
           <label className="text-xs text-gray-600">Faixa de pontos</label>
           <Select onValueChange={(v)=>{
             const mapa={
               '0-100':[0,100],
               '100-500':[100,500],
               '500-1k':[500,1000],
               '1k-2k':[1000,2000],
               '2k-5k':[2000,5000],
               '5k-10k':[5000,10000],
               '10k-20k':[10000,20000],
               '20k-50k':[20000,50000]
             };
             setPontosRange(mapa[v]);
           }}>
             <SelectTrigger className="mt-2"><SelectValue placeholder="Selecione"/></SelectTrigger>
             <SelectContent>
               <SelectItem value="0-100">0–100</SelectItem>
               <SelectItem value="100-500">100–500</SelectItem>
               <SelectItem value="500-1k">500–1.000</SelectItem>
               <SelectItem value="1k-2k">1.000–2.000</SelectItem>
               <SelectItem value="2k-5k">2.000–5.000</SelectItem>
               <SelectItem value="5k-10k">5.000–10.000</SelectItem>
               <SelectItem value="10k-20k">10.000–20.000</SelectItem>
               <SelectItem value="20k-50k">20.000–50.000</SelectItem>
             </SelectContent>
           </Select>
           <div className="text-xs text-gray-500 mt-1">{pontosRange[0]} pts — {pontosRange[1]} pts</div>
         </div>
          <Shield className="w-4 h-4 text-pink-600"/>
          <span className="text-sm">Selo do Clube nas minhas postagens</span>
          <Button size="sm" disabled={bulkAtualizando} onClick={() => handleToggleSelo(!mostrarSelo)} className={`${mostrarSelo ? 'bg-pink-600 text-white hover:bg-pink-700' : 'bg-white text-pink-600 border border-pink-600 hover:bg-pink-50'}`}>
            {bulkAtualizando ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
            {mostrarSelo ? 'Ativo' : 'Desativado'}
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {/* TODO: aplicar filtro acima no catálogo ao conectar categorias */}
          {catalogoFiltrado.map(item => (
            <Card key={item.id} className="border shadow-md hover:shadow-lg transition-all">
              <div className="h-40 rounded-t-xl overflow-hidden bg-gray-100">
                <img src={item.img} alt={item.nome} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'; }} />
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
              <DialogDescription>Origem: Loja de Pontos • Tratamento: {itemSelecionado.nome} ({itemSelecionado.pontos} pts)</DialogDescription>
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

        {/* Pedidos da Loja de Pontos */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-2">Pedidos da Loja de Pontos</h2>
          <p className="text-gray-600 mb-4">Aceite pedidos de produtos que você cadastrou e converse com o cliente pelo chat.</p>
          <div className="grid md:grid-cols-2 gap-4">
           <Alert className="bg-blue-50 border-blue-200 mb-4">
             <AlertDescription className="text-blue-900 text-sm">
               Defina modalidade, local e público mínimo. Admins podem cadastrar itens especiais (serviços, produtos, eventos, convenções, dermafellow).
             </AlertDescription>
           </Alert>
            {(() => {
              const ids = new Set(produtosMeus.map(p => p.id));
              const mapa = Object.fromEntries(produtosMeus.map(p => [p.id, p]));
              const meusPedidos = pedidos.filter(p => ids.has(p.produto_id));
              if (meusPedidos.length === 0) return <div className="text-gray-500">Nenhum pedido para seus produtos ainda.</div>;
              return meusPedidos.map(p => (
                <Card key={p.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">{p.produto_nome}</h3>
                        <div className="text-xs text-gray-500">Qtd: {p.quantidade} • Cliente: {p.usuario_email}</div>
                      </div>
                      <Badge variant="outline">{p.status_pedido}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={async ()=>{ await base44.entities.PedidoProduto.update(p.id, { status_pedido: 'processando' }); }} className="bg-green-600 hover:bg-green-700 text-white">Aceitar</Button>
                      <Button size="sm" variant="outline" onClick={async ()=>{ await base44.entities.PedidoProduto.update(p.id, { status_pedido: 'cancelado' }); }}>Recusar</Button>
                      <Button size="sm" variant="outline" onClick={()=>setPedidoChatId(p.id)} className="flex items-center gap-1"><MessageCircle className="w-4 h-4"/> Chat</Button>
                    </div>
                  </CardContent>
                </Card>
              ));
            })()}
          </div>
        </div>

        {/* Modal: Novo item Loja */}
        <Dialog open={modalNovoItem} onOpenChange={setModalNovoItem}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Adicionar item à Loja de Pontos</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Tipo</label>
                  <Select value={novoItem.tipo} onValueChange={(v)=>setNovoItem(prev=>({...prev, tipo: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="servico">Serviço</SelectItem>
                      <SelectItem value="produto">Produto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-gray-600">Categoria</label>
                  <Select value={novoItem.categoria} onValueChange={(v)=>setNovoItem(prev=>({...prev, categoria: v}))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Serviços">Serviços</SelectItem>
                      <SelectItem value="Produtos para Pacientes">Produtos para Pacientes</SelectItem>
                      <SelectItem value="Outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-gray-600">Nome</label>
                <Input value={novoItem.nome} onChange={(e)=>setNovoItem(prev=>({...prev, nome: e.target.value}))} />
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-gray-600">Descrição</label>
                <Input value={novoItem.descricao} onChange={(e)=>setNovoItem(prev=>({...prev, descricao: e.target.value}))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600">Pontos necessários</label>
                  <Input type="number" value={novoItem.pontos_necessarios} onChange={(e)=>setNovoItem(prev=>({...prev, pontos_necessarios: parseInt(e.target.value)||0}))} />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Estoque</label>
                  <Input type="number" value={novoItem.estoque} onChange={(e)=>setNovoItem(prev=>({...prev, estoque: parseInt(e.target.value)||0}))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-600">Formato de oferta</label>
                <Select value={novoItem.tipo_oferta} onValueChange={(v)=>setNovoItem(prev=>({...prev, tipo_oferta: v}))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sob_demanda">Sob demanda</SelectItem>
                    <SelectItem value="unidade">Unidade</SelectItem>
                    <SelectItem value="lote">Lote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="outline" onClick={()=>setModalNovoItem(false)}>Cancelar</Button>
                <Button onClick={async ()=>{
                  if (!novoItem.nome || !novoItem.descricao) { alert('Preencha nome e descrição'); return; }
                  await base44.entities.Produto.create({
                    tipo: novoItem.tipo,
                    nome: novoItem.nome,
                    descricao: novoItem.descricao,
                    categoria: novoItem.categoria,
                    pontos_necessarios: Number(novoItem.pontos_necessarios)||0,
                    estoque: Number(novoItem.estoque)||0,
                    tipo_oferta: novoItem.tipo_oferta,
                    aceitar_orcamento: novoItem.tipo_oferta === 'sob_demanda',
                    status: 'ativo'
                  });
                  alert('Item criado!');
                  setModalNovoItem(false);
                  window.location.reload();
                }}>Salvar</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Chat Modal */}
        <Dialog open={!!pedidoChatId} onOpenChange={(o)=>!o && setPedidoChatId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chat do Pedido</DialogTitle>
            </DialogHeader>
            {pedidoChatId && <ChatPedido pedidoId={pedidoChatId} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}