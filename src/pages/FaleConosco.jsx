import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  MessageCircle,
  Loader2,
  Bot,
  User,
  Sparkles,
  HelpCircle,
  BookOpen,
  ArrowRight
} from "lucide-react";

const SUGESTOES_PERGUNTAS = [
  { emoji: "💰", texto: "Quais são os planos disponíveis?" },
  { emoji: "📢", texto: "Como faço para anunciar meus serviços?" },
  { emoji: "⭐", texto: "Como funciona o programa de pontos?" },
  { emoji: "🔍", texto: "Como encontrar profissionais perto de mim?" },
  { emoji: "💳", texto: "Quais formas de pagamento são aceitas?" },
  { emoji: "📊", texto: "Como funciona o sistema de avaliações?" },
  { emoji: "👤", texto: "Como alterar meu tipo de conta?" },
  { emoji: "🎯", texto: "Como impulsionar meu anúncio?" },
  { emoji: "📱", texto: "A plataforma tem aplicativo?" },
  { emoji: "🤝", texto: "Como me tornar um parceiro/patrocinador?" }
];

export default function FaleConosco() {
  const [mensagens, setMensagens] = useState([
    {
      tipo: "bot",
      texto: "Olá! 👋 Sou a assistente virtual do Mapa da Estética. Estou aqui para ajudar você a entender tudo sobre nossa plataforma!\n\nVocê pode me perguntar qualquer coisa ou clicar em uma das sugestões abaixo. Se preferir, posso te guiar em um tutorial completo do site! 🚀"
    }
  ]);
  const [inputMensagem, setInputMensagem] = useState("");
  const [modoTutorial, setModoTutorial] = useState(false);
  const [etapaTutorial, setEtapaTutorial] = useState(0);
  const [tipoUsuarioTutorial, setTipoUsuarioTutorial] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const perguntarIAMutation = useMutation({
    mutationFn: async (pergunta) => {
      const resposta = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é a assistente virtual do Mapa da Estética e Clube da Beleza. Responda de forma amigável, clara e objetiva.\n\nINFORMAÇÕES IMPORTANTES SOBRE A PLATAFORMA:\n- Somos a maior plataforma de profissionais de estética do Brasil\n- Conectamos pacientes a profissionais qualificados\n- Temos mais de 64 categorias de serviços de estética\n- Mais de 3.000 profissionais parceiros\n\nTIPOS DE USUÁRIOS:\n1. PACIENTE: Pode buscar profissionais, ver anúncios, salvar favoritos, avaliar serviços\n2. PROFISSIONAL: Pode criar anúncios, gerenciar perfil, receber avaliações, ver estatísticas\n3. PATROCINADOR: Pode criar banners, posts patrocinados, ter produtos em destaque\n\nPLANOS PROFISSIONAIS:\n- Cobre (Grátis): 1 anúncio, funcionalidades básicas\n- Prata (R$197/mês): 3 anúncios, métricas básicas\n- Ouro (R$397/mês): 5 anúncios, métricas avançadas, destaque\n- Diamante (R$697/mês): 10 anúncios, prioridade no mapa\n- Platina (R$997/mês): Anúncios ilimitados, consultoria\n\nFUNCIONALIDADES:\n- Mapa interativo com profissionais próximos\n- Sistema de pontos e Beauty Coins\n- Blog com conteúdo educativo\n- Loja de produtos\n- Clube da Beleza (programa de benefícios)\n\nCONTATOS:\n- Central de Vendas: (31) 97259-5643\n- Suporte Técnico: (54) 99155-4136\n- Horário: Segunda a Sexta, 9h às 18h\n\nPERGUNTA DO USUÁRIO: \"${pergunta}\"\n\nResponda de forma direta, útil e amigável em até 3 parágrafos. Use emojis para tornar a resposta mais visual.`,
      });
      return resposta;
    },
    onSuccess: (resposta) => {
      setMensagens(prev => [...prev, { tipo: "bot", texto: resposta }]);
    },
    onError: () => {
      setMensagens(prev => [...prev, { 
        tipo: "bot", 
        texto: "Desculpe, tive um problema ao processar sua pergunta. Por favor, tente novamente ou entre em contato pelo WhatsApp (31) 97259-5643." 
      }]);
    }
  });

  const handleEnviarMensagem = (texto = inputMensagem) => {
    if (!texto.trim()) return;
    
    setMensagens(prev => [...prev, { tipo: "user", texto: texto.trim() }]);
    setInputMensagem("");
    perguntarIAMutation.mutate(texto.trim());
  };

  const iniciarTutorial = () => {
    setModoTutorial(true);
    setEtapaTutorial(0);
    setTipoUsuarioTutorial(null);
    setMensagens(prev => [...prev, 
      { tipo: "user", texto: "Quero fazer um tutorial do site" },
      { tipo: "bot", texto: "Ótimo! 🎉 Vou te guiar pelo Mapa da Estética!\n\nPrimeiro, me conta: qual é o seu perfil?\n\n👤 **Paciente** - Busco serviços e profissionais de estética\n💼 **Profissional** - Sou profissional e quero anunciar\n👑 **Patrocinador** - Quero divulgar minha marca/produtos" }
    ]);
  };

  const selecionarTipoTutorial = (tipo) => {
    setTipoUsuarioTutorial(tipo);
    setEtapaTutorial(1);
    
    const tutoriais = {
      paciente: `Perfeito! Como **Paciente**, você tem acesso a funcionalidades incríveis! 🌟\n\n**1. 🗺️ MAPA INTERATIVO**\nNa página \"Mapa\", você encontra profissionais próximos a você. Use os filtros para refinar sua busca por categoria, preço, avaliação e muito mais!\n\n**2. 🔍 BUSCA AVANÇADA**\nPesquise por procedimentos específicos como botox, limpeza de pele, depilação... Temos mais de 64 categorias!\n\n**3. ⭐ AVALIAÇÕES**\nVeja as avaliações de outros pacientes antes de escolher um profissional. Após o atendimento, deixe sua avaliação também!\n\n**4. 💜 FAVORITOS**\nSalve seus profissionais favoritos para acessar rapidamente depois.\n\n**5. 🎁 PONTOS E BENEFÍCIOS**\nAcumule pontos ao interagir com a plataforma e troque por produtos e serviços na Loja de Pontos!\n\nQuer saber mais sobre alguma dessas funcionalidades? 😊`,
      
      profissional: `Excelente! Como **Profissional**, você pode destacar seus serviços! 💼\n\n**1. 📢 CRIAR ANÚNCIO**\nClique em \"Cadastrar Anúncio\" no menu. Preencha suas informações, fotos, serviços oferecidos e localização.\n\n**2. 📍 APARECER NO MAPA**\nSeu anúncio aparecerá no mapa interativo! Quanto mais completo o perfil, maior a visibilidade.\n\n**3. 📊 ESTATÍSTICAS**\nAcompanhe visualizações, curtidas e contatos recebidos no seu perfil.\n\n**4. 🚀 IMPULSIONAMENTO**\nQuer mais visibilidade? Impulsione seu anúncio para aparecer em destaque!\n\n**5. 💰 PLANOS**\n- **Cobre (Grátis)**: 1 anúncio, funcionalidades básicas\n- **Prata (R$197/mês)**: 3 anúncios, métricas básicas\n- **Ouro (R$397/mês)**: 5 anúncios, métricas avançadas, destaque\n- **Diamante (R$697/mês)**: 10 anúncios, prioridade\n- **Platina (R$997/mês)**: Ilimitado + consultoria\n\n**6. ✅ VERIFICAÇÃO**\nEnvie seus documentos (licença sanitária, alvará, registro profissional) para ganhar o selo de \"Profissional Verificado\"!\n\nPosso explicar mais sobre algum ponto? 🎯`,
      
      patrocinador: `Maravilha! Como **Patrocinador**, você pode alcançar milhares de profissionais e pacientes! 👑\n\n**1. 🖼️ BANNERS**\nCrie banners rotativos que aparecem em diversas páginas do site. Máximo de 5 segundos de exibição.\n\n**2. 📝 POSTS PATROCINADOS**\nPublique artigos no nosso blog com links para seus produtos/serviços.\n\n**3. 🛍️ PRODUTOS EM DESTAQUE**\nSeus produtos podem aparecer em destaque na loja da plataforma.\n\n**4. 📊 MÉTRICAS COMPLETAS**\nAcompanhe visualizações, cliques, tempo de visualização e conversões em tempo real.\n\n**5. 💎 PLANOS DE PATROCÍNIO**\n- **Cobre (R$197/mês)**: 1 banner, 5 dias/mês\n- **Prata (R$397/mês)**: 3 banners, 10 dias/mês, 1 post\n- **Ouro (R$697/mês)**: 5 banners, 15 dias/mês, 2 posts\n- **Diamante (R$997/mês)**: 10 banners, 20 dias/mês, 4 posts\n- **Platina (R$1.497/mês)**: 15 banners, 30 dias/mês, posts ilimitados\n\nQuer saber mais detalhes sobre como começar? 📈`
    };

    setMensagens(prev => [...prev, 
      { tipo: "user", texto: tipo === "paciente" ? "Sou Paciente" : tipo === "profissional" ? "Sou Profissional" : "Sou Patrocinador" },
      { tipo: "bot", texto: tutoriais[tipo] }
    ]);
  };

  return (
    <div className=\"min-h-screen bg-gradient-to-b from-gray-50 to-white py-8\"> 
        <div className=\"max-w-4xl mx-auto px-4\">
            <div className=\"text-center mb-8\">
                <Badge className=\"mb-4 bg-purple-100 text-purple-700 border-purple-300\">
                    <Bot className=\"w-3 h-3 mr-1\" />
                    Assistente Virtual
                </Badge>
                <h1 className=\"text-3xl md:text-4xl font-bold text-gray-900 mb-2\">
                    Suporte
                </h1>
                <p className=\"text-gray-600 max-w-xl mx-auto\">
                    Tire suas dúvidas com nossa assistente virtual inteligente
                </p>
            </div>

            <Card className=\"border-none shadow-xl overflow-hidden\">
                <div className=\"bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white\">
                    <div className=\"flex items-center gap-3\">
                        <div className=\"w-12 h-12 bg-white/20 rounded-full flex items-center justify-center\">
                            <Sparkles className=\"w-6 h-6\" />
                        </div>
                        <div>
                            <h3 className=\"font-bold text-lg\">Assistente Mapa da Estética</h3>
                            <p className=\"text-white/80 text-sm\">Online • Responde instantaneamente</p>
                        </div>
                    </div>
                </div>

                <ScrollArea className=\"h-[400px] p-4\" ref={scrollRef}>
                    <div className=\"space-y-4\">
                        {mensagens.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.tipo === \"user\" ? \"justify-end\" : \"justify-start\"}`}
                            >
                                <div
                                    className={`max-w-[85%] p-4 rounded-2xl ${
                                        msg.tipo === \"user\"
                                            ? \"bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md\"
                                            : \"bg-gray-100 text-gray-800 rounded-bl-md\"
                                    }`}
                                >
                                    <div className=\"flex items-start gap-2\">
                                        {msg.tipo === \"bot\" && (
                                            <Bot className=\"w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5\" />
                                        )}
                                        <p className=\"text-sm whitespace-pre-line leading-relaxed\">{msg.texto}</p>
                                        {msg.tipo === \"user\" && (
                                            <User className=\"w-5 h-5 flex-shrink-0 mt-0.5\" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {modoTutorial && etapaTutorial === 0 && !tipoUsuarioTutorial && (
                            <div className=\"flex flex-wrap gap-2 justify-center mt-4\">
                                <Button
                                    onClick={() => selecionarTipoTutorial(\"paciente\")}
                                    variant=\"outline\"
                                    className=\"border-blue-300 text-blue-700 hover:bg-blue-50\"
                                >
                                    👤 Paciente
                                </Button>
                                <Button
                                    onClick={() => selecionarTipoTutorial(\"profissional\")}
                                    variant=\"outline\"
                                    className=\"border-purple-300 text-purple-700 hover:bg-purple-50\"
                                >
                                    💼 Profissional
                                </Button>
                                <Button
                                    onClick={() => selecionarTipoTutorial(\"patrocinador\")}
                                    variant=\"outline\"
                                    className=\"border-green-300 text-green-700 hover:bg-green-50\"
                                >
                                    👑 Patrocinador
                                </Button>
                            </div>
                        )}

                        {perguntarIAMutation.isPending && (
                            <div className=\"flex justify-start\">
                                <div className=\"bg-gray-100 p-4 rounded-2xl rounded-bl-md\">
                                    <div className=\"flex items-center gap-2\">
                                        <Loader2 className=\"w-5 h-5 text-purple-600 animate-spin\" />
                                        <span className=\"text-sm text-gray-600\">Pensando...</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className=\"border-t bg-gray-50 p-4\">
                    <p className=\"text-xs text-gray-500 mb-3 flex items-center gap-1\">
                        <HelpCircle className=\"w-3 h-3\" />
                        Perguntas frequentes:
                    </p>
                    <div className=\"flex flex-wrap gap-2 mb-4\">
                        {SUGESTOES_PERGUNTAS.slice(0, 5).map((sugestao, index) => (
                            <Button
                                key={index}
                                variant=\"outline\"
                                size=\"sm\"
                                onClick={() => handleEnviarMensagem(sugestao.texto)}
                                disabled={perguntarIAMutation.isPending}
                                className=\"text-xs border-gray-300 hover:border-purple-400 hover:bg-purple-50\"
                            >
                                {sugestao.emoji} {sugestao.texto}
                            </Button>
                        ))}
                    </div>
                    <div className=\"flex flex-wrap gap-2 mb-4\">
                        {SUGESTOES_PERGUNTAS.slice(5).map((sugestao, index) => (
                            <Button
                                key={index}
                                variant=\"outline\"
                                size=\"sm\"
                                onClick={() => handleEnviarMensagem(sugestao.texto)}
                                disabled={perguntarIAMutation.isPending}
                                className=\"text-xs border-gray-300 hover:border-purple-400 hover:bg-purple-50\"
                            >
                                {sugestao.emoji} {sugestao.texto}
                            </Button>
                        ))}
                    </div>

                    <Button
                        onClick={iniciarTutorial}
                        disabled={perguntarIAMutation.isPending}
                        className=\"w-full mb-4 bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] hover:from-[#E5C215] hover:to-[#F7D426] font-bold border-2 border-[#2C2C2C]\"
                    >
                        <BookOpen className=\"w-4 h-4 mr-2\" />
                        Fazer Tutorial Guiado do Site
                        <ArrowRight className=\"w-4 h-4 ml-2\" />
                    </Button>

                    <div className=\"flex gap-2\">
                        <Input
                            placeholder=\"Digite sua pergunta...\"
                            value={inputMensagem}
                            onChange={(e) => setInputMensagem(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === \"Enter\" && !perguntarIAMutation.isPending) {
                                    handleEnviarMensagem();
                                }
                            }}
                            className=\"flex-1\"
                            disabled={perguntarIAMutation.isPending}
                        />
                        <Button
                            onClick={() => handleEnviarMensagem()}
                            disabled={perguntarIAMutation.isPending || !inputMensagem.trim()}
                            className=\"bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700\"
                        >
                            {perguntarIAMutation.isPending ? (
                                <Loader2 className=\"w-4 h-4 animate-spin\" />
                            ) : (
                                <Send className=\"w-4 h-4\" />
                            )}
                        </Button>
                    </div>
                </div>
            </Card>

        </div>
    </div>
  );
}