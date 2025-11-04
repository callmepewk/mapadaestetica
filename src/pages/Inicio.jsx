
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

const planosAnunciantes = [
  {
    nome: "COBRE",
    preco: "12x R$ 97",
    total: "R$ 1.164/ano",
    cor: "from-orange-600 to-orange-400",
    dimensoes: "300x250px (Banner Médio)",
    posicionamento: "Rodapé das páginas internas",
    prioridade: "Baixa",
    segmentacao: "1 categoria específica",
    acesso_contatos: "Não incluído",
    impressoes: "Até 50.000 impressões/mês",
    beneficios: [
      "Banner médio (300x250px)",
      "Posicionamento no rodapé",
      "Segmentação em 1 categoria",
      "Até 50.000 impressões/mês",
      "Relatório mensal básico",
      "Suporte por email"
    ]
  },
  {
    nome: "PRATA",
    preco: "12x R$ 197",
    total: "R$ 2.364/ano",
    cor: "from-gray-400 to-gray-300",
    dimensoes: "728x90px (Banner Superior)",
    posicionamento: "Topo das páginas de categoria",
    prioridade: "Média",
    segmentacao: "Até 3 categorias",
    acesso_contatos: "Email dos leads",
    impressoes: "Até 150.000 impressões/mês",
    beneficios: [
      "Banner superior (728x90px)",
      "Topo das páginas de categoria",
      "Segmentação em até 3 categorias",
      "Até 150.000 impressões/mês",
      "Acesso aos emails dos leads",
      "Relatório semanal detalhado",
      "Badge 'Patrocinador Prata'",
      "Suporte prioritário"
    ]
  },
  {
    nome: "OURO",
    preco: "12x R$ 597",
    total: "R$ 7.164/ano",
    cor: "from-yellow-500 to-yellow-400",
    dimensoes: "970x250px (Billboard)",
    posicionamento: "Destaque na Home + Páginas Principais",
    prioridade: "Alta",
    segmentacao: "Até 10 categorias ou todas",
    acesso_contatos: "Email + Telefone dos leads",
    impressoes: "Até 500.000 impressões/mês",
    destaque: true,
    beneficios: [
      "Billboard premium (970x250px)",
      "Destaque na Home e páginas principais",
      "Segmentação em até 10 categorias",
      "Até 500.000 impressões/mês",
      "Email + Telefone dos leads qualificados",
      "Post patrocinado mensal no blog",
      "Destaque no newsletter semanal",
      "Relatório em tempo real",
      "Badge 'Patrocinador Ouro'",
      "Gerente de conta dedicado"
    ]
  },
  {
    nome: "DIAMANTE",
    preco: "12x R$ 997",
    total: "R$ 11.964/ano",
    cor: "from-cyan-400 to-blue-500",
    dimensoes: "1920x400px (Banner Full)",
    posicionamento: "Topo Fixo + Pop-up Estratégico",
    prioridade: "Máxima",
    segmentacao: "Todas as categorias + Geolocalização",
    acesso_contatos: "Dados completos + WhatsApp",
    impressoes: "Até 1.000.000 impressões/mês",
    beneficios: [
      "Banner Full HD (1920x400px)",
      "Topo fixo + Pop-up estratégico",
      "Todas as categorias + geolocalização",
      "Até 1.000.000 impressões/mês",
      "Dados completos dos leads (Email, Tel, WhatsApp)",
      "4 posts patrocinados/mês no blog",
      "Destaque premium no newsletter",
      "Campanha de email marketing mensal",
      "Vídeo institucional na home (30s)",
      "Badge 'Patrocinador Diamante'",
      "Analytics avançado em tempo real",
      "Gerente de sucesso dedicado"
    ]
  },
  {
    nome: "PLATINA",
    preco: "12x R$ 1.597",
    total: "R$ 19.164/ano",
    cor: "from-purple-600 to-pink-600",
    dimensoes: "Formatos Personalizados",
    posicionamento: "Exclusividade Total + Takeover",
    prioridade: "EXCLUSIVA",
    segmentacao: "Controle total + IA personalizada",
    acesso_contatos: "CRM integrado + API",
    impressoes: "ILIMITADAS",
    beneficios: [
      "Formatos de banner personalizados",
      "Exclusividade de categoria (sem concorrentes)",
      "Takeover da plataforma (1 dia/mês)",
      "Impressões ILIMITADAS",
      "CRM integrado + API para leads",
      "Posts patrocinados ILIMITADOS",
      "Email marketing semanal",
      "Co-branding em materiais oficiais",
      "Presença em eventos do Mapa da Estética",
      "Landing page personalizada",
      "Badge 'Parceiro Estratégico Platina'",
      "Inteligência de mercado e analytics premium",
      "Equipe de sucesso dedicada"
    ]
  }
];

export default function Inicio() {
  const [buscaCidade, setBuscaCidade] = useState("");
  const [buscaCategoria, setBuscaCategoria] = useState("");
  const [mostrarTermos, setMostrarTermos] = useState(false);
  const [mostrarPlanosAnunciantes, setMostrarPlanosAnunciantes] = useState(false);

  useEffect(() => {
    const termosAceitos = localStorage.getItem('termos_aceitos');
    if (!termosAceitos || termosAceitos !== 'true') {
      setMostrarTermos(true);
    }

    // Geolocalização
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const cidade = data.address.city || data.address.town || data.address.village || "";
          if (cidade) {
            setBuscaCidade(cidade);
          }
        } catch (error) {
          console.error("Erro ao obter localização:", error);
        }
      });
    }
  }, []);

  const { data: anunciosDestaque, isLoading } = useQuery({
    queryKey: ['anuncios-destaque'],
    queryFn: () => base44.entities.Anuncio.filter(
      { status: 'ativo', em_destaque: true },
      '-visualizacoes',
      6
    ),
    initialData: [],
  });

  const { data: anunciosRecentes } = useQuery({
    queryKey: ['anuncios-recentes'],
    queryFn: () => base44.entities.Anuncio.filter(
      { status: 'ativo' },
      '-created_date',
      9
    ),
    initialData: [],
  });

  const handleBuscar = () => {
    const params = new URLSearchParams();
    if (buscaCidade) params.append('cidade', buscaCidade);
    if (buscaCategoria) params.append('categoria', buscaCategoria);
    window.location.href = createPageUrl("Anuncios") + (params.toString() ? `?${params.toString()}` : '');
  };

  const handleSelecionarPlanoAnunciante = (plano) => {
    const mensagem = `Olá! Tenho interesse no plano ${plano.nome} para Anunciantes (${plano.preco}). Gostaria de mais informações! 📢`;
    const whatsapp = "5521980343873";
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen">
      <TermosCondicoes
        open={mostrarTermos}
        onAccept={() => setMostrarTermos(false)}
      />

      {/* Hero Section */}
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

          {/* Search Box */}
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

          {/* Quick Cities */}
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

      {/* Pesquisa Especializada Section */}
      <section className="py-8 bg-gradient-to-r from-[#F7D426] to-[#FFE066]">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="border-none shadow-2xl bg-white/95 backdrop-blur overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe9/6aa7c4ea6_image.png"
                    alt="Dr. Beleza"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <Badge className="mb-2 bg-[#F7D426] text-[#2C2C2C] border-none font-bold">
                    Consulte Tratamentos Agora
                  </Badge>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-2">
                    Assistente de Pesquisa
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Descubra como funciona e qual o tratamento certo para você
                  </p>
                </div>
                <Link to={createPageUrl("PesquisaEspecializada")} className="flex-shrink-0">
                  <Button size="lg" className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold shadow-xl">
                    Acessar Assistente
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Categories Grid */}
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
            {categorias.map((categoria, index) => (
              <CardCategoria key={index} categoria={categoria} />
            ))}
          </div>
        </div>
      </section>

      {/* Tutorial Section */}
      <Tutorial />

      {/* Featured Listings */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 gap-4">
            <div className="w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 fill-yellow-500" />
                <span className="text-xs sm:text-sm font-semibold text-pink-600 uppercase tracking-wide">
                  Separamos para você
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                Profissionais em Destaque
              </h2>
            </div>
            <Link to={createPageUrl("Anuncios")} className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto flex items-center gap-2 justify-center">
                Ver Todos
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="h-80 animate-pulse bg-gray-100" />
              ))
            ) : (
              anunciosDestaque.map((anuncio) => (
                <CardAnuncio key={anuncio.id} anuncio={anuncio} destaque />
              ))
            )}
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <Link to={createPageUrl("Anuncios")}>
              <Button className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white">
                <Search className="w-4 h-4 mr-2" />
                Ver Mais Anúncios
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      {anunciosRecentes.length > 0 && (
        <section className="py-12 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-8 sm:mb-12">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-[#F7D426]" />
                <span className="text-xs sm:text-sm font-semibold text-[#F7D426] uppercase tracking-wide">
                  Novidades
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                Todos os Dias Novos Profissionais
              </h2>
              <p className="text-gray-600 text-base sm:text-lg px-4">
                Procuramos sempre indicar para você o que há de novo no mapa
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {anunciosRecentes.map((anuncio) => (
                <CardAnuncio key={anuncio.id} anuncio={anuncio} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
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

      {/* Calculadora de Laser Section */}
      <CalculadoraLaserSection />

      {/* Patrocinadores Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
              Parceiros Estratégicos
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seja um Patrocinador
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Fortaleça sua marca alcançando milhares de profissionais e clientes da estética
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-2 border-dashed border-gray-300 hover:border-[#F7D426] transition-colors">
                <CardContent className="p-8 text-center">
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-12 h-12 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">Espaço para Patrocinador {i}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Link to={createPageUrl("FaleConosco")}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Quero Ser um Patrocinador
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Anunciantes Section */}
      <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-pink-600 text-white">
              Destaque na Plataforma
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Seja um Anunciante
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Amplie seu alcance com anúncios estratégicos para profissionais e clientes da estética
            </p>
            <Button
              size="lg"
              onClick={() => setMostrarPlanosAnunciantes(!mostrarPlanosAnunciantes)}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
            >
              {mostrarPlanosAnunciantes ? "Ocultar Planos" : "Ver Planos para Anunciantes"}
              {mostrarPlanosAnunciantes ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
            </Button>
          </div>

          {mostrarPlanosAnunciantes && (
            <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-yellow-500 text-gray-900 font-bold">
                  Planos para Anunciantes
                </Badge>
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Amplifique Sua Marca no Maior Marketplace de Estética
                </h3>
                <p className="text-gray-300 text-lg">
                  Milhões de impressões mensais • Público altamente segmentado • ROI comprovado
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {planosAnunciantes.map((plano, index) => (
                  <Card key={index} className={`border-none shadow-2xl hover:shadow-3xl transition-all bg-gray-800 text-white ${plano.destaque ? 'ring-4 ring-yellow-500 transform scale-105' : ''}`}>
                    {plano.destaque && (
                      <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 text-center py-2 font-bold text-sm">
                        ⭐ RECOMENDADO
                      </div>
                    )}
                    <div className={`h-40 bg-gradient-to-br ${plano.cor} p-6 flex flex-col justify-center items-center`}>
                      <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                      <p className="text-2xl font-bold">{plano.preco}</p>
                      <p className="text-sm opacity-80 mt-1">{plano.total}</p>
                    </div>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2 text-sm border-b border-gray-700 pb-4">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Dimensões:</span>
                          <span className="font-semibold text-right">{plano.dimensoes}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Posicionamento:</span>
                          <span className="font-semibold text-right">{plano.posicionamento}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Prioridade:</span>
                          <Badge className={`${plano.prioridade === 'EXCLUSIVA' ? 'bg-purple-600' : plano.prioridade === 'Máxima' ? 'bg-red-600' : plano.prioridade === 'Alta' ? 'bg-orange-600' : 'bg-gray-600'}`}>
                            {plano.prioridade}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Segmentação:</span>
                          <span className="font-semibold text-right">{plano.segmentacao}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Acesso:</span>
                          <span className="font-semibold text-right">{plano.acesso_contatos}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Impressões:</span>
                          <span className="font-semibold text-right">{plano.impressoes}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {plano.beneficios.map((beneficio, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-300">{beneficio}</span>
                          </div>
                        ))}
                      </div>

                      <Button
                        onClick={() => handleSelecionarPlanoAnunciante(plano)}
                        className={`w-full ${plano.destaque ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}`}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contratar {plano.nome}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-gray-400 mb-4">
                  🎯 Todos os planos incluem relatórios detalhados e suporte especializado
                </p>
                <a
                  href={`https://wa.me/5521980343873?text=${encodeURIComponent("Olá! Gostaria de informações sobre os planos para anunciantes do Mapa da Estética! 📢")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Falar com Especialista
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
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
    </div>
  );
}
