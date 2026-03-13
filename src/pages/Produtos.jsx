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

import ProdutoDetalhesDialog from "../components/produtos/ProdutoDetalhesDialog";

const categorias = [
  "Todas",
  "Cuidados com a Pele",
  "Cabelos",
  "Maquiagem",
  "Perfumaria",
  "Suplementos",
  "Equipamentos",
  "Acessórios",
  "Outros",
  "Serviços Contratáveis",
  "Serviços para Pacientes",
  "Produtos para Pacientes",
  "IA",
  "Serviços",
  "Serviços de IA",
  "Mídia e Marketing"
];

/* removido: placeholders de serviços/produtos */ const servicosContrataveis = [];

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
  const [page, setPage] = useState(1);
  const [faixaPontosFiltro, setFaixaPontosFiltro] = useState('todas');

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

  // Filtrar produtos baseado no tipo de usuário
  const todosProdutos = [
    // Programas 12m primeiro (pacientes)
    ...produtosDatabase.filter(p => p.programa_12_meses === true && isPaciente),
    // Demais itens (evita duplicar os programas já priorizados)
    ...produtosDatabase.filter(p => !(p.programa_12_meses === true && isPaciente))
  ];

  const produtosFiltrados = todosProdutos.filter(produto => {
    const isExclusivo = !!(produto.requer_assinatura || produto.mostrar_tag_clube || produto.beauty_club_exclusivo);
    const matchPlanoFiltro = true;

    // Gating por Beauty Club quando aplicável
    if (isExclusivo && produto.beauty_club_minimo) {
      const ordemBC = ['none','basic','pro','exclusive'];
      const userBC = user?.beauty_club_plano || 'none';
      if (ordemBC.indexOf(userBC) < ordemBC.indexOf(produto.beauty_club_minimo)) return false;
    }

    // Respeitar plano mínimo (para profissionais) (já existente abaixo)

    // Respeitar plano mínimo (para profissionais)
    if (produto.plano_minimo && isProfissional) {
      const ordem = ['free','lite','basico','pro','prime','premium'];
      const idxUser = ordem.indexOf(user?.plano_ativo || 'free');
      const idxMin = ordem.indexOf(produto.plano_minimo || 'free');
      if (idxUser < idxMin) return false;
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
      if (minhas.length === 0) return false; // se exigir especialidade e o usuário não tiver
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
    const phone = '5521980343873';
    const linhas = carrinho.map((item, i) => {
      const preco = item.preco_promocional || item.preco;
      const precoTxt = preco ? `R$ ${preco.toFixed(2)}` : (item.preco_texto || 'Consultar');
      return `${i+1}. ${item.nome} - ${precoTxt}`;
    }).join('%0A');
    const total = carrinho.reduce((sum, it) => sum + (it.preco_promocional || it.preco || 0), 0);
    const totalTxt = total > 0 ? `%0A%0ATotal: R$ ${total.toFixed(2)}` : '';
    const msg = encodeURIComponent(`Olá! Vim pelo Mapa da Estética e quero concluir meu pedido:%0A${linhas}${totalTxt}`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleContratar = (servico) => {
    if (!user) {
      setMostrarLoginPrompt(true);
      return;
    }
    if (servico.preco === 0 || !servico.preco || servico.requer_assinatura) {
      window.open('https://clubdabeleza.com/plans', '_blank');
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
          {/* Coluna Principal - Produtos */}
          <div className="lg:col-span-3">
            {/* Header com toggle de tipo E botão admin */}
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

                {/* Toggle de tipo E Botão Admin */}
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

                  {/* BOTÃO ADMIN - Apenas visível para administradores */}
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

                <Select value={tipoBusca} onValueChange={setTipoBusca}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="Tipo de itens" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="produtos">Produtos</SelectItem>
                    <SelectItem value="servicos">Serviços</SelectItem>
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
                  <div className="mt-2 text-xs text-gray-600 space-y-1">
                    <p><strong>O que é isso?</strong> Este filtro mostra itens resgatáveis por pontos. A faixa representa o <em>número de pontos necessários</em> para trocar pelo item.</p>
                    <p>Exemplos: 0–100 = exige até 100 pontos para resgate; 1.000–2.000 = exige entre 1.000 e 2.000 pontos. Itens sem pontos definidos não aparecem quando uma faixa é selecionada.</p>
                  </div>
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
              <Card className="p-12 text-center">
                <div className="text-6xl mb-4">
                  {tipoBusca === 'produtos' ? "🛍️" : "💼"}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {tipoBusca === 'produtos' ? "Anuncie seus produtos aqui" : "Nenhum serviço encontrado"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {tipoBusca === 'produtos' 
                    ? "Usuários com permissão podem anunciar seus produtos. Dicas: imagem principal 1200x800 (16:9) e até 5 imagens no carrossel."
                    : "Não encontramos serviços com os filtros selecionados."
                  }
                </p>

                {/* Debug para admin */}
                {isAdmin && (
                  <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-left">
                    <p className="font-bold text-yellow-900 mb-2">Debug Info (Admin):</p>
                    <p className="text-sm text-yellow-800">Total produtos DB: {produtosDatabase.length}</p>

                    <p className="text-sm text-yellow-800">Filtrados: {produtosFiltrados.length}</p>
                    <p className="text-sm text-yellow-800">Categoria filtro: {categoriaFiltro}</p>
                    <p className="text-sm text-yellow-800">Tipo busca: {tipoBusca}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[#F7D426]" />
                    <p className="font-semibold text-sm">Lançamentos em Breve</p>
                    <p className="text-xs text-gray-500">
                      {tipoBusca === 'produtos' ? 'Produtos exclusivos' : 'Novos serviços'}
                    </p>
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
              {/* Produtos com paginação (6 por página) */}
              {(() => {
                const isServico = (p) => p.categoria === "Serviços Contratáveis" || p.categoria === "Serviços para Pacientes" || p.categoria === "Produtos para Pacientes";
                const produtosApenas = produtosFiltrados.filter(p => !isServico(p));
                const servicosApenas = produtosFiltrados.filter(isServico);
                const itemsPerPage = 6;
                const totalPages = Math.max(1, Math.ceil(produtosApenas.length / itemsPerPage));
                const start = ((page || 1) - 1) * itemsPerPage;
                const current = produtosApenas.slice(start, start + itemsPerPage);
                return (
                  <>
                    {current.length > 0 && (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {current.map((produto) => {
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
                          <div className="w-full h-full flex items-center justify-center text-6xl text-gray-400">
                            {produto.nome && produto.nome.includes("Beauty Box") ? "💝" : "🎁"}
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

                        {produto.marca && (
                          <p className="text-xs text-gray-500 mb-3">
                            Marca: {produto.marca}
                          </p>
                        )}

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
                                window.open('https://clubdabeleza.com/plans', '_blank');
                              } else if (produto.categoria === "Serviços Contratáveis" || produto.categoria === "Serviços para Pacientes" || produto.categoria === "Produtos para Pacientes") {
                                const base = 'https://wa.me/5521980343873';
                                const nomeUser = user?.full_name || '';
                                const preco = produto.preco_promocional || produto.preco;
                                const precoTxt = preco ? ` - Preço: R$ ${preco.toFixed(2)}` : ' - Preço: a combinar via WhatsApp';
                                const msg = encodeURIComponent(`Olá! Me chamo ${nomeUser} e desejo contratar o serviço "${produto.nome}"${precoTxt}`);
                                window.open(`${base}?text=${msg}`, '_blank');
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
                    {/* Paginação */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-6">
                        <Button variant="outline" disabled={(page||1)===1} onClick={() => setPage((p)=>Math.max(1,(p||1)-1))}>Anterior</Button>
                        <span className="text-sm text-gray-600">Página {page||1} de {totalPages}</span>
                        <Button variant="outline" disabled={(page||1)>=totalPages} onClick={() => setPage((p)=>Math.min(totalPages,(p||1)+1))}>Próxima</Button>
                      </div>
                    )}
                    {/* Serviços abaixo dos produtos */}
                    {servicosApenas.length > 0 && (
                      <div className="mt-10">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Serviços</h3>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {servicosApenas.slice(0, 6).map((produto) => {
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