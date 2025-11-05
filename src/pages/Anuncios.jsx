
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
import { Label } from "@/components/ui/label"; // Added import for Label

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix para os ícones do Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ícone customizado para profissionais verificados (verde)
const verifiedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Ícone padrão (azul)
const defaultIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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
  { valor: "venda_produto", label: "🛍️ Venda de Produto" },
  { valor: "venda_aparelho", label: "⚙️ Venda de Aparelho" },
  { valor: "aluguel_produto", label: "📦 Aluguel de Produto" },
  { valor: "aluguel_aparelho", label: "🔧 Aluguel de Aparelho" },
  { valor: "troca_produto", label: "🔄 Troca de Produto" },
  { valor: "troca_aparelho", label: "♻️ Troca de Aparelho" }
];

const statusFuncionamento = [
  { valor: "Aberto Agora", label: "🟢 Aberto Agora" },
  { valor: "Fechado", label: "🔴 Fechado" },
  { valor: "Sempre Aberto", label: "🔵 Sempre Aberto (24h)" },
  { valor: "N/D", label: "⚪ Não Informado" }
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
  const [apenasVerificados, setApenasVerificados] = useState(false); // New state
  
  const [filtroDistancia, setFiltroDistancia] = useState("todas");
  const [filtroTempoFormacao, setFiltroTempoFormacao] = useState("todas");
  const [minhaLocalizacao, setMinhaLocalizacao] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("lista"); // "lista" ou "mapa"

  const [user, setUser] = useState(null);
  const [mostrarLoginPrompt, setMostrarLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
        // MOSTRAR MODAL APÓS 1 SEGUNDO
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
        
        const matchVerificados = !apenasVerificados || anuncio.verificado; // New filter

        // Filtro de distância
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

          // Logic for distance range filtering
          if (minStr === "0") { // For "Até 500m" (0-0.5)
            matchDistancia = distanciaKm <= max;
          } else { // For ranges like "1-2" etc.
            matchDistancia = distanciaKm >= min && distanciaKm <= max;
          }
        }
        
        // Filtro de tempo de formação
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
               matchDistancia && matchTempoFormacao;
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
      filtroDistancia, filtroTempoFormacao, minhaLocalizacao]);

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
    setPaginaAtual(1);

    // Remover parâmetros da URL
    const url = new URL(window.location);
    url.search = '';
    window.history.pushState({}, '', url);
  };

  // Verificar se há algum filtro ativo
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
    filtroTempoFormacao !== "todas";

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Encontre Profissionais de Estética
          </h1>
          <p className="text-gray-600">
            Explore os melhores profissionais de estética perto de você
          </p>
        </div>

        {/* Abas: Lista e Mapa */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setAbaAtiva("lista")}
            variant={abaAtiva === "lista" ? "default" : "outline"}
            className={abaAtiva === "lista" ? "bg-pink-600 hover:bg-pink-700" : ""}
          >
            <List className="w-4 h-4 mr-2" />
            Lista de Anúncios ({anuncios.length})
          </Button>
          <Button
            onClick={() => setAbaAtiva("mapa")}
            variant={abaAtiva === "mapa" ? "default" : "outline"}
            className={abaAtiva === "mapa" ? "bg-pink-600 hover:bg-pink-700" : ""}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Mapa da Estética ({anunciosComLocalizacao.length})
          </Button>
        </div>

        {abaAtiva === "lista" ? (
          <>
            {/* Filtros */}
            <Card className="p-6 mb-8 shadow-lg border-none">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Primeira linha de filtros */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="mb-2 block font-semibold">Buscar por nome ou palavra-chave</Label>
                      <Input
                        placeholder="Digite aqui..."
                        value={buscaTexto}
                        onChange={(e) => {
                          setBuscaTexto(e.target.value);
                          setPaginaAtual(1);
                        }}
                        className="w-full h-12"
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block font-semibold">Categoria</Label>
                      <Select
                        value={categoriaFiltro}
                        onValueChange={(value) => {
                          setCategoriaFiltro(value);
                          setPaginaAtual(1);
                        }}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block font-semibold">Procedimento</Label>
                      <Input
                        placeholder="Ex: Botox, Preenchimento..."
                        value={procedimentoFiltro}
                        onChange={(e) => {
                          setProcedimentoFiltro(e.target.value);
                          setPaginaAtual(1);
                        }}
                        className="h-12"
                      />
                    </div>
                  </div>

                  {/* Segunda linha de filtros */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label className="mb-2 block font-semibold">Cidade</Label>
                      <Input
                        placeholder="Digite a cidade"
                        value={cidadeFiltro}
                        onChange={(e) => {
                          setCidadeFiltro(e.target.value);
                          setPaginaAtual(1);
                        }}
                        className="h-12"
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block font-semibold">Estado</Label>
                      <Select
                        value={estadoFiltro}
                        onValueChange={(value) => {
                          setEstadoFiltro(value);
                          setPaginaAtual(1);
                        }}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Estado (UF)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={null}>Todos</SelectItem>
                          {estados.map((estado) => (
                            <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block font-semibold">Faixa de Preço</Label>
                      <Select
                        value={faixaPrecoFiltro}
                        onValueChange={(value) => {
                          setFaixaPrecoFiltro(value);
                          setPaginaAtual(1);
                        }}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Faixa de Preço" />
                        </SelectTrigger>
                        <SelectContent>
                          {faixasPreco.map((faixa) => (
                            <SelectItem key={faixa} value={faixa}>
                              {faixa === "Todas" ? "Todas as faixas" : getFaixaPrecoInfo(faixa) ? `${getFaixaPrecoInfo(faixa).emoji} ${faixa} - ${getFaixaPrecoInfo(faixa).texto}` : faixa}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block font-semibold">Verificação</Label>
                      <label className="flex items-center gap-2 mt-2 cursor-pointer h-12">
                        <input
                          type="checkbox"
                          checked={apenasVerificados}
                          onChange={(e) => {
                            setApenasVerificados(e.target.checked);
                            setPaginaAtual(1);
                          }}
                          className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-sm text-gray-700">Apenas verificados</span>
                      </label>
                    </div>
                  </div>

                  {/* Terceira linha - Novos filtros */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block font-semibold">Distância</Label>
                      <Select
                        value={filtroDistancia}
                        onValueChange={(value) => {
                          setFiltroDistancia(value);
                          setPaginaAtual(1);
                        }}
                        disabled={!minhaLocalizacao}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder={minhaLocalizacao ? "Selecione a distância" : "Use sua localização primeiro"} />
                        </SelectTrigger>
                        <SelectContent>
                          {faixasDistancia.map((faixa) => (
                            <SelectItem key={faixa.valor} value={faixa.valor}>
                              {faixa.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {!minhaLocalizacao && (
                        <p className="text-xs text-gray-500 mt-1">
                          Clique em "Usar Minha Localização" para ativar este filtro
                        </p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-2 block font-semibold">Tempo de Formação</Label>
                      <Select
                        value={filtroTempoFormacao}
                        onValueChange={(value) => {
                          setFiltroTempoFormacao(value);
                          setPaginaAtual(1);
                        }}
                      >
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Tempo de formação" />
                        </SelectTrigger>
                        <SelectContent>
                          {faixasTempoFormacao.map((faixa) => (
                            <SelectItem key={faixa.valor} value={faixa.valor}>
                              {faixa.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Botão Limpar Filtros */}
                  {temFiltrosAtivos && (
                    <div className="flex justify-end pt-2">
                      <Button
                        onClick={limparFiltros}
                        variant="outline"
                        className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Existing Localização e Ordenação - Retained for now, though structure changed */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
              <Button
                onClick={usarMinhaLocalizacao}
                disabled={localizando}
                variant="outline"
                className="w-full md:w-auto h-12"
              >
                <Locate className="w-4 h-4 mr-2" />
                {localizando ? "Localizando..." : "Usar Minha Localização"}
              </Button>
              
              <Select
                value={ordenacao}
                onValueChange={(value) => {
                  setOrdenacao(value);
                  setPaginaAtual(1);
                }}
              >
                <SelectTrigger className="w-full md:w-64 h-12">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mais_recentes">Mais Recentes</SelectItem>
                  <SelectItem value="mais_visualizados">Mais Visualizados</SelectItem>
                  <SelectItem value="mais_antigos">Mais Antigos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resultados e Modo de Visualização */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {anuncios.length} resultado{anuncios.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-pink-600 hover:bg-pink-700" : ""}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-pink-600 hover:bg-pink-700" : ""}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse bg-gray-100" />
                ))}
              </div>
            ) : anuncios.length === 0 ? (
              <Card className="p-12 text-center mt-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum anúncio encontrado
                </h3>
                <p className="text-gray-600">
                  Tente ajustar os filtros ou fazer uma nova busca
                </p>
              </Card>
            ) : (
              <>
                <div className={viewMode === "grid" 
                  ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8" 
                  : "space-y-4 mt-8"
                }>
                  {anunciosPaginados.map((anuncio) => (
                    <CardAnuncio key={anuncio.id} anuncio={anuncio} />
                  ))}
                </div>

                {totalPaginas > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => paginaAtual > 1 && handlePaginaChange(paginaAtual - 1)}
                            className={paginaAtual === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </PaginationItem>
                        
                        {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                          let pageNum;
                          if (totalPaginas <= 5) {
                            pageNum = i + 1;
                          } else if (paginaAtual <= 3) {
                            pageNum = i + 1;
                          } else if (paginaAtual >= totalPaginas - 2) {
                            pageNum = totalPaginas - 4 + i;
                          } else {
                            pageNum = paginaAtual - 2 + i;
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => handlePaginaChange(pageNum)}
                                isActive={paginaAtual === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => paginaAtual < totalPaginas && handlePaginaChange(paginaAtual + 1)}
                            className={paginaAtual === totalPaginas ? "pointer-events-none opacity-50" : "cursor-pointer"}
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
          /* MAPA DA ESTÉTICA - INTERATIVO */
          <div className="space-y-6">
            <Card className="p-6 shadow-lg border-none">
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        🗺️ Mapa da Estética Interativo
                      </h2>
                      <p className="text-gray-600">
                        Visualize {anunciosComLocalizacao.length} profissionais próximos a você
                      </p>
                    </div>
                    
                    {!minhaLocalizacao && (
                      <Button
                        onClick={usarMinhaLocalizacao}
                        disabled={localizando}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        <Locate className="w-4 h-4 mr-2" />
                        {localizando ? "Localizando..." : "Minha Localização"}
                      </Button>
                    )}
                  </div>

                  {minhaLocalizacao && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-800 font-semibold">
                        ✓ Sua localização: {cidadeFiltro} - {estadoFiltro}
                      </p>
                    </div>
                  )}
                </div>

                {anunciosComLocalizacao.length > 0 ? (
                  <div className="rounded-lg overflow-hidden border-2 border-gray-200" style={{ height: '600px' }}>
                    <MapContainer
                      center={
                        minhaLocalizacao 
                          ? [minhaLocalizacao.latitude, minhaLocalizacao.longitude]
                          : [anunciosComLocalizacao[0].latitude, anunciosComLocalizacao[0].longitude]
                      }
                      zoom={minhaLocalizacao ? 13 : 12}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      
                      {/* Marker da localização do usuário */}
                      {minhaLocalizacao && (
                        <Marker
                          position={[minhaLocalizacao.latitude, minhaLocalizacao.longitude]}
                          icon={new L.Icon({
                            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                            iconSize: [25, 41],
                            iconAnchor: [12, 41],
                            popupAnchor: [1, -34],
                            shadowSize: [41, 41]
                          })}
                        >
                          <Popup>
                            <div className="text-center">
                              <p className="font-bold text-red-600">📍 Você está aqui</p>
                              <p className="text-sm">{cidadeFiltro} - {estadoFiltro}</p>
                            </div>
                          </Popup>
                        </Marker>
                      )}

                      {/* Markers dos profissionais */}
                      {anunciosComLocalizacao.map((anuncio) => (
                        <Marker
                          key={anuncio.id}
                          position={[anuncio.latitude, anuncio.longitude]}
                          icon={anuncio.verificado ? verifiedIcon : defaultIcon}
                        >
                          <Popup maxWidth={300}>
                            <div className="space-y-2">
                              {anuncio.logo && (
                                <img
                                  src={anuncio.logo}
                                  alt={anuncio.profissional}
                                  className="w-full h-32 object-cover rounded-lg"
                                />
                              )}
                              <div>
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                  {anuncio.titulo}
                                  {anuncio.verificado && (
                                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                                      ✓ Verificado
                                    </Badge>
                                  )}
                                </h3>
                                <p className="text-sm text-gray-600 font-semibold">
                                  {anuncio.profissional}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {anuncio.categoria}
                                </p>
                                {anuncio.faixa_preco && (
                                  <p className="text-sm font-bold text-pink-600 mt-1">
                                    {anuncio.faixa_preco}
                                  </p>
                                )}
                              </div>
                              
                              {minhaLocalizacao && (
                                <p className="text-xs text-gray-500">
                                  📍 Distância: {calcularDistancia(
                                    minhaLocalizacao.latitude,
                                    minhaLocalizacao.longitude,
                                    anuncio.latitude,
                                    anuncio.longitude
                                  ).toFixed(2)} km
                                </p>
                              )}
                              
                              <Button
                                size="sm"
                                className="w-full bg-pink-600 hover:bg-pink-700 text-white"
                                onClick={() => {
                                  window.location.href = `/DetalhesAnuncio?id=${anuncio.id}`;
                                }}
                              >
                                Ver Detalhes
                              </Button>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Nenhum profissional com localização encontrado
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Ajuste os filtros para encontrar profissionais próximos a você
                    </p>
                    {!minhaLocalizacao && (
                      <Button
                        onClick={usarMinhaLocalizacao}
                        disabled={localizando}
                        className="bg-pink-600 hover:bg-pink-700"
                      >
                        <Locate className="w-4 h-4 mr-2" />
                        {localizando ? "Localizando..." : "Usar Minha Localização"}
                      </Button>
                    )}
                  </div>
                )}

                {/* Legenda */}
                {anunciosComLocalizacao.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                    <h4 className="font-semibold mb-2 text-sm">Legenda:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span>Sua localização</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Profissional Verificado ✓</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span>Profissional</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Modal de Seletor de Procedimentos (Still relevant if we keep the simple input and want a picker) */}
      <SeletorProcedimentos
        open={mostrarSeletorProcedimentos}
        onClose={() => setMostrarSeletorProcedimentos(false)}
        onSelect={(procedimento) => {
          setProcedimentoFiltro(procedimento);
          setPaginaAtual(1);
        }}
        procedimentoAtual={procedimentoFiltro}
      />

      {/* Modal de Login Prompt */}
      <LoginPromptModal
        open={mostrarLoginPrompt}
        onClose={() => setMostrarLoginPrompt(false)}
        pageName="anuncios"
      />
    </div>
  );
}
