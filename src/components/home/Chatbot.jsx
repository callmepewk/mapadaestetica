
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot({ user, onCompletarCadastro }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: user 
        ? `Olá ${user.full_name?.split(' ')[0] || 'amigo'}! 👋 Sou o Dr. Beleza, seu assistente virtual. Como posso te ajudar hoje?`
        : "Olá! 👋 Sou o Dr. Beleza, seu assistente virtual. Para continuar, por favor faça login ou crie sua conta gratuita!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Verificar se usuário está logado
    if (!user) {
      setMessages(prev => [...prev, 
        { type: "user", text: inputMessage },
        { 
          type: "bot", 
          text: "Para usar o chat, você precisa fazer login ou criar uma conta gratuita! 🔐",
          action: "login"
        }
      ]);
      setInputMessage("");
      return;
    }

    // Verificar se cadastro está completo
    if (!user.cadastro_completo) {
      setMessages(prev => [...prev,
        { type: "user", text: inputMessage },
        {
          type: "bot",
          text: "Para usar o chat, você precisa completar seu cadastro primeiro! 📝",
          action: "completar_cadastro"
        }
      ]);
      setInputMessage("");
      return;
    }

    const userMessage = inputMessage;
    setInputMessage("");
    setMessages(prev => [...prev, { type: "user", text: userMessage }]);
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o Dr. Beleza, um assistente especializado em estética e beleza para a plataforma Mapa da Estética.
        
Contexto do usuário:
- Nome: ${user.full_name}
- Tipo: ${user.tipo_usuario === 'profissional' ? 'Profissional de estética' : 'Cliente/Paciente'}
- Cidade: ${user.cidade || 'não informada'}
- Estado: ${user.estado || 'não informado'}

Sua missão: Ajudar o usuário com dúvidas sobre:
1. Procedimentos estéticos (como funcionam, indicações, contraindicações)
2. Encontrar profissionais qualificados
3. Navegar pela plataforma
4. Tirar dúvidas sobre tratamentos

Seja amigável, profissional e sempre incentive o usuário a consultar profissionais qualificados.

Pergunta do usuário: ${userMessage}

Responda de forma clara, objetiva e útil.`,
      });

      setMessages(prev => [...prev, { type: "bot", text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: "bot", 
        text: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente!" 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action === "login") {
      base44.auth.redirectToLogin(window.location.pathname);
    } else if (action === "completar_cadastro") {
      setIsOpen(false);
      if (onCompletarCadastro) {
        onCompletarCadastro();
      }
    }
  };

  return (
    <>
      {/* Botão Flutuante - MOBILE OPTIMIZED */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40"
          >
            <div className="relative group">
              {/* Tooltip - ESCONDIDO NO MOBILE */}
              <div className="hidden sm:block absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-900 text-white text-sm rounded-lg py-3 px-4 shadow-xl max-w-xs">
                  <p className="font-bold mb-1">💬 Dr. Beleza - Seu Assistente Virtual</p>
                  <p className="text-xs text-gray-300">
                    Posso te ajudar com: procedimentos estéticos, dúvidas sobre tratamentos, 
                    encontrar profissionais e navegar pela plataforma!
                  </p>
                  <div className="absolute -bottom-2 right-4 w-4 h-4 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>

              {/* Botão com Imagem - MENOR NO MOBILE */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl border-4 border-[#F7D426] overflow-hidden hover:scale-110 transition-transform duration-300"
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/ec64a4c52_drbeleza.png"
                  alt="Dr. Beleza"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden w-full h-full bg-gradient-to-r from-[#F7D426] to-[#FFE066] items-center justify-center">
                  <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7 text-[#2C2C2C]" />
                </div>

                {/* Bolinha Online - MENOR NO MOBILE */}
                <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full border-2 border-white">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Janela do Chat - MOBILE OPTIMIZED */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 right-0 left-0 sm:bottom-6 sm:right-6 sm:left-auto z-50 sm:w-96 sm:max-w-[calc(100vw-3rem)]"
          >
            <Card className="border-none shadow-2xl overflow-hidden rounded-t-2xl sm:rounded-2xl h-[80vh] sm:h-auto flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] p-3 sm:p-4 flex items-center justify-between border-b-2 border-[#2C2C2C] flex-shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe4/f54646e8e_drbeleza.png" 
                      alt="Dr. Beleza"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.innerHTML = '<span class="text-xl sm:text-2xl">🩺</span>';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C2C2C] text-sm sm:text-base">Dr. Beleza</h3>
                    <p className="text-xs text-[#2C2C2C]/80">Assistente Virtual</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-[#2C2C2C] hover:bg-[#2C2C2C]/10 w-8 h-8 sm:w-10 sm:h-10"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

              {/* Mensagens - SCROLLABLE */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 space-y-3 sm:space-y-4 min-h-0">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-2.5 sm:p-3 ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] border-2 border-[#2C2C2C]"
                          : "bg-white shadow-md"
                      }`}
                    >
                      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{message.text}</p>
                      
                      {/* Botões de Ação */}
                      {message.action && (
                        <div className="mt-2 sm:mt-3">
                          {message.action === "login" && (
                            <Button
                              onClick={() => handleActionClick("login")}
                              size="sm"
                              className="w-full bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold text-xs sm:text-sm"
                            >
                              <User className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              Fazer Login
                            </Button>
                          )}
                          {message.action === "completar_cadastro" && (
                            <Button
                              onClick={() => handleActionClick("completar_cadastro")}
                              size="sm"
                              className="w-full bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold text-xs sm:text-sm"
                            >
                              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              Completar Cadastro
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white shadow-md rounded-2xl p-2.5 sm:p-3">
                      <div className="flex gap-1.5 sm:gap-2">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F7D426] rounded-full animate-bounce"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F7D426] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#F7D426] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input - FIXO NO BOTTOM */}
              <div className="p-3 sm:p-4 bg-white border-t flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={user && user.cadastro_completo ? "Digite..." : "Faça login..."}
                    className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                    disabled={!user || !user.cadastro_completo}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !inputMessage.trim() || !user || !user.cadastro_completo}
                    className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C] w-9 h-9 sm:w-10 sm:h-10 p-0"
                    size="icon"
                  >
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
