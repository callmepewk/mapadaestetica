
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
      {/* Botão Flutuante com Imagem do Dr. Beleza */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div className="relative group">
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-900 text-white text-sm rounded-lg py-3 px-4 shadow-xl max-w-xs">
                  <p className="font-bold mb-1">💬 Dr. Beleza - Seu Assistente Virtual</p>
                  <p className="text-xs text-gray-300">
                    Posso te ajudar com: procedimentos estéticos, dúvidas sobre tratamentos, 
                    encontrar profissionais e navegar pela plataforma!
                  </p>
                  <div className="absolute -bottom-2 right-4 w-4 h-4 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>

              {/* Botão com Imagem */}
              <button
                onClick={() => setIsOpen(true)}
                className="relative w-16 h-16 rounded-full shadow-2xl border-4 border-[#F7D426] overflow-hidden hover:scale-110 transition-transform duration-300"
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
                  <MessageCircle className="w-7 h-7 text-[#2C2C2C]" />
                </div>

                {/* Bolinha Online */}
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white">
                  <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Janela do Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
          >
            <Card className="border-none shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] p-4 flex items-center justify-between border-b-2 border-[#2C2C2C]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white flex items-center justify-center">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe4/f54646e8e_drbeleza.png" 
                      alt="Dr. Beleza"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.innerHTML = '<span class="text-2xl">🩺</span>';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C2C2C]">Dr. Beleza</h3>
                    <p className="text-xs text-[#2C2C2C]/80">Assistente Virtual</p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-[#2C2C2C] hover:bg-[#2C2C2C]/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Mensagens */}
              <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] border-2 border-[#2C2C2C]"
                          : "bg-white shadow-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      
                      {/* Botões de Ação */}
                      {message.action && (
                        <div className="mt-3">
                          {message.action === "login" && (
                            <Button
                              onClick={() => handleActionClick("login")}
                              size="sm"
                              className="w-full bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold"
                            >
                              <User className="w-4 h-4 mr-2" />
                              Fazer Login
                            </Button>
                          )}
                          {message.action === "completar_cadastro" && (
                            <Button
                              onClick={() => handleActionClick("completar_cadastro")}
                              size="sm"
                              className="w-full bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold"
                            >
                              <Sparkles className="w-4 h-4 mr-2" />
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
                    <div className="bg-white shadow-md rounded-2xl p-3">
                      <div className="flex gap-2">
                        <div className="w-2 h-2 bg-[#F7D426] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#F7D426] rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                        <div className="w-2 h-2 bg-[#F7D426] rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={user && user.cadastro_completo ? "Digite sua mensagem..." : "Faça login para conversar..."}
                    className="flex-1"
                    disabled={!user || !user.cadastro_completo}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={loading || !inputMessage.trim() || !user || !user.cadastro_completo}
                    className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]"
                  >
                    <Send className="w-5 h-5" />
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
