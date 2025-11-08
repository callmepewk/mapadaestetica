
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
      return allUsers.filter(u => u.tipo_usuario === 'profissional' || u.tipo_usuario === 'admin'); // Admins can also be authors/sponsors
    },
    enabled: !!user,
  });

  const { data: pedidos = [], isLoading: loadingPedidos } = useQuery({
    queryKey: ['pedidos-produtos'],
    queryFn: () => base44.entities.PedidoProduto.list('-created_date', 500),
    enabled: !!user,
  });

  // Queries para Banners e Posts
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

  // NOVA Query: Todos os usuários (não só profissionais)
  const { data: todosUsuarios = [], isLoading: loadingTodosUsuarios } = useQuery({
    queryKey: ['todos-usuarios'],
    queryFn: async () => {
      return await base44.entities.User.list('-created_date', 1000);
    },
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
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6 gap-1">
            <TabsTrigger value="planos">
              <CreditCard className="w-4 h-4 mr-2" />
              Planos
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
                  Clube ({usuariosClube.length})
                </TabsTrigger>
                <TabsTrigger value="patrocinadores" className="text-xs sm:text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Patrocinadores ({usuariosPatrocinadores.length})
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
                      const mensagem = `📊 *RELATÓRIO DE PEDIDOS*\n\nTotal: ${pedidosFiltrados.length}\nPendentes: ${pedidosPendentes.length}\nValor: R$ ${pedidosFiltrados.reduce((s, p) => s + (p.valor_total || 0), 0).toFixed(2)}\n\nGerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}`;
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

          {/* ============================================ */}
          {/* TAB CONTROLE DE BANNERS */}
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

            {/* Tabela Banners */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Lista de Banners ({bannersFiltrados.length})</CardTitle>
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
          {/* TAB CONTROLE DE POSTS */}
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

            {/* Tabela Posts */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Lista de Posts ({postsFiltrados.length})</CardTitle>
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
                      <p className="text-gray-600">Conversões</p>
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
      </div>
    </div>
  );
}
