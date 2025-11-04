import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
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
  ChevronUp
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

const categorias = [
  { nome: "Depilação", cor: "from-pink-500 to-rose-500", icon: "✨" },
  { nome: "Estética Facial", cor: "from-purple-500 to-pink-500", icon: "💆" },
  { nome: "Estética Corporal", cor: "from-blue-500 to-cyan-500", icon: "💪" },
  { nome: "Massoterapia", cor: "from-green-500 to-emerald-500", icon: "🌿" },
  { nome: "Micropigmentação", cor: "from-orange-500 to-amber-500", icon: "🎨" },
  { nome: "Design de Sobrancelhas", cor: "from-indigo-500 to-purple-500", icon: "👁️" },
  { nome: "Manicure e Pedicure", cor: "from-red-500 to-pink-500", icon: "💅" },
  { nome: "Harmonização Facial", cor: "from-violet-500 to-purple-500", icon: "✨" }
];

const cidades = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília",
  "Curitiba", "Porto Alegre", "Salvador", "Fortaleza"
];

export default function Inicio() {
  const [buscaCidade, setBuscaCidade] = useState("");
  const [buscaCategoria, setBuscaCategoria] = useState("");
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const termosAceitos = localStorage.getItem('termos_aceitos');
    if (!termosAceitos || termosAceitos !== 'true') {
      setMostrarTermos(true);
    }

    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        if (userData && !userData.cadastro_completo) {
          setMostrarOnboarding(true);
        }
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleAceitarTermos = () => {
    localStorage.setItem('termos_aceitos', 'true');
    setMostrarTermos(false);
  };

  const handleOnboardingComplete = async () => {
    setMostrarOnboarding(false);
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
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
    const params = new URLSearchParams();
    if (buscaCidade) params.append('cidade', buscaCidade);
    if (buscaCategoria) params.append('categoria', buscaCategoria);
    window.location.href = createPageUrl("Anuncios") + (params.toString() ? `?${params.toString()}` : '');
  };

  const isPaciente = user?.tipo_usuario === 'paciente';
  const isProfissional = user?.tipo_usuario === 'profissional' || !user;

  return (
    <div className="min-h-screen">
      <TermosCondicoes open={mostrarTermos} onAccept={handleAceitarTermos} />
      <OnboardingModal open={mostrarOnboarding} onComplete={handleOnboardingComplete} />

      {/* Hero Section - TODOS */}
      <section
        className="relative text-white py-12 sm:py-16 md:py-20 lg:py-32 overflow-hidden"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#2C2C2C]/80 via-[#2C2C2C]/70 to-[#2C2C2C]/80"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[#F7D426]/90 text-[#2C2C2C] backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6 font-bold">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm">Mais de 500+ profissionais cadastrados</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight px-2">
            Explore a sua cidade!
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-12 text-white/90 max-w-2xl mx-auto px-4">
            Os melhores serviços e especialistas você encontra aqui
          </p>

          <div className="max-w-4xl mx-auto bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Cidade, ex: São Paulo"
                  value={buscaCidade}
                  onChange={(e) => setBuscaCidade(e.target.value)}
                  className="pl-10 h-12 text-gray-800 border-gray-200 text-base"
                />
              </div>

              <Select value={buscaCategoria} onValueChange={setBuscaCategoria}>
                <SelectTrigger className="h-12 text-gray-800 text-base">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.nome} value={cat.nome}>
                      {cat.icon} {cat.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                onClick={handleBuscar}
                className="h-12 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold shadow-lg hover:shadow-xl transition-all text-base border-2 border-[#2C2C2C]"
              >
                <Search className="w-5 h-5 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-2 px-4">
            <span className="text-white/80 text-xs sm:text-sm w-full sm:w-auto text-center mb-2 sm:mb-0">Cidades populares:</span>
            {cidades.slice(0, 5).map((cidade) => (
              <button
                key={cidade}
                onClick={() => {
                  setBuscaCidade(cidade);
                  handleBuscar();
                }}
                className="text-xs sm:text-sm bg-[#F7D426]/20 hover:bg-[#F7D426]/30 backdrop-blur-sm px-3 py-1 rounded-full transition-all text-white font-medium"
              >
                {cidade}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PROFISSIONAIS: Conteúdo específico */}
      {isProfissional && (
        <>
          <SEOStats />
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

      {/* TODOS: Categorias, Dr. Beleza, Blog, Redes Sociais */}
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

      <section className="py-8 bg-gradient-to-r from-[#F7D426] to-[#FFE066]">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="border-none shadow-2xl bg-white/95 backdrop-blur overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/acc7e047d_drbeleza.png"
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
                <Link to={createPageUrl("PesquisaEspecializada")} className="flex-shrink-0">
                  <Button size="lg" className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold shadow-xl">
                    Acessar Dr. Beleza
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

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

      <section className="py-12 bg-gradient-to-r from-purple-600 to-pink-600">
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
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-xl">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Seguir no Instagram
              </Button>
            </a>

            <a
              href="https://www.facebook.com/mapadaestetica"
              target="_blank"
              rel="noopener noreferrer"
              className="group"
            >
              <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl">
                <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Curtir no Facebook
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}