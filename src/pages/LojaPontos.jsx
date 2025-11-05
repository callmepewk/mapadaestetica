import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Star,
  Gift,
  TrendingUp,
  Award,
  Check,
  Sparkles,
  Crown,
  ShoppingCart,
  ArrowRight,
  Coins
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const recompensas = [
  {
    id: "beautycoin",
    nome: "1 BeautyCoin",
    descricao: "Moeda virtual para usar em produtos e serviços exclusivos da plataforma",
    pontosNecessarios: 100,
    icone: "💎",
    categoria: "Moedas Virtuais",
    beneficios: [
      "Use em qualquer produto da loja",
      "Válido por 12 meses",
      "Acumule e troque por prêmios maiores"
    ],
    destaque: true
  },
  {
    id: "desconto-10",
    nome: "Cupom de 10% OFF",
    descricao: "Desconto de 10% em qualquer serviço da rede parceira",
    pontosNecessarios: 250,
    icone: "🎫",
    categoria: "Descontos",
    beneficios: [
      "Válido para serviços da rede",
      "Válido por 30 dias",
      "Pode ser usado em múltiplos serviços"
    ]
  },
  {
    id: "consulta-gratuita",
    nome: "Consulta Estética Gratuita",
    descricao: "Consulta online gratuita com profissional especializado",
    pontosNecessarios: 500,
    icone: "💆",
    categoria: "Serviços",
    beneficios: [
      "30 minutos com profissional",
      "Orientação personalizada",
      "Agendamento prioritário"
    ]
  },
  {
    id: "desconto-20",
    nome: "Cupom de 20% OFF",
    descricao: "Desconto de 20% em qualquer serviço da rede parceira",
    pontosNecessarios: 750,
    icone: "🎁",
    categoria: "Descontos",
    beneficios: [
      "Desconto maior para economia",
      "Válido por 60 dias",
      "Use em tratamentos premium"
    ]
  },
  {
    id: "kit-produtos",
    nome: "Kit de Produtos Premium",
    descricao: "Kit completo de produtos profissionais para cuidados em casa",
    pontosNecessarios: 1000,
    icone: "🎀",
    categoria: "Produtos",
    beneficios: [
      "4 produtos full size",
      "Marcas renomadas",
      "Entrega grátis"
    ],
    destaque: true
  },
  {
    id: "upgrade-plano",
    nome: "Upgrade de Plano (1 mês)",
    descricao: "Upgrade gratuito para o próximo plano por 1 mês",
    pontosNecessarios: 1500,
    icone: "👑",
    categoria: "Benefícios Exclusivos",
    beneficios: [
      "Acesso a recursos premium",
      "Destaque nos resultados",
      "Suporte prioritário"
    ]
  },
  {
    id: "sessao-gratis",
    nome: "Sessão Gratuita de Tratamento",
    descricao: "Uma sessão gratuita de tratamento estético à escolha",
    pontosNecessarios: 2000,
    icone: "✨",
    categoria: "Serviços",
    beneficios: [
      "Escolha o tratamento",
      "Profissionais verificados",
      "Válido por 90 dias"
    ],
    destaque: true
  }
];

export default function LojaPontos() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resgatando, setResgatando] = useState(null);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);

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

  const handleResgatar = async (recompensa) => {
    if (!user || user.pontos_acumulados < recompensa.pontosNecessarios) {
      alert("Você não tem pontos suficientes para resgatar esta recompensa.");
      return;
    }

    if (!confirm(`Deseja resgatar ${recompensa.nome} por ${recompensa.pontosNecessarios} pontos?`)) {
      return;
    }

    setResgatando(recompensa.id);

    try {
      // Atualizar pontos do usuário
      const novosPontos = user.pontos_acumulados - recompensa.pontosNecessarios;
      await base44.auth.updateMe({ pontos_acumulados: novosPontos });

      // Atualizar estado local
      setUser({ ...user, pontos_acumulados: novosPontos });

      // Mostrar mensagem de sucesso
      setMensagemSucesso(`🎉 Parabéns! Você resgatou ${recompensa.nome} com sucesso!`);

      // Limpar mensagem após 5 segundos
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 5000);

      // Se for BeautyCoin, enviar notificação via WhatsApp
      if (recompensa.id === "beautycoin") {
        const mensagem = `Olá! Acabei de resgatar 1 BeautyCoin (100 pontos) na Loja de Pontos do Mapa da Estética! 💎`;
        window.open(`https://wa.me/5531972595643?text=${encodeURIComponent(mensagem)}`, '_blank');
      }

    } catch (error) {
      console.error("Erro ao resgatar recompensa:", error);
      alert("Erro ao resgatar recompensa. Tente novamente.");
    } finally {
      setResgatando(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#F7D426] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando sua loja de pontos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
            <Star className="w-4 h-4 mr-2" />
            Loja de Pontos
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Troque Seus Pontos por Recompensas
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Acumule pontos com suas compras e atividades na plataforma e troque por descontos, produtos e serviços exclusivos!
          </p>
        </div>

        {/* Mensagem de Sucesso */}
        {mensagemSucesso && (
          <Alert className="mb-8 bg-green-50 border-green-200">
            <Check className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 font-medium">
              {mensagemSucesso}
            </AlertDescription>
          </Alert>
        )}

        {/* Card de Saldo */}
        <Card className="mb-8 border-none shadow-xl bg-gradient-to-r from-[#F7D426] to-[#FFE066] overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                  <Star className="w-10 h-10 text-[#F7D426]" />
                </div>
                <div>
                  <p className="text-[#2C2C2C]/70 font-medium mb-1">Seu Saldo</p>
                  <p className="text-5xl font-bold text-[#2C2C2C]">
                    {user?.pontos_acumulados || 0}
                  </p>
                  <p className="text-[#2C2C2C]/70 text-sm mt-1">pontos disponíveis</p>
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-[#2C2C2C] font-bold mb-2">Como Ganhar Mais Pontos?</p>
                <div className="space-y-1 text-sm text-[#2C2C2C]/80">
                  <p>✓ Comprando produtos na loja</p>
                  <p>✓ Contratando serviços</p>
                  <p>✓ Indicando amigos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Grid de Recompensas */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recompensas.map((recompensa, index) => {
            const podeResgatar = user?.pontos_acumulados >= recompensa.pontosNecessarios;

            return (
              <motion.div
                key={recompensa.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`relative overflow-hidden hover:shadow-2xl transition-all duration-300 border-none ${
                  recompensa.destaque ? "ring-2 ring-[#F7D426]" : ""
                }`}>
                  {recompensa.destaque && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-[#F7D426] to-[#FFE066] text-[#2C2C2C] px-4 py-1 text-xs font-bold">
                      ⭐ DESTAQUE
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-3">{recompensa.icone}</div>
                      <Badge className="mb-2 text-xs">{recompensa.categoria}</Badge>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {recompensa.nome}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {recompensa.descricao}
                      </p>
                    </div>

                    <div className="space-y-2 mb-4">
                      {recompensa.beneficios.map((beneficio, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                          <Check className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{beneficio}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Custo:</span>
                        <span className="text-2xl font-bold text-[#F7D426] flex items-center gap-1">
                          {recompensa.pontosNecessarios}
                          <Star className="w-5 h-5" />
                        </span>
                      </div>

                      <Button
                        onClick={() => handleResgatar(recompensa)}
                        disabled={!podeResgatar || resgatando === recompensa.id}
                        className={`w-full ${
                          podeResgatar
                            ? "bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] font-bold"
                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        {resgatando === recompensa.id ? (
                          "Resgatando..."
                        ) : podeResgatar ? (
                          <>
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Resgatar Agora
                          </>
                        ) : (
                          `Faltam ${recompensa.pontosNecessarios - (user?.pontos_acumulados || 0)} pontos`
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Como Funciona */}
        <Card className="mt-12 border-none shadow-lg">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Como Funciona o Sistema de Pontos?
            </h2>

            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F7D426] to-[#FFE066] rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">1. Compre</h3>
                <p className="text-sm text-gray-600">
                  Faça compras e contrate serviços na plataforma
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F7D426] to-[#FFE066] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">2. Acumule</h3>
                <p className="text-sm text-gray-600">
                  Ganhe pontos automaticamente em cada transação
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F7D426] to-[#FFE066] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">3. Troque</h3>
                <p className="text-sm text-gray-600">
                  Resgate por recompensas exclusivas
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F7D426] to-[#FFE066] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#2C2C2C]" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">4. Aproveite</h3>
                <p className="text-sm text-gray-600">
                  Use seus benefícios e economize
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Quer ganhar mais pontos? Explore nossos produtos e serviços!
          </p>
          <Button
            onClick={() => navigate("/produtos")}
            size="lg"
            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
          >
            Ver Produtos
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}