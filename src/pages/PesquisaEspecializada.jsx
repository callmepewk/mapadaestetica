
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ArrowLeft,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const especialidadesProcedimentos = {
  "Estética Facial - Tratamentos Básicos": [
    "Limpeza de Pele", "Hidratação Facial", "Esfoliação", "Revitalização Facial"
  ],
  "Estética Facial - Rejuvenescimento": [
    "Microagulhamento", "Skinbooster", "Preenchimento Facial", "Toxina Botulínica",
    "Peelings Químicos", "Peelings Físicos", "Radiofrequência Facial", "Microdermoabrasão"
  ],
  "Estética Facial - Tratamento de Condições": [
    "Tratamento de Acne", "Tratamento de Melasma", "Tratamento de Manchas",
    "Tratamento de Olheiras", "Tratamento de Cicatrizes", "Tratamento de Flacidez Facial"
  ],
  "Estética Facial - Harmonização": [
    "Preenchimentos Avançados", "Bioestimuladores de Colágeno", "Fios de Sustentação"
  ],
  "Estética Corporal - Redução de Medidas": [
    "Criolipólise", "Ultracavitação", "Radiofrequência Corporal", "Carboxiterapia",
    "Lipoenzimática", "Intradermoterapia", "Massagem Modeladora"
  ],
  "Estética Corporal - Celulite e Estrias": [
    "Ondas de Choque", "Subcisão", "Endermologia", "Tratamento Específico para Celulite",
    "Tratamento Específico para Estrias"
  ],
  "Estética Corporal - Flacidez e Contorno": [
    "Radiofrequência Corporal", "Ultrassom Micro e Macrofocado (HIFU)",
    "Bioestimuladores", "Correntes Russa/Aussie"
  ],
  "Depilação": [
    "Depilação a Laser", "Luz Intensa Pulsada (IPL)", "Depilação a LED",
    "Depilação com Cera", "Depilação Roll-on"
  ],
  "Drenagem Linfática": [
    "Drenagem Linfática Manual", "Drenagem Pós-operatória", "Drenagem Gestacional"
  ],
  "Estética Capilar e Tricologia": [
    "Tratamento de Queda de Cabelo", "Tratamento de Alopécia", "Tratamento de Caspa",
    "Tratamento de Oleosidade", "Dermatite Seborreica", "Microagulhamento Capilar",
    "Mesoterapia Capilar", "Laser Capilar", "LED Capilar"
  ],
  "Transplante Capilar": [
    "Transplante Capilar FUE", "Transplante Capilar FUT", "Implante Capilar"
  ],
  "Manicure e Pedicure": [
    "Manicure Tradicional", "Pedicure Tradicional", "Estética Avançada dos Pés"
  ],
  "Podologia": [
    "Tratamento de Unhas Encravadas", "Tratamento de Calosidades", "Tratamento de Micoses",
    "Tratamento de Pé Diabético"
  ],
  "Micropigmentação e Design de Sobrancelhas": [
    "Design de Sobrancelhas", "Micropigmentação Fio a Fio", "Micropigmentação Shadow",
    "Microblading"
  ],
  "Micropigmentação - Olhos e Lábios": [
    "Delineador Micropigmentado", "Micropigmentação Labial", "Revitalização Labial"
  ],
  "Extensão e Alongamento de Cílios": [
    "Extensão de Cílios", "Alongamento de Cílios", "Lash Lifting"
  ],
  "Medicina Estética": [
    "Toxina Botulínica", "Preenchimento Facial", "Bioestimuladores",
    "Fios de PDO", "Skinbooster", "Peelings Médicos"
  ],
  "Dermatologia": [
    "Tratamento de Acne", "Tratamento de Manchas", "Dermatite",
    "Psoríase", "Vitiligo", "Rosácea", "Melasma"
  ],
  "Cirurgia Plástica": [
    "Rinoplastia", "Mamoplastia", "Abdominoplastia", "Lipoaspiração",
    "Blefaroplastia", "Otoplastia", "Ritidoplastia"
  ],
  "Fisioterapia Dermato Funcional": [
    "Pós-operatório", "Cicatrizes", "Queimaduras", "Pilates", "Reabilitação"
  ],
  "Nutrição Estética": [
    "Nutrição Esportiva", "Nutrição Clínica", "Nutrição Funcional",
    "Emagrecimento", "Nutrição para Pele e Cabelo"
  ],
  "Psicologia e Coaching de Imagem": [
    "Autoestima", "Imagem Corporal", "Comportamento Alimentar"
  ],
  "Pilates e Fitness": [
    "Pilates", "Personal Training", "Fitness Estético", "Treinamento Funcional"
  ],
  "Acupuntura Estética": [
    "Acupuntura Facial", "Acupuntura Sistêmica", "Auriculoterapia"
  ],
  "Terapias Integrativas e Complementares": [
    "Aromaterapia", "Terapias Holísticas", "Reiki", "Florais"
  ],
  "Biomedicina Estética": [
    "Intradermoterapia", "Microagulhamento", "Laser Terapêutico",
    "Peelings", "Carboxiterapia", "Ozonioterapia"
  ],
  "Enfermagem Estética": [
    "Aplicação de Injetáveis", "Curativos Estéticos", "Drenagem Linfática",
    "Procedimentos Pós-Operatórios", "Laser Terapêutico"
  ],
  "Farmácia Estética": [
    "Manipulação Cosmética", "Fórmulas Personalizadas", "Cosméticos Magistrais"
  ],
  "Odontologia Estética": [
    "Clareamento Dental", "Facetas", "Lentes de Contato Dental", "Harmonização Orofacial"
  ],
  "Massoterapia": [
    "Massagem Relaxante", "Massagem Terapêutica", "Shiatsu",
    "Reflexologia", "Quick Massage", "Massagem com Pedras Quentes"
  ],
  "Barbearia": [
    "Corte de Cabelo Masculino", "Barba", "Design de Barba", "Tratamentos Capilares Masculinos"
  ],
  "Tatuagem e Piercing": [
    "Tatuagem", "Piercing", "Remoção de Tatuagem", "Cuidados Pós-Procedimento"
  ],
  "Spa e Bem-Estar": [
    "Massagens", "Terapias", "Day Spa", "Tratamentos Corporais"
  ],
  "Longevidade e Medicina Integrativa": [
    "Medicina Antienvelhecimento", "Terapias de Longevidade", "Medicina Integrativa"
  ]
};

export default function PesquisaEspecializada() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [procedimentoSelecionado, setProcedimentoSelecionado] = useState(null);
  const [informacoes, setInformacoes] = useState(null);

  const buscarInformacoesMutation = useMutation({
    mutationFn: async (procedimento) => {
      const resposta = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em estética e bem-estar. Forneça informações COMPLETAS e DETALHADAS sobre o seguinte procedimento/serviço: "${procedimento}"

Estruture sua resposta EXATAMENTE neste formato:

**O QUE É**
[Explicação clara e objetiva sobre o procedimento]

**COMO FUNCIONA**
[Descrição detalhada do procedimento, passo a passo]

**BENEFÍCIOS**
• [Benefício 1]
• [Benefício 2]
• [Benefício 3]
[Continue listando todos os benefícios relevantes]

**INDICAÇÕES**
[Para quem é indicado o procedimento]

**CONTRAINDICAÇÕES**
[Quando NÃO deve ser feito]

**DURAÇÃO DO PROCEDIMENTO**
[Tempo médio de execução]

**RESULTADOS ESPERADOS**
[O que esperar após o tratamento]

**CUIDADOS PÓS-PROCEDIMENTO**
[Orientações importantes]

**NÚMERO DE SESSÕES**
[Quantas sessões normalmente são necessárias]

Seja profissional, técnico mas acessível. Use informações baseadas em evidências científicas.`,
      });
      return resposta;
    },
    onSuccess: (resposta) => {
      setInformacoes(resposta);
    },
  });

  const handleProcedimentoClick = (procedimento) => {
    setProcedimentoSelecionado(procedimento);
    buscarInformacoesMutation.mutate(procedimento);
  };

  const handleBuscarProfissionais = () => {
    if (procedimentoSelecionado) {
      navigate(`${createPageUrl("Anuncios")}?procedimento=${encodeURIComponent(procedimentoSelecionado)}`);
    }
  };

  const procedimentosFiltrados = busca
    ? Object.entries(especialidadesProcedimentos).reduce((acc, [especialidade, procedimentos]) => {
        const filtrados = procedimentos.filter(p => 
          p.toLowerCase().includes(busca.toLowerCase())
        );
        if (filtrados.length > 0) {
          acc[especialidade] = filtrados;
        }
        return acc;
      }, {})
    : especialidadesProcedimentos;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Inicio"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center shadow-xl overflow-hidden">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe2/966d17a8f_drbeleza.png"
              alt="Dr. Beleza"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/128?text=Dr.+Beleza';
              }}
            />
          </div>
          <Badge className="bg-[#F7D426] text-[#2C2C2C] font-bold px-4 py-2 text-base">
            Consulte Tratamentos Agora
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-[#2C2C2C] mb-3 mt-3">
            Dr. Beleza
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Descubra como funciona e qual o tratamento certo para você. Depois, encontre profissionais qualificados!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="border-none shadow-xl sticky top-24">
              <CardContent className="p-6">
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Buscar procedimento..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>

                <Tabs defaultValue={Object.keys(especialidadesProcedimentos)[0]} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-4">
                    <TabsTrigger value="categorias" className="text-xs">Por Categoria</TabsTrigger>
                    <TabsTrigger value="todos" className="text-xs">Todos</TabsTrigger>
                  </TabsList>

                  <TabsContent value="categorias">
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-6">
                        {Object.entries(procedimentosFiltrados).map(([especialidade, procedimentos]) => (
                          <div key={especialidade}>
                            <h3 className="font-bold text-sm mb-3 text-[#2C2C2C] flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-[#F7D426]" />
                              {especialidade}
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                              {procedimentos.map((proc) => (
                                <button
                                  key={proc}
                                  onClick={() => handleProcedimentoClick(proc)}
                                  className={`text-left p-3 rounded-lg border-2 transition-all text-sm ${
                                    procedimentoSelecionado === proc
                                      ? 'border-[#F7D426] bg-[#FFF9E6] font-semibold'
                                      : 'border-gray-200 hover:border-[#F7D426] hover:bg-gray-50'
                                  }`}
                                >
                                  {proc}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="todos">
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="grid grid-cols-1 gap-2">
                        {Object.values(procedimentosFiltrados).flat().map((proc) => (
                          <button
                            key={proc}
                            onClick={() => handleProcedimentoClick(proc)}
                            className={`text-left p-3 rounded-lg border-2 transition-all text-sm ${
                              procedimentoSelecionado === proc
                                ? 'border-[#F7D426] bg-[#FFF9E6] font-semibold'
                                : 'border-gray-200 hover:border-[#F7D426] hover:bg-gray-50'
                            }`}
                          >
                            {proc}
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="border-none shadow-xl">
              <CardContent className="p-8">
                {!procedimentoSelecionado ? (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Selecione um Procedimento
                    </h3>
                    <p className="text-gray-600">
                      Escolha um procedimento ao lado para ver informações detalhadas
                    </p>
                  </div>
                ) : buscarInformacoesMutation.isPending ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7D426] mx-auto mb-4"></div>
                    <p className="text-gray-600">Buscando informações...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className="mb-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          Informações Detalhadas
                        </Badge>
                        <h2 className="text-3xl font-bold text-gray-900">
                          {procedimentoSelecionado}
                        </h2>
                      </div>
                    </div>

                    <div className="prose prose-lg max-w-none">
                      <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                        {informacoes}
                      </div>
                    </div>

                    <div className="pt-6 border-t space-y-4">
                      <Button
                        onClick={handleBuscarProfissionais}
                        className="w-full bg-gradient-to-r from-[#F7D426] to-[#FFE066] hover:from-[#E5C215] hover:to-[#F7D426] text-[#2C2C2C] font-bold h-14 text-lg shadow-xl"
                      >
                        Encontrar Profissionais de {procedimentoSelecionado}
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>

                      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900">
                          <strong>⚠️ Importante:</strong> Estas informações são educacionais. 
                          Sempre consulte um profissional qualificado antes de realizar qualquer procedimento.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
