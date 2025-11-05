
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
  TrendingUp, // Added for admin reports
  Star // Added for points store
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
import { Badge } from "@/components/ui/badge"; // Added for admin badge
import Chatbot from "./components/home/Chatbot";
import OnboardingModal from "./components/home/OnboardingModal"; // Added OnboardingModal import

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);
  const [testeExpirado, setTesteExpirado] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await base44.auth.isAuthenticated();
        setIsAuthenticated(authenticated);
        if (authenticated) {
          const userData = await base44.auth.me();
          setUser(userData);

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

  // Definir items de navegação baseado no tipo de usuário
  const isPaciente = user?.tipo_usuario === 'paciente';
  const isProfissional = user?.tipo_usuario === 'profissional';
  const isAdmin = user?.role === 'admin'; // Added isAdmin check
  const isTester = user?.role === 'tester'; // Added isTester check

  // Verificar se cadastro está incompleto
  const cadastroIncompleto = isAuthenticated && user && !user.cadastro_completo;

  const navigationItems = [
    { title: "Início", url: createPageUrl("Inicio"), icon: Home },
    { title: "Anúncios", url: createPageUrl("Anuncios"), icon: Search },
    { title: "Produtos", url: createPageUrl("Produtos"), icon: CreditCard },
    ...(!isPaciente ? [{ title: "Planos", url: createPageUrl("Planos"), icon: CreditCard }] : []),
    { title: "Blog", url: createPageUrl("Blog"), icon: Newspaper },
    { title: "Sobre Nós", url: createPageUrl("SobreNos"), icon: Info },
    { title: "Fale Conosco", url: createPageUrl("FaleConosco"), icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <style>{`
        :root {
          --primary: #F7D426;
          --primary-dark: #E5C215;
          --primary-light: #FFF9E6;
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
            <span className="font-semibold">(31) 97259-5643</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo - SEMPRE VISÍVEL */}
            <Link to={createPageUrl("Inicio")} className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/fd230be55_mapaimg.jpg"
                alt="Mapa da Estética"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain transform group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe2/2274d89a4_logo_v1.png';
                }}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-lg transition-all duration-200 font-medium ${
                    location.pathname === item.url
                      ? "bg-[#FFF9E6] text-[#2C2C2C] border-b-2 border-[#F7D426]"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#2C2C2C]"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm">{item.title}</span>
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAuthenticated ? (
                <>
                  {/* Contador de Pontos - SEMPRE ATUALIZADO */}
                  {(isPaciente || isProfissional) && (
                    <Link to={createPageUrl("LojaPontos")}>
                      <Button variant="outline" className="flex items-center gap-2 border-[#F7D426] text-[#F7D426] hover:bg-[#FFF9E6]">
                        <Star className="w-4 h-4" />
                        <span className="font-bold hidden sm:inline">{user?.pontos_acumulados || 0}</span>
                        <span className="text-xs hidden md:inline">pts</span>
                      </Button>
                    </Link>
                  )}

                  {isProfissional && (
                    <Link to={createPageUrl("CadastrarAnuncio")} className="hidden md:block">
                      <Button className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold shadow-lg hover:shadow-xl transition-all duration-200 text-sm border-2 border-[#2C2C2C]">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Cadastrar Anúncio
                      </Button>
                    </Link>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors">
                        <Avatar className="w-9 h-9 sm:w-10 sm:h-10 border-2 border-[#F7D426]">
                          <AvatarImage src={user?.foto_perfil} />
                          <AvatarFallback className="bg-gradient-to-br from-[#F7D426] to-[#FFE066] text-[#2C2C2C] font-bold text-sm">
                            {user?.full_name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-2">
                        <p className="text-sm font-medium truncate">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        {isAdmin && (
                          <Badge className="mt-1 bg-purple-100 text-purple-800">Admin</Badge>
                        )}
                        {isTester && (
                          <Badge className="mt-1 bg-blue-100 text-blue-800">Tester (7 dias)</Badge>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigate(createPageUrl("Perfil"))}>
                        <User className="w-4 h-4 mr-2" />
                        Meu Perfil
                      </DropdownMenuItem>
                      {(isPaciente || isProfissional) && (
                        <DropdownMenuItem onClick={() => navigate(createPageUrl("LojaPontos"))}>
                          <Star className="w-4 h-4 mr-2" />
                          Loja de Pontos ({user?.pontos_acumulados || 0})
                        </DropdownMenuItem>
                      )}
                      {isProfissional && (
                        <DropdownMenuItem onClick={() => navigate(createPageUrl("MeuPlano"))}>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Meu Plano
                        </DropdownMenuItem>
                      )}
                      {isAdmin && (
                        <DropdownMenuItem onClick={() => navigate(createPageUrl("RelatorioPrecoMedio"))}>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Relatórios de Preço
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button
                  onClick={() => base44.auth.redirectToLogin(location.pathname)}
                  className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold text-sm border-2 border-[#2C2C2C]"
                  size="sm"
                >
                  <User className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Entrar</span>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-4 pb-4 space-y-2 border-t pt-4">
              {/* Loja de Pontos no Mobile */}
              {isAuthenticated && (isPaciente || isProfissional) && (
                <Link
                  to={createPageUrl("LojaPontos")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#FFF9E6] text-[#2C2C2C] border-l-4 border-[#F7D426] font-medium"
                >
                  <Star className="w-5 h-5" />
                  <span>Loja de Pontos ({user?.pontos_acumulados || 0})</span>
                </Link>
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
              {isAuthenticated && isProfissional && (
                <Link
                  to={createPageUrl("CadastrarAnuncio")}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[#F7D426] text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Cadastrar Anúncio</span>
                </Link>
              )}
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#2C2C2C] text-white mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div>
              {/* Logo do Mapa da Estética - SEMPRE VISÍVEL */}
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/fd230be55_mapaimg.jpg"
                alt="Mapa da Estética"
                className="h-16 w-auto object-contain mb-4 brightness-0 invert"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe2/2274d89a4_logo_v1.png';
                }}
              />
              <p className="text-gray-400 text-sm mb-2">
                A maior plataforma de profissionais de estética do Brasil.
              </p>
              <p className="text-gray-400 text-xs">
                CNPJ: 46.792.168/0001-88
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#F7D426]">Links Rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl("Inicio")} className="hover:text-[#F7D426] transition-colors">Início</Link></li>
                <li><Link to={createPageUrl("Anuncios")} className="hover:text-[#F7D426] transition-colors">Anúncios</Link></li>
                <li><Link to={createPageUrl("Produtos")} className="hover:text-[#F7D426] transition-colors">Produtos</Link></li>
                {!isPaciente && <li><Link to={createPageUrl("Planos")} className="hover:text-[#F7D426] transition-colors">Planos</Link></li>}
                <li><Link to={createPageUrl("Blog")} className="hover:text-[#F7D426] transition-colors">Blog</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#F7D426]">Contatos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="font-semibold text-white">Central de Vendas:</li>
                <li><a href="tel:31972595643" className="hover:text-[#F7D426] transition-colors">(31) 97259-5643</a></li>
                <li className="font-semibold text-white mt-3">Suporte Técnico:</li>
                <li><a href="tel:54991554136" className="hover:text-[#F7D426] transition-colors">(54) 99155-4136</a></li>
                <li className="font-semibold text-white mt-3">Business & Partnerships:</li>
                <li><a href="tel:31972595643" className="hover:text-[#F7D426] transition-colors">(31) 97259-5643</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-[#F7D426]">Institucional</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to={createPageUrl("FaleConosco")} className="hover:text-[#F7D426] transition-colors">Fale Conosco</Link></li>
                <li><Link to={createPageUrl("SobreNos")} className="hover:text-[#F7D426] transition-colors">Sobre Nós</Link></li>
                <li><Link to={createPageUrl("PesquisaEspecializada")} className="hover:text-[#F7D426] transition-colors">Dr. Beleza</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
            <p>&copy; 2025 Mapa da Estética - Clube da Beleza. Todos os direitos reservados.</p>
            <p className="mt-1">CNPJ: 46.792.168/0001-88</p>
          </div>
        </div>
      </footer>

      {/* Modal de Onboarding - Controlado por Layout */}
      <OnboardingModal
        open={mostrarOnboarding}
        onClose={handleOnboardingClose}
      />
    </div>
  );
}
