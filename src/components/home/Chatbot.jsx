import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, X, Send, Sparkles, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const perguntasSugeridas = {
  paciente: [
    "🔍 Como encontrar profissionais verificados?",
    "💰 Qual o preço médio dos procedimentos?",
    "📍 Quais profissionais estão próximos a mim?",
    "💉 Como funciona o preenchimento facial?",
    "✨ Quais são os tratamentos de pele mais indicados?",
    "⭐ Como escolher um bom profissional?",
    "📅 Como marcar uma consulta?"
  ],
  profissional: [
    "📣 Como cadastrar meu anúncio?",
    "⭐ Como verificar meu perfil profissional?",
    "💎 Quais são os benefícios dos planos?",
    "🚀 Como impulsionar meu anúncio?",
    "📈 Como atrair mais clientes?",
    "🎯 Como me destacar na plataforma?",
    "💳 Como funciona o sistema de pontos?"
  ]
};

export default function Chatbot({ user, onCompletarCadastro }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: user
        ? `Olá ${user.full_name?.split(' ')[0] || 'amigo'}! 👋 Sou o Dr da Beleza, seu assistente virtual. Como posso te ajudar hoje?`
        : "Olá! 👋 Sou o Dr da Beleza, seu assistente virtual. Para continuar, por favor faça login ou crie sua conta gratuita!"
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const tipoPerguntasSugeridas = user?.tipo_usuario === 'profissional'
    ? perguntasSugeridas.profissional
    : perguntasSugeridas.paciente;

  const handleSendMessage = async (mensagemTexto) => {
    const messageToSend = mensagemTexto || inputMessage.trim();
    if (!messageToSend) return;

    if (!user) {
      setMessages(prev => [
        ...prev,
        { type: "user", text: messageToSend },
        { type: "bot", text: "Para usar o chat, você precisa fazer login ou criar uma conta gratuita! 🔐", action: "login" }
      ]);
      setInputMessage("");
      setMostrarSugestoes(false);
      return;
    }

    if (!user.cadastro_completo) {
      setMessages(prev => [
        ...prev,
        { type: "user", text: messageToSend },
        { type: "bot", text: "Para usar o chat, você precisa completar seu cadastro primeiro! 📝", action: "completar_cadastro" }
      ]);
      setInputMessage("");
      setMostrarSugestoes(false);
      return;
    }

    setInputMessage("");
    setMostrarSugestoes(false);
    setMessages(prev => [...prev, { type: "user", text: messageToSend }]);
    setLoading(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é o Dr da Beleza, um assistente especializado em estética e beleza para a plataforma Mapa da Estética.\n\nContexto do usuário:\n- Nome: ${user.full_name}\n- Tipo: ${user.tipo_usuario === 'profissional' ? 'Profissional de estética' : 'Cliente/Paciente'}\n- Cidade: ${user.cidade || 'não informada'}\n- Estado: ${user.estado || 'não informado'}\n\nSua missão: Ajudar o usuário com dúvidas sobre procedimentos, encontrar profissionais, navegar pela plataforma e tirar dúvidas.\nResponda de forma clara, objetiva e útil.\n\nPergunta do usuário: ${messageToSend}`,
      });
      setMessages(prev => [...prev, { type: "bot", text: typeof response === 'string' ? response : (response?.content || 'Certo!') }]);
    } catch (error) {
      setMessages(prev => [...prev, { type: "bot", text: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSugestaoClick = (sugestao) => {
    const perguntaLimpa = sugestao.replace(/^[^\s]+\s/, '');
    handleSendMessage(perguntaLimpa);
  };

  const handleActionClick = (action) => {
    if (action === "login") {
      base44.auth.redirectToLogin(window.location.pathname);
    } else if (action === "completar_cadastro") {
      setIsOpen(false);
      if (onCompletarCadastro) onCompletarCadastro();
    }
  };

  // Auto scroll e foco
  useEffect(() => {
    try { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); } catch {}
    if (isOpen && user?.cadastro_completo) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [messages, loading, isOpen, user?.cadastro_completo]);

  return (
    <>
      {/* Botão Flutuante */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 sm:bottom-6 right-6 z-[9999]"
          >
            <div className="relative group">
              <div className="hidden sm:block absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-gray-900 text-white text-sm rounded-lg py-3 px-4 shadow-xl max-w-xs">
                  <p className="font-bold mb-1">💬 Dr da Beleza - Seu Assistente Virtual</p>
                  <p className="text-xs text-gray-300">Ajudo com procedimentos, dúvidas, encontrar profissionais e navegar na plataforma.</p>
                  <div className="absolute -bottom-2 right-4 w-4 h-4 bg-gray-900 transform rotate-45"></div>
                </div>
              </div>

              <button
                aria-label="Abrir chat Dr da Beleza"
                onClick={() => setIsOpen(true)}
                className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl border-2 border-[#F7D426] overflow-hidden hover:scale-110 transition-transform duration-300 bg-[#F7D426]"
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/ec64a4c52_drbeleza.png"
                  alt="Dr da Beleza"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full flex items-center justify-center bg-[#F7D426]';
                    fallback.innerText = '💬';
                    e.currentTarget.parentElement?.appendChild(fallback);
                  }}
                />
                {/* Pulse */}
                <div className="absolute inset-0 rounded-full bg-[#F7D426] opacity-30 animate-pulse pointer-events-none" />
              </button>
              <div className="sm:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-xs font-bold text-[#F7D426] bg-white px-2 py-1 rounded-full shadow-md border border-[#F7D426]">Dr da Beleza</span>
              </div>
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
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[10000] w-full p-2 sm:p-0 sm:w-[320px] md:w-[380px] sm:max-w-[calc(100vw-3rem)]"
          >
            {/* Overlay mobile (fecha ao clicar fora) */}
            <div
              className="sm:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[9990]"
              onClick={() => setIsOpen(false)}
            />

            {/* Card do Chat - garantir z-index acima do overlay */}
            <Card className="relative sm:border-none shadow-2xl overflow-hidden rounded-t-2xl sm:rounded-2xl h-[60vh] sm:h-[60vh] md:h-[480px] flex flex-col z-[10000] pointer-events-auto">
              {/* Header */}
              <div className="sticky top-0 z-50 bg-gradient-to-r from-[#F7D426] to-[#FFE066] p-4 flex items-center justify-between border-b-2 border-[#2C2C2C] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-[#2C2C2C]">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/ec64a4c52_drbeleza.png"
                      alt="Dr da Beleza"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#2C2C2C] text-base sm:text-lg">Dr da Beleza</h3>
                    <p className="text-xs text-[#2C2C2C]/80">Assistente Virtual • Online</p>
                  </div>
                </div>
                <Button
                  aria-label="Fechar chat"
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-[#2C2C2C] hover:bg-[#2C2C2C]/10 w-10 h-10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Mensagens (scroll interno) */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 bg-gray-50 space-y-4 min-h-0">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3 ${
                        message.type === "user"
                          ? "bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] border-2 border-[#2C2C2C]"
                          : "bg-white shadow-md"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
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

                {mostrarSugestoes && user && user.cadastro_completo && messages.length <= 1 && (
                  <div className="space-y-3">
                    <div className="text-center">
                      <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {user.tipo_usuario === 'profissional' ? '💼 Perguntas para Profissionais' : '👩‍⚕️ Perguntas Frequentes'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {tipoPerguntasSugeridas.map((sugestao, index) => (
                        <button
                          key={index}
                          onClick={() => handleSugestaoClick(sugestao)}
                          className="text-left p-3 rounded-lg bg-white border-2 border-gray-200 hover:border-[#F7D426] hover:bg-[#FFF9E6] transition-all text-sm shadow-sm"
                        >
                          {sugestao}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

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
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t flex-shrink-0">
                <form
                  className="flex gap-2"
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                >
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={user && user.cadastro_completo ? "Digite sua mensagem..." : "Faça login primeiro..."}
                    className="flex-1 text-sm h-10"
                    disabled={!user || !user.cadastro_completo}
                    aria-label="Mensagem"
                  />
                  <Button
                    type="submit"
                    onClick={() => handleSendMessage()}
                    disabled={loading || !inputMessage.trim() || !user || !user.cadastro_completo}
                    className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C] w-10 h-10 p-0"
                    size="icon"
                    aria-label="Enviar mensagem"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </form>
              </div>
            </Card>

            {/* Overlay desktop para fechar clicando fora (atrás do card) */}
            <div
              className="hidden sm:block fixed inset-0 z-[9000] bg-transparent"
              onClick={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}