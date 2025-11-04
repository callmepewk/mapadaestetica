
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

export default function Chatbot() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([]);
  const [inputMensagem, setInputMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [tipoUsuario, setTipoUsuario] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [mensagens]);

  useEffect(() => {
    if (aberto && mensagens.length === 0) {
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
  }, [aberto, mensagens.length]); // Added mensagens.length to dependency array to ensure it only runs once per open

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
    } else { // tipo === "profissional"
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
    } else { // tipoUsuario === "profissional"
      switch (opcao.valor) {
        case "criar_anuncio":
          resposta = "Para criar seu anúncio:\n\n1. Clique em 'Cadastrar Anúncio'\n2. Preencha suas informações\n3. Adicione fotos\n4. Publique!\n\n✨ Comece GRÁTIS agora!";
          break;
        case "meus_anuncios":
          resposta = "Acesse 'Meu Perfil' para:\n\n• Ver seus anúncios ativos\n• Editar informações\n• Ver estatísticas\n• Gerenciar contatos\n\nVocê já criou seu primeiro anúncio?";
          break;
        case "planos":
          resposta = "Temos 4 planos incríveis:\n\n🆓 FREE - Comece grátis\n⭐ BÁSICO - R$ 99/mês\n💎 AVANÇADO - R$ 297/mês (Mais Popular!)\n👑 PREMIUM - Consulte\n\nQuer saber mais sobre algum plano específico?";
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

    // As per the outline, free-form text input does not trigger a bot response
    // after the initial menu-driven flow, unless specific logic is added here.
    // For now, it only adds the user's message to the chat.
  };

  return (
    <>
      {/* Botão Flutuante */}
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setAberto(!aberto)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
        >
          {aberto ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
        </motion.button>
      </AnimatePresence>

      {/* Janela do Chatbot */}
      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] shadow-2xl rounded-2xl overflow-hidden"
          >
            <Card className="border-none overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/acc7e047d_drbeleza.png"
                      alt="Dr. Beleza"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold">Dr. Beleza</h3>
                    <p className="text-xs text-white/90">Seu assistente virtual</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {mensagens.map((msg, index) => (
                  <div key={index} className={`flex ${msg.tipo === "usuario" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl p-3 ${
                      msg.tipo === "usuario" 
                        ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-br-none" 
                        : "bg-white shadow-md rounded-bl-none"
                    }`}>
                      <p className="text-sm whitespace-pre-line">{msg.conteudo}</p>
                      
                      {msg.opcoes && (
                        <div className="mt-3 space-y-2">
                          {msg.opcoes.map((opcao, i) => (
                            <button
                              key={i}
                              onClick={() => !tipoUsuario ? handleEscolhaTipo(opcao.valor) : handleOpcao(opcao)}
                              className="w-full text-left px-3 py-2 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors text-sm font-medium text-pink-900"
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

              {/* Input - desabilitado se não escolheu tipo */}
              {tipoUsuario && (
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
                      className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
