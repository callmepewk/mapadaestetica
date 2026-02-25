import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, MapPin, Grid, List, Locate, Sparkles, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CardAnuncio from "../components/anuncios/CardAnuncio";
import ProductCard from "../components/anuncios/ProductCard";
import SeletorProcedimentos from "../components/anuncios/SeletorProcedimentos";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import LoginPromptModal from "../components/home/LoginPromptModal";
import { Label } from "@/components/ui/label";
import MapaEstetica from "../components/anuncios/MapaEstetica";


const categorias = [
  "Todas",
  "Estética Facial - Tratamentos Básicos",
  "Estética Facial - Rejuvenescimento",
  "Estética Facial - Tratamento de Condições",
  "Estética Facial - Harmonização",
  "Estética Corporal - Redução de Medidas",
  "Estética Corporal - Celulite e Estrias",
  "Estética Corporal - Flacidez e Contorno",
  "Depilação",
  "Drenagem Linfática",
  "Estética Capilar e Tricologia",
  "Transplante Capilar",
  "Manicure e Pedicure",
  "Podologia",
  "Micropigmentação e Design de Sobrancelhas",
  "Micropigmentação - Olhos e Lábios",
  "Extensão e Alongamento de Cílios",
  "Medicina Estética",
  "Dermatologia",
  "Cirurgia Plástica",
  "Fisioterapia Dermato Funcional",
  "Nutrição Estética",
  "Psicologia e Coaching de Imagem",
  "Pilates e Fitness",
  "Acupuntura Estética",
  "Terapias Integrativas e Complementares",
  "Biomedicina Estética",
  "Enfermagem Estética",
  "Farmácia Estética",
  "Odontologia Estética",
  "Massoterapia",
  "Barbearia",
  "Tatuagem e Piercing",
  "Spa e Bem-Estar",
  "Longevidade e Medicina Integrativa",
  "Clínicas e Consultórios",
  "Salões de Beleza",
  "Equipamentos - Venda",
  "Equipamentos - Locação",
  "Equipamentos - Seminovos",
  "Cosméticos e Produtos",
  "Injetáveis e Preenchedores",
  "Nutracêuticos e Suplementos",
  "Móveis e Decoração para Clínicas",
  "Softwares de Gestão",
  "Uniformes e Vestuário Profissional",
  "Roupas de Compressão Pós-Cirúrgica",
  "Alimentação Saudável e Fitness",
  "Personal Trainer",
  "Educação - Cursos e Workshops",
  "Eventos - Congressos e Feiras",
  "Consultoria e Assessoria",
  "Franquias",
  "Turismo de Saúde",
  "Seguros e Financiamentos",
  "Marketing e Design",
  "Outros"
];

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const faixasPreco = ["Todas", "$", "$$", "$$$", "$$$$", "$$$$$"];

const ITEMS_PER_PAGE = 10;

const tiposAnuncio = [
  { valor: "servico", label: "💼 Serviço" },
  { valor: "procedimento", label: "🔬 Procedimento" },
  { valor: "tecnica", label: "✨ Técnica" },
  { valor: "consultorio", label: "🏢 Consultório" },
  { valor: "clinica", label: "🏥 Clínica" },
  { valor: "promocao", label: "🎁 Promoção" },
  { valor: "evento", label: "📅 Evento" },
  { valor: "venda_produto", label: "🛍️ Venda de Produto" },
  { valor: "venda_aparelho", label: "⚙️ Venda de Aparelho" },
  { valor: "aluguel_produto", label: "📦 Aluguel de Produto" },
  { valor: "aluguel_aparelho", label: "🔧 Aluguel de Aparelho" },
  { valor: "troca_produto", label: "🔄 Troca de Produto" },
  { valor: "troca_aparelho", label: "♻️ Troca de Aparelho" },
  { valor: "venda_moveis", label: "🛋️ Venda de Móveis" },
  { valor: "troca_moveis", label: "🪑 Troca de Móveis" }
];

const statusFuncionamento = [
  { valor: "Aberto Agora", label: "🟢 Aberto Agora" },
  { valor: "Fechado", label: "🔴 Fechado" },
  { valor: "Sempre Aberto", label: "🔵 Sempre Aberto (24h)" },
  { valor: "N/D", label: "⚪ Não Informado" }
];

const tiposEstabelecimento = [
  { valor: "todos", label: "Todos os tipos", estrelas: null },
  { valor: "Consultório", label: "⭐ Consultório", estrelas: 1 },
  { valor: "Clínica", label: "⭐⭐ Clínica", estrelas: 2 },
  { valor: "Centro Clínico", label: "⭐⭐⭐ Centro Clínico", estrelas: 3 },
  { valor: "Centro de Especialidade", label: "⭐⭐⭐⭐ Centro Estético", estrelas: 4 },
  { valor: "Clínica de Luxo", label: "⭐⭐⭐⭐⭐ Clínica de Luxo", estrelas: 5 }
];

const faixasDistancia = [
  { valor: "todas", label: "Todas as distâncias" },
  { valor: "0-0.5", label: "Até 500m" },
  { valor: "0.5-1", label: "500m a 1km" },
  { valor: "1-2", label: "1km a 2km" },
  { valor: "2-5", label: "2km a 5km" },
  { valor: "5-10", label: "5km a 10km" },
  { valor: "10-20", label: "10km a 20km" },
  { valor: "20-50", label: "20km a 50km" },
  { valor: "50-100", label: "50km a 100km" },
  { valor: "100-250", label: "100km a 250km" },
  { valor: "250-500", label: "250km a 500km" }
];

const faixasTempoFormacao = [
  { valor: "todas", label: "Qualquer tempo" },
  { valor: "0-2", label: "Até 2 anos" },
  { valor: "2-5", label: "2 a 5 anos" },
  { valor: "5-10", label: "5 a 10 anos" },
  { valor: "10-20", label: "10 a 20 anos" },
  { valor: "20+", label: "Mais de 20 anos" }
];

// Função para calcular distância entre dois pontos (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distância em km
}

export default function Anuncios() {
  const [buscaTexto, setBuscaTexto] = useState("");
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [procedimentoFiltro, setProcedimentoFiltro] = useState("");
  const [tagFiltro, setTagFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [localizando, setLocalizando] = useState(false);
  const [ordenacao, setOrdenacao] = useState("mais_recentes");
  const [faixaPrecoFiltro, setFaixaPrecoFiltro] = useState("Todas");
  const [filtroTipoAnuncio, setFiltroTipoAnuncio] = useState("");
  const [filtroStatusFuncionamento, setFiltroStatusFuncionamento] = useState("");
  const [mostrarSeletorProcedimentos, setMostrarSeletorProcedimentos] = useState(false);
  const [apenasVerificados, setApenasVerificados] = useState(false);
  const [filtroTipoEstabelecimento, setFiltroTipoEstabelecimento] = useState("todos");
  
  const [filtroDistancia, setFiltroDistancia] = useState("todas");
  const [filtroTempoFormacao, setFiltroTempoFormacao] = useState("todas");
  const [minhaLocalizacao, setMinhaLocalizacao] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("lista");

  const [user, setUser] = useState(null);
  const [mostrarLoginPrompt, setMostrarLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
        setTimeout(() => {
          setMostrarLoginPrompt(true);
        }, 1000);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cidade = urlParams.get('cidade');
    const estado = urlParams.get('estado');
    const categoria = urlParams.get('categoria');
    const procedimento = urlParams.get('procedimento');
    const tag = urlParams.get('tag');
    const ordem = urlParams.get('ordem');
    const faixaPreco = urlParams.get('faixaPreco');
    const tipoAnuncio = urlParams.get('tipoAnuncio');
    const statusFuncionamentoParam = urlParams.get('statusFuncionamento');
    const verificados = urlParams.get('verificados');
    const distancia = urlParams.get('distancia');
    const tempoFormacao = urlParams.get('tempoFormacao');
    const tipoEstabelecimento = urlParams.get('tipoEstabelecimento');

    if (cidade) setCidadeFiltro(cidade);
    if (estado) setEstadoFiltro(estado);
    if (categoria) setCategoriaFiltro(categoria);
    if (procedimento) setProcedimentoFiltro(procedimento);
    if (tag) setTagFiltro(tag);
    if (ordem) setOrdenacao(ordem);
    if (faixaPreco) setFaixaPrecoFiltro(faixaPreco);
    if (tipoAnuncio) setFiltroTipoAnuncio(tipoAnuncio);
    if (statusFuncionamentoParam) setFiltroStatusFuncionamento(statusFuncionamentoParam);
    if (verificados) setApenasVerificados(verificados === 'true');
    if (distancia) setFiltroDistancia(distancia);
    if (tempoFormacao) setFiltroTempoFormacao(tempoFormacao);
    if (tipoEstabelecimento) setFiltroTipoEstabelecimento(tipoEstabelecimento);
  }, []);

  const usarMinhaLocalizacao = async () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador");
      return;
    }

    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setMinhaLocalizacao({ latitude, longitude });
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const cidade = data.address.city || data.address.town || data.address.village || "";
          const estado = data.address.state_code || data.address.state || "";
          
          if (cidade) setCidadeFiltro(cidade);
          if (estado) setEstadoFiltro(estado.substring(0, 2).toUpperCase());
          setPaginaAtual(1);
        } catch (error) {
          console.error("Erro ao obter localização ou reverter:", error);
          alert("Erro ao obter localização. Tente novamente.");
        } finally {
          setLocalizando(false);
        }
      },
      (error) => {
        console.error("Erro de geolocalização:", error);
        alert("Não foi possível obter sua localização. Verifique as permissões.");
        setLocalizando(false);
      }
    );
  };

  const serverSideFilters = useMemo(() => ({
    cidade: cidadeFiltro,
    estado: estadoFiltro,
    categoria: categoriaFiltro,
  }), [cidadeFiltro, estadoFiltro, categoriaFiltro]);

  const { data: fetchedAnuncios = [], isLoading } = useQuery({
    queryKey: ['anuncios', serverSideFilters, ordenacao],
    queryFn: async () => {
      let query = { status: 'ativo' };
      
      if (serverSideFilters.cidade) {
        query.cidade = { $regex: serverSideFilters.cidade, $options: 'i' };
      }
      
      if (serverSideFilters.categoria && serverSideFilters.categoria !== 'Todas') {
        query.categoria = serverSideFilters.categoria;
      }
      
      if (serverSideFilters.estado) {
        query.estado = serverSideFilters.estado.toUpperCase();
      }
      
      let ordemParam = '-created_date';
      if (ordenacao === 'mais_visualizados') ordemParam = '-visualizacoes';
      if (ordenacao === 'mais_antigos') ordemParam = 'created_date';
      
      const result = await base44.entities.Anuncio.filter(query, ordemParam, 100);
      return result;
    },
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: false,
    initialData: [],
  });

  const { data: produtosAtivos = [] } = useQuery({
    queryKey: ['produtos-para-anuncios'],
    queryFn: async () => await base44.entities.Produto.filter({ status: 'ativo' }, '-created_date', 200),
    staleTime: 5 * 60 * 1000,
  });

  const anuncios = useMemo(() => {
    const planoOrdem = { 'premium': 4, 'avancado': 3, 'intermediario': 2, 'basico': 1 };
    
    return fetchedAnuncios
      .filter(anuncio => {
        const matchProcedimento = !procedimentoFiltro ||
          anuncio.procedimentos_servicos?.some(p => 
            p.toLowerCase().includes(procedimentoFiltro.toLowerCase())
          ) ||
          anuncio.titulo?.toLowerCase().includes(procedimentoFiltro.toLowerCase()) ||
          anuncio.descricao?.toLowerCase().includes(procedimentoFiltro.toLowerCase());
        
        const matchTag = !tagFiltro ||
          anuncio.tags?.some(t => 
            t.toLowerCase().includes(tagFiltro.toLowerCase())
          );
        
        const matchBusca = !buscaTexto ||
          anuncio.titulo?.toLowerCase().includes(buscaTexto.toLowerCase()) ||
          anuncio.profissional?.toLowerCase().includes(buscaTexto.toLowerCase()) ||
          anuncio.descricao?.toLowerCase().includes(buscaTexto.toLowerCase()) ||
          anuncio.horario_funcionamento?.toLowerCase().includes(buscaTexto.toLowerCase()) ||
          anuncio.procedimentos_servicos?.some(p => 
            p.toLowerCase().includes(buscaTexto.toLowerCase())
          ) ||
          anuncio.tags?.some(t => 
            t.toLowerCase().includes(buscaTexto.toLowerCase())
          );
        
        const matchCidade = !cidadeFiltro || 
          anuncio.cidade?.toLowerCase().includes(cidadeFiltro.toLowerCase());
        
        const matchEstado = !estadoFiltro ||
          anuncio.estado?.toLowerCase().includes(estadoFiltro.toLowerCase());

        const matchFaixaPreco = faixaPrecoFiltro === "Todas" || anuncio.faixa_preco === faixaPrecoFiltro; 
        
        const matchTipoAnuncio = !filtroTipoAnuncio || anuncio.tipo_anuncio === filtroTipoAnuncio;
        const matchStatusFuncionamento = !filtroStatusFuncionamento || anuncio.status_funcionamento === filtroStatusFuncionamento;
        
        const matchVerificados = !apenasVerificados || anuncio.verificado;

        const matchTipoEstabelecimento = filtroTipoEstabelecimento === "todos" || 
          anuncio.tipo_estabelecimento === filtroTipoEstabelecimento;

        let matchDistancia = true;
        if (filtroDistancia !== "todas" && minhaLocalizacao && anuncio.latitude && anuncio.longitude) {
          const distanciaKm = calcularDistancia(
            minhaLocalizacao.latitude,
            minhaLocalizacao.longitude,
            anuncio.latitude,
            anuncio.longitude
          );
          
          const [minStr, maxStr] = filtroDistancia.split('-');
          const min = parseFloat(minStr);
          const max = parseFloat(maxStr);

          if (minStr === "0") {
            matchDistancia = distanciaKm <= max;
          } else {
            matchDistancia = distanciaKm >= min && distanciaKm <= max;
          }
        }
        
        let matchTempoFormacao = true;
        if (filtroTempoFormacao !== "todas" && anuncio.tempo_formacao_anos !== undefined && anuncio.tempo_formacao_anos !== null) {
          if (filtroTempoFormacao === "20+") {
            matchTempoFormacao = anuncio.tempo_formacao_anos >= 20;
          } else {
            const [min, max] = filtroTempoFormacao.split('-').map(Number);
            matchTempoFormacao = anuncio.tempo_formacao_anos >= min && anuncio.tempo_formacao_anos <= max;
          }
        }
        
        return matchCidade && matchEstado && matchProcedimento && matchTag && matchBusca && 
               matchFaixaPreco && matchTipoAnuncio && matchStatusFuncionamento && matchVerificados &&
               matchDistancia && matchTempoFormacao && matchTipoEstabelecimento;
      })
      .sort((a, b) => {
        const planoA = planoOrdem[a.plano] || 0;
        const planoB = planoOrdem[b.plano] || 0;
        if (planoB !== planoA) {
          return planoB - planoA;
        }
        return new Date(b.created_date) - new Date(a.created_date);
      });
  }, [fetchedAnuncios, buscaTexto, procedimentoFiltro, tagFiltro, cidadeFiltro, estadoFiltro, 
      faixaPrecoFiltro, filtroTipoAnuncio, filtroStatusFuncionamento, apenasVerificados,
      filtroDistancia, filtroTempoFormacao, minhaLocalizacao, filtroTipoEstabelecimento]);

  const anunciosComLocalizacao = useMemo(() => {
    return anuncios.filter(a => a.latitude && a.longitude);
  }, [anuncios]);

  const totalPaginas = Math.ceil(anuncios.length / ITEMS_PER_PAGE);
  const anunciosPaginados = anuncios.slice(
    (paginaAtual - 1) * ITEMS_PER_PAGE,
    paginaAtual * ITEMS_PER_PAGE
  );

  const handlePaginaChange = (novaPagina) => {
    setPaginaAtual(novaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limparFiltros = () => {
    setCategoriaFiltro("Todas");
    setCidadeFiltro("");
    setEstadoFiltro("");
    setBuscaTexto("");
    setProcedimentoFiltro("");
    setTagFiltro("");
    setFaixaPrecoFiltro("Todas");
    setFiltroTipoAnuncio("");
    setFiltroStatusFuncionamento("");
    setApenasVerificados(false);
    setFiltroDistancia("todas");
    setFiltroTempoFormacao("todas");
    setFiltroTipoEstabelecimento("todos");
    setPaginaAtual(1);

    const url = new URL(window.location);
    url.search = '';
    window.history.pushState({}, '', url);
  };

  const temFiltrosAtivos = 
    categoriaFiltro !== "Todas" ||
    cidadeFiltro !== "" ||
    estadoFiltro !== "" ||
    buscaTexto !== "" ||
    procedimentoFiltro !== "" ||
    tagFiltro !== "" ||
    filtroTipoAnuncio !== "" ||
    filtroStatusFuncionamento !== "" ||
    faixaPrecoFiltro !== "Todas" ||
    apenasVerificados ||
    filtroDistancia !== "todas" ||
    filtroTempoFormacao !== "todas" ||
    filtroTipoEstabelecimento !== "todos";

  const getFaixaPrecoInfo = (faixa) => {
    const info = {
      "$": { texto: "Até R$ 500", emoji: "💚" },
      "$$": { texto: "R$ 500 - R$ 1.000", emoji: "💙" },
      "$$$": { texto: "R$ 1.000 - R$ 2.000", emoji: "💛" },
      "$$$$": { texto: "R$ 2.000 - R$ 5.000", emoji: "🧡" },
      "$$$$$": { texto: "Acima de R$ 5.000", emoji: "❤️" }
    };
    return info[faixa];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-4 sm:py-8 pb-20 sm:pb-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Encontre Profissionais de Estética
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Explore os melhores profissionais de estética perto de você
          </p>
        </div>

        {/* Abas: Lista e Mapa - MOBILE OPTIMIZED */}
        <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-2 px-2">
          <Button
            onClick={() => setAbaAtiva("lista")}
            variant={abaAtiva === "lista" ? "default" : "outline"}
            className={`flex-shrink-0 h-9 sm:h-10 text-xs sm:text-sm ${abaAtiva === "lista" ? "bg-pink-600 hover:bg-pink-700" : ""}`}
          >
            <List className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span>Lista ({anuncios.length})</span>
          </Button>
          <Button
            onClick={() => setAbaAtiva("mapa")}
            variant={abaAtiva === "mapa" ? "default" : "outline"}
            className={`flex-shrink-0 h-9 sm:h-10 text-xs sm:text-sm ${abaAtiva === "mapa" ? "bg-pink-600 hover:bg-pink-700" : ""}`}
          >
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
            <span>Mapa ({anunciosComLocalizacao.length})</span>
          </Button>
        </div>

        {abaAtiva === "lista" ? (
          <>
            {/* Filtros - MOBILE OPTIMIZED */}
            <Card className="p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 md:mb-8 shadow-lg border-none">
              <CardContent className="p-0 sm:p-2 md:p-4">
                <div className="space-y-3 sm:space-y-4">
                  {/* Primeira linha de filtros */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    <div>
                      <Label className="mb-1.5 sm:mb-2 block font-semibold text-xs sm:text-sm">Buscar</Label>
                      <Input
                        placeholder="Digite aqui..."
                        value={buscaTexto}
                        onChange={(e) => {
                          setBuscaTexto(e.target.value);
                          setPaginaAtual(1);
                        }}
                        className="w-full h-9 sm:h-10 md:h-11 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="mb-1.5 sm:mb-2 block font-semibold text-xs sm:text-sm">Categoria</Label>
                      <Select
                        value={categoriaFiltro}
                        onValueChange={(value) => {
                          setCategoriaFiltro(value);
                          setPaginaAtual(1);
                        }}
                      >
                        <SelectTrigger className="h-9 sm:h-10 md:h-11 text-sm">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px] sm:max-h-[300px]">
                          {categorias.map((cat) => (
                            <SelectItem key={cat} value={cat} className="text-sm">
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-1.5 sm:mb-2 block font-semibold text-xs sm:text-sm">Procedimento</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ex: Botox..."
                          value={procedimentoFiltro}
                          onChange={(e) => {
                            setProcedimentoFiltro(e.target.value);
                            setPaginaAtual(1);
                          }}
                          className="h-9 sm:h-10 md:h-11 text-sm flex-1"
                        />
                        <Button
                          type="button"
                          onClick={() => setMostrarSeletorProcedimentos(true)}
                          variant="outline"
                          className="h-9 sm:h-10 md:h-11 px-2.5 sm:px-3 flex-shrink-0"
                          title="Selecionar da lista"
                        >
                          <Search className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Segunda linha de filtros */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    <div>
                      <Label className="mb-1.5 block font-semibold text-xs sm:text-sm">Cidade</Label>
                      <Input
                        placeholder="Digite a cidade"
                        value={cidadeFiltro}
                        onChange={(e) => {
                          setCidadeFiltro(e.target.value);
                          setPaginaAtual(1);
                        }}
                        className="h-9 sm:h-10 text-sm"
                      />
                    </div>

                    <div>
                      <Label className="mb-1.5 block font-semibold text-xs sm:text-sm">Estado</Label>
                      <Select
                        value={estadoFiltro}
                        onValueChange={(value) => {
                          setEstadoFiltro(value);
                          setPaginaAtual(1);
                        }}
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          <SelectItem value={null} className="text-sm">Todos</SelectItem>
                          {estados.map((estado) => (
                            <SelectItem key={estado} value={estado} className="text-sm">{estado}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-1.5 block font-semibold text-xs sm:text-sm">Preço</Label>
                      <Select
                        value={faixaPrecoFiltro}
                        onValueChange={(value) => {
                          setFaixaPrecoFiltro(value);
                          setPaginaAtual(1);
                        }}
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="R$" />
                        </SelectTrigger>
                        <SelectContent>
                          {faixasPreco.map((faixa) => (
                            <SelectItem key={faixa} value={faixa} className="text-sm">
                              {faixa === "Todas" ? "Todas" : faixa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-1.5 block font-semibold text-xs sm:text-sm">Verificação</Label>
                      <label className="flex items-center gap-2 mt-2 cursor-pointer h-9">
                        <input
                          type="checkbox"
                          checked={apenasVerificados}
                          onChange={(e) => {
                            setApenasVerificados(e.target.checked);
                            setPaginaAtual(1);
                          }}
                          className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Verificados</span>
                      </label>
                    </div>
                  </div>

                  {/* Terceira linha - MOBILE GRID OPTIMIZED */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    <div>
                      <Label className="mb-1.5 block font-semibold text-xs sm:text-sm">Tipo de Anúncio</Label>
                      <Select
                        value={filtroTipoAnuncio}
                        onValueChange={(value) => {
                          setFiltroTipoAnuncio(value);
                          setPaginaAtual(1);
                        }}
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[250px]">
                          <SelectItem value={null} className="text-sm">Todos os tipos</SelectItem>
                          {tiposAnuncio.map((tipo) => (
                            <SelectItem key={tipo.valor} value={tipo.valor} className="text-sm">
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-1.5 block font-semibold text-xs sm:text-sm">Tipo Estabelecimento</Label>
                      <Select
                        value={filtroTipoEstabelecimento}
                        onValueChange={(value) => {
                          setFiltroTipoEstabelecimento(value);
                          setPaginaAtual(1);
                        }}
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposEstabelecimento.map((tipo) => (
                            <SelectItem key={tipo.valor} value={tipo.valor} className="text-sm">
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-1.5 block font-semibold text-xs sm:text-sm">Distância</Label>
                      <Select
                        value={filtroDistancia}
                        onValueChange={(value) => {
                          setFiltroDistancia(value);
                          setPaginaAtual(1);
                        }}
                        disabled={!minhaLocalizacao}
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder={minhaLocalizacao ? "Distância" : "Use GPS"} />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]">
                          {faixasDistancia.map((faixa) => (
                            <SelectItem key={faixa.valor} value={faixa.valor} className="text-sm">
                              {faixa.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!minhaLocalizacao && (
                        <p className="text-xs text-gray-500 mt-0.5">Use GPS primeiro</p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-1.5 block font-semibold text-xs sm:text-sm">Tempo Formação</Label>
                      <Select
                        value={filtroTempoFormacao}
                        onValueChange={(value) => {
                          setFiltroTempoFormacao(value);
                          setPaginaAtual(1);
                        }}
                      >
                        <SelectTrigger className="h-9 sm:h-10 text-sm">
                          <SelectValue placeholder="Anos" />
                        </SelectTrigger>
                        <SelectContent>
                          {faixasTempoFormacao.map((faixa) => (
                            <SelectItem key={faixa.valor} value={faixa.valor} className="text-sm">
                              {faixa.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Botão Limpar Filtros - MOBILE */}
                  {temFiltrosAtivos && (
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={limparFiltros}
                        variant="outline"
                        size="sm"
                        className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 text-xs h-8 sm:h-auto"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                        Limpar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Localização e Ordenação - MOBILE */}
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mb-4">
              <Button
                onClick={usarMinhaLocalizacao}
                disabled={localizando}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
              >
                <Locate className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                {localizando ? "Localizando..." : "Minha Localização"}
              </Button>
              
              <Select
                value={ordenacao}
                onValueChange={(value) => {
                  setOrdenacao(value);
                  setPaginaAtual(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-52 md:w-64 h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mais_recentes" className="text-sm">Mais Recentes</SelectItem>
                  <SelectItem value="mais_visualizados" className="text-sm">Mais Visualizados</SelectItem>
                  <SelectItem value="mais_antigos" className="text-sm">Mais Antigos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resultados e Modo de Visualização - MOBILE */}
            <div className="flex items-center justify-between mt-4 pt-3 sm:pt-4 border-t">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-600">
                  {anuncios.length} {anuncios.length !== 1 ? 'resultados' : 'resultado'}
                </span>
              </div>

              <div className="flex gap-1.5 sm:gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 ${viewMode === "grid" ? "bg-pink-600 hover:bg-pink-700" : ""}`}
                >
                  <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={`w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 ${viewMode === "list" ? "bg-pink-600 hover:bg-pink-700" : ""}`}
                >
                  <List className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6 md:mt-8">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="h-64 sm:h-80 md:h-96 animate-pulse bg-gray-100" />
                ))}
              </div>
            ) : anuncios.length === 0 ? (
              <Card className="p-6 sm:p-8 md:p-12 text-center mt-4 sm:mt-6 md:mt-8">
                <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🔍</div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Nenhum anúncio encontrado
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-gray-600">
                  Tente ajustar os filtros ou fazer uma nova busca
                </p>
              </Card>
            ) : (
              <>
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6 md:mt-8" 
                  : "space-y-3 sm:space-y-4 mt-4 sm:mt-6 md:mt-8"
                }>
                  {anunciosPaginados.map((anuncio) => (
                    <CardAnuncio key={anuncio.id} anuncio={anuncio} />
                  ))}
                </div>

                {/* Pagination - MOBILE OPTIMIZED */}
                {totalPaginas > 1 && (
                  <div className="mt-6 sm:mt-8 md:mt-12 flex justify-center">
                    <Pagination>
                      <PaginationContent className="gap-1">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => paginaAtual > 1 && handlePaginaChange(paginaAtual - 1)}
                            className={`h-8 sm:h-10 text-xs sm:text-sm ${paginaAtual === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                          />
                        </PaginationItem>
                        
                        {/* Show fewer pages on mobile */}
                        {Array.from({ length: Math.min(3, totalPaginas) }, (_, i) => {
                          let pageNum;
                          if (totalPaginas <= 3) {
                            pageNum = i + 1;
                          } else if (paginaAtual <= 2) {
                            pageNum = i + 1;
                          } else if (paginaAtual >= totalPaginas - 1) {
                            pageNum = totalPaginas - 2 + i;
                          } else {
                            pageNum = paginaAtual - 1 + i;
                          }
                          
                          return (
                            <PaginationItem key={pageNum} className="hidden sm:block">
                              <PaginationLink
                                onClick={() => handlePaginaChange(pageNum)}
                                isActive={paginaAtual === pageNum}
                                className="cursor-pointer h-10 text-sm"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        {/* Mobile: show current page only */}
                        <PaginationItem className="sm:hidden">
                          <PaginationLink
                            isActive={true}
                            className="h-8 text-xs px-3"
                          >
                            {paginaAtual}
                          </PaginationLink>
                        </PaginationItem>

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => paginaAtual < totalPaginas && handlePaginaChange(paginaAtual + 1)}
                            className={`h-8 sm:h-10 text-xs sm:text-sm ${paginaAtual === totalPaginas ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          /* MAPA - MOBILE OPTIMIZED */
          <div className="space-y-4 sm:space-y-6">
            <Card className="p-3 sm:p-4 md:p-6 shadow-lg border-none">
              <CardContent className="p-0 sm:p-2 md:p-4">
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-full sm:w-auto">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                        🗺️ Mapa da Estética Interativo
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600">
                        Visualize {anunciosComLocalizacao.length} profissionais próximos
                      </p>
                    </div>
                    
                    {!minhaLocalizacao && (
                      <Button
                        onClick={usarMinhaLocalizacao}
                        disabled={localizando}
                        className="bg-pink-600 hover:bg-pink-700 w-full sm:w-auto h-9 sm:h-10 text-xs sm:text-sm"
                      >
                        <Locate className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {localizando ? "Localizando..." : "Minha Localização"}
                      </Button>
                    )}
                  </div>

                  {minhaLocalizacao && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-2.5 sm:p-3 mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm text-green-800 font-semibold">
                        ✓ Sua localização: {cidadeFiltro} - {estadoFiltro}
                      </p>
                    </div>
                  )}
                </div>

                {anunciosComLocalizacao.length > 0 ? (
                  <>
                    <MapaEstetica 
                      anuncios={anunciosComLocalizacao}
                      minhaLocalizacao={minhaLocalizacao}
                      cidadeFiltro={cidadeFiltro}
                      estadoFiltro={estadoFiltro}
                      calcularDistancia={calcularDistancia}
                    />

                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                      <h4 className="font-semibold mb-2 text-xs sm:text-sm">Legenda:</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs sm:text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full flex-shrink-0"></div>
                          <span>Sua localização</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span>Profissional Verificado ✓</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                          <span>Profissional</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-2">
                      Nenhum profissional com localização encontrado
                    </h3>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-3 sm:mb-4 px-4">
                      Ajuste os filtros para encontrar profissionais próximos a você
                    </p>
                    {!minhaLocalizacao && (
                      <Button
                        onClick={usarMinhaLocalizacao}
                        disabled={localizando}
                        className="bg-pink-600 hover:bg-pink-700 h-9 sm:h-10 text-xs sm:text-sm"
                      >
                        <Locate className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                        {localizando ? "Localizando..." : "Usar Minha Localização"}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal de Seletor de Procedimentos - MOBILE */}
      <SeletorProcedimentos
        open={mostrarSeletorProcedimentos}
        onClose={() => setMostrarSeletorProcedimentos(false)}
        onSelect={(procedimento) => {
          setProcedimentoFiltro(procedimento);
          setPaginaAtual(1);
          setMostrarSeletorProcedimentos(false);
        }}
        procedimentoAtual={procedimentoFiltro}
      />

      <LoginPromptModal
        open={mostrarLoginPrompt}
        onClose={() => setMostrarLoginPrompt(false)}
        pageName="anuncios"
      />
    </div>
  );
}