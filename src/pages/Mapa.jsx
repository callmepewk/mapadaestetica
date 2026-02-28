import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
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
import AgendamentoRapidoModal from "../components/agendamentos/AgendamentoRapidoModal";

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

const criarIconeAnuncio = (verificado, patrocinado) => {
  const base = verificado ? '#10B981' : '#9CA3AF';
  const ring = patrocinado ? 'box-shadow: 0 0 0 4px rgba(247, 212, 38, 0.5), 0 0 10px rgba(0,0,0,0.2);' : 'box-shadow:0 0 10px rgba(0,0,0,0.2)';
  return L.divIcon({
    html: `<div style="background:${base}; width:14px; height:14px; border-radius:50%; border:2px solid white; ${ring}"></div>`,
    className: 'custom-marker',
    iconSize: [14, 14]
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
  const [isProfissional, setIsProfissional] = useState(false);
  const [mostrarSeletorProcedimentos, setMostrarSeletorProcedimentos] = useState(false);
  const [agendarOpen, setAgendarOpen] = useState(false);
  const [itemAgendar, setItemAgendar] = useState(null);
  const [mostrarAnunciosNoMapa, setMostrarAnunciosNoMapa] = useState(true);
  
  // Filtros para Anúncios
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [estado, setEstado] = useState("");
  const [faixaPreco, setFaixaPreco] = useState("");
  const [verificados, setVerificados] = useState(false);
  const [tipoAnuncio, setTipoAnuncio] = useState("");
  const [tipoEstabelecimento, setTipoEstabelecimento] = useState("");
  const [distancia, setDistancia] = useState("999999");
  const [tempoFormacao, setTempoFormacao] = useState("999999");
  // Novos filtros avançados
  const [profissao, setProfissao] = useState("");
  const [nivelVerificacao, setNivelVerificacao] = useState(""); // 0-3 docs
  const [avaliacaoMin, setAvaliacaoMin] = useState(""); // 1-5 estrelas estabelecimento
  const [modalidade, setModalidade] = useState(""); // online|presencial
  const [atendimento, setAtendimento] = useState(""); // domicilio|clinica|ambulatorial|hospitalar|homecare|corporativo|teleatendimento
  const [atendimentoCobranca, setAtendimentoCobranca] = useState(""); // convenio|particular
  const [patrocinadoOnly, setPatrocinadoOnly] = useState(false);
  const [ordenarPor, setOrdenarPor] = useState('recentes');

  // Filtros para Mapa (Estabelecimentos)
  const [buscaCidade, setBuscaCidade] = useState("");
  const [bairroMapa, setBairroMapa] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("");
  const [estadoMapa, setEstadoMapa] = useState("");
  const [distanciaMapa, setDistanciaMapa] = useState("999999");

  // Query estabelecimentos
  const { data: estabelecimentos = [], isLoading: isLoadingEstabelecimentos } = useQuery({
    queryKey: ['estabelecimentos-parceiros'],
    queryFn: async () => {
      return await base44.entities.EstabelecimentoParceiro.list('-created_date', 500);
    },
  });

  // Query eventos
  const { data: eventosAll = [], isLoading: isLoadingEventos } = useQuery({
    queryKey: ['eventos-ativos'],
    queryFn: async () => await base44.entities.Evento.filter({ status: 'ativo' }, '-data_hora', 200),
  });

  // Eventos visíveis por público e futuros
  const agoraISO = new Date().toISOString();
  const eventosVisiveis = (eventosAll || []).filter(ev => {
    const publicoOk = !ev.publico_alvo || ev.publico_alvo === 'todos' || (isProfissional ? ev.publico_alvo === 'profissionais' : ev.publico_alvo === 'pacientes');
    const futuro = ev.data_hora && ev.data_hora >= agoraISO;
    return publicoOk && futuro;
  });

  // Ícone de evento
  const criarIconeEvento = () => L.divIcon({
    html: `<div style="font-size:22px;">🎟️</div>`,
    className: 'custom-marker',
    iconSize: [24,24],
    iconAnchor: [12,24]
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

  useEffect(()=>{
    (async ()=>{
      try {
        const u = await base44.auth.me();
        setIsProfissional(u?.tipo_usuario === 'profissional' || u?.tipo_usuario === 'patrocinador');
      } catch {}
      const p = new URLSearchParams(window.location.search);
      const cat = p.get('categoria');
      const catFiltro = p.get('categoria_filtro');
      const cid = p.get('cidade');
      const aba = p.get('aba');
      const distKm = p.get('distancia_km');
      const tipo = p.get('tipo');
      const pmin = p.get('preco_min');
      const pmax = p.get('preco_max');

      if (cat) setCategoria(cat);
      if (catFiltro) setCategoria(catFiltro);
      if (cid) {
        setCidade(cid);
        setBuscaCidade(cid);
      }
      if (aba) setAbaSelecionada(aba);
      if (distKm) setDistancia(distKm);
      if (tipo) setTipoAnuncio(tipo);
      if (pmin || pmax) {
        const min = Number(pmin||0), max = Number(pmax||999999);
        let faixa = "";
        if (max <= 500) faixa = "$";
        else if (max <= 1000) faixa = "$$";
        else if (max <= 2000) faixa = "$$$";
        else if (max <= 5000) faixa = "$$$$";
        else faixa = "$$$$$";
        setFaixaPreco(faixa);
      }
    })();
  },[]);

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
    const matchBairroMapa = !bairroMapa || (est.bairro && est.bairro.toLowerCase().includes(bairroMapa.toLowerCase())) || (est.endereco && est.endereco.toLowerCase().includes(bairroMapa.toLowerCase()));
    const matchCategoria = !filtroCategoria || est.categoria === filtroCategoria;
    const matchPlano = !filtroPlano || est.plano_desconto === filtroPlano;
    const matchEstado = !estadoMapa || (est.estado && est.estado.toUpperCase() === estadoMapa.toUpperCase());
    
    return matchCidade && matchBairroMapa && matchCategoria && matchPlano && matchEstado;
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
    const matchBairro = !bairro || (anuncio.bairro && anuncio.bairro.toLowerCase().includes(bairro.toLowerCase()));
    const matchEstado = !estado || anuncio.estado === estado;
    const matchPreco = !faixaPreco || anuncio.faixa_preco === faixaPreco;
    const matchVerificados = !verificados || anuncio.profissional_verificado === true;
    const matchTipoAnuncio = !tipoAnuncio || anuncio.tipo_anuncio === tipoAnuncio;
    const matchTipoEstabelecimento = !tipoEstabelecimento || anuncio.tipo_estabelecimento === tipoEstabelecimento;
    const matchTempoFormacao = !tempoFormacao || tempoFormacao === "999999" || 
      (anuncio.tempo_formacao_anos && anuncio.tempo_formacao_anos <= parseInt(tempoFormacao));

    // Profissão (heurística via tags)
    const tagsLower = (anuncio.tags || []).map(t => (t || '').toLowerCase());
    const matchProfissao = !profissao || tagsLower.includes(profissao.toLowerCase());

    // Nível de verificação (0-3 docs verificados)
    const va = anuncio.verificacao_autoridade || {};
    const docsOk = [va.licenca_sanitaria?.verificado, va.alvara_funcionamento?.verificado, va.registro_profissional?.verificado]
      .filter(Boolean).length;
    const matchNivelVer = !nivelVerificacao || docsOk >= parseInt(nivelVerificacao);

    // Avaliação mínima (usa estrelas_estabelecimento quando presente)
    const matchAvaliacao = !avaliacaoMin || (anuncio.estrelas_estabelecimento && anuncio.estrelas_estabelecimento >= parseInt(avaliacaoMin));

    // Modalidade (heurística via tags)
    const matchModalidade = !modalidade || tagsLower.includes(modalidade);

    // Atendimento (domicílio/clínica) - via tags ou tipo_estabelecimento
    const matchAtendimento = !atendimento || (
      (atendimento === 'domicilio' && (tagsLower.includes('domicilio') || tagsLower.includes('home care'))) ||
      (atendimento === 'clinica' && ((anuncio.tipo_estabelecimento && anuncio.tipo_estabelecimento.toLowerCase().includes('clínica')) || tagsLower.includes('clinica'))) ||
      (atendimento === 'ambulatorial' && tagsLower.includes('ambulatorial')) ||
      (atendimento === 'hospitalar' && tagsLower.includes('hospitalar')) ||
      (atendimento === 'homecare' && (tagsLower.includes('homecare') || tagsLower.includes('home care'))) ||
      (atendimento === 'corporativo' && (tagsLower.includes('in company') || tagsLower.includes('corporativo'))) ||
      (atendimento === 'teleatendimento' && (tagsLower.includes('telemedicina') || tagsLower.includes('teleatendimento') || tagsLower.includes('online')))
    );

    // Cobrança (convênio/particular) - via tags ou forma_cobranca
    const matchCobranca = !atendimentoCobranca || (
      atendimentoCobranca === 'convenio' ? (tagsLower.includes('convênio') || tagsLower.includes('convenio')) :
      (anuncio.forma_cobranca === 'dinheiro' || tagsLower.includes('particular'))
    );

    // Patrocinado
    const isSponsored = !!anuncio.em_destaque || !!anuncio.impulsionado || ['ouro','diamante','platina'].includes(anuncio.plano);
    const matchPatrocinado = !patrocinadoOnly || isSponsored;
    
    // Público-alvo
    const matchPublico = !anuncio.exibir_para || anuncio.exibir_para === 'todos' || (isProfissional ? anuncio.exibir_para !== 'visitantes' : anuncio.exibir_para !== 'profissionais');

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
    
    return matchBusca && matchCategoria && matchProcedimento && matchCidade && matchBairro && matchEstado && 
           matchPreco && matchVerificados && matchTipoAnuncio && matchTipoEstabelecimento && 
           matchTempoFormacao && matchProfissao && matchNivelVer && matchAvaliacao && matchModalidade &&
           matchAtendimento && matchCobranca && matchPatrocinado && matchDistancia && matchPublico;
  });

  const anunciosOrdenados = useMemo(() => {
    const arr = [...anunciosFiltrados];
    if (ordenarPor === 'patrocinados') {
      return arr.sort((a, b) => {
        const aSponsored = (a.em_destaque || a.impulsionado || ['ouro','diamante','platina'].includes(a.plano)) ? 1 : 0;
        const bSponsored = (b.em_destaque || b.impulsionado || ['ouro','diamante','platina'].includes(b.plano)) ? 1 : 0;
        if (bSponsored !== aSponsored) return bSponsored - aSponsored;
        return new Date(b.created_date) - new Date(a.created_date);
      });
    }
    if (ordenarPor === 'relevancia') {
      return arr.sort((a, b) => (b.visualizacoes || 0) - (a.visualizacoes || 0));
    }
    return arr.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [anunciosFiltrados, ordenarPor]);

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

  const estabelecimentosFiltradosComDist = estabelecimentosComDistancia.filter(est => {
    if (distanciaMapa === '999999' || est.distancia === null) return true;
    return est.distancia <= parseInt(distanciaMapa);
  });
  const estabelecimentosOrdenados = [...estabelecimentosFiltradosComDist].sort((a, b) => {
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
              Mapa da Estética ({estabelecimentosFiltradosComDist.length})
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

                <div className="grid md:grid-cols-4 gap-4">
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

                      <div className="flex items-center gap-2">
                        <Checkbox id="toggleAnunciosMapa" checked={mostrarAnunciosNoMapa} onCheckedChange={setMostrarAnunciosNoMapa} />
                        <label htmlFor="toggleAnunciosMapa" className="text-sm">Exibir anúncios no mapa</label>
                      </div>
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

                  {/* Bairro */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Bairro</label>
                    <Input
                      placeholder="Digite o bairro"
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
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
                        {faixasPreco.map((preco) => (
                          <SelectItem key={preco} value={preco}>{preco}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Legenda: $ até R$ 500 • $$ R$ 500–1.000 • $$$ R$ 1.000–2.000 • $$$$ R$ 2.000–5.000 • $$$$$ acima de R$ 5.000</p>
                  </div>

                  {/* Tipo de Anúncio */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Anúncio</label>
                    <Select value={tipoAnuncio} onValueChange={setTipoAnuncio}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
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
                        {tiposEstabelecimento.map((tipo) => (
                          <SelectItem key={tipo.valor} value={tipo.valor}>
                            {tipo.label} ({tipo.estrelas} ⭐)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Profissão */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Profissão</label>
                    <Select value={profissao} onValueChange={setProfissao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {['médico','dentista','biomédico','esteticista','enfermeiro','farmacêutico','fisioterapeuta'].map((p)=>(
                          <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase()+p.slice(1)}</SelectItem>
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
                      <SelectContent className="max-h-64 overflow-y-auto z-[2001]">
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

                  {/* Nível de Verificação */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nível de Verificação</label>
                    <Select value={nivelVerificacao} onValueChange={setNivelVerificacao}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualquer nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {[0,1,2,3].map((n)=>(
                          <SelectItem key={n} value={String(n)}>{n} de 3 docs</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">Entenda: verificamos 3 documentos (Licença Sanitária, Alvará e Registro Profissional). Quanto maior o nível (0–3), maior a segurança.</p>
                  </div>

                  {/* Avaliação mínima */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Avaliação mínima</label>
                    <Select value={avaliacaoMin} onValueChange={setAvaliacaoMin}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualquer" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map((s)=>(
                          <SelectItem key={s} value={String(s)}>{s} ⭐</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Modalidade */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Modalidade</label>
                    <Select value={modalidade} onValueChange={setModalidade}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualquer" />
                      </SelectTrigger>
                      <SelectContent>
                                                <SelectItem value="online">Online</SelectItem>
                                                <SelectItem value="presencial">Presencial</SelectItem>
                                                <SelectItem value="hibrida">Híbrida</SelectItem>
                                              </SelectContent>
                    </Select>
                  </div>

                  {/* Atendimento */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Atendimento</label>
                    <Select value={atendimento} onValueChange={setAtendimento}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualquer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="domicilio">Domiciliar</SelectItem>
                        <SelectItem value="clinica">Clínica</SelectItem>
                        <SelectItem value="ambulatorial">Ambulatorial</SelectItem>
                        <SelectItem value="hospitalar">Hospitalar</SelectItem>
                        <SelectItem value="homecare">Home Care</SelectItem>
                        <SelectItem value="corporativo">In Company/Corporativo</SelectItem>
                        <SelectItem value="teleatendimento">Teleatendimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cobrança */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cobrança</label>
                    <Select value={atendimentoCobranca} onValueChange={setAtendimentoCobranca}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qualquer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="convenio">Convênio</SelectItem>
                        <SelectItem value="particular">Particular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Verificados */}
                  <div className="flex items-center space-x-2 pt-6">
                    <Checkbox
                      id="verificados"
                      checked={verificados}
                      onCheckedChange={setVerificados}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
                    />
                    <label
                      htmlFor="verificados"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4 inline mr-1 text-blue-600" />
                      Apenas Verificados
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="patrocinados"
                      checked={patrocinadoOnly}
                      onCheckedChange={setPatrocinadoOnly}
                      className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 data-[state=checked]:text-white"
                    />
                    <label htmlFor="patrocinados" className="text-sm font-medium cursor-pointer">
                      👑 Apenas Patrocinados
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Anúncios */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
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
                  
                  <Select value={ordenarPor} onValueChange={setOrdenarPor}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Ordenar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recentes">Mais Recentes</SelectItem>
                      <SelectItem value="relevancia">Relevância</SelectItem>
                      <SelectItem value="patrocinados">Patrocinados Primeiro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CTA Destaque */}
              <Card className="mb-4 border-2 border-amber-200 bg-amber-50">
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p className="font-semibold text-amber-900">Impulsione seu anúncio e apareça no topo</p>
                    <p className="text-sm text-amber-800">Patrocinados ganham destaque e mais cliques</p>
                  </div>
                  <Button onClick={() => window.location.href = isProfissional ? createPageUrl('CadastrarAnuncio') : createPageUrl('Planos')} className="bg-amber-600 hover:bg-amber-700">
                    {isProfissional ? 'Criar Anúncio' : 'Ver Planos'}
                  </Button>
                </CardContent>
              </Card>

              {isLoadingAnuncios ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_,i)=> (
                    <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />
                  ))}
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
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-opacity duration-300">
                  {anunciosOrdenados.map((anuncio) => {
                    const isSponsored = !!anuncio.em_destaque || !!anuncio.impulsionado || ['ouro','diamante','platina'].includes(anuncio.plano);
                    return (
                      <CardAnuncio key={anuncio.id} anuncio={anuncio} destaque={isSponsored} />
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ABA: MAPA DA ESTÉTICA (Estabelecimentos) */}
          <TabsContent value="mapa">
            {/* Filtros do Mapa */}
            <div className="bg-white border rounded-lg shadow-sm mb-6 p-4">
              <div className="grid md:grid-cols-6 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Cidade ou Estado"
                    value={buscaCidade}
                    onChange={(e) => setBuscaCidade(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Bairro"
                    value={bairroMapa}
                    onChange={(e) => setBairroMapa(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Salão de Beleza">💇 Salão de Beleza</SelectItem>
                    <SelectItem value="Clínica de Estética">💆 Clínica de Estética</SelectItem>
                    <SelectItem value="Spa">🌿 Spa</SelectItem>
                    <SelectItem value="Barbearia">✂️ Barbearia</SelectItem>
                    <SelectItem value="Centro de Estética">✨ Centro de Estética</SelectItem>
                    <SelectItem value="Consultório">🏥 Consultório</SelectItem>
                    <SelectItem value="Personal Trainer">🏋️ Personal Trainer</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">Categorias exibem apenas estabelecimentos, serviços, produtos e eventos que possuem anúncio ativo nesta área.</p>

                <Select value={filtroPlano} onValueChange={setFiltroPlano}>
                  <SelectTrigger>
                    <SelectValue placeholder="Plano Clube" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">💙 LIGHT (10%)</SelectItem>
                    <SelectItem value="gold">💛 GOLD (15%)</SelectItem>
                    <SelectItem value="vip">💜 VIP (25%)</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={estadoMapa} onValueChange={setEstadoMapa}>
                  <SelectTrigger>
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((uf)=>(<SelectItem key={uf} value={uf}>{uf}</SelectItem>))}
                  </SelectContent>
                </Select>

                <Select value={distanciaMapa} onValueChange={setDistanciaMapa}>
                  <SelectTrigger>
                    <SelectValue placeholder="Distância" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64 overflow-y-auto z-[2001]">
                    {faixasDistancia.map((fa)=>(<SelectItem key={fa.valor} value={fa.valor}>{fa.label}</SelectItem>))}
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

                  {mostrarAnunciosNoMapa && anunciosFiltrados.map((a) => (
                    a.latitude && a.longitude ? (
                      <Marker
                        key={`anuncio-${a.id}`}
                        position={[a.latitude, a.longitude]}
                        icon={criarIconeAnuncio(!!a.profissional_verificado, (!!a.em_destaque || !!a.impulsionado || ['ouro','diamante','platina'].includes(a.plano)))}
                      >
                        <Popup>
                          <div className="p-2 min-w-[220px]">
                            <p className="font-bold text-gray-900 mb-1">{a.titulo}</p>
                            {a.profissional && (<p className="text-xs text-gray-600 mb-1">{a.profissional}</p>)}
                            {a.cidade && (<p className="text-xs text-gray-600 mb-2">{a.cidade} - {a.estado}</p>)}
                            <div className="flex items-center gap-2 mt-2">
                              <button className="text-xs text-pink-600 font-semibold hover:underline" onClick={()=>window.location.href=`${createPageUrl("DetalhesAnuncio")}?id=${a.id}`}>
                                Ver anúncio
                              </button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { setItemAgendar(a); setAgendarOpen(true); }}>
                                Agendar
                              </Button>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ) : null
                  ))}

                  {eventosVisiveis.map((ev) => (
                    ev.latitude && ev.longitude ? (
                      <Marker key={`evento-${ev.id}`} position={[ev.latitude, ev.longitude]} icon={criarIconeEvento()}>
                        <Popup>
                          <div className="p-2 min-w-[220px]">
                            <p className="font-bold text-gray-900">{ev.titulo}</p>
                            {ev.cidade && (<p className="text-xs text-gray-600">{ev.cidade} - {ev.estado}</p>)}
                            {ev.data_hora && (<p className="text-xs text-gray-600 mt-1">🗓 {new Date(ev.data_hora).toLocaleString('pt-BR')}</p>)}
                            <p className="text-xs font-semibold mt-1">{ev.preco_tipo === 'pago' ? `R$ ${Number(ev.preco_valor||0).toFixed(2)}` : 'Grátis'}</p>
                          </div>
                        </Popup>
                      </Marker>
                    ) : null
                  ))}

                   {centralizarEm && <CentralizarMapa center={centralizarEm} />}
                </MapContainer>

                {/* Botão flutuante: Minha Localização */}
                <div className="absolute bottom-4 right-4 z-[1000]">
                  <Button onClick={handleUsarMinhaLocalizacao} className="shadow-lg bg-white text-[#2C2C2C] hover:bg-gray-100 border-2 border-[#F7D426]">
                    <Navigation className="w-4 h-4 mr-2 text-[#F7D426]" /> Minha localização
                  </Button>
                </div>

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
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-3 h-3 rounded-full border-2 border-white" style={{ background:'#10B981', boxShadow:'0 0 10px rgba(0,0,0,0.2)'}}></div>
                      <span>Anúncio Verificado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full border-2 border-white" style={{ background:'#9CA3AF', boxShadow:'0 0 0 4px rgba(247, 212, 38, 0.5), 0 0 10px rgba(0,0,0,0.2)'}}></div>
                      <span>Anúncio Patrocinado</span>
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

      {/* Modal Agendamento Rápido */}
      <AgendamentoRapidoModal
        open={agendarOpen}
        onClose={(ok) => { setAgendarOpen(false); setItemAgendar(null); if (ok) alert('Agendamento confirmado!'); }}
        item={itemAgendar}
      />

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