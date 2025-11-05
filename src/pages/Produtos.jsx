
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
  ArrowRight
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
  {
    id: "google-negocios",
    nome: "Criação de Google Negócios Personalizado",
    descricao: "Tenha seu perfil profissional completo no Google com otimização SEO, fotos, descrições e tudo configurado para atrair mais clientes.",
    categoria: "Serviços Contratáveis",
    tipo_publico: "profissional",
    preco: 0,
    preco_texto: "Consulte",
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
    status: 'ativo'
  },
  {
    id: "geracao-imagens",
    nome: "Geração de Imagens Profissionais",
    descricao: "Imagens de alta qualidade geradas para seu anúncio. Imagens únicas, profissionais e personalizadas para destacar seu negócio.",
    categoria: "Serviços Contratáveis",
    tipo_publico: "profissional",
    preco: 50,
    preco_texto: "A partir de R$ 50",
    imagens: ["https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/f0cb8c67e_geraodeimagem.png"],
    beneficios: [
      "Até 10 imagens personalizadas",
      "Alta resolução e qualidade",
      "Entrega em até 24h",
      "Revisões ilimitadas",
      "Imagens exclusivas para seu negócio",
      "Suporte técnico incluso"
    ],
    em_destaque: true,
    status: 'ativo'
  },
  // Produtos para PACIENTES
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
    status: 'ativo'
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
    status: 'ativo'
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

  const { data: produtosDatabase = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.filter({ status: 'ativo' }),
    staleTime: 5 * 60 * 1000,
    initialData: [],
  });

  const isPaciente = user?.tipo_usuario === 'paciente';
  const isProfissional = user?.tipo_usuario === 'profissional' || !user;

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

  const categoriasDisponiveis = [
    "Todas",
    ...(isProfissional ? ["Serviços Contratáveis"] : ["Serviços para Pacientes", "Produtos para Pacientes"]),
    ...categorias
  ];

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
                {categorias.map((cat) => (
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
            {produtosFiltrados.map((produto) => (
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
                      {produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" ? "💼" : "🛍️"}
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
                    <div>
                      {produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" ? (
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
                      onClick={() => produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes"
                        ? handleContratar(produto)
                        : null
                      }
                      className={produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
                      }
                    >
                      {produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" ? "Contratar" : <ShoppingCart className="w-4 h-4" />}
                    </Button>
                  </div>

                  {produto.pontos_ganhos > 0 && (
                    <div className="mt-2 text-xs text-center bg-green-50 text-green-700 py-1 rounded">
                      +{produto.pontos_ganhos} pontos nesta compra
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
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
