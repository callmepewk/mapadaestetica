import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Sparkles, PlusCircle, Eye, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function SEOStats() {
  const [visitantesOnline, setVisitantesOnline] = useState(0);

  // Simular visitantes online (entre 15 e 45)
  useEffect(() => {
    const gerarVisitantes = () => {
      const visitantes = Math.floor(Math.random() * (45 - 15 + 1)) + 15;
      setVisitantesOnline(visitantes);
    };

    gerarVisitantes();
    const interval = setInterval(gerarVisitantes, 10000); // Atualiza a cada 10 segundos

    return () => clearInterval(interval);
  }, []);

  const tratamentosMaisProcurados = [
    { nome: "Harmonização Facial", visualizacoes: 1247, crescimento: "+23%" },
    { nome: "Depilação a Laser", visualizacoes: 1089, crescimento: "+18%" },
    { nome: "Micropigmentação", visualizacoes: 892, crescimento: "+15%" },
    { nome: "Limpeza de Pele", visualizacoes: 756, crescimento: "+12%" }
  ];

  const tecnicasEmDestaque = [
    { nome: "Fios de Sustentação", icone: "✨", color: "from-purple-500 to-pink-500" },
    { nome: "Criolipólise", icone: "❄️", color: "from-blue-500 to-cyan-500" },
    { nome: "Microagulhamento", icone: "💎", color: "from-amber-500 to-orange-500" }
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

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Tratamentos Mais Procurados */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
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
            </CardContent>
          </Card>

          {/* Técnicas em Destaque */}
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
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
    </section>
  );
}