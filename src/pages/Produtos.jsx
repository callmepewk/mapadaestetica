import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ImageWithLoader from "../components/common/ImageWithLoader";
import AgendamentoModal from "../components/produtos/AgendamentoModal";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Gift,
  TrendingUp,
  Award,
  Check,
  ArrowLeft,
  ArrowRight,
  Crown,
  DollarSign,
  Plus, // Added Plus icon
  Trash2, // New import
  Send // New import
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Added AnimatePresence import
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import LoginPromptModal from "../components/home/LoginPromptModal";
import DesignChatbot from "../components/design/DesignChatbot";
import ProdutoDetalhesDialog from "../components/produtos/ProdutoDetalhesDialog";

const categorias = [
  "Todas",
  "Especialidades Técnicas e Procedimentais (Estética Profissional)",
  "Técnicas Avançadas",
  "Especialidades Relacionadas à Saúde / Ciência",
  "Áreas Complementares / Especializações de Mercado",
  "Outros"
];

const servicosContrataveis = [
  // SERVIÇOS PARA PROFISSIONAIS (contato via WhatsApp)
  {
    id: "criacao-webapp",
    nome: "Criação de Web‑App sob medida",
    descricao: "Construímos um web‑app completo (painel, cadastro, IA integrada, mapas, pagamentos) para sua clínica/negócio, otimizado para conversão e pronto para escalar.",
    categoria: "Áreas Complementares / Especializações de Mercado",
    tipo_publico: "profissional",
    tipo: "servico",
    preco: 0,
    preco_texto: "Fale com a equipe",
    imagens: [],
    whatsappNumero: "54991554136"
  },
  {
    id: "site-profissional-contato",
    nome: "Desenvolvimento de Site Profissional",
    descricao: "Site institucional moderno, responsivo e veloz, com SEO, páginas de serviços, WhatsApp e agenda integrados.",
    categoria: "Áreas Complementares / Especializações de Mercado",
    tipo_publico: "profissional",
    tipo: "servico",
    preco: 0,
    preco_texto: "Fale com a equipe",
    imagens: [],
    whatsappNumero: "54991554136"
  },

  {
    id: "checkup-da-pele",
    nome: "Checkup da Pele",
    descricao: "Checkup dermatológico com protocolos do Spa da Pele (12 meses).",
    categoria: "Serviços para Pacientes",
    tipo_publico: "paciente",
    preco: 0,
    preco_texto: "Consultar",
    imagens: ["https://images.unsplash.com/photo-1556229010-aa3f7ff66b42?w=800&q=80"],
    programa_12_meses: true,
    tratamentos_inclusos_nomes: [],
    em_destaque: true,
    status: 'ativo',
    requer_assinatura: false
  },
  // SERVIÇOS PARA PROFISSIONAIS
  {
    id: "google-negocios",
    nome: "Criação de Google Negócios Personalizado",
    descricao: "Tenha seu perfil profissional completo no Google com otimização SEO, fotos, descrições e tudo configurado para atrair mais clientes.",
    categoria: "Serviços Contratáveis",
    tipo_publico: "profissional",
    preco: 0,
    preco_texto: "Recurso de Assinantes Clube da Beleza",
    imagens: ["https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80"],
    beneficios: [
      "Criação completa do perfil",
      "Otimização SEO local",
      "Upload de fotos profissionais",
      "Configuração de horários e serviços",
      "Integração com seu site/WhatsApp",
      "Suporte pós-criação"
    ],
    em_destaque: true,
    status: 'ativo',
    requer_assinatura: true
  },
  {
    id: "geracao-imagens",
    nome: "Geração de Imagens Profissionais",
    descricao: "Imagens de alta qualidade geradas para seu anúncio. Imagens únicas, profissionais e personalizadas para destacar seu negócio.",
    categoria: "Serviços Contratáveis",
    tipo_publico: "profissional",
    preco: 50,
    preco_texto: "A partir de R$ 50",
    imagens: ["https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe2/f0cb8c67f_geraodeimagem.png"],
    beneficios: [
      "Até 10 imagens personalizadas",
      "Alta resolução e qualidade",
      "Entrega em até 24h",
      "Revisões ilimitadas",
      "Imagens exclusivas para seu negócio",
      "Suporte técnico incluso"
    ],
    em_destaque: true,
    status: 'ativo',
    requer_assinatura: false
  },
  {
    id: "marketing-digital",
    nome: "Gestão de Marketing Digital",
    descricao: "Gerenciamento completo das suas redes sociais e estratégias de marketing digital para alavancar seu negócio.",
    categoria: "Serviços Contratáveis",
    tipo_publico: "profissional",
    preco: 0,
    preco_texto: "Recurso de Assinantes Clube da Beleza",
    imagens: ["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80"],
    beneficios: [
      "Gestão de Instagram e Facebook",
      "Criação de posts profissionais",
      "Stories e reels semanais",
      "Estratégia de conteúdo",
      "Relatórios mensais",
      "Suporte dedicado"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: true
  },
  {
    id: "site-profissional",
    nome: "Desenvolvimento de Site Profissional",
    descricao: "Site profissional personalizado com design moderno, responsivo e otimizado para conversão de clientes.",
    categoria: "Serviços Contratáveis",
    tipo_publico: "profissional",
    preco: 0,
    preco_texto: "Recurso de Assinantes Clube da Beleza",
    imagens: ["https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80"],
    beneficios: [
      "Design personalizado e responsivo",
      "Integração com redes sociais",
      "Formulário de contato",
      "SEO otimizado",
      "Certificado SSL incluson",
      "Manutenção por 6 meses"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: true
  },
  // Removido: Fotografia Profissional (substituído pelos serviços de Web‑App e Site)
  /* {
    id: "fotografia-profissional",
    nome: "Sessão de Fotografia Profissional",
    descricao: "Sessão fotográfica profissional para capturar seus trabalhos e criar um portfólio impecável.",
    categoria: "Serviços Contratáveis",
    tipo_publico: "profissional",
    preco: 300,
    preco_texto: "R$ 300,00",
    imagens: ["https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80"],
    beneficios: [
      "Até 50 fotos editadas",
      "Fotógrafo especializado",
      "Edição profissional",
      "Alta resolução",
      "Entrega em até 7 dias",
      "Direitos de uso comercial"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: false
  },
  
  // SERVIÇOS PARA PACIENTES
  {
    id: "consulta-estetica",
    nome: "Consulta Estética Online",
    descricao: "Consulta online com profissionais qualificados para orientação sobre tratamentos estéticos ideais para você.",
    categoria: "Serviços para Pacientes",
    tipo_publico: "paciente",
    preco: 150,
    preco_texto: "R$ 150,00",
    imagens: ["https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80"],
    beneficios: [
      "Consulta de 30 minutos",
      "Profissional qualificado",
      "Indicação de tratamentos",
      "Orientação personalizada",
      "Certificado de consulta"
    ],
    em_destaque: true,
    status: 'ativo',
    requer_assinatura: false
  },
  {
    id: "kit-skincare",
    nome: "Kit Skincare Personalizado",
    descricao: "Kit completo de produtos para cuidados com a pele, selecionados especialmente para seu tipo de pele.",
    categoria: "Produtos para Pacientes",
    tipo_publico: "paciente",
    preco: 299,
    preco_texto: "R$ 299,00",
    imagens: ["https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80"],
    beneficios: [
      "4 produtos profissionais",
      "Personalizado para seu tipo de pele",
      "Frete grátis",
      "Rotina de uso inclusa",
      "Suporte dermatológico"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: false
  },
  {
    id: "massagem-relaxante",
    nome: "Massagem Relaxante (60min)",
    descricao: "Sessão completa de massagem relaxante com profissional qualificado para aliviar tensões e estresse.",
    categoria: "Serviços para Pacientes",
    tipo_publico: "paciente",
    preco: 180,
    preco_texto: "R$ 180,00",
    imagens: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80"],
    beneficios: [
      "Duração de 60 minutos",
      "Profissional certificado",
      "Óleos essenciais inclusos",
      "Ambiente climatizado",
      "Música relaxante"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: false
  },
  {
    id: "massagem-terapeutica",
    nome: "Massagem Terapêutica (60min)",
    descricao: "Massagem terapêutica focada em aliviar dores musculares e melhorar a circulação sanguínea.",
    categoria: "Serviços para Pacientes",
    tipo_publico: "paciente",
    preco: 200,
    preco_texto: "R$ 200,00",
    imagens: ["https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=800&q=80"],
    beneficios: [
      "Duração de 60 minutos",
      "Técnicas específicas",
      "Alívio de dores",
      "Melhora da postura",
      "Profissional especializado"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: false
  },
  {
    id: "drenagem-linfatica",
    nome: "Drenagem Linfática (60min)",
    descricao: "Sessão de drenagem linfática para reduzir inchaços, eliminar toxinas e melhorar a circulação.",
    categoria: "Serviços para Pacientes",
    tipo_publico: "paciente",
    preco: 150,
    preco_texto: "R$ 150,00",
    imagens: ["https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80"],
    beneficios: [
      "Duração de 60 minutos",
      "Reduz inchaços",
      "Elimina toxinas",
      "Melhora circulação",
      "Resultados visíveis"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: false
  },
  {
    id: "reflexologia",
    nome: "Sessão de Reflexologia (45min)",
    descricao: "Técnica terapêutica que estimula pontos específicos dos pés para promover bem-estar geral.",
    categoria: "Serviços para Pacientes",
    tipo_publico: "paciente",
    preco: 120,
    preco_texto: "R$ 120,00",
    imagens: ["https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80"],
    beneficios: [
      "Duração de 45 minutos",
      "Alívio de tensões",
      "Melhora do sono",
      "Redução do estresse",
      "Técnica milenar"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: false
  },
  {
    id: "quick-massage",
    nome: "Quick Massage (30min)",
    descricao: "Massagem rápida focada em áreas específicas de tensão, perfeita para o dia a dia corrido.",
    categoria: "Serviços para Pacientes",
    tipo_publico: "paciente",
    preco: 90,
    preco_texto: "R$ 90,00",
    imagens: ["https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80"],
    beneficios: [
      "Duração de 30 minutos",
      "Foco em áreas de tensão",
      "Alívio rápido",
      "Ideal para intervalos",
      "Sem necessidade de trocar de roupa"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: false
  },
  {
    id: "shiatsu",
    nome: "Massagem Shiatsu (60min)",
    descricao: "Técnica japonesa que utiliza pressão dos dedos para equilibrar a energia do corpo.",
    categoria: "Serviços para Pacientes",
    tipo_publico: "paciente",
    preco: 190,
    preco_texto: "R$ 190,00",
    imagens: ["https://images.unsplash.com/photo-1573590330099-d6c7355ec595?w=800&q=80"],
    beneficios: [
      "Duração de 60 minutos",
      "Técnica japonesa autêntica",
      "Equilíbrio energético",
      "Alívio de dores",
      "Profissional certificado"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: false
  }
];

export default function Produtos() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [ordenacao, setOrdenacao] = useState("relevancia");
  const [visibilidadeFiltro, setVisibilidadeFiltro] = useState("todos");
  const [planoFiltro, setPlanoFiltro] = useState("todos");
  const [user, setUser] = useState(null);
  const [tipoBusca, setTipoBusca] = useState('produtos');
  const [mostrarLoginPrompt, setMostrarLoginPrompt] = useState(false);
  const [carrinho, setCarrinho] = useState([]);
  const [faixaPontosFiltro, setFaixaPontosFiltro] = useState('todas');
  const [designOpen, setDesignOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  // Agendamento
  const [agendarOpen, setAgendarOpen] = useState(false);
  const [produtoAgendar, setProdutoAgendar] = useState(null);

  // Carregar carrinho do localStorage
  useEffect(() => {
    const carrinhoSalvo = localStorage.getItem('carrinho_mapa_estetica');
    if (carrinhoSalvo) {
      try {
        setCarrinho(JSON.parse(carrinhoSalvo));
      } catch (e) {
        console.error("Erro ao carregar carrinho:", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Assinar atualizações em tempo real do usuário (pontos/coins etc.)
  useEffect(() => {
    if (!user?.email) return;
    const unsubscribe = base44.entities.User.subscribe((event) => {
      if (event?.data?.email === user.email) {
        setUser(event.data);
      }
    });
    return unsubscribe;
  }, [user?.email]);

  // Função para calcular pontos baseado na faixa de preço
  const calcularPontosPorFaixaPreco = (faixaPreco) => {
    const pontosPorFaixa = {
      '$': 1,
      '$$': 5,
      '$$$': 10,
      '$$$$': 50,
      '$$$$$': 100
    };
    return pontosPorFaixa[faixaPreco] || 0;
  };

  // Função para determinar faixa de preço baseado no valor
  const determinarFaixaPreco = (preco) => {
    if (preco === null || preco === undefined || isNaN(preco)) return '';
    if (preco <= 500) return '$';
    if (preco <= 1000) return '$$';
    if (preco <= 2000) return '$$$';
    if (preco <= 5000) return '$$$$';
    return '$$$$$';
  };

  const { data: produtosDatabase = [], isLoading: loadingProdutos, refetch: refetchProdutos } = useQuery({
    queryKey: ['produtos-loja'],
    queryFn: async () => {
      const allProdutos = await base44.entities.Produto.filter({ status: 'ativo' });
      console.log("Produtos carregados:", allProdutos); // Debug
      return allProdutos;
    },
    staleTime: 5 * 60 * 1000,
  });

  const isPaciente = user?.tipo_usuario === 'paciente' || !user;
  const isProfissional = user?.tipo_usuario === 'profissional';
  const isAdmin = user?.role === 'admin'; // Added isAdmin

  // Placeholders de exemplo (somente 2 cards demonstrativos)
  const exemplosExposicao = [
    { id: 'placeholder-produto', tipo: 'produto', nome: 'Exemplo de Card de Produto', descricao: 'Aqui seu produto aparece com título, descrição, preço e selos.', categoria: 'Outros', imagens: [] },
    { id: 'placeholder-servico', tipo: 'servico', nome: 'Exemplo de Card de Serviço', descricao: 'Aqui seu serviço aparece com descrição, CTA e indicação de pontos.', categoria: 'Outros', imagens: [] }
  ];

  // Itens disponíveis
  const todosProdutos = [
    ...servicosContrataveis,
    ...produtosDatabase
  ];

  const produtosFiltrados = todosProdutos.filter(produto => {
    const isExclusivo = !!(produto.requer_assinatura || produto.mostrar_tag_clube || produto.beauty_club_exclusivo);

    // Filtro por plano selecionado (lista compatível com string legado)
    const matchPlanoFiltro = (() => {
      if (planoFiltro === 'todos') return true;
      if (Array.isArray(produto.plano_minimo)) return produto.plano_minimo.includes(planoFiltro);
      if (typeof produto.plano_minimo === 'string') return produto.plano_minimo === planoFiltro;
      return true;
    })();

    // Gating por Beauty Club quando aplicável
    if (isExclusivo && produto.beauty_club_minimo) {
      const ordemBC = ['none','basic','pro','exclusive'];
      const userBC = user?.beauty_club_plano || 'none';
      if (ordemBC.indexOf(userBC) < ordemBC.indexOf(produto.beauty_club_minimo)) return false;
    }

    // Gating por plano mínimo (profissionais) – aceita lista
    if (isProfissional && produto.plano_minimo) {
      const ordem = ['free','lite','basico','pro','prime','premium'];
      const idxUser = ordem.indexOf(user?.plano_ativo || 'free');
      if (Array.isArray(produto.plano_minimo) && produto.plano_minimo.length > 0) {
        const idxs = produto.plano_minimo.map(p=>ordem.indexOf(p)).filter(i=>i>=0);
        if (idxs.length && idxUser < Math.min(...idxs)) return false;
      } else if (typeof produto.plano_minimo === 'string') {
        const idxMin = ordem.indexOf(produto.plano_minimo || 'free');
        if (idxUser < idxMin) return false;
      }
    }

    const matchCategoria = categoriaFiltro === "Todas" || produto.categoria === categoriaFiltro;

    // Visibilidade por plano (profissionais)
    if (isProfissional && Array.isArray(produto.visibilidade_por_plano) && produto.visibilidade_por_plano.length > 0) {
      const planoUser = user?.plano_ativo || 'free';
      if (!produto.visibilidade_por_plano.includes(planoUser)) return false;
    }

    // Visibilidade por especialidades (se definido)
    if (Array.isArray(produto.especialidades_alvo) && produto.especialidades_alvo.length > 0) {
      const minhas = Array.isArray(user?.especialidades) ? user.especialidades.map(s=>String(s).toLowerCase()) : [];
      if (minhas.length === 0) return false;
      const alvo = produto.especialidades_alvo.map(s=>String(s).toLowerCase());
      if (!minhas.some(s=>alvo.includes(s))) return false;
    }

    const matchVis = visibilidadeFiltro === 'todos' || (visibilidadeFiltro === 'exclusivo' ? isExclusivo : !isExclusivo);
    const matchBusca = !busca ||
      produto.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      produto.marca?.toLowerCase().includes(busca.toLowerCase());

    // Faixa de pontos (considera apenas produtos com pontos_necessarios definidos)
    let matchFaixaPontos = true;
    if (faixaPontosFiltro !== 'todas') {
      const [min, max] = faixaPontosFiltro.split('-').map((n)=>parseInt(n,10));
      const pts = typeof produto.pontos_necessarios === 'number' ? produto.pontos_necessarios : null;
      if (pts === null) {
        matchFaixaPontos = false;
      } else {
        matchFaixaPontos = pts >= min && pts <= max;
      }
    }

    // Filtrar por tipo de busca (baseado em campo tipo)
    let matchTipo = true;
    if (tipoBusca === 'servicos') {
      matchTipo = (produto.tipo === 'servico') || produto.id?.toString().startsWith('criacao-webapp') || produto.id?.toString().startsWith('site-profissional');
    } else if (tipoBusca === 'produtos') {
      matchTipo = produto.tipo !== 'servico';
    }

    return matchCategoria && matchBusca && matchTipo && matchVis && matchPlanoFiltro && matchFaixaPontos;
  });

  // Define available categories for the filter based on tipoBusca and user type
  const getCategoriasParaFiltro = () => {
    let allowedCategories = ["Todas"];
    if (tipoBusca === 'produtos') {
      // For products, show only "real" product categories
      const productCategories = categorias.filter(cat =>
        cat !== "Serviços Contratáveis" &&
        cat !== "Serviços para Pacientes" &&
        cat !== "Produtos para Pacientes" &&
        cat !== "Todas"
      );
      allowedCategories = [...allowedCategories, ...productCategories];
    } else if (tipoBusca === 'servicos') {
      // For services, show categories relevant to services
      if (isProfissional) {
        allowedCategories = [...allowedCategories, "Serviços Contratáveis"];
      } else { // isPaciente (or default if no user type)
        allowedCategories = [...allowedCategories, "Serviços para Pacientes", "Produtos para Pacientes"];
      }
    }
    return Array.from(new Set(allowedCategories)); // Ensure uniqueness
  };

  const categoriasParaFiltro = getCategoriasParaFiltro();

  // Make sure to reset categoriaFiltro if the available categories change
  React.useEffect(() => {
    if (!categoriasParaFiltro.includes(categoriaFiltro)) {
      setCategoriaFiltro("Todas");
    }
  }, [tipoBusca, categoriasParaFiltro, categoriaFiltro]);

  const handleAdicionarAoCarrinho = (produto) => {
    if (!user) {
      setMostrarLoginPrompt(true);
      return;
    }

    // Adicionar ao carrinho
    const novoCarrinho = [...carrinho, produto];
    setCarrinho(novoCarrinho);
    localStorage.setItem('carrinho_mapa_estetica', JSON.stringify(novoCarrinho));

    // Feedback visual
    alert(`✅ ${produto.nome} foi adicionado ao carrinho!`);
  };

  const handleRemoverItemCarrinho = (index) => {
    const novoCarrinho = carrinho.filter((_, i) => i !== index);
    setCarrinho(novoCarrinho);
    localStorage.setItem('carrinho_mapa_estetica', JSON.stringify(novoCarrinho));
  };

  const finalizarCompra = () => {
    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }
    navigate(createPageUrl("Checkout"));
  };

  const handleContratar = (servico) => {
    if (!user) {
      setMostrarLoginPrompt(true);
      return;
    }

    // Serviços com contato direto via WhatsApp
    if (servico.whatsappNumero) {
      const nome = user?.full_name || 'profissional';
      const texto = `Olá! Tenho interesse em ${servico.nome}. Sou ${nome} (${user?.email||''}). Podemos conversar?`;
      window.open(`https://wa.me/${servico.whatsappNumero}?text=${encodeURIComponent(texto)}`, '_blank');
      return;
    }

    if (servico.preco === 0 || !servico.preco || servico.requer_assinatura) {
      navigate(createPageUrl("SobreNos"));
      return;
    }
    handleAdicionarAoCarrinho(servico);
  };

  const handleAgendar = (item) => {
    if (!user) {
      setMostrarLoginPrompt(true);
      return;
    }
    setProdutoAgendar(item);
    setAgendarOpen(true);
  };

  // Redirecionar menções de pontos para a loja
  const redirectToLojaPontos = () => {
    if (!user) {
      setMostrarLoginPrompt(true);
      return;
    }
    navigate(createPageUrl("LojaPontos"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="mb-6">
              <div className="text-center mb-6">
                <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
                  {tipoBusca === 'produtos' ? "🛍️ Produtos" : "💼 Serviços"}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {tipoBusca === 'produtos'
                    ? "Produtos de Beleza e Estética"
                    : isPaciente ? "Serviços e Consultas" : "Serviços Profissionais"
                  }
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                  {tipoBusca === 'produtos'
                    ? "Encontre produtos de qualidade para cuidar da sua beleza e bem-estar"
                    : isPaciente
                      ? "Encontre serviços e consultas de qualidade"
                      : "Impulsione seu negócio com nossos serviços profissionais"
                  }
                </p>


                <div className="flex gap-3 justify-center flex-wrap">
                  <Button
                    onClick={() => setTipoBusca('produtos')}
                    variant={tipoBusca === 'produtos' ? 'default' : 'outline'}
                    className={tipoBusca === 'produtos' 
                      ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      : "border-2"}
                  >
                    🛍️ Ver Produtos
                  </Button>
                  <Button
                    onClick={() => setTipoBusca('servicos')}
                    variant={tipoBusca === 'servicos' ? 'default' : 'outline'}
                    className={tipoBusca === 'servicos'
                      ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                      : "border-2"}
                  >
                    💼 Ver Serviços
                  </Button>

                  
                  {isAdmin && (
                    <Button
                      onClick={() => navigate(createPageUrl("AdicionarProduto"))}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-2 border-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Produto/Serviço
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* CTA Design Profissional */}
            <Card className="mb-6 border-2 border-purple-200 bg-purple-50">
              <CardContent className="p-5 flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold">Design Profissional de Imagens</h3>
                  <p className="text-sm text-gray-600">Fale com nosso engenheiro de prompt e gere imagens incríveis em 2 etapas. Recurso exclusivo para profissionais Prime/Premium e patrocinadores Platina.</p>
                </div>
                <Button onClick={()=>setDesignOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white">Falar com Equipe de Design</Button>
              </CardContent>
            </Card>

             {/* Banner Informativo - apenas para produtos (imagens bem-estar) */}
             {tipoBusca === 'produtos' && (
              <Card className="mb-8 border-none shadow-lg bg-gradient-to-r from-[#F7D426] to-[#FFE066]">
                <CardContent className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <img src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=640&auto=format&fit=crop" alt="Bem-estar" className="w-24 h-24 rounded-2xl object-cover flex-shrink-0" />
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">
                        Como Funciona o Sistema de Pontos?
                      </h2>
                      <p className="text-[#2C2C2C] mb-3">
                        Cada compra acumula pontos automaticamente. Troque seus pontos por produtos exclusivos ou descontos especiais!
                      </p>
                      <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center text-[#F7D426] font-bold">
                            ✓
                          </div>
                          <span className="text-sm text-[#2C2C2C] font-medium">Ganhe pontos a cada compra</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center text-[#F7D426] font-bold">
                            ✓
                          </div>
                          <span className="text-sm text-[#2C2C2C] font-medium">Resgate produtos exclusivos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#2C2C2C] rounded-full flex items-center justify-center text-[#F7D426] font-bold">
                            ✓
                          </div>
                          <span className="text-sm text-[#2C2C2C] font-medium">Descontos especiais</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={redirectToLojaPontos}
                      size="lg"
                      className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold"
                    >
                      Ver Loja de Pontos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filters */}
            <Card className="p-6 mb-8 shadow-lg border-none">
              <div className="grid md:grid-cols-4 gap-4">
                <Input
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="border-2"
                />

                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Todas as categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasParaFiltro.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={ordenacao} onValueChange={setOrdenacao}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevancia">Mais Relevantes</SelectItem>
                    <SelectItem value="menor_preco">Menor Preço</SelectItem>
                    <SelectItem value="maior_preco">Maior Preço</SelectItem>
                    <SelectItem value="novidades">Novidades</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={visibilidadeFiltro} onValueChange={setVisibilidadeFiltro}>
                 <SelectTrigger className="border-2">
                   <SelectValue placeholder="Visibilidade" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="todos">Todos</SelectItem>
                   <SelectItem value="normal">Conteúdo Normal</SelectItem>
                   <SelectItem value="exclusivo">Exclusivo (Clube/Beauty Club)</SelectItem>
                 </SelectContent>
                </Select>

                <Select value={planoFiltro} onValueChange={setPlanoFiltro}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Plano mínimo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos Planos</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="lite">Lite</SelectItem>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="pro">Pro</SelectItem>
                    <SelectItem value="prime">Prime</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                  </SelectContent>
                </Select>
                </div>

                {/* Faixa de pontos */}
                <div className="mt-4">
                  <Select value={faixaPontosFiltro} onValueChange={setFaixaPontosFiltro}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="Faixa de pontos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas</SelectItem>
                      <SelectItem value="0-100">0–100</SelectItem>
                      <SelectItem value="100-500">100–500</SelectItem>
                      <SelectItem value="500-1000">500–1.000</SelectItem>
                      <SelectItem value="1000-2000">1.000–2.000</SelectItem>
                      <SelectItem value="2000-5000">2.000–5.000</SelectItem>
                      <SelectItem value="5000-10000">5.000–10.000</SelectItem>
                      <SelectItem value="10000-20000">10.000–20.000</SelectItem>
                      <SelectItem value="20000-50000">20.000–50.000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Debug info para admin */}
              {isAdmin && (
                <div className="mt-4 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <p className="text-sm font-semibold text-purple-900">
                    🔧 Debug Admin: {produtosDatabase.length} produtos carregados do banco
                  </p>
                  <Button
                    onClick={() => refetchProdutos()}
                    size="sm"
                    variant="outline"
                    className="mt-2"
                  >
                    Recarregar Produtos
                  </Button>
                </div>
              )}
            </Card>

            {/* Tabela de Pontos por Faixa de Preço */}
            <Card className="mb-8 border-2 border-[#F7D426] bg-gradient-to-br from-[#FFF9E6] to-white shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#F7D426]" />
                  Pontos por Faixa de Preço
                </h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries({ '$': 1, '$$': 5, '$$$': 10, '$$$$': 50, '$$$$$': 100 }).map(([faixa, pontos]) => {
                    const info = ({
                      '$': { texto: 'Até R$ 500', emoji: '💚' },
                      '$$': { texto: 'R$ 500 - R$ 1.000', emoji: '💙' },
                      '$$$': { texto: 'R$ 1.000 - R$ 2.000', emoji: '💛' },
                      '$$$$': { texto: 'R$ 2.000 - R$ 5.000', emoji: '🧡' },
                      '$$$$$': { texto: 'Acima de R$ 5.000', emoji: '❤️' },
                    })[faixa];
                    return (
                      <div key={faixa} className="flex items-center justify-between p-3 bg-white rounded-lg border-2 border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{info.emoji}</span>
                          <div>
                            <p className="font-bold text-gray-900">{faixa}</p>
                            <p className="text-xs text-gray-600">{info.texto}</p>
                          </div>
                        </div>
                        <Badge className="bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]">+{pontos} pts</Badge>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-3">Válido para produtos e serviços.</p>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {produtosFiltrados.length === 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {exemplosExposicao.map((ex) => (
                  <Card key={ex.id} className="overflow-hidden border-dashed border-2 border-gray-300">
                    <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">1200 × 900</span>
                    </div>
                    <CardContent className="p-4">
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300 mb-2">{ex.tipo === 'servico' ? 'Serviço' : 'Produto'}</Badge>
                      <h3 className="font-bold text-lg mb-2">{ex.nome}</h3>
                      <p className="text-sm text-gray-600">{ex.descricao}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produtosFiltrados.map((produto) => {
                  const basePrice = produto.preco_promocional || produto.preco;
                  let descontoPlano = 0;
                  if (isProfissional && produto.descontos_por_plano && user?.plano_ativo) {
                    descontoPlano = produto.descontos_por_plano[user.plano_ativo] || 0;
                  }
                  const precoEfetivo = basePrice ? Math.max(0, basePrice * (1 - (descontoPlano/100))) : basePrice;
                  const faixaPreco = determinarFaixaPreco(precoEfetivo);
                  const pontosGanhos = calcularPontosPorFaixaPreco(faixaPreco);
                  const isExclusivoClube = produto.preco === 0 || !produto.preco || produto.requer_assinatura;

                  return (
                    <Card
                      key={produto.id}
                      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none group"
                    >
                      <div className="relative h-48 bg-gray-100 overflow-x-auto">
                        {/* Imagens focadas em bem-estar */}
                        {produto.imagens && produto.imagens.length > 0 ? (
                          <ImageWithLoader
                            src={produto.imagens[0]}
                            alt={produto.nome}
                            className="w-full h-full object-cover"
                            eager={false}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200">
                            <span className="text-sm font-semibold text-gray-600">1200 × 900</span>
                          </div>
                        )}
                        {produto.em_destaque && (
                           <Badge className="absolute top-2 right-2 bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]">
                             <Star className="w-3 h-3 mr-1 fill-[#2C2C2C]" />
                             Destaque
                           </Badge>
                         )}
                         {isProfissional && (produto.descontos_por_plano?.[user?.plano_ativo||'']||0) > 0 && (
                           <Badge className="absolute bottom-2 right-2 bg-green-600 text-white">- {produto.descontos_por_plano[user.plano_ativo]}%</Badge>
                         )}
                        {isExclusivoClube && (
                          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold">
                            <Crown className="w-3 h-3 mr-1" />
                            EXCLUSIVO
                          </Badge>
                        )}
                        {(produto.beauty_club_exclusivo || produto.beauty_club_minimo === 'exclusive') && (
                          <Badge className="absolute top-2 left-28 bg-yellow-300 text-black font-bold">VIP</Badge>
                        )}
                      </div>

                      <CardContent className="p-4 cursor-pointer" onClick={()=>{ setProdutoSelecionado(produto); setDetalhesOpen(true); }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">
                             {produto.categoria}
                          </Badge>
                          {produto.programa_12_meses && (
                            <Badge className="bg-amber-100 text-amber-800">Programa 12 meses</Badge>
                          )}
                          {produto.tipo_oferta === 'dropshipping' && (
                            <Badge className="bg-teal-100 text-teal-800">Dropshipping</Badge>
                          )}
                          {produto.mostrar_tag_clube || produto?.mostrar_tag_clube && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                              <Crown className="w-3 h-3 mr-1" /> Parceiro Clube+
                            </Badge>
                          )}
                        </div>
                        
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {produto.nome}
                        </h3>

                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {produto.descricao}
                        </p>



                        {produto.programa_12_meses && produto.tratamentos_inclusos_nomes && produto.tratamentos_inclusos_nomes.length > 0 && (
                          <div className="mb-3 space-y-1">
                            {produto.tratamentos_inclusos_nomes.slice(0,3).map((t,i)=>(
                              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="text-green-600">\u2713</span>
                                <span>{t}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {produto.beneficios && (
                          <div className="mb-3 space-y-1">
                            {produto.beneficios.slice(0, 3).map((beneficio, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                <span className="text-green-600">✓</span>
                                <span>{beneficio}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div>
                            {produto.preco > 0 || produto.preco_promocional > 0 ? (
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-gray-900">
                                  R$ {precoEfetivo.toFixed(2)}
                                </span>
                                {produto.preco_promocional && produto.preco && (
                                  <span className="text-sm text-gray-500 line-through">
                                    R$ {produto.preco.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-purple-600">
                                {produto.preco_texto || "Consultar"}
                              </span>
                            )}
                          </div>

                          <Button
                            size="sm"
                            onClick={() => {
                              if (isExclusivoClube) {
                                navigate(createPageUrl("SobreNos"));
                              } else if (produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes") {
                               handleAgendar(produto);
                              } else {
                                handleAdicionarAoCarrinho(produto);
                              }
                            }}
                            className={isExclusivoClube
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                              : (produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" || produto.categoria === "Produtos para Pacientes")
                              ? "bg-blue-600 hover:bg-blue-700 text-white"
                              : "bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
                            }
                          >
                            {isExclusivoClube ? (
                              <>
                                <Crown className="w-4 h-4 mr-1" />
                                Assinar
                              </>
                            ) : (produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" || produto.categoria === "Produtos para Pacientes") ? (
                              <>
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                Adicionar
                              </>
                            )}
                          </Button>
                        </div>

                        {precoEfetivo && !isExclusivoClube && !(produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes") && (
                          <div className="mt-3 pt-3 border-t flex items-center justify-between text-xs">
                            <span className="text-gray-500">Ganhe {pontosGanhos} pontos</span>
                            <span className="text-gray-400">Faixa {faixaPreco}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Info Cards */}
            <div className="mt-12 grid md:grid-cols-3 gap-6">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <Award className="w-12 h-12 text-[#F7D426] mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Qualidade Garantida</h3>
                  <p className="text-sm text-gray-600">
                    Produtos selecionados e testados
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <Star className="w-12 h-12 text-[#F7D426] mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Sistema de Pontos</h3>
                  <p className="text-sm text-gray-600">
                    Acumule pontos em cada compra
                  </p>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <Gift className="w-12 h-12 text-[#F7D426] mx-auto mb-4" />
                  <h3 className="font-bold mb-2">Ofertas Exclusivas</h3>
                  <p className="text-sm text-gray-600">
                    Promoções apenas para membros
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Carrinho */}
          <div className="lg:col-span-1">
            {/* Fixar cartões durante o scroll */}
            <div className="lg:sticky lg:top-24 space-y-6">
            {user && (
              <Card className="border-2 border-yellow-200 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-yellow-400 to-amber-500 text-[#2C2C2C]">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Seus Pontos e Beauty Coins
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]">
                      <Star className="w-3 h-3 mr-1" />
                      {user?.pontos_acumulados || 0} pts
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600 text-white">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {user?.beauty_coins || 0}
                    </Badge>
                  </div>
                </CardContent>
                <CardContent className="pt-0">
                  <Button onClick={redirectToLojaPontos} variant="outline" className="w-full">
                    Ver Loja de Pontos
                  </Button>
                </CardContent>
              </Card>
            )}
            <Card className="border-2 border-pink-200 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-pink-600 to-rose-600 text-white">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Meu Carrinho ({carrinho.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {carrinho.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600">
                      Seu carrinho está vazio
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
                      <AnimatePresence>
                        {carrinho.map((item, index) => {
                          const preco = item.preco_promocional || item.preco || 0;
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-pink-300 transition-colors"
                            >
                              <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {item.imagens && item.imagens.length > 0 ? (
                                  <ImageWithLoader
                                    src={item.imagens?.[0]}
                                    alt={item.nome}
                                    className="max-w-none h-full w-auto object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-2xl">
                                    {item.categoria?.includes("Serviço") || item.categoria?.includes("Paciente") ? "💼" : "🎁"}
                                  </div>
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                                  {item.nome}
                                </h4>
                                <p className="text-xs font-bold text-pink-600">
                                  {preco > 0 ? `R$ ${preco.toFixed(2)}` : item.preco_texto || "Consultar"}
                                </p>
                              </div>

                              <Button
                                onClick={() => handleRemoverItemCarrinho(index)}
                                size="icon"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0 h-8 w-8"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>

                    <div className="border-t pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-pink-600">
                          {carrinho.reduce((sum, item) => sum + (item.preco_promocional || item.preco || 0), 0) > 0
                            ? `R$ ${carrinho.reduce((sum, item) => sum + (item.preco_promocional || item.preco || 0), 0).toFixed(2)}`
                            : "A consultar"
                          }
                        </span>
                      </div>

                      <Button
                        onClick={finalizarCompra}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Finalizar Pedido
                      </Button>

                      <Button
                        onClick={() => {
                          setCarrinho([]);
                          localStorage.removeItem('carrinho_mapa_estetica');
                        }}
                        variant="outline"
                        className="w-full border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Limpar Carrinho
                      </Button>

                      <p className="text-xs text-center text-gray-500 mt-2">
                        Você será redirecionado para o checkout
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Login Prompt */}
      <LoginPromptModal
        open={mostrarLoginPrompt}
        onClose={() => setMostrarLoginPrompt(false)}
        pageName="produtos"
      />

      {/* Chatbot de Design */}
      <DesignChatbot open={designOpen} onClose={()=>setDesignOpen(false)} user={user} />

      {/* Modal de Detalhes do Produto */}
      <ProdutoDetalhesDialog open={detalhesOpen} onClose={()=>setDetalhesOpen(false)} produto={produtoSelecionado} />

      {/* Modal de Agendamento */}
      <AgendamentoModal
        open={agendarOpen}
        onClose={(ok) => {
          setAgendarOpen(false);
          setProdutoAgendar(null);
          if (ok) alert('Agendamento confirmado!');
        }}
        produto={produtoAgendar}
      />
    </div>
  );
}