import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, Crown, Star, Gem, Zap, ArrowRight } from "lucide-react";

const perguntas = [
  {
    id: "porte",
    texto: "Qual o porte da sua clínica/estabelecimento?",
    opcoes: [
      { valor: "pequeno", label: "Pequeno (1-2 profissionais)" },
      { valor: "medio", label: "Médio (3-5 profissionais)" },
      { valor: "grande", label: "Grande (6-10 profissionais)" },
      { valor: "muito_grande", label: "Muito Grande (11+ profissionais)" }
    ]
  },
  {
    id: "infraestrutura",
    texto: "Quais recursos seu estabelecimento possui?",
    tipo: "multiplo",
    opcoes: [
      { valor: "estacionamento", label: "Estacionamento" },
      { valor: "recepcao", label: "Recepção" },
      { valor: "lounge", label: "Lounge/Sala de Espera" },
      { valor: "ar_condicionado", label: "Ar Condicionado" }
    ]
  },
  {
    id: "preco_medio",
    texto: "Qual a faixa de preço médio dos seus serviços?",
    opcoes: [
      { valor: "economico", label: "Econômico (R$ 50 - R$ 200)" },
      { valor: "moderado", label: "Moderado (R$ 200 - R$ 500)" },
      { valor: "alto", label: "Alto (R$ 500 - R$ 1.500)" },
      { valor: "premium", label: "Premium (acima de R$ 1.500)" }
    ]
  },
  {
    id: "expectativa_clientes",
    texto: "Quantos novos clientes você gostaria de atrair por mês?",
    opcoes: [
      { valor: "5_10", label: "5-10 clientes" },
      { valor: "10_30", label: "10-30 clientes" },
      { valor: "30_50", label: "30-50 clientes" },
      { valor: "50_plus", label: "Mais de 50 clientes" }
    ]
  },
  {
    id: "faturamento",
    texto: "Qual seu objetivo de faturamento mensal com novos clientes?",
    opcoes: [
      { valor: "ate_5k", label: "Até R$ 5.000" },
      { valor: "5k_15k", label: "R$ 5.000 - R$ 15.000" },
      { valor: "15k_30k", label: "R$ 15.000 - R$ 30.000" },
      { valor: "30k_plus", label: "Acima de R$ 30.000" }
    ]
  }
];

const planosInfo = {
  prata: {
    nome: "PRATA",
    icone: Star,
    cor: "from-gray-300 to-gray-500",
    preco: "R$ 99/mês",
    ideal: "Ideal para pequenos profissionais que estão começando"
  },
  ouro: {
    nome: "OURO",
    icone: Crown,
    cor: "from-yellow-400 to-amber-500",
    preco: "R$ 197/mês",
    ideal: "Ideal para profissionais estabelecidos que querem crescer"
  },
  diamante: {
    nome: "DIAMANTE",
    icone: Gem,
    cor: "from-blue-400 to-cyan-500",
    preco: "R$ 297/mês",
    ideal: "Ideal para clínicas de médio porte com estrutura"
  },
  platina: {
    nome: "PLATINA",
    icone: Zap,
    cor: "from-purple-500 to-pink-600",
    preco: "R$ 997/mês",
    ideal: "Ideal para grandes clínicas com alto volume e faturamento"
  }
};

export default function DrBelezaPlanosModal({ open, onClose }) {
  const [etapa, setEtapa] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [mensagens, setMensagens] = useState([
    {
      tipo: "bot",
      texto: "Olá! 👋 Sou o Dr da Beleza e vou te ajudar a escolher o plano perfeito para você! Vou fazer algumas perguntas sobre seu negócio para entender suas necessidades. Vamos lá?"
    }
  ]);
  const [analisando, setAnalisando] = useState(false);
  const [planoSugerido, setPlanoSugerido] = useState(null);

  const handleResposta = (perguntaId, valor) => {
    const perguntaAtual = perguntas[etapa];
    
    // Se for pergunta múltipla, gerenciar array
    if (perguntaAtual.tipo === "multiplo") {
      const respostasAtuais = respostas[perguntaId] || [];
      const novasRespostas = respostasAtuais.includes(valor)
        ? respostasAtuais.filter(r => r !== valor)
        : [...respostasAtuais, valor];
      
      setRespostas({ ...respostas, [perguntaId]: novasRespostas });
      return;
    }

    // Resposta simples
    const opcaoSelecionada = perguntaAtual.opcoes.find(o => o.valor === valor);
    
    setRespostas({ ...respostas, [perguntaId]: valor });
    
    // Adicionar mensagem do usuário
    setMensagens([
      ...mensagens,
      {
        tipo: "usuario",
        texto: opcaoSelecionada.label
      }
    ]);

    // Próxima pergunta ou análise
    setTimeout(() => {
      if (etapa < perguntas.length - 1) {
        setEtapa(etapa + 1);
        setMensagens(prev => [
          ...prev,
          {
            tipo: "bot",
            texto: perguntas[etapa + 1].texto
          }
        ]);
      } else {
        analisarRespostas({ ...respostas, [perguntaId]: valor });
      }
    }, 500);
  };

  const confirmarMultiplo = () => {
    const perguntaAtual = perguntas[etapa];
    const respostaSelecionada = respostas[perguntaAtual.id] || [];
    
    if (respostaSelecionada.length === 0) {
      setMensagens([
        ...mensagens,
        {
          tipo: "usuario",
          texto: "Nenhum recurso selecionado"
        }
      ]);
    } else {
      const labels = perguntaAtual.opcoes
        .filter(o => respostaSelecionada.includes(o.valor))
        .map(o => o.label)
        .join(", ");
      
      setMensagens([
        ...mensagens,
        {
          tipo: "usuario",
          texto: labels
        }
      ]);
    }

    setTimeout(() => {
      if (etapa < perguntas.length - 1) {
        setEtapa(etapa + 1);
        setMensagens(prev => [
          ...prev,
          {
            tipo: "bot",
            texto: perguntas[etapa + 1].texto
          }
        ]);
      } else {
        analisarRespostas(respostas);
      }
    }, 500);
  };

  const analisarRespostas = async (respostasFinais) => {
    setAnalisando(true);
    setMensagens(prev => [
      ...prev,
      {
        tipo: "bot",
        texto: "Deixa eu analisar suas respostas... 🤔"
      }
    ]);

    // Calcular pontuação
    let pontos = 0;

    // Porte da clínica (0-3)
    const porteScore = {
      pequeno: 0,
      medio: 1,
      grande: 2,
      muito_grande: 3
    };
    pontos += porteScore[respostasFinais.porte] || 0;

    // Infraestrutura (0-2)
    const infraCount = (respostasFinais.infraestrutura || []).length;
    pontos += infraCount >= 3 ? 2 : infraCount >= 1 ? 1 : 0;

    // Preço médio (0-3)
    const precoScore = {
      economico: 0,
      moderado: 1,
      alto: 2,
      premium: 3
    };
    pontos += precoScore[respostasFinais.preco_medio] || 0;

    // Expectativa de clientes (0-3)
    const clientesScore = {
      "5_10": 0,
      "10_30": 1,
      "30_50": 2,
      "50_plus": 3
    };
    pontos += clientesScore[respostasFinais.expectativa_clientes] || 0;

    // Faturamento (0-3)
    const faturamentoScore = {
      ate_5k: 0,
      "5k_15k": 1,
      "15k_30k": 2,
      "30k_plus": 3
    };
    pontos += faturamentoScore[respostasFinais.faturamento] || 0;

    // Total: 0-14 pontos
    // 0-3: Prata
    // 4-7: Ouro
    // 8-11: Diamante
    // 12-14: Platina

    let plano;
    if (pontos <= 3) plano = "prata";
    else if (pontos <= 7) plano = "ouro";
    else if (pontos <= 11) plano = "diamante";
    else plano = "platina";

    // Simular delay para análise
    await new Promise(resolve => setTimeout(resolve, 2000));

    setAnalisando(false);
    setPlanoSugerido(plano);
    
    const planoInfo = planosInfo[plano];
    setMensagens(prev => [
      ...prev,
      {
        tipo: "bot",
        texto: `Perfeito! Com base nas suas respostas, o plano ideal para você é o **${planoInfo.nome}**! 🎉\n\n${planoInfo.ideal}\n\nPor apenas ${planoInfo.preco}, você terá tudo que precisa para atingir seus objetivos!`
      }
    ]);
  };

  const handleFechar = () => {
    setEtapa(0);
    setRespostas({});
    setMensagens([
      {
        tipo: "bot",
        texto: "Olá! 👋 Sou o Dr da Beleza e vou te ajudar a escolher o plano perfeito para você! Vou fazer algumas perguntas sobre seu negócio para entender suas necessidades. Vamos lá?"
      }
    ]);
    setAnalisando(false);
    setPlanoSugerido(null);
    onClose();
  };

  const perguntaAtual = perguntas[etapa];
  const Icone = planoSugerido ? planosInfo[planoSugerido].icone : Sparkles;

  return (
    <Dialog open={open} onOpenChange={handleFechar}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-[#F7D426] to-[#FFE066] flex items-center justify-center">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/ec64a4c52_drbeleza.png"
                alt="Dr da Beleza"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <Sparkles className="w-6 h-6 text-[#2C2C2C] hidden" />
            </div>
            <div>
              <DialogTitle className="text-xl">Dr da Beleza - Consultor de Planos</DialogTitle>
              <p className="text-sm text-gray-500">Vou te ajudar a escolher o melhor plano!</p>
            </div>
          </div>
        </DialogHeader>

        {/* Chat Container */}
        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto space-y-4">
          <AnimatePresence>
            {mensagens.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.tipo === "usuario" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 ${
                    msg.tipo === "usuario"
                      ? "bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] border-2 border-[#2C2C2C]"
                      : "bg-white shadow-md"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">{msg.texto}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {analisando && (
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

        {/* Options */}
        {!planoSugerido && !analisando && perguntaAtual && (
          <div className="space-y-3">
            {perguntaAtual.tipo === "multiplo" ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {perguntaAtual.opcoes.map((opcao) => {
                    const selecionado = (respostas[perguntaAtual.id] || []).includes(opcao.valor);
                    return (
                      <button
                        key={opcao.valor}
                        onClick={() => handleResposta(perguntaAtual.id, opcao.valor)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm text-left ${
                          selecionado
                            ? "border-[#F7D426] bg-[#FFF9E6] font-semibold"
                            : "border-gray-200 hover:border-[#F7D426]"
                        }`}
                      >
                        {opcao.label}
                      </button>
                    );
                  })}
                </div>
                <Button
                  onClick={confirmarMultiplo}
                  className="w-full bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] font-bold"
                >
                  Confirmar Seleção
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {perguntaAtual.opcoes.map((opcao) => (
                  <button
                    key={opcao.valor}
                    onClick={() => handleResposta(perguntaAtual.id, opcao.valor)}
                    className="p-4 rounded-lg border-2 border-gray-200 hover:border-[#F7D426] hover:bg-[#FFF9E6] transition-all text-left"
                  >
                    {opcao.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Resultado Final */}
        {planoSugerido && (
          <div className="space-y-4">
            <div className={`bg-gradient-to-br ${planosInfo[planoSugerido].cor} text-white rounded-xl p-6 text-center`}>
              <Icone className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-3xl font-bold mb-2">{planosInfo[planoSugerido].nome}</h3>
              <p className="text-2xl font-bold mb-2">{planosInfo[planoSugerido].preco}</p>
              <p className="text-white/90 text-sm">{planosInfo[planoSugerido].ideal}</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleFechar}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
              <a
                href={`https://wa.me/5531972595643?text=${encodeURIComponent(`Olá! O Dr da Beleza me recomendou o plano ${planosInfo[planoSugerido].nome}. Gostaria de contratar! 💆‍♀️`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                  Contratar Agora
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}