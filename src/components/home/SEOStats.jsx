import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Sparkles, PlusCircle, Eye, Star, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SEOStats() {
  const [visitantesOnline, setVisitantesOnline] = useState(0);
  const [modalTratamentos, setModalTratamentos] = useState(false);
  const [modalTecnicas, setModalTecnicas] = useState(false);
  const [modalOrigens, setModalOrigens] = useState(false);
  const [paisSelecionado, setPaisSelecionado] = useState(null);

  // Simular visitantes online (entre 15 e 45)
  useEffect(() => {
    const gerarVisitantes = () => {
      const visitantes = Math.floor(Math.random() * (45 - 15 + 1)) + 15;
      setVisitantesOnline(visitantes);
    };

    gerarVisitantes();
    const interval = setInterval(gerarVisitantes, 10000);

    return () => clearInterval(interval);
  }, []);

  const tratamentosMaisProcurados = [
    { nome: "Harmonização Facial", visualizacoes: 1247, crescimento: "+23%" },
    { nome: "Depilação a Laser", visualizacoes: 1089, crescimento: "+18%" },
    { nome: "Micropigmentação", visualizacoes: 892, crescimento: "+15%" },
    { nome: "Limpeza de Pele", visualizacoes: 756, crescimento: "+12%" }
  ];

  const todosTratamentos = [
    { nome: "Harmonização Facial", visualizacoes: 1247, crescimento: "+23%" },
    { nome: "Depilação a Laser", visualizacoes: 1089, crescimento: "+18%" },
    { nome: "Micropigmentação", visualizacoes: 892, crescimento: "+15%" },
    { nome: "Limpeza de Pele", visualizacoes: 756, crescimento: "+12%" },
    { nome: "Preenchimento Labial", visualizacoes: 698, crescimento: "+10%" },
    { nome: "Botox", visualizacoes: 645, crescimento: "+9%" },
    { nome: "Peeling Químico", visualizacoes: 589, crescimento: "+8%" },
    { nome: "Drenagem Linfática", visualizacoes: 523, crescimento: "+7%" },
    { nome: "Massagem Relaxante", visualizacoes: 478, crescimento: "+6%" },
    { nome: "Design de Sobrancelhas", visualizacoes: 421, crescimento: "+5%" }
  ];

  const tecnicasEmDestaque = [
    { nome: "Fios de Sustentação", icone: "✨", color: "from-purple-500 to-pink-500" },
    { nome: "Criolipólise", icone: "❄️", color: "from-blue-500 to-cyan-500" },
    { nome: "Microagulhamento", icone: "💎", color: "from-amber-500 to-orange-500" }
  ];

  const todasTecnicas = [
    { nome: "Fios de Sustentação", icone: "✨", color: "from-purple-500 to-pink-500", buscas: 234 },
    { nome: "Criolipólise", icone: "❄️", color: "from-blue-500 to-cyan-500", buscas: 198 },
    { nome: "Microagulhamento", icone: "💎", color: "from-amber-500 to-orange-500", buscas: 176 },
    { nome: "Radiofrequência", icone: "📡", color: "from-red-500 to-pink-500", buscas: 165 },
    { nome: "Ultrassom Microfocado", icone: "🔊", color: "from-indigo-500 to-purple-500", buscas: 152 },
    { nome: "Bioestimuladores de Colágeno", icone: "💉", color: "from-green-500 to-teal-500", buscas: 143 },
    { nome: "Skinbooster", icone: "💧", color: "from-cyan-500 to-blue-500", buscas: 128 },
    { nome: "Toxina Botulínica", icone: "💫", color: "from-yellow-500 to-orange-500", buscas: 115 },
    { nome: "Preenchimento com Ácido Hialurônico", icone: "💉", color: "from-pink-500 to-rose-500", buscas: 102 },
    { nome: "Laser CO2 Fracionado", icone: "⚡", color: "from-orange-500 to-red-500", buscas: 89 }
  ];

  const origemAcessos = [
    { pais: "🇧🇷 Brasil", porcentagem: 94, cidades: ["São Paulo", "Rio de Janeiro", "Belo Horizonte"] },
    { pais: "🇵🇹 Portugal", porcentagem: 3, cidades: ["Lisboa", "Porto"] },
    { pais: "🇺🇸 EUA", porcentagem: 2, cidades: ["Miami", "Nova York"] },
    { pais: "🌍 Outros", porcentagem: 1, cidades: [] }
  ];

  const todasOrigens = [
    { pais: "🇧🇷 Brasil", porcentagem: 94, cidades: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Brasília", "Curitiba", "Porto Alegre", "Salvador", "Fortaleza", "Recife", "Manaus"] },
    { pais: "🇵🇹 Portugal", porcentagem: 3, cidades: ["Lisboa", "Porto", "Braga", "Coimbra", "Faro"] },
    { pais: "🇺🇸 EUA", porcentagem: 2, cidades: ["Miami", "Nova York", "Los Angeles", "Boston", "Orlando"] },
    { pais: "🇪🇸 Espanha", porcentagem: 0.4, cidades: ["Madrid", "Barcelona", "Sevilha"] },
    { pais: "🇮🇹 Itália", porcentagem: 0.2, cidades: ["Roma", "Milão", "Florença"] },
    { pais: "🇫🇷 França", porcentagem: 0.15, cidades: ["Paris", "Lyon", "Marselha"] },
    { pais: "🇬🇧 Reino Unido", porcentagem: 0.1, cidades: ["Londres", "Manchester"] },
    { pais: "🇩🇪 Alemanha", porcentagem: 0.08, cidades: ["Berlim", "Munique"] },
    { pais: "🇨🇦 Canadá", porcentagem: 0.05, cidades: ["Toronto", "Montreal"] },
    { pais: "🇦🇷 Argentina", porcentagem: 0.02, cidades: ["Buenos Aires", "Córdoba"] }
  ];

  const estatisticas = [
    {
      titulo: "Visitantes Online",
      valor: visitantesOnline,
      subtitulo: "agora",
      icone: Users,
      cor: "from-green-500 to-emerald-500",
      pulsar: true
    },
    {
      titulo: "Novos Anúncios",
      valor: "47",
      subtitulo: "esta semana",
      icone: PlusCircle,
      cor: "from-blue-500 to-cyan-500"
    },
    {
      titulo: "Total de Profissionais",
      valor: "500+",
      subtitulo: "cadastrados",
      icone: Star,
      cor: "from-yellow-500 to-amber-500"
    },
    {
      titulo: "Buscas Hoje",
      valor: "2.4k",
      subtitulo: "pesquisas realizadas",
      icone: Eye,
      cor: "from-pink-500 to-rose-500"
    }
  ];

  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white border-none">
            <TrendingUp className="w-4 h-4 mr-2" />
            Estatísticas em Tempo Real
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            O Que Está Acontecendo Agora
          </h2>
          <p className="text-gray-600 text-base sm:text-lg px-4">
            Acompanhe as tendências e o movimento da plataforma
          </p>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {estatisticas.map((stat, index) => {
            const Icon = stat.icone;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-none shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${stat.cor}`}></div>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.cor} flex items-center justify-center ${stat.pulsar ? 'animate-pulse' : ''}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      {stat.pulsar && (
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {stat.valor}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                      {stat.titulo}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {stat.subtitulo}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Tratamentos Mais Procurados */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Tratamentos Mais Procurados</h3>
                  <p className="text-xs text-gray-500">Últimos 7 dias</p>
                </div>
              </div>

              <div className="space-y-4">
                {tratamentosMaisProcurados.map((tratamento, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-600 font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{tratamento.nome}</p>
                        <p className="text-xs text-gray-500">{tratamento.visualizacoes.toLocaleString('pt-BR')} visualizações</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {tratamento.crescimento}
                    </Badge>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => setModalTratamentos(true)}
                variant="outline"
                className="w-full mt-4 text-pink-600 border-pink-200 hover:bg-pink-50"
              >
                Ver Mais
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Técnicas em Destaque */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Técnicas em Destaque</h3>
                  <p className="text-xs text-gray-500">Tendências do momento</p>
                </div>
              </div>

              <div className="space-y-4">
                {tecnicasEmDestaque.map((tecnica, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative overflow-hidden rounded-xl group cursor-pointer"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${tecnica.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="relative p-4 flex items-center gap-4 text-white">
                      <div className="text-4xl">{tecnica.icone}</div>
                      <div className="flex-1">
                        <p className="font-bold text-lg">{tecnica.nome}</p>
                        <p className="text-xs text-white/90">Clique para ver profissionais</p>
                      </div>
                      <Badge className="bg-white/20 text-white border-none">
                        HOT
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg border-2 border-pink-200">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🔥</div>
                  <div>
                    <p className="font-bold text-gray-900">+ 150 buscas</p>
                    <p className="text-xs text-gray-600">por essas técnicas hoje</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setModalTecnicas(true)}
                variant="outline"
                className="w-full mt-4 text-purple-600 border-purple-200 hover:bg-purple-50"
              >
                Ver Mais
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>

          {/* Origem dos Acessos */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                  <span className="text-xl">🌎</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Origem dos Acessos</h3>
                  <p className="text-xs text-gray-500">Últimas 24 horas</p>
                </div>
              </div>

              <div className="space-y-4">
                {origemAcessos.map((origem, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{origem.pais}</span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        {origem.porcentagem}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${origem.porcentagem}%` }}
                      ></div>
                    </div>
                    {origem.cidades.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Cidades: {origem.cidades.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📍</div>
                  <div>
                    <p className="font-bold text-gray-900">São Paulo lidera</p>
                    <p className="text-xs text-gray-600">42% dos acessos do Brasil</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setModalOrigens(true)}
                variant="outline"
                className="w-full mt-4 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Ver Mais
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Info adicional */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            📊 Dados atualizados em tempo real • Última atualização: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Modal Tratamentos */}
      <Dialog open={modalTratamentos} onOpenChange={setModalTratamentos}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-pink-600" />
              Top 10 Tratamentos Mais Procurados
            </DialogTitle>
            <p className="text-sm text-gray-500">Últimos 7 dias</p>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {todosTratamentos.map((tratamento, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600' :
                    'bg-gradient-to-br from-pink-400 to-rose-500'
                  }`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{tratamento.nome}</p>
                    <p className="text-sm text-gray-500">{tratamento.visualizacoes.toLocaleString('pt-BR')} visualizações</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {tratamento.crescimento}
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Técnicas */}
      <Dialog open={modalTecnicas} onOpenChange={setModalTecnicas}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Top 10 Técnicas em Destaque
            </DialogTitle>
            <p className="text-sm text-gray-500">Tendências do momento</p>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {todasTecnicas.map((tecnica, index) => (
              <div key={index} className="relative overflow-hidden rounded-xl group">
                <div className={`absolute inset-0 bg-gradient-to-r ${tecnica.color} opacity-90`}></div>
                <div className="relative p-4 flex items-center gap-4 text-white">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold bg-white/20 backdrop-blur-sm`}>
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div className="text-4xl">{tecnica.icone}</div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{tecnica.nome}</p>
                    <p className="text-sm text-white/90">{tecnica.buscas} buscas hoje</p>
                  </div>
                  <Badge className="bg-white/20 text-white border-none">
                    HOT
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Origens */}
      <Dialog open={modalOrigens} onOpenChange={setModalOrigens}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <span className="text-2xl">🌎</span>
              Origem dos Acessos por País
            </DialogTitle>
            <p className="text-sm text-gray-500">Últimas 24 horas</p>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {todasOrigens.map((origem, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500' :
                      index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-amber-600' :
                      'bg-gradient-to-br from-blue-400 to-indigo-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-bold text-lg text-gray-900">{origem.pais}</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {origem.porcentagem}%
                  </Badge>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(origem.porcentagem * 1.5, 100)}%` }}
                  ></div>
                </div>

                {origem.cidades.length > 0 && (
                  <div className="mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPaisSelecionado(paisSelecionado === index ? null : index)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-xs"
                    >
                      {paisSelecionado === index ? '🔽' : '▶️'} Ver Cidades ({origem.cidades.length})
                    </Button>

                    {paisSelecionado === index && (
                      <div className="mt-3 pl-4 border-l-2 border-blue-200">
                        <div className="grid grid-cols-2 gap-2">
                          {origem.cidades.map((cidade, cidadeIndex) => (
                            <div key={cidadeIndex} className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                              <span className="text-blue-600">📍</span>
                              {cidade}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}