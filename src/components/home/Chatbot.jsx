
import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  X,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot({ user, onCompletarCadastro }) {
  const [chatAberto, setChatAberto] = useState(false); // Renamed from 'aberto'
  const [mensagens, setMensagens] = useState([]);
  const [inputMensagem, setInputMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState(null);
  // const [mostrarTooltip, setMostrarTooltip] = useState(false); // Removed
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if chat is open, click is outside the chat window, and not on the chatbot button itself
      if (chatAberto && chatRef.current && !chatRef.current.contains(event.target)) {
        const chatbotButton = document.getElementById('chatbot-button');
        if (chatbotButton && !chatbotButton.contains(event.target)) {
          setChatAberto(false);
        }
      }
    };

    if (chatAberto) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [chatAberto]); // Dependency updated

  useEffect(() => {
    if (chatAberto && mensagens.length === 0) { // Dependency updated
      // Verificar se usuário completou cadastro
      if (!user || !user.cadastro_completo) {
        setMensagens([
          {
            tipo: "bot",
            conteudo: "Olá! Sou o Dr. Beleza 🩺✨, seu assistente virtual!\n\nPara começar, preciso que você complete seu cadastro. É rápido e fácil!",
            opcoes: [
              { texto: "✅ Completar Cadastro", valor: "completar_cadastro" }
            ]
          }
        ]);
      } else {
        setMensagens([
          {
            tipo: "bot",
            conteudo: "Olá! Sou o Dr. Beleza 🩺✨, seu assistente virtual!\n\nPara que eu possa te ajudar melhor, você é:",
            opcoes: [
              { texto: "👤 Paciente/Cliente", valor: "paciente" },
              { texto: "💼 Profissional da Estética", valor: "profissional" }
            ]
          }
        ]);
      }
    }
  }, [chatAberto, mensagens.length, user]); // Dependency updated

  const handleOpcaoInicial = (opcao) => {
    if (opcao.valor === "completar_cadastro") {
      setChatAberto(false); // Updated
      onCompletarCadastro();
      return;
    }
    handleEscolhaTipo(opcao.valor);
  };

  const handleEscolhaTipo = (tipo) => {
    setTipoUsuario(tipo);

    setMensagens(prev => [
      ...prev,
      { tipo: "usuario", conteudo: tipo === "paciente" ? "Sou paciente" : "Sou profissional" }
    ]);

    if (tipo === "paciente") {
      setTimeout(() => {
        setMensagens(prev => [
          ...prev,
          {
            tipo: "bot",
            conteudo: "Perfeito! Como posso te ajudar hoje?",
            opcoes: [
              { texto: "🔍 Encontrar profissionais", valor: "encontrar_profissionais" },
              { texto: "💆 Saber sobre tratamentos", valor: "tratamentos" },
              { texto: "📍 Profissionais perto de mim", valor: "perto_de_mim" },
              { texto: "❓ Tirar dúvidas", valor: "duvidas_paciente" }
            ]
          }
        ]);
      }, 500);
    } else {
      setTimeout(() => {
        setMensagens(prev => [
          ...prev,
          {
            tipo: "bot",
            conteudo: "Ótimo! Como posso ajudar seu negócio?",
            opcoes: [
              { texto: "📢 Criar anúncio", valor: "criar_anuncio" },
              { texto: "📊 Ver meus anúncios", valor: "meus_anuncios" },
              { texto: "💎 Conhecer planos", valor: "planos" },
              { texto: "🎯 Marketing digital", valor: "marketing" },
              { texto: "❓ Suporte técnico", valor: "suporte" }
            ]
          }
        ]);
      }, 500);
    }
  };

  const handleOpcao = async (opcao) => {
    setMensagens(prev => [
      ...prev,
      { tipo: "usuario", conteudo: opcao.texto }
    ]);

    setLoading(true);

    let resposta = "";

    if (tipoUsuario === "paciente") {
      switch (opcao.valor) {
        case "encontrar_profissionais":
          resposta = "Você pode encontrar profissionais de várias formas:\n\n1. Use a busca na página inicial\n2. Navegue pelas categorias\n3. Veja profissionais em destaque\n\nQue tipo de profissional você procura?";
          break;
        case "tratamentos":
          resposta = "Temos informações sobre diversos tratamentos:\n\n• Harmonização Facial\n• Depilação a Laser\n• Micropigmentação\n• Limpeza de Pele\n• E muito mais!\n\nVisite nosso Blog para saber mais sobre cada tratamento.";
          break;
        case "perto_de_mim":
          resposta = "Para encontrar profissionais perto de você:\n\n1. Informe sua cidade na busca\n2. Ative a localização do navegador\n3. Veja os profissionais mais próximos\n\nQual sua cidade?";
          break;
        case "duvidas_paciente":
          resposta = "Posso te ajudar com:\n\n• Como funciona a plataforma\n• Como encontrar profissionais\n• Informações sobre tratamentos\n• Contato com profissionais\n\nSobre o que você tem dúvida?";
          break;
        default:
          resposta = "Desculpe, não entendi. Poderia escolher uma das opções acima?";
          break;
      }
    } else {
      switch (opcao.valor) {
        case "criar_anuncio":
          resposta = "Para criar seu anúncio:\n\n1. Clique em 'Cadastrar Anúncio'\n2. Preencha suas informações\n3. Adicione fotos\n4. Publique!\n\n✨ Comece GRÁTIS agora!";
          break;
        case "meus_anuncios":
          resposta = "Acesse 'Meu Perfil' para:\n\n• Ver seus anúncios ativos\n• Editar informações\n• Ver estatísticas\n• Gerenciar contatos\n\nVocê já criou seu primeiro anúncio?";
          break;
        case "planos":
          resposta = "Temos 5 planos incríveis:\n\n🥉 COBRE - Grátis\n🥈 PRATA - R$ 99/mês\n🥇 OURO - R$ 197/mês (Mais Popular!)\n💎 DIAMANTE - R$ 297/mês\n👑 PLATINA - Sob Consulta\n\nQuer saber mais sobre algum plano específico?";
          break;
        case "marketing":
          resposta = "Oferecemos:\n\n• Criação de Google Negócios\n• Geração de imagens profissionais\n• Otimização SEO\n• Destaque nos resultados\n\nQual serviço te interessa?";
          break;
        case "suporte":
          resposta = "Precisa de ajuda? Entre em contato:\n\n📞 Central: (31) 97259-5643\n💻 Suporte: (54) 99155-4136\n📧 Email: Fale Conosco\n\nComo posso ajudar?";
          break;
        default:
          resposta = "Desculpe, não entendi. Poderia escolher uma das opções acima?";
          break;
      }
    }

    setTimeout(() => {
      setMensagens(prev => [
        ...prev,
        { tipo: "bot", conteudo: resposta }
      ]);
      setLoading(false);
    }, 1000);
  };

  const handleEnviarMensagem = (e) => {
    e.preventDefault();
    if (!inputMensagem.trim() || loading) return;

    setMensagens(prev => [...prev, {
      tipo: "usuario",
      conteudo: inputMensagem,
    }]);
    setInputMensagem("");
  };

  return (
    <>
      {/* Botão Flutuante */}
      <AnimatePresence>
        {!chatAberto && ( // Only show button if chat is not open
          <motion.button
            id="chatbot-button" // Keep ID for outside click logic
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setChatAberto(true)} // Opens chat
            className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full shadow-2xl flex items-center justify-center z-50 hover:scale-110 transition-transform group"
          >
            <div className="relative">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/f54646e8e_drbeleza.png"
                alt="Dr. Beleza"
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/48?text=Dr';
                }}
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <span className="absolute -top-10 right-0 bg-white text-gray-800 px-3 py-1 rounded-lg shadow-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              💬 Fale com Dr. Beleza
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Janela do Chat */}
      <AnimatePresence>
        {chatAberto && ( // Renders if chat is open
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col"
            style={{ height: '600px', maxHeight: 'calc(100vh - 3rem)' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/f54646e8e_drbeleza.png"
                    alt="Dr. Beleza"
                    className="w-12 h-12 rounded-full border-2 border-white object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/48?text=Dr';
                    }}
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="font-bold">Dr. Beleza</h3>
                  <p className="text-xs text-blue-100">Seu assistente inteligente</p>
                </div>
              </div>
              <button
                onClick={() => setChatAberto(false)} // Closes chat
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4"> {/* Added flex-1 to make it grow */}
              {mensagens.map((msg, index) => (
                <div key={index} className={`flex ${msg.tipo === "usuario" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.tipo === "usuario"
                      ? "bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] rounded-br-none"
                      : "bg-white shadow-md rounded-bl-none"
                  }`}>
                    <p className="text-sm whitespace-pre-line">{msg.conteudo}</p>

                    {msg.opcoes && (
                      <div className="mt-3 space-y-2">
                        {msg.opcoes.map((opcao, i) => (
                          <button
                            key={i}
                            onClick={() => !tipoUsuario && !user?.cadastro_completo ? handleOpcaoInicial(opcao) : !tipoUsuario ? handleEscolhaTipo(opcao.valor) : handleOpcao(opcao)}
                            className="w-full text-left px-3 py-2 bg-[#FFF9E6] hover:bg-[#F7D426] rounded-lg transition-colors text-sm font-medium text-[#2C2C2C]"
                          >
                            {opcao.texto}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white shadow-md rounded-2xl rounded-bl-none p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {tipoUsuario && user?.cadastro_completo && (
              <div className="p-4 border-t bg-white">
                <form onSubmit={handleEnviarMensagem} className="flex gap-2">
                  <Input
                    value={inputMensagem}
                    onChange={(e) => setInputMensagem(e.target.value)}
                    placeholder="Digite sua mensagem..."
                    className="flex-1"
                    disabled={loading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!inputMensagem.trim() || loading}
                    className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
