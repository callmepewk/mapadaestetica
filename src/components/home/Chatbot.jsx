import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const perguntasSugeridas = [
  "Como faço para criar um anúncio?",
  "Quais são os planos disponíveis?",
  "Como funciona o programa de pontos?",
  "Quanto custa anunciar?",
  "Como entro em contato com um profissional?",
  "Posso alterar meu plano depois?",
  "Como funciona a busca por localização?",
  "O que é a Calculadora de Laser?"
];

export default function Chatbot() {
  const [aberto, setAberto] = useState(false);
  const [minimizado, setMinimizado] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState([
    {
      tipo: "bot",
      texto: "Olá! 👋 Sou o assistente do Mapa da Estética. Como posso ajudá-lo hoje?",
      timestamp: new Date()
    }
  ]);
  const chatRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target) && aberto) {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [aberto]);

  const enviarMensagemMutation = useMutation({
    mutationFn: async (pergunta) => {
      const resposta = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o assistente virtual do Mapa da Estética e Clube da Beleza. 
        
        Responda à seguinte pergunta de forma amigável, útil e profissional em português:
        "${pergunta}"
        
        Informações importantes sobre a plataforma:
        - Somos uma plataforma que conecta profissionais de estética a clientes em todo Brasil
        - Temos 3 planos: Light (grátis), Gold e VIP com benefícios crescentes
        - Oferecemos mais de 64 categorias de serviços de estética
        - Temos mais de 3.000 profissionais parceiros
        - Contato: (21) 98034-3873 / WhatsApp
        - Horário de atendimento: Segunda a Sexta, 9h às 18h
        - Cadastro gratuito para profissionais no plano Light
        - Sistema de pontos e descontos para clientes
        - Agendamento online e chat direto com profissionais
        - Calculadora de Viabilidade de Laser desenvolvida pelo Dr. Jauru
        
        Responda de forma direta e objetiva em até 3 parágrafos curtos.
        Use emojis quando apropriado para deixar a conversa mais amigável.`,
      });
      return resposta;
    },
    onSuccess: (resposta) => {
      setConversa(prev => [...prev, {
        tipo: "bot",
        texto: resposta,
        timestamp: new Date()
      }]);
    },
  });

  const handleEnviarMensagem = (texto) => {
    if (!texto.trim()) return;

    setConversa(prev => [...prev, {
      tipo: "usuario",
      texto: texto,
      timestamp: new Date()
    }]);

    setMensagem("");
    enviarMensagemMutation.mutate(texto);
  };

  const handlePerguntaSugerida = (pergunta) => {
    handleEnviarMensagem(pergunta);
  };

  return (
    <>
      {/* Botão Flutuante */}
      <AnimatePresence>
        {!aberto && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setAberto(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-2xl hover:shadow-3xl transition-all group"
            style={{
              background: "linear-gradient(135deg, #F7D426 0%, #FFE066 100%)"
            }}
          >
            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/6aa7c4ea6_image.png"
                alt="Assistente"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 right-0 bg-[#F7D426] rounded-full p-1 border-2 border-white">
              <MessageCircle className="w-4 h-4 text-[#2C2C2C]" />
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Janela do Chat */}
      <AnimatePresence>
        {aberto && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: minimizado ? "auto" : "600px"
            }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] sm:w-96 shadow-2xl rounded-2xl overflow-hidden"
          >
            <Card className="border-none h-full flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] p-4 flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/6aa7c4ea6_image.png"
                    alt="Assistente"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#2C2C2C]">Assistente Virtual</h3>
                  <p className="text-xs text-[#2C2C2C]/80 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Online
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setMinimizado(!minimizado)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <Minimize2 className="w-4 h-4 text-[#2C2C2C]" />
                  </button>
                  <button
                    onClick={() => setAberto(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-[#2C2C2C]" />
                  </button>
                </div>
              </div>

              {!minimizado && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {conversa.map((msg, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.tipo === "usuario" ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.tipo === "usuario"
                            ? "bg-[#F7D426] text-[#2C2C2C] rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none shadow-md"
                        }`}>
                          <p className="text-sm whitespace-pre-line">{msg.texto}</p>
                          <p className="text-xs mt-1 opacity-70">
                            {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {enviarMensagemMutation.isPending && (
                      <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-bl-none px-4 py-3 shadow-md">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sugestões */}
                    {conversa.length === 1 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Sparkles className="w-3 h-3" />
                          <span>Sugestões de perguntas:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {perguntasSugeridas.slice(0, 4).map((pergunta, index) => (
                            <button
                              key={index}
                              onClick={() => handlePerguntaSugerida(pergunta)}
                              className="text-xs bg-white hover:bg-[#FFF9E6] border border-gray-200 hover:border-[#F7D426] rounded-full px-3 py-2 transition-all"
                            >
                              {pergunta}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 bg-white border-t">
                    <div className="flex gap-2">
                      <Input
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !enviarMensagemMutation.isPending) {
                            handleEnviarMensagem(mensagem);
                          }
                        }}
                        placeholder="Digite sua pergunta..."
                        className="flex-1"
                        disabled={enviarMensagemMutation.isPending}
                      />
                      <Button
                        onClick={() => handleEnviarMensagem(mensagem)}
                        disabled={!mensagem.trim() || enviarMensagemMutation.isPending}
                        className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}