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
import { createPageUrl } from "@/utils";

const PLANOS_INFO = {
  cobre: { nome: "Cobre", cor: "bg-orange-100 text-orange-800" },
  prata: { nome: "Prata", cor: "bg-gray-100 text-gray-800" },
  ouro: { nome: "Ouro", cor: "bg-yellow-100 text-yellow-800" },
  diamante: { nome: "Diamante", cor: "bg-blue-100 text-blue-800" },
  platina: { nome: "Platina", cor: "bg-purple-100 text-purple-800" }
};

const PLANOS_IMPULSIONAMENTO_INFO = {
  basico: { nome: "Básico", cor: "bg-blue-100 text-blue-800", duracao: 7, valor: 20 },
  intermediario: { nome: "Intermediário", cor: "bg-purple-100 text-purple-800", duracao: 14, valor: 35 },
  turbo: { nome: "Turbo", cor: "bg-orange-100 text-orange-800", duracao: 30, valor: 60 }
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
          navigate(createPageUrl("Inicio"));
          return;
        }
        setUser(userData);
      } catch (error) {
        alert("⚠️ Você precisa estar logado como administrador para acessar esta página.");
        navigate(createPageUrl("Inicio"));
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

  // Mutations para Planos
  const deletarSolicitacaoMutation = useMutation({
    mutationFn: (id) => base44.entities.SolicitacaoAtivacaoPlano.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-plano'] });
      setSucesso("Solicitação excluída com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
  });

  const deletarImpulsionamentoMutation = useMutation({
    mutationFn: (id) => base44.entities.SolicitacaoImpulsionamento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-impulsionamento'] });
      setSucesso("Solicitação de impulsionamento excluída!");
      setTimeout(() => setSucesso(null), 3000);
    },
  });

  const ativarPlanoMutation = useMutation({
    mutationFn: async ({ usuarioEmail, plano, solicitacaoId }) => {
      await base44.entities.User.update(usuarioEmail, { 
        plano_ativo: plano,
        data_adesao_plano: new Date().toISOString().split('T')[0]
      });
      
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
      setSucesso("Plano ativado com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
  });

  const trocarPlanoMutation = useMutation({
    mutationFn: async ({ email, plano }) => {
      await base44.entities.User.update(email, {
        plano_ativo: plano,
        data_adesao_plano: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      setSucesso("Plano atualizado!");
      setTimeout(() => setSucesso(null), 3000);
      setMostrarModalTrocarPlano(false);
      setPlanoSelecionadoUsuario(null);
      setNovoPlano("");
    },
  });

  // Mutations para Produtos
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

  const rejeitarPedidoMutation = useMutation({
    mutationFn: async (pedidoId) => {
      await base44.entities.PedidoProduto.update(pedidoId, { status_pedido: "cancelado" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-produtos'] });
      setSucesso("Pedido rejeitado!");
      setTimeout(() => setSucesso(null), 3000);
    },
  });

  // Handlers para Planos
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

  const handleAtivarImpulsionamento = async (solicitacao) => {
    if (!confirm(`Ativar impulsionamento ${PLANOS_IMPULSIONAMENTO_INFO[solicitacao.plano_impulsionamento]?.nome} para "${solicitacao.anuncio_titulo}"?`)) {
      return;
    }

    setProcessando(true);
    try {
      const dataInicio = new Date();
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + solicitacao.duracao_dias);

      await base44.entities.SolicitacaoImpulsionamento.update(solicitacao.id, {
        status: "ativado_admin",
        data_ativacao: dataInicio.toISOString(),
        data_inicio_impulsionamento: dataInicio.toISOString(),
        data_fim_impulsionamento: dataFim.toISOString()
      });

      await base44.entities.Anuncio.update(solicitacao.anuncio_id, {
        impulsionado: true,
        data_impulsionamento: dataInicio.toISOString()
      });

      await base44.entities.Notificacao.create({
        usuario_email: solicitacao.usuario_email,
        tipo: "impulsionamento_ativado",
        titulo: `🚀 Impulsionamento Ativado!`,
        mensagem: `Seu anúncio "${solicitacao.anuncio_titulo}" foi impulsionado! Válido até ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}.`,
        link_acao: `/detalhes-anuncio?id=${solicitacao.anuncio_id}`
      });

      queryClient.invalidateQueries({ queryKey: ['solicitacoes-impulsionamento'] });
      setSucesso("Impulsionamento ativado!");
      setTimeout(() => setSucesso(null), 3000);
    } catch (error) {
      setErro("Erro ao ativar impulsionamento");
      setTimeout(() => setErro(null), 3000);
    } finally {
      setProcessando(false);
    }
  };

  const handleTrocarPlano = (usuario) => {
    setPlanoSelecionadoUsuario(usuario);
    setNovoPlano(usuario.plano_ativo || 'cobre');
    setMostrarModalTrocarPlano(true);
  };

  const confirmarTrocaPlano = () => {
    if (!planoSelecionadoUsuario || !novoPlano) return;
    
    if (confirm(`Confirma a troca do plano de ${planoSelecionadoUsuario.full_name} para ${PLANOS_INFO[novoPlano]?.nome}?`)) {
      trocarPlanoMutation.mutate({
        email: planoSelecionadoUsuario.email,
        plano: novoPlano
      });
    }
  };

  const exportarSolicitacoesPDF = () => {
    const dataAtual = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Solicitações de Planos - Mapa da Estética</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #2C2C2C; border-bottom: 3px solid #F7D426; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #2C2C2C; color: #F7D426; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background: #f8f9fa; }
          .header-info { background: #FFF9E6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>📋 Solicitações de Planos</h1>
        <div class="header-info">
          <p><strong>Gerado em:</strong> ${dataAtual}</p>
          <p><strong>Total:</strong> ${solicitacoesPlanos.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Plano</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            ${solicitacoesPlanos.map(sol => `
              <tr>
                <td>${sol.usuario_nome}</td>
                <td>${sol.usuario_email}</td>
                <td>${PLANOS_INFO[sol.plano_solicitado]?.nome}</td>
                <td>${STATUS_INFO[sol.status]?.label}</td>
                <td>${sol.data_solicitacao ? format(new Date(sol.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Solicitacoes_Planos_${format(new Date(), "yyyy-MM-dd")}.html`;
    link.click();
    URL.revokeObjectURL(url);
    
    alert('Arquivo HTML baixado! Abra no navegador e salve como PDF (Ctrl+P).');
  };

  const enviarRelatorioWhatsApp = async () => {
    setEnviandoWhatsApp(true);
    
    try {
      const solicitacoesPendentes = solicitacoesPlanos.filter(s => 
        s.status === 'aguardando_confirmacao' || 
        s.status === 'confirmado_usuario' ||
        s.status === 'pagamento_pendente_mp'
      );

      let mensagem = `📋 *SOLICITAÇÕES DE PLANOS*\n`;
      mensagem += `Data: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}\n`;
      mensagem += `Total: ${solicitacoesPlanos.length}\n`;
      mensagem += `Pendentes: ${solicitacoesPendentes.length}\n\n`;

      if (solicitacoesPendentes.length > 0) {
        mensagem += `*🔔 PENDENTES:*\n\n`;
        solicitacoesPendentes.forEach((sol, i) => {
          mensagem += `${i + 1}. ${sol.usuario_nome}\n`;
          mensagem += `   📧 ${sol.usuario_email}\n`;
          mensagem += `   💎 ${PLANOS_INFO[sol.plano_solicitado]?.nome}\n\n`;
        });
      }

      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`;
      window.open(url, '_blank');
      setSucesso("Relatório WhatsApp aberto!");
    } finally {
      setEnviandoWhatsApp(false);
      setTimeout(() => setSucesso(null), 3000);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    !buscaProfissional || 
    u.full_name?.toLowerCase().includes(buscaProfissional.toLowerCase()) ||
    u.email?.toLowerCase().includes(buscaProfissional.toLowerCase())
  );

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

          {/* ============================================ */}
          {/* TAB CONTROLE DE PLANOS */}
          {/* ============================================ */}
          <TabsContent value="planos">
            <Tabs defaultValue="solicitacoes" className="w-full">
              <TabsList className="w-full mb-6 grid grid-cols-2 md:grid-cols-5 gap-1">
                <TabsTrigger value="solicitacoes" className="text-xs sm:text-sm">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Solicitações ({solicitacoesPlanos.length})
                </TabsTrigger>
                <TabsTrigger value="impulsionamento" className="text-xs sm:text-sm">
                  <Zap className="w-4 h-4 mr-2" />
                  Impulsionamento ({solicitacoesImpulsionamento.length})
                </TabsTrigger>
                <TabsTrigger value="profissionais" className="text-xs sm:text-sm">
                  <User className="w-4 h-4 mr-2" />
                  Profissionais ({usuarios.length})
                </TabsTrigger>
                <TabsTrigger value="clube" className="text-xs sm:text-sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Clube
                </TabsTrigger>
                <TabsTrigger value="patrocinadores" className="text-xs sm:text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Patrocinadores
                </TabsTrigger>
              </TabsList>

              {/* Sub-aba: Solicitações */}
              <TabsContent value="solicitacoes">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Solicitações de Planos</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={exportarSolicitacoesPDF}
                          variant="outline"
                          size="sm"
                          disabled={solicitacoesPlanos.length === 0}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </Button>
                        <Button
                          onClick={enviarRelatorioWhatsApp}
                          variant="outline"
                          size="sm"
                          disabled={enviandoWhatsApp}
                          className="border-green-300 text-green-700"
                        >
                          {enviandoWhatsApp ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4 mr-2" />
                          )}
                          WhatsApp
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingSolicitacoesPlanos ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                      </div>
                    ) : solicitacoesPlanos.length === 0 ? (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhuma solicitação encontrada</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Profissional</TableHead>
                              <TableHead>Plano</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {solicitacoesPlanos.map((sol) => {
                              const StatusIcon = STATUS_INFO[sol.status]?.icon || Clock;
                              return (
                                <TableRow key={sol.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{sol.usuario_nome}</p>
                                      <p className="text-sm text-gray-500">{sol.usuario_email}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={PLANOS_INFO[sol.plano_solicitado]?.cor}>
                                      {PLANOS_INFO[sol.plano_solicitado]?.nome}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={STATUS_INFO[sol.status]?.cor}>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {STATUS_INFO[sol.status]?.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {sol.data_solicitacao ? format(new Date(sol.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {sol.status !== "ativado_admin" && (
                                        <Button
                                          onClick={() => {
                                            setSolicitacaoSelecionada(sol);
                                            setMostrarModalAtivar(true);
                                          }}
                                          size="sm"
                                          className="bg-green-600 hover:bg-green-700"
                                        >
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          Ativar
                                        </Button>
                                      )}
                                      <Button
                                        onClick={() => {
                                          if (confirm(`Excluir solicitação de ${sol.usuario_nome}?`)) {
                                            deletarSolicitacaoMutation.mutate(sol.id);
                                          }
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="border-red-300 text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sub-aba: Impulsionamento */}
              <TabsContent value="impulsionamento">
                <Card>
                  <CardHeader>
                    <CardTitle>Solicitações de Impulsionamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingSolicitacoesImpulsionamento ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                      </div>
                    ) : solicitacoesImpulsionamento.length === 0 ? (
                      <div className="text-center py-12">
                        <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhuma solicitação encontrada</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Profissional</TableHead>
                              <TableHead>Anúncio</TableHead>
                              <TableHead>Plano</TableHead>
                              <TableHead>Duração/Valor</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Data</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {solicitacoesImpulsionamento.map((sol) => {
                              const StatusIcon = STATUS_INFO[sol.status]?.icon || Clock;
                              const planoInfo = PLANOS_IMPULSIONAMENTO_INFO[sol.plano_impulsionamento];
                              return (
                                <TableRow key={sol.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{sol.usuario_nome}</p>
                                      <p className="text-sm text-gray-500">{sol.usuario_email}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <p className="text-sm font-medium line-clamp-2">{sol.anuncio_titulo}</p>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={planoInfo?.cor}>
                                      <Zap className="w-3 h-3 mr-1" />
                                      {planoInfo?.nome}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p className="font-medium">{sol.duracao_dias} dias</p>
                                      <p className="text-gray-500">R$ {sol.valor?.toFixed(2)}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={STATUS_INFO[sol.status]?.cor}>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {STATUS_INFO[sol.status]?.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {sol.data_solicitacao ? format(new Date(sol.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {sol.status !== "ativado_admin" && (
                                        <Button
                                          onClick={() => handleAtivarImpulsionamento(sol)}
                                          size="sm"
                                          disabled={processando}
                                          className="bg-orange-600 hover:bg-orange-700"
                                        >
                                          <Zap className="w-4 h-4 mr-1" />
                                          Ativar
                                        </Button>
                                      )}
                                      <Button
                                        onClick={() => {
                                          if (confirm(`Excluir solicitação de impulsionamento?`)) {
                                            deletarImpulsionamentoMutation.mutate(sol.id);
                                          }
                                        }}
                                        size="sm"
                                        variant="outline"
                                        className="border-red-300 text-red-700"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sub-aba: Profissionais */}
              <TabsContent value="profissionais">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Lista de Profissionais</CardTitle>
                      <Input
                        placeholder="Buscar profissional..."
                        value={buscaProfissional}
                        onChange={(e) => setBuscaProfissional(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingUsuarios ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                      </div>
                    ) : usuariosFiltrados.length === 0 ? (
                      <div className="text-center py-12">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhum profissional encontrado</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Contato</TableHead>
                              <TableHead>Localização</TableHead>
                              <TableHead>Plano Ativo</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usuariosFiltrados.map((usuario) => (
                              <TableRow key={usuario.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{usuario.full_name}</p>
                                    <p className="text-sm text-gray-500">{usuario.email}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <p>{usuario.telefone || "-"}</p>
                                    {usuario.whatsapp && (
                                      <p className="text-green-600">WhatsApp: {usuario.whatsapp}</p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    <p>{usuario.cidade || "-"}</p>
                                    <p className="text-gray-500">{usuario.estado || "-"}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={PLANOS_INFO[usuario.plano_ativo || 'cobre']?.cor}>
                                    {PLANOS_INFO[usuario.plano_ativo || 'cobre']?.nome}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    onClick={() => handleTrocarPlano(usuario)}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                  >
                                    <CreditCard className="w-4 h-4 mr-1" />
                                    Trocar Plano
                                  </Button>
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

              {/* Sub-aba: Clube */}
              <TabsContent value="clube">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Crown className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Clube da Beleza - Em Desenvolvimento
                    </h3>
                    <p className="text-gray-600">
                      Esta seção exibirá os planos do Clube da Beleza
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sub-aba: Patrocinadores */}
              <TabsContent value="patrocinadores">
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Patrocinadores - Em Desenvolvimento
                    </h3>
                    <p className="text-gray-600">
                      Esta seção exibirá os patrocinadores da plataforma
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* ============================================ */}
          {/* TAB CONTROLE DE PRODUTOS */}
          {/* ============================================ */}
          <TabsContent value="produtos">
            {/* Stats Cards */}
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
                      <p className="text-sm text-gray-600">Clientes</p>
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

            {/* Filtros */}
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
                  <Button
                    onClick={() => {
                      const mensagem = `📊 *RELATÓRIO DE PEDIDOS*\n\nTotal: ${pedidosFiltrados.length}\nPendentes: ${pedidosPendentes.length}\nValor: R$ ${pedidosFiltrados.reduce((s, p) => s + (p.valor_total || 0), 0).toFixed(2)}\n\nGerado em ${format(new Date(), "dd/MM/yyyy HH:mm")}`;
                      window.open(`https://wa.me/5531972595643?text=${encodeURIComponent(mensagem)}`, '_blank');
                    }}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
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
                              {format(new Date(pedido.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            </TableCell>
                            <TableCell className="text-sm">{pedido.usuario_email}</TableCell>
                            <TableCell>
                              <p className="font-medium text-sm">{pedido.produto_nome}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {pedido.tipo === 'servico' ? 'Serviço' : 'Produto'}
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
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    onClick={() => aprovarPedidoMutation.mutate(pedido.id)}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Aprovar
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      if (confirm("Rejeitar este pedido?")) {
                                        rejeitarPedidoMutation.mutate(pedido.id);
                                      }
                                    }}
                                    size="sm"
                                    variant="outline"
                                    className="border-red-300 text-red-700"
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Rejeitar
                                  </Button>
                                </div>
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
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="font-medium">{solicitacaoSelecionada?.usuario_email}</span>
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
              <Button 
                variant="outline" 
                onClick={() => {
                  setMostrarModalAtivar(false);
                  setSolicitacaoSelecionada(null);
                  setObservacoes("");
                }}
                disabled={processando}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAtivarPlano}
                disabled={processando}
                className="bg-green-600 hover:bg-green-700"
              >
                {processando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Trocar Plano */}
        <Dialog open={mostrarModalTrocarPlano} onOpenChange={setMostrarModalTrocarPlano}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Trocar Plano do Profissional</DialogTitle>
              <DialogDescription>
                {planoSelecionadoUsuario && (
                  <>Altere o plano de <strong>{planoSelecionadoUsuario.full_name}</strong></>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Selecione o Novo Plano</Label>
                <Select value={novoPlano} onValueChange={setNovoPlano}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cobre">COBRE (Grátis)</SelectItem>
                    <SelectItem value="prata">PRATA (R$ 99/mês)</SelectItem>
                    <SelectItem value="ouro">OURO (R$ 197/mês)</SelectItem>
                    <SelectItem value="diamante">DIAMANTE (R$ 297/mês)</SelectItem>
                    <SelectItem value="platina">PLATINA (R$ 997/mês)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {planoSelecionadoUsuario && (
                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Plano atual:</strong> {PLANOS_INFO[planoSelecionadoUsuario.plano_ativo || 'cobre']?.nome}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalTrocarPlano(false);
                  setPlanoSelecionadoUsuario(null);
                  setNovoPlano("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarTrocaPlano}
                disabled={trocarPlanoMutation.isPending || !novoPlano}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {trocarPlanoMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}