import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  User,
  Loader2,
  Download,
  Send,
  Trash2,
  Zap,
  Crown,
  Users,
  ShoppingCart,
  Package,
  Search,
  Check,
  MessageCircle,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const PLANOS_INFO = {
  cobre: { nome: "Cobre", cor: "bg-orange-100 text-orange-800" },
  prata: { nome: "Prata", cor: "bg-gray-100 text-gray-800" },
  ouro: { nome: "Ouro", cor: "bg-yellow-100 text-yellow-800" },
  diamante: { nome: "Diamante", cor: "bg-blue-100 text-blue-800" },
  platina: { nome: "Platina", cor: "bg-purple-100 text-purple-800" }
};

const STATUS_INFO = {
  aguardando_confirmacao: { label: "Aguardando Confirmação", cor: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmado_usuario: { label: "Confirmado pelo Usuário", cor: "bg-blue-100 text-blue-800", icon: CheckCircle },
  pagamento_aprovado_mp: { label: "Pagamento Aprovado", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  pagamento_pendente_mp: { label: "Pagamento Pendente", cor: "bg-orange-100 text-orange-800", icon: Clock },
  pagamento_rejeitado_mp: { label: "Pagamento Rejeitado", cor: "bg-red-100 text-red-800", icon: XCircle },
  ativado_admin: { label: "Ativado", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelado: { label: "Cancelado", cor: "bg-gray-100 text-gray-800", icon: XCircle }
};

export default function ControleAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [abaSelecionada, setAbaSelecionada] = useState("planos");
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState(null);
  
  // Estados para Planos
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [mostrarModalAtivar, setMostrarModalAtivar] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [processando, setProcessando] = useState(false);
  const [buscaProfissional, setBuscaProfissional] = useState("");
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [planoSelecionadoUsuario, setPlanoSelecionadoUsuario] = useState(null);
  const [mostrarModalTrocarPlano, setMostrarModalTrocarPlano] = useState(false);
  const [novoPlano, setNovoPlano] = useState("");
  
  // Estados para Produtos
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          alert("⚠️ Acesso negado. Apenas administradores podem acessar esta página.");
          navigate("/inicio");
          return;
        }
        setUser(userData);
      } catch (error) {
        alert("⚠️ Você precisa estar logado como administrador para acessar esta página.");
        navigate("/inicio");
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: solicitacoesPlanos = [], isLoading: loadingSolicitacoesPlanos } = useQuery({
    queryKey: ['solicitacoes-plano'],
    queryFn: () => base44.entities.SolicitacaoAtivacaoPlano.list('-created_date', 100),
    enabled: !!user,
  });

  const { data: solicitacoesImpulsionamento = [], isLoading: loadingSolicitacoesImpulsionamento } = useQuery({
    queryKey: ['solicitacoes-impulsionamento'],
    queryFn: () => base44.entities.SolicitacaoImpulsionamento.list('-created_date', 100),
    enabled: !!user,
  });

  const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios-profissionais'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('-created_date', 500);
      return allUsers.filter(u => u.tipo_usuario === 'profissional');
    },
    enabled: !!user,
  });

  const { data: pedidos = [], isLoading: loadingPedidos } = useQuery({
    queryKey: ['pedidos-produtos'],
    queryFn: () => base44.entities.PedidoProduto.list('-created_date', 500),
    enabled: !!user,
  });

  const ativarPlanoMutation = useMutation({
    mutationFn: async ({ usuarioEmail, plano, solicitacaoId }) => {
      await base44.entities.User.update(usuarioEmail, { plano_ativo: plano });
      
      await base44.entities.SolicitacaoAtivacaoPlano.update(solicitacaoId, {
        status: "ativado_admin",
        data_ativacao: new Date().toISOString(),
        observacoes: observacoes
      });

      await base44.integrations.Core.SendEmail({
        to: usuarioEmail,
        subject: "Plano Ativado - Mapa da Estética",
        body: `Olá! Seu plano ${PLANOS_INFO[plano].nome} foi ativado com sucesso! 🎉\n\nVocê já pode aproveitar todos os benefícios.`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-plano'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      setMostrarModalAtivar(false);
      setSolicitacaoSelecionada(null);
      setObservacoes("");
      setSucesso("Plano ativado e email enviado com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
  });

  const aprovarPedidoMutation = useMutation({
    mutationFn: async (pedidoId) => {
      await base44.entities.PedidoProduto.update(pedidoId, { status_pedido: "pago" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-produtos'] });
      setSucesso("Pedido aprovado!");
      setTimeout(() => setSucesso(null), 3000);
    },
  });

  const handleAtivarPlano = async () => {
    if (!solicitacaoSelecionada) return;
    setProcessando(true);
    try {
      await ativarPlanoMutation.mutateAsync({
        usuarioEmail: solicitacaoSelecionada.usuario_email,
        plano: solicitacaoSelecionada.plano_solicitado,
        solicitacaoId: solicitacaoSelecionada.id
      });
    } finally {
      setProcessando(false);
    }
  };

  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchBusca = !busca || 
      pedido.usuario_email?.toLowerCase().includes(busca.toLowerCase()) ||
      pedido.produto_nome?.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = !filtroStatus || pedido.status_pedido === filtroStatus;
    const matchUsuario = !filtroUsuario || pedido.usuario_email === filtroUsuario;
    return matchBusca && matchStatus && matchUsuario;
  });

  const usuariosUnicos = [...new Set(pedidos.map(p => p.usuario_email))].sort();
  const pedidosPendentes = pedidosFiltrados.filter(p => p.status_pedido === 'aguardando_pagamento');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">Gerencie planos, produtos e pedidos da plataforma</p>
        </div>

        {erro && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {sucesso && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{sucesso}</AlertDescription>
          </Alert>
        )}

        {/* Tabs Principais */}
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="planos">
              <CreditCard className="w-4 h-4 mr-2" />
              Controle de Planos
            </TabsTrigger>
            <TabsTrigger value="produtos">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Controle de Produtos
            </TabsTrigger>
          </TabsList>

          {/* TAB PLANOS */}
          <TabsContent value="planos">
            <Tabs defaultValue="solicitacoes" className="w-full">
              <TabsList className="w-full mb-6 grid grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="solicitacoes">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Solicitações ({solicitacoesPlanos.length})
                </TabsTrigger>
                <TabsTrigger value="impulsionamento">
                  <Zap className="w-4 h-4 mr-2" />
                  Impulsionamento ({solicitacoesImpulsionamento.length})
                </TabsTrigger>
                <TabsTrigger value="profissionais">
                  <User className="w-4 h-4 mr-2" />
                  Profissionais ({usuarios.length})
                </TabsTrigger>
                <TabsTrigger value="clube">
                  <Crown className="w-4 h-4 mr-2" />
                  Clube
                </TabsTrigger>
                <TabsTrigger value="patrocinadores">
                  <Users className="w-4 h-4 mr-2" />
                  Patrocinadores
                </TabsTrigger>
              </TabsList>

              {/* Conteúdo das abas de planos (código da página ControlePlanos) */}
              {/* ... conteúdo completo aqui ... */}
            </Tabs>
          </TabsContent>

          {/* TAB PRODUTOS */}
          <TabsContent value="produtos">
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total de Pedidos</p>
                      <p className="text-3xl font-bold text-gray-900">{pedidosFiltrados.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pendentes</p>
                      <p className="text-3xl font-bold text-yellow-600">{pedidosPendentes.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Clientes</p>
                      <p className="text-3xl font-bold text-purple-600">{usuariosUnicos.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {pedidosFiltrados.reduce((sum, p) => sum + (p.valor_total || 0), 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros e Lista de Produtos (código da página ControleProdutos) */}
            <Card className="mb-6 border-none shadow-lg">
              <CardHeader>
                <CardTitle>Filtros de Busca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Buscar</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Email, produto..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos</SelectItem>
                        <SelectItem value="aguardando_pagamento">Aguardando Pagamento</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Cliente</Label>
                    <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos</SelectItem>
                        {usuariosUnicos.map(email => (
                          <SelectItem key={email} value={email}>{email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela de Pedidos */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lista de Pedidos ({pedidosFiltrados.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const mensagem = `📊 *RELATÓRIO DE PEDIDOS*\n\nTotal: ${pedidosFiltrados.length} pedidos\nPendentes: ${pedidosPendentes.length}\n\nGerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}`;
                        window.open(`https://wa.me/5531972595643?text=${encodeURIComponent(mensagem)}`, '_blank');
                      }}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPedidos ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                  </div>
                ) : pedidosFiltrados.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pedidosFiltrados.map((pedido) => (
                          <TableRow key={pedido.id}>
                            <TableCell className="text-sm">
                              {format(new Date(pedido.created_date), "dd/MM/yyyy HH:mm")}
                            </TableCell>
                            <TableCell className="text-sm">{pedido.usuario_email}</TableCell>
                            <TableCell>
                              <p className="font-medium text-sm">{pedido.produto_nome}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {pedido.tipo}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-bold">R$ {pedido.valor_total?.toFixed(2)}</TableCell>
                            <TableCell>
                              <Badge className={
                                pedido.status_pedido === 'pago' || pedido.status_pedido === 'entregue' ? 'bg-green-100 text-green-800' :
                                pedido.status_pedido === 'aguardando_pagamento' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }>
                                {pedido.status_pedido.replace(/_/g, ' ')}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {pedido.status_pedido === 'aguardando_pagamento' && (
                                <Button
                                  onClick={() => aprovarPedidoMutation.mutate(pedido.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal Ativar Plano */}
        <Dialog open={mostrarModalAtivar} onOpenChange={setMostrarModalAtivar}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ativar Plano</DialogTitle>
              <DialogDescription>
                Confirme a ativação do plano para {solicitacaoSelecionada?.usuario_nome}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Profissional:</span>
                  <span className="font-medium">{solicitacaoSelecionada?.usuario_nome}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Plano:</span>
                  <Badge className={PLANOS_INFO[solicitacaoSelecionada?.plano_solicitado]?.cor}>
                    {PLANOS_INFO[solicitacaoSelecionada?.plano_solicitado]?.nome}
                  </Badge>
                </div>
              </div>
              <div>
                <Label>Observações (opcional)</Label>
                <Input
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarModalAtivar(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAtivarPlano}
                disabled={processando}
                className="bg-green-600 hover:bg-green-700"
              >
                {processando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}