import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ChatPedido from "../components/chat/ChatPedido";
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
  DollarSign, // New import
  Check,      // New import
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useQuery } from '@tanstack/react-query';

const pontosPorFaixaPreco = {
  '$': 1,
  '$$': 5,
  '$$$': 10,
  '$$$$': 50,
  '$$$$$': 100
};

const getFaixaPrecoInfo = (faixa) => {
  const info = {
    "$": { texto: "Até R$ 500", emoji: "💚", pontos: 1 },
    "$$": { texto: "R$ 500 - R$ 1.000", emoji: "💙", pontos: 5 },
    "$$$": { texto: "R$ 1.000 - R$ 2.000", emoji: "💛", pontos: 10 },
    "$$$$": { texto: "R$ 2.000 - R$ 5.000", emoji: "🧡", pontos: 50 },
    "$$$$$": { texto: "Acima de R$ 5.000", emoji: "❤️", pontos: 100 }
  };
  return info[faixa] || info["$"];
};

export default function LojaPontos() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("Todos");
  const [mostrarTrocaBeautyCoins, setMostrarTrocaBeautyCoins] = useState(false);
  const [quantidadeBeautyCoins, setQuantidadeBeautyCoins] = useState(1);
  const [quantidades, setQuantidades] = useState({});
  const [pedidoChatId, setPedidoChatId] = useState(null);
  const [mostraAviso, setMostraAviso] = useState(true);

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

  // Aplicar visibilidade por plano também na Loja de Pontos
  const ordemPlanos = ['free','lite','basico','pro','prime','premium'];
  const produtosVisiveisPlano = produtos.filter(p => {
    // Gating por plano Mapa da Estética (profissionais)
    const min = p.plano_minimo || 'free';
    const ordemPlanos = ['free','lite','basico','pro','prime','premium'];
    const idxUser = ordemPlanos.indexOf((user?.plano_ativo)||'free');
    const idxMin = ordemPlanos.indexOf(min);
    if (idxUser < idxMin) return false;

    // Gating por Beauty Club quando aplicável
    if (p.beauty_club_minimo || p.beauty_club_exclusivo || p.mostrar_tag_clube) {
      const ordemBC = ['none','basic','pro','exclusive'];
      const userBC = user?.beauty_club_plano || 'none';
      const req = p.beauty_club_minimo || (p.mostrar_tag_clube ? 'basic' : undefined);
      if (req && ordemBC.indexOf(userBC) < ordemBC.indexOf(req)) return false;
      if (!req && p.beauty_club_exclusivo && userBC === 'none') return false;
    }
    return true;
  });
    const min = p.plano_minimo || 'free';
    const idxUser = ordemPlanos.indexOf((user?.plano_ativo)||'free');
    const idxMin = ordemPlanos.indexOf(min);
    return idxUser >= idxMin;
  });

  const produtosFiltrados = categoriaSelecionada === "Todos"
    ? produtosVisiveisPlano
    : produtosVisiveisPlano.filter(p => p.categoria === categoriaSelecionada);

  // Ordenar: produtos especiais primeiro (Beauty Box), depois por pontos
  const efetivoPontos = (p) => {
    if (typeof p.pontos_necessarios === 'number' && p.pontos_necessarios > 0) return p.pontos_necessarios;
    if (typeof p.preco === 'number' && p.preco > 0) return Math.max(1, Math.round(p.preco));
    return 100; // fallback
  };

  const produtosOrdenados = [...produtosFiltrados].sort((a, b) => {
    // Beauty Box sempre primeiro
    if (a.nome && a.nome.includes("Beauty Box") && b.nome && !b.nome.includes("Beauty Box")) return -1;
    if (b.nome && b.nome.includes("Beauty Box") && a.nome && !a.nome.includes("Beauty Box")) return 1;
    
    // Depois por pontos necessários
    const pontosA = a.pontos_necessarios || 0;
    const pontosB = b.pontos_necessarios || 0;
    return pontosA - pontosB;
  });

  const handleResgatarProduto = async (produto, quantidade = 1) => {
    if (!user) return;

    const custo = efetivoPontos(produto) * quantidade;
    if (user.pontos_acumulados < custo) {
      alert(`Você precisa de ${produto.pontos_necessarios} pontos para resgatar este produto. Você tem apenas ${user.pontos_acumulados} pontos.`);
      return;
    }

    if (produto.estoque <= 0 || quantidade > produto.estoque) {
      alert("Produto esgotado!");
      return;
    }

    const confirmar = window.confirm(
      `Deseja resgatar "${produto.nome}" em quantidade ${quantidade} por ${custo} pontos?\n\nSeus pontos atuais: ${user.pontos_acumulados}\nSeus pontos após resgate: ${user.pontos_acumulados - custo}`
    );

    if (!confirmar) return;

    try {
      // Atualizar pontos do usuário
      await base44.auth.updateMe({
        pontos_acumulados: user.pontos_acumulados - custo
      });

      // Criar pedido
      const created = await base44.entities.PedidoProduto.create({
        usuario_email: user.email,
        produto_id: produto.id,
        produto_nome: produto.nome,
        tipo: 'produto',
        quantidade,
        valor_total: 0,
        status_pedido: 'aguardando_pagamento'
      });
      setPedidoChatId(created.id);

      // Atualizar estoque
      await base44.entities.Produto.update(produto.id, {
        estoque: produto.estoque - quantidade
      });

      alert(`✅ Pedido criado! Em até 48 horas um estabelecimento aceitará seu pedido e seguirá com a distribuição. Você já pode conversar pelo chat.`);
      setUser(await base44.auth.me());
    } catch (error) {
      console.error("Erro ao resgatar produto:", error);
      alert("Erro ao resgatar produto. Tente novamente.");
    }
  };

  const handleSolicitarOrcamento = async (produto) => {
    if (!user) return;
    try {
      const created = await base44.entities.PedidoProduto.create({
        usuario_email: user.email,
        produto_id: produto.id,
        produto_nome: produto.nome,
        tipo: 'produto',
        quantidade,
        valor_total: 0,
        status_pedido: 'processando'
      });
      setPedidoChatId(created.id);
      alert('Solicitação de orçamento enviada! Um fornecedor entrará em contato pelo chat.');
    } catch (e) { alert('Erro ao solicitar orçamento.'); }
  };

  const handleTrocarBeautyCoins = async () => {
    if (!user) return;

    const pontosNecessarios = quantidadeBeautyCoins * 1000;

    if (user.pontos_acumulados < pontosNecessarios) {
      alert(`Você precisa de ${pontosNecessarios} pontos para trocar por ${quantidadeBeautyCoins} Beauty Coin(s). Você tem apenas ${user.pontos_acumulados} pontos.`);
      return;
    }

    const confirmar = window.confirm(
      `Confirmar troca:\n\n${quantidadeBeautyCoins} Beauty Coin(s) = ${pontosNecessarios} pontos\n\nSeus pontos atuais: ${user.pontos_acumulados}\nSeus pontos após troca: ${user.pontos_acumulados - pontosNecessarios}\n\nDeseja continuar?`
    );

    if (!confirmar) return;

    try {
      // CORREÇÃO: Credita Beauty Coins no usuário
      const novosBeautyCoins = (user.beauty_coins || 0) + quantidadeBeautyCoins;
      
      await base44.auth.updateMe({
        pontos_acumulados: user.pontos_acumulados - pontosNecessarios,
        beauty_coins: novosBeautyCoins
      });

      alert(`✅ Troca realizada com sucesso!\n\nVocê trocou ${pontosNecessarios} pontos por ${quantidadeBeautyCoins} Beauty Coin(s).\n\nNovo saldo de Beauty Coins: ${novosBeautyCoins}`);
      
      setMostrarTrocaBeautyCoins(false);
      setQuantidadeBeautyCoins(1);
      window.location.reload();
    } catch (error) {
      console.error("Erro ao trocar Beauty Coins:", error);
      alert("Erro ao realizar a troca. Tente novamente.");
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
          onClick={() => navigate("/perfil")} 
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-purple-800">Quer ganhar bônus de pontos nas compras da loja?</span>
            <Button size="sm" onClick={()=>navigate(createPageUrl('Planos'))} className="bg-purple-600 hover:bg-purple-700">Quero meu bônus</Button>
          </div>
          {mostraAviso && (
            <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-lg text-pink-800 text-sm">
              Após solicitar um resgate, um estabelecimento parceiro aceitará seu pedido em até 48 horas. Tudo é acompanhado por chat dentro do site.
            </div>
          )}
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

        {/* Check-in Diário */}
        <Card className="mb-8 border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
          <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-bold text-green-900">Check-in diário</h2>
              <p className="text-sm text-green-800">Ganhe pontos ao entrar diariamente. Sequência: 1, 2, 3, 4, 5, 7, 10 pts.</p>
            </div>
            {(() => {
              const hoje = new Date();
              const isoHoje = hoje.toISOString().split('T')[0];
              const last = user?.last_checkin_date || '';
              const ontem = new Date(); ontem.setDate(ontem.getDate()-1);
              const isoOntem = ontem.toISOString().split('T')[0];
              let nextStreak = 1;
              if (last === isoHoje) {
                return <Badge className="bg-green-600 text-white">Você já fez check-in hoje</Badge>;
              }
              if (last === isoOntem) nextStreak = Math.min(7, (user?.checkin_streak||0)+1);
              const tabela = [0,1,2,3,4,5,7,10];
              const premio = tabela[nextStreak];
              return (
                <Button
                  onClick={async ()=>{
                    await base44.auth.updateMe({
                      last_checkin_date: isoHoje,
                      checkin_streak: nextStreak,
                      pontos_acumulados: (user?.pontos_acumulados||0) + premio
                    });
                    alert(`✅ Check-in realizado! Você ganhou +${premio} pontos.`);
                    window.location.reload();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Fazer check-in (+{premio} pts)
                </Button>
              );
            })()}
          </CardContent>
        </Card>

        {/* NOVO: Card de Troca de Beauty Coins */}
        <Card className="mb-8 border-2 border-[#F7D426] bg-gradient-to-br from-[#FFF9E6] to-white shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#F7D426] rounded-full flex items-center justify-center border-2 border-[#2C2C2C]">
                  <DollarSign className="w-6 h-6 text-[#2C2C2C]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#2C2C2C]">Trocar por Beauty Coins</h2>
                  <p className="text-sm text-gray-600">1000 pontos = 1 Beauty Coin</p>
                </div>
              </div>
              <Button
                onClick={() => setMostrarTrocaBeautyCoins(!mostrarTrocaBeautyCoins)}
                className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] border-2 border-[#2C2C2C] font-bold"
              >
                {mostrarTrocaBeautyCoins ? 'Fechar' : 'Trocar Agora'}
              </Button>
            </div>

            {mostrarTrocaBeautyCoins && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t-2 border-[#F7D426] pt-4"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                    <h3 className="font-bold mb-4 text-gray-900">Quantos Beauty Coins deseja?</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <Button
                          onClick={() => setQuantidadeBeautyCoins(Math.max(1, quantidadeBeautyCoins - 1))}
                          variant="outline"
                          size="sm"
                          className="border-2"
                        >
                          -
                        </Button>
                        <div className="flex-1 text-center min-w-[140px]">
                          <p className="text-4xl font-bold text-[#F7D426]">{quantidadeBeautyCoins}</p>
                          <p className="text-sm text-gray-600">Beauty Coin(s)</p>
                        </div>
                        <Button
                          onClick={() => setQuantidadeBeautyCoins(quantidadeBeautyCoins + 1)
                          variant="outline"
                          size="sm"
                          className="border-2"
                        >
                          +
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Ou digite:</span>
                        <input
                          type="number"
                          min={1}
                          value={quantidadeBeautyCoins}
                          onChange={(e)=> setQuantidadeBeautyCoins(Math.max(1, parseInt(e.target.value)||1))}
                          className="w-24 border rounded px-2 py-1"
                        />
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Pontos necessários:</span>
                          <span className="font-bold text-gray-900">{quantidadeBeautyCoins * 1000}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Seus pontos atuais:</span>
                          <span className="font-bold text-[#F7D426]">{user?.pontos_acumulados || 0}</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between">
                          <span className="text-gray-600 font-semibold">Pontos após troca:</span>
                          <span className={`font-bold ${(user?.pontos_acumulados || 0) - (quantidadeBeautyCoins * 1000) < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {(user?.pontos_acumulados || 0) - (quantidadeBeautyCoins * 1000)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                    <h3 className="font-bold mb-4 text-purple-900">O que são Beauty Coins?</h3>
                    <div className="space-y-3 text-sm text-purple-900">
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <p>Moeda exclusiva do <strong>Clube da Beleza</strong></p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <p>Use em <strong>qualquer estabelecimento parceiro</strong></p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <p><strong>Sem data de validade</strong> - use quando quiser</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <p>Acumule e resgate <strong>descontos exclusivos</strong></p>
                      </div>
                    </div>

                    <Button
                      onClick={handleTrocarBeautyCoins}
                      disabled={!user || (user.pontos_acumulados < (quantidadeBeautyCoins * 1000))}
                      className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
                    >
                      Confirmar Troca
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Sistema de Pontos - Explicação Detalhada */}
        <Card className="mb-8 border-2 border-[#F7D426] bg-gradient-to-br from-[#FFF9E6] to-white shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-6 flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-[#F7D426] fill-[#F7D426]" />
              Como Funciona o Sistema de Pontos
            </h2>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Ganhar Pontos */}
              <div className="bg-white p-6 rounded-xl border-2 border-[#F7D426]">
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#F7D426]" />
                  Ganhe Pontos
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <ShoppingBag className="w-5 h-5 text-[#F7D426] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Compras na Loja</p>
                      <p className="text-sm text-gray-600">Ganhe pontos em cada compra baseado na faixa de preço</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-[#F7D426] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Indicação de Amigos</p>
                      <p className="text-sm text-gray-600">100 pontos por cada amigo que completar o cadastro</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Crown className="w-5 h-5 text-[#F7D426] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900">Planos Premium</p>
                      <p className="text-sm text-gray-600">Pontos mensais ao assinar planos GOLD ou VIP</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Faixas de Preço */}
              <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                <h3 className="text-xl font-bold text-[#2C2C2C] mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#F7D426]" />
                  Pontos por Faixa de Preço
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <p><strong>Regra oficial:</strong> 1 real = 1 ponto.</p>
                  <p className="mt-1">Exemplos: R$ 50 = 50 pontos • R$ 199,90 ≈ 200 pontos.</p>
                </div>
              </div>
            </div>

            {/* Regras de Indicação */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Programa de Indicação - Regras
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-900">
                      <strong>100 pontos</strong> por cada amigo que completar o cadastro
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-900">
                      O amigo precisa permanecer <strong>15 minutos</strong> navegando no site
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-900">
                      O amigo precisa <strong>completar o cadastro</strong>
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-900">
                      <strong>Pontos creditados automaticamente</strong> após validação
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-900">
                      Acompanhe suas indicações no <strong>perfil</strong>
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-purple-900">
                      Indique <strong>quantos amigos quiser!</strong>
                    </p>
                  </div>
                </div>
              </div>

              {user?.codigo_indicacao && (
                <div className="mt-6 p-4 bg-white rounded-lg border-2 border-purple-300">
                  <p className="text-sm font-semibold text-purple-900 mb-2">Seu Código de Indicação:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-purple-100 px-4 py-2 rounded text-purple-900 font-mono font-bold text-lg">
                      {user.codigo_indicacao}
                    </code>
                    <Button
                      size="sm"
                      onClick={() => {
                        const link = `${window.location.origin}?ref=${user.codigo_indicacao}`;
                        navigator.clipboard.writeText(link);
                        alert("Link copiado! Compartilhe com seus amigos!");
                      }}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      Copiar Link
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-purple-700">
                      Amigos indicados: <strong>{user.amigos_indicados_validados || 0}</strong>
                    </span>
                    <span className="text-purple-700">
                      Pontos ganhos: <strong>{user.total_pontos_indicacao || 0}</strong>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                {produto.mostrar_tag_clube && (
                  <Badge className="absolute bottom-2 left-2 bg-purple-600 text-white">Clube da Beleza</Badge>
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

                {produto.tipo_oferta === 'sob_demanda' ? (
                  <div className="space-y-3">
                    <Button onClick={() => handleSolicitarOrcamento(produto)} className="w-full bg-pink-600 hover:bg-pink-700 text-white">
                      Solicitar Orçamento
                    </Button>
                    <p className="text-xs text-gray-500">Converse com o fornecedor pelo chat para definir preço e entrega.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Quantidade</span>
                      <div className="flex items-center border rounded-lg">
                        {(() => { const step = produto.tipo_oferta === 'lote' ? Math.max(1, produto.lote_minimo || 1) : 1; const min = step; return (
                          <>
                            <button className="px-2 py-1" onClick={() => setQuantidades(prev=>({ ...prev, [produto.id]: Math.max(min, (prev[produto.id]||min)-step) }))}>-</button>
                            <span className="px-2 min-w-6 text-center">{quantidades[produto.id] || min}</span>
                            <button className="px-2 py-1" onClick={() => setQuantidades(prev=>({ ...prev, [produto.id]: Math.min(produto.estoque, (prev[produto.id]||min)+step) }))}>+</button>
                          </>
                        ); })()}
                      </div>
                      {produto.tipo_oferta === 'lote' && (
                        <span className="text-xs text-gray-500">mínimo {Math.max(1, produto.lote_minimo || 1)}</span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleResgatarProduto(produto, (()=>{ const step = produto.tipo_oferta === 'lote' ? Math.max(1, produto.lote_minimo || 1) : 1; return quantidades[produto.id] || step; })())}
                      disabled={(() => { const step = produto.tipo_oferta === 'lote' ? Math.max(1, produto.lote_minimo || 1) : 1; const q = quantidades[produto.id] || step; const custo = (produto.pontos_necessarios||0) * q; return !user || ((user.pontos_acumulados||0) < custo) || produto.estoque <= 0 || q > produto.estoque; })()}
                      className={`w-full ${
                        produto.nome && produto.nome.includes("Beauty Box")
                          ? "bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] hover:from-[#E5C215] hover:to-[#F7D426] border-2 border-[#2C2C2C]"
                          : "bg-[#2C2C2C] text-[#F7D426] hover:bg-[#3A3A3A]"
                      }`}
                    >
                      {(() => {
                        const step = produto.tipo_oferta === 'lote' ? Math.max(1, produto.lote_minimo || 1) : 1;
                        const q = quantidades[produto.id] || step;
                        const custo = efetivoPontos(produto) * q;
                        if (!user) return 'Entrar para Resgatar';
                        if (produto.estoque <= 0 || q > produto.estoque) return 'Esgotado';
                        if ((user.pontos_acumulados||0) < custo) return `Faltam ${custo - (user.pontos_acumulados||0)} pontos`;
                        return `Resgatar (${custo} pts)`;
                      })()}
                    </Button>
                    <p className="text-xs text-gray-500">Após o resgate, um estabelecimento parceiro aceitará seu pedido em até 48 horas e seguirá com a distribuição via chat.</p>
                  </div>
                )}
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

        {/* Como Ganhar Pontos - Versão Compacta */}
        <Card className="mt-12 border-2 border-[#F7D426] bg-gradient-to-br from-[#FFF9E6] to-white shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-[#2C2C2C] mb-6 flex items-center justify-center gap-2">
              <Zap className="w-6 h-6 text-[#F7D426]" />
              Mais Formas de Ganhar Pontos
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#2C2C2C]">
                  <ShoppingBag className="w-8 h-8 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Compre Produtos</h3>
                <p className="text-sm text-gray-600">
                  Ganhe de 1 a 100 pontos por compra, dependendo da faixa de preço
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#2C2C2C]">
                  <Users className="w-8 h-8 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Indique Amigos</h3>
                <p className="text-sm text-gray-600">
                  100 pontos por cada amigo que completar o cadastro e permanecer 15 min
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#F7D426] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[#2C2C2C]">
                  <Crown className="w-8 h-8 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Planos Premium</h3>
                <p className="text-sm text-gray-600">
                  GOLD: 100 pts/mês | VIP: 300 pts/mês
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Chat do Pedido */}
        <Dialog open={!!pedidoChatId} onOpenChange={(o)=>!o && setPedidoChatId(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chat do Pedido</DialogTitle>
            </DialogHeader>
            {pedidoChatId && <ChatPedido pedidoId={pedidoChatId} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}