
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Search,
  MapPin,
  ArrowRight,
  Sparkles,
  Clock,
  Star,
  TrendingUp,
  Check,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  X,
  AlertCircle,
  Eye, // Added for anuncio summary
  Heart, // Added for anuncio summary
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CardAnuncio from "../components/anuncios/CardAnuncio";
import CardCategoria from "../components/home/CardCategoria";
import TermosCondicoes from "../components/home/TermosCondicoes";
import Tutorial from "../components/home/Tutorial";
import { CardContent } from "@/components/ui/card";
import CalculadoraLaserSection from "../components/home/CalculadoraLaserSection";
import SEOStats from "../components/home/SEOStats";
import OnboardingModal from "../components/home/OnboardingModal";
import LoginPromptModal from "../components/home/LoginPromptModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BannerRotativo from "../components/banners/BannerRotativo";

const categorias = [
  { nome: "Depilação", cor: "from-pink-500 to-rose-500", icon: "✨" },
  { nome: "Estética Facial", cor: "from-purple-500 to-pink-500", icon: "💆" },
  { nome: "Estética Corporal", cor: "from-blue-500 to-cyan-500", icon: "💪" },
  { nome: "Massoterapia e Drenagem", cor: "from-green-500 to-emerald-500", icon: "🌿" },
  { nome: "Micropigmentação e Design", cor: "from-orange-500 to-amber-500", icon: "🎨" },
  { nome: "Manicure e Pedicure", cor: "from-red-500 to-pink-500", icon: "💅" },
  { nome: "Harmonização Facial", cor: "from-violet-500 to-purple-500", icon: "✨" },
  { nome: "Dermatologia", cor: "from-teal-500 to-cyan-500", icon: "🩺" },
  { nome: "Medicina Estética", cor: "from-indigo-500 to-blue-500", icon: "⚕️" },
  { nome: "Cirurgia Plástica", cor: "from-fuchsia-500 to-pink-500", icon: "🏥" },
  { nome: "Biomedicina Estética", cor: "from-sky-500 to-blue-500", icon: "🔬" },
  { nome: "Enfermagem Estética", cor: "from-emerald-500 to-teal-500", icon: "💉" }
];

const cidades = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília",
  "Curitiba", "Porto Alegre", "Salvador", "Fortaleza"
];

export default function Inicio() {
  const [buscaCidade, setBuscaCidade] = useState("");
  const [buscaCategoria, setBuscaCategoria] = useState("");
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);
  const [mostrarComparacao, setMostrarComparacao] = useState(false);
  const [mostrarLoginPrompt, setMostrarLoginPrompt] = useState(false);
  const [tipoLoginPrompt, setTipoLoginPrompt] = useState("");
  const [user, setUser] = useState(null);
  const [resumoAnuncios, setResumoAnuncios] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        if (userData && !userData.cadastro_completo) {
          setMostrarOnboarding(true);
        }

        // Buscar resumo dos anúncios do profissional
        if (userData?.tipo_usuario === 'profissional') {
          try {
            const anuncios = await base44.entities.Anuncio.filter(
              { created_by: userData.email, status: 'ativo' },
              '-created_date',
              3
            );
            setResumoAnuncios(anuncios);
          } catch (error) {
            console.error("Erro ao buscar anúncios:", error);
          }
        }
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleOnboardingComplete = async () => {
    setMostrarOnboarding(false);
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleOnboardingClose = () => {
    setMostrarOnboarding(false);
  };

  const { data: anunciosDestaque = [] } = useQuery({
    queryKey: ['anuncios-destaque'],
    queryFn: async () => {
      const anuncios = await base44.entities.Anuncio.filter(
        { status: 'ativo', plano: { $in: ['avancado', 'premium'] } },
        '-created_date',
        6
      );
      return anuncios.sort((a, b) => {
        if (a.plano === 'premium' && b.plano !== 'premium') return -1;
        if (a.plano !== 'premium' && b.plano === 'premium') return 1;
        return 0;
      });
    },
    initialData: [],
  });

  const handleBuscar = () => {
    if (!user) {
      setTipoLoginPrompt("busca");
      setMostrarLoginPrompt(true);
      return;
    }
    
    const params = new URLSearchParams();
    if (buscaCidade) params.append('cidade', buscaCidade);
    if (buscaCategoria) params.append('categoria', buscaCategoria);
    window.location.href = createPageUrl("Anuncios") + (params.toString() ? `?${params.toString()}` : '');
  };

  const handleAcessarDrBeleza = () => {
    if (!user) {
      setTipoLoginPrompt("drbeleza");
      setMostrarLoginPrompt(true);
      return;
    }
    navigate(createPageUrl("PesquisaEspecializada"));
  };

  const handleContratarPatrocinador = (whatsappMessage) => {
    if (!user) {
      setTipoLoginPrompt("patrocinador");
      setMostrarLoginPrompt(true);
      return;
    }
    // Se logado, abre o WhatsApp
    window.open(whatsappMessage, '_blank');
  };

  const isAdmin = user?.role === 'admin';
  const isPaciente = user?.tipo_usuario === 'paciente';
  const isProfissional = user?.tipo_usuario === 'profissional';

  return (
    <div className="min-h-screen">
      <TermosCondicoes />
      <OnboardingModal 
        open={mostrarOnboarding} 
        onComplete={handleOnboardingComplete}
        onClose={handleOnboardingClose}
      />

      {(isPaciente || !user) && (
        <>
          {/* Hero Section - MOBILE OPTIMIZED */}
          <section
            className="relative text-white py-8 sm:py-12 md:py-16 lg:py-20 xl:py-32 overflow-hidden"
            style={{
              backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920&q=80')",
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#2C2C2C]/80 via-[#2C2C2C]/70 to-[#2C2C2C]/80"></div>

            <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 text-center">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-[#F7D426]/90 text-[#2C2C2C] backdrop-blur-sm px-2.5 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full mb-3 sm:mb-4 md:mb-6 font-bold text-xs sm:text-sm">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Mais de 500+ profissionais</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight px-2">
                Explore a sua cidade!
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-2 text-white/90 max-w-2xl mx-auto px-4">
                Os melhores serviços e especialistas você encontra aqui
              </p>
              <p className="text-xs sm:text-sm md:text-base mb-6 sm:mb-8 md:mb-12 text-[#F7D426] font-semibold max-w-2xl mx-auto px-4">
                ✨ Ache um profissional especializado e verificado com apenas um clique
              </p>

              <div className="max-w-4xl mx-auto bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8">
                <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 md:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                    <Input
                      placeholder="Cidade, ex: São Paulo"
                      value={buscaCidade}
                      onChange={(e) => setBuscaCidade(e.target.value)}
                      className="pl-8 sm:pl-10 h-10 sm:h-11 md:h-12 text-gray-800 border-gray-200 text-sm sm:text-base"
                    />
                  </div>

                  <Select value={buscaCategoria} onValueChange={setBuscaCategoria}>
                    <SelectTrigger className="h-10 sm:h-11 md:h-12 text-gray-800 text-sm sm:text-base">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] sm:max-h-[300px]">
                      {categorias.map((cat) => (
                        <SelectItem key={cat.nome} value={cat.nome} className="text-sm sm:text-base">
                          {cat.icon} {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleBuscar}
                    className="h-10 sm:h-11 md:h-12 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base border-2 border-[#2C2C2C]"
                  >
                    <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 md:mt-8 flex flex-wrap justify-center gap-1.5 sm:gap-2 px-4">
                <span className="text-white/80 text-xs sm:text-sm w-full sm:w-auto text-center mb-1.5 sm:mb-0">Cidades populares:</span>
                {cidades.slice(0, 5).map((cidade) => (
                  <button
                    key={cidade}
                    onClick={() => {
                      setBuscaCidade(cidade);
                      handleBuscar();
                    }}
                    className="text-xs sm:text-sm bg-[#F7D426]/20 hover:bg-[#F7D426]/30 backdrop-blur-sm px-2.5 py-1 sm:px-3 rounded-full transition-all text-white font-medium"
                  >
                    {cidade}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* NOVO: Banner Rotativo Topo */}
          <BannerRotativo posicao="home_topo" />
        </>
      )}

      {/* Categorias */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Categorias Especiais
            </h2>
            <p className="text-gray-600 text-base sm:text-lg px-4">
              Explore os melhores profissionais em cada área
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {categorias.map((categoria) => (
              <CardCategoria key={categoria.nome} categoria={categoria} />
            ))}
          </div>
        </div>
      </section>

      {/* NOVO: Banner Rotativo Meio */}
      <BannerRotativo posicao="home_meio" />

      {/* Dr. Beleza */}
      <section className="py-8 bg-gradient-to-r from-[#F7D426] to-[#FFE066]">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="border-none shadow-2xl bg-white/95 backdrop-blur overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe4/ec64a4c52_drbeleza.png"
                    alt="Dr. Beleza"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/160?text=Dr.+Beleza';
                    }}
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <Badge className="mb-2 bg-[#F7D426] text-[#2C2C2C] border-none font-bold">
                    Consulte Tratamentos Agora
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-2">
                    Dr. Beleza - Seu Assistente Inteligente
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Descubra como funciona e qual o tratamento certo para você com inteligência artificial
                  </p>
                </div>
                <Button 
                  onClick={handleAcessarDrBeleza}
                  size="lg" 
                  className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold shadow-xl flex-shrink-0"
                >
                  Acessar Dr. Beleza
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ANÚNCIOS EM DESTAQUE - VISÍVEL PARA TODOS COMO EXEMPLOS */}
      {anunciosDestaque.length > 0 && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <Badge className="mb-4 bg-purple-100 text-purple-800">
                ⭐ Profissionais em Destaque
              </Badge>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[#F7D426]" />
                <span className="text-xs sm:text-sm font-semibold text-[#F7D426] uppercase tracking-wide">
                  Exemplos de Sucesso
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                Veja Como Profissionais Se Destacam
              </h2>
              <p className="text-gray-600 text-base sm:text-lg px-4">
                Conheça profissionais de sucesso que usam nossa plataforma
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {anunciosDestaque.slice(0, 6).map((anuncio) => (
                <CardAnuncio key={anuncio.id} anuncio={anuncio} destaque={true} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to={createPageUrl("Anuncios")}>
                <Button size="lg" variant="outline" className="border-2 border-pink-600 text-pink-600 hover:bg-pink-50">
                  Ver Todos os Anúncios
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* PROFISSIONAIS: Conteúdo específico */}
      {isProfissional && (
        <>
          {/* MELHORADO: Resumo dos Anúncios - Formato Card Scrollável */}
          {resumoAnuncios.length > 0 && (
            <section className="py-8 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Meus Anúncios</h2>
                    <p className="text-gray-600">Acompanhe o desempenho dos seus anúncios</p>
                  </div>
                  <Button
                    onClick={() => navigate(createPageUrl("Perfil"))}
                    variant="outline"
                    className="border-2 border-[#F7D426] text-[#F7D426] hover:bg-[#FFF9E6]"
                  >
                    Ver Todos
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resumoAnuncios.map((anuncio) => (
                    <Card key={anuncio.id} className="border-none shadow-lg hover:shadow-xl transition-all overflow-hidden">
                      {/* Imagem */}
                      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden relative">
                        {anuncio.imagem_principal ? (
                          <img src={anuncio.imagem_principal} alt={anuncio.titulo} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-6xl">✨</span>
                        )}
                        {anuncio.plano && anuncio.plano !== 'cobre' && (
                          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            {anuncio.plano.toUpperCase()}
                          </Badge>
                        )}
                      </div>

                      <CardContent className="p-4">
                        {/* Categoria */}
                        <Badge className="mb-2 bg-pink-100 text-pink-800">{anuncio.categoria}</Badge>
                        
                        {/* Título */}
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{anuncio.titulo}</h3>
                        
                        {/* Localização */}
                        {anuncio.cidade && anuncio.estado && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{anuncio.cidade}, {anuncio.estado}</span>
                          </div>
                        )}

                        {/* Métricas */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3 pb-3 border-b">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {anuncio.visualizacoes || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {anuncio.total_curtidas || anuncio.curtidas || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {(anuncio.comentarios?.length || 0) + (anuncio.perguntas?.length || 0)}
                          </span>
                        </div>

                        {/* Faixa de Preço */}
                        {anuncio.faixa_preco && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Faixa de Preço:</p>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl text-[#F7D426]">{anuncio.faixa_preco}</span>
                              <span className="text-xs text-gray-600">
                                {anuncio.faixa_preco === "$" && "Até R$ 500"}
                                {anuncio.faixa_preco === "$$" && "R$ 500 - R$ 1.000"}
                                {anuncio.faixa_preco === "$$$" && "R$ 1.000 - R$ 2.000"}
                                {anuncio.faixa_preco === "$$$$" && "R$ 2.000 - R$ 5.000"}
                                {anuncio.faixa_preco === "$$$$$" && "Acima de R$ 5.000"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Botão Ver Detalhes */}
                        <Button
                          onClick={() => window.location.href = `${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`}
                          className="w-full bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
                        >
                          Ver Detalhes
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          <SEOStats />

          {/* Botão de Comparação */}
          <div className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <Button
                onClick={() => setMostrarComparacao(true)}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-xl"
              >
                📊 Veja a Comparação: Mapa da Estética vs Outros Sites
              </Button>
            </div>
          </div>

          <Tutorial />
          <CalculadoraLaserSection />

          <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-pink-600 to-rose-600 text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
                Você é um profissional da estética?
              </h2>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-white/90 px-4">
                Cadastre-se gratuitamente e comece a receber clientes hoje mesmo!
              </p>
              <Link to={createPageUrl("CadastrarAnuncio")}>
                <Button size="lg" className="w-full sm:w-auto bg-white text-pink-600 hover:bg-gray-100 font-semibold shadow-xl">
                  Cadastrar Meu Anúncio Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </section>
        </>
      )}

      {/* PATROCINADORES - AMBOS */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
              Parceiros Oficiais
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Nossos Patrocinadores
            </h2>
            <p className="text-gray-600 text-base sm:text-lg px-4 max-w-2xl mx-auto">
              Empresas que confiam e investem no Mapa da Estética
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {/* Placeholder para logos dos patrocinadores */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="aspect-square flex items-center justify-center bg-white hover:shadow-xl transition-shadow border-none">
                <CardContent className="p-4 flex items-center justify-center w-full h-full">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🏢</div>
                    <p className="text-xs text-gray-500">Patrocinador {i}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              Quer se tornar um patrocinador?
            </p>
            <Link to={createPageUrl("Planos")}>
              <Button size="lg" className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]">
                💼 Ver Planos de Patrocínio
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* NOVO: Banner Rotativo Rodapé */}
      <BannerRotativo posicao="home_rodape" />

      {/* Blog - AMBOS */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              <span className="text-xs sm:text-sm font-semibold text-pink-600 uppercase tracking-wide">
                Fique por dentro
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Do Universo da Estética
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 px-4">
              Acompanhe as últimas tendências, novidades e dicas do mundo da estética e beleza
            </p>
            <Link to={createPageUrl("Blog")}>
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white">
                Acessar Blog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* REDES SOCIAIS - AMBOS */}
      <section className="py-12 bg-gradient-to-r from-[#2C2C2C] to-[#3A3A3A]">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              📱 Siga-nos nas Redes Sociais
            </h2>
            <p className="text-white/90 text-lg">
              Fique por dentro de novidades, dicas e tendências do mundo da estética
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.instagram.com/_mapadaestetica/"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-xl flex items-center gap-3 border-2 border-white">
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe4/5391f7e6f_image.png" 
                    alt="Instagram"
                    className="w-6 h-6"
                  />
                </div>
                <span>Seguir no Instagram</span>
              </Button>
            </a>

            <a
              href="https://www.facebook.com/mapadaestetica"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl border-2 border-white">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Curtir no Facebook
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Modal de Login Prompt */}
      <LoginPromptModal
        open={mostrarLoginPrompt}
        onClose={() => setMostrarLoginPrompt(false)}
        pageName={tipoLoginPrompt}
      />

      {/* Modal de Comparação */}
      <Dialog open={mostrarComparacao} onOpenChange={setMostrarComparacao}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              📊 Comparação: Mapa da Estética vs Concorrentes
            </DialogTitle>
            <p className="text-gray-600 mt-2">
              Veja por que somos a melhor escolha para profissionais de estética
            </p>
          </DialogHeader>

          <div className="space-y-8 py-4">
            {/* Tabela Comparativa */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                    <th className="p-4 text-left font-bold">Recurso</th>
                    <th className="p-4 text-center font-bold">
                      <div className="flex flex-col items-center">
                        <span>🏆 Mapa da</span>
                        <span>Estética</span>
                      </div>
                    </th>
                    <th className="p-4 text-center font-bold">Concorrente A</th>
                    <th className="p-4 text-center font-bold">Concorrente B</th>
                    <th className="p-4 text-center font-bold">Concorrente C</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Custo */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">💰 Custo Mensal</td>
                    <td className="p-4 text-center bg-green-50">
                      <span className="text-green-700 font-bold">Grátis - R$ 1.597</span>
                      <p className="text-xs text-green-600 mt-1">5 planos flexíveis</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-gray-700">R$ 299 - R$ 899</span>
                      <p className="text-xs text-gray-500 mt-1">3 planos limitados</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-gray-700">R$ 199 - R$ 599</span>
                      <p className="text-xs text-gray-500 mt-1">Poucos recursos</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-gray-700">R$ 399 - R$ 1.299</span>
                      <p className="text-xs text-gray-500 mt-1">Recursos básicos</p>
                    </td>
                  </tr>

                  {/* Plano Gratuito */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">🆓 Plano Gratuito</td>
                    <td className="p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="text-xs text-green-600 mt-1">Completo e funcional</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não disponível</p>
                    </td>
                    <td className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Muito limitado</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não disponível</p>
                    </td>
                  </tr>

                  {/* Segmentação */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">🎯 Segmentação de Público</td>
                    <td className="p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="text-xs text-green-600 mt-1">100% estética</p>
                    </td>
                    <td className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Público misto</p>
                    </td>
                    <td className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Público geral</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Sem foco</p>
                    </td>
                  </tr>

                  {/* Ferramentas IA */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">🤖 Ferramentas com IA</td>
                    <td className="p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="text-xs text-green-600 mt-1">Dr. Beleza + Assistentes</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não possui</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não possui</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não possui</p>
                    </td>
                  </tr>

                  {/* Calculadoras */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">🧮 Calculadoras Profissionais</td>
                    <td className="p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="text-xs text-green-600 mt-1">Viabilidade + Laser</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não possui</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não possui</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não possui</p>
                    </td>
                  </tr>

                  {/* Relatórios de Preço */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">📊 Relatórios de Preço de Mercado</td>
                    <td className="p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="text-xs text-green-600 mt-1">Completo e detalhado</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não possui</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não possui</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não possui</p>
                    </td>
                  </tr>

                  {/* Suporte */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">🎧 Suporte ao Cliente</td>
                    <td className="p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="text-xs text-green-600 mt-1">WhatsApp + Email + Chat</p>
                    </td>
                    <td className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Apenas email</p>
                    </td>
                    <td className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Email lento</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Suporte limitado</p>
                    </td>
                  </tr>

                  {/* Retenção de Dados */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">🔒 Seus Dados Protegidos</td>
                    <td className="p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="text-xs text-green-600 mt-1">100% seus, LGPD compliant</p>
                    </td>
                    <td className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Compartilhamento parcial</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Dados compartilhados</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Sem garantias</p>
                    </td>
                  </tr>

                  {/* Verificação Profissional */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">✅ Verificação Profissional</td>
                    <td className="p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="text-xs text-green-600 mt-1">3 documentos verificados</p>
                    </td>
                    <td className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Verificação básica</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Sem verificação</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Sem verificação</p>
                    </td>
                  </tr>

                  {/* Estatísticas em Tempo Real */}
                  <tr className="border-b hover:bg-gray-50">
                    <td className="p-4 font-semibold">📈 Estatísticas em Tempo Real</td>
                    <td className="p-4 text-center bg-green-50">
                      <CheckCircle className="w-6 h-6 text-green-600 mx-auto" />
                      <p className="text-xs text-green-600 mt-1">Completas e detalhadas</p>
                    </td>
                    <td className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Básicas</p>
                    </td>
                    <td className="p-4 text-center">
                      <AlertCircle className="w-6 h-6 text-yellow-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Atualizadas com atraso</p>
                    </td>
                    <td className="p-4 text-center">
                      <X className="w-6 h-6 text-red-500 mx-auto" />
                      <p className="text-xs text-gray-500 mt-1">Não possui</p>
                    </td>
                  </tr>

                  {/* ROI */}
                  <tr className="bg-gradient-to-r from-green-50 to-emerald-50">
                    <td className="p-4 font-bold text-lg">💎 CUSTO-BENEFÍCIO</td>
                    <td className="p-4 text-center">
                      <span className="text-3xl">🏆</span>
                      <p className="text-green-700 font-bold mt-2">VENCEDOR</p>
                      <p className="text-xs text-green-600 mt-1">Melhor ROI do mercado</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-2xl">🥈</span>
                      <p className="text-gray-600 font-semibold mt-2">Médio</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-2xl">🥉</span>
                      <p className="text-gray-600 font-semibold mt-2">Baixo</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-2xl">❌</span>
                      <p className="text-gray-600 font-semibold mt-2">Insatisfatório</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Destaques */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4">💰</div>
                  <h3 className="text-xl font-bold text-purple-900 mb-2">Melhor Custo-Benefício</h3>
                  <p className="text-gray-700 text-sm">
                    Do gratuito ao premium, temos o plano perfeito para você. Recursos que os concorrentes cobram caro, aqui você tem inclusos!
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4">🔒</div>
                  <h3 className="text-xl font-bold text-green-900 mb-2">100% Seus Dados</h3>
                  <p className="text-gray-700 text-sm">
                    Seus clientes são SEUS! Não compartilhamos dados com terceiros. Total conformidade com LGPD e proteção garantida.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-blue-900 mb-2">Segmentação Total</h3>
                  <p className="text-gray-700 text-sm">
                    100% focado em estética! Enquanto outros misturam categorias, nós somos especialistas no seu segmento.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Final */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white">
              <h3 className="text-3xl font-bold mb-4">🏆 A Escolha Óbvia</h3>
              <p className="text-xl mb-6 text-white/90">
                Junte-se a mais de 500 profissionais que já escolheram o Mapa da Estética
              </p>
              <div className="grid sm:grid-cols-2 gap-4 justify-center max-w-2xl mx-auto">
                <Link to={createPageUrl("CadastrarAnuncio")}>
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 font-bold shadow-xl w-full text-base py-6">
                    Começar Grátis Agora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a
                  href={`https://wa.me/5531972595643?text=${encodeURIComponent("Olá! Vi a comparação e quero saber mais sobre os planos do Mapa da Estética!")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 w-full font-bold shadow-xl text-base py-6">
                    Falar com Especialista
                    <MessageCircle className="w-5 h-5 ml-2" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
