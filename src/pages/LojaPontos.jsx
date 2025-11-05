
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Crown,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Zap,
  ShoppingBag,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';

export default function LojaPontos() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        base44.auth.redirectToLogin(window.location.pathname);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Buscar produtos
  const { data: produtos = [], isLoading: loadingProdutos } = useQuery({
    queryKey: ['produtos-loja'],
    queryFn: async () => {
      const allProdutos = await base44.entities.Produto.filter({ status: 'ativo' });
      return allProdutos;
    },
    staleTime: 5 * 60 * 1000,
  });

  const categorias = ["Todos", "Cuidados com a Pele", "Cabelos", "Maquiagem", "Outros"];

  const produtosFiltrados = categoriaSelecionada === "Todos"
    ? produtos
    : produtos.filter(p => p.categoria === categoriaSelecionada);

  // Ordenar: produtos especiais primeiro (Beauty Box), depois por pontos
  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    // Beauty Box sempre primeiro
    if (a.nome && a.nome.includes("Beauty Box") && b.nome && !b.nome.includes("Beauty Box")) return -1;
    if (b.nome && b.nome.includes("Beauty Box") && a.nome && !a.nome.includes("Beauty Box")) return 1;
    
    // Depois por pontos necessários
    const pontosA = a.pontos_necessarios || 0;
    const pontosB = b.pontos_necessarios || 0;
    return pontosA - pontosB;
  });

  const handleResgatarProduto = async (produto) => {
    if (!user) return;

    if (user.pontos_acumulados < produto.pontos_necessarios) {
      alert(`Você precisa de ${produto.pontos_necessarios} pontos para resgatar este produto. Você tem apenas ${user.pontos_acumulados} pontos.`);
      return;
    }

    if (produto.estoque <= 0) {
      alert("Produto esgotado!");
      return;
    }

    const confirmar = window.confirm(
      `Deseja resgatar "${produto.nome}" por ${produto.pontos_necessarios} pontos?\n\nSeus pontos atuais: ${user.pontos_acumulados}\nSeus pontos após resgate: ${user.pontos_acumulados - produto.pontos_necessarios}`
    );

    if (!confirmar) return;

    try {
      // Atualizar pontos do usuário
      await base44.auth.updateMe({
        pontos_acumulados: user.pontos_acumulados - produto.pontos_necessarios
      });

      // Criar pedido
      await base44.entities.PedidoProduto.create({
        usuario_email: user.email,
        produto_id: produto.id,
        produto_nome: produto.nome,
        tipo: 'produto',
        quantidade: 1,
        valor_total: 0, // Resgate com pontos
        status_pedido: 'processando'
      });

      // Atualizar estoque
      await base44.entities.Produto.update(produto.id, {
        estoque: produto.estoque - 1
      });

      alert(`✅ Produto "${produto.nome}" resgatado com sucesso!\n\nEntraremos em contato para organizar a entrega.`);
      
      window.location.reload();
    } catch (error) {
      console.error("Erro ao resgatar produto:", error);
      alert("Erro ao resgatar produto. Tente novamente.");
    }
  };

  if (loading || loadingProdutos) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7D426] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/perfil")} // Replaced createPageUrl with direct path
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]">
            <Star className="w-4 h-4 mr-2 fill-[#2C2C2C]" />
            Loja de Pontos
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Resgate Seus Pontos
          </h1>
          <p className="text-gray-600 text-lg">
            Você tem <span className="font-bold text-[#F7D426] text-2xl">{user?.pontos_acumulados || 0}</span> pontos disponíveis
          </p>
        </div>

        {/* Tabs de Categorias */}
        <div className="mb-8 overflow-x-auto whitespace-nowrap">
          <div className="flex gap-2">
            {categorias.map((cat) => (
              <Button
                key={cat}
                onClick={() => setCategoriaSelecionada(cat)}
                variant={categoriaSelecionada === cat ? "default" : "outline"}
                className={categoriaSelecionada === cat 
                  ? "bg-[#F7D426] text-[#2C2C2C] hover:bg-[#E5C215] border-2 border-[#2C2C2C] flex-shrink-0" 
                  : "border-2 border-gray-300 text-gray-700 hover:bg-gray-100 flex-shrink-0"}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Grid de Produtos */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosOrdenados.map((produto) => (
            <Card 
              key={produto.id} 
              className={`overflow-hidden hover:shadow-xl transition-all border-2 ${
                produto.nome && produto.nome.includes("Beauty Box") 
                  ? "ring-2 ring-[#F7D426] border-[#F7D426]" 
                  : "border-gray-200"
              }`}
            >
              <div className="relative h-48 bg-gray-100">
                {produto.imagens && produto.imagens.length > 0 ? (
                  <img
                    src={produto.imagens[0]}
                    alt={produto.nome}
                    className="w-full h-full object-cover"
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
                {produto.nome && produto.nome.includes("Beauty Box") && (
                  <Badge className="absolute top-2 left-2 bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] border-2 border-[#2C2C2C] font-bold">
                    <Crown className="w-3 h-3 mr-1 fill-[#2C2C2C]" />
                    EXCLUSIVO
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <Badge variant="outline" className="mb-2 bg-gray-100 text-gray-800 border-gray-300">
                  {produto.categoria}
                </Badge>
                
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

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#F7D426] fill-[#F7D426]" />
                    <span className="text-2xl font-bold text-[#2C2C2C]">
                      {produto.pontos_necessarios}
                    </span>
                    <span className="text-sm text-gray-500">pontos</span>
                  </div>

                  {produto.estoque > 0 ? (
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      Estoque: {produto.estoque}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-red-300 text-red-700">
                      Esgotado
                    </Badge>
                  )}
                </div>

                <Button
                  onClick={() => handleResgatarProduto(produto)}
                  disabled={!user || user.pontos_acumulados < produto.pontos_necessarios || produto.estoque <= 0}
                  className={`w-full ${
                    produto.nome && produto.nome.includes("Beauty Box")
                      ? "bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] hover:from-[#E5C215] hover:to-[#F7D426] border-2 border-[#2C2C2C]"
                      : "bg-[#2C2C2C] text-[#F7D426] hover:bg-[#3A3A3A]"
                  }`}
                >
                  {user && user.pontos_acumulados < produto.pontos_necessarios 
                    ? `Faltam ${produto.pontos_necessarios - user.pontos_acumulados} pontos`
                    : produto.estoque <= 0
                    ? "Esgotado"
                    : "Resgatar Agora"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {produtosOrdenados.length === 0 && (
          <Card className="p-12 text-center mt-8 border-dashed border-2 border-gray-300 bg-gray-50">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum produto disponível
            </h3>
            <p className="text-gray-600">
              Novos produtos serão adicionados em breve! Fique de olho!
            </p>
          </Card>
        )}

        {/* Como Ganhar Pontos */}
        <Card className="mt-12 border-2 border-[#F7D426] bg-gradient-to-br from-[#FFF9E6] to-white shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-6 flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-[#F7D426]" />
              Como Ganhar Mais Pontos
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#2C2C2C]">
                  <ShoppingBag className="w-8 h-8 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Compre Produtos</h3>
                <p className="text-sm text-gray-600">
                  Ganhe pontos em cada compra na loja
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#2C2C2C]">
                  <Users className="w-8 h-8 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Indique Amigos</h3>
                <p className="text-sm text-gray-600">
                  100 pontos por cada amigo que se cadastrar (verifique as regras de indicação na página de perfil)
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#2C2C2C]">
                  <Crown className="w-8 h-8 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Planos Premium</h3>
                <p className="text-sm text-gray-600">
                  Receba pontos mensais ao assinar um plano
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
