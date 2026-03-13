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
  X,
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
  const [verificados, setVerificados] = useState(true);
  const [tipoAnuncio, setTipoAnuncio] = useState("");
  const [tipoEstabelecimento, setTipoEstabelecimento] = useState("");
  const [distancia, setDistancia] = useState("999999");
  // Novos filtros avançados essenciais ao paciente
  const [avaliacaoMin, setAvaliacaoMin] = useState(""); // 1-5 estrelas estabelecimento
  const [modalidade, setModalidade] = useState(""); // online|presencial
  const [atendimento, setAtendimento] = useState(""); // domicilio|clinica|ambulatorial|hospitalar|homecare|corporativo|teleatendimento
  const [atendimentoCobranca, setAtendimentoCobranca] = useState(""); // convenio|particular
  const [formaCobranca, setFormaCobranca] = useState(""); // dinheiro|pontos|beauty_coins
  const [ordenarPor, setOrdenarPor] = useState('recentes');
  const MAP_KEYWORDS = {

procedimentos: {

  'toxina botulínica': [
    'botox','toxina botulinica','toxina botulínica','botox facial','botox estético','botox testa',
    'botox rugas','botox preventivo','toxina botulínica estética'
  ],

  'preenchimento': [
    'preenchimento','preenchimento facial','preenchimento labial','ácido hialurônico',
    'acido hialuronico','preenchimento olheiras','preenchimento bigode chines',
    'preenchimento queixo','preenchimento mandíbula','preenchimento mandibula',
    'preenchimento malar','preenchimento sulco nasogeniano'
  ],

  'bioestimulador de colágeno': [
    'bioestimulador','bioestimulador de colageno','bioestimulador de colágeno',
    'sculptra','radiesse','ellanse','estimulação de colágeno','estimulador de colageno'
  ],

  'skinbooster': [
    'skinbooster','skin booster','hidratação injetável','hidratacao injetavel',
    'hidratação profunda da pele','hidratacao profunda da pele'
  ],

  'microagulhamento': [
    'microagulhamento','microagulhamento facial','microagulhamento pele',
    'dermapen','dermaroller','indução percutânea de colágeno',
    'ipca','microagulhamento estético'
  ],

  'peeling químico': [
    'peeling quimico','peeling químico','peeling facial','peeling ácido',
    'peeling de acido','peeling de fenol','peeling de retinoico',
    'peeling superficial','peeling médio','peeling profundo'
  ],

  'peeling de diamante': [
    'peeling diamante','peeling de diamante','microdermoabrasão',
    'microdermoabrasao','dermoabrasão estética'
  ],

  'limpeza de pele': [
    'limpeza de pele','limpeza facial','limpeza profunda','extração de cravos',
    'extracao de cravos','remoção de comedões','remocao de comedoes'
  ],

  'depilação a laser': [
    'depilação a laser','depilacao a laser','laser depilação','laser depilacao',
    'depilação definitiva','depilacao definitiva','laser alexandrite',
    'laser diodo','laser nd yag depilação'
  ],

  'laser co2': [
    'laser co2','laser co2 fracionado','laser fracionado co2',
    'laser resurfacing','laser ablativo','laser rejuvenescimento',
    'laser cicatriz acne','laser estrias','laser rugas'
  ],

  'laser para manchas': [
    'laser manchas','laser para manchas','laser pigmentação',
    'laser pigmentacao','laser melasma','laser manchas solares',
    'laser lentigos','laser sardas'
  ],

  'remoção de tatuagem a laser': [
    'remoção de tatuagem','remocao de tatuagem','remoção de tatuagem a laser',
    'laser tattoo removal','laser remover tatuagem'
  ],

  'laser vascular': [
    'laser vascular','laser vasos','laser telangiectasia',
    'laser rosacea','laser vasinhos','laser angioma'
  ],

  'radiofrequência': [
    'radiofrequencia','radiofrequência','radiofrequência facial',
    'radiofrequência corporal','radiofrequencia pele',
    'radiofrequência flacidez'
  ],

  'ultrassom microfocado': [
    'ultrassom microfocado','ultrassom microfocado facial',
    'ultraformer','liftera','hifu','lifting ultrassom'
  ],

  'criolipólise': [
    'criolipólise','criolipolise','criolipolise gordura',
    'criolipólise gordura localizada','congelamento de gordura',
    'criolipolise abdominal'
  ],

  'carboxiterapia': [
    'carboxiterapia','carbox facial','carbox corporal',
    'carbox estrias','carbox olheiras','aplicação de co2 estético'
  ],

  'intradermoterapia': [
    'intradermoterapia','mesoterapia','mesoterapia facial',
    'mesoterapia corporal','mesoterapia gordura localizada',
    'injeção estética pele'
  ],

  'enzimas para gordura': [
    'enzimas gordura','enzimas gordura localizada',
    'aplicação de enzimas','lipo enzimatica','lipoliticos',
    'injeção gordura localizada'
  ],

  'fios de pdo': [
    'fios pdo','fio de pdo','fios de sustentação',
    'fios de tração','lifting com fios','fio lifting'
  ],

  'jato de plasma': [
    'jato de plasma','plasma pen','plasma fibroblast',
    'plasma lifting','plasma pele'
  ],

  'hidradermabrasão': [
    'hidradermabrasao','hidradermabrasão','hydrafacial',
    'limpeza hydrafacial','hidratação profunda facial'
  ],

  'ledterapia': [
    'ledterapia','led facial','fototerapia led',
    'luz led estética','fotobiomodulação'
  ],

  'massagem modeladora': [
    'massagem modeladora','massagem redutora',
    'massagem corporal estética','massagem gordura localizada'
  ],

  'drenagem linfática': [
    'drenagem linfatica','drenagem linfática','drenagem pós operatório',
    'drenagem corporal','drenagem estética'
  ],

  'implante capilar': [
    'implante capilar','transplante capilar',
    'fue capilar','fut capilar','restauração capilar'
  ],

  'microagulhamento capilar': [
    'microagulhamento capilar','dermaroller capilar',
    'dermapen capilar','indução colageno capilar'
  ],

'laser': [
  'laser',
  'laser estetico',
  'laser dermatologico',
  'laser facial',
  'laser corporal',

  // tipos de laser
  'laser co2',
  'laser co2 fracionado',
  'laser fracionado',
  'laser ablativo',
  'laser nao ablativo',
  'laser erbium',
  'laser erbium yag',
  'laser nd yag',
  'laser diodo',
  'laser alexandrite',
  'laser rubi',
  'laser thulium',
  'laser pico',
  'laser picossegundos',
  'laser q switched',
  'laser vascular',
  'laser pigmento',
  'laser resurfacing',

  // aplicações
  'laser depilacao',
  'depilacao a laser',
  'laser remocao de pelos',
  'laser manchas',
  'laser melasma',
  'laser pigmentacao',
  'laser cicatrizes',
  'laser acne',
  'laser rejuvenescimento',
  'laser estrias',
  'laser flacidez',
  'laser olheiras',
  'laser vasinhos',
  'laser rosacea',

  // equipamentos
  'equipamento laser',
  'aparelho laser',
  'maquina laser estetica',
  'plataforma laser estetica',
  'plataforma laser dermatologica',
  'laser profissional estetica',
  'laser medico dermatologico',

  // compra e venda
  'venda laser',
  'comprar laser',
  'compra laser',
  'laser usado',
  'laser seminovo',
  'laser novo',
  'revenda laser',
  'troca laser',
  'permuta laser',

  // aluguel
  'aluguel laser',
  'locacao laser',
  'locar laser',
  'laser aluguel',
  'laser locacao estetica',
  'alugar equipamento laser',

  // mercado
  'laser estetica',
  'laser clinica estetica',
  'laser dermatologia',
  'laser para clinica',
  'laser para estetica'
],

    'depilação a laser': [
      'depilação a laser','depilacao a laser','laser depilação','remoção definitiva de pelos'
    ],

    'peeling químico': [
      'peeling','peeling químico','peeling ácido','peeling facial',
      'peeling de fenol','peeling retinoico','peeling mandélico'
    ],

    'peeling de diamante': [
      'peeling diamante','peeling de diamante','microdermoabrasão','dermoabrasão'
    ],

    'radiofrequência': [
      'radiofrequência','radiofrequencia','radiofrequência facial',
      'radiofrequência corporal','rf estética'
    ],

    'ultrassom estético': [
      'ultrassom','ultrassom estético','ultrassom corporal','ultrassom cavitacional'
    ],

    'criolipólise': [
      'criolipólise','criolipolise','crio gordura','congelamento de gordura',
      'criolipólise abdominal'
    ],

    'lipo enzimática': [
      'lipo enzimática','lipo sem cirurgia','enzimas gordura','aplicação de enzimas'
    ],

    'intradermoterapia': [
      'intradermoterapia','mesoterapia','mesoterapia estética','mesoterapia facial'
    ],

    'skinbooster': [
      'skinbooster','hidratação profunda','hidratação injetável'
    ],

    'fios de sustentação': [
      'fios de sustentação','fios faciais','lifting com fios','fios pdo'
    ],

    'harmonização facial': [
      'harmonização facial','harmonização orofacial','procedimentos faciais',
      'full face','harmonização completa'
    ],

    'limpeza de pele': [
      'limpeza de pele','limpeza facial','limpeza profunda','extração cravos'
    ],

    'hidratação facial': [
      'hidratação facial','hidratação profunda pele','hidratação estética'
    ],

    'drenagem linfática': [
      'drenagem linfática','drenagem','drenagem estética','drenagem corporal'
    ],

    'massagem modeladora': [
      'massagem modeladora','modeladora corporal','massagem estética'
    ],

    'endermologia': [
      'endermologia','vacuum terapia','vacuoterapia'
    ],

    'carboxiterapia': [
      'carboxiterapia','carbox facial','carbox corporal'
    ],

    'luz intensa pulsada': [
      'luz pulsada','luz intensa pulsada','ipl','fototerapia'
    ],

    'ledterapia': [
      'ledterapia','terapia led','led facial'
    ],

    'jato de plasma': [
      'jato de plasma','plasma estético','plasma lift'
    ],

    'bb glow': [
      'bb glow','bb glow facial','efeito base permanente'
    ],

    'design de sobrancelhas': [
      'design de sobrancelha','design sobrancelhas','sobrancelha perfeita'
    ],

    'micropigmentação': [
      'micropigmentação','microblading','sobrancelha fio a fio',
      'micropigmentação labial'
    ],

    'dermopigmentação': [
      'dermopigmentação','pigmentação estética'
    ]

  },

tratamentos: {

  'estrias': [
    'estrias','tratamento estrias','remover estrias','estrias brancas','estrias vermelhas'
  ],

  'acne': [
    'acne','espinhas','tratamento acne','espinha inflamada','acne adulta'
  ],

  'melasma': [
    'melasma','manchas escuras','manchas na pele','clareamento melasma'
  ],

  'manchas na pele': [
    'manchas pele','manchas solares','hiperpigmentação'
  ],

  'flacidez': [
    'flacidez','flacidez facial','flacidez corporal','pele flácida'
  ],

  'queda de cabelo': [
    'queda de cabelo','calvície','alopecia','tratamento capilar'
  ],

  'olheiras': [
    'olheiras','olheira profunda','olheira escura'
  ],

  'gordura localizada': [
    'gordura localizada','gordura abdominal','redução de gordura'
  ],

  'celulite': [
    'celulite','tratamento celulite','reduzir celulite'
  ],

  'rejuvenescimento facial': [
    'rejuvenescimento facial','rejuvenescer pele','anti idade','anti aging'
  ],

  'poros dilatados': [
    'poros dilatados','poros abertos','diminuir poros'
  ],

  'cicatrizes': [
    'cicatriz','cicatriz acne','tratamento cicatriz'
  ],

  'rosácea': [
    'rosacea','rosácea','tratamento rosacea'
  ],

  'queda capilar feminina': [
    'queda capilar feminina','afinamento capilar'
  ],

  'barba falhada': [
    'barba falhada','crescimento barba'
  ],

  'clareamento de pele': [
    'clareamento pele','clareamento facial','clareamento íntimo'
  ],

  'papada': [
    'papada','redução papada','gordura submentoniana'
  ],

  'rugas': [
    'rugas','linhas de expressão','rugas profundas'
  ],


  /* NOVOS TRATAMENTOS ADICIONADOS (sem duplicar os existentes) */

  'vasinhos': [
    'vasinhos','vasinhos pernas','vasinhos rosto','telangiectasia'
  ],

  'vermelhidão facial': [
    'vermelhidão facial','pele avermelhada','rubor facial'
  ],

  'pele sensível': [
    'pele sensível','pele sensibilizada','sensibilidade facial'
  ],

  'textura irregular da pele': [
    'textura irregular','pele irregular','pele áspera','melhorar textura pele'
  ],

  'qualidade da pele': [
    'qualidade da pele','melhora da pele','pele saudável','skin quality'
  ],

  'rejuvenescimento corporal': [
    'rejuvenescimento corporal','rejuvenescer corpo','anti idade corporal'
  ],

  'redução de medidas': [
    'redução medidas','diminuir medidas','emagrecimento estético'
  ],

  'modelagem corporal': [
    'modelagem corporal','contorno corporal','escultura corporal'
  ],

  'retenção de líquidos': [
    'retenção líquidos','inchaço corporal','drenagem retenção liquido'
  ],

  'cicatriz cirúrgica': [
    'cicatriz cirurgica','cicatriz cirurgia','melhorar cicatriz cirurgia'
  ],

  'cicatriz de queimadura': [
    'cicatriz queimadura','marca queimadura','tratamento queimadura pele'
  ],

  'manchas íntimas': [
    'mancha íntima','mancha genital','hiperpigmentação íntima'
  ],

  'rejuvenescimento íntimo': [
    'rejuvenescimento íntimo','estética íntima','tratamento íntimo'
  ],

  'flacidez íntima': [
    'flacidez íntima','flacidez vaginal','firmeza vaginal'
  ],

  'queda capilar masculina': [
    'queda capilar masculina','calvície masculina','alopecia androgenética'
  ],

  'caspa': [
    'caspa','dermatite seborreica','descamação couro cabeludo'
  ],

  'oleosidade da pele': [
    'pele oleosa','oleosidade excessiva','controle oleosidade'
  ],

  'pele seca': [
    'pele seca','desidratação da pele','hidratação profunda pele'
  ]

  }

};
  const aplicarBuscaIntencao = () => {
    const q = (busca || '').toLowerCase();
    if (!q.trim()) {
      document.getElementById('mapa-interativo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    let novoProc = '';
    let novoTrat = '';
    let novaCat = '';

    for (const [canon, syns] of Object.entries(MAP_KEYWORDS.procedimentos)) {
      if (syns.some((s) => q.includes(s))) { novoProc = canon; break; }
    }
    if (!novoProc) {
      for (const [canon, syns] of Object.entries(MAP_KEYWORDS.tratamentos)) {
        if (syns.some((s) => q.includes(s))) { novoTrat = canon; break; }
      }
    }
    if (!novoProc && !novoTrat && (q.includes('clínica') || q.includes('clinica'))) {
      novaCat = 'Clínica de Estética';
    }

    setProcedimento(novoProc);
    setTratamento(novoTrat);
    setCategoria(novaCat);

    setTimeout(() => {
      document.getElementById('mapa-interativo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
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
    const matchFormaCobranca = !formaCobranca || anuncio.forma_cobranca === formaCobranca;

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
    matchPreco && matchVerificados && matchTipoAnuncio && matchTipoEstabelecimento && matchFormaCobranca && matchTecnologia &&
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

  // Placeholders de anúncios populares (procedimentos e tratamentos)
  const PLACEHOLDER_PROCS = [
    { titulo: 'Toxina botulínica (Botox)', destaque: 'Líder entre não cirúrgicos no Brasil' },
    { titulo: 'Preenchimento com ácido hialurônico', destaque: 'Resultados imediatos e naturais' },
    { titulo: 'Bioestimulador de colágeno', destaque: 'Radiesse / Sculptra — pele firme' },
    { titulo: 'Depilação a laser', destaque: 'Acabe com os pelos de vez' },
    { titulo: 'Laser para rejuvenescimento (CO2)', destaque: 'Resurfacing para nova pele' },
    { titulo: 'Ultrassom microfocado (HIFU)', destaque: 'Lifting sem cortes (Ultraformer)' },
    { titulo: 'Criolipólise', destaque: 'Redução de gordura sem cirurgia' },
    { titulo: 'Microagulhamento', destaque: 'Renovação de colágeno' },
    { titulo: 'Peeling químico', destaque: 'Textura e brilho renovados' },
    { titulo: 'Fios de sustentação (PDO)', destaque: 'Efeito lifting imediato' },
  ];
  const PLACEHOLDER_TRATS = [
    { titulo: 'Rejuvenescimento facial' },
    { titulo: 'Rugas e linhas de expressão' },
    { titulo: 'Melasma' },
    { titulo: 'Acne' },
    { titulo: 'Cicatriz de acne' },
    { titulo: 'Flacidez facial' },
    { titulo: 'Gordura localizada' },
    { titulo: 'Celulite' },
    { titulo: 'Queda de cabelo / calvície' },
    { titulo: 'Estrias' },
  ];
  const CIDADES_UF = [
    { cidade: 'São Paulo', uf: 'SP' }, { cidade: 'Rio de Janeiro', uf: 'RJ' }, { cidade: 'Belo Horizonte', uf: 'MG' },
    { cidade: 'Curitiba', uf: 'PR' }, { cidade: 'Porto Alegre', uf: 'RS' }, { cidade: 'Salvador', uf: 'BA' },
    { cidade: 'Fortaleza', uf: 'CE' }, { cidade: 'Recife', uf: 'PE' }, { cidade: 'Goiânia', uf: 'GO' },
    { cidade: 'Florianópolis', uf: 'SC' }, { cidade: 'Manaus', uf: 'AM' }, { cidade: 'Belém', uf: 'PA' }
  ];
  const AMENIDADES = ['Estacionamento', 'Aceita Pet', 'Wi‑Fi', 'Acessível', 'Lounge', 'Música Ambiente', 'Valet'];
  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const pickAmenidades = () => AMENIDADES.sort(() => 0.5 - Math.random()).slice(0, 3);

  const placeholderAds = useMemo(() => {
    const build = (lista, tipo) => lista.map((item, idx) => {
      const loc = rand(CIDADES_UF);
      const isClinica = Math.random() < 0.5;
      return {
        id: `ph-${tipo}-${idx}`,
        titulo: item.titulo,
        subtitulo: item.destaque || 'Especialistas certificados • Resultados seguros',
        tipo,
        perfil: isClinica ? 'Clínica' : 'Profissional',
        cidade: loc.cidade,
        estado: loc.uf,
        amenidades: pickAmenidades(),
      };
    });
    return [...build(PLACEHOLDER_PROCS, 'procedimento'), ...build(PLACEHOLDER_TRATS, 'tratamento')];
  }, []);

  const representativeAds = useMemo(() => {
    const map = new Map();
    for (const a of anunciosFiltrados) {
      const key = (Array.isArray(a.procedimentos_servicos) && a.procedimentos_servicos[0])
        ? String(a.procedimentos_servicos[0]).toLowerCase()
        : (a.categoria || a.titulo || '').toLowerCase();
      if (!map.has(key)) map.set(key, a);
    }
    return Array.from(map.values());
  }, [anunciosFiltrados, procedimento, tratamento]);

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
    setFormaCobranca("");
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
      <div className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] py-8 px-4">
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
      <div className="max-w-7xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl shadow p-4 md:p-6 border">
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
          {(procedimento || tratamento || categoria) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {procedimento && (
                <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-full">
                  Procedimento: {procedimento}
                  <button onClick={()=>setProcedimento('')} className="ml-1 hover:text-emerald-900" aria-label="Limpar procedimento">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {tratamento && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-full">
                  Tratamento: {tratamento}
                  <button onClick={()=>setTratamento('')} className="ml-1 hover:text-blue-900" aria-label="Limpar tratamento">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {categoria && (
                <span className="inline-flex items-center gap-1 text-xs bg-purple-50 border border-purple-200 text-purple-800 px-2.5 py-1 rounded-full">
                  Categoria: {categoria}
                  <button onClick={()=>setCategoria('')} className="ml-1 hover:text-purple-900" aria-label="Limpar categoria">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
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

      {/* Mapa + Lista Unificados */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Card className="mb-6 border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-emerald-700 text-sm">
                <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  ✅ Exibindo apenas profissionais verificados
                </span>
              </div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-pink-600" />
                Filtros
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleUsarMinhaLocalizacao}
                  disabled={buscandoLocalizacao}
                  className="h-10 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C]"
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={limparFiltros}
                  className="border-2 border-red-300 text-red-700"
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Estado</label>
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
                <label className="text-sm font-medium mb-2 block">Distância</label>
                <Select value={distancia} onValueChange={setDistancia}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Qualquer distância" /></SelectTrigger>
                  <SelectContent className="max-h-64 overflow-y-auto z-[2001]">
                    {faixasDistancia.map((faixa)=>(<SelectItem key={faixa.valor} value={faixa.valor}>{faixa.label}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
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
                <label className="text-sm font-medium mb-2 block">Tipo de Estabelecimento</label>
                <Select value={tipoEstabelecimento} onValueChange={setTipoEstabelecimento}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Todos os tipos" /></SelectTrigger>
                  <SelectContent>
                    {tiposEstabelecimento.map((tipo)=>(<SelectItem key={tipo.valor} value={tipo.valor}>{tipo.label} ({tipo.estrelas} ⭐)</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Forma de Cobrança</label>
                <Select value={formaCobranca} onValueChange={setFormaCobranca}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pontos">Pontos</SelectItem>
                    <SelectItem value="beauty_coins">Beauty Coins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Faixa de Preço</label>
                <Select value={faixaPreco} onValueChange={setFaixaPreco}>
                  <SelectTrigger className="h-10"><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    {faixasPreco.map((preco)=>(<SelectItem key={preco} value={preco}>{preco}</SelectItem>))}
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
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Mapa à esquerda (maior) */}
          <div id="mapa-interativo" className="lg:col-span-2 relative h-[60vh] min-h-[520px]">
            <MapContainer
              center={localizacaoUsuario ? [localizacaoUsuario.lat, localizacaoUsuario.lng] : [-15.7801, -47.9292]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              className="z-0 rounded-xl overflow-hidden border"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />

              {localizacaoUsuario && (
                <Marker position={[localizacaoUsuario.lat, localizacaoUsuario.lng]} icon={criarIconeUsuario()}>
                  <Popup>
                    <div className="text-center p-2">
                      <p className="font-bold text-blue-600">📍 Você está aqui</p>
                    </div>
                  </Popup>
                </Marker>
              )}

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

              {centralizarEm && <CentralizarMapa center={centralizarEm} />}
            </MapContainer>

            {/* Botão flutuante */}
            <div className="absolute bottom-4 right-4 z-[1000]">
              <Button onClick={handleUsarMinhaLocalizacao} className="shadow-lg bg-white text-[#2C2C2C] hover:bg-gray-100 border-2 border-[#F7D426]">
                <Navigation className="w-4 h-4 mr-2 text-[#F7D426]" /> Minha localização
              </Button>
            </div>
          </div>

          {/* Lista de Anúncios à direita */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg text-gray-900">Anúncios ({anunciosFiltrados.length})</h2>
            </div>
            {isLoadingAnuncios ? (
              <div className="space-y-3">
                {[...Array(6)].map((_,i)=> (<div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse" />))}
              </div>
            ) : anunciosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-700 font-semibold">Sem anúncios nesta busca</p>
              </div>
            ) : (
              <div className="space-y-4">
                {anunciosOrdenados.map((anuncio) => {
                  const isSponsored = !!anuncio.em_destaque || !!anuncio.impulsionado || ['ouro','diamante','platina'].includes(anuncio.plano);
                  return (
                    <CardAnuncio key={anuncio.id} anuncio={anuncio} destaque={isSponsored} />
                  );
                })}
              </div>
            )}

            {/* Placeholders de anúncios populares */}
            <div className="mt-6">
              <h3 className="font-bold text-lg text-gray-900 mb-3">Buscas populares (convite)</h3>
              <div className="space-y-3">
                {placeholderAds.slice(0,20).map((ph) => (
                  <div key={ph.id} className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center justify-between gap-2 mb-1 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Badge variant="outline" className="mr-2">{ph.perfil}</Badge>
                        {ph.tipo === 'procedimento' ? 'Procedimento' : 'Tratamento'}
                      </span>
                      <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" /> {ph.cidade} - {ph.estado}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{ph.titulo}</p>
                    <p className="text-sm text-gray-600 mb-2">{ph.subtitulo}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {ph.amenidades.map((a,i)=> (<span key={i} className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full border">{a}</span>))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => {
                          const base='https://wa.me/5521980343873';
                          const msg = encodeURIComponent(`Olá! Quero realizar ${ph.titulo} em ${ph.cidade}-${ph.estado}. Podem me ajudar com opções e valores?`);
                          window.open(`${base}?text=${msg}`, '_blank');
                        }}
                      >Quero realizar</Button>
                      <Button size="sm" variant="outline" onClick={() => {
                        if (ph.tipo === 'procedimento') { setProcedimento(ph.titulo); setTratamento(''); }
                        else { setTratamento(ph.titulo); setProcedimento(''); }
                        setTimeout(()=> document.getElementById('mapa-interativo')?.scrollIntoView({behavior:'smooth'}), 0);
                      }}>Ver no mapa</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Produtos para você (movido para depois do mapa e anúncios) */}
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
              <div
                key={p.id}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => { window.location.href = createPageUrl('Produtos'); }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter') window.location.href = createPageUrl('Produtos'); }}
              >
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