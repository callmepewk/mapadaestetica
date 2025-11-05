
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"; // New import
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
  Coins,
  Users, // New import
  Copy, // New import
  Link as LinkIcon, // New import
  CheckCircle2, // New import
  AlertCircle // New import
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const recompensas = [
  {
    id: "beautycoin",
    nome: "1 BeautyCoin",
    descricao: "Moeda virtual para usar em produtos e serviços exclusivos da plataforma",
    pontosNecessarios: 100,
    icone: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/290130570_image.png",
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
  const [linkIndicacao, setLinkIndicacao] = useState(""); // New state
  const [linkCopiado, setLinkCopiado] = useState(false); // New state
  const [indicacoes, setIndicacoes] = useState([]); // New state

  // Stores interval IDs for cleanup
  const intervalRefs = React.useRef({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        let userData = await base44.auth.me();
        
        // Generate referral code if not exists
        if (!userData.codigo_indicacao) {
          const codigo = `${userData.email.split('@')[0]}_${Date.now().toString(36)}`.toUpperCase();
          await base44.auth.updateMe({ codigo_indicacao: codigo });
          userData = { ...userData, codigo_indicacao: codigo }; // Update local userData
        }

        setUser(userData);

        // Generate referral link
        const link = `${window.location.origin}?ref=${userData.codigo_indicacao}`;
        setLinkIndicacao(link);

        // Fetch user's own referrals (where current user is the referrer)
        const minhasIndicacoes = await base44.entities.IndicacaoAmigo.filter(
          { usuario_indicador_email: userData.email },
          '-created_date',
          100
        );
        setIndicacoes(minhasIndicacoes);

      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        base44.auth.redirectToLogin(window.location.pathname);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();

    // Intervalo para atualizar pontos a cada 5 segundos (garantir sincronização)
    const pontosInterval = setInterval(async () => {
      try {
        const userData = await base44.auth.me();
        setUser(prevUser => ({
          ...prevUser,
          pontos_acumulados: userData.pontos_acumulados
        }));
      } catch (error) {
        console.error("Erro ao atualizar pontos:", error);
      }
    }, 5000);

    return () => {
      clearInterval(pontosInterval);
      Object.values(intervalRefs.current).forEach(clearInterval); // Existing cleanup for referral intervals
    };
  }, []);

  // Effect for referral code checking and time tracking
  useEffect(() => {
    const checkReferralCode = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      
      if (refCode && user) {
        // Do not allow user to refer themselves
        if (refCode === user.codigo_indicacao) {
          console.log("Não pode usar o próprio link de indicação.");
          return;
        }

        // Check if referral already exists for the current user and refCode
        const existingReferrals = await base44.entities.IndicacaoAmigo.filter(
          { 
            codigo_indicacao: refCode,
            usuario_indicado_email: user.email
          },
          '-created_date',
          1
        );

        if (existingReferrals.length === 0) { // If it's a new referral for this user
          // Find the referrer user
          const allUsers = await base44.entities.User.list();
          const referrerUser = allUsers.find(u => u.codigo_indicacao === refCode);

          if (referrerUser) {
            try {
              // Simulate IP (in production, would be from server or request headers)
              const ipSimulado = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
              
              const newReferral = await base44.entities.IndicacaoAmigo.create({
                usuario_indicador_email: referrerUser.email,
                codigo_indicacao: refCode,
                ip_acesso: ipSimulado,
                data_acesso: new Date().toISOString(),
                status: "em_andamento",
                usuario_indicado_email: user.email, // Store the email of the referred user
                validado: false,
                tempo_permanencia_minutos: 0
              });

              // Mark current user as referred by someone
              await base44.auth.updateMe({ indicado_por: refCode });

              // Start time tracking for this new referral
              startTimeTracking(newReferral.id, refCode, referrerUser.email);
            } catch (error) {
              console.error("Erro ao registrar indicação:", error);
            }
          }
        } else {
          // If referral already exists but might not be validated yet, restart tracking if needed
          const existingRef = existingReferrals[0];
          if (!existingRef.validado) {
            startTimeTracking(existingRef.id, refCode, existingRef.usuario_indicador_email);
          }
        }
      }
    };

    if (user && !loading) {
      checkReferralCode();
    }

    // Cleanup function for intervals (this one is specific to referral tracking, the main one is in the first useEffect)
    return () => {
      // Not strictly necessary here as the main useEffect cleanup handles all intervalRefs.current
      // But keeping it for logical separation if this effect were to manage its own intervals.
    };
  }, [user, loading]); // Depend on user and loading to ensure user data is ready

  const startTimeTracking = (referralId, refCode, referrerEmail) => {
    // Clear any existing interval for this referralId to prevent duplicates
    if (intervalRefs.current[referralId]) {
      clearInterval(intervalRefs.current[referralId]);
    }

    const startTime = Date.now();
    
    // Update time every 10 seconds (for more granular updates, but still good for demo)
    const interval = setInterval(async () => {
      const tempoDecorrido = Math.floor((Date.now() - startTime) / 1000); // in seconds
      const tempoDecorridoMinutos = Math.floor(tempoDecorrido / 60); // in minutes
      
      try {
        const currentReferral = await base44.entities.IndicacaoAmigo.get(referralId);

        if (currentReferral && !currentReferral.validado) {
          // Update only if the current user is the indicated user for this referral
          if (currentReferral.usuario_indicado_email === user.email) {
            await base44.entities.IndicacaoAmigo.update(referralId, {
              tempo_permanencia_minutos: tempoDecorridoMinutos
            });

            // If 15 minutes reached and user's profile is complete, validate
            // Note: `user.cadastro_completo` is a hypothetical field. Adjust as per actual user model.
            if (tempoDecorridoMinutos >= 15 && user.cadastro_completo) {
              await validarIndicacao(currentReferral, referrerEmail);
              clearInterval(interval);
              delete intervalRefs.current[referralId];
            }
          }
        } else {
          // If referral is already validated or doesn't exist, stop tracking
          clearInterval(interval);
          delete intervalRefs.current[referralId];
        }
      } catch (error) {
        console.error(`Erro ao atualizar tempo para indicação ${referralId}:`, error);
      }
    }, 10000); // Check every 10 seconds

    intervalRefs.current[referralId] = interval;

    // Stop tracking after a maximum of 30 minutes to prevent resource leak
    setTimeout(() => {
      if (intervalRefs.current[referralId]) {
        clearInterval(intervalRefs.current[referralId]);
        delete intervalRefs.current[referralId];
      }
    }, 30 * 60 * 1000); // 30 minutes
  };

  const validarIndicacao = async (indicacaoRecord, referrerEmail) => {
    try {
      // Mark referral as validated
      await base44.entities.IndicacaoAmigo.update(indicacaoRecord.id, {
        validado: true,
        status: "validado",
        data_validacao: new Date().toISOString(),
        cadastro_completo: true // Assuming indicated user's cadastro is complete
      });

      // Find the referrer user to update their points and validated count
      const allUsers = await base44.entities.User.list();
      const referrer = allUsers.find(u => u.email === referrerEmail);

      if (referrer) {
        const newValidatedReferralsCount = (referrer.amigos_indicados_validados || 0) + 1;
        let pointsBonusTotal = referrer.total_pontos_indicacao || 0;
        let currentPoints = referrer.pontos_acumulados || 0;

        if (newValidatedReferralsCount % 5 === 0) {
          pointsBonusTotal += 100;
          currentPoints += 100;

          // Mark that points were credited for this cycle
          // This ensures points are only given once per 5 validated referrals
          await base44.entities.IndicacaoAmigo.update(indicacaoRecord.id, {
            pontos_creditados: true
          });

          // Send WhatsApp notification to referrer
          if (referrer.whatsapp) {
            const mensagem = `🎉 Parabéns! Você indicou 5 amigos com sucesso e ganhou 100 pontos no Mapa da Estética! Continue indicando e ganhando mais recompensas! 💎`;
            window.open(`https://wa.me/${referrer.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`, '_blank');
          }
        }

        // Update referrer's user data
        await base44.entities.User.update(referrer.id, {
          amigos_indicados_validados: newValidatedReferralsCount,
          total_pontos_indicacao: pointsBonusTotal,
          pontos_acumulados: currentPoints
        });
        
        // Refresh the current user's (referrer's) local state if they are the referrer
        if (user.email === referrerEmail) {
          setUser(prevUser => ({
            ...prevUser,
            amigos_indicados_valificados: newValidatedReferralsCount,
            total_pontos_indicacao: pointsBonusTotal,
            pontos_acumulados: currentPoints
          }));
        }

        // Refresh the list of own indications
        const updatedIndicacoes = await base44.entities.IndicacaoAmigo.filter(
          { usuario_indicador_email: user.email },
          '-created_date',
          100
        );
        setIndicacoes(updatedIndicacoes);
      }
    } catch (error) {
      console.error("Erro ao validar indicação:", error);
    }
  };

  const copiarLinkIndicacao = () => {
    navigator.clipboard.writeText(linkIndicacao);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

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
      // Update user points
      const novosPontos = user.pontos_acumulados - recompensa.pontosNecessarios;
      await base44.auth.updateMe({ pontos_acumulados: novosPontos });

      // Update local state
      setUser({ ...user, pontos_acumulados: novosPontos });

      // Show success message
      setMensagemSucesso(`🎉 Parabéns! Você resgatou ${recompensa.nome} com sucesso!`);

      // Clear message after 5 seconds
      setTimeout(() => {
        setMensagemSucesso(null);
      }, 5000);

      // If BeautyCoin, send WhatsApp notification
      if (recompensa.id === "beautycoin") {
        const mensagem = `Olá! Acabei de resgatar 1 BeautyCoin (100 pontos) na Loja de Pontos do Mapa da Estética! 💎`;
        // Assuming this number is for the platform's support or admin, not the user's
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

  // Calculate progress for referral cycle
  // The line below was redundant as `user?.amigos_indicados_validados` directly reflects the count.
  // const currentValidatedReferrals = indicacoes.filter(i => i.validado).length;
  const progressoIndicacoes = (user?.amigos_indicados_validados || 0) % 5;
  const proximaRecompensa = 5 - progressoIndicacoes;

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

        {/* Card de Saldo - COM ATUALIZAÇÃO EM TEMPO REAL */}
        <Card className="mb-8 border-none shadow-xl bg-gradient-to-r from-[#F7D426] to-[#FFE066] overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-pulse">
                  <Star className="w-10 h-10 text-[#F7D426]" />
                </div>
                <div>
                  <p className="text-[#2C2C2C]/70 font-medium mb-1">Seu Saldo Atual</p>
                  <p className="text-5xl font-bold text-[#2C2C2C]">
                    {user?.pontos_acumulados || 0}
                  </p>
                  <p className="text-[#2C2C2C]/70 text-sm mt-1">pontos disponíveis</p>
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-[#2C2C2C] font-bold mb-3">💡 Como Ganhar Mais Pontos?</p>
                <div className="space-y-2 text-sm text-[#2C2C2C]/80">
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                    <span className="font-bold text-[#2C2C2C]">$</span>
                    <span>= 1 ponto (a cada R$10 gastos)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                    <span className="font-bold text-[#2C2C2C]">$$</span>
                    <span>= 5 pontos (a cada R$50 gastos)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                    <span className="font-bold text-[#2C2C2C]">$$$</span>
                    <span>= 10 pontos (a cada R$100 gastos)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                    <span className="font-bold text-[#2C2C2C]">$$$$</span>
                    <span>= 50 pontos (a cada R$500 gastos)</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-2 rounded-lg">
                    <span className="font-bold text-[#2C2C2C]">$$$$$</span>
                    <span>= 100 pontos (a cada R$1000 gastos)</span>
                  </div>
                  <p className="mt-2 text-xs text-[#2C2C2C]/70">✓ Indicando amigos (100 pontos a cada 5 amigos validados)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Indicação de Amigos */}
        <Card className="mb-8 border-none shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Indique Amigos e Ganhe Pontos!</h2>
                <p className="text-gray-600">Ganhe 100 pontos a cada 5 amigos indicados com sucesso</p>
              </div>
            </div>

            {/* Progresso */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Seu Progresso Atual</span>
                <span className="text-sm font-bold text-purple-600">
                  {user?.amigos_indicados_validados || 0} amigos validados
                </span>
              </div>
              
              <div className="relative">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500"
                    style={{ width: `${(progressoIndicacoes / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2 px-1"> {/* Added padding for alignment */}
                  {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="text-center relative">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        progressoIndicacoes >= num 
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {progressoIndicacoes >= num ? '✓' : num}
                      </div>
                      {num === 5 && (
                        <div className="absolute -right-2 top-0 transform translate-x-full mt-0.5 ml-1">
                          <Coins className="w-4 h-4 text-[#F7D426]" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <p className="text-sm text-center">
                  {proximaRecompensa > 0 ? (
                    <span className="font-semibold text-purple-900">
                      Faltam apenas {proximaRecompensa} amigo{proximaRecompensa > 1 ? 's' : ''} para ganhar 100 pontos! 🎉
                    </span>
                  ) : (
                    <span className="font-semibold text-green-900">
                      Você acabou de completar um ciclo! Continue indicando para ganhar mais 100 pontos! 💎
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Link de Indicação */}
            <div className="bg-white rounded-lg p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-purple-600" />
                Seu Link Exclusivo de Indicação
              </h3>
              <div className="flex gap-2">
                <Input 
                  value={linkIndicacao} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  onClick={copiarLinkIndicacao}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {linkCopiado ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Regras */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">📋 Como Funciona?</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold">1</span>
                  </div>
                  <p className="text-gray-700">
                    <strong>Compartilhe seu link exclusivo</strong> com amigos que ainda não são cadastrados.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold">2</span>
                  </div>
                  <p className="text-gray-700">
                    Seus amigos devem <strong>acessar pelo link, se cadastrar completamente</strong> e <strong>permanecer pelo menos 15 minutos</strong> navegando no site.
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 font-bold">3</span>
                  </div>
                  <p className="text-gray-700">
                    A cada <strong>5 amigos indicados com sucesso</strong>, você ganha <strong className="text-purple-600">100 pontos!</strong>
                  </p>
                </div>

                <Alert className="bg-yellow-50 border-yellow-200 mt-4">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 text-xs">
                    <strong>Importante:</strong> Não vale usar seu próprio link! Nosso sistema detecta o IP e valida automaticamente. 
                    Apenas indicações genuínas de novos usuários contam para o bônus.
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            {/* Lista de Indicações */}
            {indicacoes.length > 0 && (
              <div className="bg-white rounded-lg p-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-4">📊 Suas Indicações</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {indicacoes.map((indicacao, index) => (
                    <div key={indicacao.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          indicacao.validado 
                            ? 'bg-green-100 text-green-600' 
                            : indicacao.status === 'em_andamento' 
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {indicacao.validado ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {indicacao.usuario_indicado_email || 'Aguardando cadastro...'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {indicacao.validado 
                              ? `✓ Validado - ${indicacao.tempo_permanencia_minutos || 0} min`
                              : `Em andamento - ${indicacao.tempo_permanencia_minutos || 0} min`
                            }
                          </p>
                        </div>
                      </div>
                      <Badge className={
                        indicacao.validado 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }>
                        {indicacao.validado ? 'Validado' : indicacao.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                      {recompensa.id === 'beautycoin' ? (
                        <img 
                          src={recompensa.icone} 
                          alt="BeautyCoin" 
                          className="w-24 h-24 mx-auto mb-3 object-contain"
                        />
                      ) : (
                        <div className="text-6xl mb-3">{recompensa.icone}</div>
                      )}
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
