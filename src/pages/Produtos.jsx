
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DollarSign
} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const categorias = [
  "Todas",
  "Cuidados com a Pele",
  "Maquiagem",
  "Cabelos",
  "Perfumaria",
  "Suplementos",
  "Equipamentos",
  "Acessórios",
  "Serviços Contratáveis",
  "Outros"
];

const servicosContrataveis = [
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
      "Certificado SSL incluso",
      "Manutenção por 6 meses"
    ],
    em_destaque: false,
    status: 'ativo',
    requer_assinatura: true
  },
  {
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
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todas");
  const [user, setUser] = useState(null);
  const [tipoBusca, setTipoBusca] = useState(null); // null, 'produtos', 'servicos'

  React.useEffect(() => {
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

  const { data: produtosDatabase = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.filter({ status: 'ativo' }),
    staleTime: 5 * 60 * 1000,
    initialData: [],
  });

  const isPaciente = user?.tipo_usuario === 'paciente' || !user; // Usuário sem cadastro age como paciente
  const isProfissional = user?.tipo_usuario === 'profissional';

  // Filtrar produtos baseado no tipo de usuário
  const todosProdutos = [
    ...servicosContrataveis.filter(s =>
      isProfissional ? s.tipo_publico === "profissional" : s.tipo_publico === "paciente"
    ),
    ...produtosDatabase
  ];

  const produtosFiltrados = todosProdutos.filter(produto => {
    const matchCategoria = categoriaFiltro === "Todas" || produto.categoria === categoriaFiltro;
    const matchBusca = !busca ||
      produto.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      produto.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
      produto.marca?.toLowerCase().includes(busca.toLowerCase());

    // Filtrar por tipo de busca
    let matchTipo = true;
    if (tipoBusca === 'servicos') {
      matchTipo = produto.categoria === "Serviços Contratáveis" ||
                  produto.categoria === "Serviços para Pacientes" ||
                  produto.categoria === "Produtos para Pacientes";
    } else if (tipoBusca === 'produtos') {
      matchTipo = produto.categoria !== "Serviços Contratáveis" &&
                  produto.categoria !== "Serviços para Pacientes" &&
                  produto.categoria !== "Produtos para Pacientes";
    }

    return matchCategoria && matchBusca && matchTipo;
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
  }, [tipoBusca, categoriasParaFiltro, categoriaFiltro]); // Added categoriaFiltro to dependencies

  const handleContratar = (servico) => {
    const mensagem = `Olá! Tenho interesse em contratar: ${servico.nome}. Gostaria de mais informações sobre valores e como funciona! 💼`;
    const whatsapp = "5531972595643";
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  // Redirecionar menções de pontos para a loja
  const redirectToLojaPontos = () => {
    navigate('/loja-pontos');
  };

  // Função para processar compra de produto
  const handleComprarProduto = async (produto) => {
    if (!user) {
      alert("Faça login para comprar produtos!");
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    const precoFinal = produto.preco_promocional || produto.preco;
    if (!confirm(`Deseja comprar "${produto.nome}" por R$ ${precoFinal.toFixed(2)}?`)) {
      return;
    }

    try {
      // Determinar faixa de preço e calcular pontos
      const faixaPreco = determinarFaixaPreco(precoFinal);
      const pontosGanhos = calcularPontosPorFaixaPreco(faixaPreco);

      // Criar pedido
      await base44.entities.PedidoProduto.create({
        usuario_email: user.email,
        produto_id: produto.id,
        produto_nome: produto.nome,
        tipo: 'produto',
        quantidade: 1,
        valor_total: precoFinal,
        status_pedido: 'pago',
        data_compra: new Date().toISOString()
      });

      // Atualizar pontos do usuário
      const novosPontos = (user.pontos_acumulados || 0) + pontosGanhos;
      await base44.auth.updateMe({ pontos_acumulados: novosPontos });

      // Atualizar estado local
      setUser({ ...user, pontos_acumulados: novosPontos });

      // Mostrar mensagem de sucesso
      alert(`🎉 Compra realizada com sucesso!\n\nVocê ganhou ${pontosGanhos} pontos!\nSaldo atual: ${novosPontos} pontos`);

      // Redirecionar para página de agradecimento
      navigate('/agradecimento-compra');

    } catch (error) {
      console.error("Erro ao processar compra:", error);
      alert("Erro ao processar compra. Tente novamente.");
    }
  };

  // Se não escolheu o tipo de busca ainda, mostra a seleção
  if (tipoBusca === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
              {isPaciente ? "🛍️ Marketplace" : "💼 Loja Profissional"}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que você está procurando?
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Selecione uma opção para começar sua busca
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card Produtos */}
            <Card
              onClick={() => setTipoBusca('produtos')}
              className="border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-purple-500 to-pink-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">🛍️</div>
                    <h3 className="text-2xl font-bold">Produtos</h3>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Buscar Produtos
                </h3>
                <p className="text-gray-600 mb-4">
                  Encontre produtos de beleza, cosméticos, equipamentos e acessórios
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Produtos de qualidade</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Marcas reconhecidas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Ganhe pontos em compras</span>
                  </li>
                </ul>
                <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                  Ver Produtos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Card Serviços */}
            <Card
              onClick={() => setTipoBusca('servicos')}
              className="border-none shadow-xl hover:shadow-2xl transition-all cursor-pointer group overflow-hidden"
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">💼</div>
                    <h3 className="text-2xl font-bold">Serviços</h3>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Contratar Serviços
                </h3>
                <p className="text-gray-600 mb-4">
                  {isProfissional
                    ? "Serviços profissionais para impulsionar seu negócio"
                    : "Consultas, tratamentos e serviços especializados"
                  }
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{isProfissional ? "Google Negócios" : "Consultas online"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{isProfissional ? "Geração de imagens" : "Kits personalizados"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Atendimento especializado</span>
                  </li>
                </ul>
                <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Ver Serviços
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Banner Informativo */}
          <Card className="mt-8 border-none shadow-lg bg-gradient-to-r from-[#F7D426] to-[#FFE066]">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="w-12 h-12 bg-[#2C2C2C] rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-[#F7D426]" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-lg font-bold text-[#2C2C2C] mb-1">
                    Sistema de Pontos
                  </h3>
                  <p className="text-sm text-[#2C2C2C]">
                    Ganhe pontos em cada compra e troque por produtos exclusivos ou descontos especiais!
                  </p>
                </div>
                <Button
                  onClick={redirectToLojaPontos}
                  className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold"
                >
                  Ver Loja de Pontos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header com botão de voltar */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setTipoBusca(null)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="text-center">
            <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
              {tipoBusca === 'produtos' ? "🛍️ Produtos" : "💼 Serviços"}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {tipoBusca === 'produtos'
                ? "Produtos de Beleza e Estética"
                : isPaciente ? "Serviços e Consultas" : "Serviços Profissionais"
              }
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {tipoBusca === 'produtos'
                ? "Encontre produtos de qualidade para cuidar da sua beleza e bem-estar"
                : isPaciente
                  ? "Encontre serviços e consultas de qualidade"
                  : "Impulsione seu negócio com nossos serviços profissionais"
              }
            </p>
          </div>
        </div>

        {/* Banner Informativo */}
        {tipoBusca === 'produtos' && (
          <Card className="mb-8 border-none shadow-lg bg-gradient-to-r from-[#F7D426] to-[#FFE066]">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-16 h-16 bg-[#2C2C2C] rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-8 h-8 text-[#F7D426]" />
                </div>
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
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar produtos..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoriasParaFiltro.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ordenacao} onValueChange={setOrdenacao}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Mais Relevantes</SelectItem>
                <SelectItem value="menor_preco">Menor Preço</SelectItem>
                <SelectItem value="maior_preco">Maior Preço</SelectItem>
                <SelectItem value="mais_avaliados">Mais Avaliados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {produtosFiltrados.length} produto{produtosFiltrados.length !== 1 ? 's' : ''} encontrado{produtosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>
        </Card>

        {/* Products Grid */}
        {produtosFiltrados.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🛍️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Em Breve!
            </h3>
            <p className="text-gray-600 mb-6">
              Estamos preparando produtos incríveis para você. Volte em breve!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#F7D426]" />
                <p className="font-semibold text-sm">Lançamentos em Breve</p>
                <p className="text-xs text-gray-500">Produtos exclusivos</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Gift className="w-8 h-8 mx-auto mb-2 text-[#F7D426]" />
                <p className="font-semibold text-sm">Programa de Pontos</p>
                <p className="text-xs text-gray-500">Acumule e resgate</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Award className="w-8 h-8 mx-auto mb-2 text-[#F7D426]" />
                <p className="font-semibold text-sm">Descontos Exclusivos</p>
                <p className="text-xs text-gray-500">Para membros</p>
              </div>
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => {
              const precoEfetivo = produto.preco_promocional || produto.preco;
              const faixaPreco = determinarFaixaPreco(precoEfetivo);
              const pontosGanhos = calcularPontosPorFaixaPreco(faixaPreco);

              return (
                <Card
                  key={produto.id}
                  className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none cursor-pointer group"
                >
                  <div className="relative h-48 bg-gray-100">
                    {produto.imagens && produto.imagens[0] ? (
                      <img
                        src={produto.imagens[0]}
                        alt={produto.nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
                        {produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" || produto.categoria === "Produtos para Pacientes" ? "💼" : "🛍️"}
                      </div>
                    )}

                    {produto.em_destaque && (
                      <Badge className="absolute top-2 left-2 bg-[#F7D426] text-[#2C2C2C] border-none">
                        Destaque
                      </Badge>
                    )}

                    {produto.preco_promocional && (
                      <Badge className="absolute top-2 right-2 bg-red-500 text-white border-none">
                        Promoção
                      </Badge>
                    )}

                    {produto.requer_assinatura && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
                        <Crown className="w-3 h-3 mr-1" />
                        Clube+
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4">
                    {produto.marca && (
                      <p className="text-xs text-gray-500 mb-1">{produto.marca}</p>
                    )}

                    <h3 className="font-bold text-base mb-2 line-clamp-2 group-hover:text-pink-600 transition-colors">
                      {produto.nome}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {produto.descricao}
                    </p>

                    {produto.beneficios && (
                      <div className="mb-3 space-y-1">
                        {produto.beneficios.slice(0, 3).map((beneficio, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                            <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>{beneficio}</span>
                          </div>
                        ))}
                        {produto.beneficios.length > 3 && (
                          <p className="text-xs text-gray-500">+{produto.beneficios.length - 3} benefícios</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex-1">
                        {produto.requer_assinatura ? (
                          <div>
                            <p className="text-xs text-purple-600 font-semibold">
                              <Crown className="w-3 h-3 inline mr-1" />
                              Assinantes Clube+
                            </p>
                            <p className="text-xs text-gray-500">Benefício exclusivo</p>
                          </div>
                        ) : produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" || produto.categoria === "Produtos para Pacientes" ? (
                          <p className="text-lg font-bold text-blue-600">
                            {produto.preco_texto || "Consulte"}
                          </p>
                        ) : produto.preco_promocional ? (
                          <div>
                            <p className="text-xs text-gray-500 line-through">
                              R$ {produto.preco.toFixed(2)}
                            </p>
                            <p className="text-lg font-bold text-pink-600">
                              R$ {produto.preco_promocional.toFixed(2)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-gray-900">
                            R$ {produto.preco.toFixed(2)}
                          </p>
                        )}
                      </div>

                      <Button
                        size="sm"
                        onClick={() => produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" || produto.categoria === "Produtos para Pacientes"
                          ? handleContratar(produto)
                          : handleComprarProduto(produto)
                        }
                        className={produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" || produto.categoria === "Produtos para Pacientes"
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
                        }
                      >
                        {produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" || produto.categoria === "Produtos para Pacientes" ? "Contratar" : <ShoppingCart className="w-4 h-4" />}
                      </Button>
                    </div>

                    {/* Mostrar pontos que serão ganhos - APENAS PARA PRODUTOS */}
                    {!(produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" || produto.categoria === "Produtos para Pacientes") && !produto.requer_assinatura && (
                      <div className="mt-2 text-xs text-center bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 py-2 rounded-lg border border-green-200">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3 fill-green-600" />
                          <span className="font-bold">+{pontosGanhos} pontos</span>
                          <span className="text-gray-600">({faixaPreco})</span>
                        </div>
                      </div>
                    )}

                    {/* Info sobre faixa de preço para SERVIÇOS */}
                    {(produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" || produto.categoria === "Produtos para Pacientes") && !produto.requer_assinatura && produto.preco > 0 && (
                      <div className="mt-2 text-xs text-center bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 py-2 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-bold">Faixa {faixaPreco}</span>
                          <span className="text-gray-600">
                            ({faixaPreco === "$" ? "Até R$ 500" :
                              faixaPreco === "$$" ? "R$ 500-1.000" :
                              faixaPreco === "$$$" ? "R$ 1.000-2.000" :
                              faixaPreco === "$$$$" ? "R$ 2.000-5.000" :
                              "Acima de R$ 5.000"})
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <Card className="border-none shadow-lg cursor-pointer hover:shadow-xl transition-all" onClick={redirectToLojaPontos}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-6 h-6 text-[#2C2C2C]" />
              </div>
              <h3 className="font-bold mb-2">Ganhe Pontos</h3>
              <p className="text-sm text-gray-600">
                Acumule pontos em cada compra e troque por produtos
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg cursor-pointer hover:shadow-xl transition-all" onClick={redirectToLojaPontos}>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-6 h-6 text-[#2C2C2C]" />
              </div>
              <h3 className="font-bold mb-2">Descontos Exclusivos</h3>
              <p className="text-sm text-gray-600">
                Membros do clube têm descontos especiais
              </p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-[#2C2C2C]" />
              </div>
              <h3 className="font-bold mb-2">Novidades Sempre</h3>
              <p className="text-sm text-gray-600">
                Produtos novos adicionados regularmente
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
