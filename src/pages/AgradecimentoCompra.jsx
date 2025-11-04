import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Sparkles, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function AgradecimentoCompra() {
  const navigate = useNavigate();

  useEffect(() => {
    // Efeito de confete
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-2xl overflow-hidden">
            {/* Header com gradiente */}
            <div className="h-32 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                </motion.div>
              </div>
            </div>

            <CardContent className="p-8 sm:p-12 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Badge className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-base px-4 py-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Bem-vindo(a)!
                </Badge>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Sua Assinatura foi Concluída! 🎉
                </h1>

                <p className="text-lg text-gray-600 mb-8">
                  Parabéns! Você agora faz parte da maior plataforma de profissionais de estética do Brasil.
                </p>

                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-8 border-2 border-yellow-200">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                    <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">Próximos Passos:</h3>
                  <ul className="text-left space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 font-bold mt-0.5">1.</span>
                      <span>Complete seu perfil com fotos e informações</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 font-bold mt-0.5">2.</span>
                      <span>Crie seus anúncios de serviços</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 font-bold mt-0.5">3.</span>
                      <span>Solicite verificação de documentos para ser um Profissional Verificado</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-pink-600 font-bold mt-0.5">4.</span>
                      <span>Comece a receber clientes!</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => navigate(createPageUrl("Perfil"))}
                    size="lg"
                    className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-lg h-14 shadow-lg"
                  >
                    Ver Meu Perfil
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>

                  <Button
                    onClick={() => navigate(createPageUrl("CadastrarAnuncio"))}
                    size="lg"
                    variant="outline"
                    className="w-full text-lg h-14"
                  >
                    Criar Meu Primeiro Anúncio
                    <Sparkles className="w-5 h-5 ml-2" />
                  </Button>

                  <Button
                    onClick={() => navigate(createPageUrl("Inicio"))}
                    variant="ghost"
                    className="w-full"
                  >
                    Ir para Página Inicial
                  </Button>
                </div>

                <p className="text-sm text-gray-500 mt-8">
                  Precisa de ajuda? Entre em contato conosco pelo WhatsApp: 
                  <a href="https://wa.me/5531972595643" className="text-pink-600 font-semibold ml-1 hover:underline">
                    (31) 97259-5643
                  </a>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-sm text-gray-600"
        >
          <p>💜 Obrigado por confiar no Mapa da Estética!</p>
        </motion.div>
      </div>
    </div>
  );
}