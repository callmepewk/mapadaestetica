import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  ArrowLeft,
  Zap
} from "lucide-react";
import { motion } from "framer-motion";

const planosDisponiveis = {
  cobre: {
    nome: "FREE",
    cor: "from-orange-400 to-amber-600",
    icone: Sparkles,
    beneficios: [
      "1 Especialidade cadastrada",
      "1 Anúncio ativo",
      "1 Tag para exposição",
      "3 dias de exposição",
      "Perfil básico na plataforma",
      "Suporte por email",
      "Estatísticas básicas"
    ],
    limites: {
      especialidades: 1,
      anuncios: 1,
      tags: 1
    }
  },
  lite: {
    nome: "LITE",
    cor: "from-rose-300 to-pink-500",
    icone: Sparkles,
    beneficios: [
      "Acesso ao WhatsApp dos profissionais",
      "1 Especialidade cadastrada",
      "Até 3 anúncios ativos",
      "2 Tags",
      "30 dias de exposição",
      "Leve destaque de perfil",
      "Estatísticas essenciais"
    ],
    limites: { especialidades: 1, anuncios: 3, tags: 2 }
  },
  prata: {
    nome: "BÁSICO",
    cor: "from-gray-300 to-gray-500",
    icone: Star,
    beneficios: [
      "2 Especialidades cadastradas",
      "10 Anúncios ativos",
      "5 Tags para exposição",
      "7 dias de exposição",
      "Perfil destacado",
      "Suporte prioritário",
      "Estatísticas avançadas",
      "Badge de verificação",
      "Aparece nas buscas principais"
    ],
    limites: {
      especialidades: 2,
      anuncios: 10,
      tags: 5
    }
  },
  ouro: {
    nome: "PRO",
    cor: "from-yellow-400 to-amber-500",
    icone: Crown,
    beneficios: [
      "3 Especialidades cadastradas",
      "15 Anúncios ativos",
      "10 Tags premium",
      "14 dias de exposição",
      "Prioridade alta nas buscas",
      "Perfil premium com destaque dourado",
      "Suporte VIP",
      "Estatísticas completas",
      "Selo PRO Verificado",
      "Aparece em posição privilegiada",
      "Galeria ampliada"
    ],
    limites: {
      especialidades: 3,
      anuncios: 15,
      tags: 10
    }
  },
  diamante: {
    nome: "PRIME",
    cor: "from-blue-400 to-cyan-500",
    icone: Zap,
    beneficios: [
      "5 Especialidades cadastradas",
      "25 Anúncios ativos",
      "20 Tags premium",
      "21 dias de exposição",
      "Prioridade máxima nas buscas",
      "Perfil PRIME exclusivo",
      "Suporte VIP 24/7",
      "Relatórios profissionais completos",
      "Selo PRIME Verificado",
      "Destaque na home",
      "Galeria ilimitada",
      "WhatsApp Business básico"
    ],
    limites: {
      especialidades: 5,
      anuncios: 25,
      tags: 20
    }
  },
  platina: {
    nome: "DELUXE",
    cor: "from-purple-500 to-pink-600",
    icone: Crown,
    beneficios: [
      "Especialidades ILIMITADAS",
      "Anúncios ILIMITADOS",
      "100 Tags premium",
      "30 dias de exposição",
      "WhatsApp Business API completo",
      "Assistente IA personalizado",
      "Prioridade ABSOLUTA",
      "Destaque permanente exclusivo",
      "Suporte VIP 24/7 dedicado",
      "Gerente de conta exclusivo",
      "Analytics profissional completo",
      "Marketing digital incluso",
      "Selo DELUXE Premium",
      "Conteúdo patrocinado mensal",
      "Campanhas personalizadas"
    ],
    limites: {
      especialidades: "Ilimitadas",
      anuncios: "Ilimitados",
      tags: 100
    }
  }
};

export default function MeuPlano() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trialRestanteMs, setTrialRestanteMs] = useState(0);
  const planoAtual = user?.plano_ativo || 'cobre';
  const trialAtivo = !!user?.plano_trial_ativo;
  const trialFimISO = user?.plano_trial_fim || null;

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

  // Trial countdown (ensure hook order stable)
  useEffect(() => {
    if (!trialAtivo || !trialFimISO) return;
    const fim = new Date(trialFimISO).getTime();
    const tick = () => setTrialRestanteMs(Math.max(0, fim - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [trialAtivo, trialFimISO]);

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


  useEffect(() => {
    if (!trialAtivo || !trialFimISO) return;
    const fim = new Date(trialFimISO).getTime();
    const tick = () => setTrialRestanteMs(Math.max(0, fim - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [trialAtivo, trialFimISO]);

  const formatarTempo = (ms) => {
    const totalSec = Math.floor(ms / 1000);
    const dias = Math.floor(totalSec / 86400);
    const horas = Math.floor((totalSec % 86400) / 3600);
    const minutos = Math.floor((totalSec % 3600) / 60);
    const segundos = totalSec % 60;
    return `${dias}d ${horas}h ${minutos}m ${segundos}s`;
  };
  const planoInfo = planosDisponiveis[planoAtual];
  const IconeAtual = planoInfo.icone;

  // The planoNome logic is now simplified by directly using planoInfo.nome
  const planoNome = planoInfo.nome;

  const outrosPlanos = Object.entries(planosDisponiveis).filter(([key]) => key !== planoAtual);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Perfil"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-12">
          <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
            Mapa da Estética
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Gerenciar Plano de Anúncios
          </h1>
          <p className="text-gray-600">
            Veja seus benefícios e explore opções de upgrade
          </p>
        </div>

        {/* Trial Banner */}
        {trialAtivo && (
          trialRestanteMs > 0 ? (
            <Alert className="max-w-4xl mx-auto mb-6 bg-green-50 border-green-200">
              <AlertDescription className="text-green-800">
                🎁 Você está em um período grátis! Tempo restante: <strong>{formatarTempo(trialRestanteMs)}</strong>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="max-w-4xl mx-auto mb-6 bg-yellow-50 border-yellow-200">
              <AlertDescription className="text-yellow-800 flex items-center justify-between gap-3">
                <span>⚠️ Seu período grátis terminou. Assine um plano para continuar em destaque.</span>
                <Button size="sm" onClick={() => navigate(createPageUrl("Planos"))} className="bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]">Ver Planos</Button>
              </AlertDescription>
            </Alert>
          )
        )}

        {/* Current Plan Card */}
        <Card className="border-none shadow-2xl mb-12 overflow-hidden">
          <div className={`h-48 bg-gradient-to-br ${planoInfo.cor} p-8 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
            
            <div className="relative z-10 text-white">
              <Badge className="mb-4 bg-white/20 text-white border-none">
                Plano Atual - Mapa da Estética
              </Badge>
              <div className="flex items-center gap-4">
                <IconeAtual className="w-16 h-16" />
                <div>
                  <h2 className="text-4xl font-bold">{planoNome}</h2>
                  <p className="text-white/80">Membro desde {user.data_adesao_plano ? new Date(user.data_adesao_plano).toLocaleDateString('pt-BR') : 'sempre'}</p>
                </div>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
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

              <div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
                  <h3 className="text-xl font-bold mb-4">Seus Limites</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Especialidades:</span>
                      <Badge className="bg-purple-100 text-purple-800">{planoInfo.limites.especialidades}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Anúncios:</span>
                      <Badge className="bg-blue-100 text-blue-800">{planoInfo.limites.anuncios}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tags:</span>
                      <Badge className="bg-pink-100 text-pink-800">{planoInfo.limites.tags}</Badge>
                    </div>
                  </div>
                </div>

                <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-none">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm mb-1">Vantagens do Plano</p>
                        <p className="text-xs text-gray-600">
                          {planoAtual === 'diamante' || planoAtual === 'platina' 
                            ? 'Seu anúncio aparece com prioridade nas buscas!' 
                            : 'Faça upgrade para ter prioridade nas buscas'}
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
                const ordem = ['cobre', 'prata', 'ouro', 'diamante', 'platina'];
                const isUpgrade = ordem.indexOf(key) > ordem.indexOf(planoAtual);
                
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
                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-4 mb-4">
                          <h4 className="font-bold mb-2 text-center">Limites</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Especialidades:</span>
                              <span className="font-bold">{plano.limites.especialidades}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Anúncios:</span>
                              <span className="font-bold">{plano.limites.anuncios}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tags:</span>
                              <span className="font-bold">{plano.limites.tags}</span>
                            </div>
                          </div>
                        </div>

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

                        <a href={`https://wa.me/5531972595643?text=${encodeURIComponent(`Olá! Tenho interesse no plano ${plano.nome} do Mapa da Estética! 💆‍♀️`)}`} target="_blank" rel="noopener noreferrer">
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
                        </a>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* Help Section - CORRIGIDO: Adicionado botão para Sobre Nós */}
        <Card className="mt-12 border-none shadow-xl bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-bold mb-3">Precisa de Ajuda?</h3>
            <p className="text-gray-600 mb-6">
              Nossa equipe está pronta para ajudá-lo a escolher o melhor plano para suas necessidades
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`https://wa.me/5531972595643?text=${encodeURIComponent("Olá! Preciso de ajuda com os planos do Mapa da Estética! 💆‍♀️")}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                  Falar com Suporte
                </Button>
              </a>
              <Link to={createPageUrl("Planos")}>
                <Button size="lg" variant="outline">
                  Ver Todos os Planos
                </Button>
              </Link>
              <Link to={createPageUrl("SobreNos")}>
                <Button size="lg" className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] font-bold">
                  Conteúdo Exclusivo Clube da Beleza
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}