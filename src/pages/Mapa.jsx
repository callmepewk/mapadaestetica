import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
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
  Instagram,
  Facebook,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CardAnuncio from "../components/anuncios/CardAnuncio";
import { Checkbox } from "@/components/ui/checkbox";
import SeletorProcedimentos from "../components/anuncios/SeletorProcedimentos";
import { categoriasAgrupadas } from "../components/anuncios/CategoriasData";
import AgendamentoRapidoModal from "../components/agendamentos/AgendamentoRapidoModal";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Constantes
const categorias = categoriasAgrupadas.flatMap((g) => g.items);

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

// Listas de filtros de Procedimentos e Tratamentos
const procedimentosLista = [
  "botox","preenchimento","bioestimuladores","harmonização facial","fios de sustentação","peeling químico","microagulhamento","laser dermatológico","ultrassom microfocado","criolipólise","lipolíticos","intradermoterapia","prp","prf","micropigmentação","remoção de tatuagem","depilação a laser"
];
const tratamentosLista = [
  "tratamento de acne","tratamento de melasma","tratamento de rosácea","tratamento capilar","rejuvenescimento facial","redução de gordura localizada","tratamento de estrias","tratamento de cicatrizes","clareamento de manchas","melhora de flacidez","tratamento de olheiras","tratamento de poros dilatados","tratamento anti-aging"
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
  const [selectedAd, setSelectedAd] = useState(null);
  const [mostrarInfoFiltros, setMostrarInfoFiltros] = useState(false);
  const [mostrarInfoPreco, setMostrarInfoPreco] = useState(false);
  const [categoriaOutrosTexto, setCategoriaOutrosTexto] = useState("");
  const [pais, setPais] = useState("");
  const [cep, setCep] = useState("");
  const [permissaoNegada, setPermissaoNegada] = useState(false);
  
  // Filtros para Anúncios
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [tratamento, setTratamento] = useState("");

  const [tecnologia, setTecnologia] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [faixaPreco, setFaixaPreco] = useState("");
  const [verificados, setVerificados] = useState(false);
  const [tipoAnuncio, setTipoAnuncio] = useState("");
  const [tipoEstabelecimento, setTipoEstabelecimento] = useState("");
  const [distancia, setDistancia] = useState("999999");
  // Novos filtros avançados essenciais ao paciente
  const [avaliacaoMin, setAvaliacaoMin] = useState(""); // 1-5 estrelas estabelecimento
  const [modalidade, setModalidade] = useState(""); // online|presencial
  const [atendimento, setAtendimento] = useState(""); // domicilio|clinica|ambulatorial|hospitalar|homecare|corporativo|teleatendimento
  const [atendimentoCobranca, setAtendimentoCobranca] = useState(""); // convenio|particular
  const [ordenarPor, setOrdenarPor] = useState('recentes');
  const MAP_KEYWORDS = {
    procedimentos: {
      'toxina botulínica': ['botox','toxina botulinica','toxina botulínica','botox facial'],
      'preenchimento': ['preenchimento','preenchimento labial','ácido hialurônico','preenchimentos'],
      'bioestimulador': ['bioestimulador','bioestimuladores','sculptra','ellansé'],
      'microagulhamento': ['microagulhamento','dermaroller','microneedling','dermapen','dermaroller'],
      'laser': ['laser','laser facial','laser dermatológico','depilação a laser'],
      'peeling químico': ['peeling','peeling químico'],
      'radiofrequência': ['radiofrequência','radiofrequencia','radiofrequência fracionada']
    },
    tratamentos: {
      'estrias': ['estrias','tratamento estrias','remover estrias'],
      'acne': ['acne','tratamento de acne','espinhas'],
      'melasma': ['melasma','manchas na pele','manchas'],
      'flacidez': ['flacidez','flacidez corporal','flacidez facial'],
      'queda de cabelo': ['queda de cabelo','calvície','afinamento capilar'],
      'olheiras': ['olheiras','tratamento de olheiras']
    }
  };
  const aplicarBuscaIntencao = () => {
    const q = (busca||'').toLowerCase();
    if (!q.trim()) return;
    for (const [canon, syns] of Object.entries(MAP_KEYWORDS.procedimentos)) {
      if (syns.some(s => q.includes(s))) { setProcedimento(canon); setTratamento(''); return; }
    }
    for (const [canon, syns] of Object.entries(MAP_KEYWORDS.tratamentos)) {
      if (syns.some(s => q.includes(s))) { setTratamento(canon); setProcedimento(''); return; }
    }
  };

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

  // Query produtos em destaque
  const { data: produtos = [], isLoading: isLoadingProdutos } = useQuery({
    queryKey: ['produtos-destaque'],
    queryFn: async () => await base44.entities.Produto.filter({ status: 'ativo', em_destaque: true }, '-created_date', 8),
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
      const proc = p.get('procedimento');
      const trat = p.get('tratamento');
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
      if (aba) setAbaSelecionada(aba); else if (proc || trat) setAbaSelecionada('anuncios');
      if (proc) setProcedimento(proc);
      if (trat) setTratamento(trat);
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
        async (position) => {
          const novaLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocalizacaoUsuario(novaLoc);
          setCentralizarEm(novaLoc);
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${novaLoc.lat}&lon=${novaLoc.lng}`);
            const data = await resp.json();
            const cid = data.address.city || data.address.town || data.address.village || '';
            const uf = (data.address.state_code || data.address.state || '').toString().slice(0,2).toUpperCase();
            const paisResp = data.address.country || '';
            const cepResp = data.address.postcode || '';
            if (cid) { setCidade(cid); setBuscaCidade(cid); }
            if (uf) { setEstado(uf); setEstadoMapa(uf); }
            if (paisResp) setPais(paisResp);
            if (cepResp) setCep(cepResp);
          } catch (e) {
            console.warn('Falha na geocodificação reversa', e);
          }
          setBuscandoLocalizacao(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          setPermissaoNegada(true);
          setBuscandoLocalizacao(false);
          setLocalizacaoUsuario({ lat: -15.7801, lng: -47.9292 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setPermissaoNegada(true);
      setLocalizacaoUsuario({ lat: -15.7801, lng: -47.9292 });
    }
  }, []);

  const handleUsarMinhaLocalizacao = async () => {
    if (navigator.geolocation) {
      setBuscandoLocalizacao(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const novaLocalizacao = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocalizacaoUsuario(novaLocalizacao);
          setCentralizarEm(novaLocalizacao);
          try {
            const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${novaLocalizacao.lat}&lon=${novaLocalizacao.lng}`);
            const data = await resp.json();
            const cid = data.address.city || data.address.town || data.address.village || '';
            const uf = (data.address.state_code || data.address.state || '').toString().slice(0,2).toUpperCase();
            const paisResp = data.address.country || '';
            const cepResp = data.address.postcode || '';
            if (cid) { setCidade(cid); setBuscaCidade(cid); }
            if (uf) { setEstado(uf); setEstadoMapa(uf); }
            if (paisResp) setPais(paisResp);
            if (cepResp) setCep(cepResp);
          } catch {}
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
    const key = (busca||'').toLowerCase();
    const matchBusca = !key || 
      (anuncio.titulo||'').toLowerCase().includes(key) ||
      (anuncio.descricao||'').toLowerCase().includes(key) ||
      (anuncio.profissional||'').toLowerCase().includes(key) ||
      (anuncio.profissao||'').toLowerCase().includes(key) ||
      (anuncio.categoria||'').toLowerCase().includes(key) ||
      (anuncio.subcategoria||'').toLowerCase().includes(key) ||
      (anuncio.procedimentos_servicos||[]).some(p => (p||'').toLowerCase().includes(key)) ||
      (anuncio.tags||[]).some(t => (t||'').toLowerCase().includes(key));
    const matchCategoria = !categoria || (categoria === 'Outros' ? (
      !categoriaOutrosTexto ? true : (
        (anuncio.titulo||'').toLowerCase().includes(categoriaOutrosTexto.toLowerCase()) ||
        (anuncio.descricao||'').toLowerCase().includes(categoriaOutrosTexto.toLowerCase()) ||
        (anuncio.tags||[]).some(t => (t||'').toLowerCase().includes(categoriaOutrosTexto.toLowerCase()))
      )
    ) : anuncio.categoria === categoria);
    const matchProcedimento = !procedimento || 
      anuncio.procedimentos_servicos?.some(p => p.toLowerCase().includes(procedimento.toLowerCase()));
    const tLower = (tratamento || '').toLowerCase();
    const matchTratamento = !tratamento || (
      (anuncio.descricao || '').toLowerCase().includes(tLower) ||
      (anuncio.categoria || '').toLowerCase().includes(tLower) ||
      (anuncio.tags || []).some(t => (t || '').toLowerCase().includes(tLower))
    );
    const matchCidade = !cidade || anuncio.cidade?.toLowerCase().includes(cidade.toLowerCase());
    const matchEstado = !estado || anuncio.estado === estado;
    const matchPreco = !faixaPreco || anuncio.faixa_preco === faixaPreco;
    const matchVerificados = !verificados || anuncio.profissional_verificado === true;
    const matchTipoAnuncio = !tipoAnuncio || anuncio.tipo_anuncio === tipoAnuncio;
    const matchTipoEstabelecimento = !tipoEstabelecimento || anuncio.tipo_estabelecimento === tipoEstabelecimento;

    const matchTecnologia = !tecnologia || (anuncio.tags||[]).some(t => (t||'').toLowerCase().includes(tecnologia.toLowerCase()));

    const tagsLower = (anuncio.tags || []).map(t => (t || '').toLowerCase());

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
    
    return matchBusca && matchCategoria && matchProcedimento && matchTratamento && matchCidade && matchEstado && 
    matchPreco && matchVerificados && matchTipoAnuncio && matchTipoEstabelecimento && matchTecnologia &&
    matchAvaliacao && matchModalidade && matchAtendimento && matchCobranca && matchDistancia && matchPublico;
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
    setCategoriaOutrosTexto("");
    setProcedimento("");
    setTratamento("");
    setCidade("");
    setEstado("");
    setFaixaPreco("");
    setTipoAnuncio("");
    setTipoEstabelecimento("");
    setDistancia("999999");
    setAvaliacaoMin("");
    setModalidade("");
    setAtendimento("");
    setAtendimentoCobranca("");
    setTecnologia("");
    setVerificados(false);
    setOrdenarPor('recentes');
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

      {/* Busca principal */}
      <div className="max-w-7xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 border -translate-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              value={busca}
              onChange={(e)=>setBusca(e.target.value)}
              onKeyDown={(e)=>{ if(e.key==='Enter') aplicarBuscaIntencao(); }}
              placeholder="Busque por procedimento, tratamento ou clínica (ex.: botox, tirar estrias, limpeza de pele)"
              className="pl-12 pr-36 h-14 text-base md:text-lg"
            />
            <Button onClick={aplicarBuscaIntencao} className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-5 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold">Buscar</Button>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-2">Exemplos: "botox", "tirar estrias", "limpeza de pele", "clínica estética"</p>
        </div>
      </div>

      {/* Explicação institucional */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border shadow-sm p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">Como funciona o Mapa da Estética</h2>
          <p className="text-gray-600 mb-6">Conectamos você aos melhores profissionais e estabelecimentos próximos, com busca por procedimento e comparação clara.</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border">
              <div className="text-3xl mb-2">🔎</div>
              <h4 className="font-semibold mb-1">1) Busque por procedimento</h4>
              <p className="text-sm text-gray-600">Ex.: Botox, Preenchimento, Laser, Microagulhamento, Peeling...</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border">
              <div className="text-3xl mb-2">📍</div>
              <h4 className="font-semibold mb-1">2) Vemos sua região</h4>
              <p className="text-sm text-gray-600">Com sua permissão, detectamos sua localização e trazemos opções próximas.</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border">
              <div className="text-3xl mb-2">🤝</div>
              <h4 className="font-semibold mb-1">3) Contrate com segurança</h4>
              <p className="text-sm text-gray-600">Veja avaliações, verificação profissional e fale direto por WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos para você */}
      <div className="max-w-7xl mx-auto px-4 pb-2">
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border shadow-sm p-6 md:p-8">
          <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900">Produtos para você</h3>
              <p className="text-sm text-gray-600">Seleção de itens e serviços em destaque perto de você</p>
            </div>
            <Button onClick={() => window.location.href = createPageUrl('Produtos')} variant="outline">Ver todos</Button>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(produtos||[]).slice(0,8).map((p)=> (
              <div key={p.id} className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all">
                {Array.isArray(p.imagens) && p.imagens[0] ? (
                  <img src={p.imagens[0]} alt={p.nome} className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center text-gray-400">sem imagem</div>
                )}
                <div className="p-3">
                  <p className="font-semibold text-gray-900 line-clamp-2 mb-1">{p.nome}</p>
                  <p className="text-sm text-gray-600">{p.preco_texto || (p.preco ? `R$ ${Number(p.preco).toFixed(2)}` : 'Consultar')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner de busca manual quando sem permissão de localização */}
      {permissaoNegada && (
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 mb-4 shadow-sm">
            <p className="text-sm text-gray-800 mb-3">Não conseguimos acessar sua localização. Busque manualmente por cidade ou CEP.</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <Input placeholder="Cidade" value={cidade} onChange={(e)=>setCidade(e.target.value)} className="h-10" />
              <Input placeholder="CEP" value={cep} onChange={(e)=>setCep(e.target.value)} className="h-10" />
              <Button
                onClick={async ()=>{
                  const cepNum = cep.replace(/\D/g,'');
                  if (cepNum.length === 8) {
                    try {
                      const r = await fetch(`https://viacep.com.br/ws/${cepNum}/json/`);
                      const d = await r.json();
                      if (!d.erro) {
                         setCidade(d.localidade||'');
                         setEstado((d.uf||'').toUpperCase());
                         setEstadoMapa((d.uf||'').toUpperCase());
                         setBuscaCidade(`${d.localidade||''}`);
                       }
                    } catch {}
                  }
                }}
                className="h-10 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C]"
              >Aplicar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs: Anúncios e Mapa da Estética */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-6">
            {/* data-state active styling */}
            <TabsTrigger value="mapa" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Mapa da Estética ({estabelecimentosFiltradosComDist.length})
            </TabsTrigger>
            <TabsTrigger value="anuncios" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Anúncios ({anunciosFiltrados.length})
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

                    <span className="ml-2 text-xs text-gray-500 font-normal">(Aplicação automática — sem botão Buscar)</span>
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
              <div>
                <label className="text-sm font-medium mb-2 block">Procedimento</label>
                <Select value={procedimento} onValueChange={setProcedimento}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {procedimentosLista.map((p)=>(<SelectItem key={p} value={p}>{p}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Tratamento</label>
                <Select value={tratamento} onValueChange={setTratamento}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {tratamentosLista.map((t)=>(<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
                  {/* Linha 1 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Buscar</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input value={busca} onChange={(e)=>setBusca(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter') aplicarBuscaIntencao(); }} placeholder="Digite aqui... (ex: quero tirar estrias, botox)" className="pl-9 h-10" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Categoria</label>
                    <Select value={categoria} onValueChange={setCategoria}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {categorias.map((cat)=>(<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {categoria === 'Outros' && (
                    <div>
                      <label className="text-sm font-medium mb-2 block">Especifique (texto livre)</label>
                      <Input value={categoriaOutrosTexto} onChange={(e)=>setCategoriaOutrosTexto(e.target.value)} placeholder="Ex.: limpeza profunda, harmonização..." className="h-10" />
                    </div>
                  )}
                  <div>
                     <label className="text-sm font-medium mb-2 block">Tratamento</label>
                    <Select value={tratamento} onValueChange={setTratamento}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Selecione um tratamento" />
                      </SelectTrigger>
                      <SelectContent className="max-h-64">
                        {tratamentosLista.map((t)=>(<SelectItem key={t} value={t}>{t}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                     <label className="text-sm font-medium mb-2 block">Procedimento</label>
                     <Select value={procedimento} onValueChange={setProcedimento}>
                       <SelectTrigger className="h-10">
                         <SelectValue placeholder="Selecione um procedimento" />
                       </SelectTrigger>
                       <SelectContent className="max-h-64">
                         {procedimentosLista.map((p)=>(<SelectItem key={p} value={p}>{p}</SelectItem>))}
                       </SelectContent>
                     </Select>
                   </div>
 
                   <div>
                     <label className="text-sm font-medium mb-2 block">Tecnologia</label>
                     <Select value={tecnologia} onValueChange={setTecnologia}>
                       <SelectTrigger className="h-10">
                         <SelectValue placeholder="Todas" />
                       </SelectTrigger>
                       <SelectContent className="max-h-64">
                         {["Laser","Radiofrequência","HIFU","Ultrassom","Peeling Químico","Microagulhamento","Luz Pulsada"].map((t)=>(<SelectItem key={t} value={t}>{t}</SelectItem>))}
                       </SelectContent>
                     </Select>
                   </div>

                  {/* Linha 2 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Estado (prioritário)</label>
                    <Select value={estado} onValueChange={setEstado}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Selecione o estado" /></SelectTrigger>
                      <SelectContent>
                        {estados.map((uf)=>(<SelectItem key={uf} value={uf}>{uf}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cidade</label>
                    <Input value={cidade} onChange={(e)=>setCidade(e.target.value)} placeholder="Digite a cidade" className="h-10" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Preço <button type="button" className="text-xs text-blue-600 underline ml-1" onClick={()=>setMostrarInfoPreco(v=>!v)}>Entenda a faixa</button></label>
                    {mostrarInfoPreco && (
                      <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                        $ até R$200 • $$ R$200–R$500 • $$$ R$500–R$3.000 • $$$$ R$3.000–R$5.000 • $$$$$ acima de R$5.000
                      </div>
                    )}
                    <Select value={faixaPreco} onValueChange={setFaixaPreco}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Todas" /></SelectTrigger>
                      <SelectContent>
                        {faixasPreco.map((preco)=>(<SelectItem key={preco} value={preco}>{preco}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Distância</label>
                    <Select value={distancia} onValueChange={setDistancia}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Qualquer distância" /></SelectTrigger>
                      <SelectContent className="max-h-64 overflow-y-auto z-[2001]">
                        {faixasDistancia.map((faixa)=>(<SelectItem key={faixa.valor} value={faixa.valor}>{faixa.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Linha 3 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Anúncio</label>
                    <Select value={tipoAnuncio} onValueChange={setTipoAnuncio}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Todos" /></SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {tiposAnuncio.map((tipo)=>(<SelectItem key={tipo.valor} value={tipo.valor}>{tipo.label}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo Estabelecimento</label>
                    <Select value={tipoEstabelecimento} onValueChange={setTipoEstabelecimento}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Todos os tipos" /></SelectTrigger>
                      <SelectContent>
                        {tiposEstabelecimento.map((tipo)=>(<SelectItem key={tipo.valor} value={tipo.valor}>{tipo.label} ({tipo.estrelas} ⭐)</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Avaliação mínima</label>
                    <Select value={avaliacaoMin} onValueChange={setAvaliacaoMin}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Qualquer" /></SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5].map((s)=>(<SelectItem key={s} value={String(s)}>{s} ⭐</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Modalidade</label>
                    <Select value={modalidade} onValueChange={setModalidade}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Qualquer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="presencial">Presencial</SelectItem>
                        <SelectItem value="hibrida">Híbrida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Linha 4 */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">Atendimento</label>
                    <Select value={atendimento} onValueChange={setAtendimento}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Qualquer" /></SelectTrigger>
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
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cobrança</label>
                    <Select value={atendimentoCobranca} onValueChange={setAtendimentoCobranca}>
                      <SelectTrigger className="h-10"><SelectValue placeholder="Qualquer" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="convenio">Convênio</SelectItem>
                        <SelectItem value="particular">Particular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div />
                  <div className="flex items-center gap-2">
                    <Checkbox id="verificados" checked={verificados} onCheckedChange={setVerificados} />
                    <label htmlFor="verificados" className="text-sm font-medium cursor-pointer"><CheckCircle className="w-4 h-4 inline mr-1 text-blue-600" />Apenas Verificados</label>
                  </div>
                </div>

                {/* Ajuda: Entenda os filtros */}
                <div className="mt-3">
                  <Button type="button" variant="outline" size="sm" onClick={()=>setMostrarInfoFiltros(v=>!v)}>
                    Entenda os filtros
                  </Button>
                  {mostrarInfoFiltros && (
                    <div className="mt-2 text-sm text-gray-700 bg-gray-50 border rounded p-3">
                      • Cidade/UF/Bairro limitam a região mostrada. • Categoria/Procedimento/Tratamento refinam os serviços. • Distância usa sua localização para priorizar próximos. • Faixa de preço segue o padrão indicado no tooltip acima. As buscas são aplicadas automaticamente — por isso não há botão “Buscar”.
                    </div>
                  )}
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
                <div className="py-4">
                  <div className="text-center mb-4">
                    <Sparkles className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-700 font-semibold">Sem anúncios nesta busca — veja categorias populares</p>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {nome:'Clínica de Estética', icon:'💆', exemplos:['botox','preenchimento','bioestimulador']},
                      {nome:'Spa', icon:'🌿', exemplos:['drenagem linfática','massagem relaxante','detox corporal']},
                      {nome:'Salão de Beleza', icon:'💇', exemplos:['design de sobrancelha','escova','maquiagem']},
                      {nome:'Harmonização Facial', icon:'✨', exemplos:['toxina botulínica','preenchimentos','fios de sustentação']},
                      {nome:'Depilação a Laser', icon:'🔆', exemplos:['axilas','pernas','virilha']},
                      {nome:'Tratamentos Corporais', icon:'💪', exemplos:['criolipólise','radiofrequência','ultrassom']},
                      {nome:'Tratamentos Faciais', icon:'🧖‍♀️', exemplos:['limpeza de pele','peeling','microagulhamento']},
                      {nome:'Capilar', icon:'🧴', exemplos:['queda de cabelo','fortalecimento','terapias do couro cabeludo']},
                      {nome:'Odonto Estética', icon:'😁', exemplos:['harmonização orofacial','lipo de papada enzimática','toxina facial']},
                      {nome:'Dermatologia', icon:'🩺', exemplos:['laser médico','peelings médicos','cirurgia dermatológica']},
                      {nome:'Biomedicina Estética', icon:'🔬', exemplos:['bioestimuladores','intradermoterapia','toxina']},
                      {nome:'Farmácia Estética', icon:'💉', exemplos:['toxina','peelings','microagulhamento']},
                      {nome:'Enfermagem Estética', icon:'🩹', exemplos:['microagulhamento','peelings','laser estético']},
                      {nome:'Fisioterapia Dermato', icon:'🏃‍♀️', exemplos:['drenagem','radiofrequência','criolipólise']},
                      {nome:'Podologia', icon:'🦶', exemplos:['unhas','calosidades','cuidados']},
                      {nome:'Massoterapia', icon:'💆‍♂️', exemplos:['relaxante','modeladora','drenagem']},
                      {nome:'Cosmetologia', icon:'🧴', exemplos:['cuidados com a pele','dermatocosméticos','protocolos']},
                    ].map((c)=> (
                      <Card key={c.nome} className="border shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900">{c.icon} {c.nome}</h4>
                            <Button size="sm" variant="outline" onClick={()=>{ const base=createPageUrl('Mapa'); window.location.href=`${base}?aba=anuncios&procedimento=${encodeURIComponent(c.exemplos[0])}`; }}>Ver profissionais</Button>
                          </div>
                          <p className="text-xs text-gray-600">Procedimentos populares:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {c.exemplos.map((e)=> <Badge key={e} className="bg-gray-100 text-gray-800">{e}</Badge>)}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <Input
                    placeholder="Cidade ou Estado"
                    value={buscaCidade}
                    onChange={(e) => setBuscaCidade(e.target.value)}
                    className="pl-10 h-10 border-2"
                  />
                </div>

                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <Input
                    placeholder="Bairro"
                    value={bairroMapa}
                    onChange={(e) => setBairroMapa(e.target.value)}
                    className="pl-10 h-10 border-2"
                  />
                </div>

                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="h-10 border-2">
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
                  <SelectTrigger className="h-10 border-2">
                    <SelectValue placeholder="Plano Clube" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">💙 LIGHT (10%)</SelectItem>
                    <SelectItem value="gold">💛 GOLD (15%)</SelectItem>
                    <SelectItem value="vip">💜 VIP (25%)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-600 -mt-2">Assinantes do Clube da Beleza têm desconto automático nos parceiros: LIGHT 10%, GOLD 15% e VIP 25%. Use o filtro para ver estabelecimentos com benefício ativo.</p>

                <Select value={estadoMapa} onValueChange={setEstadoMapa}>
                                  <SelectTrigger className="h-10 border-2">
                                   <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent>
                    {estados.map((uf)=>(<SelectItem key={uf} value={uf}>{uf}</SelectItem>))}
                  </SelectContent>
                </Select>

                <Select value={distanciaMapa} onValueChange={setDistanciaMapa}>
                  <SelectTrigger className="h-10 border-2">
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

                  {anunciosFiltrados.map((a) => (
                    a.latitude && a.longitude ? (
                      <Marker
                        key={`anuncio-${a.id}`}
                        position={[a.latitude, a.longitude]}
                        icon={criarIconeAnuncio(!!a.profissional_verificado, (!!a.em_destaque || !!a.impulsionado || ['ouro','diamante','platina'].includes(a.plano)))}
                        eventHandlers={{ click: () => setSelectedAd(a) }}
                      >
                        <Tooltip direction="top" offset={[0,-10]} opacity={1} permanent={false}>
                          <div className="text-xs">
                            <p className="font-bold line-clamp-1">{a.titulo}</p>
                            <p className="opacity-80 line-clamp-1">{a.profissao || a.categoria}</p>
                            {Array.isArray(a.procedimentos_servicos) && a.procedimentos_servicos[0] && (
                              <p className="opacity-80 line-clamp-1">Proc.: {a.procedimentos_servicos[0]}</p>
                            )}
                            {a.estrelas_estabelecimento && (<p>⭐ {a.estrelas_estabelecimento}</p>)}
                            <button className="mt-1 text-pink-600 font-semibold underline" onClick={()=>window.location.href=`${createPageUrl('DetalhesAnuncio')}?id=${a.id}`}>Ver detalhes</button>
                          </div>
                        </Tooltip>
                        <Popup>
                          <div className="p-2 min-w-[220px]">
                            <p className="font-bold text-gray-900 mb-1">{a.titulo}</p>
                            {a.profissional && (<p className="text-xs text-gray-600 mb-1">{a.profissional}</p>)}
                            {a.cidade && (<p className="text-xs text-gray-600 mb-2">{a.cidade} - {a.estado}</p>)}
                            <div className="flex items-center gap-2 mt-2">
                              <button className="text-xs text-pink-600 font-semibold hover:underline" onClick={()=>window.location.href=`${createPageUrl('DetalhesAnuncio')}?id=${a.id}`}>
                                Ver anúncio
                              </button>
                              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => { const base='https://wa.me/5521980343873'; const msg = encodeURIComponent(`Olá! Vim pelo Mapa da Estética e gostaria de agendar ${a.titulo}. Poderia me passar mais informações?`); window.open(`${base}?text=${msg}`, '_blank'); }}>
                                Agendar via WhatsApp
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

      {/* Quick view anúncio */}
      {selectedAd && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4" onClick={()=>setSelectedAd(null)}>
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl overflow-hidden" onClick={(e)=>e.stopPropagation()}>
            <div className="p-4 border-b">
              <h3 className="text-xl font-bold">{selectedAd.titulo}</h3>
              {selectedAd.profissional && (<p className="text-sm text-gray-600">{selectedAd.profissional} • {selectedAd.profissao}</p>)}
            </div>
            <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
              {Array.isArray(selectedAd.procedimentos_servicos) && selectedAd.procedimentos_servicos.length>0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedAd.procedimentos_servicos.map((p,i)=> <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{p}</span>)}
                </div>
              )}
              {selectedAd.descricao && (<p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedAd.descricao}</p>)}
              {selectedAd.endereco && (<p className="text-sm">📍 {selectedAd.endereco} {selectedAd.cidade?`, ${selectedAd.cidade}`:''}{selectedAd.estado?` - ${selectedAd.estado}`:''}</p>)}
            </div>
            <div className="p-4 border-t flex gap-2 justify-end">
              <Button variant="outline" onClick={()=>window.location.href=`${createPageUrl('DetalhesAnuncio')}?id=${selectedAd.id}`}>Ver anúncio</Button>
              {localizacaoUsuario && selectedAd.latitude && selectedAd.longitude && (
                <Button onClick={()=>{ const url = `https://www.google.com/maps/dir/?api=1&origin=${localizacaoUsuario.lat},${localizacaoUsuario.lng}&destination=${selectedAd.latitude},${selectedAd.longitude}`; window.open(url,'_blank'); }}>Ver rota</Button>
              )}
              {selectedAd.whatsapp && (
                <Button className="bg-green-600 hover:bg-green-700" onClick={()=> window.open(`https://wa.me/${String(selectedAd.whatsapp).replace(/\D/g,'')}`, '_blank')}>WhatsApp</Button>
              )}
            </div>
          </div>
        </div>
      )}

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
      {/* Siga nas redes sociais */}
      <div className="bg-white py-10 mt-10 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">Acompanhe o Mapa da Estética nas redes sociais</h3>
          <p className="text-gray-600 mb-6">Fique por dentro de novidades, dicas e tendências do universo da estética.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <a href="https://www.instagram.com/_mapadaestetica/" target="_blank" rel="noopener noreferrer"
               className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <Instagram className="w-6 h-6" />
              <span className="text-base">Instagram</span>
            </a>
            <a href="https://www.facebook.com/mapadaestetica" target="_blank" rel="noopener noreferrer"
               className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
              <Facebook className="w-6 h-6" />
              <span className="text-base">Facebook</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}