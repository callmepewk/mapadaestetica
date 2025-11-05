import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Star, ArrowRight, Sparkles, Gift } from "lucide-react";
import { motion } from "framer-motion";

export default function AgradecimentoCompra() {
  const navigate = useNavigate();
  const [dadosCompra, setDadosCompra] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tipo = urlParams.get('tipo'); // produto, servico, plano
    const nome = urlParams.get('nome');
    const pontos = urlParams.get('pontos');

    setDadosCompra({ tipo, nome, pontos });
  }, []);

  if (!dadosCompra) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7D426]"></div>
      </div>
    );
  }

  const getTipoTexto = () => {
    switch(dadosCompra.tipo) {
      case 'produto':
        return 'produto';
      case 'servico':
        return 'serviço';
      case 'plano':
        return 'plano';
      default:
        return 'item';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-none shadow-2xl overflow-hidden">
            {/* Header com gradiente */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <CheckCircle className="w-24 h-24 text-white mx-auto mb-4" />
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                🎉 Compra Realizada!
              </h1>
              <p className="text-white/90 text-lg">
                Obrigado pela sua confiança!
              </p>
            </div>

            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Informações da compra */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-green-700 mb-1">Você adquiriu:</p>
                      <h2 className="text-2xl font-bold text-green-900 mb-2">
                        {decodeURIComponent(dadosCompra.nome || getTipoTexto())}
                      </h2>
                      <p className="text-sm text-green-700">
                        Tipo: <span className="font-semibold capitalize">{getTipoTexto()}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pontos ganhos */}
                {dadosCompra.pontos && parseInt(dadosCompra.pontos) > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center">
                        <Star className="w-6 h-6 text-white fill-white" />
                      </div>
                      <div>
                        <p className="text-sm text-yellow-700 mb-1">Você ganhou:</p>
                        <p className="text-3xl font-bold text-yellow-900">
                          +{dadosCompra.pontos} pontos
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          Use seus pontos para resgatar produtos exclusivos!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Próximos passos */}
                <div className="space-y-4">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#F7D426]" />
                    Próximos Passos
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-[#F7D426] rounded-full flex items-center justify-center text-[#2C2C2C] font-bold text-sm flex-shrink-0">
                        1
                      </span>
                      <div>
                        <p className="font-semibold text-sm">Acompanhe seu pedido</p>
                        <p className="text-xs text-gray-600">Você receberá atualizações por email e no perfil</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-[#F7D426] rounded-full flex items-center justify-center text-[#2C2C2C] font-bold text-sm flex-shrink-0">
                        2
                      </span>
                      <div>
                        <p className="font-semibold text-sm">Acumule mais pontos</p>
                        <p className="text-xs text-gray-600">Continue comprando e resgate produtos exclusivos</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <span className="w-6 h-6 bg-[#F7D426] rounded-full flex items-center justify-center text-[#2C2C2C] font-bold text-sm flex-shrink-0">
                        3
                      </span>
                      <div>
                        <p className="font-semibold text-sm">Compartilhe sua experiência</p>
                        <p className="text-xs text-gray-600">Deixe uma avaliação e ajude outros usuários</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={() => navigate(createPageUrl("Perfil"))}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold"
                    size="lg"
                  >
                    Ver Meu Perfil
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    onClick={() => navigate(createPageUrl("LojaPontos"))}
                    variant="outline"
                    className="flex-1 border-2 border-[#F7D426] text-[#F7D426] hover:bg-[#FFF9E6]"
                    size="lg"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Loja de Pontos
                  </Button>
                </div>

                <Button
                  onClick={() => navigate(createPageUrl("Inicio"))}
                  variant="ghost"
                  className="w-full text-gray-600"
                >
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mensagem motivacional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-8 text-gray-600"
        >
          <p className="text-sm">
            💚 Obrigado por fazer parte do <span className="font-bold text-[#F7D426]">Mapa da Estética</span>!
          </p>
        </motion.div>
      </div>
    </div>
  );
}