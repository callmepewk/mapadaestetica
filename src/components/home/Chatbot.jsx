
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
  const [mostrarTooltip, setMostrarTooltip] = useState(false);
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
  }, [aberto, mensagens.length]);

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
  };

  return (
    <>
      {/* Botão Flutuante com imagem do Dr. Beleza - MAIOR */}
      <AnimatePresence>
        <div 
          className="fixed bottom-6 right-6 z-50"
          onMouseEnter={() => setMostrarTooltip(true)}
          onMouseLeave={() => setMostrarTooltip(false)}
        >
          {/* Tooltip/Nuvem Informativa */}
          <AnimatePresence>
            {mostrarTooltip && !aberto && (
              <motion.div
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="absolute right-24 bottom-0 mb-2"
              >
                <div className="relative bg-white rounded-2xl shadow-2xl p-4 max-w-xs border-2 border-blue-200">
                  {/* Seta da nuvem */}
                  <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 bg-white border-r-2 border-t-2 border-blue-200 rotate-45"></div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/acc7e047d_drbeleza.png"
                        alt="Dr. Beleza"
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 mb-1">Dr. Beleza 🩺✨</p>
                      <p className="text-sm text-gray-600">
                        Seu assistente virtual! Tire dúvidas sobre tratamentos, encontre profissionais e muito mais.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setAberto(!aberto)}
            className="relative w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform overflow-hidden"
          >
            {/* Bolinha de Online */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-white shadow-lg"
            ></motion.div>

            {aberto ? (
              <X className="w-8 h-8 text-white" />
            ) : (
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/acc7e047d_drbeleza.png"
                alt="Dr. Beleza"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path></svg>';
                }}
              />
            )}
          </motion.button>
        </div>
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
              {/* Header com cor do Dr. Beleza */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/acc7e047d_drbeleza.png"
                      alt="Dr. Beleza"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/48?text=Dr';
                      }}
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
                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-br-none" 
                        : "bg-white shadow-md rounded-bl-none"
                    }`}>
                      <p className="text-sm whitespace-pre-line">{msg.conteudo}</p>
                      
                      {msg.opcoes && (
                        <div className="mt-3 space-y-2">
                          {msg.opcoes.map((opcao, i) => (
                            <button
                              key={i}
                              onClick={() => !tipoUsuario ? handleEscolhaTipo(opcao.valor) : handleOpcao(opcao)}
                              className="w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium text-blue-900"
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
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
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
