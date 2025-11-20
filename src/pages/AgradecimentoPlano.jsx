import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Home, CreditCard, Sparkles, Star, Crown, Gem, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";

const planosInfo = {
  // Planos Mapa da Estética
  cobre: { nome: "FREE", cor: "from-orange-400 to-amber-600", icone: Sparkles, tipo: "Mapa da Estética" },
  prata: { nome: "BÁSICO", cor: "from-gray-300 to-gray-500", icone: Star, tipo: "Mapa da Estética" },
  ouro: { nome: "PRO", cor: "from-yellow-400 to-amber-500", icone: Crown, tipo: "Mapa da Estética" },
  diamante: { nome: "PRIME", cor: "from-blue-400 to-cyan-500", icone: Gem, tipo: "Mapa da Estética" },
  platina: { nome: "PREMIUM", cor: "from-purple-500 to-pink-600", icone: Zap, tipo: "Mapa da Estética" },
  
  // Planos Patrocinadores
  'patrocinador-cobre': { nome: "COBRE", cor: "from-orange-400 to-amber-600", icone: Star, tipo: "Patrocinador" },
  'patrocinador-prata': { nome: "PRATA", cor: "from-gray-300 to-gray-500", icone: Star, tipo: "Patrocinador" },
  'patrocinador-ouro': { nome: "OURO", cor: "from-yellow-400 to-amber-500", icone: Crown, tipo: "Patrocinador" },
  'patrocinador-diamante': { nome: "DIAMANTE", cor: "from-blue-400 to-cyan-500", icone: Gem, tipo: "Patrocinador" },
  'patrocinador-platina': { nome: "PLATINA", cor: "from-purple-500 to-pink-600", icone: Zap, tipo: "Patrocinador" },
  
  // Clube da Beleza
  light: { nome: "LIGHT", cor: "from-blue-400 to-cyan-500", icone: Star, tipo: "Clube da Beleza" },
  gold: { nome: "GOLD", cor: "from-yellow-400 to-amber-500", icone: Crown, tipo: "Clube da Beleza" },
  vip: { nome: "VIP", cor: "from-purple-500 to-pink-600", icone: Zap, tipo: "Clube da Beleza" }
};

export default function AgradecimentoPlano() {
  const navigate = useNavigate();
  const [planoInfo, setPlanoInfo] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const planoId = params.get('plano');
    
    if (planoId && planosInfo[planoId]) {
      setPlanoInfo(planosInfo[planoId]);
    } else {
      // Se não encontrou plano, redireciona para início
      setTimeout(() => navigate(createPageUrl("Inicio")), 2000);
    }
  }, [navigate]);

  if (!planoInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  const IconComponent = planoInfo.icone;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-2xl overflow-hidden">
            <div className={`h-64 bg-gradient-to-br ${planoInfo.cor} relative overflow-hidden`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm"
                >
                  <Check className="w-16 h-16" strokeWidth={3} />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <h1 className="text-4xl md:text-5xl font-bold mb-2">
                    Parabéns! 🎉
                  </h1>
                  <p className="text-xl opacity-90">
                    Pagamento Confirmado
                  </p>
                </motion.div>
              </div>
            </div>

            <CardContent className="p-8 md:p-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center gap-3 mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-br ${planoInfo.cor} rounded-full flex items-center justify-center`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Obrigado por adquirir o
                </h2>
                <div className="flex flex-col items-center gap-3">
                  <Badge className={`bg-gradient-to-r ${planoInfo.cor} text-white text-2xl md:text-3xl px-8 py-3`}>
                    {planoInfo.nome}
                  </Badge>
                  <Badge variant="outline" className="text-base px-6 py-2">
                    {planoInfo.tipo}
                  </Badge>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-green-800 mb-3 flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    O que acontece agora?
                  </h3>
                  <ul className="space-y-3 text-sm text-green-700">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">1</span>
                      <span>Seu plano será ativado em até 24 horas pela nossa equipe.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">2</span>
                      <span>Você receberá um e-mail de confirmação assim que o plano estiver ativo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center font-bold text-xs mt-0.5">3</span>
                      <span>Acesse "Meu Plano" para acompanhar o status e aproveitar todos os benefícios.</span>
                    </li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => navigate(createPageUrl("MeuPlano"))}
                    size="lg"
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Ver Meu Plano
                  </Button>

                  <Button
                    onClick={() => navigate(createPageUrl("Inicio"))}
                    size="lg"
                    variant="outline"
                    className="w-full border-2 border-gray-300 hover:bg-gray-50 font-bold"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Voltar ao Início
                  </Button>
                </div>

                <div className="text-center pt-6 border-t">
                  <p className="text-sm text-gray-600 mb-2">
                    Alguma dúvida? Nossa equipe está pronta para ajudar!
                  </p>
                  <a
                    href="https://wa.me/5531972595643?text=Olá!%20Acabei%20de%20adquirir%20um%20plano%20e%20gostaria%20de%20tirar%20algumas%20dúvidas."
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                      💬 Falar com Suporte
                    </Button>
                  </a>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Cards de Benefícios Adicionais */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="grid md:grid-cols-3 gap-6 mt-8"
        >
          <Card className="text-center p-6 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold mb-2">Suporte Dedicado</h3>
            <p className="text-sm text-gray-600">
              Equipe pronta para ajudar no que você precisar
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold mb-2">Recursos Exclusivos</h3>
            <p className="text-sm text-gray-600">
              Acesso a todas as funcionalidades do seu plano
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold mb-2">Garantia Total</h3>
            <p className="text-sm text-gray-600">
              Satisfação garantida ou seu dinheiro de volta
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}