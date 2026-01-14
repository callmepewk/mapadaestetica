import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Clock,
  Star,
  Search,
  Loader2,
  ExternalLink,
  Crown,
  Eye,
  Heart,
  Sparkles,
  Filter,
  CheckCircle,
  Home,
  DollarSign,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardAnuncio from "../components/anuncios/CardAnuncio";
import { Checkbox } from "@/components/ui/checkbox";
import SeletorProcedimentos from "../components/anuncios/SeletorProcedimentos";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Constantes
const categorias = [
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
  "Longevidade e Medicina Integrativa"
];

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const faixasPreco = ["$", "$$", "$$$", "$$$$", "$$$$$"];

const tiposAnuncio = [
  { valor: "servico", label: "Serviço" },
  { valor: "procedimento", label: "Procedimento" },
  { valor: "tecnica", label: "Técnica" },
  { valor: "consultorio", label: "Consultório" },
  { valor: "clinica", label: "Clínica" },
  { valor: "promocao", label: "Promoção" },
  { valor: "venda_produto", label: "Venda - Produto" },
  { valor: "venda_aparelho", label: "Venda - Aparelho" },
  { valor: "aluguel_produto", label: "Aluguel - Produto" },
  { valor: "aluguel_aparelho", label: "Aluguel - Aparelho" },
  { valor: "troca_produto", label: "Troca - Produto" },
  { valor: "troca_aparelho", label: "Troca - Aparelho" },
  { valor: "venda_moveis", label: "Venda - Móveis" },
  { valor: "troca_moveis", label: "Troca - Móveis" },
  { valor: "evento", label: "Evento" },
  { valor: "ia", label: "IA" },
  { valor: "servicos", label: "Serviços" },
  { valor: "servicos_ia", label: "Serviços de IA" },
  { valor: "midia_marketing", label: "Mídia e Marketing" }
];

const statusFuncionamento = [
  "Aberto Agora",
  "Fechado",
  "Sempre Aberto",
  "N/D"
];

const tiposEstabelecimento = [
  { valor: "Consultório", label: "Consultório", estrelas: 1 },
  { valor: "Clínica", label: "Clínica", estrelas: 2 },
  { valor: "Centro Clínico", label: "Centro Clínico", estrelas: 3 },
  { valor: "Centro de Especialidade", label: "Centro de Especialidade", estrelas: 4 },
  { valor: "Clínica de Luxo", label: "Clínica de Luxo", estrelas: 5 }
];

const faixasDistancia = [
  { valor: "5", label: "Até 5 km" },
  { valor: "10", label: "Até 10 km" },
  { valor: "20", label: "Até 20 km" },
  { valor: "50", label: "Até 50 km" },
  { valor: "999999", label: "Qualquer distância" }
];

const temposFormacao = [
  { valor: "1", label: "Até 1 ano" },
  { valor: "3", label: "Até 3 anos" },
  { valor: "5", label: "Até 5 anos" },
  { valor: "10", label: "Até 10 anos" },
  { valor: "999999", label: "Qualquer tempo" }
];

// Custom marker icons
const criarIconeUsuario = () => {
  return L.divIcon({
    html: `<div style="background: #3B82F6; border: 3px solid white; width: 20px; height: 20px; border-radius: 50%; box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);"></div>`,
    className: 'custom-marker',
    iconSize: [20, 20],
  });
};

const criarIconeEstabelecimento = (categoria) => {
  const icons = {
    "Salão de Beleza": "💇",
    "Clínica de Estética": "💆",
    "Spa": "🌿",
    "Barbearia": "✂️",
    "Centro de Estética": "✨",
    "Consultório": "🏥",
    "Personal Trainer": "🏋️",
    "Outros": "📍"
  };
  
  const emoji = icons[categoria] || "📍";
  
  return L.divIcon({
    html: `<div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

// Componente para centralizar mapa
function CentralizarMapa({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

// Função para calcular distância
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function Mapa() {
  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [centralizarEm, setCentralizarEm] = useState(null);
  const [abaSelecionada, setAbaSelecionada] = useState("mapa");
  const [mostrarSeletorProcedimentos, setMostrarSeletorProcedimentos] = useState(false);
  
  // Filtros para Anúncios
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [faixaPreco, setFaixaPreco] = useState("");
  const [verificados, setVerificados] = useState(false);
  const [tipoAnuncio, setTipoAnuncio] = useState("");
  const [tipoEstabelecimento, setTipoEstabelecimento] = useState("");
  const [distancia, setDistancia] = useState("999999");
  const [tempoFormacao, setTempoFormacao] = useState("999999");

  // Filtros para Mapa (Estabelecimentos)
  const [buscaCidade, setBuscaCidade] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("");

  // Query estabelecimentos
  const { data: estabelecimentos = [], isLoading: isLoadingEstabelecimentos } = useQuery({
    queryKey: ['estabelecimentos-parceiros'],
    queryFn: async () => {
      return await base44.entities.EstabelecimentoParceiro.list('-created_date', 500);
    },
  });

  // Query anúncios
  const { data: anuncios = [], isLoading: isLoadingAnuncios } = useQuery({
    queryKey: ['anuncios-mapa'],
    queryFn: async () => {
      return await base44.entities.Anuncio.filter(
        { status: 'ativo' },
        '-created_date',
        500
      );
    },
  });

  useEffect(() => {
    if (navigator.geolocation) {
      setBuscandoLocalizacao(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalizacaoUsuario({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setBuscandoLocalizacao(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          setBuscandoLocalizacao(false);
          setLocalizacaoUsuario({ lat: -15.7801, lng: -47.9292 });
        }
      );
    } else {
      setLocalizacaoUsuario({ lat: -15.7801, lng: -47.9292 });
    }
  }, []);

  const handleUsarMinhaLocalizacao = () => {
    if (navigator.geolocation) {
      setBuscandoLocalizacao(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const novaLocalizacao = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocalizacaoUsuario(novaLocalizacao);
          setCentralizarEm(novaLocalizacao);
          setBuscandoLocalizacao(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          alert("Não foi possível obter sua localização. Verifique as permissões do navegador.");
          setBuscandoLocalizacao(false);
        }
      );
    }
  };

  // Filtrar estabelecimentos
  const estabelecimentosFiltrados = estabelecimentos.filter(est => {
    const matchCidade = !buscaCidade || 
      est.cidade?.toLowerCase().includes(buscaCidade.toLowerCase()) ||
      est.estado?.toLowerCase().includes(buscaCidade.toLowerCase());
    const matchCategoria = !filtroCategoria || est.categoria === filtroCategoria;
    const matchPlano = !filtroPlano || est.plano_desconto === filtroPlano;
    
    return matchCidade && matchCategoria && matchPlano;
  });

  // Filtrar anúncios
  const anunciosFiltrados = anuncios.filter(anuncio => {
    const matchBusca = !busca || 
      anuncio.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
      anuncio.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      anuncio.profissional?.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = !categoria || anuncio.categoria === categoria;
    const matchProcedimento = !procedimento || 
      anuncio.procedimentos_servicos?.some(p => p.toLowerCase().includes(procedimento.toLowerCase()));
    const matchCidade = !cidade || anuncio.cidade?.toLowerCase().includes(cidade.toLowerCase());
    const matchEstado = !estado || anuncio.estado === estado;
    const matchPreco = !faixaPreco || anuncio.faixa_preco === faixaPreco;
    const matchVerificados = !verificados || anuncio.profissional_verificado === true;
    const matchTipoAnuncio = !tipoAnuncio || anuncio.tipo_anuncio === tipoAnuncio;
    const matchTipoEstabelecimento = !tipoEstabelecimento || anuncio.tipo_estabelecimento === tipoEstabelecimento;
    const matchTempoFormacao = !tempoFormacao || tempoFormacao === "999999" || 
      (anuncio.tempo_formacao_anos && anuncio.tempo_formacao_anos <= parseInt(tempoFormacao));
    
    // Filtro de distância
    let matchDistancia = true;
    if (distancia !== "999999" && localizacaoUsuario && anuncio.latitude && anuncio.longitude) {
      const dist = calcularDistancia(
        localizacaoUsuario.lat,
        localizacaoUsuario.lng,
        anuncio.latitude,
        anuncio.longitude
      );
      matchDistancia = dist <= parseInt(distancia);
    }
    
    return matchBusca && matchCategoria && matchProcedimento && matchCidade && matchEstado && 
           matchPreco && matchVerificados && matchTipoAnuncio && matchTipoEstabelecimento && 
           matchTempoFormacao && matchDistancia;
  });

  // Calcular distâncias para estabelecimentos
  const estabelecimentosComDistancia = estabelecimentosFiltrados.map(est => {
    let distancia = null;
    if (localizacaoUsuario && est.latitude && est.longitude) {
      distancia = calcularDistancia(
        localizacaoUsuario.lat,
        localizacaoUsuario.lng,
        est.latitude,
        est.longitude
      );
    }
    return { ...est, distancia };
  });

  const estabelecimentosOrdenados = [...estabelecimentosComDistancia].sort((a, b) => {
    if (a.distancia === null) return 1;
    if (b.distancia === null) return -1;
    return a.distancia - b.distancia;
  });

  const handleCentralizarEstabelecimento = (est) => {
    if (est.latitude && est.longitude) {
      setCentralizarEm({ lat: est.latitude, lng: est.longitude });
    }
  };

  const handleComoChegar = (est) => {
    if (!localizacaoUsuario || !est.latitude || !est.longitude) {
      alert("Localização não disponível");
      return;
    }
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${localizacaoUsuario.lat},${localizacaoUsuario.lng}&destination=${est.latitude},${est.longitude}`;
    window.open(url, '_blank');
  };

  const getDescontoInfo = (plano) => {
    const descontos = {
      light: { badge: "LIGHT", desconto: "10%", cor: "bg-blue-100 text-blue-800" },
      gold: { badge: "GOLD", desconto: "15%", cor: "bg-yellow-100 text-yellow-800" },
      vip: { badge: "VIP", desconto: "25%", cor: "bg-purple-100 text-purple-800" }
    };
    return descontos[plano] || null;
  };

  const limparFiltros = () => {
    setBusca("");
    setCategoria("");
    setProcedimento("");
    setCidade("");
    setEstado("");
    setFaixaPreco("");
    setVerificados(false);
    setTipoAnuncio("");
    setTipoEstabelecimento("");
    setDistancia("999999");
    setTempoFormacao("999999");
  };

  if (!localizacaoUsuario) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-[#F7D426] mb-4" />
          <p className="text-gray-600">Carregando mapa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-2">
            🗺️ Mapa da Estética
          </h1>
          <p className="text-[#2C2C2C]/80">
            Encontre os melhores profissionais e estabelecimentos perto de você
          </p>
        </div>
      </div>

      {/* Tabs: Anúncios e Mapa da Estética */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            {/* data-state active styling */}
            <TabsTrigger value="anuncios" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Anúncios ({anunciosFiltrados.length})
            </TabsTrigger>
            <TabsTrigger value="mapa" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Mapa da Estética ({estabelecimentosFiltrados.length})
            </TabsTrigger>
          </TabsList>

          {/* ABA: ANÚNCIOS */}
          <TabsContent value="anuncios">
            {/* Filtros Avançados */}
            <Card className="mb-6 border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Filter className="w-5 h-5 text-pink-600" />
                    Filtros de Busca
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={limparFiltros}
                    className="text-xs"
                  >
                    Limpar Filtros
                  </Button>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Busca Geral */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Digite aqui..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  {/* Categoria */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <Select value={categoria} onValueChange={setCategoria}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value={null}>Todas</SelectItem>
                        {categorias.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Procedimento */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Procedimento</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: Botox..."
                        value={procedimento}
                        onChange={(e) => setProcedimento(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => setMostrarSeletorProcedimentos(true)}
                        variant="outline"
                        className="px-3 flex-shrink-0"
                        title="Selecionar da lista"
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Cidade */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cidade</label>
                    <Input
                      placeholder="Digite a cidade"
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                    />
                  </div>

                  {/* Estado */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Estado</label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger>
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos</SelectItem>
                        {estados.map((uf) => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Preço */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preço</label>
                    <Select value={faixaPreco} onValueChange={setFaixaPreco}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todas</SelectItem>
                        {faixasPreco.map((preco) => (
                          <SelectItem key={preco} value={preco}>{preco}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tipo de Anúncio */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Anúncio</label>
                    <Select value={tipoAnuncio} onValueChange={setTipoAnuncio}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value={null}>Todos</SelectItem>
                        {tiposAnuncio.map((tipo) => (
                          <SelectItem key={tipo.valor} value={tipo.valor}>{tipo.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tipo Estabelecimento */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo Estabelecimento</label>
                    <Select value={tipoEstabelecimento} onValueChange={setTipoEstabelecimento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={null}>Todos os tipos</SelectItem>
                        {tiposEstabelecimento.map((tipo) => (
                          <SelectItem key={tipo.valor} value={tipo.valor}>
                            {tipo.label} ({tipo.estrelas} ⭐)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Distância */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Distância</label>
                    <Select value={distancia} onValueChange={setDistancia}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualquer distância" />
                      </SelectTrigger>
                      <SelectContent>
                        {faixasDistancia.map((faixa) => (
                          <SelectItem key={faixa.valor} value={faixa.valor}>{faixa.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Use GPS primeiro</p>
                  </div>

                  {/* Tempo Formação */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tempo Formação</label>
                    <Select value={tempoFormacao} onValueChange={setTempoFormacao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualquer tempo" />
                      </SelectTrigger>
                      <SelectContent>
                        {temposFormacao.map((tempo) => (
                          <SelectItem key={tempo.valor} value={tempo.valor}>{tempo.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Verificados */}
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="verificados"
                      checked={verificados}
                      onCheckedChange={setVerificados}
                    />
                    <label
                      htmlFor="verificados"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1 text-blue-600" />
                      Apenas Verificados
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Anúncios */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Button
                    onClick={handleUsarMinhaLocalizacao}
                    disabled={buscandoLocalizacao}
                    variant="outline"
                    className="border-2 border-[#F7D426]"
                  >
                    {buscandoLocalizacao ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4 mr-2" />
                        Minha Localização
                      </>
                    )}
                  </Button>
                  
                  <Select value="recentes" onValueChange={() => {}}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Mais Recentes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recentes">Mais Recentes</SelectItem>
                      <SelectItem value="relevancia">Relevância</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoadingAnuncios ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#F7D426]" />
                </div>
              ) : anunciosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum anúncio encontrado para os filtros selecionados</p>
                  <p className="text-sm text-gray-500 mt-2">Tente ajustar os filtros ou limpar a busca</p>
                  <Button onClick={limparFiltros} className="mt-4 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C]">
                    Limpar Filtros
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {anunciosFiltrados.map((anuncio) => (
                    <CardAnuncio key={anuncio.id} anuncio={anuncio} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ABA: MAPA DA ESTÉTICA (Estabelecimentos) */}
          <TabsContent value="mapa">
            {/* Filtros do Mapa */}
            <div className="bg-white border rounded-lg shadow-sm mb-6 p-4">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Cidade ou Estado"
                    value={buscaCidade}
                    onChange={(e) => setBuscaCidade(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todas</SelectItem>
                    <SelectItem value="Salão de Beleza">💇 Salão de Beleza</SelectItem>
                    <SelectItem value="Clínica de Estética">💆 Clínica de Estética</SelectItem>
                    <SelectItem value="Spa">🌿 Spa</SelectItem>
                    <SelectItem value="Barbearia">✂️ Barbearia</SelectItem>
                    <SelectItem value="Centro de Estética">✨ Centro de Estética</SelectItem>
                    <SelectItem value="Consultório">🏥 Consultório</SelectItem>
                    <SelectItem value="Personal Trainer">🏋️ Personal Trainer</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filtroPlano} onValueChange={setFiltroPlano}>
                  <SelectTrigger>
                    <SelectValue placeholder="Plano Clube" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos</SelectItem>
                    <SelectItem value="light">💙 LIGHT (10%)</SelectItem>
                    <SelectItem value="gold">💛 GOLD (15%)</SelectItem>
                    <SelectItem value="vip">💜 VIP (25%)</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleUsarMinhaLocalizacao}
                  disabled={buscandoLocalizacao}
                  className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
                >
                  {buscandoLocalizacao ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 mr-2" />
                      Minha Localização
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-0 h-[calc(100vh-450px)] min-h-[600px]">
              {/* Lista Lateral */}
              <div className="lg:col-span-1 bg-white border-r overflow-y-auto p-4">
                <div className="mb-4">
                  <h2 className="font-bold text-lg text-gray-900 mb-2">
                    📍 {estabelecimentosOrdenados.length} estabelecimentos do Mapa da Estética
                  </h2>
                  {localizacaoUsuario && (
                    <p className="text-sm text-gray-600">
                      Mostrando por proximidade
                    </p>
                  )}
                </div>

                {isLoadingEstabelecimentos ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#F7D426]" />
                  </div>
                ) : estabelecimentosOrdenados.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Nenhum estabelecimento encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {estabelecimentosOrdenados.map((est) => {
                      const descontoInfo = getDescontoInfo(est.plano_desconto);
                      
                      return (
                        <Card
                          key={est.id}
                          className="cursor-pointer hover:shadow-lg transition-all border-2 border-gray-200 hover:border-[#F7D426]"
                          onClick={() => handleCentralizarEstabelecimento(est)}
                        >
                          <CardContent className="p-4">
                            {est.foto && (
                              <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                                <img
                                  src={est.foto}
                                  alt={est.nome}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}

                            <div className="mb-3">
                              <h3 className="font-bold text-lg text-gray-900 mb-1">{est.nome}</h3>
                              <Badge variant="outline" className="text-xs">
                                {est.categoria}
                              </Badge>
                            </div>

                            <div className="flex items-start gap-2 mb-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>{est.endereco}, {est.cidade} - {est.estado}</span>
                            </div>

                            {est.distancia !== null && (
                              <div className="flex items-center gap-2 mb-3 text-sm">
                                <Navigation className="w-4 h-4 text-[#F7D426]" />
                                <span className="font-bold text-[#F7D426]">
                                  {est.distancia.toFixed(1)} km de você
                                </span>
                              </div>
                            )}

                            {descontoInfo && (
                              <div className="mb-3">
                                <Badge className={`${descontoInfo.cor} font-bold`}>
                                  <Crown className="w-3 h-3 mr-1" />
                                  {descontoInfo.badge} - {descontoInfo.desconto} OFF
                                </Badge>
                              </div>
                            )}

                            {est.horario_funcionamento && (
                              <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>{est.horario_funcionamento}</span>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleComoChegar(est);
                                }}
                                className="flex-1 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C]"
                                disabled={!localizacaoUsuario}
                              >
                                <Navigation className="w-3 h-3 mr-1" />
                                Como Chegar
                              </Button>

                              {est.whatsapp && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`https://wa.me/${est.whatsapp.replace(/\D/g, '')}`, '_blank');
                                  }}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <MessageCircle className="w-3 h-3 mr-1" />
                                  WhatsApp
                                </Button>
                              )}

                              {est.telefone && !est.whatsapp && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(`tel:${est.telefone}`, '_blank');
                                  }}
                                  variant="outline"
                                  className="flex-1"
                                >
                                  <Phone className="w-3 h-3 mr-1" />
                                  Ligar
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Mapa */}
              <div className="lg:col-span-2 relative">
                <MapContainer
                  center={localizacaoUsuario ? [localizacaoUsuario.lat, localizacaoUsuario.lng] : [-15.7801, -47.9292]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  className="z-0"
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />

                  {localizacaoUsuario && (
                    <Marker
                      position={[localizacaoUsuario.lat, localizacaoUsuario.lng]}
                      icon={criarIconeUsuario()}
                    >
                      <Popup>
                        <div className="text-center p-2">
                          <p className="font-bold text-blue-600">📍 Você está aqui</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {estabelecimentosOrdenados.map((est) => {
                    if (!est.latitude || !est.longitude) return null;
                    
                    const descontoInfo = getDescontoInfo(est.plano_desconto);
                    
                    return (
                      <Marker
                        key={est.id}
                        position={[est.latitude, est.longitude]}
                        icon={criarIconeEstabelecimento(est.categoria)}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-gray-900 mb-2">{est.nome}</h3>
                            
                            {descontoInfo && (
                              <Badge className={`${descontoInfo.cor} mb-2`}>
                                <Crown className="w-3 h-3 mr-1" />
                                {descontoInfo.badge} - {descontoInfo.desconto} OFF
                              </Badge>
                            )}
                            
                            <p className="text-sm text-gray-600 mb-2">
                              {est.endereco}, {est.cidade}
                            </p>
                            
                            {est.distancia !== null && (
                              <p className="text-sm font-bold text-[#F7D426] mb-2">
                                📍 {est.distancia.toFixed(1)} km de você
                              </p>
                            )}
                            
                            {est.telefone && (
                              <p className="text-sm text-gray-600 mb-2">
                                📞 {est.telefone}
                              </p>
                            )}
                            
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                onClick={() => handleComoChegar(est)}
                                className="flex-1 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C]"
                              >
                                Como Chegar
                              </Button>
                              {est.whatsapp && (
                                <Button
                                  size="sm"
                                  onClick={() => window.open(`https://wa.me/${est.whatsapp.replace(/\D/g, '')}`, '_blank')}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  WhatsApp
                                </Button>
                              )}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}

                  {centralizarEm && <CentralizarMapa center={centralizarEm} />}
                </MapContainer>

                {/* Badge de Info no Mapa */}
                <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 border-2 border-[#F7D426]">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-5 h-5 text-[#F7D426]" />
                    <span className="font-bold text-gray-900">Legenda:</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                      <span>Você</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💇</span>
                      <span>Salão de Beleza</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">💆</span>
                      <span>Clínica de Estética</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🌿</span>
                      <span>Spa</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Info sobre Clube da Beleza */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            👑 Benefícios Exclusivos do Clube da Beleza
          </h3>
          <p className="text-gray-700 mb-4">
            Membros do clube têm descontos especiais em todos os estabelecimentos parceiros!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-base">
              💙 LIGHT - 10% OFF
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-800 px-4 py-2 text-base">
              💛 GOLD - 15% OFF
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 px-4 py-2 text-base">
              💜 VIP - 25% OFF
            </Badge>
          </div>
        </div>
      </div>

      {/* Modal Seletor de Procedimentos */}
      <SeletorProcedimentos
        open={mostrarSeletorProcedimentos}
        onClose={() => setMostrarSeletorProcedimentos(false)}
        onSelect={(procedimentoSelecionado) => {
          setProcedimento(procedimentoSelecionado);
          setMostrarSeletorProcedimentos(false);
        }}
        procedimentoAtual={procedimento}
      />
    </div>
  );
}