
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
  Image as ImageIcon,
  Newspaper,
  Eye,
  Phone,
  Mail,
  ExternalLink,
  Edit,
  Star,
  DollarSign,
  RefreshCw,
  Bell,
  Calendar as CalendarIcon,
  Rocket,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";

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

  // Estados para Banners e Posts
  const [bannerSelecionado, setBannerSelecionado] = useState(null);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [mostrarDetalhesBanner, setMostrarDetalhesBanner] = useState(false);
  const [mostrarDetalhesPost, setMostrarDetalhesPost] = useState(false);
  const [buscaBanner, setBuscaBanner] = useState("");
  const [filtroStatusBanner, setFiltroStatusBanner] = useState("");
  const [buscaPost, setBuscaPost] = useState("");
  const [filtroStatusPost, setFiltroStatusPost] = useState("");

  // NOVOS Estados
  const [usuarioEditandoPontos, setUsuarioEditandoPontos] = useState(null);
  const [mostrarModalPontos, setMostrarModalPontos] = useState(false);
  const [novosPontos, setNovosPontos] = useState(0);
  const [novosBeautyCoins, setNovosBeautyCoins] = useState(0);

  const [mostrarTutorialDrBeleza, setMostrarTutorialDrBeleza] = useState(false);
  
  // NOVOS Estados para Atualizações
  const [mostrarModalAtualizacao, setMostrarModalAtualizacao] = useState(false);
  const [tituloAtualizacao, setTituloAtualizacao] = useState("");
  const [descricaoAtualizacao, setDescricaoAtualizacao] = useState("");
  const [conteudoAtualizacao, setConteudoAtualizacao] = useState("");
  const [dataAgendamento, setDataAgendamento] = useState(null);
  const [enviandoAtualizacao, setEnviandoAtualizacao] = useState(false);
  const [mostrarCarregamentoAtualizacao, setMostrarCarregamentoAtualizacao] = useState(false);
  
  // NOVO: Estados para Agendamento de Atualização Forçada
  const [mostrarModalAgendarForcada, setMostrarModalAgendarForcada] = useState(false);
  const [dataAgendamentoForcada, setDataAgendamentoForcada] = useState(null);
  const [tituloAgendamentoForcada, setTituloAgendamentoForcada] = useState("");
  const [descricaoAgendamentoForcada, setDescricaoAgendamentoForcada] = useState("");

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
      return allUsers.filter(u => u.tipo_usuario === 'profissional' || u.tipo_usuario === 'admin');
    },
    enabled: !!user,
  });

  const { data: pedidos = [], isLoading: loadingPedidos } = useQuery({
    queryKey: ['pedidos-produtos'],
    queryFn: () => base44.entities.PedidoProduto.list('-created_date', 500),
    enabled: !!user,
  });

  const { data: banners = [], isLoading: loadingBanners } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => base44.entities.Banner.list('-created_date', 200),
    enabled: !!user,
  });

  const { data: posts = [], isLoading: loadingPosts } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => base44.entities.ArtigoBlog.list('-created_date', 200),
    enabled: !!user,
  });

  const { data: todosUsuarios = [], isLoading: loadingTodosUsuarios } = useQuery({
    queryKey: ['todos-usuarios'],
    queryFn: async () => {
      return await base44.entities.User.list('-created_date', 1000);
    },
    enabled: !!user,
  });

  const { data: atualizacoes = [], isLoading: loadingAtualizacoes } = useQuery({
    queryKey: ['atualizacoes-sistema'],
    queryFn: () => base44.entities.Novidade.list('-created_date', 50),
    enabled: !!user,
  });

  const { data: agendamentos = [], isLoading: loadingAgendamentos } = useQuery({
    queryKey: ['agendamentos-atualizacao'],
    queryFn: async () => {
      return await base44.entities.AgendamentoAtualizacao.filter(
        { executado: false },
        'data_agendada',
        50
      );
    },
    enabled: !!user,
    refetchInterval: 60000,
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

  // NOVAS Mutations
  const deletarBannerMutation = useMutation({
    mutationFn: (id) => base44.entities.Banner.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setSucesso("Banner excluído!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      setErro("Erro ao excluir banner: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  });

  const atualizarStatusBannerMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.Banner.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setSucesso("Status do banner atualizado!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      setErro("Erro ao atualizar status do banner: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  });

  const deletarPostMutation = useMutation({
    mutationFn: (id) => base44.entities.ArtigoBlog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setSucesso("Post excluído!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      setErro("Erro ao excluir post: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  });

  const atualizarStatusPostMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.ArtigoBlog.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      setSucesso("Status do post atualizado!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      setErro("Erro ao atualizar status do post: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  });

  const excluirProfissionalMutation = useMutation({
    mutationFn: async (email) => {
      // Não podemos deletar usuários, então convertemos para paciente
      await base44.entities.User.update(email, {
        tipo_usuario: 'paciente',
        plano_ativo: 'cobre',
        plano_patrocinador: 'nenhum'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] }); // Invalidate for other tabs too
      setSucesso("Profissional removido! Conta convertida para paciente.");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      setErro("Erro ao remover profissional: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  });

  const atualizarPontosMutation = useMutation({
    mutationFn: async ({ email, pontos, beautyCoins }) => {
      await base44.entities.User.update(email, {
        pontos_acumulados: pontos,
        beauty_coins: beautyCoins
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      setMostrarModalPontos(false);
      setUsuarioEditandoPontos(null);
      setSucesso("Pontos e Beauty Coins atualizados!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      setErro("Erro ao atualizar pontos/Beauty Coins: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  });

  // NOVAS Mutations para Atualizações
  const enviarAtualizacaoMutation = useMutation({
    mutationFn: async ({ titulo, descricao, conteudo, agendada, dataPublicacao }) => {
      // Criar a novidade/atualização
      const novidade = await base44.entities.Novidade.create({
        titulo,
        descricao,
        conteudo_detalhado: conteudo,
        data_publicacao: dataPublicacao || new Date().toISOString(),
        categoria: 'nova_funcionalidade',
        icone: '🚀',
        status: agendada ? 'programado' : 'publicado'
      });

      // Se não for agendada, enviar notificações imediatamente
      if (!agendada) {
        const usuarios = await base44.entities.User.list('-created_date', 1000);
        
        for (const usuario of usuarios) {
          await base44.entities.Notificacao.create({
            usuario_email: usuario.email,
            tipo: 'nova_atualizacao_sistema',
            titulo: `🚀 ${titulo}`,
            mensagem: descricao,
            link_acao: `/novidades?id=${novidade.id}`,
            lida: false
          });
        }
      }

      return novidade;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atualizacoes-sistema'] });
      setMostrarModalAtualizacao(false);
      setTituloAtualizacao("");
      setDescricaoAtualizacao("");
      setConteudoAtualizacao("");
      setDataAgendamento(null);
      setSucesso("Atualização enviada com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
  });

  const forcarAtualizacaoMutation = useMutation({
    mutationFn: async () => {
      // Simular processo de atualização
      setMostrarCarregamentoAtualizacao(true);
      
      // Aguardar 3 segundos (simula deploy)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Recarregar página
      window.location.reload();
    },
  });

  // NOVA Mutation para Agendar Atualização Forçada
  const agendarAtualizacaoForcadaMutation = useMutation({
    mutationFn: async ({ dataAgendada, titulo, descricao }) => {
      return await base44.entities.AgendamentoAtualizacao.create({
        data_agendada: dataAgendada,
        titulo,
        descricao,
        tipo: 'forcada',
        executado: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-atualizacao'] });
      setMostrarModalAgendarForcada(false);
      setDataAgendamentoForcada(null);
      setTituloAgendamentoForcada("");
      setDescricaoAgendamentoForcada("");
      setSucesso("Atualização forçada agendada com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
  });

  const cancelarAgendamentoMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.AgendamentoAtualizacao.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agendamentos-atualizacao'] });
      setSucesso("Agendamento cancelado!");
      setTimeout(() => setSucesso(null), 3000);
    },
  });

  // Verificar agendamentos e executar se chegou a hora
  useEffect(() => {
    if (!agendamentos || agendamentos.length === 0) return;

    const intervalo = setInterval(() => {
      const agora = new Date();
      
      agendamentos.forEach(async (agendamento) => {
        const dataAgendada = new Date(agendamento.data_agendada);
        
        // Se a data agendada já passou e não foi executado
        if (agora >= dataAgendada && !agendamento.executado) {
          // Marcar como executado
          await base44.entities.AgendamentoAtualizacao.update(agendamento.id, {
            executado: true,
            data_execucao: new Date().toISOString()
          });
          
          // Forçar atualização
          setMostrarCarregamentoAtualizacao(true);
          // Reload after a short delay to show the loading screen
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      });
    }, 30000); // Verificar a cada 30 segundos

    return () => clearInterval(intervalo);
  }, [agendamentos]);

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
    } catch (error) {
      setErro("Erro ao ativar plano: " + error.message);
      setTimeout(() => setErro(null), 3000);
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
      setErro("Erro ao ativar impulsionamento: " + error.message);
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

  // Handlers para Banners
  const handleVerDetalhesBanner = (banner) => {
    setBannerSelecionado(banner);
    setMostrarDetalhesBanner(true);
  };

  const handleAlterarStatusBanner = async (banner, novoStatus) => {
    if (confirm(`Alterar status do banner "${banner.titulo}" para ${novoStatus}?`)) {
      atualizarStatusBannerMutation.mutate({ id: banner.id, status: novoStatus });
    }
  };

  const handleExcluirBanner = async (banner) => {
    if (confirm(`Tem certeza que deseja excluir o banner "${banner.titulo}"?`)) {
      deletarBannerMutation.mutate(banner.id);
    }
  };

  // Handlers para Posts
  const handleVerDetalhesPost = (post) => {
    setPostSelecionado(post);
    setMostrarDetalhesPost(true);
  };

  const handleVerPostagemBlog = (post) => {
    // Navegar para o Blog com o artigo específico
    navigate(`${createPageUrl("Blog")}?artigo=${post.id}`);
  };

  const handleAlterarStatusPost = async (post, novoStatus) => {
    if (confirm(`Alterar status do post "${post.titulo}" para ${novoStatus}?`)) {
      atualizarStatusPostMutation.mutate({ id: post.id, status: novoStatus });
    }
  };

  const handleExcluirPost = async (post) => {
    if (confirm(`Tem certeza que deseja excluir o post "${post.titulo}"?`)) {
      deletarPostMutation.mutate(post.id);
    }
  };

  // NOVOS Handlers
  const handleExcluirProfissional = (usuario) => {
    if (confirm(`ATENÇÃO: Remover ${usuario.full_name} como profissional?\n\nEsta ação irá:\n- Converter a conta para Paciente\n- Resetar plano para Cobre\n- Remover plano de patrocinador`)) {
      excluirProfissionalMutation.mutate(usuario.email);
    }
  };

  const handleEditarPontos = (usuario) => {
    setUsuarioEditandoPontos(usuario);
    setNovosPontos(usuario.pontos_acumulados || 0);
    setNovosBeautyCoins(usuario.beauty_coins || 0);
    setMostrarModalPontos(true);
  };

  const confirmarEditarPontos = () => {
    if (!usuarioEditandoPontos) return;
    
    if (confirm(`Atualizar pontos e Beauty Coins de ${usuarioEditandoPontos.full_name}?\n\nPontos: ${novosPontos}\nBeauty Coins: ${novosBeautyCoins}`)) {
      atualizarPontosMutation.mutate({
        email: usuarioEditandoPontos.email,
        pontos: novosPontos,
        beautyCoins: novosBeautyCoins
      });
    }
  };

  const handleSincronizarClubeBeleza = (usuario) => {
    const dados = {
      email: usuario.email,
      nome: usuario.full_name,
      plano_clube: usuario.plano_clube_beleza || 'nenhum',
      beauty_coins: usuario.beauty_coins || 0,
      origem: 'mapa_estetica'
    };
    
    const params = new URLSearchParams(dados);
    window.open(`https://clube-da-beleza.base44.app?${params.toString()}`, '_blank');
  };

  // NOVOS Handlers para Relatórios em PDF
  const exportarRelatorioGeral = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório Geral - Painel Admin</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; }
          h1 { color: #EC4899; border-bottom: 3px solid #EC4899; padding-bottom: 10px; }
          .header { background: linear-gradient(135deg, #EC4899 0%, #F43F5E 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
          .section { background: #F3F4F6; padding: 15px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #EC4899; }
          .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
          .card { background: white; border: 2px solid #E5E7EB; padding: 15px; border-radius: 8px; text-align: center; }
          .card h4 { color: #EC4899; font-size: 14px; margin-bottom: 10px; }
          .card p { font-size: 32px; font-weight: bold; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; color: white; border: none;">📊 Relatório Geral - Painel Administrativo</h1>
          <p style="margin: 10px 0 0 0;">Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
        </div>
        
        <div class="grid">
          <div class="card"><h4>📋 Solicitações de Plano</h4><p>${solicitacoesPlanos.length}</p></div>
          <div class="card"><h4>🚀 Impulsionamentos</h4><p>${solicitacoesImpulsionamento.length}</p></div>
          <div class="card"><h4>👥 Profissionais</h4><p>${usuarios.length}</p></div>
          <div class="card"><h4>👑 Clube da Beleza</h4><p>${todosUsuarios.filter(u => u.plano_clube_beleza && u.plano_clube_beleza !== 'nenhum').length}</p></div>
          <div class="card"><h4>🏢 Patrocinadores</h4><p>${todosUsuarios.filter(u => u.plano_patrocinador && u.plano_patrocinador !== 'nenhum').length}</p></div>
          <div class="card"><h4>🎨 Banners</h4><p>${banners.length}</p></div>
          <div class="card"><h4>📰 Posts</h4><p>${posts.length}</p></div>
          <div class="card"><h4>🛍️ Pedidos</h4><p>${pedidos.length}</p></div>
        </div>

        <div class="section">
          <h3>📊 Resumo de Solicitações</h3>
          <p>Pendentes: ${solicitacoesPlanos.filter(s => s.status === 'aguardando_confirmacao' || s.status === 'confirmado_usuario').length}</p>
          <p>Aprovadas: ${solicitacoesPlanos.filter(s => s.status === 'ativado_admin').length}</p>
        </div>

        <div class="section">
          <h3>🎨 Banners</h3>
          <p>Ativos: ${banners.filter(b => b.status === 'ativo').length}</p>
          <p>Pausados: ${banners.filter(b => b.status === 'pausado').length}</p>
          <p>Total de Visualizações: ${banners.reduce((acc, b) => acc + (b.metricas?.visualizacoes || 0), 0)}</p>
        </div>

        <div class="section">
          <h3>📰 Posts no Blog</h3>
          <p>Publicados: ${posts.filter(p => p.status === 'publicado').length}</p>
          <p>Programados: ${posts.filter(p => p.status === 'programado').length}</p>
          <p>Total de Visualizações: ${posts.reduce((acc, p) => acc + (p.visualizacoes || 0), 0)}</p>
        </div>

        <div class="section">
          <h3>🛍️ Pedidos de Produtos</h3>
          <p>Pendentes: ${pedidos.filter(p => p.status_pedido === 'aguardando_pagamento').length}</p>
          <p>Entregues: ${pedidos.filter(p => p.status_pedido === 'entregue').length}</p>
          <p>Valor Total: R$ ${pedidos.reduce((sum, p) => sum + (p.valor_total || 0), 0).toFixed(2)}</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-geral-${format(new Date(), "yyyy-MM-dd")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    alert('📄 Relatório HTML baixado! Abra no navegador e use Ctrl+P para salvar como PDF.');
  };

  const exportarRelatorioSolicitacoes = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Solicitações</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #EC4899; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #EC4899; color: white; }
        </style>
      </head>
      <body>
        <h1>📋 Relatório de Solicitações de Plano</h1>
        <p>Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
        <p><strong>Total:</strong> ${solicitacoesPlanos.length}</p>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Plano</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            ${solicitacoesPlanos.map(s => `
              <tr>
                <td>${s.usuario_nome}</td>
                <td>${s.usuario_email}</td>
                <td>${PLANOS_INFO[s.plano_solicitado]?.nome}</td>
                <td>${s.tipo_plano || 'profissional'}</td>
                <td>${STATUS_INFO[s.status]?.label}</td>
                <td>${s.data_solicitacao ? format(new Date(s.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `solicitacoes-${format(new Date(), "yyyy-MM-dd")}.html`;
    a.click();
    URL.revokeObjectURL(url);
    alert('📄 Relatório baixado!');
  };

  const exportarRelatorioImpulsionamento = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Impulsionamentos</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #F97316; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #F97316; color: white; }
        </style>
      </head>
      <body>
        <h1>🚀 Relatório de Impulsionamentos</h1>
        <p>Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
        <p><strong>Total:</strong> ${solicitacoesImpulsionamento.length}</p>
        <table>
          <thead>
            <tr>
              <th>Profissional</th>
              <th>Anúncio</th>
              <th>Plano</th>
              <th>Duração</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${solicitacoesImpulsionamento.map(s => `
              <tr>
                <td>${s.usuario_nome}</td>
                <td>${s.anuncio_titulo}</td>
                <td>${PLANOS_IMPULSIONAMENTO_INFO[s.plano_impulsionamento]?.nome}</td>
                <td>${s.duracao_dias} dias</td>
                <td>R$ ${s.valor?.toFixed(2)}</td>
                <td>${STATUS_INFO[s.status]?.label}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impulsionamentos-${format(new Date(), "yyyy-MM-dd")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarRelatorioBanners = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Banners</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #7C3AED; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #7C3AED; color: white; }
        </style>
      </head>
      <body>
        <h1>🎨 Relatório de Banners</h1>
        <p>Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
        <p><strong>Total:</strong> ${bannersFiltrados.length}</p>
        <p><strong>Ativos:</strong> ${bannersFiltrados.filter(b => b.status === 'ativo').length}</p>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Empresa</th>
              <th>Plano</th>
              <th>Status</th>
              <th>Visualizações</th>
              <th>Cliques</th>
            </tr>
          </thead>
          <tbody>
            ${bannersFiltrados.map(b => `
              <tr>
                <td>${b.titulo}</td>
                <td>${b.nome_empresa}</td>
                <td>${PLANOS_INFO[b.plano_patrocinador]?.nome}</td>
                <td>${b.status}</td>
                <td>${b.metricas?.visualizacoes || 0}</td>
                <td>${b.metricas?.cliques || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `banners-${format(new Date(), "yyyy-MM-dd")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportarRelatorioPosts = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Posts</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #F97316; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #F97316; color: white; }
        </style>
      </head>
      <body>
        <h1>📰 Relatório de Posts do Blog</h1>
        <p>Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
        <p><strong>Total:</strong> ${postsFiltrados.length}</p>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Visualizações</th>
              <th>Curtidas</th>
            </tr>
          </thead>
          <tbody>
            ${postsFiltrados.map(p => `
              <tr>
                <td>${p.titulo}</td>
                <td>${p.created_by}</td>
                <td>${p.categoria}</td>
                <td>${p.status}</td>
                <td>${p.visualizacoes || 0}</td>
                <td>${p.total_curtidas || 0}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `posts-${format(new Date(), "yyyy-MM-dd")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const enviarRelatorioBannersWhatsApp = () => {
    const mensagem = `
📊 *RELATÓRIO DE BANNERS*
Data: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}

📈 *RESUMO:*
Total: ${bannersFiltrados.length}
Ativos: ${bannersFiltrados.filter(b => b.status === 'ativo').length}
Pausados: ${bannersFiltrados.filter(b => b.status === 'pausado').length}

👁️ Visualizações: ${bannersFiltrados.reduce((acc, b) => acc + (b.metricas?.visualizacoes || 0), 0)}
🖱️ Cliques: ${bannersFiltrados.reduce((acc, b) => acc + (b.metricas?.cliques || 0), 0)}
    `.trim();
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const enviarRelatorioPostsWhatsApp = () => {
    const mensagem = `
📊 *RELATÓRIO DE POSTS*
Data: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}

📈 *RESUMO:*
Total: ${postsFiltrados.length}
Publicados: ${postsFiltrados.filter(p => p.status === 'publicado').length}
Programados: ${postsFiltrados.filter(p => p.status === 'programado').length}

👁️ Visualizações: ${postsFiltrados.reduce((acc, p) => acc + (p.visualizacoes || 0), 0)}
❤️ Curtidas: ${postsFiltrados.reduce((acc, p) => acc + (p.total_curtidas || 0), 0)}
    `.trim();
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const enviarRelatorioImpulsionamentoWhatsApp = () => {
    const mensagem = `
📊 *RELATÓRIO DE IMPULSIONAMENTOS*
Data: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}

Total: ${solicitacoesImpulsionamento.length}
Ativos: ${solicitacoesImpulsionamento.filter(s => s.status === 'ativado_admin').length}
Pendentes: ${solicitacoesImpulsionamento.filter(s => s.status !== 'ativado_admin' && s.status !== 'cancelado').length}

Valor Total: R$ ${solicitacoesImpulsionamento.reduce((sum, s) => sum + (s.valor || 0), 0).toFixed(2)}
    `.trim();
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`, '_blank');
  };


  const handleEnviarAtualizacao = async () => {
    if (!tituloAtualizacao || !descricaoAtualizacao) {
      setErro("Preencha título e descrição!");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    setEnviandoAtualizacao(true);
    try {
      await enviarAtualizacaoMutation.mutateAsync({
        titulo: tituloAtualizacao,
        descricao: descricaoAtualizacao,
        conteudo: conteudoAtualizacao,
        agendada: !!dataAgendamento,
        dataPublicacao: dataAgendamento?.toISOString()
      });
    } finally {
      setEnviandoAtualizacao(false);
    }
  };

  const handleForcarAtualizacao = () => {
    if (confirm('⚠️ ATENÇÃO: Esta ação irá recarregar o site para todos os usuários!\n\nUse apenas se houver mudanças críticas na plataforma.\n\nDeseja continuar?')) {
      forcarAtualizacaoMutation.mutate();
    }
  };

  const handleAgendarAtualizacaoForcada = () => {
    if (!dataAgendamentoForcada || !tituloAgendamentoForcada) {
      setErro("Preencha a data e o título!");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    if (confirm(`Confirma o agendamento de atualização forçada para ${format(dataAgendamentoForcada, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}?\n\nTodos os usuários terão o site recarregado automaticamente neste horário.`)) {
      agendarAtualizacaoForcadaMutation.mutate({
        dataAgendada: dataAgendamentoForcada.toISOString(),
        titulo: tituloAgendamentoForcada,
        descricao: descricaoAgendamentoForcada
      });
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

  // Filtros para Banners
  const bannersFiltrados = banners.filter(b => {
    const matchBusca = !buscaBanner || 
      b.titulo?.toLowerCase().includes(buscaBanner.toLowerCase()) ||
      b.nome_empresa?.toLowerCase().includes(buscaBanner.toLowerCase()) ||
      b.created_by?.toLowerCase().includes(buscaBanner.toLowerCase());
    const matchStatus = !filtroStatusBanner || b.status === filtroStatusBanner;
    return matchBusca && matchStatus;
  });

  // Filtros para Posts
  const postsFiltrados = posts.filter(p => {
    const matchBusca = !buscaPost || 
      p.titulo?.toLowerCase().includes(buscaPost.toLowerCase()) ||
      p.created_by?.toLowerCase().includes(buscaPost.toLowerCase());
    const matchStatus = !filtroStatusPost || p.status === filtroStatusPost;
    return matchBusca && matchStatus;
  });

  // Filtros para Clube e Patrocinadores (using todosUsuarios)
  const usuariosClube = todosUsuarios.filter(u => u.plano_clube_beleza && u.plano_clube_beleza !== 'nenhum');
  const usuariosPatrocinadores = todosUsuarios.filter(u => u.plano_patrocinador && u.plano_patrocinador !== 'nenhum');

  const usuariosUnicos = [...new Set(pedidos.map(p => p.usuario_email))].sort();
  const pedidosPendentes = pedidosFiltrados.filter(p => p.status_pedido === 'aguardando_pagamento');

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  // Modal de Carregamento de Atualização
  if (mostrarCarregamentoAtualizacao) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center z-50">
        <div className="text-center text-white">
          <div className="w-24 h-24 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-8 border-white/30 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Rocket className="w-12 h-12 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-3">🚀 Aplicando Atualizações...</h2>
          <p className="text-xl mb-2">Por favor, aguarde</p>
          <p className="text-white/80">Estamos implementando as novidades para você</p>
          <div className="mt-8 flex justify-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header ATUALIZADO */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Painel Administrativo
              </h1>
              <p className="text-gray-600">Gerencie perfis, produtos e conteúdo da plataforma</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setMostrarTutorialDrBeleza(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Dr. Beleza - Tutorial
              </Button>
              <Button
                onClick={exportarRelatorioGeral}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Relatório Geral PDF
              </Button>
            </div>
          </div>
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

        {/* SEÇÃO: Gestão de Atualizações - ATUALIZADA */}
        <Card className="mb-8 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-purple-900">Gestão de Atualizações</CardTitle>
                  <p className="text-sm text-purple-700">Envie atualizações e notificações para todos os usuários</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {/* Forçar Atualização Imediata */}
              <Card className="border-2 border-red-200 hover:border-red-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <RefreshCw className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">⚡ Atualização Imediata</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Força o recarregamento do site para todos os usuários online (use com cuidado!)
                    </p>
                  </div>
                  <Button
                    onClick={handleForcarAtualizacao}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                    disabled={forcarAtualizacaoMutation.isPending}
                  >
                    {forcarAtualizacaoMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    Forçar Agora
                  </Button>
                </CardContent>
              </Card>

              {/* NOVO: Agendar Atualização Forçada */}
              <Card className="border-2 border-orange-200 hover:border-orange-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">📅 Agendar Atualização</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Programe uma data para forçar atualização automaticamente
                    </p>
                    {agendamentos.length > 0 && (
                      <Badge className="bg-orange-100 text-orange-800 mb-2">
                        {agendamentos.length} agendado(s)
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => setMostrarModalAgendarForcada(true)}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                  >
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Agendar
                  </Button>
                </CardContent>
              </Card>

              {/* Enviar Notificação de Atualização */}
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Bell className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">📢 Notificar Usuários</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Envie notificações personalizadas sobre novidades e atualizações
                    </p>
                  </div>
                  <Button
                    onClick={() => setMostrarModalAtualizacao(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Criar Notificação
                  </Button>
                </CardContent>
              </Card>

              {/* Histórico de Atualizações */}
              <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">📋 Histórico</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Visualize todas as atualizações enviadas
                    </p>
                    <Badge className="bg-green-100 text-green-800 mb-3">
                      {atualizacoes.length} atualizações
                    </Badge>
                  </div>
                  <Button
                    onClick={() => navigate(createPageUrl("Novidades"))}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Ver Histórico
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* NOVA SEÇÃO: Agendamentos Futuros */}
            {agendamentos.length > 0 && (
              <div className="mt-6 pt-6 border-t border-purple-200">
                <h4 className="font-semibold text-lg mb-4 text-orange-900">📅 Atualizações Agendadas</h4>
                <div className="space-y-3">
                  {agendamentos.map((agendamento) => {
                    const dataAgendada = new Date(agendamento.data_agendada);
                    const agora = new Date();
                    const jaPassou = dataAgendada < agora;
                    
                    return (
                      <div key={agendamento.id} className="p-4 bg-white rounded-lg border-2 border-orange-200 hover:border-orange-400 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarIcon className="w-5 h-5 text-orange-600" />
                              <h5 className="font-bold text-gray-900">{agendamento.titulo}</h5>
                              <Badge className={jaPassou ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}>
                                {jaPassou ? 'Executando...' : 'Agendado'}
                              </Badge>
                            </div>
                            {agendamento.descricao && (
                              <p className="text-sm text-gray-600 mb-2">{agendamento.descricao}</p>
                            )}
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(dataAgendada, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                              <span>•</span>
                              <span className={jaPassou ? 'text-red-600 font-bold' : 'text-orange-600'}>
                                {jaPassou ? '⚠️ Executando agora!' : `Em ${Math.max(0, Math.ceil((dataAgendada - agora) / (1000 * 60 * 60)))} horas`}
                              </span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700"
                            onClick={() => {
                              if (confirm(`Cancelar este agendamento?\n\nTítulo: ${agendamento.titulo}\nData: ${format(dataAgendada, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`)) {
                                cancelarAgendamentoMutation.mutate(agendamento.id);
                              }
                            }}
                            disabled={cancelarAgendamentoMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <Alert className="mt-4 bg-orange-50 border-orange-200">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800 text-sm">
                    ⏰ <strong>Sistema Automático:</strong> As atualizações agendadas serão executadas automaticamente na data/hora programada. O site será recarregado para todos os usuários online.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {/* Últimas 3 Atualizações */}
            {atualizacoes.length > 0 && (
              <div className="mt-6 pt-6 border-t border-purple-200">
                <h4 className="font-semibold text-lg mb-4 text-purple-900">📌 Últimas Atualizações Enviadas</h4>
                <div className="space-y-3">
                  {atualizacoes.slice(0, 3).map((atualizacao) => (
                    <div key={atualizacao.id} className="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{atualizacao.icone || '🚀'}</span>
                            <h5 className="font-bold text-gray-900">{atualizacao.titulo}</h5>
                            <Badge className={
                              atualizacao.status === 'publicado' ? 'bg-green-100 text-green-800' :
                              atualizacao.status === 'programado' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {atualizacao.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{atualizacao.descricao}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {atualizacao.visualizacoes || 0} visualizações
                            </span>
                            <span>•</span>
                            <span>{format(new Date(atualizacao.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs Principais - NOME ATUALIZADO */}
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 gap-1">
            <TabsTrigger value="planos">
              <User className="w-4 h-4 mr-2" />
              Perfis
            </TabsTrigger>
            <TabsTrigger value="produtos">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="banners">
              <ImageIcon className="w-4 h-4 mr-2" />
              Banners ({banners.length})
            </TabsTrigger>
            <TabsTrigger value="posts">
              <Newspaper className="w-4 h-4 mr-2" />
              Posts ({posts.length})
            </TabsTrigger>
          </TabsList>

          {/* ============================================ */}
          {/* TAB CONTROLE DE PERFIS (antes PLANOS) */}
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
                  Clube ({usuariosClube.length})
                </TabsTrigger>
                <TabsTrigger value="patrocinadores" className="text-xs sm:text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Patrocinadores ({usuariosPatrocinadores.length})
                </TabsTrigger>
              </TabsList>

              {/* Sub-aba: Solicitações - ATUALIZADA COM RELATÓRIOS */}
              <TabsContent value="solicitacoes">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Solicitações de Planos</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={exportarRelatorioSolicitacoes}
                          variant="outline"
                          size="sm"
                          disabled={solicitacoesPlanos.length === 0}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
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

              {/* Sub-aba: Impulsionamento - ATUALIZADA COM RELATÓRIOS */}
              <TabsContent value="impulsionamento">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Solicitações de Impulsionamento</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={exportarRelatorioImpulsionamento}
                          variant="outline"
                          size="sm"
                          disabled={solicitacoesImpulsionamento.length === 0}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          onClick={enviarRelatorioImpulsionamentoWhatsApp}
                          variant="outline"
                          size="sm"
                          className="border-green-300 text-green-700"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          WhatsApp
                        </Button>
                      </div>
                    </div>
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

              {/* Sub-aba: Profissionais - ATUALIZADA */}
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
                              <TableHead>Plano</TableHead>
                              <TableHead>Pontos/Coins</TableHead>
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
                                <TableCell>
                                  <div className="text-sm">
                                    <p className="flex items-center gap-1">
                                      <Star className="w-3 h-3 text-yellow-500" />
                                      {usuario.pontos_acumulados || 0} pts
                                    </p>
                                    <p className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3 text-purple-500" />
                                      {usuario.beauty_coins || 0} BC
                                    </p>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2 flex-wrap">
                                    <Button
                                      onClick={() => handleTrocarPlano(usuario)}
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-700"
                                    >
                                      <CreditCard className="w-4 h-4 mr-1" />
                                      Plano
                                    </Button>
                                    <Button
                                      onClick={() => handleEditarPontos(usuario)}
                                      size="sm"
                                      variant="outline"
                                      className="border-purple-300 text-purple-700"
                                    >
                                      <Star className="w-4 h-4 mr-1" />
                                      Pontos
                                    </Button>
                                    <Button
                                      onClick={() => handleExcluirProfissional(usuario)}
                                      size="sm"
                                      variant="outline"
                                      className="border-red-300 text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
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

              {/* Sub-aba: Clube da Beleza - IMPLEMENTADA */}
              <TabsContent value="clube">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-6 h-6 text-purple-600" />
                        Membros do Clube da Beleza
                      </CardTitle>
                      <Button
                        onClick={() => window.open('https://clube-da-beleza.base44.app', '_blank')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Acessar Clube
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingTodosUsuarios ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                      </div>
                    ) : usuariosClube.length === 0 ? (
                      <div className="text-center py-12">
                        <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhum membro do clube encontrado</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Membro</TableHead>
                              <TableHead>Plano Clube</TableHead>
                              <TableHead>Beauty Coins</TableHead>
                              <TableHead>Data Adesão</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usuariosClube.map((usuario) => (
                              <TableRow key={usuario.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{usuario.full_name}</p>
                                    <p className="text-sm text-gray-500">{usuario.email}</p>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className="bg-purple-100 text-purple-800">
                                    {usuario.plano_clube_beleza?.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1 font-bold text-purple-600">
                                    <DollarSign className="w-4 h-4" />
                                    {usuario.beauty_coins || 0}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm">
                                  {usuario.data_adesao_plano_clube ? 
                                    format(new Date(usuario.data_adesao_plano_clube), "dd/MM/yyyy", { locale: ptBR }) : 
                                    "-"
                                  }
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      onClick={() => handleEditarPontos(usuario)}
                                      size="sm"
                                      variant="outline"
                                      className="border-purple-300 text-purple-700"
                                    >
                                      <Edit className="w-4 h-4 mr-1" />
                                      Editar
                                    </Button>
                                    <Button
                                      onClick={() => handleSincronizarClubeBeleza(usuario)}
                                      size="sm"
                                      className="bg-purple-600 hover:bg-purple-700"
                                    >
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      Sincronizar
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                    
                    <Alert className="mt-6 bg-purple-50 border-purple-200">
                      <AlertCircle className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-purple-800 text-sm">
                        💡 <strong>Integração com Clube da Beleza:</strong> Use o botão "Sincronizar" para enviar os dados do usuário ao site do clube com as informações de Beauty Coins e plano.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sub-aba: Patrocinadores - IMPLEMENTADA */}
              <TabsContent value="patrocinadores">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-6 h-6 text-blue-600" />
                      Patrocinadores Ativos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingTodosUsuarios ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      </div>
                    ) : usuariosPatrocinadores.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhum patrocinador encontrado</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Patrocinador</TableHead>
                              <TableHead>Plano</TableHead>
                              <TableHead>Banners</TableHead>
                              <TableHead>Posts</TableHead>
                              <TableHead>Data Adesão</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usuariosPatrocinadores.map((usuario) => {
                              const bannersPat = banners.filter(b => b.created_by === usuario.email);
                              const postsPat = posts.filter(p => p.created_by === usuario.email);
                              
                              return (
                                <TableRow key={usuario.id}>
                                  <TableCell>
                                    <div>
                                      <p className="font-medium">{usuario.full_name}</p>
                                      <p className="text-sm text-gray-500">{usuario.email}</p>
                                      {usuario.nome_empresa && (
                                        <p className="text-xs text-gray-500">Empresa: {usuario.nome_empresa}</p>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={PLANOS_INFO[usuario.plano_patrocinador]?.cor || "bg-gray-100 text-gray-800"}>
                                      {PLANOS_INFO[usuario.plano_patrocinador]?.nome || usuario.plano_patrocinador}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p className="font-medium">{bannersPat.length} banners</p>
                                      <p className="text-xs text-gray-500">
                                        {bannersPat.filter(b => b.status === 'ativo').length} ativos
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-sm">
                                      <p className="font-medium">{postsPat.length} posts</p>
                                      <p className="text-xs text-gray-500">
                                        {postsPat.filter(p => p.status === 'publicado').length} publicados
                                      </p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm">
                                    {usuario.data_adesao_plano_patrocinador ? 
                                      format(new Date(usuario.data_adesao_plano_patrocinador), "dd/MM/yyyy", { locale: ptBR }) : 
                                      "-"
                                    }
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        onClick={() => handleEditarPontos(usuario)}
                                        size="sm"
                                        variant="outline"
                                        className="border-purple-300 text-purple-700"
                                      >
                                        <Star className="w-4 h-4 mr-1" />
                                        Pontos
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          const mensagem = `Olá ${usuario.full_name}!\n\nSobre seu plano de Patrocinador no Mapa da Estética...`;
                                          window.open(`https://wa.me/${usuario.whatsapp?.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`, '_blank');
                                        }}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                        disabled={!usuario.whatsapp}
                                      >
                                        <MessageCircle className="w-4 h-4 mr-1" />
                                        WhatsApp
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
            </Tabs>
          </TabsContent>

          {/* ============================================ */}
          {/* TAB CONTROLE DE PRODUTOS - ATUALIZADA COM RELATÓRIOS */}
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

            {/* Tabela de Pedidos - ATUALIZADA */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lista de Pedidos ({pedidosFiltrados.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        const html = `
                          <!DOCTYPE html>
                          <html>
                          <head>
                            <meta charset="UTF-8">
                            <title>Relatório de Pedidos</title>
                            <style>
                              body { font-family: Arial, sans-serif; padding: 20px; }
                              h1 { color: #10B981; }
                              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                              th { background: #10B981; color: white; }
                            </style>
                          </head>
                          <body>
                            <h1>🛍️ Relatório de Pedidos</h1>
                            <p>Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                            <p><strong>Total:</strong> ${pedidosFiltrados.length}</p>
                            <p><strong>Valor Total:</strong> R$ ${pedidosFiltrados.reduce((s, p) => s + (p.valor_total || 0), 0).toFixed(2)}</p>
                            <table>
                              <thead>
                                <tr>
                                  <th>Data</th>
                                  <th>Cliente</th>
                                  <th>Produto</th>
                                  <th>Valor</th>
                                  <th>Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${pedidosFiltrados.map(p => `
                                  <tr>
                                    <td>${format(new Date(p.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</td>
                                    <td>${p.usuario_email}</td>
                                    <td>${p.produto_nome}</td>
                                    <td>R$ ${p.valor_total?.toFixed(2)}</td>
                                    <td>${p.status_pedido}</td>
                                  </tr>
                                `).join('')}
                              </tbody>
                            </table>
                          </body>
                          </html>
                        `;
                        const blob = new Blob([html], { type: 'text/html' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `pedidos-${format(new Date(), "yyyy-MM-dd")}.html`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => {
                        const mensagem = `📊 *RELATÓRIO DE PEDIDOS*\n\nTotal: ${pedidosFiltrados.length}\nPendentes: ${pedidosPendentes.length}\nValor: R$ ${pedidosFiltrados.reduce((s, p) => s + (p.valor_total || 0), 0).toFixed(2)}\n\nGerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`, '_blank');
                      }}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
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

          {/* ============================================ */}
          {/* TAB CONTROLE DE BANNERS - ATUALIZADA COM RELATÓRIOS */}
          {/* ============================================ */}
          <TabsContent value="banners">
            {/* Stats Banners */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Banners</p>
                      <p className="text-3xl font-bold text-gray-900">{bannersFiltrados.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Ativos</p>
                      <p className="text-3xl font-bold text-green-600">{bannersFiltrados.filter(b => b.status === 'ativo').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pausados</p>
                      <p className="text-3xl font-bold text-yellow-600">{bannersFiltrados.filter(b => b.status === 'pausado').length}</p>
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
                      <p className="text-sm text-gray-600">Visualizações</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {bannersFiltrados.reduce((acc, b) => acc + (b.metricas?.visualizacoes || 0), 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros Banners */}
            <Card className="mb-6 border-none shadow-lg">
              <CardHeader>
                <CardTitle>Filtros de Busca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Buscar</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Título, empresa ou email..."
                        value={buscaBanner}
                        onChange={(e) => setBuscaBanner(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select value={filtroStatusBanner} onValueChange={setFiltroStatusBanner}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="pausado">Pausado</SelectItem>
                        <SelectItem value="expirado">Expirado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela Banners - ATUALIZADA */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lista de Banners ({bannersFiltrados.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={exportarRelatorioBanners}
                      variant="outline"
                      size="sm"
                      disabled={bannersFiltrados.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      onClick={enviarRelatorioBannersWhatsApp}
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingBanners ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                  </div>
                ) : bannersFiltrados.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum banner encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Banner</TableHead>
                          <TableHead>Patrocinador</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bannersFiltrados.map((banner) => (
                          <TableRow key={banner.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                  {banner.imagem_banner && 
                                    <img src={banner.imagem_banner} alt={banner.titulo} className="w-full h-full object-cover" />
                                  }
                                </div>
                                <div>
                                  <p className="font-medium">{banner.titulo}</p>
                                  <p className="text-xs text-gray-500">{banner.nome_empresa}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm">{banner.created_by}</p>
                            </TableCell>
                            <TableCell>
                              <Badge className={PLANOS_INFO[banner.plano_patrocinador]?.cor || "bg-gray-100 text-gray-800"}>
                                {PLANOS_INFO[banner.plano_patrocinador]?.nome || banner.plano_patrocinador}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={
                                banner.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                banner.status === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }>
                                {banner.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              <div>
                                <p>{banner.data_inicio ? format(new Date(banner.data_inicio), "dd/MM/yyyy", { locale: ptBR }) : "-"}</p>
                                {banner.data_fim && (
                                  <p className="text-xs text-gray-500">até {format(new Date(banner.data_fim), "dd/MM/yyyy", { locale: ptBR })}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  onClick={() => handleVerDetalhesBanner(banner)}
                                  size="sm"
                                  variant="outline"
                                  className="border-blue-300 text-blue-700"
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  Ver Detalhes
                                </Button>
                                {banner.status === 'ativo' ? (
                                  <Button
                                    onClick={() => handleAlterarStatusBanner(banner, 'pausado')}
                                    size="sm"
                                    variant="outline"
                                    className="border-yellow-300 text-yellow-700"
                                    disabled={atualizarStatusBannerMutation.isPending}
                                  >
                                    Pausar
                                  </Button>
                                ) : (
                                  <Button
                                    onClick={() => handleAlterarStatusBanner(banner, 'ativo')}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    disabled={atualizarStatusBannerMutation.isPending}
                                  >
                                    Ativar
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleExcluirBanner(banner)}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700"
                                  disabled={deletarBannerMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
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

          {/* ============================================ */}
          {/* TAB CONTROLE DE POSTS - ATUALIZADA COM RELATÓRIOS */}
          {/* ============================================ */}
          <TabsContent value="posts">
            {/* Stats Posts */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Posts</p>
                      <p className="text-3xl font-bold text-gray-900">{postsFiltrados.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Newspaper className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Publicados</p>
                      <p className="text-3xl font-bold text-green-600">{postsFiltrados.filter(p => p.status === 'publicado').length}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Programados</p>
                      <p className="text-3xl font-bold text-yellow-600">{postsFiltrados.filter(p => p.status === 'programado').length}</p>
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
                      <p className="text-sm text-gray-600">Visualizações</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {postsFiltrados.reduce((acc, p) => acc + (p.visualizacoes || 0), 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros Posts */}
            <Card className="mb-6 border-none shadow-lg">
              <CardHeader>
                <CardTitle>Filtros de Busca</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Buscar</Label>
                    <div className="relative mt-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        placeholder="Título ou email..."
                        value={buscaPost}
                        onChange={(e) => setBuscaPost(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select value={filtroStatusPost} onValueChange={setFiltroStatusPost}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos</SelectItem>
                        <SelectItem value="publicado">Publicado</SelectItem>
                        <SelectItem value="programado">Programado</SelectItem>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela Posts - ATUALIZADA */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Lista de Posts ({postsFiltrados.length})</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={exportarRelatorioPosts}
                      variant="outline"
                      size="sm"
                      disabled={postsFiltrados.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      onClick={enviarRelatorioPostsWhatsApp}
                      variant="outline"
                      size="sm"
                      className="border-green-300 text-green-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPosts ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                  </div>
                ) : postsFiltrados.length === 0 ? (
                  <div className="text-center py-12">
                    <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum post encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Post</TableHead>
                          <TableHead>Autor</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {postsFiltrados.map((post) => {
                          // Buscar dados do usuário autor
                          const autorData = todosUsuarios.find(u => u.email === post.created_by);
                          const planoPatrocinador = autorData?.plano_patrocinador || 'nenhum';
                          
                          return (
                            <TableRow key={post.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                    {post.imagem_capa ? (
                                      <img src={post.imagem_capa} alt={post.titulo} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-2xl">📰</div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium line-clamp-1">{post.titulo}</p>
                                    <Badge variant="outline" className="text-xs mt-1">
                                      {post.categoria}
                                    </Badge>
                                  </div>
                                </TableCell>
                              <TableCell>
                                <p className="text-sm">{post.created_by}</p>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  planoPatrocinador === 'nenhum' ? "bg-gray-100 text-gray-800" :
                                  PLANOS_INFO[planoPatrocinador]?.cor || "bg-gray-100 text-gray-800"
                                }>
                                  {planoPatrocinador === 'nenhum' ? 'Nenhum' : (PLANOS_INFO[planoPatrocinador]?.nome || planoPatrocinador)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={
                                  post.status === 'publicado' ? 'bg-green-100 text-green-800' :
                                  post.status === 'programado' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {post.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div>
                                  <p>{post.data_publicacao ? format(new Date(post.data_publicacao), "dd/MM/yyyy", { locale: ptBR }) : "-"}</p>
                                  <p className="text-xs text-gray-500">
                                    {post.data_publicacao ? format(new Date(post.data_publicacao), "HH:mm", { locale: ptBR }) : "-"}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    onClick={() => handleVerDetalhesPost(post)}
                                    size="sm"
                                    variant="outline"
                                    className="border-blue-300 text-blue-700"
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Detalhes
                                  </Button>
                                  <Button
                                    onClick={() => handleVerPostagemBlog(post)}
                                    size="sm"
                                    className="bg-purple-600 hover:bg-purple-700"
                                  >
                                    <Newspaper className="w-4 h-4 mr-1" />
                                    Ver Post
                                  </Button>
                                  {post.status !== 'publicado' && (
                                    <Button
                                      onClick={() => handleAlterarStatusPost(post, 'publicado')}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                      disabled={atualizarStatusPostMutation.isPending}
                                    >
                                      Publicar
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => handleExcluirPost(post)}
                                    size="sm"
                                    variant="outline"
                                    className="border-red-300 text-red-700"
                                    disabled={deletarPostMutation.isPending}
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

        {/* NOVO: Modal Editar Pontos e Beauty Coins */}
        <Dialog open={mostrarModalPontos} onOpenChange={setMostrarModalPontos}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Pontos e Beauty Coins</DialogTitle>
              <DialogDescription>
                {usuarioEditandoPontos && (
                  <>Gerenciar pontos de <strong>{usuarioEditandoPontos.full_name}</strong></>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {usuarioEditandoPontos && (
                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Usuário:</strong> {usuarioEditandoPontos.full_name}</p>
                  <p><strong>Email:</strong> {usuarioEditandoPontos.email}</p>
                  <p><strong>Tipo:</strong> {usuarioEditandoPontos.tipo_usuario}</p>
                </div>
              )}
              
              <div>
                <Label className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  Pontos Acumulados
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={novosPontos}
                  onChange={(e) => setNovosPontos(parseInt(e.target.value) || 0)}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valor atual: {usuarioEditandoPontos?.pontos_acumulados || 0} pontos
                </p>
              </div>

              <div>
                <Label className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-500" />
                  Beauty Coins
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={novosBeautyCoins}
                  onChange={(e) => setNovosBeautyCoins(parseInt(e.target.value) || 0)}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valor atual: {usuarioEditandoPontos?.beauty_coins || 0} BC
                </p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  💡 Estas alterações serão refletidas imediatamente no perfil do usuário e sincronizadas com o Clube da Beleza.
                </AlertDescription>
              </Alert>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalPontos(false);
                  setUsuarioEditandoPontos(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarEditarPontos}
                disabled={atualizarPontosMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {atualizarPontosMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Salvar
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Detalhes Banner */}
        <Dialog open={mostrarDetalhesBanner} onOpenChange={setMostrarDetalhesBanner}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Detalhes do Banner</DialogTitle>
            </DialogHeader>
            {bannerSelecionado && (
              <div className="space-y-6 py-4">
                {/* Imagem do Banner */}
                <div>
                  <Label className="text-lg font-bold mb-3 block">Imagem do Banner</Label>
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    {bannerSelecionado.imagem_banner && 
                      <img 
                        src={bannerSelecionado.imagem_banner} 
                        alt={bannerSelecionado.titulo} 
                        className="w-full h-auto"
                      />
                    }
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(bannerSelecionado.imagem_banner, '_blank')}
                      className="flex-1"
                      disabled={!bannerSelecionado.imagem_banner}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Imagem Original
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = bannerSelecionado.imagem_banner;
                        a.download = `banner-${bannerSelecionado.id}.jpg`;
                        a.click();
                      }}
                      className="flex-1"
                      disabled={!bannerSelecionado.imagem_banner}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Baixar Arquivo
                    </Button>
                  </div>
                </div>

                {/* Informações Básicas */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-bold text-lg mb-3">Informações do Banner</h4>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Título:</p>
                      <p className="font-medium">{bannerSelecionado.titulo}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Empresa:</p>
                      <p className="font-medium">{bannerSelecionado.nome_empresa}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Plano:</p>
                      <Badge className={PLANOS_INFO[bannerSelecionado.plano_patrocinador]?.cor || "bg-gray-100 text-gray-800"}>
                        {PLANOS_INFO[bannerSelecionado.plano_patrocinador]?.nome || bannerSelecionado.plano_patrocinador}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-600">Status:</p>
                      <Badge className={
                        bannerSelecionado.status === 'ativo' ? 'bg-green-100 text-green-800' :
                        bannerSelecionado.status === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {bannerSelecionado.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-gray-600">Posição:</p>
                      <p className="font-medium">{bannerSelecionado.posicao}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Dimensões:</p>
                      <p className="font-medium">
                        {bannerSelecionado.dimensoes_banner?.largura}x{bannerSelecionado.dimensoes_banner?.altura}px
                      </p>
                    </div>
                  </div>
                  {bannerSelecionado.descricao && (
                    <div>
                      <p className="text-gray-600">Descrição:</p>
                      <p className="font-medium">{bannerSelecionado.descricao}</p>
                    </div>
                  )}
                </div>

                {/* Contato do Patrocinador */}
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Contato do Patrocinador
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Nome/Empresa:</span>
                      <span className="font-medium">{bannerSelecionado.nome_empresa}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <a href={`mailto:${bannerSelecionado.created_by}`} className="font-medium text-blue-600 hover:underline">
                        {bannerSelecionado.created_by}
                      </a>
                    </div>
                    {todosUsuarios.find(u => u.email === bannerSelecionado.created_by)?.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Telefone:</span>
                        <a 
                          href={`tel:${todosUsuarios.find(u => u.email === bannerSelecionado.created_by).telefone}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {todosUsuarios.find(u => u.email === bannerSelecionado.created_by).telefone}
                        </a>
                      </div>
                    )}
                    {todosUsuarios.find(u => u.email === bannerSelecionado.created_by)?.whatsapp && (
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">WhatsApp:</span>
                        <a 
                          href={`https://wa.me/${todosUsuarios.find(u => u.email === bannerSelecionado.created_by).whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-green-600 hover:underline"
                        >
                          {todosUsuarios.find(u => u.email === bannerSelecionado.created_by).whatsapp}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Links */}
                {bannerSelecionado.links && bannerSelecionado.links.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                    <h4 className="font-bold text-lg mb-3">Links da Empresa</h4>
                    <div className="space-y-2">
                      {bannerSelecionado.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {link.titulo} ({link.tipo})
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Métricas */}
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-lg mb-3">Métricas de Performance</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
                    <div>
                      <p className="text-gray-600">Visualizações</p>
                      <p className="text-2xl font-bold text-blue-600">{bannerSelecionado.metricas?.visualizacoes || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Cliques</p>
                      <p className="text-2xl font-bold text-green-600">{bannerSelecionado.metricas?.cliques || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Compartilhamentos</p>
                      <p className="text-2xl font-bold text-purple-600">{bannerSelecionado.metricas?.compartilhamentos || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Conversoes</p>
                      <p className="text-2xl font-bold text-orange-600">{bannerSelecionado.metricas?.conversoes_produtos || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal Detalhes Post */}
        <Dialog open={mostrarDetalhesPost} onOpenChange={setMostrarDetalhesPost}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">Detalhes do Post</DialogTitle>
            </DialogHeader>
            {postSelecionado && (
              <div className="space-y-6 py-4">
                {/* Imagem de Capa */}
                {postSelecionado.imagem_capa && (
                  <div>
                    <Label className="text-lg font-bold mb-3 block">Imagem de Capa</Label>
                    <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={postSelecionado.imagem_capa} 
                        alt={postSelecionado.titulo} 
                        className="w-full h-auto object-cover max-h-48"
                      />
                    </div>
                  </div>
                )}

                {/* Informações Básicas */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-bold text-lg mb-3">Informações do Post</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-gray-600">Título:</p>
                      <p className="font-medium text-lg">{postSelecionado.titulo}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Resumo:</p>
                      <p className="font-medium">{postSelecionado.resumo}</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-gray-600">Categoria:</p>
                        <Badge>{postSelecionado.categoria}</Badge>
                      </div>
                      <div>
                        <p className="text-gray-600">Tipo:</p>
                        <Badge variant="outline">{postSelecionado.tipo}</Badge>
                      </div>
                      <div>
                        <p className="text-gray-600">Tempo de Leitura:</p>
                        <p className="font-medium">{postSelecionado.tempo_leitura} min</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status:</p>
                        <Badge className={
                          postSelecionado.status === 'publicado' ? 'bg-green-100 text-green-800' :
                          postSelecionado.status === 'programado' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {postSelecionado.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Autor/Patrocinador */}
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Informações do Autor
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <a href={`mailto:${postSelecionado.created_by}`} className="font-medium text-blue-600 hover:underline">
                        {postSelecionado.created_by}
                      </a>
                    </div>
                    {todosUsuarios.find(u => u.email === postSelecionado.created_by)?.full_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Nome:</span>
                        <span className="font-medium">
                          {todosUsuarios.find(u => u.email === postSelecionado.created_by).full_name}
                        </span>
                      </div>
                    )}
                    {todosUsuarios.find(u => u.email === postSelecionado.created_by)?.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Telefone:</span>
                        <a 
                          href={`tel:${todosUsuarios.find(u => u.email === postSelecionado.created_by).telefone}`}
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {todosUsuarios.find(u => u.email === postSelecionado.created_by).telefone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Plano Patrocinador:</span>
                      <Badge className={
                        PLANOS_INFO[todosUsuarios.find(u => u.email === postSelecionado.created_by)?.plano_patrocinador]?.cor || "bg-gray-100 text-gray-800"
                      }>
                        {PLANOS_INFO[todosUsuarios.find(u => u.email === postSelecionado.created_by)?.plano_patrocinador]?.nome || 'Nenhum'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Links do Patrocinador */}
                {postSelecionado.links_patrocinador && postSelecionado.links_patrocinador.length > 0 && (
                  <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                    <h4 className="font-bold text-lg mb-3">Links do Patrocinador</h4>
                    <div className="space-y-2">
                      {postSelecionado.links_patrocinador.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {link.titulo} ({link.tipo})
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Link Externo */}
                {postSelecionado.link_externo && (
                  <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
                    <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                      <ExternalLink className="w-5 h-5 text-yellow-600" />
                      Link Externo
                    </h4>
                    <a 
                      href={postSelecionado.link_externo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {postSelecionado.link_externo}
                    </a>
                  </div>
                )}

                {/* Métricas do Post */}
                <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                  <h4 className="font-bold text-lg mb-3">Métricas de Performance</h4>
                  <div className="grid grid-cols-2 gap-4 text-center text-sm">
                    <div>
                      <p className="text-gray-600">Visualizações</p>
                      <p className="text-2xl font-bold text-blue-600">{postSelecionado.visualizacoes || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Curtidas</p>
                      <p className="text-2xl font-bold text-pink-600">{postSelecionado.total_curtidas || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={() => handleVerPostagemBlog(postSelecionado)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Newspaper className="w-4 h-4 mr-2" />
                    Ver no Blog
                  </Button>
                  <Button
                    onClick={() => {
                      setMostrarDetalhesPost(false);
                      setPostSelecionado(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* NOVO: Modal Agendar Atualização Forçada */}
        <Dialog open={mostrarModalAgendarForcada} onOpenChange={setMostrarModalAgendarForcada}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <CalendarIcon className="w-6 h-6 text-orange-600" />
                Agendar Atualização Forçada
              </DialogTitle>
              <DialogDescription>
                Programe uma data e hora para forçar o recarregamento do site para todos os usuários
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 text-sm">
                  <p className="font-semibold mb-2">⚠️ ATENÇÃO:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Todos os usuários online terão o site recarregado <strong>automaticamente</strong></li>
                    <li>Use apenas para <strong>mudanças críticas</strong> na plataforma</li>
                    <li>Escolha um horário de <strong>baixo tráfego</strong> (madrugada)</li>
                    <li>O sistema verifica a cada 30 segundos e executa automaticamente</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div>
                <Label>Título da Atualização *</Label>
                <Input
                  placeholder="Ex: Correção Crítica de Segurança"
                  value={tituloAgendamentoForcada}
                  onChange={(e) => setTituloAgendamentoForcada(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Descrição (opcional)</Label>
                <Textarea
                  placeholder="Descreva o motivo desta atualização forçada..."
                  value={descricaoAgendamentoForcada}
                  onChange={(e) => setDescricaoAgendamentoForcada(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4" />
                  Data e Hora para Execução *
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {dataAgendamentoForcada ? format(dataAgendamentoForcada, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "Selecione a data e hora"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataAgendamentoForcada}
                      onSelect={(date) => {
                        if (date) {
                          const now = new Date();
                          // Set time to current hours and minutes when selecting a date
                          date.setHours(now.getHours(), now.getMinutes(), 0, 0);
                        }
                        setDataAgendamentoForcada(date);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Recomendado: Agende para horários de madrugada (2h-5h) quando há menos usuários online
                </p>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <p className="font-semibold mb-2">🤖 Como funciona o sistema automático:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Verificação a cada <strong>30 segundos</strong> dos agendamentos</li>
                    <li>Quando chegar a data/hora: <strong>reload automático</strong> para todos</li>
                    <li>Tela de loading de 3 segundos antes do reload</li>
                    <li>Agendamento é marcado como executado após rodar</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalAgendarForcada(false);
                  setDataAgendamentoForcada(null);
                  setTituloAgendamentoForcada("");
                  setDescricaoAgendamentoForcada("");
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAgendarAtualizacaoForcada}
                disabled={!dataAgendamentoForcada || !tituloAgendamentoForcada || agendarAtualizacaoForcadaMutation.isPending}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
              >
                {agendarAtualizacaoForcadaMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Agendando...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Confirmar Agendamento
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* NOVO: Modal Criar Notificação de Atualização */}
        <Dialog open={mostrarModalAtualizacao} onOpenChange={setMostrarModalAtualizacao}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" />
                Enviar Notificação de Atualização
              </DialogTitle>
              <DialogDescription>
                Preencha as informações da atualização que será enviada para todos os usuários
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Título da Atualização *</Label>
                <Input
                  placeholder="Ex: Nova Funcionalidade de Impulsionamento"
                  value={tituloAtualizacao}
                  onChange={(e) => setTituloAtualizacao(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Descrição Breve *</Label>
                <Textarea
                  placeholder="Resumo curto da atualização (aparece na notificação)"
                  value={descricaoAtualizacao}
                  onChange={(e) => setDescricaoAtualizacao(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Conteúdo Detalhado (opcional)</Label>
                <Textarea
                  placeholder="Explicação completa das mudanças, novidades, melhorias..."
                  value={conteudoAtualizacao}
                  onChange={(e) => setConteudoAtualizacao(e.target.value)}
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-4 h-4" />
                  Agendar Envio (opcional)
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="w-4 h-4 mr-2" />
                      {dataAgendamento ? format(dataAgendamento, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : "Enviar agora"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataAgendamento}
                      onSelect={(date) => {
                        if (date) {
                          const now = new Date();
                          // Set time to current hours and minutes when selecting a date
                          date.setHours(now.getHours(), now.getMinutes(), 0, 0);
                        }
                        setDataAgendamento(date);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dataAgendamento && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDataAgendamento(null)}
                    className="mt-2 text-xs"
                  >
                    Limpar agendamento
                  </Button>
                )}
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <p className="font-semibold mb-2">📢 Como funciona:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Notificação enviada para <strong>TODOS</strong> os usuários cadastrados</li>
                    <li>Aparece no <strong>sino de notificações</strong> do layout</li>
                    <li>Usuários podem clicar para ver detalhes completos</li>
                    <li>Se agendar: envio automático na data/hora escolhida</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalAtualizacao(false);
                  setTituloAtualizacao("");
                  setDescricaoAtualizacao("");
                  setConteudoAtualizacao("");
                  setDataAgendamento(null);
                }}
                disabled={enviandoAtualizacao}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleEnviarAtualizacao}
                disabled={enviandoAtualizacao || !tituloAtualizacao || !descricaoAtualizacao}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {enviandoAtualizacao ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : dataAgendamento ? (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Agendar Envio
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Agora
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* NOVO: Modal Tutorial Dr. Beleza */}
        <Dialog open={mostrarTutorialDrBeleza} onOpenChange={setMostrarTutorialDrBeleza}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center overflow-hidden">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe4/ec64a4c52_drbeleza.png"
                    alt="Dr. Beleza"
                    className="w-full h-full object-cover"
                  />
                </div>
                Dr. Beleza Explica: Painel Administrativo
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <MessageCircle className="h-5 w-5 text-blue-600" />
                <AlertDescription className="text-blue-900">
                  <p className="font-bold text-lg mb-2">👋 Olá Admin!</p>
                  <p>Sou o Dr. Beleza e vou te explicar todas as funcionalidades deste painel.</p>
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                {/* Aba Perfis */}
                <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <User className="w-6 h-6" />
                    📋 Aba Perfis
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-purple-800 mb-2">🔹 Solicitações de Planos:</p>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Ver todas as solicitações de upgrade de plano</li>
                        <li><strong>Ativar:</strong> Aprovar e ativar o plano do profissional</li>
                        <li><strong>Excluir:</strong> Remover solicitação (caso seja spam)</li>
                        <li><strong>Exportar PDF/WhatsApp:</strong> Gerar relatório das solicitações</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-purple-800 mb-2">🔹 Impulsionamentos:</p>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Gerenciar solicitações de impulsionamento de anúncios</li>
                        <li><strong>Ativar:</strong> Ativar o impulsionamento e notificar o usuário</li>
                        <li><strong>Relatórios PDF/WhatsApp:</strong> Exportar dados filtrados</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-purple-800 mb-2">🔹 Profissionais:</p>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Lista completa de todos profissionais cadastrados</li>
                        <li><strong>Trocar Plano:</strong> Alterar manualmente o plano ativo</li>
                        <li><strong>Editar Pontos:</strong> Ajustar pontos e Beauty Coins</li>
                        <li><strong>Excluir:</strong> Converte para paciente e reseta dados</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-purple-800 mb-2">🔹 Clube da Beleza:</p>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Membros com plano do Clube ativo</li>
                        <li><strong>Editar:</strong> Alterar Beauty Coins e pontos</li>
                        <li><strong>Sincronizar:</strong> Enviar dados para o site do Clube da Beleza</li>
                        <li>Integração automática de cadastros entre plataformas</li>
                      </ul>
                    </div>

                    <div>
                      <p className="font-semibold text-purple-800 mb-2">🔹 Patrocinadores:</p>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li>Ver todos patrocinadores ativos</li>
                        <li>Quantidade de banners e posts de cada um</li>
                        <li><strong>Editar Pontos:</strong> Gerenciar benefícios</li>
                        <li><strong>WhatsApp:</strong> Contato direto com patrocinador</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Aba Produtos */}
                <div className="bg-white p-6 rounded-lg border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" />
                    🛍️ Aba Produtos
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-green-800 mb-2">Funcionalidades:</p>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li><strong>Estatísticas:</strong> Total de pedidos, pendentes, clientes, valor total</li>
                        <li><strong>Filtros:</strong> Buscar por email/produto, filtrar por status e cliente</li>
                        <li><strong>Aprovar/Rejeitar:</strong> Gerenciar pedidos pendentes</li>
                        <li><strong>Relatórios:</strong> Exportar PDF ou enviar resumo via WhatsApp</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Aba Banners */}
                <div className="bg-white p-6 rounded-lg border-2 border-purple-200">
                  <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-6 h-6" />
                    🎨 Aba Banners
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-purple-800 mb-2">Funcionalidades:</p>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li><strong>Ver Detalhes:</strong> Imagem completa, dados do patrocinador, métricas</li>
                        <li><strong>Contato:</strong> Email, telefone e WhatsApp do patrocinador</li>
                        <li><strong>Baixar Arquivo:</strong> Download da imagem do banner</li>
                        <li><strong>Pausar/Ativar:</strong> Gerenciar status dos banners</li>
                        <li><strong>Relatórios:</strong> Exportar PDF ou enviar resumo via WhatsApp com filtros aplicados</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Aba Posts */}
                <div className="bg-white p-6 rounded-lg border-2 border-orange-200">
                  <h3 className="text-xl font-bold text-orange-900 mb-4 flex items-center gap-2">
                    <Newspaper className="w-6 h-6" />
                    📰 Aba Posts
                  </h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="font-semibold text-orange-800 mb-2">Funcionalidades:</p>
                      <ul className="list-disc ml-6 space-y-1 text-gray-700">
                        <li><strong>Ver Detalhes:</strong> Informações completas e dados do autor</li>
                        <li><strong>Ver Post:</strong> Abre o artigo no Blog (integração automática)</li>
                        <li><strong>Publicar:</strong> Mudar status de rascunho para publicado</li>
                        <li><strong>Excluir:</strong> Remover post permanentemente</li>
                        <li><strong>Relatórios:</strong> Exportar dados filtrados em PDF ou WhatsApp</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Dicas Gerais */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-lg border-2 border-yellow-300">
                  <h3 className="text-xl font-bold text-yellow-900 mb-4">💡 Dicas Importantes</h3>
                  <div className="space-y-3 text-sm text-yellow-900">
                    <p><strong>✅ Relatórios PDF:</strong> Use os botões de exportação em cada aba. O arquivo HTML baixado pode ser impresso como PDF (Ctrl+P).</p>
                    <p><strong>💬 Relatórios WhatsApp:</strong> Envie resumos rápidos diretamente pelo WhatsApp para compartilhar com a equipe.</p>
                    <p><strong>🔍 Use os Filtros:</strong> Os relatórios respeitam os filtros aplicados - busque antes de exportar!</p>
                    <p><strong>🔄 Sincronização Clube:</strong> Ao sincronizar um usuário com o Clube da Beleza, todos os dados (pontos, beauty coins, planos) são compartilhados automaticamente.</p>
                    <p><strong>⭐ Pontos e Beauty Coins:</strong> Você pode aumentar ou diminuir livremente - útil para recompensas ou correções.</p>
                  </div>
                </div>

                {/* Botão de Contato */}
                <div className="text-center pt-6">
                  <p className="text-gray-600 mb-4">Dúvidas sobre alguma funcionalidade?</p>
                  <Button
                    onClick={() => window.open('https://wa.me/5554991554136?text=Olá! Preciso de ajuda com o Painel Admin do Mapa da Estética.', '_blank')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Falar com Suporte Técnico
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
