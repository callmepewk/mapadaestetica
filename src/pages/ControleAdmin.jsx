
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
  Sparkles,
  Heart,
  MapPin,
  Shield,
  Code,
  GitBranch,
  Plus,
  Minus,
  UserPlus,
  TrendingUp,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import ModalEditarUsuario from "../components/admin/ModalEditarUsuario";

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
  cancelado: { label: "Cancelado", cor: "bg-gray-100 text-gray-800", icon: XCircle },
  ativo: { label: "Ativo", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  pausado: { label: "Pausado", cor: "bg-yellow-100 text-yellow-800", icon: Clock },
  inativo: { label: "Inativo", cor: "bg-gray-100 text-gray-800", icon: XCircle },
  excluido: { label: "Excluído", cor: "bg-red-100 text-red-800", icon: Trash2 },
  publicado: { label: "Publicado", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  rascunho: { label: "Rascunho", cor: "bg-gray-100 text-gray-800", icon: FileText },
  programado: { label: "Programado", cor: "bg-blue-100 text-blue-800", icon: CalendarIcon },
  pendente: { label: "Pendente", cor: "bg-yellow-100 text-yellow-800", icon: Clock },
  expirado: { label: "Expirado", cor: "bg-red-100 text-red-800", icon: XCircle },
};


export default function ControleAdmin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [abaSelecionada, setAbaSelecionada] = useState("planos");
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState(null);
  
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [mostrarModalAtivar, setMostrarModalAtivar] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [processando, setProcessando] = useState(false);
  const [buscaProfissional, setBuscaProfissional] = useState("");
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [planoSelecionadoUsuario, setPlanoSelecionadoUsuario] = useState(null);
  const [mostrarModalTrocarPlano, setMostrarModalTrocarPlano] = useState(false);
  const [novoPlano, setNovoPlano] = useState("");
  
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");

  const [bannerSelecionado, setBannerSelecionado] = useState(null);
  const [postSelecionado, setPostSelecionado] = useState(null);
  const [mostrarDetalhesBanner, setMostrarDetalhesBanner] = useState(false);
  const [mostrarDetalhesPost, setMostrarDetalhesPost] = useState(false);
  const [buscaBanner, setBuscaBanner] = useState("");
  const [filtroStatusBanner, setFiltroStatusBanner] = useState("");
  const [buscaPost, setBuscaPost] = useState("");
  const [filtroStatusPost, setFiltroStatusPost] = useState("");

  const [usuarioEditandoPontos, setUsuarioEditandoPontos] = useState(null);
  const [mostrarModalPontos, setMostrarModalPontos] = useState(false);
  const [novosPontos, setNovosPontos] = useState(0);
  const [novosBeautyCoins, setNovosBeautyCoins] = useState(0);

  const [mostrarTutorialDrBeleza, setMostrarTutorialDrBeleza] = useState(false);
  
  const [mostrarModalAtualizacao, setMostrarModalAtualizacao] = useState(false);
  const [tituloAtualizacao, setTituloAtualizacao] = useState("");
  const [descricaoAtualizacao, setDescricaoAtualizacao] = useState("");
  const [conteudoAtualizacao, setConteudoAtualizacao] = useState("");
  const [dataAgendamento, setDataAgendamento] = useState(null);
  const [enviandoAtualizacao, setEnviandoAtualizacao] = useState(false);
  const [mostrarCarregamentoAtualizacao, setMostrarCarregamentoAtualizacao] = useState(false);
  
  const [mostrarModalAgendarForcada, setMostrarModalAgendarForcada] = useState(false);
  const [dataAgendamentoForcada, setDataAgendamentoForcada] = useState(null);
  const [tituloAgendamentoForcada, setTituloAgendamentoForcada] = useState("");
  const [descricaoAgendamentoForcada, setDescricaoAgendamentoForcada] = useState("");

  const [anuncioSelecionado, setAnuncioSelecionado] = useState(null);
  const [mostrarDetalhesAnuncio, setMostrarDetalhesAnuncio] = useState(false);
  const [buscaAnuncio, setBuscaAnuncio] = useState("");
  const [filtroStatusAnuncio, setFiltroStatusAnuncio] = useState("");

  const [buscaTodosUsuarios, setBuscaTodosUsuarios] = useState("");
  const [filtroTipoUsuario, setFiltroTipoUsuario] = useState("");
  const [filtroRole, setFiltroRole] = useState("");

  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [mostrarModalEditarUsuario, setMostrarModalEditarUsuario] = useState(false);
  const [dadosEdicaoUsuario, setDadosEdicaoUsuario] = useState({
    full_name: "",
    email: "",
    telefone: "",
    whatsapp: "",
    tipo_usuario: "",
    role: "",
    plano_ativo: "",
    plano_clube_beleza: "",
    plano_patrocinador: "",
    pontos_acumulados: 0,
    beauty_coins: 0,
    cadastro_completo: false
  });

  // NOVOS Estados para Controle de Versões
  const [mostrarModalNovaVersao, setMostrarModalNovaVersao] = useState(false);
  const [dadosNovaVersao, setDadosNovaVersao] = useState({
    titulo: "",
    descricao: "",
    conteudo_detalhado: "",
    data_agendamento: null,
    hora_agendamento: "03:00"
  });
  const [mostrarGerenciadorVersoes, setMostrarGerenciadorVersoes] = useState(false);
  const [gerandoDescricaoIA, setGerandoDescricaoIA] = useState(false); // NOVO: estado para o botão IA

  // NOVOS Estados para Contas Teste
  const [mostrarModalCriarTester, setMostrarModalCriarTester] = useState(false);
  const [dadosTester, setDadosTester] = useState({
    full_name: "",
    email: "",
    telefone: "",
    senha: "",
    plano_ativo: "cobre",
    plano_clube_beleza: "nenhum",
    plano_patrocinador: "nenhum",
    tipo_usuario: "profissional",
    dias_teste: 7
  });
  const [criandoTester, setCriandoTester] = useState(false);
  const [testerSelecionado, setTesterSelecionado] = useState(null);
  const [mostrarDetalhesTester, setMostrarDetalhesTester] = useState(false);
  const [estatisticasTester, setEstatisticasTester] = useState(null);
  const [diasAdicionais, setDiasAdicionais] = useState(0);

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

  const { data: todosAnuncios = [], isLoading: loadingAnuncios } = useQuery({
    queryKey: ['admin-anuncios'],
    queryFn: () => base44.entities.Anuncio.list('-created_date', 500),
    enabled: !!user,
  });

  // NOVA Query: Versões do Sistema
  const { data: versoes = [], isLoading: loadingVersoes } = useQuery({
    queryKey: ['versoes-sistema'],
    queryFn: async () => {
      return await base44.entities.VersaoSistema.list('-created_date', 100);
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // NOVA Query: Testers
  const { data: testers = [], isLoading: loadingTesters } = useQuery({
    queryKey: ['testers'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('-created_date', 1000);
      return allUsers.filter(u => u.role === 'tester');
    },
    enabled: !!user,
  });

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
    mutationFn: async ({ usuarioEmail, plano, solicitacaoId, usuarioNome, usuarioWhatsApp, observacoesTexto }) => {
      const beneficiosPlano = {
        cobre: {
          especialidades: "1 especialidade",
          anuncios: "1 anúncio ativo",
          tags: "1 tag",
          exposicao: "3 dias de exposição",
          extras: ["Visibilidade básica", "Suporte por email"]
        },
        prata: {
          especialidades: "2 especialidades",
          anuncios: "10 anúncios ativos",
          tags: "5 tags por anúncio",
          exposicao: "7 dias de exposição",
          extras: ["Destaque moderado", "Suporte por email e WhatsApp", "Estatísticas básicas"]
        },
        ouro: {
          especialidades: "3 especialidades",
          anuncios: "15 anúncios ativos",
          tags: "10 tags por anúncio",
          exposicao: "14 dias de exposição",
          extras: ["Destaque elevado", "Suporte prioritário", "Estatísticas completas", "Badge 'PRO' nos anúncios", "Impulsionamento com desconto"]
        },
        diamante: {
          especialidades: "5 especialidades",
          anuncios: "25 anúncios ativos",
          tags: "20 tags por anúncio",
          exposicao: "21 dias de exposição",
          extras: ["Máximo destaque", "Suporte VIP 24/7", "Dashboard completo", "Badge 'PRIME'", "Verificação profissional prioritária", "Aparece primeiro nas buscas", "Relatórios de preço de mercado", "Até 200 pacientes (Cloud.IA)"]
        },
        platina: {
          especialidades: "Ilimitadas",
          anuncios: "Ilimitados",
          tags: "100 tags por anúncio",
          exposicao: "30 dias de exposição",
          extras: ["Destaque PREMIUM máximo", "Concierge dedicado", "Consultoria de marketing incluída", "Badge 'DELUXE'", "Verificação express", "Topo absoluto em todas as buscas", "IA para criação de anúncios", "Relatórios personalizados", "Eventos exclusivos", "Smart Clinic + Cloud IA incluídos"]
        }
      };

      const beneficios = beneficiosPlano[plano];
      const nomePlano = PLANOS_INFO[plano].nome;

      const mensagemEmail = `
Olá!

Parabéns! 🎉 Seu plano ${nomePlano} foi ativado com sucesso no Mapa da Estética!

📋 SEU PLANO ATIVO: ${nomePlano.toUpperCase()}

✨ BENEFÍCIOS INCLUSOS:
• ${beneficios.especialidades}
• ${beneficios.anuncios}
• ${beneficios.tags}
• ${beneficios.exposicao} por anúncio
${beneficios.extras.map(e => `• ${e}`).join('\n')}

🚀 PRÓXIMOS PASSOS:
1. Acesse sua conta em: https://mapa-da-estetica.base44.app
2. Vá em "Cadastrar Anúncio" para criar seus anúncios
3. Complete seu perfil profissional
4. Aproveite todos os recursos disponíveis!

💡 DICA: Quanto mais completo seu anúncio, mais visualizações você terá!

Precisa de ajuda? Estamos aqui para você:
📞 Central de Vendas: (31) 97259-5643
🛠️ Suporte Técnico: (54) 99155-4136

Bem-vindo(a) à maior plataforma de estética do Brasil!

Atenciosamente,
Equipe Mapa da Estética
      `.trim();

      const mensagemWhatsApp = `
🎉 *PLANO ATIVADO COM SUCESSO!*

Olá! Seu plano *${nomePlano}* está ativo no Mapa da Estética! ✨

📋 *SEUS BENEFÍCIOS:*
• ${beneficios.especialidades}
• ${beneficios.anuncios}
• ${beneficios.tags}
• ${beneficios.exposicao}
${beneficios.extras.map(e => `• ${e}`).join('\n')}

🚀 *COMECE AGORA:*
1️⃣ Acesse: mapa-da-estetica.base44.app
2️⃣ Cadastre seus anúncios
3️⃣ Complete seu perfil

Dúvidas? Fale conosco:
📞 (31) 97259-5643
🛠️ Suporte: (54) 99155-4136

Bem-vindo(a)! 💆‍♀️
      `.trim();

      await base44.entities.User.update(usuarioEmail, { 
        plano_ativo: plano,
        data_adesao_plano: new Date().toISOString().split('T')[0]
      });
      
      await base44.entities.SolicitacaoAtivacaoPlano.update(solicitacaoId, {
        status: "ativado_admin",
        data_ativacao: new Date().toISOString(),
        observacoes: observacoesTexto || ""
      });

      await base44.integrations.Core.SendEmail({
        to: usuarioEmail,
        from_name: "Mapa da Estética",
        subject: `✅ Plano ${nomePlano} Ativado - Bem-vindo(a)!`,
        body: mensagemEmail
      });

      if (usuarioWhatsApp) {
        const whatsappLimpo = usuarioWhatsApp.replace(/\D/g, '');
        const urlWhatsApp = `https://wa.me/${whatsappLimpo}?text=${encodeURIComponent(mensagemWhatsApp)}`;
        window.open(urlWhatsApp, '_blank');
      }

      await base44.entities.Notificacao.create({
        usuario_email: usuarioEmail,
        tipo: 'plano_ativado',
        titulo: `🎉 Plano ${nomePlano} Ativado!`,
        mensagem: `Parabéns! Seu plano ${nomePlano} está ativo. Aproveite todos os benefícios!`,
        link_acao: createPageUrl("Perfil")
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-plano'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
      setMostrarModalAtivar(false);
      setSolicitacaoSelecionada(null);
      setObservacoes("");
      setSucesso("✅ Plano ativado! Email enviado e WhatsApp aberto.");
      setTimeout(() => setSucesso(null), 5000);
    },
    onError: (error) => {
      setErro("Erro ao ativar plano: " + error.message);
      setTimeout(() => setErro(null), 5000);
    }
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
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
      setSucesso("Plano atualizado!");
      setTimeout(() => setSucesso(null), 3000);
      setMostrarModalTrocarPlano(false);
      setPlanoSelecionadoUsuario(null);
      setNovoPlano("");
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
      await base44.entities.User.update(email, {
        tipo_usuario: 'paciente',
        plano_ativo: 'cobre',
        plano_patrocinador: 'nenhum'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
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
      queryClient.invalidateQueries({ queryKey: ['testers'] }); // Invalidate testers query
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

  const enviarAtualizacaoMutation = useMutation({
    mutationFn: async ({ titulo, descricao, conteudo, agendada, dataPublicacao }) => {
      const novidade = await base44.entities.Novidade.create({
        titulo,
        descricao,
        conteudo_detalhado: conteudo,
        data_publicacao: dataPublicacao || new Date().toISOString(),
        categoria: 'nova_funcionalidade',
        icone: '🚀',
        status: agendada ? 'programado' : 'publicado'
      });

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
      setMostrarCarregamentoAtualizacao(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      window.location.reload();
    },
  });

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

  const deletarAnuncioMutation = useMutation({
    mutationFn: (id) => base44.entities.Anuncio.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-anuncios'] });
      setSucesso("Anúncio excluído!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      setErro("Erro ao excluir anúncio: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  });

  const atualizarStatusAnuncioMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      await base44.entities.Anuncio.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-anuncios'] });
      setSucesso("Status do anúncio atualizado!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      setErro("Erro ao atualizar status do anúncio: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  });

  const editarUsuarioCompletoMutation = useMutation({
    mutationFn: async ({ email, dados }) => {
      await base44.entities.User.update(email, dados);
    },
    onSuccess: async () => {
      // Invalidar TODAS as queries relacionadas a usuários
      await queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
      await queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      await queryClient.invalidateQueries({ queryKey: ['testers'] });
      
      // Refetch imediato
      await queryClient.refetchQueries({ queryKey: ['todos-usuarios'] });
      await queryClient.refetchQueries({ queryKey: ['usuarios-profissionais'] });
      
      setMostrarModalEditarUsuario(false);
      setUsuarioEditando(null);
      setSucesso("✅ Usuário atualizado! Atualizando dados...");
      
      // Forçar reload após 1 segundo para garantir sincronização total
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    },
    onError: (error) => {
      setErro("Erro ao atualizar usuário: " + error.message);
      setTimeout(() => setErro(null), 5000);
    }
  });

  // NOVA Mutation: Criar Nova Versão
  const criarNovaVersaoMutation = useMutation({
    mutationFn: async ({ titulo, descricao, conteudo, dataHoraAgendamento }) => {
      const todasVersoes = await base44.entities.VersaoSistema.list('-created_date', 1000);
      
      let proximaVersao = "1.0";
      if (todasVersoes.length > 0) {
        const versaoAtualFromList = todasVersoes.find(v => v.status === 'atual');
        if (versaoAtualFromList) {
          const partes = versaoAtualFromList.numero_versao.split('.');
          const major = parseInt(partes[0]);
          const minor = parseInt(partes[1]);
          proximaVersao = `${major}.${minor + 1}`;
        } else {
          // If no 'atual' version found, find the highest minor version and increment
          const highestMinor = todasVersoes.reduce((max, v) => {
            const parts = v.numero_versao.split('.');
            const minor = parseInt(parts[1]);
            return minor > max ? minor : max;
          }, -1);
          proximaVersao = `1.${highestMinor + 1}`;
        }
      }

      const novaVersao = await base44.entities.VersaoSistema.create({
        numero_versao: proximaVersao,
        titulo,
        descricao,
        conteudo_detalhado: conteudo,
        data_agendamento: dataHoraAgendamento.toISOString(),
        data_lancamento: dataHoraAgendamento.toISOString(), // Temporarily set, will be updated on activation
        status: 'agendada',
        usuarios_nesta_versao: 0,
        notificacoes_enviadas: false,
        forcada: true
      });

      const todosUsuariosLista = await base44.entities.User.list('-created_date', 2000);
      const dataFormatada = format(dataHoraAgendamento, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      
      for (const usuario of todosUsuariosLista) {
        try {
          const mensagemEmail = `
Olá ${usuario.full_name}!

📢 NOVA ATUALIZAÇÃO PROGRAMADA - MAPA DA ESTÉTICA

🚀 Versão ${proximaVersao}: ${titulo}

📅 Data e Horário da Atualização:
${dataFormatada}

📋 O que muda:
${descricao}

${conteudo ? `\n📝 Detalhes:\n${conteudo}\n` : ''}

⚠️ IMPORTANTE:
• O site será atualizado automaticamente no horário programado
• Você será redirecionado para a nova versão
• Não se preocupe - todos os seus dados estarão seguros!

Se tiver dúvidas:
📞 Suporte: (54) 99155-4136
💬 Central: (31) 97259-5643

Atenciosamente,
Equipe Mapa da Estética
          `.trim();

          await base44.integrations.Core.SendEmail({
            to: usuario.email,
            from_name: "Mapa da Estética - Atualizações",
            subject: `🚀 Nova Atualização Programada - Versão ${proximaVersao}`,
            body: mensagemEmail
          });

          await base44.entities.Notificacao.create({
            usuario_email: usuario.email,
            tipo: 'nova_versao_agendada',
            titulo: `🚀 Atualização para Versão ${proximaVersao}`,
            mensagem: `Nova versão agendada para ${dataFormatada}. ${titulo}`,
            link_acao: '/novidades'
          });
        } catch (error) {
          console.error(`Erro ao enviar email para ${usuario.email}:`, error);
        }
      }

      await base44.entities.VersaoSistema.update(novaVersao.id, {
        notificacoes_enviadas: true
      });

      return novaVersao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versoes-sistema'] });
      setMostrarModalNovaVersao(false);
      setDadosNovaVersao({
        titulo: "",
        descricao: "",
        conteudo_detalhado: "",
        data_agendamento: null,
        hora_agendamento: "03:00"
      });
      setSucesso("✅ Nova versão agendada! Emails enviados para todos os usuários.");
      setTimeout(() => setSucesso(null), 5000);
    },
    onError: (error) => {
      setErro("Erro ao criar nova versão: " + error.message);
      setTimeout(() => setErro(null), 5000);
    }
  });

  // NOVO: Mutation para publicação imediata de versão
  const forcarPublicacaoImediataMutation = useMutation({
    mutationFn: async ({ titulo, descricao, conteudo }) => {
      const todasVersoes = await base44.entities.VersaoSistema.list('-created_date', 1000);
      let proximaVersao = "1.0";

      if (todasVersoes.length > 0) {
        const versaoAtualFromList = versoes.find(v => v.status === 'atual');
        if (versaoAtualFromList) {
          await base44.entities.VersaoSistema.update(versaoAtualFromList.id, {
            status: 'anterior'
          });
          const partes = versaoAtualFromList.numero_versao.split('.');
          const major = parseInt(partes[0]);
          const minor = parseInt(partes[1]);
          proximaVersao = `${major}.${minor + 1}`;
        } else {
           const highestMinor = todasVersoes.reduce((max, v) => {
            const parts = v.numero_versao.split('.');
            const minor = parseInt(parts[1]);
            return minor > max ? minor : max;
          }, -1);
          proximaVersao = `1.${highestMinor + 1}`;
        }
      }
      
      const dataLancamento = new Date().toISOString();
      const novaVersao = await base44.entities.VersaoSistema.create({
        numero_versao: proximaVersao,
        titulo,
        descricao,
        conteudo_detalhado: conteudo,
        data_lancamento: dataLancamento,
        data_agendamento: dataLancamento, // For consistency, set scheduled date to now
        status: 'atual',
        usuarios_nesta_versao: 0,
        notificacoes_enviadas: false, // No prior email notifications for immediate launch
        forcada: true
      });

      const todosUsuariosLista = await base44.entities.User.list('-created_date', 2000);
      for (const usuario of todosUsuariosLista) {
        await base44.entities.User.update(usuario.email, {
          versao_sistema: novaVersao.numero_versao
        });
        await base44.entities.Notificacao.create({
          usuario_email: usuario.email,
          tipo: 'nova_versao_ativa',
          titulo: `✨ Nova Versão Ativa: ${titulo}`,
          mensagem: `A plataforma foi atualizada para a versão ${novaVersao.numero_versao} com novidades!`,
          link_acao: '/novidades'
        });
      }

      await base44.entities.VersaoSistema.update(novaVersao.id, {
        usuarios_nesta_versao: todosUsuariosLista.length
      });

      return novaVersao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versoes-sistema'] });
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
      setMostrarModalNovaVersao(false);
      setDadosNovaVersao({
        titulo: "",
        descricao: "",
        conteudo_detalhado: "",
        data_agendamento: null,
        hora_agendamento: "03:00"
      });
      setSucesso("✅ Nova versão publicada imediatamente! Todos os usuários foram atualizados.");
      setMostrarCarregamentoAtualizacao(true); // Show reload screen
      setTimeout(() => window.location.reload(), 3000); // Force reload
    },
    onError: (error) => {
      setErro("Erro ao publicar nova versão imediatamente: " + error.message);
      setTimeout(() => setErro(null), 5000);
    }
  });


  // NOVA Mutation: Ativar Versão (quando chegar a hora)
  const ativarVersaoMutation = useMutation({
    mutationFn: async (versaoId) => {
      const versaoAtualFromList = versoes.find(v => v.status === 'atual');
      if (versaoAtualFromList) {
        await base44.entities.VersaoSistema.update(versaoAtualFromList.id, {
          status: 'anterior'
        });
      }

      const novaVersao = versoes.find(v => v.id === versaoId);
      await base44.entities.VersaoSistema.update(versaoId, {
        status: 'atual',
        data_lancamento: new Date().toISOString()
      });

      const todosUsuariosLista = await base44.entities.User.list('-created_date', 2000);
      for (const usuario of todosUsuariosLista) {
        await base44.entities.User.update(usuario.email, {
          versao_sistema: novaVersao.numero_versao
        });
      }

      await base44.entities.VersaoSistema.update(versaoId, {
        usuarios_nesta_versao: todosUsuariosLista.length
      });

      window.location.reload();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['versoes-sistema'] });
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
    }
  });

  // NOVA Mutation: Deletar Versão Antiga
  const deletarVersaoMutation = useMutation({
    mutationFn: async (versaoId) => {
      const versao = versoes.find(v => v.id === versaoId);
      
      if (versao.status === 'atual') {
        throw new Error("Não é possível deletar a versão atual!");
      }

      const versaoAtualFromList = versoes.find(v => v.status === 'atual');
      if (!versaoAtualFromList) {
        throw new Error("Nenhuma versão atual encontrada!");
      }

      const todosUsuariosLista = await base44.entities.User.list('-created_date', 2000);
      const usuariosNaVersaoAntiga = todosUsuariosLista.filter(u => u.versao_sistema === versao.numero_versao);
      
      for (const usuario of usuariosNaVersaoAntiga) {
        await base44.entities.User.update(usuario.email, {
          versao_sistema: versaoAtualFromList.numero_versao
        });
      }

      const usuariosVersaoAtual = todosUsuariosLista.filter(u => 
        u.versao_sistema === versaoAtualFromList.numero_versao || u.versao_sistema === versao.numero_versao
      );
      await base44.entities.VersaoSistema.update(versaoAtualFromList.id, {
        usuarios_nesta_versao: usuariosVersaoAtual.length
      });

      await base44.entities.VersaoSistema.delete(versaoId);

      return { 
        usuariosTransferidos: usuariosNaVersaoAntiga.length,
        versaoDestino: versaoAtualFromList.numero_versao 
      };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['versoes-sistema'] });
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
      setSucesso(`✅ Versão deletada! ${data.usuariosTransferidos} usuários transferidos para versão ${data.versaoDestino}`);
      setTimeout(() => setSucesso(null), 5000);
    },
    onError: (error) => {
      setErro("Erro ao deletar versão: " + error.message);
      setTimeout(() => setErro(null), 5000);
    }
  });

  // NOVA Mutation: Criar Tester
  const criarTesterMutation = useMutation({
    mutationFn: async (dados) => {
      // Calcular data de expiração
      const dataExpiracao = new Date();
      dataExpiracao.setDate(dataExpiracao.getDate() + dados.dias_teste);

      // IMPORTANTE: Não podemos criar usuários diretamente via API
      // Precisamos enviar email de convite
      await base44.integrations.Core.SendEmail({
        to: "pedro_hbfreitas@hotmail.com", // This should probably be an admin email configurable or to the current admin. For now, hardcoded from the outline.
        from_name: "Mapa da Estética - Admin",
        subject: `SOLICITAÇÃO DE CRIAÇÃO DE CONTA TESTE - ${dados.full_name}`,
        body: `
SOLICITAÇÃO DE CRIAÇÃO DE CONTA TESTE

Nome: ${dados.full_name}
Email: ${dados.email}
Telefone: ${dados.telefone}
Senha: ${dados.senha}
Tipo: ${dados.tipo_usuario}

PLANOS:
- Mapa da Estética: ${dados.plano_ativo}
- Clube da Beleza: ${dados.plano_clube_beleza}
- Patrocinador: ${dados.plano_patrocinador}

Período: ${dados.dias_teste} dias
Data Expiração: ${format(dataExpiracao, "dd/MM/yyyy", { locale: ptBR })}

CONFIGURAÇÕES NECESSÁRIAS:
1. Convidar usuário para email: ${dados.email}
2. Após aceite, atualizar:
   - role: tester
   - data_expiracao_teste: ${dataExpiracao.toISOString()}
   - plano_ativo: ${dados.plano_ativo}
   - plano_clube_beleza: ${dados.plano_clube_beleza}
   - plano_patrocinador: ${dados.plano_patrocinador}
   - tipo_usuario: ${dados.tipo_usuario}
        `.trim()
      });

      return { email: dados.email };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      setMostrarModalCriarTester(false);
      setDadosTester({
        full_name: "",
        email: "",
        telefone: "",
        senha: "",
        plano_ativo: "cobre",
        plano_clube_beleza: "nenhum",
        plano_patrocinador: "nenhum",
        tipo_usuario: "profissional",
        dias_teste: 7
      });
      setSucesso("✅ Solicitação de criação de conta teste enviada! Convide o usuário pelo dashboard.");
      setTimeout(() => setSucesso(null), 5000);
    },
    onError: (error) => {
      setErro("Erro ao criar tester: " + error.message);
      setTimeout(() => setErro(null), 5000);
    }
  });

  // NOVA Mutation: Estender Período Tester
  const estenderPeriodoTesterMutation = useMutation({
    mutationFn: async ({ email, diasAdicionais }) => {
      const tester = testers.find(t => t.email === email);
      if (!tester) throw new Error("Tester não encontrado");

      let dataAtual = tester.data_expiracao_teste ? new Date(tester.data_expiracao_teste) : new Date();
      // If current expiration is in the past, start from now
      if (dataAtual < new Date()) {
        dataAtual = new Date();
      }
      dataAtual.setDate(dataAtual.getDate() + diasAdicionais);

      await base44.entities.User.update(email, {
        data_expiracao_teste: dataAtual.toISOString()
      });

      return { novaData: dataAtual };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      setSucesso(`✅ Período estendido até ${format(data.novaData, "dd/MM/yyyy", { locale: ptBR })}`);
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      setErro("Erro ao estender período: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  });

  // NOVA Mutation: Deletar Tester
  const deletarTesterMutation = useMutation({
    mutationFn: async (email) => {
      await base44.entities.User.update(email, {
        role: 'user',
        data_expiracao_teste: null,
        plano_ativo: 'cobre',
        plano_clube_beleza: 'nenhum',
        plano_patrocinador: 'nenhum'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testers'] });
      queryClient.invalidateQueries({ queryKey: ['todos-usuarios'] });
      setMostrarDetalhesTester(false);
      setTesterSelecionado(null);
      setSucesso("✅ Conta teste removida! Convertida para usuário comum.");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      setErro("Erro ao deletar tester: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  });

  // Verificar versões agendadas e ativar automaticamente
  useEffect(() => {
    if (!versoes || versoes.length === 0) return;

    const intervalo = setInterval(() => {
      const agora = new Date();
      
      versoes.forEach(async (versao) => {
        if (versao.status === 'agendada' && versao.data_agendamento) {
          const dataAgendada = new Date(versao.data_agendamento);
          
          if (agora >= dataAgendada) {
            ativarVersaoMutation.mutate(versao.id);
          }
        }
      });
    }, 30000);

    return () => clearInterval(intervalo);
  }, [versoes, ativarVersaoMutation]);

  useEffect(() => {
    if (!agendamentos || agendamentos.length === 0) return;

    const intervalo = setInterval(() => {
      const agora = new Date();
      
      agendamentos.forEach(async (agendamento) => {
        const dataAgendada = new Date(agendamento.data_agendada);
        
        if (agora >= dataAgendada && !agendamento.executado) {
          await base44.entities.AgendamentoAtualizacao.update(agendamento.id, {
            executado: true,
            data_execucao: new Date().toISOString()
          });
          
          setMostrarCarregamentoAtualizacao(true);
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }
      });
    }, 30000);

    return () => clearInterval(intervalo);
  }, [agendamentos]);

  const handleAtivarPlano = async () => {
    if (!solicitacaoSelecionada) return;
    setProcessando(true);
    try {
      const todosUsuariosList = await base44.entities.User.list('-created_date', 1000);
      const usuarioData = todosUsuariosList.find(u => u.email === solicitacaoSelecionada.usuario_email);
      
      await ativarPlanoMutation.mutateAsync({
        usuarioEmail: solicitacaoSelecionada.usuario_email,
        plano: solicitacaoSelecionada.plano_solicitado,
        solicitacaoId: solicitacaoSelecionada.id,
        usuarioNome: solicitacaoSelecionada.usuario_nome,
        usuarioWhatsApp: usuarioData?.whatsapp || null,
        observacoesTexto: observacoes
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

  const handleVerDetalhesPost = (post) => {
    setPostSelecionado(post);
    setMostrarDetalhesPost(true);
  };

  const handleVerPostagemBlog = (post) => {
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

  const handleVerDetalhesAnuncio = (anuncio) => {
    setAnuncioSelecionado(anuncio);
    setMostrarDetalhesAnuncio(true);
  };

  const handleEditarAnuncio = (anuncio) => {
    navigate(`${createPageUrl("EditarAnuncio")}?id=${anuncio.id}`);
  };

  const handleAlterarStatusAnuncio = async (anuncio, novoStatus) => {
    if (confirm(`Alterar status do anúncio "${anuncio.titulo}" para ${novoStatus}?`)) {
      atualizarStatusAnuncioMutation.mutate({ id: anuncio.id, status: novoStatus });
    }
  };

  const handleExcluirAnuncio = async (anuncio) => {
    if (confirm(`Tem certeza que deseja excluir o anúncio "${anuncio.titulo}"?\n\nEsta ação não pode ser desfeita.`)) {
      deletarAnuncioMutation.mutate(anuncio.id);
    }
  };

  const handleEstenderTempoExposicao = async (anuncio, diasAdicionais) => {
    const diasInput = prompt(`Quantos dias deseja adicionar ao anúncio "${anuncio.titulo}"?\n\nTempo atual restante: ${calcularTempoRestante(anuncio)}`, diasAdicionais || 7);
    
    if (!diasInput || isNaN(diasInput)) return;
    
    const dias = parseInt(diasInput);
    
    if (dias <= 0) {
      alert("O número de dias deve ser maior que zero");
      return;
    }
    
    try {
      let dataExpiracao = anuncio.data_expiracao ? new Date(anuncio.data_expiracao) : new Date();
      
      if (dataExpiracao < new Date()) {
        dataExpiracao = new Date();
      }
      
      dataExpiracao.setDate(dataExpiracao.getDate() + dias);
      
      await base44.entities.Anuncio.update(anuncio.id, {
        dias_exposicao: (anuncio.dias_exposicao || 0) + dias,
        data_expiracao: dataExpiracao.toISOString()
      });
      
      queryClient.invalidateQueries({ queryKey: ['admin-anuncios'] });
      setSucesso(`✅ Adicionados ${dias} dias de exposição!`);
      setTimeout(() => setSucesso(null), 3000);
      setMostrarDetalhesAnuncio(false);
      setAnuncioSelecionado(null);
    } catch (error) {
      setErro("Erro ao estender tempo de exposição: " + error.message);
      setTimeout(() => setErro(null), 3000);
    }
  };

  const calcularTempoRestante = (anuncio) => {
    if (!anuncio || !anuncio.data_expiracao) return "Sem expiração";
    
    const agora = new Date();
    const expiracao = new Date(anuncio.data_expiracao);
    const diffTime = expiracao - agora;
    
    if (diffTime < 0) return "Expirado";
    
    const diffDias = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDias === 0) return "Expira hoje";
    if (diffDias === 1) return "1 dia restante";
    return `${diffDias} dias restantes`;
  };

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
          <div class="card"><h4>🏢 Patrocinadores</h4><p>${todosUsuarios.filter(u => u.tipo_usuario === 'patrocinador').length}</p></div>
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
                <td>${PLANOS_INFO[b.plano_patrocinador]?.nome || b.plano_patrocinador || 'Nenhum'}</td>
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

  const exportarRelatorioAnuncios = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Anúncios</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #EC4899; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-left: left; }
          th { background: #EC4899; color: white; }
        </style>
      </head>
      <body>
        <h1>📢 Relatório de Anúncios</h1>
        <p>Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
        <p><strong>Total:</strong> ${anunciosFiltrados.length}</p>
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Profissional</th>
              <th>Email</th>
              <th>Status</th>
              <th>Visualizações</th>
              <th>Expira em</th>
            </tr>
          </thead>
          <tbody>
            ${anunciosFiltrados.map(a => `
              <tr>
                <td>${a.titulo}</td>
                <td>${a.profissional}</td>
                <td>${a.created_by}</td>
                <td>${a.status}</td>
                <td>${a.visualizacoes || 0}</td>
                <td>${calcularTempoRestante(a)}</td>
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
    a.download = `anuncios-${format(new Date(), "yyyy-MM-dd")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const enviarRelatorioAnunciosWhatsApp = () => {
    const mensagem = `
📊 *RELATÓRIO DE ANÚNCIOS*
Data: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}

📈 *RESUMO:*
Total: ${anunciosFiltrados.length}
Ativos: ${anunciosFiltrados.filter(a => a.status === 'ativo').length}
Pendentes: ${anunciosFiltrados.filter(a => a.status === 'pendente').length}
Expirados: ${anunciosFiltrados.filter(a => a.status === 'expirado').length}

👁️ Visualizações: ${anunciosFiltrados.reduce((acc, a) => acc + (a.visualizacoes || 0), 0)}
❤️ Curtidas: ${anunciosFiltrados.reduce((acc, a) => acc + (a.curtidas || 0), 0)}
    `.trim();
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const handleEnviarAtualizacao = () => {
    if (!tituloAtualizacao || !descricaoAtualizacao) {
      setErro("Preencha título e descrição!");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    setEnviandoAtualizacao(true);
    try {
      enviarAtualizacaoMutation.mutate({
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

    if (confirm(`Confirma o agendamento de atualização forçada para ${format(dataAgendamentoForcada, "dd/MM/yyyy 'às' HH:mm', { locale: ptBR })}?\n\nTodos os usuários terão o site recarregado automaticamente neste horário.`)) {
      agendarAtualizacaoForcadaMutation.mutate({
        dataAgendada: dataAgendamentoForcada.toISOString(),
        titulo: tituloAgendamentoForcada,
        descricao: descricaoAgendamentoForcada
      });
    }
  };

  const handleEditarUsuarioCompleto = (usuario) => {
    setUsuarioEditando(usuario);
    setDadosEdicaoUsuario({
      full_name: usuario.full_name || "",
      email: usuario.email || "",
      telefone: usuario.telefone || "",
      whatsapp: usuario.whatsapp || "",
      tipo_usuario: usuario.tipo_usuario || "",
      role: usuario.role || "user",
      plano_ativo: usuario.plano_ativo || "cobre",
      plano_clube_beleza: usuario.plano_clube_beleza || "nenhum",
      plano_patrocinador: usuario.plano_patrocinador || "nenhum",
      pontos_acumulados: usuario.pontos_acumulados || 0,
      beauty_coins: usuario.beauty_coins || 0,
      cadastro_completo: usuario.cadastro_completo || false
    });
    setMostrarModalEditarUsuario(true);
  };

  const confirmarEdicaoUsuario = () => {
    if (!usuarioEditando) return;
    
    if (confirm(`⚠️ CONFIRMAR ALTERAÇÕES?\n\nUsuário: ${usuarioEditando.full_name}\n\nNovo Tipo: ${dadosEdicaoUsuario.tipo_usuario}\nNovo Plano Mapa: ${PLANOS_INFO[dadosEdicaoUsuario.plano_ativo]?.nome}\nNovo Plano Clube: ${dadosEdicaoUsuario.plano_clube_beleza}\nNovo Plano Patrocinador: ${dadosEdicaoUsuario.plano_patrocinador}\n\nEsta ação será aplicada IMEDIATAMENTE.`)) {
      editarUsuarioCompletoMutation.mutate({
        email: usuarioEditando.email,
        dados: dadosEdicaoUsuario
      });
    }
  };

  const handleGerarDescricaoIA = async () => {
    if (!dadosNovaVersao.titulo) {
      setErro("Por favor, insira um título para a versão antes de pedir ajuda à IA.");
      setTimeout(() => setErro(null), 3000);
      return;
    }
    setGerandoDescricaoIA(true);
    setErro(null);
    try {
      const prompt = `Crie uma descrição resumida para a seguinte atualização do sistema, com foco nos benefícios para o usuário (até 3 frases): "${dadosNovaVersao.titulo}"`;
      const response = await base44.integrations.Core.GenerateResponse({
        prompt: prompt,
        model: "gpt-3.5-turbo",
        max_tokens: 100
      });
      if (response && response.response) {
        setDadosNovaVersao(prev => ({ ...prev, descricao: response.response.trim() }));
      } else {
        throw new Error("Não foi possível gerar a descrição. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao gerar descrição com IA:", error);
      setErro("Erro ao gerar descrição com IA: " + (error.message || "Serviço indisponível."));
      setTimeout(() => setErro(null), 5000);
    } finally {
      setGerandoDescricaoIA(false);
    }
  };

  const handleCriarNovaVersao = () => {
    if (!dadosNovaVersao.titulo || !dadosNovaVersao.descricao) {
      setErro("Preencha título e descrição da versão!");
      setTimeout(() => setErro(null), 3000);
      return;
    }
    if (!dadosNovaVersao.data_agendamento) {
      setErro("Selecione uma data para agendar a versão, ou use o botão 'Publicar Agora'.");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    const [hora, minuto] = dadosNovaVersao.hora_agendamento.split(':');
    const dataCompleta = new Date(dadosNovaVersao.data_agendamento);
    dataCompleta.setHours(parseInt(hora), parseInt(minuto), 0, 0);

    if (dataCompleta <= new Date()) {
      setErro("A data/hora agendada deve ser no futuro!");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    const dataFormatada = format(dataCompleta, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    if (confirm(`Confirma o agendamento da nova versão?\n\nTítulo: ${dadosNovaVersao.titulo}\nData/Hora: ${dataFormatada}\n\nTODOS os usuários receberão email de notificação.`)) {
      criarNovaVersaoMutation.mutate({
        titulo: dadosNovaVersao.titulo,
        descricao: dadosNovaVersao.descricao,
        conteudo: dadosNovaVersao.conteudo_detalhado,
        dataHoraAgendamento: dataCompleta
      });
    }
  };

  const handleForcarPublicacaoImediata = () => {
    if (!dadosNovaVersao.titulo || !dadosNovaVersao.descricao) {
      setErro("Preencha título e descrição da versão!");
      setTimeout(() => setErro(null), 3000);
      return;
    }
    if (confirm(`⚠️ ATENÇÃO: Confirma a PUBLICAÇÃO IMEDIATA da nova versão?\n\nTítulo: ${dadosNovaVersao.titulo}\n\nEsta ação irá:\n- Forçar a atualização para TODOS os usuários AGORA.\n- Recarregar o site automaticamente para todos.\n- A versão atual passará para "anterior".\n\nDESEJA CONTINUAR?`)) {
      forcarPublicacaoImediataMutation.mutate({
        titulo: dadosNovaVersao.titulo,
        descricao: dadosNovaVersao.descricao,
        conteudo: dadosNovaVersao.conteudo_detalhado,
      });
    }
  };

  const handleDeletarVersao = (versao) => {
    if (confirm(`⚠️ ATENÇÃO: Deletar versão ${versao.numero_versao}?\n\nIsto irá:\n• Liberar cache desta versão\n• Transferir ${versao.usuarios_nesta_versao || 0} usuários para a versão atual\n• Remover permanentemente esta versão do histórico\n\nDeseja continuar?`)) {
      deletarVersaoMutation.mutate(versao.id);
    }
  };

  const handleForcarAtivarVersao = (versao) => {
    if (confirm(`⚠️ ATENÇÃO: Deseja ativar a versão ${versao.numero_versao} AGORA?\n\nEsta ação irá:\n- Mudar a versão atual para "anterior".\n- Definir ${versao.numero_versao} como a nova "versão atual".\n- Recarregar o site para todos os usuários online.\n\nRecomendado apenas para uso emergencial. DESEJA CONTINUAR?`)) {
      ativarVersaoMutation.mutate(versao.id);
    }
  };

  const handleCriarTester = () => {
    if (!dadosTester.full_name || !dadosTester.email) {
      setErro("Preencha nome e email!");
      setTimeout(() => setErro(null), 3000);
      return;
    }

    if (confirm(`Criar solicitação de conta teste?\n\nNome: ${dadosTester.full_name}\nEmail: ${dadosTester.email}\nPeríodo: ${dadosTester.dias_teste} dias\n\nUm email será enviado ao admin para convidar o usuário.`)) {
      criarTesterMutation.mutate(dadosTester);
    }
  };

  const handleVerDetalhesTester = async (tester) => {
    setTesterSelecionado(tester);
    
    // Buscar estatísticas
    try {
      const [anuncios, banners, posts, produtos, impulsionamentos] = await Promise.all([
        base44.entities.Anuncio.filter({ created_by: tester.email }),
        base44.entities.Banner.filter({ created_by: tester.email }),
        base44.entities.ArtigoBlog.filter({ created_by: tester.email }),
        base44.entities.Produto.filter({ created_by: tester.email }),
        base44.entities.SolicitacaoImpulsionamento.filter({ usuario_email: tester.email })
      ]);

      const dataInicio = new Date(tester.created_date);
      const agora = new Date();
      const diasUsando = Math.ceil((agora - dataInicio) / (1000 * 60 * 60 * 24));

      setEstatisticasTester({
        anuncios: anuncios.length,
        banners: banners.length,
        posts: posts.length,
        produtos: produtos.length,
        impulsionamentos: impulsionamentos.length,
        dias_usando: diasUsando,
        total_visualizacoes: anuncios.reduce((acc, a) => acc + (a.visualizacoes || 0), 0),
        total_curtidas: anuncios.reduce((acc, a) => acc + (a.curtidas || 0), 0)
      });
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      setEstatisticasTester(null);
    }

    setMostrarDetalhesTester(true);
  };

  const handleEstenderPeriodo = (dias) => {
    if (!testerSelecionado) return;
    
    estenderPeriodoTesterMutation.mutate({
      email: testerSelecionado.email,
      diasAdicionais: dias
    });
  };

  const handleDeletarTester = () => {
    if (!testerSelecionado) return;
    
    if (confirm(`⚠️ REMOVER CONTA TESTE?\n\nUsuário: ${testerSelecionado.full_name}\nEmail: ${testerSelecionado.email}\n\nEsta ação irá:\n• Converter para usuário comum\n• Resetar todos os planos para gratuito\n• Remover data de expiração`)) {
      deletarTesterMutation.mutate(testerSelecionado.email);
    }
  };

  const exportarRelatorioTesters = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Contas Teste</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #3B82F6; border-bottom: 3px solid #3B82F6; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #3B82F6; color: white; }
          .section { background: #F3F4F6; padding: 15px; margin: 20px 0; border-radius: 8px; }
        </style>
      </head>
      <body>
        <h1>🧪 Relatório de Contas Teste</h1>
        <p>Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
        <div class="section">
          <p><strong>Total de Testers:</strong> ${testers.length}</p>
          <p><strong>Ativos:</strong> ${testers.filter(t => {
            const exp = t.data_expiracao_teste ? new Date(t.data_expiracao_teste) : null;
            return exp && exp > new Date();
          }).length}</p>
          <p><strong>Expirados:</strong> ${testers.filter(t => {
            const exp = t.data_expiracao_teste ? new Date(t.data_expiracao_teste) : null;
            return exp && exp <= new Date();
          }).length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Plano Mapa</th>
              <th>Clube</th>
              <th>Patrocinador</th>
              <th>Expira em</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${testers.map(t => {
              const exp = t.data_expiracao_teste ? new Date(t.data_expiracao_teste) : null;
              const status = exp && exp > new Date() ? 'Ativo' : 'Expirado';
              return `
                <tr>
                  <td>${t.full_name}</td>
                  <td>${t.email}</td>
                  <td>${PLANOS_INFO[t.plano_ativo]?.nome || 'Cobre'}</td>
                  <td>${t.plano_clube_beleza === 'ativo' ? 'Ativo' : 'Nenhum'}</td>
                  <td>${t.plano_patrocinador !== 'nenhum' ? (PLANOS_INFO[t.plano_patrocinador]?.nome || t.plano_patrocinador) : 'Nenhum'}</td>
                  <td>${exp ? format(exp, "dd/MM/yyyy", { locale: ptBR }) : 'N/D'}</td>
                  <td>${status}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `testers-${format(new Date(), "yyyy-MM-dd")}.html`;
    a.click();
    URL.revokeObjectURL(url);
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

  const bannersFiltrados = banners.filter(b => {
    const matchBusca = !buscaBanner || 
      b.titulo?.toLowerCase().includes(buscaBanner.toLowerCase()) ||
      b.nome_empresa?.toLowerCase().includes(buscaBanner.toLowerCase()) ||
      b.created_by?.toLowerCase().includes(buscaBanner.toLowerCase());
    const matchStatus = !filtroStatusBanner || b.status === filtroStatusBanner;
    return matchBusca && matchStatus;
  });

  const postsFiltrados = posts.filter(p => {
    const matchBusca = !buscaPost || 
      p.titulo?.toLowerCase().includes(buscaPost.toLowerCase()) ||
      p.created_by?.toLowerCase().includes(buscaPost.toLowerCase());
    const matchStatus = !filtroStatusPost || p.status === filtroStatusPost;
    return matchBusca && matchStatus;
  });

  const anunciosFiltrados = todosAnuncios.filter(a => {
    const matchBusca = !buscaAnuncio || 
      a.titulo?.toLowerCase().includes(buscaAnuncio.toLowerCase()) ||
      a.profissional?.toLowerCase().includes(buscaAnuncio.toLowerCase()) ||
      a.created_by?.toLowerCase().includes(buscaAnuncio.toLowerCase());
    const matchStatus = !filtroStatusAnuncio || a.status === filtroStatusAnuncio;
    return matchBusca && matchStatus;
  });

  // ATUALIZADO: Filtrar por tipo_usuario ao invés de plano_patrocinador
  const usuariosClube = todosUsuarios.filter(u => u.plano_clube_beleza && u.plano_clube_beleza !== 'nenhum');
  const usuariosPatrocinadores = todosUsuarios.filter(u => u.tipo_usuario === 'patrocinador');

  const todosUsuariosFiltrados = todosUsuarios.filter(u => {
    const matchBusca = !buscaTodosUsuarios || 
      u.full_name?.toLowerCase().includes(buscaTodosUsuarios.toLowerCase()) ||
      u.email?.toLowerCase().includes(buscaTodosUsuarios.toLowerCase());
    const matchTipo = !filtroTipoUsuario || u.tipo_usuario === filtroTipoUsuario;
    const matchRole = !filtroRole || u.role === filtroRole;
    return matchBusca && matchTipo && matchRole;
  });

  const exportarRelatorioTodosUsuarios = () => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Todos os Usuários</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #EC4899; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
          th { background: #EC4899; color: white; }
        </style>
      </head>
      <body>
        <h1>👥 Relatório de Todos os Usuários</h1>
        <p>Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
        <p><strong>Total:</strong> ${todosUsuariosFiltrados.length}</p>
        <p><strong>Profissionais:</strong> ${todosUsuariosFiltrados.filter(u => u.tipo_usuario === 'profissional').length}</p>
        <p><strong>Pacientes:</strong> ${todosUsuariosFiltrados.filter(u => u.tipo_usuario === 'paciente').length}</p>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Role</th>
              <th>Cadastro Completo</th>
              <th>Data Cadastro</th>
            </tr>
          </thead>
          <tbody>
            ${todosUsuariosFiltrados.map(u => `
              <tr>
                <td>${u.full_name}</td>
                <td>${u.email}</td>
                <td>${u.tipo_usuario || 'N/D'}</td>
                <td>${u.role || 'user'}</td>
                <td>${u.cadastro_completo ? 'Sim' : 'Não'}</td>
                <td>${u.created_date ? format(new Date(u.created_date), "dd/MM/yyyy", { locale: ptBR }) : "-"}</td>
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
    a.download = `todos-usuarios-${format(new Date(), "yyyy-MM-dd")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const enviarRelatorioTodosUsuariosWhatsApp = () => {
    const mensagem = `
📊 *RELATÓRIO DE USUÁRIOS*
Data: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}

📈 *RESUMO:*
Total: ${todosUsuariosFiltrados.length}
Profissionais: ${todosUsuariosFiltrados.filter(u => u.tipo_usuario === 'profissional').length}
Pacientes: ${todosUsuariosFiltrados.filter(u => u.tipo_usuario === 'paciente').length}
Admins: ${todosUsuariosFiltrados.filter(u => u.role === 'admin').length}
Testers: ${todosUsuariosFiltrados.filter(u => u.role === 'tester').length}

📋 *CADASTROS:*
Completos: ${todosUsuariosFiltrados.filter(u => u.cadastro_completo).length}
Incompletos: ${todosUsuariosFiltrados.filter(u => !u.cadastro_completo).length}
    `.trim();
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const usuariosUnicos = [...new Set(pedidos.map(p => p.usuario_email))].sort();
  const pedidosPendentes = pedidosFiltrados.filter(p => p.status_pedido === 'aguardando_pagamento');

  const versaoAtual = versoes.find(v => v.status === 'atual');
  const versoesAnteriores = versoes.filter(v => v.status === 'anterior').sort((a, b) => b.numero_versao.localeCompare(a.numero_versao));
  const versoesAgendadas = versoes.filter(v => v.status === 'agendada').sort((a, b) => new Date(a.data_agendamento) - new Date(b.data_agendamento));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

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
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Painel Administrativo
                </h1>
                {versaoAtual && (
                  <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg px-4 py-2">
                    <Code className="w-4 h-4 mr-2" />
                    v{versaoAtual.numero_versao}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600">Gerencie perfis, produtos e versões da plataforma</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setMostrarGerenciadorVersoes(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Versões ({versoes.length})
              </Button>
              <Button
                onClick={() => setMostrarTutorialDrBeleza(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Tutorial
              </Button>
              <Button
                onClick={exportarRelatorioGeral}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF Geral
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

        <Card className="mb-8 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <GitBranch className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-green-900">Controle de Versões</CardTitle>
                  <p className="text-sm text-green-700">Gerencie atualizações e versões do sistema</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-2 border-green-200 bg-white">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">✅ Versão Atual</h3>
                    {versaoAtual ? (
                      <div>
                        <p className="text-3xl font-bold text-green-600 mb-2">v{versaoAtual.numero_versao}</p>
                        <p className="text-sm text-gray-600 mb-2">{versaoAtual.titulo}</p>
                        <Badge className="bg-green-100 text-green-800">
                          {versaoAtual.usuarios_nesta_versao || 0} usuários
                        </Badge>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Nenhuma versão ativa</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">📅 Agendar Versão</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Programe nova atualização e notifique usuários
                    </p>
                    {versoesAgendadas.length > 0 && (
                      <Badge className="bg-blue-100 text-blue-800 mb-2">
                        {versoesAgendadas.length} agendada(s)
                      </Badge>
                    )}
                  </div>
                  <Button
                    onClick={() => setMostrarModalNovaVersao(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    <Rocket className="w-4 h-4 mr-2" />
                    Agendar Nova Versão
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <GitBranch className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">📚 Histórico</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Ver e gerenciar versões anteriores
                    </p>
                    <Badge className="bg-purple-100 text-purple-800 mb-2">
                      {versoesAnteriores.length} anterior(es)
                    </Badge>
                  </div>
                  <Button
                    onClick={() => setMostrarGerenciadorVersoes(true)}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Gerenciar Versões
                  </Button>
                </CardContent>
              </Card>
            </div>

            {versoesAgendadas.length > 0 && (
              <div className="mt-6 pt-6 border-t border-green-200">
                <h4 className="font-semibold text-lg mb-4 text-blue-900">📅 Próximas Atualizações Agendadas</h4>
                <div className="space-y-3">
                  {versoesAgendadas.map((versao) => {
                    const dataAgendada = new Date(versao.data_agendamento);
                    const agora = new Date();
                    const tempoRestante = Math.max(0, Math.ceil((dataAgendada - agora) / (1000 * 60 * 60)));
                    
                    return (
                      <div key={versao.id} className="p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Rocket className="w-5 h-5 text-blue-600" />
                              <h5 className="font-bold text-gray-900">v{versao.numero_versao} - {versao.titulo}</h5>
                              <Badge className="bg-blue-100 text-blue-800">
                                Agendada
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{versao.descricao}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="w-3 h-3" />
                                {format(dataAgendada, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </span>
                              <span>•</span>
                              <span className="text-blue-600 font-semibold">
                                Em {tempoRestante} horas
                              </span>
                              {versao.notificacoes_enviadas && (
                                <>
                                  <span>•</span>
                                  <span className="text-green-600 flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    Emails enviados
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-700"
                            onClick={() => {
                              if (confirm(`Cancelar agendamento da versão ${versao.numero_versao}?\n\nOs emails já foram enviados aos usuários!`)) {
                                deletarVersaoMutation.mutate(versao.id);
                              }
                            }}
                            disabled={deletarVersaoMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6 gap-1">
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
            <TabsTrigger value="testers">
              <Shield className="w-4 h-4 mr-2" />
              Contas Teste ({testers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="planos">
            <Tabs defaultValue="solicitacoes" className="w-full">
              <TabsList className="w-full mb-6 grid grid-cols-2 md:grid-cols-7 gap-1">
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
                <TabsTrigger value="anuncios" className="text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Anúncios ({todosAnuncios.length})
                </TabsTrigger>
                <TabsTrigger value="clube" className="text-xs sm:text-sm">
                  <Crown className="w-4 h-4 mr-2" />
                  Clube ({usuariosClube.length})
                </TabsTrigger>
                <TabsTrigger value="patrocinadores" className="text-xs sm:text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Patrocinadores ({usuariosPatrocinadores.length})
                </TabsTrigger>
                <TabsTrigger value="todos-usuarios" className="text-xs sm:text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Todos ({todosUsuarios.length})
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

              {/* Sub-aba: Impulsionamento */}
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

              {/* Sub-aba: Profissionais */}
              <TabsContent value="profissionais">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <CardTitle>Profissionais Cadastrados</CardTitle>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Buscar profissional (nome, email)"
                          value={buscaProfissional}
                          onChange={(e) => setBuscaProfissional(e.target.value)}
                          className="max-w-xs"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loadingUsuarios ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
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
                              <TableHead>Email</TableHead>
                              <TableHead>Plano Ativo</TableHead>
                              <TableHead>BeautyCoins</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usuariosFiltrados.map((u) => (
                              <TableRow key={u.id}>
                                <TableCell>
                                  <p className="font-medium">{u.full_name}</p>
                                  <p className="text-sm text-gray-500">{u.telefone}</p>
                                </TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                  <Badge className={PLANOS_INFO[u.plano_ativo]?.cor}>
                                    {PLANOS_INFO[u.plano_ativo]?.nome}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-sm text-purple-600 border-purple-200">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {u.beauty_coins || 0}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button size="sm" variant="outline" onClick={() => handleEditarPontos(u)}>
                                      <Star className="w-4 h-4 mr-1" />
                                      Pontos
                                    </Button>
                                    <Button size="sm" onClick={() => handleTrocarPlano(u)} className="bg-blue-600 hover:bg-blue-700">
                                      <RefreshCw className="w-4 h-4 mr-1" />
                                      Trocar Plano
                                    </Button>
                                    <Button size="sm" variant="outline" className="border-red-300 text-red-700" onClick={() => handleExcluirProfissional(u)}>
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

              {/* Sub-aba: Anúncios */}
              <TabsContent value="anuncios">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <CardTitle>Anúncios ({anunciosFiltrados.length})</CardTitle>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Buscar anúncio (título, profissional, email)"
                          value={buscaAnuncio}
                          onChange={(e) => setBuscaAnuncio(e.target.value)}
                          className="max-w-xs"
                        />
                        <Select value={filtroStatusAnuncio} onValueChange={setFiltroStatusAnuncio}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>Todos os Status</SelectItem>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="expirado">Expirado</SelectItem>
                            <SelectItem value="pausado">Pausado</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={exportarRelatorioAnuncios}
                          variant="outline"
                          size="sm"
                          disabled={todosAnuncios.length === 0}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          onClick={enviarRelatorioAnunciosWhatsApp}
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
                    {loadingAnuncios ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                      </div>
                    ) : anunciosFiltrados.length === 0 ? (
                      <div className="text-center py-12">
                        <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhum anúncio encontrado</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Título</TableHead>
                              <TableHead>Profissional</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Visualizações</TableHead>
                              <TableHead>Expiração</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {anunciosFiltrados.map((anuncio) => {
                              const StatusIcon = STATUS_INFO[anuncio.status]?.icon || Clock;
                              return (
                                <TableRow key={anuncio.id}>
                                  <TableCell className="font-medium max-w-[200px] whitespace-normal">
                                    <p className="truncate">{anuncio.titulo}</p>
                                  </TableCell>
                                  <TableCell>
                                    <p>{anuncio.profissional}</p>
                                    <p className="text-sm text-gray-500">{anuncio.created_by}</p>
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={STATUS_INFO[anuncio.status]?.cor}>
                                      <StatusIcon className="w-3 h-3 mr-1" />
                                      {STATUS_INFO[anuncio.status]?.label}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>{anuncio.visualizacoes || 0}</TableCell>
                                  <TableCell>{calcularTempoRestante(anuncio)}</TableCell>
                                  <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <Button size="sm" variant="outline" onClick={() => handleVerDetalhesAnuncio(anuncio)}>
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" onClick={() => handleEditarAnuncio(anuncio)}>
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-red-300 text-red-700"
                                        onClick={() => handleExcluirAnuncio(anuncio)}
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

              {/* Sub-aba: Clube da Beleza */}
              <TabsContent value="clube">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Crown className="w-6 h-6 text-yellow-600" />
                      Membros do Clube da Beleza ({usuariosClube.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingTodosUsuarios ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                      </div>
                    ) : usuariosClube.length === 0 ? (
                      <div className="text-center py-12">
                        <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhum membro no Clube da Beleza</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Plano Clube</TableHead>
                              <TableHead>Beauty Coins</TableHead>
                              <TableHead>Desde</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usuariosClube.map((u) => (
                              <TableRow key={u.id}>
                                <TableCell>
                                  <p className="font-medium">{u.full_name}</p>
                                </TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>
                                  <Badge className={
                                    u.plano_clube_beleza === 'light' ? 'bg-blue-100 text-blue-800' :
                                    u.plano_clube_beleza === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                                    u.plano_clube_beleza === 'vip' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }>
                                    <Crown className="w-3 h-3 mr-1" />
                                    {u.plano_clube_beleza === 'light' ? 'LIGHT' :
                                     u.plano_clube_beleza === 'gold' ? 'GOLD' :
                                     u.plano_clube_beleza === 'vip' ? 'VIP' :
                                     u.plano_clube_beleza}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-purple-600 border-purple-200">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    {u.beauty_coins || 0}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600">
                                  {u.data_adesao_plano_clube ? format(new Date(u.data_adesao_plano_clube), "dd/MM/yyyy", { locale: ptBR }) : 'N/D'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button size="sm" onClick={() => handleEditarUsuarioCompleto(u)}>
                                      <Edit className="w-4 h-4 mr-1" />
                                      Editar
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleSincronizarClubeBeleza(u)}>
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
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Sub-aba: Patrocinadores */}
              <TabsContent value="patrocinadores">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-green-600" />
                      Patrocinadores ({usuariosPatrocinadores.length})
                    </CardTitle>
                    <p className="text-sm text-gray-600">
                      Usuários com tipo de conta "Patrocinador"
                    </p>
                  </CardHeader>
                  <CardContent>
                    {loadingTodosUsuarios ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                      </div>
                    ) : usuariosPatrocinadores.length === 0 ? (
                      <div className="text-center py-12">
                        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhum patrocinador encontrado</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Usuários com tipo "patrocinador" aparecerão aqui
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Email/Contato</TableHead>
                              <TableHead>Plano Mapa</TableHead>
                              <TableHead>Plano Patrocinador</TableHead>
                              <TableHead>Clube Beleza</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usuariosPatrocinadores.map((u) => (
                              <TableRow key={u.id}>
                                <TableCell>
                                  <div>
                                    <p className="font-medium">{u.full_name}</p>
                                    <Badge className="bg-green-100 text-green-800 mt-1">
                                      👑 Patrocinador
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1 text-sm">
                                    <p className="text-gray-900">{u.email}</p>
                                    {u.telefone && (
                                      <p className="text-gray-600 flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {u.telefone}
                                      </p>
                                    )}
                                    {u.whatsapp && (
                                      <p className="text-gray-600 flex items-center gap-1">
                                        <MessageCircle className="w-3 h-3" />
                                        {u.whatsapp}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge className={PLANOS_INFO[u.plano_ativo]?.cor}>
                                    {PLANOS_INFO[u.plano_ativo]?.nome || 'Cobre'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    u.plano_patrocinador && u.plano_patrocinador !== 'nenhum' 
                                      ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white" 
                                      : "bg-gray-100 text-gray-600"
                                  }>
                                    {u.plano_patrocinador && u.plano_patrocinador !== 'nenhum' 
                                      ? (PLANOS_INFO[u.plano_patrocinador]?.nome || u.plano_patrocinador) 
                                      : 'Nenhum'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    u.plano_clube_beleza === 'light' ? 'bg-blue-100 text-blue-800' :
                                    u.plano_clube_beleza === 'gold' ? 'bg-yellow-100 text-yellow-800' :
                                    u.plano_clube_beleza === 'vip' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-600'
                                  }>
                                    {u.plano_clube_beleza === 'light' ? 'LIGHT' :
                                     u.plano_clube_beleza === 'gold' ? 'GOLD' :
                                     u.plano_clube_beleza === 'vip' ? 'VIP' :
                                     'Nenhum'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button size="sm" onClick={() => handleEditarUsuarioCompleto(u)}>
                                      <Edit className="w-4 h-4 mr-1" />
                                      Editar
                                    </Button>
                                    {u.plano_patrocinador && u.plano_patrocinador !== 'nenhum' && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => window.open(createPageUrl("DashboardPatrocinador"), '_blank')}
                                        className="border-green-300 text-green-700"
                                      >
                                        <Crown className="w-4 h-4" />
                                      </Button>
                                    )}
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

              {/* Sub-aba: Todos os Usuários - CORES MELHORADAS */}
              <TabsContent value="todos-usuarios">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <CardTitle>Todos os Usuários ({todosUsuariosFiltrados.length})</CardTitle>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Buscar usuário (nome, email)"
                          value={buscaTodosUsuarios}
                          onChange={(e) => setBuscaTodosUsuarios(e.target.value)}
                          className="max-w-xs"
                        />
                        <Select value={filtroTipoUsuario} onValueChange={setFiltroTipoUsuario}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>Todos os Tipos</SelectItem>
                            <SelectItem value="paciente">Paciente</SelectItem>
                            <SelectItem value="profissional">Profissional</SelectItem>
                            <SelectItem value="patrocinador">Patrocinador</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={filtroRole} onValueChange={setFiltroRole}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filtrar por Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={null}>Todas as Roles</SelectItem>
                            <SelectItem value="user">Usuário Comum</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="tester">Tester</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={exportarRelatorioTodosUsuarios}
                          variant="outline"
                          size="sm"
                          disabled={todosUsuarios.length === 0}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          onClick={enviarRelatorioTodosUsuariosWhatsApp}
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
                    {loadingTodosUsuarios ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                      </div>
                    ) : todosUsuariosFiltrados.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Nenhum usuário encontrado com os filtros aplicados</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Role</TableHead>
                              <TableHead>Plano Mapa</TableHead>
                              <TableHead>Plano Clube</TableHead>
                              <TableHead>Plano Patrocinador</TableHead>
                              <TableHead>Pontos/BC</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {todosUsuariosFiltrados.map((u) => (
                              <TableRow key={u.id}>
                                <TableCell>
                                  <p className="font-medium">{u.full_name}</p>
                                  <p className="text-sm text-gray-500">{u.telefone}</p>
                                </TableCell>
                                <TableCell className="text-sm">{u.email}</TableCell>
                                <TableCell>
                                  <Badge className={
                                    u.tipo_usuario === 'paciente' ? 'bg-blue-600 text-white' :
                                    u.tipo_usuario === 'profissional' ? 'bg-purple-600 text-white' :
                                    u.tipo_usuario === 'patrocinador' ? 'bg-green-600 text-white' :
                                    'bg-gray-500 text-white'
                                  }>
                                    {u.tipo_usuario === 'paciente' ? '👤 Paciente' :
                                     u.tipo_usuario === 'profissional' ? '💼 Profis.' :
                                     u.tipo_usuario === 'patrocinador' ? '👑 Patroc.' :
                                     'N/D'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    u.role === 'admin' ? 'bg-orange-600 text-white' :
                                    u.role === 'tester' ? 'bg-blue-600 text-white' :
                                    'bg-gray-500 text-white'
                                  }>
                                    {u.role === 'admin' ? 'Admin' : u.role === 'tester' ? 'Tester' : 'User'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    u.plano_ativo === 'platina' ? 'bg-purple-600 text-white font-bold' :
                                    u.plano_ativo === 'diamante' ? 'bg-blue-600 text-white font-bold' :
                                    u.plano_ativo === 'ouro' ? 'bg-yellow-600 text-white font-bold' :
                                    u.plano_ativo === 'prata' ? 'bg-gray-600 text-white font-bold' :
                                    'bg-orange-600 text-white font-bold'
                                  }>
                                    {PLANOS_INFO[u.plano_ativo]?.nome || 'Cobre'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    u.plano_clube_beleza === 'vip' ? 'bg-purple-600 text-white font-bold' :
                                    u.plano_clube_beleza === 'gold' ? 'bg-yellow-600 text-white font-bold' :
                                    u.plano_clube_beleza === 'light' ? 'bg-blue-600 text-white font-bold' :
                                    'bg-gray-400 text-white'
                                  }>
                                    {u.plano_clube_beleza === 'light' ? 'LIGHT' :
                                     u.plano_clube_beleza === 'gold' ? 'GOLD' :
                                     u.plano_clube_beleza === 'vip' ? 'VIP' :
                                     'Nenhum'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={
                                    u.plano_patrocinador === 'platina' ? 'bg-purple-600 text-white font-bold' :
                                    u.plano_patrocinador === 'diamante' ? 'bg-blue-600 text-white font-bold' :
                                    u.plano_patrocinador === 'ouro' ? 'bg-yellow-600 text-white font-bold' :
                                    u.plano_patrocinador === 'prata' ? 'bg-gray-600 text-white font-bold' :
                                    u.plano_patrocinador === 'cobre' ? 'bg-orange-600 text-white font-bold' :
                                    'bg-gray-400 text-white'
                                  }>
                                    {u.plano_patrocinador && u.plano_patrocinador !== 'nenhum'
                                      ? (PLANOS_INFO[u.plano_patrocinador]?.nome || u.plano_patrocinador)
                                      : 'Nenhum'}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    <Badge className="bg-yellow-600 text-white font-semibold">
                                      <Star className="w-3 h-3 mr-1" />
                                      {u.pontos_acumulados || 0}
                                    </Badge>
                                    <Badge className="bg-purple-600 text-white font-semibold">
                                      <DollarSign className="w-3 h-3 mr-1" />
                                      {u.beauty_coins || 0}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button 
                                      size="sm" 
                                      onClick={() => handleEditarUsuarioCompleto(u)}
                                      className="bg-pink-600 hover:bg-pink-700 text-white"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    {(u.tipo_usuario === 'profissional' || u.tipo_usuario === 'patrocinador') && (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        className="border-red-600 text-red-700 hover:bg-red-50" 
                                        onClick={() => handleExcluirProfissional(u)}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    )}
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
            </Tabs>
          </TabsContent>

          <TabsContent value="produtos">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle>Pedidos de Produtos ({pedidosFiltrados.length})</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar pedido (usuário, produto)"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="max-w-xs"
                    />
                    <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos os Status</SelectItem>
                        <SelectItem value="aguardando_pagamento">Aguardando Pagamento</SelectItem>
                        <SelectItem value="pago">Pago</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos os Usuários</SelectItem>
                        {usuariosUnicos.map((email) => (
                          <SelectItem key={email} value={email}>
                            {email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum pedido encontrado</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID Pedido</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead>Valor Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pedidosFiltrados.map((pedido) => {
                          const StatusIcon = STATUS_INFO[pedido.status_pedido]?.icon || Clock;
                          return (
                            <TableRow key={pedido.id}>
                              <TableCell className="font-medium">#{pedido.id.substring(0, 8)}</TableCell>
                              <TableCell>
                                <p className="font-medium">{pedido.usuario_nome}</p>
                                <p className="text-sm text-gray-500">{pedido.usuario_email}</p>
                              </TableCell>
                              <TableCell>{pedido.produto_nome}</TableCell>
                              <TableCell>R$ {pedido.valor_total?.toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge className={STATUS_INFO[pedido.status_pedido]?.cor}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {STATUS_INFO[pedido.status_pedido]?.label}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {pedido.created_date ? format(new Date(pedido.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {pedido.status_pedido === 'aguardando_pagamento' && (
                                    <>
                                      <Button
                                        onClick={() => aprovarPedidoMutation.mutate(pedido.id)}
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700"
                                      >
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Aprovar
                                      </Button>
                                      <Button
                                        onClick={() => rejeitarPedidoMutation.mutate(pedido.id)}
                                        size="sm"
                                        variant="outline"
                                        className="border-red-300 text-red-700"
                                      >
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </>
                                  )}
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

          <TabsContent value="banners">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle>Banners ({bannersFiltrados.length})</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar banner (título, empresa)"
                      value={buscaBanner}
                      onChange={(e) => setBuscaBanner(e.target.value)}
                      className="max-w-xs"
                    />
                    <Select value={filtroStatusBanner} onValueChange={setFiltroStatusBanner}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos os Status</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="pausado">Pausado</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={exportarRelatorioBanners}
                      variant="outline"
                      size="sm"
                      disabled={banners.length === 0}
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
                    <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
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
                          <TableHead>Título</TableHead>
                          <TableHead>Empresa</TableHead>
                          <TableHead>Plano Patrocínio</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Visualizações</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bannersFiltrados.map((banner) => {
                          const StatusIcon = STATUS_INFO[banner.status]?.icon || Clock;
                          return (
                            <TableRow key={banner.id}>
                              <TableCell className="font-medium">{banner.titulo}</TableCell>
                              <TableCell>{banner.nome_empresa}</TableCell>
                              <TableCell>
                                <Badge className={PLANOS_INFO[banner.plano_patrocinador]?.cor || 'bg-gray-100 text-gray-800'}>
                                  {PLANOS_INFO[banner.plano_patrocinador]?.nome || banner.plano_patrocinador || 'Nenhum'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge className={STATUS_INFO[banner.status]?.cor}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {STATUS_INFO[banner.status]?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>{banner.metricas?.visualizacoes || 0}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleVerDetalhesBanner(banner)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  {banner.status !== 'ativo' && (
                                    <Button size="sm" onClick={() => handleAlterarStatusBanner(banner, 'ativo')}>
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {banner.status !== 'pausado' && (
                                    <Button size="sm" variant="outline" onClick={() => handleAlterarStatusBanner(banner, 'pausado')}>
                                      <Clock className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" className="border-red-300 text-red-700" onClick={() => handleExcluirBanner(banner)}>
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

          <TabsContent value="posts">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle>Posts do Blog ({postsFiltrados.length})</CardTitle>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Buscar post (título, autor)"
                      value={buscaPost}
                      onChange={(e) => setBuscaPost(e.target.value)}
                      className="max-w-xs"
                    />
                    <Select value={filtroStatusPost} onValueChange={setFiltroStatusPost}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos os Status</SelectItem>
                        <SelectItem value="publicado">Publicado</SelectItem>
                        <SelectItem value="rascunho">Rascunho</SelectItem>
                        <SelectItem value="programado">Programado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={exportarRelatorioPosts}
                      variant="outline"
                      size="sm"
                      disabled={posts.length === 0}
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
                    <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
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
                          <TableHead>Título</TableHead>
                          <TableHead>Autor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Visualizações</TableHead>
                          <TableHead>Data Publicação</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {postsFiltrados.map((post) => {
                          const StatusIcon = STATUS_INFO[post.status]?.icon || Clock;
                          return (
                            <TableRow key={post.id}>
                              <TableCell className="font-medium max-w-[200px] whitespace-normal">
                                <p className="truncate">{post.titulo}</p>
                              </TableCell>
                              <TableCell>{post.created_by}</TableCell>
                              <TableCell>
                                <Badge className={STATUS_INFO[post.status]?.cor}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {STATUS_INFO[post.status]?.label}
                                </Badge>
                              </TableCell>
                              <TableCell>{post.visualizacoes || 0}</TableCell>
                              <TableCell>
                                {post.data_publicacao ? format(new Date(post.data_publicacao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button size="sm" variant="outline" onClick={() => handleVerDetalhesPost(post)}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" onClick={() => handleVerPostagemBlog(post)}>
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                  {post.status !== 'publicado' && (
                                    <Button size="sm" onClick={() => handleAlterarStatusPost(post, 'publicado')}>
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {post.status !== 'rascunho' && (
                                    <Button size="sm" variant="outline" onClick={() => handleAlterarStatusPost(post, 'rascunho')}>
                                      <FileText className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" className="border-red-300 text-red-700" onClick={() => handleExcluirPost(post)}>
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

          {/* NOVA Aba: Contas Teste */}
          <TabsContent value="testers">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-6 h-6 text-blue-600" />
                      Contas Teste ({testers.length})
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Gerencie contas de teste com período limitado
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setMostrarModalCriarTester(true)}
                      className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Criar Conta Teste
                    </Button>
                    <Button
                      onClick={exportarRelatorioTesters}
                      variant="outline"
                      size="sm"
                      disabled={testers.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingTesters ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : testers.length === 0 ? (
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Nenhuma conta teste encontrada</p>
                    <Button
                      onClick={() => setMostrarModalCriarTester(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Criar Primeira Conta Teste
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Planos Ativos</TableHead>
                          <TableHead>Pontos/Coins</TableHead>
                          <TableHead>Período</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {testers.map((tester) => {
                          const dataExpiracao = tester.data_expiracao_teste ? new Date(tester.data_expiracao_teste) : null;
                          const hoje = new Date();
                          const expirado = dataExpiracao && dataExpiracao < hoje;
                          const diasRestantes = dataExpiracao ? Math.max(0, Math.ceil((new Date(tester.data_expiracao_teste) - new Date()) / (1000 * 60 * 60 * 24))) : 0;

                          return (
                            <TableRow key={tester.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{tester.full_name}</p>
                                  <p className="text-sm text-gray-500">{tester.email}</p>
                                  <p className="text-xs text-gray-400">{tester.telefone}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <Badge className={PLANOS_INFO[tester.plano_ativo]?.cor || "bg-gray-100"}>
                                    Mapa: {PLANOS_INFO[tester.plano_ativo]?.nome || 'Cobre'}
                                  </Badge>
                                  {tester.plano_clube_beleza !== 'nenhum' && (
                                    <Badge className="bg-purple-100 text-purple-800">
                                      Clube: {tester.plano_clube_beleza}
                                    </Badge>
                                  )}
                                  {tester.plano_patrocinador !== 'nenhum' && (
                                    <Badge className="bg-green-100 text-green-800">
                                      Patrocinador: {PLANOS_INFO[tester.plano_patrocinador]?.nome || tester.plano_patrocinador}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1 text-sm">
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-600" />
                                    {tester.pontos_acumulados || 0} pts
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-purple-600" />
                                    {tester.beauty_coins || 0} BC
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  {dataExpiracao ? (
                                    <>
                                      <p className="font-medium">
                                        {format(dataExpiracao, "dd/MM/yyyy", { locale: ptBR })}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {expirado ? 'Expirado' : `${diasRestantes} dias restantes`}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-gray-400">Sem data</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge className={expirado ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}>
                                  {expirado ? '⏰ Expirado' : '✅ Ativo'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleVerDetalhesTester(tester)}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Ver
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-red-300 text-red-700"
                                    onClick={() => {
                                      setTesterSelecionado(tester);
                                      handleDeletarTester();
                                    }}
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
              <DialogTitle>Ativar Plano para {solicitacaoSelecionada?.usuario_nome}</DialogTitle>
              <DialogDescription>
                Confirme a ativação do plano {PLANOS_INFO[solicitacaoSelecionada?.plano_solicitado]?.nome} para o usuário.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p>
                <strong>Usuário:</strong> {solicitacaoSelecionada?.usuario_nome} ({solicitacaoSelecionada?.usuario_email})
              </p>
              <p>
                <strong>Plano Solicitado:</strong>{" "}
                <Badge className={PLANOS_INFO[solicitacaoSelecionada?.plano_solicitado]?.cor}>
                  {PLANOS_INFO[solicitacaoSelecionada?.plano_solicitado]?.nome}
                </Badge>
              </p>
              <div className="mt-4">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Ex: Pagamento confirmado via pix, brinde ativado..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarModalAtivar(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAtivarPlano} disabled={processando}>
                {processando ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Ativar Plano
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Trocar Plano */}
        <Dialog open={mostrarModalTrocarPlano} onOpenChange={setMostrarModalTrocarPlano}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Trocar Plano do Usuário</DialogTitle>
              <DialogDescription>
                Selecione o novo plano para {planoSelecionadoUsuario?.full_name}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="novoPlano">Novo Plano</Label>
              <Select value={novoPlano} onValueChange={setNovoPlano}>
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(PLANOS_INFO).map((planoKey) => (
                    <SelectItem key={planoKey} value={planoKey}>
                      {PLANOS_INFO[planoKey].nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarModalTrocarPlano(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmarTrocaPlano} disabled={trocarPlanoMutation.isPending}>
                {trocarPlanoMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Confirmar Troca
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Pontos */}
        <Dialog open={mostrarModalPontos} onOpenChange={setMostrarModalPontos}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajustar Pontos e Beauty Coins</DialogTitle>
              <DialogDescription>
                Ajuste os pontos acumulados e Beauty Coins de {usuarioEditandoPontos?.full_name}.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="novosPontos">Pontos Acumulados</Label>
                <Input
                  id="novosPontos"
                  type="number"
                  value={novosPontos}
                  onChange={(e) => setNovosPontos(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label htmlFor="novosBeautyCoins">Beauty Coins</Label>
                <Input
                  id="novosBeautyCoins"
                  type="number"
                  value={novosBeautyCoins}
                  onChange={(e) => setNovosBeautyCoins(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarModalPontos(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmarEditarPontos} disabled={atualizarPontosMutation.isPending}>
                {atualizarPontosMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Detalhes Banner */}
        <Dialog open={mostrarDetalhesBanner} onOpenChange={setMostrarDetalhesBanner}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{bannerSelecionado?.titulo}</DialogTitle>
              <DialogDescription>Detalhes e ações para o banner.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {bannerSelecionado?.imagem_url && (
                <img
                  src={bannerSelecionado.imagem_url}
                  alt={bannerSelecionado.titulo}
                  className="w-full h-auto rounded-lg object-cover max-h-[300px]"
                />
              )}
              <p><strong>Empresa:</strong> {bannerSelecionado?.nome_empresa}</p>
              <p><strong>Link:</strong> <a href={bannerSelecionado?.link_redirecionamento} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{bannerSelecionado?.link_redirecionamento}</a></p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge className={STATUS_INFO[bannerSelecionado?.status]?.cor}>
                  {STATUS_INFO[bannerSelecionado?.status]?.label}
                </Badge>
              </p>
              <p><strong>Visualizações:</strong> {bannerSelecionado?.metricas?.visualizacoes || 0}</p>
              <p><strong>Cliques:</strong> {bannerSelecionado?.metricas?.cliques || 0}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarDetalhesBanner(false)}>
                Fechar
              </Button>
              {bannerSelecionado?.status !== 'ativo' && (
                <Button onClick={() => handleAlterarStatusBanner(bannerSelecionado, 'ativo')}>Ativar</Button>
              )}
              {bannerSelecionado?.status !== 'pausado' && (
                <Button variant="secondary" onClick={() => handleAlterarStatusBanner(bannerSelecionado, 'pausado')}>Pausar</Button>
              )}
              <Button variant="destructive" onClick={() => handleExcluirBanner(bannerSelecionado)}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Detalhes Post */}
        <Dialog open={mostrarDetalhesPost} onOpenChange={setMostrarDetalhesPost}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{postSelecionado?.titulo}</DialogTitle>
              <DialogDescription>Detalhes e ações para o post.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              {postSelecionado?.imagem_capa_url && (
                <img
                  src={postSelecionado.imagem_capa_url}
                  alt={postSelecionado.titulo}
                  className="w-full h-auto rounded-lg object-cover max-h-[300px]"
                />
              )}
              <p><strong>Autor:</strong> {postSelecionado?.created_by}</p>
              <p><strong>Categoria:</strong> {postSelecionado?.categoria}</p>
              <p>
                <strong>Status:</strong>{" "}
                <Badge className={STATUS_INFO[postSelecionado?.status]?.cor}>
                  {STATUS_INFO[postSelecionado?.status]?.label}
                </Badge>
              </p>
              <p><strong>Descrição:</strong> {postSelecionado?.descricao_curta}</p>
              <p><strong>Visualizações:</strong> {postSelecionado?.visualizacoes || 0}</p>
              <p><strong>Curtidas:</strong> {postSelecionado?.total_curtidas || 0}</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarDetalhesPost(false)}>
                Fechar
              </Button>
              <Button onClick={() => handleVerPostagemBlog(postSelecionado)}>Ver no Blog</Button>
              {postSelecionado?.status !== 'publicado' && (
                <Button onClick={() => handleAlterarStatusPost(postSelecionado, 'publicado')}>Publicar</Button>
              )}
              {postSelecionado?.status !== 'rascunho' && (
                <Button variant="secondary" onClick={() => handleAlterarStatusPost(postSelecionado, 'rascunho')}>Mover para Rascunho</Button>
              )}
              <Button variant="destructive" onClick={() => handleExcluirPost(postSelecionado)}>Excluir</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Notificação (para enviar novidade) */}
        <Dialog open={mostrarModalAtualizacao} onOpenChange={setMostrarModalAtualizacao}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Bell className="w-6 h-6 text-blue-600" /> Enviar Notificação/Atualização
              </DialogTitle>
              <DialogDescription>
                Crie e agende uma novidade para todos os usuários do sistema.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="tituloAtualizacao">Título da Novidade *</Label>
                <Input
                  id="tituloAtualizacao"
                  placeholder="Ex: Nova funcionalidade de busca"
                  value={tituloAtualizacao}
                  onChange={(e) => setTituloAtualizacao(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="descricaoAtualizacao">Descrição Curta *</Label>
                <Textarea
                  id="descricaoAtualizacao"
                  placeholder="Resumo da novidade para a notificação"
                  value={descricaoAtualizacao}
                  onChange={(e) => setDescricaoAtualizacao(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="conteudoAtualizacao">Conteúdo Detalhado (opcional)</Label>
                <Textarea
                  id="conteudoAtualizacao"
                  placeholder="Detalhes completos sobre a novidade (será exibido em uma página específica)"
                  value={conteudoAtualizacao}
                  onChange={(e) => setConteudoAtualizacao(e.target.value)}
                  rows={5}
                />
              </div>
              <div>
                <Label className="block mb-2">Agendar Publicação (Opcional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!dataAgendamento && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataAgendamento ? format(dataAgendamento, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataAgendamento}
                      onSelect={setDataAgendamento}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500 mt-1">
                  Se uma data for selecionada, a novidade será publicada e as notificações enviadas somente nesse dia.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarModalAtualizacao(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEnviarAtualizacao} disabled={enviandoAtualizacao}>
                {enviandoAtualizacao ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Enviar Novidade
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Agendamento (forçada) */}
        <Dialog open={mostrarModalAgendarForcada} onOpenChange={setMostrarModalAgendarForcada}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-red-600" /> Agendar Atualização Forçada
              </DialogTitle>
              <DialogDescription>
                Agende um horário para forçar o recarregamento do site para todos os usuários.
                Use com cautela!
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="tituloAgendamentoForcada">Título da Atualização *</Label>
                <Input
                  id="tituloAgendamentoForcada"
                  placeholder="Ex: Manutenção agendada"
                  value={tituloAgendamentoForcada}
                  onChange={(e) => setTituloAgendamentoForcada(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="descricaoAgendamentoForcada">Descrição (opcional)</Label>
                <Textarea
                  id="descricaoAgendamentoForcada"
                  placeholder="Breve descrição do motivo do recarregamento."
                  value={descricaoAgendamentoForcada}
                  onChange={(e) => setDescricaoAgendamentoForcada(e.target.value)}
                />
              </div>
              <div>
                <Label className="block mb-2">Data e Hora do Agendamento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={`w-full justify-start text-left font-normal ${!dataAgendamentoForcada && "text-muted-foreground"}`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataAgendamentoForcada ? format(dataAgendamentoForcada, "dd/MM/yyyy HH:mm", { locale: ptBR }) : <span>Selecione data e hora</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataAgendamentoForcada}
                      onSelect={setDataAgendamentoForcada}
                      initialFocus
                    />
                    <div className="p-3 border-t border-gray-200">
                      <Input
                        type="time"
                        value={dataAgendamentoForcada ? format(dataAgendamentoForcada, "HH:mm") : "00:00"}
                        onChange={(e) => {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = dataAgendamentoForcada ? new Date(dataAgendamentoForcada) : new Date();
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setDataAgendamentoForcada(newDate);
                        }}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-sm text-gray-500 mt-1">
                  A atualização será forçada na data e hora selecionadas.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarModalAgendarForcada(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAgendarAtualizacaoForcada} disabled={agendarAtualizacaoForcadaMutation.isPending}>
                {agendarAtualizacaoForcadaMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="mr-2 h-4 w-4" />
                )}
                Agendar Forçada
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Detalhes Anúncio */}
        <Dialog open={mostrarDetalhesAnuncio} onOpenChange={setMostrarDetalhesAnuncio}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{anuncioSelecionado?.titulo}</DialogTitle>
              <DialogDescription>Detalhes e ações para o anúncio.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <p><strong>Profissional:</strong> {anuncioSelecionado?.profissional} ({anuncioSelecionado?.created_by})</p>
              <p><strong>Status:</strong> <Badge className={STATUS_INFO[anuncioSelecionado?.status]?.cor}>{STATUS_INFO[anuncioSelecionado?.status]?.label}</Badge></p>
              <p><strong>Exposição:</strong> {calcularTempoRestante(anuncioSelecionado)}</p>
              <p><strong>Visualizações:</strong> {anuncioSelecionado?.visualizacoes || 0}</p>
              <p><strong>Impulsionado:</strong> {anuncioSelecionado?.impulsionado ? "Sim" : "Não"}</p>
              {anuncioSelecionado?.descricao && (
                <div>
                  <strong>Descrição:</strong>
                  <p className="text-sm text-gray-700">{anuncioSelecionado.descricao}</p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMostrarDetalhesAnuncio(false)}>
                Fechar
              </Button>
              <Button onClick={() => handleEditarAnuncio(anuncioSelecionado)}>
                <Edit className="w-4 h-4 mr-1" />
                Editar
              </Button>
              {anuncioSelecionado?.status === 'ativo' && (
                <Button variant="secondary" onClick={() => handleAlterarStatusAnuncio(anuncioSelecionado, 'pausado')}>
                  <Clock className="w-4 h-4 mr-1" />
                  Pausar
                </Button>
              )}
              {anuncioSelecionado?.status !== 'ativo' && (
                <Button onClick={() => handleAlterarStatusAnuncio(anuncioSelecionado, 'ativo')}>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Ativar
                </Button>
              )}
              <Button onClick={() => handleEstenderTempoExposicao(anuncioSelecionado)}>
                <CalendarIcon className="w-4 h-4 mr-1" /> Estender
              </Button>
              <Button variant="destructive" onClick={() => handleExcluirAnuncio(anuncioSelecionado)}>
                <Trash2 className="w-4 h-4 mr-1" /> Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Tutorial */}
        <Dialog open={mostrarTutorialDrBeleza} onOpenChange={setMostrarTutorialDrBeleza}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-cyan-600" /> Tutorial
              </DialogTitle>
              <DialogDescription>
                Aprenda a usar o chat do Dr. Beleza para gerar mensagens.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <h3 className="text-lg font-semibold mb-2">Como usar o chat do Dr. Beleza:</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <strong className="text-cyan-600">Para mensagens de marketing:</strong> Peça para ele criar posts para redes sociais, campanhas de e-mail marketing, textos para anúncios.
                  <br />Ex: "Crie 3 posts para Instagram sobre o verão e cuidados com a pele."
                </li>
                <li>
                  <strong className="text-cyan-600">Para respostas a pacientes:</strong> Use para gerar respostas educadas e informativas para perguntas comuns de pacientes.
                  <br />Ex: "Elabore uma resposta para um paciente perguntando sobre os efeitos colaterais do preenchimento labial."
                </li>
                <li>
                  <strong className="text-cyan-600">Para criação de conteúdo:</strong> Ajuda a desenvolver ideias para artigos de blog, roteiros para vídeos ou FAQs.
                  <br />Ex: "Liste 5 tópicos para um artigo de blog sobre 'harmonização facial para iniciantes'."
                </li>
                <li>
                  <strong className="text-cyan-600">Para otimização de perfil:</strong> Peça sugestões para melhorar a descrição do perfil, título do anúncio, etc.
                  <br />Ex: "Sugira 3 títulos criativos para um anúncio de clínica de estética."
                </li>
              </ul>
              <p className="mt-4 text-sm text-gray-600 italic">
                Lembre-se: O Dr. Beleza é uma ferramenta de apoio. Sempre revise e personalize as sugestões para garantir que estejam alinhadas com sua voz e a realidade do seu negócio.
              </p>
            </div>
            <DialogFooter>
              <Button onClick={() => setMostrarTutorialDrBeleza(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ATUALIZADO: Modal Criar Nova Versão */}
        <Dialog open={mostrarModalNovaVersao} onOpenChange={setMostrarModalNovaVersao}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Rocket className="w-6 h-6 text-blue-600" />
                Agendar Nova Versão do Sistema
              </DialogTitle>
              <DialogDescription>
                Crie e agende uma nova versão ou publique imediatamente
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <p className="font-semibold mb-2">📢 O que acontece ao criar uma versão:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li><strong>Email automático</strong> para TODOS os usuários com data/hora</li>
                    <li><strong>Notificação</strong> no sino de cada usuário</li>
                    <li><strong>Ativação automática</strong> na data/hora escolhida</li>
                    <li><strong>Versão antiga</strong> passa para "Anterior"</li>
                    <li><strong>Todos usuários</strong> migrados para nova versão</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div>
                <Label>Título da Versão *</Label>
                <Input
                  placeholder="Ex: Novo Sistema de Banners Rotativos"
                  value={dadosNovaVersao.titulo}
                  onChange={(e) => setDadosNovaVersao({...dadosNovaVersao, titulo: e.target.value})}
                  className="mt-2"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Descrição Resumida *</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleGerarDescricaoIA}
                    disabled={gerandoDescricaoIA || !dadosNovaVersao.titulo}
                    className="border-purple-300 text-purple-700"
                  >
                    {gerandoDescricaoIA ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3 mr-1" />
                    )}
                    Pedir Ajuda IA
                  </Button>
                </div>
                <Textarea
                  placeholder="Resumo das principais mudanças (aparece no email)"
                  value={dadosNovaVersao.descricao}
                  onChange={(e) => setDadosNovaVersao({...dadosNovaVersao, descricao: e.target.value})}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Changelog Completo (opcional)</Label>
                <Textarea
                  placeholder="Lista detalhada de todas as mudanças, correções e novidades..."
                  value={dadosNovaVersao.conteudo_detalhado}
                  onChange={(e) => setDadosNovaVersao({...dadosNovaVersao, conteudo_detalhado: e.target.value})}
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="w-4 h-4" />
                    Data de Lançamento (opcional)
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {dadosNovaVersao.data_agendamento ? 
                          format(dadosNovaVersao.data_agendamento, "dd/MM/yyyy", { locale: ptBR }) : 
                          "Publicar agora"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dadosNovaVersao.data_agendamento}
                        onSelect={(date) => setDadosNovaVersao({...dadosNovaVersao, data_agendamento: date})}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  {dadosNovaVersao.data_agendamento && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setDadosNovaVersao({...dadosNovaVersao, data_agendamento: null})}
                      className="mt-1 text-xs"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Publicar agora
                    </Button>
                  )}
                </div>

                {dadosNovaVersao.data_agendamento && (
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4" />
                      Horário do Lançamento *
                    </Label>
                    <Select 
                      value={dadosNovaVersao.hora_agendamento} 
                      onValueChange={(value) => setDadosNovaVersao({...dadosNovaVersao, hora_agendamento: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[200px]">
                        {Array.from({ length: 24 }, (_, i) => {
                          const hora = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hora} value={`${hora}:00`}>
                              {hora}:00 {i === 3 ? '⭐ (Recomendado)' : ''}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {dadosNovaVersao.data_agendamento ? (
                <Alert className="bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-900 text-sm">
                    <p className="font-semibold mb-2">⚠️ O que acontecerá:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Sistema envia <strong>email para TODOS</strong> os usuários agora</li>
                      <li>Na data/hora: <strong>ativação automática</strong> da versão</li>
                      <li>Usuários online serão <strong>atualizados automaticamente</strong></li>
                      <li>Próxima versão será calculada automaticamente</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-900 text-sm">
                    <p className="font-semibold mb-2">🚨 PUBLICAÇÃO IMEDIATA:</p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li><strong>TODOS os usuários</strong> serão atualizados AGORA</li>
                      <li><strong>Site recarregará</strong> automaticamente</li>
                      <li>Nova versão ativa <strong>imediatamente</strong></li>
                      <li><strong>Não haverá</strong> notificação prévia por email</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalNovaVersao(false);
                  setDadosNovaVersao({
                    titulo: "",
                    descricao: "",
                    conteudo_detalhado: "",
                    data_agendamento: null,
                    hora_agendamento: "03:00"
                  });
                }}
                disabled={criarNovaVersaoMutation.isPending || forcarPublicacaoImediataMutation.isPending}
              >
                Cancelar
              </Button>
              {dadosNovaVersao.data_agendamento ? (
                <Button
                  onClick={handleCriarNovaVersao}
                  disabled={criarNovaVersaoMutation.isPending}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {criarNovaVersaoMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Criando e Enviando Emails...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4 mr-2" />
                      Agendar Versão
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleForcarPublicacaoImediata}
                  disabled={forcarPublicacaoImediataMutation.isPending}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  {forcarPublicacaoImediataMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Publicar Agora (Imediato)
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ATUALIZADO: Modal Gerenciador de Versões */}
        <Dialog open={mostrarGerenciadorVersoes} onOpenChange={setMostrarGerenciadorVersoes}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <GitBranch className="w-6 h-6 text-purple-600" />
                Gerenciador de Versões
              </DialogTitle>
              <DialogDescription>
                Visualize e gerencie todas as versões do sistema
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Versão Atual */}
              {versaoAtual && (
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Versão Atual
                  </h3>
                  <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-2xl font-bold text-green-900">v{versaoAtual.numero_versao}</h4>
                            <Badge className="bg-green-600 text-white">ATUAL</Badge>
                          </div>
                          <h5 className="text-lg font-semibold text-gray-900 mb-2">{versaoAtual.titulo}</h5>
                          <p className="text-sm text-gray-700 mb-3">{versaoAtual.descricao}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <Badge variant="outline" className="bg-white">
                              <Users className="w-3 h-3 mr-1" />
                              {versaoAtual.usuarios_nesta_versao || 0} usuários
                            </Badge>
                            <span className="text-gray-600">
                              Lançada em {format(new Date(versaoAtual.data_lancamento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                        </div>
                      </div>
                      {versaoAtual.conteudo_detalhado && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="text-xs font-semibold text-green-900 mb-2">📝 Changelog:</p>
                          <p className="text-sm text-gray-700 whitespace-pre-line">{versaoAtual.conteudo_detalhado}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ATUALIZADO: Versões Agendadas com Botão Ativar Agora */}
              {versoesAgendadas.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-blue-600" />
                    Versões Agendadas ({versoesAgendadas.length})
                  </h3>
                  <div className="space-y-3">
                    {versoesAgendadas.map((versao) => {
                      const dataAgendada = new Date(versao.data_agendamento);
                      const tempoRestante = Math.max(0, Math.ceil((dataAgendada - new Date()) / (1000 * 60 * 60)));
                      
                      return (
                        <Card key={versao.id} className="border-2 border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="text-xl font-bold text-blue-900">v{versao.numero_versao}</h4>
                                  <Badge className="bg-blue-600 text-white">AGENDADA</Badge>
                                  {versao.notificacoes_enviadas && (
                                    <Badge className="bg-green-100 text-green-800">
                                      <Mail className="w-3 h-3 mr-1" />
                                      Emails enviados
                                    </Badge>
                                  )}
                                </div>
                                <h5 className="font-semibold text-gray-900 mb-1">{versao.titulo}</h5>
                                <p className="text-sm text-gray-600 mb-2">{versao.descricao}</p>
                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    {format(dataAgendada, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                  </span>
                                  <span>•</span>
                                  <span className="text-blue-600 font-semibold">
                                    🕐 Em {tempoRestante} horas
                                  </span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleForcarAtivarVersao(versao)}
                                  className="bg-orange-600 hover:bg-orange-700"
                                  disabled={ativarVersaoMutation.isPending}
                                >
                                  <Zap className="w-4 h-4 mr-1" />
                                  Ativar Agora
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700"
                                  onClick={() => {
                                    if (confirm(`Cancelar agendamento?\n\nVersão: ${versao.numero_versao}\nObs: Os emails já foram enviados!`)) {
                                      deletarVersaoMutation.mutate(versao.id);
                                    }
                                  }}
                                  disabled={deletarVersaoMutation.isPending}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Versões Anteriores */}
              {versoesAnteriores.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-600" />
                      Versões Anteriores ({versoesAnteriores.length})
                    </h3>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-700"
                      onClick={() => {
                        if (confirm(`⚠️ LIMPAR CACHE: Deletar TODAS as ${versoesAnteriores.length} versões anteriores?\n\nIsto irá:\n• Liberar cache do sistema\n• Transferir usuários restantes para versão atual\n• Limpar histórico de versões antigas`)) {
                          versoesAnteriores.forEach(v => deletarVersaoMutation.mutate(v.id));
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Limpar Todas
                    </Button>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {versoesAnteriores.map((versao) => (
                      <Card key={versao.id} className="border-2 border-gray-200 hover:border-gray-300">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-lg font-bold text-gray-700">v{versao.numero_versao}</h4>
                                <Badge variant="outline" className="text-gray-600">ANTERIOR</Badge>
                                {(versao.usuarios_nesta_versao || 0) > 0 && (
                                  <Badge className="bg-orange-100 text-orange-800">
                                    {versao.usuarios_nesta_versao} usuário(s) ainda nesta versão
                                  </Badge>
                                )}
                              </div>
                              <h5 className="font-semibold text-gray-900 mb-1">{versao.titulo}</h5>
                              <p className="text-sm text-gray-600 mb-2">{versao.descricao}</p>
                              <p className="text-xs text-gray-500">
                                Lançada em {format(new Date(versao.data_lancamento), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-300 text-red-700"
                              onClick={() => handleDeletarVersao(versao)}
                              disabled={deletarVersaoMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Deletar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Alert className="mt-4 bg-purple-50 border-purple-200">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="text-purple-800 text-sm">
                      💡 <strong>Limpeza de Cache:</strong> Deletar versões antigas libera espaço e transfere automaticamente usuários remanescentes para a versão atual.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {versoes.length === 0 && (
                <div className="text-center py-12">
                  <Code className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma versão cadastrada ainda</p>
                  <p className="text-sm text-gray-500 mt-2">Crie a primeira versão para começar o controle!</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setMostrarGerenciadorVersoes(false)}
              >
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal Editar Usuário - SUBSTITUÍDO POR COMPONENTE */}
        <ModalEditarUsuario
          open={mostrarModalEditarUsuario}
          onClose={() => setMostrarModalEditarUsuario(false)}
          usuarioEditando={usuarioEditando}
          dadosEdicaoUsuario={dadosEdicaoUsuario}
          setDadosEdicaoUsuario={setDadosEdicaoUsuario}
          onSalvar={confirmarEdicaoUsuario}
          isPending={editarUsuarioCompletoMutation.isPending}
          PLANOS_INFO={PLANOS_INFO}
        />

        {/* NOVO: Modal Criar Conta Teste */}
        <Dialog open={mostrarModalCriarTester} onOpenChange={setMostrarModalCriarTester}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-600" />
                Criar Conta Teste (7 dias)
              </DialogTitle>
              <DialogDescription>
                Crie uma conta de teste com período limitado e planos personalizados
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <p className="font-semibold mb-2">📝 Como funciona:</p>
                  <ul className="list-disc ml-4 space-y-1">
                    <li>Preencha os dados e configure os planos desejados</li>
                    <li>Um email será enviado ao admin com as instruções</li>
                    <li>Convide o usuário pelo Dashboard → Users → Invite User</li>
                    <li>Após aceite, configure manualmente: role=tester e data_expiracao_teste</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    placeholder="Ex: João Silva"
                    value={dadosTester.full_name}
                    onChange={(e) => setDadosTester({...dadosTester, full_name: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    placeholder="joao@exemplo.com"
                    value={dadosTester.email}
                    onChange={(e) => setDadosTester({...dadosTester, email: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <Input
                    placeholder="(00) 00000-0000"
                    value={dadosTester.telefone}
                    onChange={(e) => setDadosTester({...dadosTester, telefone: e.target.value})}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Senha Temporária</Label>
                  <Input
                    type="text"
                    placeholder="Senha inicial"
                    value={dadosTester.senha}
                    onChange={(e) => setDadosTester({...dadosTester, senha: e.target.value})}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Tipo de Usuário</Label>
                <Select
                  value={dadosTester.tipo_usuario}
                  onValueChange={(value) => setDadosTester({...dadosTester, tipo_usuario: value})}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="paciente">Paciente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Plano Mapa da Estética</Label>
                  <Select
                    value={dadosTester.plano_ativo}
                    onValueChange={(value) => setDadosTester({...dadosTester, plano_ativo: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(PLANOS_INFO).map(key => (
                        <SelectItem key={key} value={key}>{PLANOS_INFO[key].nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Clube da Beleza</Label>
                  <Select
                    value={dadosTester.plano_clube_beleza}
                    onValueChange={(value) => setDadosTester({...dadosTester, plano_clube_beleza: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                      <SelectItem value="light">LIGHT</SelectItem>
                      <SelectItem value="gold">GOLD</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Plano Patrocinador</Label>
                  <Select
                    value={dadosTester.plano_patrocinador}
                    onValueChange={(value) => setDadosTester({...dadosTester, plano_patrocinador: value})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nenhum">Nenhum</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="prata">Prata</SelectItem>
                      <SelectItem value="ouro">Ouro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Período de Teste (dias)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setDadosTester({...dadosTester, dias_teste: Math.max(1, dadosTester.dias_teste - 1)})}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={dadosTester.dias_teste}
                    onChange={(e) => setDadosTester({...dadosTester, dias_teste: parseInt(e.target.value) || 7})}
                    className="text-center"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setDadosTester({...dadosTester, dias_teste: Math.min(365, dadosTester.dias_teste + 1)})}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDadosTester({...dadosTester, dias_teste: 7})}
                  >
                    Padrão (7)
                  </Button>
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-900 text-sm">
                  <strong>⚠️ Importante:</strong> Você precisará convidar o usuário manualmente através do Dashboard → Users → Invite User. 
                  Após o aceite, configure manualmente: role=tester e data_expiracao_teste.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarModalCriarTester(false);
                  setDadosTester({
                    full_name: "",
                    email: "",
                    telefone: "",
                    senha: "",
                    plano_ativo: "cobre",
                    plano_clube_beleza: "nenhum",
                    plano_patrocinador: "nenhum",
                    tipo_usuario: "profissional",
                    dias_teste: 7
                  });
                }}
                disabled={criandoTester}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCriarTester}
                disabled={criandoTester || criarTesterMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {criarTesterMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Criar Conta Teste
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* NOVO: Modal Detalhes Tester */}
        <Dialog open={mostrarDetalhesTester} onOpenChange={setMostrarDetalhesTester}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Estatísticas: {testerSelecionado?.full_name}
              </DialogTitle>
              <DialogDescription>
                Análise completa de uso da conta teste
              </DialogDescription>
            </DialogHeader>

            {testerSelecionado && (
              <div className="space-y-6 py-4">
                {/* Informações Básicas */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">📋 Informações</h4>
                    <p className="text-sm"><strong>Email:</strong> {testerSelecionado.email}</p>
                    <p className="text-sm"><strong>Telefone:</strong> {testerSelecionado.telefone || 'N/D'}</p>
                    <p className="text-sm"><strong>Tipo:</strong> {testerSelecionado.tipo_usuario || 'N/D'}</p>
                    <p className="text-sm">
                      <strong>Cadastrado em:</strong> {format(new Date(testerSelecionado.created_date), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">🎯 Planos Ativos</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className={PLANOS_INFO[testerSelecionado.plano_ativo]?.cor}>
                        Mapa: {PLANOS_INFO[testerSelecionado.plano_ativo]?.nome}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800">
                        Clube: {testerSelecionado.plano_clube_beleza}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        Patrocinador: {PLANOS_INFO[testerSelecionado.plano_patrocinador]?.nome || testerSelecionado.plano_patrocinador}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Período de Teste */}
                <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Período de Teste
                  </h4>
                  {testerSelecionado.data_expiracao_teste ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            <strong>Expira em:</strong> {format(new Date(testerSelecionado.data_expiracao_teste), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {Math.max(0, Math.ceil((new Date(testerSelecionado.data_expiracao_teste) - new Date()) / (1000 * 60 * 60 * 24)))} dias restantes
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm mb-2 block">Estender Período (dias):</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setDiasAdicionais(Math.max(0, diasAdicionais - 1))}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <Input
                            type="number"
                            min="0"
                            max="365"
                            value={diasAdicionais}
                            onChange={(e) => setDiasAdicionais(parseInt(e.target.value) || 0)}
                            className="text-center"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setDiasAdicionais(Math.min(365, diasAdicionais + 1))}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleEstenderPeriodo(diasAdicionais)}
                            disabled={diasAdicionais === 0}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Aplicar
                          </Button>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEstenderPeriodo(7)}
                          >
                            +7 dias
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEstenderPeriodo(30)}
                          >
                            +30 dias
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEstenderPeriodo(-7)}
                          >
                            -7 dias
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Data de expiração não configurada</p>
                  )}
                </div>

                {/* Pontos e Beauty Coins */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    Pontos e Recompensas
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm mb-2 block">Pontos Acumulados:</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            atualizarPontosMutation.mutate({
                              email: testerSelecionado.email,
                              pontos: Math.max(0, (testerSelecionado.pontos_acumulados || 0) - 100),
                              beautyCoins: testerSelecionado.beauty_coins || 0
                            });
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={testerSelecionado.pontos_acumulados || 0}
                          onChange={(e) => {
                            atualizarPontosMutation.mutate({
                              email: testerSelecionado.email,
                              pontos: parseInt(e.target.value) || 0,
                              beautyCoins: testerSelecionado.beauty_coins || 0
                            });
                          }}
                          className="text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            atualizarPontosMutation.mutate({
                              email: testerSelecionado.email,
                              pontos: (testerSelecionado.pontos_acumulados || 0) + 100,
                              beautyCoins: testerSelecionado.beauty_coins || 0
                            });
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm mb-2 block">Beauty Coins:</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            atualizarPontosMutation.mutate({
                              email: testerSelecionado.email,
                              pontos: testerSelecionado.pontos_acumulados || 0,
                              beautyCoins: Math.max(0, (testerSelecionado.beauty_coins || 0) - 50)
                            });
                          }}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                          type="number"
                          min="0"
                          value={testerSelecionado.beauty_coins || 0}
                          onChange={(e) => {
                            atualizarPontosMutation.mutate({
                              email: testerSelecionado.email,
                              pontos: testerSelecionado.pontos_acumulados || 0,
                              beautyCoins: parseInt(e.target.value) || 0
                            });
                          }}
                          className="text-center"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            atualizarPontosMutation.mutate({
                              email: testerSelecionado.email,
                              pontos: testerSelecionado.pontos_acumulados || 0,
                              beautyCoins: (testerSelecionado.beauty_coins || 0) + 50
                            });
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estatísticas de Uso */}
                {estatisticasTester && (
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                      Estatísticas de Uso
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="border-none bg-gradient-to-br from-pink-50 to-rose-50">
                        <CardContent className="p-4 text-center">
                          <Sparkles className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{estatisticasTester.anuncios}</p>
                          <p className="text-xs text-gray-600">Anúncios</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none bg-gradient-to-br from-purple-50 to-pink-50">
                        <CardContent className="p-4 text-center">
                          <ImageIcon className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{estatisticasTester.banners}</p>
                          <p className="text-xs text-gray-600">Banners</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none bg-gradient-to-br from-blue-50 to-cyan-50">
                        <CardContent className="p-4 text-center">
                          <Newspaper className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{estatisticasTester.posts}</p>
                          <p className="text-xs text-gray-600">Posts</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none bg-gradient-to-br from-green-50 to-emerald-50">
                        <CardContent className="p-4 text-center">
                          <Zap className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{estatisticasTester.impulsionamentos}</p>
                          <p className="text-xs text-gray-600">Impulsionamentos</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none bg-gradient-to-br from-yellow-50 to-amber-50">
                        <CardContent className="p-4 text-center">
                          <Eye className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{estatisticasTester.total_visualizacoes}</p>
                          <p className="text-xs text-gray-600">Visualizações</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none bg-gradient-to-br from-red-50 to-pink-50">
                        <CardContent className="p-4 text-center">
                          <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{estatisticasTester.total_curtidas}</p>
                          <p className="text-xs text-gray-600">Curtidas</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none bg-gradient-to-br from-indigo-50 to-blue-50">
                        <CardContent className="p-4 text-center">
                          <ShoppingCart className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{estatisticasTester.produtos}</p>
                          <p className="text-xs text-gray-600">Produtos</p>
                        </CardContent>
                      </Card>
                      <Card className="border-none bg-gradient-to-br from-gray-50 to-slate-50">
                        <CardContent className="p-4 text-center">
                          <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold">{estatisticasTester.dias_usando}</p>
                          <p className="text-xs text-gray-600">Dias de Uso</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">
                    <strong>⚠️ Zona de Perigo:</strong> Remover esta conta teste irá converter o usuário para comum e resetar todos os planos.
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMostrarDetalhesTester(false);
                  setTesterSelecionado(null);
                  setEstatisticasTester(null);
                  setDiasAdicionais(0);
                }}
              >
                Fechar
              </Button>
              <Button
                onClick={() => navigate(`${createPageUrl("Perfil")}?user=${testerSelecionado?.email}`)}
                variant="outline"
              >
                <User className="w-4 h-4 mr-2" />
                Ver Perfil
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletarTester}
                disabled={deletarTesterMutation.isPending}
              >
                {deletarTesterMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Remover Conta Teste
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
