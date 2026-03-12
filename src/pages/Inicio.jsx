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
  Instagram,
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
  Eye,
  Heart,
  Loader2,
  Crown,
  ShieldCheck,
  Phone,
  Calendar,
  BookOpen
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

import AgendamentoModal from "../components/produtos/AgendamentoModal";
import { motion } from "framer-motion";

import OnboardingModal from "../components/home/OnboardingModal";
import LoginPromptModal from "../components/home/LoginPromptModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BannerRotativo from "../components/banners/BannerRotativo";
import PatrocinadoresCarousel from "../components/home/PatrocinadoresCarousel";
import RegulamentacaoEstetica from "../components/home/RegulamentacaoEstetica";
import DashboardPatrocinadorHome from "../components/patrocinadores/DashboardPatrocinadorHome";
import HeroPremium from "../components/home/HeroPremium";
import AuthorityStrip from "../components/home/AuthorityStrip";
import ValidationThreeSteps from "../components/home/ValidationThreeSteps";
import FiltrosBuscaPaciente from "../components/home/FiltrosBuscaPaciente";
import ModalFiltrosAvancados from "../components/home/ModalFiltrosAvancados";
import CuriosidadesMes from "../components/home/CuriosidadesMes";


import RabiHomeTeaser from "../components/rabi/RabiHomeTeaser";
import SecaoTutoriais from "../components/home/SecaoTutoriais";
import SeletorTipoUsuario from "../components/home/SeletorTipoUsuario";



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
  const [buscaIntencao, setBuscaIntencao] = useState("");
  const [buscaCategoria, setBuscaCategoria] = useState("");
  const [buscaIntencao, setBuscaIntencao] = useState("");
  const [mostrarOnboarding, setMostrarOnboarding] = useState(false);
  const [mostrarComparacao, setMostrarComparacao] = useState(false);
  const [mostrarLoginPrompt, setMostrarLoginPrompt] = useState(false);
  const [tipoLoginPrompt, setTipoLoginPrompt] = useState("");
  const [user, setUser] = useState(null);
  const [resumoAnuncios, setResumoAnuncios] = useState([]);
  const [mostrarSeletorTipo, setMostrarSeletorTipo] = useState(false);
  const [visaoAtual, setVisaoAtual] = useState(null); // Para controlar a visão do admin
  const [geoInfo, setGeoInfo] = useState({ cidade: "", estado: "", pais: "", lat: null, lon: null });
  const [geoLoading, setGeoLoading] = useState(false);
  const [agora, setAgora] = useState(new Date());
  const [agendarOpen, setAgendarOpen] = useState(false);
  const [produtoAgendar, setProdutoAgendar] = useState(null);
  const [filtros, setFiltros] = useState({ tipo:"", categoria:"", especialidade:"", preco:"", rating:"", distancia:"" });
  const [filtrosAvancados, setFiltrosAvancados] = useState({ data:"", hora:"", atendimento_domicilio:false, atendimento_local:false, convenios:"" });
  const [openFiltrosAvancados, setOpenFiltrosAvancados] = useState(false);

  const navigate = useNavigate();

  const getSessionId = () => {
    try {
      let id = localStorage.getItem('site_session_id');
      if (!id) { id = crypto.randomUUID(); localStorage.setItem('site_session_id', id); }
      return id;
    } catch { return Math.random().toString(36).slice(2); }
  };

  useEffect(() => {
    const sid = getSessionId();
    (async () => {
      try {
        await base44.entities.PageView.create({
          route: 'Inicio',
          referrer: document.referrer || '',
          user_agent: navigator.userAgent,
          user_email: user?.email || '',
          session_id: sid
        });
      } catch (e) { /* noop */ }
    })();
  }, [user]);

  useEffect(()=>{
    const i = setInterval(()=> setAgora(new Date()), 1000);
    return ()=> clearInterval(i);
  },[]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);

        // Se for admin, carregar visão salva
        if (userData.role === 'admin') {
          const visaoSalva = localStorage.getItem('admin_visao_site');
          setVisaoAtual(visaoSalva || 'profissional');
        } else {
          setVisaoAtual(userData.tipo_usuario);
        }

        // Verificar se precisa selecionar tipo
        if (!userData.tipo_usuario) {
          setMostrarSeletorTipo(true);
          return;
        }

        if (userData && !userData.cadastro_completo) {
          setMostrarOnboarding(true);
        }

        // Buscar resumo dos anúncios do profissional/patrocinador
        if (userData?.tipo_usuario === 'profissional' || userData?.tipo_usuario === 'patrocinador') {
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
        setVisaoAtual('paciente'); // Usuários não logados veem como paciente
      }
    };
    fetchUser();
  }, []);

  // ATUALIZADO: Listener para mudanças no localStorage (sincronização com Layout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (user?.role === 'admin' && e.key === 'admin_visao_site') {
        setVisaoAtual(e.newValue || 'profissional');
      }
    };
    
    // Também verificar a cada 500ms (para mudanças no mesmo tab)
    const intervalo = setInterval(() => {
      if (user?.role === 'admin') {
        const visaoSalva = localStorage.getItem('admin_visao_site');
        if (visaoSalva && visaoSalva !== visaoAtual) {
          setVisaoAtual(visaoSalva);
        }
      }
    }, 500);
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalo);
    };
  }, [user, visaoAtual]);

  const handleOnboardingComplete = async () => {
    setMostrarOnboarding(false);
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setVisaoAtual(userData.tipo_usuario);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
    }
  };

  const handleOnboardingClose = () => {
    setMostrarOnboarding(false);
  };

  const handleTipoUsuarioSuccess = async () => {
    setMostrarSeletorTipo(false);
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setVisaoAtual(userData.tipo_usuario);
      if (!userData.cadastro_completo) {
        setMostrarOnboarding(true);
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário após seleção de tipo:", error);
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

  // Eventos próximos
  const { data: eventosHome = [] } = useQuery({
    queryKey: ['eventos-home', visaoAtual],
    queryFn: async () => await base44.entities.Evento.filter({ status: 'ativo' }, '-data_hora', 50),
    initialData: [],
    enabled: !!visaoAtual,
  });
  const agoraISO = new Date().toISOString();
  const eventosVisiveisHome = (eventosHome || [])
    .filter(ev => ev.data_hora && ev.data_hora >= agoraISO)
    .filter(ev => !ev.publico_alvo || ev.publico_alvo === 'todos' || (visaoAtual === 'profissional' || visaoAtual === 'patrocinador' ? ev.publico_alvo === 'profissionais' : ev.publico_alvo === 'pacientes'))
    .sort((a,b)=> (a.data_hora> b.data_hora?1:-1))
    .slice(0,6);

  const handleBuscar = async () => {
    const params = new URLSearchParams();
    if (buscaCidade) params.set('cidade', buscaCidade);
    if (buscaCategoria) params.set('categoria', buscaCategoria);
    if (filtros.tipo) params.set('tipo', filtros.tipo);
    if (filtros.categoria) params.set('categoria_filtro', filtros.categoria);
    if (filtros.especialidade) params.set('especialidade', filtros.especialidade);
    if (filtros.preco) { const [min,max] = filtros.preco.split('-'); if (min) params.set('preco_min', min); if (max) params.set('preco_max', max); }
    if (filtros.rating) params.set('rating_min', filtros.rating);
    if (filtros.distancia) params.set('distancia_km', filtros.distancia);
    if (filtrosAvancados.data) params.set('data', filtrosAvancados.data);
    if (filtrosAvancados.hora) params.set('hora', filtrosAvancados.hora);
    if (filtrosAvancados.atendimento_domicilio) params.set('at_domicilio', '1');
    if (filtrosAvancados.atendimento_local) params.set('at_local', '1');
    if (filtrosAvancados.convenios) params.set('convenios', filtrosAvancados.convenios);

    // Atualiza URL atual com filtros (sem obrigar login)
    const current = new URL(window.location.href);
    for (const [k,v] of params.entries()) current.searchParams.set(k,v);
    current.searchParams.set('aba','anuncios');
    window.history.replaceState({}, '', current.toString());

    // Se logado, registra SearchEvent e navega pro Mapa
    if (!user) {
      // Continua permitindo a busca mesmo sem login, apenas não loga SearchEvent
      const base = createPageUrl("Mapa");
      window.location.href = `${base}?${params.toString()}&aba=anuncios`;
      return;
    }
    try {
      await base44.entities.SearchEvent.create({
        query: [buscaCidade, buscaCategoria].filter(Boolean).join(' | '),
        page: 'Inicio',
        user_email: user?.email || '',
        session_id: getSessionId(),
        cidade: buscaCidade || geoInfo.cidade || user?.cidade || '',
        estado: geoInfo.estado || user?.estado || '',
        pais: geoInfo.pais || '',
        latitude: geoInfo.lat || null,
        longitude: geoInfo.lon || null
      });
    } catch {}
    const base = createPageUrl("Mapa");
    const query = new URLSearchParams(params);
    query.set('aba','anuncios');
    window.location.href = `${base}?${query.toString()}`;
  };

  const KEYWORDS = {
    procedimentos: {
      'toxina botulínica': ['botox','toxina botulinica','toxina botulínica','botox facial'],
      'preenchimento': ['preenchimento','preenchimento labial','ácido hialurônico','preenchimentos'],
      'bioestimulador': ['bioestimulador','bioestimuladores','sculptra','ellansé'],
      'microagulhamento': ['microagulhamento','dermaroller','microneedling'],
      'laser': ['laser','laser facial','laser dermatológico','depilação a laser'],
      'peeling químico': ['peeling','peeling químico'],
      'radiofrequência': ['radiofrequência','radiofrequencia'],
    },
    tratamentos: {
      'estrias': ['estrias','tratamento estrias','remover estrias'],
      'acne': ['acne','tratamento de acne','espinhas'],
      'melasma': ['melasma','manchas escuras'],
      'flacidez': ['flacidez','melhora de flacidez'],
      'queda de cabelo': ['queda de cabelo','calvície','tratamento capilar'],
      'olheiras': ['olheiras','tratamento de olheiras']
    }
  };

  const handleBuscaIntencao = () => {
    const q = (buscaIntencao||'').toLowerCase();
    if (!q.trim()) return;
    // Procedimentos
    for (const [canon, syns] of Object.entries(KEYWORDS.procedimentos)) {
      if (syns.some(s => q.includes(s))) {
        const base = createPageUrl('Mapa');
        window.location.href = `${base}?aba=anuncios&procedimento=${encodeURIComponent(canon)}`;
        return;
      }
    }
    // Tratamentos
    for (const [canon, syns] of Object.entries(KEYWORDS.tratamentos)) {
      if (syns.some(s => q.includes(s))) {
        const base = createPageUrl('Mapa');
        window.location.href = `${base}?aba=anuncios&tratamento=${encodeURIComponent(canon)}`;
        return;
      }
    }
    // Fallback: leva ao mapa com busca livre
    const base = createPageUrl('Mapa');
    window.location.href = `${base}?aba=anuncios&busca=${encodeURIComponent(q)}`;
  };

  const handleAcessarDrBeleza = () => {
    window.open("https://dr-beleza-ai.base44.app", "_blank");
  };

  const handleContratarPatrocinador = (whatsappMessage) => {
    if (!user) {
      setTipoLoginPrompt("patrocinador");
      setMostrarLoginPrompt(true);
      return;
    }
    window.open(whatsappMessage, '_blank');
  };

  const BEAUTY_SAFE_WA = "https://wa.me/5521980343873?text=";

  const logBeautySafe = async (action, details = "") => {
    try {
      await base44.entities.BeautySafeClick.create({
        user_email: user?.email || "",
        action,
        page: "Inicio",
        details
      });
    } catch {}
  };

  const handleBeautySafeWhats = async () => {
    await logBeautySafe("cta_whatsapp");
    const msg = encodeURIComponent("Olá! Quero contratar o Beauty Safe junto aos planos do Mapa da Estética.");
    window.open(`${BEAUTY_SAFE_WA}${msg}`, "_blank");
  };

  const handleBeautySafeSolicitar = async () => {
    try {
      await base44.entities.BeautySafeSolicitacao.create({
        user_email: user?.email || "",
        canal: "whatsapp",
        whatsapp_to: "+5521980343873",
        mensagem: "Solicitação Beauty Safe via Home",
        status: "pendente",
        origem_pagina: "Inicio"
      });
    } catch {}
    await logBeautySafe("solicitar");
    const msg = encodeURIComponent("Olá! Solicitei o Beauty Safe pelo site, pode me ajudar?");
    window.open(`${BEAUTY_SAFE_WA}${msg}`, "_blank");
  };

  async function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert('Geolocalização não suportada neste navegador.');
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await resp.json();
        const cidade = data.address.city || data.address.town || data.address.village || data.address.county || '';
        const estado = data.address.state || data.address.region || '';
        const pais = data.address.country || '';
        setGeoInfo({ cidade, estado, pais, lat: latitude, lon: longitude });
        if (!buscaCidade) setBuscaCidade(cidade);
      } catch {}
      setGeoLoading(false);
    }, () => setGeoLoading(false));
  }

  const handleAgendar = (item) => {
    if (!user) {
      setTipoLoginPrompt("agendar");
      setMostrarLoginPrompt(true);
      return;
    }
    setProdutoAgendar(item);
    setAgendarOpen(true);
  };

  const { data: programas12m = [], isLoading: loadingProgramas } = useQuery({
    queryKey: ['programas-12m', visaoAtual],
    queryFn: async () => await base44.entities.Produto.filter({ programa_12_meses: true, status: 'ativo' }, '-created_date', 6),
    enabled: !!visaoAtual && visaoAtual === 'paciente',
    initialData: [],
  });

  const isAdmin = user?.role === 'admin';
  const isPaciente = visaoAtual === 'paciente';
  const isProfissional = visaoAtual === 'profissional' || visaoAtual === 'patrocinador';
  const isPatrocinador = visaoAtual === 'patrocinador';

  // LOADING STATE
  if (!visaoAtual) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isProfissional ? 'theme-pro' : 'theme-paciente'}`}>
      <TermosCondicoes />
      <style>{`
        .theme-pro, .theme-paciente { background-color: var(--bg); color: var(--text); }
        .theme-pro { --primary: #F7D426; --text: #2C2C2C; --bg: #ffffff; }
        .theme-paciente { --primary: #F7D426; --text: #2C2C2C; --bg: #ffffff; }
      `}</style>
      <OnboardingModal 
        open={mostrarOnboarding} 
        onComplete={handleOnboardingComplete}
        onClose={handleOnboardingClose}
      />
      <SeletorTipoUsuario
        open={mostrarSeletorTipo}
        onClose={() => setMostrarSeletorTipo(false)}
        user={user}
        onSuccess={handleTipoUsuarioSuccess}
      />

      {/* ADMIN DEBUG (opcional - remover depois) */}
      {isAdmin && (
        <div className="bg-orange-100 text-orange-900 p-2 text-center text-xs font-mono">
          👑 ADMIN MODE - Visão Atual: {visaoAtual?.toUpperCase()}
        </div>
      )}

      {/* Netflix Experience - Hero + Autoridade + Validação */}


      {/* VISÃO PACIENTE OU NÃO LOGADO */}
      {isPaciente && (
        <>
          {/* Calendário / Relógio */}
          <div className="bg-white/90 backdrop-blur sticky top-[60px] z-30 border-b">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm text-gray-700">
              <div className="font-semibold">
                {agora.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
                {' • '}
                {agora.toLocaleTimeString('pt-BR')}
              </div>
              <div className="text-[#F7D426] font-medium">Cuide de você hoje. O melhor momento é agora ✨</div>
            </div>
          </div>

          {/* Hero Section - MOBILE OPTIMIZED */}
          <motion.section initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}}
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
                <div className="flex flex-col gap-3">
                  <div className="relative">
                    <Input
                      placeholder='O que você gostaria de melhorar? Ex: "quero fazer botox", "tratar estrias", "limpeza de pele"'
                      value={buscaIntencao}
                      onChange={(e) => setBuscaIntencao(e.target.value)}
                      onKeyDown={(e)=>{ if(e.key==='Enter') handleBuscaIntencao(); }}
                      className="h-12 text-gray-900 border-gray-200 pr-28"
                    />
                    <Button onClick={handleBuscaIntencao} className="absolute right-1 top-1 h-10 px-5 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]">Buscar</Button>
                  </div>
                  <p className="text-xs text-gray-600">Dica: digite sua intenção em linguagem natural e nós encontramos o procedimento/tratamento para você.</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 md:mt-8 flex flex-wrap justify-center gap-1.5 sm:gap-2 px-4">
                <span className="text-white/80 text-xs sm:text-sm w-full sm:w-auto text-center mb-1.5 sm:mb-0">Sugestões:</span>
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

            {/* CTA educativo: Profissionais regulamentados */}
            <div className="mt-6 max-w-3xl mx-auto text-center px-4">
              <p className="text-sm sm:text-base text-white mb-1 font-semibold">
                Não sabe qual profissional pode realizar o procedimento que você deseja?
              </p>
              <p className="text-xs sm:text-sm text-white/90 mb-4">
                Veja quais especialistas são autorizados de acordo com os conselhos profissionais da saúde.
              </p>
              <Button
                className="h-12 px-6 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-extrabold shadow-xl hover:shadow-2xl border-2 border-[#2C2C2C] transition-transform hover:-translate-y-0.5"
                onClick={() => document.getElementById('profissionais-regulamentados')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              >
                <span className="mr-2">🔎</span>
                Descubra qual profissional pode realizar seu procedimento
              </Button>
            </div>
          </motion.section>







          {/* Banner Rotativo Topo */}
          <BannerRotativo posicao="home_topo" />

          {/* Eventos Próximos (Paciente) */}
          {eventosVisiveisHome.length > 0 && (
            <section className="py-8">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5"/> Eventos Próximos
                  </h2>
                  <a href={createPageUrl('Mapa')} className="text-sm text-[#2C2C2C] font-semibold hover:text-[#F7D426]">Ver no mapa →</a>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventosVisiveisHome.map(ev => (
                    <div key={ev.id} className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4"/>
                        <span>{new Date(ev.data_hora).toLocaleString('pt-BR')}</span>
                      </div>
                      <h3 className="font-bold text-lg mt-2 line-clamp-2">{ev.titulo}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{ev.descricao}</p>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-600"><MapPin className="w-4 h-4"/>{ev.cidade}{ev.estado?`, ${ev.estado}`:''}</span>
                        <span className="font-semibold">{ev.preco_tipo === 'pago' ? `R$ ${Number(ev.preco_valor||0).toFixed(2)}` : 'Grátis'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Beauty Safe - Proteção Civil para Pacientes */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 shadow flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-10 h-10 text-blue-700" />
                </div>
                <div className="flex-1">
                  <Badge className="mb-2 bg-blue-100 text-blue-800">Novo • Beauty Safe</Badge>
                  <h2 className="text-2xl font-bold text-gray-900">Proteção Civil para Pacientes</h2>
                  <p className="text-gray-700 mt-1">Proteção e orientação para pacientes: entenda seus direitos, cheque credenciais do profissional, licenças e ambiente clínico, exija consentimento informado e siga recomendações de preparo e pós-procedimento. Nosso time ajuda você a tomar decisões seguras antes de contratar qualquer serviço estético.</p>
                  <p className="text-gray-600 text-sm mt-1">Canal direto para tirar dúvidas e receber recomendações de segurança. Fale conosco pelo WhatsApp.</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button onClick={handleBeautySafeWhats} className="bg-green-600 hover:bg-green-700 text-white">
                      <Phone className="w-4 h-4 mr-2" /> Falar no WhatsApp
                    </Button>
                    <Button variant="outline" onClick={handleBeautySafeSolicitar} className="border-2">
                      Solicitar Beauty Safe
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>







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

          {/* Programas Spa da Pele (12 meses) - visível para pacientes */}
          {isPaciente && (
            <section className="py-12 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-8">
                  <Badge className="mb-3 bg-amber-100 text-amber-800">Programas Anuais</Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Programas de Tratamento Estético por 12 Meses</h2>
                  <p className="text-gray-700">Protocolos completos planejados por profissionais para acompanhar sua evolução ao longo do ano.</p>
                  <p className="text-gray-600 text-sm mt-2">Alguns tratamentos estéticos funcionam melhor quando realizados de forma programada. Esses programas organizam seu acompanhamento durante 12 meses, com avaliações periódicas e protocolos definidos por especialistas.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(programas12m.length ? programas12m : [
                    { id:'checkup-360', nome:'Checkup 360', descricao:'Avaliação completa e plano personalizado de 12 meses.', categoria:'Serviços para Pacientes', imagens:[], programa_12_meses:true },
                    { id:'checkup-da-pele', nome:'Checkup da Pele', descricao:'Protocolos do Spa da Pele por 12 meses com acompanhamento.', categoria:'Serviços para Pacientes', imagens:[], programa_12_meses:true }
                  ]).map((p)=> (
                    <Card key={p.id || p.nome} className="border-none shadow-lg hover:shadow-xl transition-all overflow-hidden">
                      <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {p.imagens && p.imagens.length > 0 ? (
                          <img src={p.imagens[0]} alt={p.nome} className="w-full h-full object-cover object-center" />
                        ) : (
                          <div className="text-5xl">🧖‍♀️</div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">{p.categoria || 'Serviços para Pacientes'}</Badge>
                          <Badge className="bg-amber-100 text-amber-800">Programa 12 meses</Badge>
                        </div>
                        <h3 className="font-bold text-lg mb-1 line-clamp-2">{p.nome}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">{p.descricao}</p>
                        <div className="flex items-center justify-between">
                          <Button
                            onClick={() => {
                              const base = 'https://wa.me/5521980343873';
                              const nome = (p.nome || '').toLowerCase();
                              const msg = nome.includes('checkup 360')
                                ? 'Ol%C3%A1!%0AVim%20pelo%20Mapa%20da%20Est%C3%A9tica%20e%20gostaria%20de%20agendar%20o%20Checkup%20360%20%E2%80%93%20Avalia%C3%A7%C3%A3o%20completa%20com%20planejamento%20de%20tratamentos%20por%2012%20meses.%0A%0APoderia%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F'
                                : nome.includes('checkup da pele')
                                ? 'Ol%C3%A1!%0AVim%20pelo%20Mapa%20da%20Est%C3%A9tica%20e%20gostaria%20de%20agendar%20o%20Checkup%20da%20Pele%20%E2%80%93%20Programa%20de%20acompanhamento%20do%20Spa%20da%20Pele%20por%2012%20meses.%0A%0APoderia%20me%20passar%20mais%20informa%C3%A7%C3%B5es%3F'
                                : encodeURIComponent(`Olá! Vim pelo Mapa da Estética e gostaria de agendar o programa ${p.nome || 'de 12 meses'}. Poderia me passar mais informações?`);
                              window.open(`${base}?text=${msg}`, '_blank');
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                          >
                            Agendar via WhatsApp
                          </Button>

                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Banner Rotativo Meio */}
          <BannerRotativo posicao="home_meio" />



          {/* Anúncios em Destaque */}


          {/* Wellness Planner — Destaque */}
          <section className="py-10 bg-gradient-to-r from-[#F7D426] to-[#FFE066]">
            <div className="max-w-7xl mx-auto px-4">
              <Card className="border-none shadow-2xl bg-white overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2">
                    <div className="relative h-64 md:h-full bg-white flex items-center justify-center p-4">
                      <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/99c3e2f47_ChatGPTImage12demarde202611_48_09.png" alt="Wellness Planner" className="max-w-full h-full object-contain object-center" />
                    </div>
                    <div className="p-6 md:p-10">
                      <Badge className="mb-3 bg-[#F7D426] text-[#2C2C2C] border-none font-bold">Wellness Planner</Badge>
                      <h2 className="text-3xl md:text-4xl font-bold text-[#2C2C2C]">Planeje sua Jornada de Beleza</h2>
                      <p className="text-gray-700 mt-3 text-base md:text-lg">Descubra quais tratamentos fazem sentido para você e encontre profissionais dentro do seu orçamento.</p>
                      <p className="text-gray-600 mt-2 text-sm md:text-base">O Wellness Planner ajuda você a organizar seus objetivos estéticos com segurança e planejamento. Você informa quais tratamentos deseja realizar e quanto pretende investir; nós recomendamos profissionais compatíveis com sua faixa de investimento.</p>

                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="flex items-start gap-2"><span className="text-2xl">🧭</span><div><p className="font-semibold text-sm">Planejamento inteligente</p><p className="text-xs text-gray-600">Metas claras ao longo do ano</p></div></div>
                        <div className="flex items-start gap-2"><span className="text-2xl">💸</span><div><p className="font-semibold text-sm">Compatível com seu orçamento</p><p className="text-xs text-gray-600">Sem surpresas no preço</p></div></div>
                        <div className="flex items-start gap-2"><span className="text-2xl">🏥</span><div><p className="font-semibold text-sm">Profissionais qualificados</p><p className="text-xs text-gray-600">Recomendações confiáveis</p></div></div>
                      </div>

                      <a href={createPageUrl('PlannerWellness')} className="inline-block mt-6">
                        <Button size="lg" className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold shadow-xl">
                          Criar meu Wellness Planner
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Banner Rotativo Rodapé */}
          <BannerRotativo posicao="home_rodape" />

          {/* CTA Profissionais */}
          <section className="py-12 sm:py-16 md:py-20 bg-[#2C2C2C] text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 px-2">
                Você é um profissional da estética?
              </h2>
              <p className="text-lg sm:text-xl mb-6 sm:mb-8 text-white/90 px-4">
                Cadastre-se gratuitamente e comece a receber clientes hoje mesmo!
              </p>
              <Link to={createPageUrl("CadastrarAnuncio")}>
                <Button size="lg" className="w-full sm:w-auto bg-[#F7D426] text-[#2C2C2C] hover:bg-[#E5C215] font-semibold shadow-xl">
                  Cadastrar Meu Anúncio Grátis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </section>
        </>
      )}

      {/* VISÃO PROFISSIONAL/PATROCINADOR */}
      {isProfissional && (
        <>
          {/* Barra Calendário/Mensagem - Profissional/Patrocinador */}
          <div className="bg-white/90 backdrop-blur sticky top-[60px] z-30 border-b">
            <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-sm text-gray-700">
              <div className="font-semibold">
                {agora.toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long', year:'numeric' })}
                {' • '}
                {agora.toLocaleTimeString('pt-BR')}
              </div>
              <div className="text-[#F7D426] font-medium">Seu trabalho transforma vidas — bora crescer hoje ✨</div>
            </div>
          </div>
          {/* Hero imagem saúde/bem-estar */}
          <section className="relative py-10 md:py-14 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="relative overflow-hidden rounded-2xl shadow-xl">
                <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1600&q=80" alt="Saúde e bem-estar" className="w-full h-32 md:h-44 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                <div className="absolute left-6 top-6 text-white">
                  <p className="text-xs md:text-sm mb-1">Bem-vindo, profissional</p>
                  <h2 className="text-2xl md:text-3xl font-bold">Cuide da sua presença digital</h2>
                </div>
              </div>
            </div>
          </section>
          {isPatrocinador && (
            <DashboardPatrocinadorHome />
          )}

          {/* Eventos Próximos (Profissional) */}
          {eventosVisiveisHome.length > 0 && (
            <section className="py-8 bg-white">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5"/> Eventos Próximos
                  </h2>
                  <a href={createPageUrl('Mapa')} className="text-sm text-[#2C2C2C] font-semibold hover:text-[#F7D426]">Ver no mapa →</a>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventosVisiveisHome.map(ev => (
                    <div key={ev.id} className="border rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4"/>
                        <span>{new Date(ev.data_hora).toLocaleString('pt-BR')}</span>
                      </div>
                      <h3 className="font-bold text-lg mt-2 line-clamp-2">{ev.titulo}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{ev.descricao}</p>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span className="flex items-center gap-1 text-gray-600"><MapPin className="w-4 h-4"/>{ev.cidade}{ev.estado?`, ${ev.estado}`:''}</span>
                        <span className="font-semibold">{ev.preco_tipo === 'pago' ? `R$ ${Number(ev.preco_valor||0).toFixed(2)}` : 'Grátis'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Proteção Civil - Profissionais */}
          <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6 shadow flex flex-col md:flex-row items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-10 h-10 text-blue-700" />
                </div>
                <div className="flex-1">
                  <Badge className="mb-2 bg-blue-100 text-blue-800">Novo • Beauty Safe</Badge>
                  <h2 className="text-2xl font-bold text-gray-900">Proteção Civil para Profissionais</h2>
                  <p className="text-gray-700 mt-1">Trabalhe com segurança jurídica em procedimentos e serviços estéticos: consentimentos, registros e melhores práticas.</p>
                  <p className="text-gray-600 text-sm mt-1">Orientação para evitar riscos e resguardar sua atuação. Fale com nossa equipe.</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button onClick={handleBeautySafeWhats} className="bg-green-600 hover:bg-green-700 text-white">
                      <Phone className="w-4 h-4 mr-2" /> Falar no WhatsApp
                    </Button>
                    <Button variant="outline" onClick={handleBeautySafeSolicitar} className="border-2">
                      Solicitar Beauty Safe
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Resumo dos Anúncios */}
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
                        <Badge className="mb-2 bg-pink-100 text-pink-800">{anuncio.categoria}</Badge>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">{anuncio.titulo}</h3>
                        
                        {anuncio.cidade && anuncio.estado && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                            <MapPin className="w-4 h-4" />
                            <span>{anuncio.cidade}, {anuncio.estado}</span>
                          </div>
                        )}

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


          <section className="py-8 bg-white">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold mb-3">Novidade</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Radares de Tendências e Frequência</h2>
              <p className="text-gray-600 mb-6">Veja as tendências do mercado e relatórios dos seus anúncios em tempo real.</p>
              <a href={createPageUrl("Radares")}>
                <Button className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] border-2 border-[#2C2C2C]">Acessar RABI</Button>
              </a>
            </div>
          </section>

          {/* Navegação rápida (somente profis) */}
          <div className="sticky top-[60px] z-40 bg-white/80 backdrop-blur border-b">
            <div className="max-w-7xl mx-auto px-4 py-2 overflow-x-auto">
              <div className="flex gap-2 text-xs md:text-sm">
                {[
                  {id:'meus-anuncios',label:'Meus Anúncios'},
                  {id:'curiosidades-mes',label:'Curiosidades'},
                  {id:'tutorial',label:'Tutoriais'},
                ].map(i => (
                  <button key={i.id} onClick={()=>document.getElementById(i.id)?.scrollIntoView({behavior:'smooth'})} className="px-3 py-1 rounded-full border hover:bg-[#FFF9E6]" data-active={false}>{i.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Centro de Inteligência Estratégica (RABI) */}
          <motion.section initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-white border-2 border-[#F7D426] rounded-2xl p-6 shadow">
                <RabiHomeTeaser />
              </div>
            </div>
          </motion.section>

          {/* Marketplace com dados analíticos */}
          <motion.section initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="py-8">
            <div className="max-w-7xl mx-auto px-4">
              <div className="bg-white border-2 border-[#2C2C2C] rounded-2xl p-6 shadow">
                <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">Mapa da Estética: marketplace com dados analíticos</h2>
                <p className="text-gray-700 mb-3">Somos um marketplace especializado em estética, com inteligência e dados analíticos para profissionais: acompanhe tendências, buscas e desempenho, e conecte-se a pacientes e parceiros.</p>
                <p className="text-gray-700 mb-3">Profissionais podem anunciar <strong>equipamentos e produtos</strong> no Mapa da Estética: publique na página <strong>Produtos</strong> ou venda via <strong>Hub/Loja de Pontos</strong> e alcance mais clientes.</p>
                <p className="text-gray-700">Oferecemos também um formato de <strong>dropshipping</strong>: o fornecedor envia direto ao cliente e nosso site atua como <em>intermediário</em>, simplificando operação e ampliando repertório de itens.</p>
              </div>
            </div>
          </motion.section>

          {/* Aesthetic Radar */}


          {/* Proteção Civil para Profissionais (Beauty Safe) */}


          {/* Meus Anúncios (âncora) já existe abaixo */}

          {/* Curiosidades (profissional) */}
          <motion.section id="curiosidades-mes" initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <CuriosidadesMes />
            </div>
          </motion.section>

          {/* Anúncios em Destaque para profissionais */}
          {anunciosDestaque.length > 0 && (
            <motion.section initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="py-12 sm:py-16 bg-white" id="meus-anuncios">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-8 sm:mb-12">
                  <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">⭐ Profissionais em Destaque</Badge>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
                    Veja Como Profissionais Se Destacam
                  </h2>
                  <p className="text-gray-600 text-base sm:text-lg px-4">
                    Conheça profissionais de sucesso que usam nossa plataforma
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-gray-500">
                    <strong>Exemplos de anúncios</strong> — visualize como seu perfil aparecerá para os usuários.
                  </p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {anunciosDestaque.slice(0, 6).map((anuncio) => (
                    <CardAnuncio key={anuncio.id} anuncio={anuncio} isPreview />
                  ))}
                </div>
                <div className="text-center mt-8">
                  <Link to={createPageUrl("Anuncios")}>
                    <Button size="lg" variant="outline" className="border-2 border-[#2C2C2C] text-[#2C2C2C] hover:bg-[#FFF9E6]">
                      Ver Todos os Anúncios
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.section>
          )}





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

          <section id="tutorial"><Tutorial /></section>
        </>
      )}

      {/* TUTORIAIS - PROFISSIONAL APENAS */}
      {isProfissional && (
        <SecaoTutoriais tipoUsuario={visaoAtual} />
      )}

      {/* Blog - AMBOS */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
              <span className="text-xs sm:text-sm font-semibold text-pink-600 uppercase tracking-wide">Fique por dentro</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">Do Universo da Estética</h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-6 sm:mb-8 px-4">Veja 3 notícias em destaque e leia mais no nosso blog.</p>
            <div className="grid sm:grid-cols-3 gap-4 max-w-5xl mx-auto mb-6">
              {[
                {t:'Novas técnicas de skinbooster ganham espaço no Brasil',img:'https://images.unsplash.com/photo-1615220368126-29e7d9a3c2e4?w=800&q=80'},
                {t:'Depilação a laser cresce entre o público masculino',img:'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80'},
                {t:'Dermatologistas alertam sobre uso de ácidos no verão',img:'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&q=80'}
              ].map((n,i)=> (
                <a key={i} href={createPageUrl('Blog')} className="group block overflow-hidden rounded-xl border bg-white hover:shadow-lg">
                  <img src={n.img} alt={n.t} className="h-40 w-full object-cover group-hover:scale-105 transition-transform"/>
                  <div className="p-3 text-left">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-pink-600">{n.t}</p>
                    <p className="text-xs text-gray-500 mt-1">Leia no nosso Blog</p>
                  </div>
                </a>
              ))}
            </div>
            <Link to={createPageUrl('Blog')}>
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white">
                Acessar Blog
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        </section>

        

        {/* ECOSSISTEMA - AMBOS */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold">
              🌟 Ecossistema Completo
            </Badge>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
              Mais Produtos para Você
            </h2>
            <p className="text-gray-600 text-base sm:text-lg px-4 max-w-2xl mx-auto">
              Acesse com o mesmo login do Mapa da Estética
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <Card className="border-2 border-purple-200 hover:border-purple-400 transition-all hover:shadow-xl cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Clube da Beleza</h3>
                    <Badge className="mt-1 bg-purple-100 text-purple-800">Benefícios Exclusivos</Badge>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Descontos de até 25% em estabelecimentos parceiros, pontos, recompensas e benefícios exclusivos.
                </p>
                <a
                  href="https://clube-da-beleza.base44.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                    Acessar Clube da Beleza
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="border-2 border-pink-200 hover:border-pink-400 transition-all hover:shadow-xl cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Clube +</h3>
                    <Badge className="mt-1 bg-pink-100 text-pink-800">Gestão Completa</Badge>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Sistema completo de gestão para clínicas e consultórios de estética. Agenda, financeiro e muito mais.
                </p>
                <a
                  href="https://clube-mais.base44.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white">
                    Acessar Clube +
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-200 hover:border-yellow-400 transition-all hover:shadow-xl cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">DermaHelp</h3>
                    <Badge className="mt-1 bg-yellow-100 text-yellow-800">Conteúdo e Dicas</Badge>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Conteúdo educativo e apoio para cuidados com a pele e estética.
                </p>
                <a href="https://dermahelp.base44.app" target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white">
                    Acessar DermaHelp
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
            </div>
            </div>
            </section>

      {/* Como funciona o Mapa da Estética */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Como funciona o Mapa da Estética</h2>
          <p className="text-gray-700 max-w-4xl">
            O Mapa da Estética é um mapa interativo onde você pode descobrir profissionais e estabelecimentos especializados próximos de você.
            Cada profissional ou clínica pode anunciar seus serviços dentro da plataforma, aparecendo tanto nos resultados de busca quanto diretamente no mapa interativo.
          </p>
          <ul className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-800">
            <li className="bg-gray-50 border rounded-lg p-3">• encontrar especialistas próximos</li>
            <li className="bg-gray-50 border rounded-lg p-3">• visualizar avaliações</li>
            <li className="bg-gray-50 border rounded-lg p-3">• ver os procedimentos oferecidos</li>
            <li className="bg-gray-50 border rounded-lg p-3">• acessar localização e rotas diretamente pelo Google Maps</li>
          </ul>
        </div>
      </section>

      <RegulamentacaoEstetica />

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

          <PatrocinadoresCarousel />

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
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white">
                  <Instagram className="w-4 h-4 text-pink-600" />
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

      {/* Modal Filtros Avançados */}
      <ModalFiltrosAvancados
        open={openFiltrosAvancados}
        onOpenChange={setOpenFiltrosAvancados}
        valores={filtrosAvancados}
        onChange={setFiltrosAvancados}
        onApply={handleBuscar}
      />

      {/* Modal de Login Prompt */}
      <LoginPromptModal
        open={mostrarLoginPrompt}
        onClose={() => setMostrarLoginPrompt(false)}
        pageName={tipoLoginPrompt}
      />

      {/* Modal de Agendamento */}
      <AgendamentoModal
        open={agendarOpen}
        onClose={(ok) => { setAgendarOpen(false); setProdutoAgendar(null); if (ok) alert('Agendamento confirmado!'); }}
        produto={produtoAgendar}
      />

      {/* Modal de Comparação */}
      <Dialog open={mostrarComparacao} onOpenChange={setMostrarComparacao}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
                      <p className="text-xs text-green-600 mt-1">Dr da Beleza + Assistentes</p>
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
                  href={`https://wa.me/5521980343873?text=${encodeURIComponent("Olá! Vi a comparação e quero saber mais sobre os planos do Mapa da Estética!")}`}
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