import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Check,
  Star,
  Crown,
  Sparkles,
  ArrowRight,
  Gift,
  Award,
  TrendingUp,
  ArrowLeft
} from "lucide-react";
import { motion } from "framer-motion";

const planosDisponiveis = {
  light: {
    nome: "LIGHT",
    cor: "from-gray-400 to-gray-500",
    icone: Sparkles,
    beneficios: [
      "Sem mensalidade",
      "Checkup da Pele",
      "Oferece descontos e benefícios",
      "Acumula pontos ao consumir produtos ou serviços",
      "Aceito em mais de 3.000 serviços e profissionais",
      "CHÁ DA BELEZA - Voucher mensal não cumulativo"
    ],
    pontos_mensais: 0
  },
  gold: {
    nome: "GOLD",
    cor: "from-yellow-400 to-amber-500",
    icone: Star,
    beneficios: [
      "Programa Spa da Pele - incluso kit Beauty Drink",
      "12 sessões Skincare Mood* Clube+",
      "Crédito automático de 250 pontos/mês",
      "Oferece descontos e benefícios na Rede Parceiro",
      "Aceito em mais de 3.000 serviços",
      "Check da Pele - dermahelp/teleconsulta 50%",
      "Beauty Pass Máquinas da Beleza*",
      "CHÁ DA BELEZA - Voucher mensal cortesia"
    ],
    pontos_mensais: 250
  },
  vip: {
    nome: "VIP",
    cor: "from-purple-500 to-pink-500",
    icone: Crown,
    beneficios: [
      "SOFTLIFT CLUBERS",
      "Botox Day + Injetável AH",
      "Check da Up Pele anual",
      "Beauty Pass VIP Face Skincare",
      "Beauty Pass VIP Máquinas da Beleza",
      "CHA DA BELEZA - Beauty Drink Anytime",
      "Eventos exclusivos para sócios",
      "Programas de tratamento exclusivos"
    ],
    pontos_mensais: 500
  }
};

export default function MeuPlano() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        navigate(createPageUrl("Inicio"));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const planoAtual = user.plano_ativo || 'light';
  const planoInfo = planosDisponiveis[planoAtual];
  const IconeAtual = planoInfo.icone;
  const pontosAtuais = user.pontos_acumulados || 0;
  const proximoNivel = pontosAtuais < 1000 ? 1000 : pontosAtuais < 5000 ? 5000 : 10000;
  const progressoPontos = (pontosAtuais / proximoNivel) * 100;

  const outrosPlanos = Object.entries(planosDisponiveis).filter(([key]) => key !== planoAtual);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Perfil"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
            Meu Plano Clube+
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Gerenciar Plano e Pontos
          </h1>
          <p className="text-gray-600">
            Veja seus benefícios e explore opções de upgrade
          </p>
        </div>

        {/* Current Plan Card */}
        <Card className="border-none shadow-2xl mb-12 overflow-hidden">
          <div className={`h-48 bg-gradient-to-br ${planoInfo.cor} p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
            
            <div className="relative z-10 text-white">
              <Badge className="mb-4 bg-white/20 text-white border-none">
                Plano Atual
              </Badge>
              <div className="flex items-center gap-4">
                <IconeAtual className="w-16 h-16" />
                <div>
                  <h2 className="text-4xl font-bold">{planoInfo.nome}</h2>
                  <p className="text-white/80">Membro desde {user.data_adesao_plano ? new Date(user.data_adesao_plano).toLocaleDateString('pt-BR') : 'sempre'}</p>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Benefits */}
              <div>
                <h3 className="text-xl font-bold mb-4">Seus Benefícios</h3>
                <div className="space-y-3">
                  {planoInfo.beneficios.map((beneficio, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm text-gray-600">{beneficio}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Points */}
              <div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Meus Pontos</h3>
                    <Gift className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-center mb-4">
                    <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {pontosAtuais}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">pontos acumulados</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Próximo nível: {proximoNivel} pts</span>
                      <span>{Math.round(progressoPontos)}%</span>
                    </div>
                    <Progress value={progressoPontos} className="h-2" />
                  </div>
                </div>

                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Pontos Mensais</p>
                        <p className="text-xs text-gray-600">
                          {planoInfo.pontos_mensais > 0 
                            ? `Você recebe ${planoInfo.pontos_mensais} pontos automáticos todo mês`
                            : 'Acumule pontos consumindo na rede parceira'
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upgrade Options */}
        {outrosPlanos.length > 0 && (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Faça Upgrade do Seu Plano
              </h2>
              <p className="text-gray-600">
                Desbloqueie mais benefícios e vantagens exclusivas
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {outrosPlanos.map(([key, plano], index) => {
                const Icone = plano.icone;
                const isUpgrade = ['light', 'gold', 'vip'].indexOf(key) > ['light', 'gold', 'vip'].indexOf(planoAtual);
                
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-none shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <div className={`h-32 bg-gradient-to-br ${plano.cor} p-6 relative overflow-hidden`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                        
                        <div className="relative z-10 text-white flex items-center gap-3">
                          <Icone className="w-12 h-12" />
                          <div>
                            <h3 className="text-2xl font-bold">{plano.nome}</h3>
                            {isUpgrade && (
                              <Badge className="bg-white/20 text-white border-none mt-1">
                                <TrendingUp className="w-3 h-3 mr-1" />
                                Upgrade
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        <div className="space-y-3 mb-6">
                          {plano.beneficios.slice(0, 5).map((beneficio, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                                <Check className="w-3 h-3 text-green-600" />
                              </div>
                              <span className="text-sm text-gray-600">{beneficio}</span>
                            </div>
                          ))}
                          {plano.beneficios.length > 5 && (
                            <p className="text-xs text-gray-500 ml-8">
                              + {plano.beneficios.length - 5} benefícios adicionais
                            </p>
                          )}
                        </div>

                        {plano.pontos_mensais > 0 && (
                          <div className="bg-purple-50 p-3 rounded-lg mb-4">
                            <p className="text-sm font-semibold text-purple-900">
                              🎁 {plano.pontos_mensais} pontos automáticos/mês
                            </p>
                          </div>
                        )}

                        <Link to={createPageUrl("FaleConosco")}>
                          <Button
                            className={`w-full ${
                              isUpgrade
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                : "bg-gray-900 hover:bg-gray-800"
                            }`}
                          >
                            {isUpgrade ? 'Fazer Upgrade' : 'Consultar Plano'}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Help Section */}
        <Card className="mt-12 border-none shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-3">Precisa de Ajuda?</h3>
            <p className="text-gray-600 mb-6">
              Nossa equipe está pronta para ajudá-lo a escolher o melhor plano para suas necessidades
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to={createPageUrl("FaleConosco")}>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Falar com Suporte
                </Button>
              </Link>
              <Link to={createPageUrl("Planos")}>
                <Button size="lg" variant="outline">
                  Ver Todos os Planos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}