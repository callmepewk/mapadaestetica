import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  X, 
  Send, 
  Sparkles,
  RefreshCw,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AssistenteAnuncio({ campo, valor, onAplicar }) {
  const [aberto, setAberto] = useState(false);
  const [contexto, setContexto] = useState("");
  const [textoGerado, setTextoGerado] = useState("");
  const [feedback, setFeedback] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target) && aberto) {
        setAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [aberto]);

  const gerarTextoMutation = useMutation({
    mutationFn: async ({ campo, valorAtual, contextoExtra }) => {
      let prompt = "";
      
      if (campo === "descricao") {
        prompt = `Você é um especialista em marketing para o mercado de estética.
        
Crie uma descrição profissional e atraente para um anúncio de serviços de estética com base nas seguintes informações:

Título do anúncio: "${valorAtual}"
${contextoExtra ? `Informações adicionais: ${contextoExtra}` : ""}

A descrição deve:
- Ser profissional e persuasiva
- Destacar diferenciais e benefícios
- Ter entre 3-5 parágrafos
- Ser clara e objetiva
- Incluir chamada para ação

Retorne apenas o texto da descrição, sem introdução.`;
      } else if (campo === "titulo") {
        prompt = `Crie um título atraente e profissional para um anúncio de estética com base em: ${contextoExtra || valorAtual}
        
O título deve ser:
- Direto e impactante
- Profissional
- Com no máximo 60 caracteres
- Que desperte interesse

Retorne apenas o título, sem aspas ou introdução.`;
      }

      const resposta = await base44.integrations.Core.InvokeLLM({
        prompt: prompt
      });
      
      return resposta;
    },
    onSuccess: (texto) => {
      setTextoGerado(texto);
      setFeedback(null);
    },
  });

  const handleGerar = () => {
    gerarTextoMutation.mutate({
      campo,
      valorAtual: valor,
      contextoExtra: contexto
    });
  };

  const handleAplicar = () => {
    if (textoGerado) {
      onAplicar(textoGerado);
      setAberto(false);
      setTextoGerado("");
      setContexto("");
      setFeedback(null);
    }
  };

  const handleFeedback = (tipo) => {
    setFeedback(tipo);
    if (tipo === "negativo") {
      setTimeout(() => {
        gerarTextoMutation.mutate({
          campo,
          valorAtual: valor,
          contextoExtra: contexto + " (versão alternativa com tom diferente)"
        });
      }, 500);
    }
  };

  const getDicas = () => {
    const dicas = {
      titulo: [
        "Use palavras-chave relevantes para seu serviço",
        "Seja específico sobre o que você oferece",
        "Mencione seu diferencial principal",
        "Evite títulos muito longos"
      ],
      descricao: [
        "Descreva seus serviços com detalhes",
        "Mencione sua experiência e qualificações",
        "Destaque seus diferenciais",
        "Inclua informações sobre resultados",
        "Adicione uma chamada para ação"
      ],
      categoria: [
        "Escolha a categoria que melhor representa seu serviço principal",
        "Se atua em várias áreas, escolha a mais relevante",
        "Isso ajuda clientes a encontrar você"
      ],
      profissional: [
        "Use seu nome completo ou nome profissional",
        "Mantenha consistência com suas redes sociais"
      ],
      contato: [
        "Forneça múltiplas formas de contato",
        "WhatsApp facilita o primeiro contato",
        "Mantenha seus dados sempre atualizados"
      ],
      localizacao: [
        "Seja específico sobre sua localização",
        "Clientes buscam profissionais próximos",
        "Adicione referências se necessário"
      ]
    };
    
    return dicas[campo] || ["Preencha este campo com informações precisas e completas"];
  };

  return (
    <div className="relative" ref={cardRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setAberto(!aberto)}
        className="text-[#F7D426] hover:text-[#E5C215] hover:bg-[#FFF9E6]"
      >
        <HelpCircle className="w-4 h-4 mr-1" />
        Preciso de Ajuda
      </Button>

      <AnimatePresence>
        {aberto && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 md:left-auto md:right-0 md:w-[600px] z-50 mt-2"
          >
            <Card className="border-2 border-[#F7D426] shadow-2xl">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F7D426] to-[#FFE066] flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-[#2C2C2C]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2C2C2C] text-base">Assistente Virtual</p>
                      <p className="text-sm text-gray-500">Estou aqui para ajudar!</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAberto(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="bg-[#FFF9E6] p-4 rounded-lg">
                  <p className="font-medium text-[#2C2C2C] mb-3">💡 Dicas:</p>
                  <ul className="space-y-2">
                    {getDicas().map((dica, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-[#F7D426] mt-0.5">•</span>
                        <span>{dica}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {(campo === "descricao" || campo === "titulo") && (
                  <div className="space-y-4">
                    <div className="border-t pt-4">
                      <Badge className="mb-3 bg-[#F7D426] text-[#2C2C2C] text-sm">
                        <Sparkles className="w-4 h-4 mr-1" />
                        Gerador Inteligente
                      </Badge>
                      <p className="text-sm text-gray-600 mb-3">
                        Deixe a IA criar um {campo === "descricao" ? "texto profissional" : "título atraente"} para você!
                      </p>
                      
                      {campo === "descricao" && (
                        <Textarea
                          placeholder="Conte mais sobre seus serviços, experiência, diferenciais... (opcional)"
                          value={contexto}
                          onChange={(e) => setContexto(e.target.value)}
                          className="mb-3 min-h-[100px]"
                        />
                      )}

                      <Button
                        onClick={handleGerar}
                        disabled={gerarTextoMutation.isPending}
                        className="w-full bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
                      >
                        {gerarTextoMutation.isPending ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Gerar {campo === "descricao" ? "Descrição" : "Título"}
                          </>
                        )}
                      </Button>
                    </div>

                    {textoGerado && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-t pt-4 space-y-4"
                      >
                        <div className="bg-white p-4 rounded-lg border-2 border-[#F7D426]">
                          <p className="text-sm text-gray-700 whitespace-pre-line">
                            {textoGerado}
                          </p>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm text-gray-600">Este texto está bom?</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={feedback === "positivo" ? "default" : "outline"}
                              onClick={() => handleFeedback("positivo")}
                              className={feedback === "positivo" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              <ThumbsUp className="w-4 h-4 mr-1" />
                              Sim
                            </Button>
                            <Button
                              size="sm"
                              variant={feedback === "negativo" ? "default" : "outline"}
                              onClick={() => handleFeedback("negativo")}
                              className={feedback === "negativo" ? "bg-red-600 hover:bg-red-700" : ""}
                            >
                              <ThumbsDown className="w-4 h-4 mr-1" />
                              Gerar Outro
                            </Button>
                          </div>
                        </div>

                        {feedback === "positivo" && (
                          <Button
                            onClick={handleAplicar}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Aplicar Este Texto
                          </Button>
                        )}

                        {feedback === "negativo" && gerarTextoMutation.isPending && (
                          <div className="text-center text-sm text-gray-500">
                            <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                            Gerando uma nova versão...
                          </div>
                        )}
                      </motion.div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}