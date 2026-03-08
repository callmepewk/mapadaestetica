import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  Home,
  Search,
  CreditCard,
  Newspaper,
  Info,
  MessageCircle,
  User,
  PlusCircle,
  Menu,
  X,
  LogOut,
  MapPin,
  TrendingUp,
  Star,
  DollarSign,
  ShoppingCart,
  Crown,
  Briefcase,
  Sparkles,
  Camera
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Chatbot from "@/components/home/Chatbot";
import OnboardingModal from "./components/home/OnboardingModal";
import NotificationBell from "./components/layout/NotificationBell";
import CarrinhoModal from "./components/home/CarrinhoModal";
import SeletorTipoUsuario from "./components/home/SeletorTipoUsuario";
import SeletorVisaoAdmin from "./components/layout/SeletorVisaoAdmin";
import LanguageSelector from "./components/layout/LanguageSelector";
import { I18nProvider } from "./components/i18n/I18nProvider";
import FloatingQuickbar from "./components/layout/FloatingQuickbar";
import ImageWithLoader from "./components/common/ImageWithLoader";

if (typeof window !== 'undefined') { try { window.produtosMeus = window.produtosMeus || []; } catch {} }

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    try { console.error('UI error:', error, info); } catch {}
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6 text-center">
          <div>
            <h2 className="text-xl font-bold mb-2">Estamos ajustando algo por aqui</h2>
            <p className="text-gray-600 mb-4">Tente atualizar a página ou volte em instantes.</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-md bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]">Atualizar</button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);
  const [testeExpirado, setTesteExpirado] = useState(false);
  const [carrinho, setCarrinho] = useState([]);
  const [mostrarCarrinho, setMostrarCarrinho] = useState(false);
  const [mostrarSeletorTipo, setMostrarSeletorTipo] = useState(false);
  const [visaoAdmin, setVisaoAdmin] = useState("profissional");
        const [temaCor, setTemaCor] = useState('#F7D426');
        const [radarHasNew, setRadarHasNew] = useState(false);

  // Carregar carrinho do localStorage
  useEffect(() => {
    try { if (typeof window !== 'undefined') { window.produtosMeus = window.produtosMeus || []; } } catch {}
    const carrinhoSalvo = localStorage.getItem('carrinho_mapa_estetica');
    if (carrinhoSalvo) {
      try {
        setCarrinho(JSON.parse(carrinhoSalvo));
      } catch (e) {
        console.error("Erro ao carregar carrinho:", e);
      }
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('carrinho_mapa_estetica', JSON.stringify(carrinho));
  }, [carrinho]);

  // Scroll para o topo ao mudar de página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
            // Google Analytics 4
            try {
              const GA_ID = 'G-SKNS18840X';
              if (typeof window !== 'undefined' && !window.__ga_loaded) {
                window.__ga_loaded = true;
                const s = document.createElement('script');
                s.async = true;
                s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
                document.head.appendChild(s);
                window.dataLayer = window.dataLayer || [];
                function gtag(){window.dataLayer.push(arguments);} window.gtag = gtag;
                window.gtag('js', new Date());
                window.gtag('config', GA_ID);
              }
            } catch {}

            const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const userData = await base44.auth.me();
          setUser(userData);

          // Verificar se precisa selecionar tipo
          if (!userData.tipo_usuario) {
            setMostrarSeletorTipo(true);
          }

          // Carregar visão salva do admin (se existir)
          if (userData.role === 'admin') {
            const visaoSalva = localStorage.getItem('admin_visao_site');
            if (visaoSalva) {
              setVisaoAdmin(visaoSalva);
            }
          }

          // Verificar se é tester e se expirou
          if (userData.role === 'tester' && userData.data_expiracao_teste) {
            const dataExpiracao = new Date(userData.data_expiracao_teste);
            const hoje = new Date();
            // Normalize dates to compare only the date part, ignoring time
            hoje.setHours(0, 0, 0, 0);
            dataExpiracao.setHours(0, 0, 0, 0);

            if (hoje > dataExpiracao) {
              setTesteExpirado(true);
            }
          }
        }
      } catch (error) {
        setIsAuthenticated(false);
        setUser(null); // Ensure user is null if authentication fails
      }
    };
    checkAuth();
    }, [location.pathname]);

              // Atualização em tempo real do usuário (pontos/coins/planos)
              useEffect(() => {
                if (!user?.email) return;
                const unsubscribe = base44.entities.User.subscribe((event) => {
                  if (event?.data?.email === user.email) {
                    setUser(event.data);
                  }
                });
                return unsubscribe;
              }, [user?.email]);

               // Notificações de Radares
               useEffect(() => {
              try {
                const unsubscribe = base44.entities.RadarUsage.subscribe(() => {
                  setRadarHasNew(true);
                });
                return unsubscribe;
              } catch {}
            }, []);

            // Tema de campanha global (cor)
            useEffect(() => {
    const loadTheme = async () => {
      try {
        const banners = await base44.entities.Banner.filter({ aplicar_tema_global: true, status: 'ativo' }, '-created_date', 1);
        if (banners && banners.length && banners[0].cor_tema) {
          setTemaCor(banners[0].cor_tema);
        }
      } catch (e) {
        // ignore
      }
    };
    loadTheme();
    }, []);

  const handleLogout = () => {
    base44.auth.logout();
    setIsAuthenticated(false);
    setUser(null);
    navigate(createPageUrl("Inicio")); // Redirect to home after logout
  };

  // Added functions for OnboardingModal
  const handleCompletarCadastro = () => {
    setMostrarOnboarding(true);
  };

  const handleOnboardingClose = () => {
    setMostrarOnboarding(false);
  };

  const handleLogin = () => {
    const currentPath = location.pathname + location.search;
    base44.auth.redirectToLogin(currentPath);
  };

  const handleRemoverItemCarrinho = (index) => {
    setCarrinho(prev => prev.filter((_, i) => i !== index));
  };

  const handleLimparCarrinho = () => {
    if (confirm("Tem certeza que deseja limpar todo o carrinho?")) {
      setCarrinho([]);
      localStorage.removeItem('carrinho_mapa_estetica');
    }
  };

  const handleTrocaTipoSuccess = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      window.location.reload(); // Recarregar para atualizar toda a interface
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleMudarVisaoAdmin = (novaVisao) => {
    setVisaoAdmin(novaVisao);
    localStorage.setItem('admin_visao_site', novaVisao);
    // Forçar atualização imediata do storage event
    window.dispatchEvent(new Event('storage'));
  };

  const handleAbrirRadares = () => {
    try { localStorage.setItem('radares_last_seen', new Date().toISOString()); } catch {}
    setRadarHasNew(false);
    navigate(createPageUrl("Radares"));
  };

  // Definir items de navegação baseado no tipo de usuário OU visão do admin
  const isAdmin = user?.role === 'admin';
  const isTester = user?.role === 'tester';
  
  // Se for admin, usar a visão selecionada; caso contrário, usar tipo_usuario
  const tipoAtual = isAdmin ? visaoAdmin : user?.tipo_usuario;
  const isPaciente = tipoAtual === 'paciente' || (!user && !isAdmin); // Unauthenticated users also behave as patients
  const isProfissional = tipoAtual === 'profissional';
  const isPatrocinador = tipoAtual === 'patrocinador';

  // Verificar se cadastro está incompleto
  const cadastroIncompleto = isAuthenticated && user && !user.cadastro_completo;

  const navigationItems = [
                    { title: "Início", url: createPageUrl("Inicio"), icon: Home },
                    { title: "Mapa", url: createPageUrl("Mapa"), icon: Search },
                    { title: "Blog", url: createPageUrl("Blog"), icon: Newspaper },
                    { title: "Produtos", url: createPageUrl("Produtos"), icon: ShoppingCart },
                    ...(isProfissional || isPatrocinador ? [
                                        { title: "Hub Pontos", url: createPageUrl("HubPontos"), icon: Star }
                                      ] : []),
                    ...(!isPaciente ? [{ title: "Planos", url: createPageUrl("Planos"), icon: CreditCard }] : []),
                    { title: "Suporte", url: createPageUrl("FaleConosco"), icon: MessageCircle },
                    { title: "Sobre Nós", url: createPageUrl("SobreNos"), icon: Info },
                  ];

  return (
    <I18nProvider>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <style>{`
        :root {
          --primary: ${temaCor};
          --primary-dark: ${temaCor};
          --primary-light: ${temaCor}33;
          --secondary: #2C2C2C;
          --accent: #FF6B35;
        }
        
        body, p, span, div, input, textarea, button {
          font-size: 14px;
          -webkit-user-select: text;
          -moz-user-select: text;
          -ms-user-select: text;
          user-select: text;
        }
        
        @media (min-width: 768px) {
          body, p, span, div, input, textarea, button {
            font-size: 16px;
          }
        }
        
        button, .cursor-pointer {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* GARANTIR SCROLL SEMPRE DISPONÍVEL */
        html, body {
          overflow-x: hidden;
          overflow-y: auto !important;
          height: auto !important;
          min-height: 100vh;
        }

        /* MOBILE: Garantir que o conteúdo não seja cortado */
        @media (max-width: 640px) {
          body {
            padding-bottom: 80px; /* Espaço para o chatbot */
          }
        }
      `}</style>

      {/* Passed user and onCompletarCadastro to Chatbot */}
      <Chatbot user={user} onCompletarCadastro={handleCompletarCadastro} />

      {/* Barra de Alerta - Teste Expirado */}
      {testeExpirado && (
        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 px-4 sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 text-center sm:text-left">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-sm font-bold">Seu período de teste expirou!</p>
                <p className="text-xs">Faça upgrade agora e continue aproveitando todos os recursos ilimitados</p>
              </div>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("Planos"))}
              size="sm"
              className="bg-white hover:bg-gray-100 text-red-600 font-bold flex-shrink-0 w-full sm:w-auto"
            >
              Ver Planos
            </Button>
          </div>
        </div>
      )}

      {/* Barra de Alerta - Cadastro Incompleto */}
      {cadastroIncompleto && !testeExpirado && (
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-[#2C2C2C] py-2 px-4 sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-1 text-center sm:text-left">
              <span className="text-2xl">⚠️</span>
              <p className="text-sm font-semibold">
                Complete seu cadastro para ter acesso total à plataforma!
              </p>
            </div>
            <Button
              onClick={handleCompletarCadastro}
              size="sm"
              className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold flex-shrink-0 w-full sm:w-auto"
            >
              Completar Agora
            </Button>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] py-2 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm gap-2 sm:gap-0 font-medium">
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-center sm:text-left">Bem-vindo ao Mapa da Estética - Os melhores profissionais perto de você</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold">(21) 98034-3873</span>
          </div>
        </div>
      </div>

      {/* Main Header - OTIMIZADO PARA CABER EM TODAS AS TELAS */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-1 sm:gap-2 md:gap-4">
            {/* Logo - REDUZIDO */}
            <Link to={createPageUrl("Inicio")} className="flex items-center gap-1 sm:gap-2 group flex-shrink-0">
              <ImageWithLoader
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/fd230be55_mapaimg.jpg"
                alt="Mapa da Estética"
                className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain transform group-hover:scale-105 transition-transform"
                fallbackUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe2/2274d89a4_logo_v1.png"
                eager
              />
            </Link>

            {/* Desktop Navigation - COMPACTADO */}
            <nav className="hidden md:flex items-center gap-0.5 mr-auto ml-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-1 px-2 py-2 rounded-lg transition-all duration-200 font-medium text-xs ${
                    location.pathname === item.url
                      ? "bg-[#FFF9E6] text-[#2C2C2C] border-b-2 border-[#F7D426]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#2C2C2C]"
                  }`}
                >
                  <item.icon className="w-3 h-3" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </nav>

            {/* Right Actions - COMPACTADO */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* NOVO: Seletor de Visão (apenas para admins) */}
              {isAdmin && (
                <SeletorVisaoAdmin
                  visaoAtual={visaoAdmin}
                  onMudarVisao={handleMudarVisaoAdmin}
                />
              )}

              {/* Sino de Notificações */}
              <NotificationBell user={user} />

              {/* Seletor de Idiomas */}
              <LanguageSelector />

              {/* CARRINHO DE COMPRAS - SEMPRE VISÍVEL */}
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 sm:h-9 sm:w-9"
                onClick={() => setMostrarCarrinho(true)}
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {carrinho.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center p-0 bg-pink-600 text-white text-[10px] sm:text-xs">
                    {carrinho.length > 9 ? '9+' : carrinho.length}
                  </Badge>
                )}
              </Button>

              {isAuthenticated ? (
                <>
                  {/* Contadores de Pontos e Beauty Coins */}


                  {(isProfissional || isPatrocinador) && (
                    <Link to={createPageUrl("CadastrarAnuncio")} className="hidden lg:block">
                      <Button className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold shadow-lg hover:shadow-xl transition-all duration-200 h-8 px-3 text-xs border-2 border-[#2C2C2C]">
                        <PlusCircle className="w-3 h-3 mr-1" />
                        Anunciar
                      </Button>
                    </Link>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-1 p-0.5 sm:p-1 rounded-full hover:bg-gray-100 transition-colors relative group">
                        <Avatar className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-[#F7D426]">
                          <AvatarImage src={user?.foto_perfil} />
                          <AvatarFallback className="bg-gradient-to-br from-[#F7D426] to-[#FFE066] text-[#2C2C2C] font-bold text-xs">
                            {user?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        {/* Ícone de Edição - PRETO COM FUNDO BRANCO */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-200 z-10">
                                                        {isPatrocinador ? (
                                                          <Crown className="w-2.5 h-2.5 text-black" />
                                                        ) : isProfissional ? (
                                                          <Briefcase className="w-2.5 h-2.5 text-black" />
                                                        ) : (
                                                          <User className="w-2.5 h-2.5 text-black" />
                                                        )}
                                                      </div>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
                      <div className="px-2 py-2">
                        <p className="text-sm font-medium truncate">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {isAdmin && (
                          <Badge className="mt-1 bg-orange-100 text-orange-800 text-xs">
                            👑 Admin - Visão: {visaoAdmin.charAt(0).toUpperCase() + visaoAdmin.slice(1)}
                          </Badge>
                        )}
                        {isTester && (
                          <Badge className="mt-1 bg-blue-100 text-blue-800 text-xs">Tester (7 dias)</Badge>
                        )}
                        {user?.tipo_usuario && (
                          <Badge className="mt-1 bg-pink-100 text-pink-800 text-xs">
                            {user.tipo_usuario === 'paciente' ? '👤 Paciente' : 
                             user.tipo_usuario === 'profissional' ? '💼 Profissional' : 
                             '👑 Patrocinador'}
                          </Badge>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(createPageUrl("Perfil"))}>
                        <User className="w-4 h-4 mr-2" />
                        Meu Perfil
                      </DropdownMenuItem>
                      {!isAdmin && ( // Only show "Trocar Tipo de Conta" if not an admin
                        <DropdownMenuItem onClick={() => setMostrarSeletorTipo(true)}>
                          <User className="w-4 h-4 mr-2" />
                          Trocar Tipo de Conta
                        </DropdownMenuItem>
                      )}

                      {/* Meu Plano - DISPONÍVEL PARA PACIENTES E PROFISSIONAIS */}

                      <DropdownMenuItem onClick={() => navigate(createPageUrl("PlannerWellness"))}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Planner Wellness
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate(createPageUrl("LojaPontos"))}>
                        <Star className="w-4 h-4 mr-2" />
                        Loja de Pontos ({user?.pontos_saldo ?? user?.pontos_acumulados ?? user?.saldo_pontos ?? 0})
                      </DropdownMenuItem>

                      {(isProfissional || isPatrocinador) && (
                        <>


                          
                          <DropdownMenuItem onClick={handleAbrirRadares}>
                            <TrendingUp className="w-4 h-4 mr-2" />
                            RABI
                            {radarHasNew && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                          </DropdownMenuItem>
                        </>
                      )}
                      {/* NOVO: Dashboard Patrocinador */}
                      {isPatrocinador && (
                        <DropdownMenuItem onClick={() => navigate(createPageUrl("DashboardPatrocinador"))}>
                          <Crown className="w-4 h-4 mr-2" />
                          Dashboard Patrocinador
                        </DropdownMenuItem>
                      )}
                      {isAdmin && (
                        <>
                          <DropdownMenuItem onClick={() => navigate(createPageUrl("ControleAdmin"))}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Painel Admin
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.open('https://clube-da-beleza.base44.app', '_blank')}>
                        <Crown className="w-4 h-4 mr-2" />
                        Clube da Beleza
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open('https://clube-mais.base44.app', '_blank')}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Clube +
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  {/* Mostrar contadores de pontos e Beauty Coins como incentivo para não autenticados */}

                  
                  <Button
                    onClick={handleLogin}
                    className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold h-8 px-2 sm:px-3 text-xs border-2 border-[#2C2C2C]"
                    size="sm"
                  >
                    <User className="w-3 h-3 sm:mr-1" />
                    <span className="hidden sm:inline">Entrar</span>
                  </Button>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 space-y-2 border-t pt-4">
              {/* NOVO: Seletor de Visão Mobile (apenas admin) */}
              {isAdmin && (
                <div className="mb-4 p-3 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <p className="text-xs font-semibold text-orange-700 mb-2">👑 Modo Admin - Selecione a Visão:</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant={visaoAdmin === "paciente" ? "default" : "outline"}
                      onClick={() => handleMudarVisaoAdmin("paciente")}
                      className={`h-9 text-xs ${visaoAdmin === "paciente" ? "bg-blue-600 text-white" : ""}`}
                    >
                      <User className="w-3 h-3 mr-1" />
                      Paciente
                    </Button>
                    <Button
                      size="sm"
                      variant={visaoAdmin === "profissional" ? "default" : "outline"}
                      onClick={() => handleMudarVisaoAdmin("profissional")}
                      className={`h-9 text-xs ${visaoAdmin === "profissional" ? "bg-purple-600 text-white" : ""}`}
                    >
                      <Briefcase className="w-3 h-3 mr-1" />
                      Profis.
                    </Button>
                    <Button
                      size="sm"
                      variant={visaoAdmin === "patrocinador" ? "default" : "outline"}
                      onClick={() => handleMudarVisaoAdmin("patrocinador")}
                      className={`h-9 text-xs ${visaoAdmin === "patrocinador" ? "bg-green-600 text-white" : ""}`}
                    >
                      <Crown className="w-3 h-3 mr-1" />
                      Patroc.
                    </Button>
                  </div>
                </div>
              )}

              {/* Carrinho no Mobile */}
              <button
                onClick={() => {
                  setMostrarCarrinho(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-pink-50 text-pink-800 border-l-4 border-pink-500 font-medium"
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Carrinho de Compras</span>
                </div>
                {carrinho.length > 0 && (
                  <Badge className="bg-pink-600 text-white">
                    {carrinho.length}
                  </Badge>
                )}
              </button>

              {/* Loja de Pontos e Beauty Coins no Mobile */}
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link
                    to={createPageUrl("LojaPontos")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#FFF9E6] text-[#2C2C2C] border-l-4 border-[#F7D426] font-medium"
                  >
                    <Star className="w-5 h-5" />
                    <span>Pontos: {user?.pontos_saldo ?? user?.pontos_acumulados ?? user?.saldo_pontos ?? 0}</span>
                  </Link>
                  <Link
                    to={createPageUrl("LojaPontos")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-800 border-l-4 border-purple-500 font-medium"
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Beauty Coins: {user?.beauty_coins ?? user?.coins ?? user?.saldo_coins ?? 0}</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogin();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-[#FFF9E6] text-[#2C2C2C] border-l-4 border-[#F7D426] font-medium"
                  >
                    <Star className="w-5 h-5" />
                    <span>Pontos (0)</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogin();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-800 border-l-4 border-purple-500 font-medium"
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Beauty Coins (0)</span>
                  </button>
                </div>
              )}

              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium ${
                    location.pathname === item.url
                      ? "bg-[#FFF9E6] text-[#2C2C2C] border-l-4 border-[#F7D426]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              ))}
              {isAuthenticated && (isProfissional || isPatrocinador) && (
                <Link
                  to={createPageUrl("CadastrarAnuncio")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F7D426] text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Cadastrar Anúncio</span>
                </Link>
                )}
                <div className="border-t pt-4 mt-4">
                <p className="text-xs text-gray-500 mb-2 px-4">🌟 Nossos Produtos</p>
                <a
                  href="https://clube-da-beleza.base44.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-800 hover:bg-purple-100"
                >
                  <Crown className="w-5 h-5" />
                  <span>Clube da Beleza</span>
                </a>
                <a
                  href="https://clube-mais.base44.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-pink-50 text-pink-800 hover:bg-pink-100 mt-2"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Clube +</span>
                </a>
                </div>
                </nav>
                )}
                </div>
                </header>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden"><ErrorBoundary>{children}</ErrorBoundary></main>

      {/* Footer */}
      <footer className="bg-[#2C2C2C] text-white mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              {/* Logo do Mapa da Estética */}
              <ImageWithLoader
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/fd230be55_mapaimg.jpg"
                alt="Mapa da Estética"
                className="h-16 w-auto object-contain mb-4"
                fallbackUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe2/2274d89a4_logo_v1.png"
                eager
              />
              <p className="text-gray-400 text-sm mb-2">
                A maior plataforma de profissionais de estética do Brasil.
              </p>
              <p className="text-gray-400 text-xs">
                CNPJ: 46.792.168/0001-88
              </p>
              
              {/* Logo do Clube da Beleza */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <a 
                  href="https://clube-da-beleza-c6e913bb.base44.app" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block hover:opacity-80 transition-opacity"
                >
                  <ImageWithLoader
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/652cd0312_clubeimg.jpeg"
                    alt="Clube da Beleza"
                    className="h-20 w-auto object-contain"
                    fallbackUrl="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/b53be18d1_clubeimg.jpeg"
                    eager
                  />
                </a>
                <p className="text-gray-400 text-xs mt-2">
                  Clube de Benefícios Exclusivos
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#F7D426]">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl("Inicio")} className="hover:text-[#F7D426] transition-colors">Início</Link></li>
                <li><Link to={createPageUrl("Mapa")} className="hover:text-[#F7D426] transition-colors">Mapa</Link></li>
                <li><Link to={createPageUrl("Produtos")} className="hover:text-[#F7D426] transition-colors">Produtos</Link></li>
                {!isPaciente && <li><Link to={createPageUrl("Planos")} className="hover:text-[#F7D426] transition-colors">Planos</Link></li>}
                <li><Link to={createPageUrl("Blog")} className="hover:text-[#F7D426] transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#F7D426]">Contatos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="font-semibold text-white">Central de Vendas:</li>
                <li><a href="tel:21980343873" className="hover:text-[#F7D426] transition-colors">(21) 98034-3873</a></li>
                <li className="font-semibold text-white mt-3">Suporte Técnico:</li>
                <li><a href="tel:54991554136" className="hover:text-[#F7D426] transition-colors">(54) 99155-4136</a></li>
                <li className="font-semibold text-white mt-3">Business & Partnerships:</li>
                <li><a href="tel:21980343873" className="hover:text-[#F7D426] transition-colors">(21) 98034-3873</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#F7D426]">Institucional</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl("FaleConosco")} className="hover:text-[#F7D426] transition-colors">Fale Conosco</Link></li>
                <li><Link to={createPageUrl("SobreNos")} className="hover:text-[#F7D426] transition-colors">Sobre Nós</Link></li>
                <li><Link to={createPageUrl("PesquisaEspecializada")} className="hover:text-[#F7D426] transition-colors">Dr da Beleza</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700/60 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400 bg-gradient-to-t from-black/20 to-transparent rounded-t-xl">
            <p>&copy; 2025 Mapa da Estética - Clube da Beleza. Todos os direitos reservados.</p>
            <p className="mt-1">CNPJ: 46.792.168/0001-88</p>
          </div>
        </div>
      </footer>

      {/* Modal de Onboarding */}
      <OnboardingModal
        open={mostrarOnboarding}
        onClose={handleOnboardingClose}
      />

      {/* Modal de Carrinho */}
      <CarrinhoModal
        open={mostrarCarrinho}
        onClose={() => setMostrarCarrinho(false)}
        carrinho={carrinho}
        onRemoverItem={handleRemoverItemCarrinho}
        onLimparCarrinho={handleLimparCarrinho}
      />

      {/* Floating quickbar */}
      <FloatingQuickbar user={user} cartCount={carrinho.length} onOpenCart={()=>setMostrarCarrinho(true)} />

      {/* NOVO: Modal Seletor Tipo */}
      <SeletorTipoUsuario
        open={mostrarSeletorTipo}
        onClose={() => setMostrarSeletorTipo(false)}
        user={user}
        onSuccess={handleTrocaTipoSuccess}
      />
      </div>
    </I18nProvider>
  );
}