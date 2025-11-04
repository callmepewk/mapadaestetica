import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, TrendingUp, Sparkles, Heart, Eye, Briefcase, Users, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const fontesExternas = [
  {
    nome: "Vogue Brasil",
    url: "https://vogue.globo.com/beleza",
    icon: "📰",
    cor: "from-black to-gray-800"
  },
  {
    nome: "Glamour",
    url: "https://revistaglamour.globo.com/Beleza",
    icon: "✨",
    cor: "from-pink-600 to-rose-600"
  },
  {
    nome: "Sociedade Brasileira de Dermatologia",
    url: "https://www.sbd.org.br/",
    icon: "🔬",
    cor: "from-blue-600 to-cyan-600"
  },
  {
    nome: "Portal ABRAESP",
    url: "https://www.abraesp.com.br/",
    icon: "💼",
    cor: "from-purple-600 to-indigo-600"
  },
  {
    nome: "Beleza Atual",
    url: "https://www.belezaatual.com.br/",
    icon: "💄",
    cor: "from-orange-500 to-amber-500"
  },
  {
    nome: "Metrópoles Saúde",
    url: "https://www.metropoles.com/saude",
    icon: "🏥",
    cor: "from-red-600 to-pink-600"
  }
];

export default function Blog() {
  const navigate = useNavigate();

  const { data: artigos = [], isLoading } = useQuery({
    queryKey: ['artigos-blog'],
    queryFn: async () => {
      return await base44.entities.ArtigoBlog.filter({ status: 'publicado' }, '-created_date', 50);
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    initialData: [],
  });

  const artigosProfissionais = artigos.filter(a => a.tipo === 'profissional');
  const artigosGerais = artigos.filter(a => a.tipo === 'geral');

  const getCategoriaColor = (categoria) => {
    const colors = {
      "Estética Facial": "bg-purple-100 text-purple-800",
      "Estética Corporal": "bg-blue-100 text-blue-800",
      "Cuidados com a Pele": "bg-green-100 text-green-800",
      "Tratamentos": "bg-pink-100 text-pink-800",
      "Tendências": "bg-orange-100 text-orange-800",
      "Novidades": "bg-red-100 text-red-800",
      "Harmonização Facial": "bg-violet-100 text-violet-800"
    };
    return colors[categoria] || "bg-gray-100 text-gray-800";
  };

  const handleArtigoClick = (artigo) => {
    navigate(`${createPageUrl("ArtigoBlog")}?id=${artigo.id}`);
  };

  const ArtigoCard = ({ artigo }) => (
    <Card
      onClick={() => handleArtigoClick(artigo)}
      className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none cursor-pointer group"
    >
      <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
        {artigo.imagem_capa ? (
          <img src={artigo.imagem_capa} alt={artigo.titulo} className="w-full h-full object-cover" />
        ) : (
          "✨"
        )}
      </div>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge className={getCategoriaColor(artigo.categoria)}>
            {artigo.categoria}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {artigo.tipo === 'profissional' ? (
              <><Briefcase className="w-3 h-3 mr-1" /> Profissional</>
            ) : (
              <><Users className="w-3 h-3 mr-1" /> Geral</>
            )}
          </Badge>
        </div>
        <h3 className="font-bold text-lg md:text-xl mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors">
          {artigo.titulo}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {artigo.resumo}
        </p>
        
        <div className="flex items-center gap-3 text-xs text-gray-500 pt-3 border-t flex-wrap">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {artigo.visualizacoes || 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {artigo.total_curtidas || 0}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {artigo.tempo_leitura} min
          </span>
        </div>

        <div className="text-xs text-gray-400 mt-2">
          {format(new Date(artigo.created_date), "dd/MM/yyyy")}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Atualizado semanalmente</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 px-4">
            Fique por Dentro do Universo da Estética
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Artigos para profissionais e público geral
          </p>
        </div>

        {/* Fontes Externas */}
        <div className="mb-12 px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            📚 Leia Também de Fontes Confiáveis
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {fontesExternas.map((fonte, index) => (
              <a
                key={index}
                href={fonte.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <Card className="h-full hover:shadow-xl transition-all border-none cursor-pointer">
                  <div className={`h-24 bg-gradient-to-br ${fonte.cor} flex items-center justify-center text-4xl`}>
                    {fonte.icon}
                  </div>
                  <CardContent className="p-3">
                    <p className="text-xs font-semibold text-center text-gray-900 group-hover:text-pink-600 transition-colors flex items-center justify-center gap-1">
                      {fonte.nome}
                      <ExternalLink className="w-3 h-3" />
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* Tabs para Profissionais e Gerais */}
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Artigos Gerais
            </TabsTrigger>
            <TabsTrigger value="profissional" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Para Profissionais
            </TabsTrigger>
          </TabsList>

          {/* Artigos Gerais */}
          <TabsContent value="geral">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-20 mb-3" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : artigosGerais.length === 0 ? (
              <Card className="p-12 text-center mx-4">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum artigo geral encontrado
                </h3>
                <p className="text-gray-600">
                  Volte mais tarde para novos conteúdos
                </p>
              </Card>
            ) : (
              <>
                {artigosGerais[0] && (
                  <div className="mb-8 md:mb-12 px-4">
                    <Card 
                      className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white cursor-pointer hover:shadow-3xl transition-shadow"
                      onClick={() => handleArtigoClick(artigosGerais[0])}
                    >
                      <CardContent className="p-6 md:p-12">
                        <Badge className="mb-4 bg-white/20 text-white border-none">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Artigo em Destaque
                        </Badge>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                          {artigosGerais[0].titulo}
                        </h2>
                        <p className="text-base md:text-lg text-white/90 mb-6">
                          {artigosGerais[0].resumo}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-white/80 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(artigosGerais[0].created_date), "dd/MM/yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {artigosGerais[0].tempo_leitura} min de leitura
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {artigosGerais[0].visualizacoes || 0} visualizações
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 fill-white" />
                            {artigosGerais[0].total_curtidas || 0} curtidas
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
                  {artigosGerais.slice(1).map((artigo) => (
                    <ArtigoCard key={artigo.id} artigo={artigo} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          {/* Artigos Profissionais */}
          <TabsContent value="profissional">
            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
                {Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-20 mb-3" />
                      <Skeleton className="h-6 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : artigosProfissionais.length === 0 ? (
              <Card className="p-12 text-center mx-4">
                <div className="text-6xl mb-4">💼</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nenhum artigo profissional encontrado
                </h3>
                <p className="text-gray-600">
                  Volte mais tarde para novos conteúdos
                </p>
              </Card>
            ) : (
              <>
                {artigosProfissionais[0] && (
                  <div className="mb-8 md:mb-12 px-4">
                    <Card 
                      className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white cursor-pointer hover:shadow-3xl transition-shadow"
                      onClick={() => handleArtigoClick(artigosProfissionais[0])}
                    >
                      <CardContent className="p-6 md:p-12">
                        <Badge className="mb-4 bg-white/20 text-white border-none">
                          <Briefcase className="w-3 h-3 mr-1" />
                          Artigo Profissional em Destaque
                        </Badge>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                          {artigosProfissionais[0].titulo}
                        </h2>
                        <p className="text-base md:text-lg text-white/90 mb-6">
                          {artigosProfissionais[0].resumo}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-white/80 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(artigosProfissionais[0].created_date), "dd/MM/yyyy")}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {artigosProfissionais[0].tempo_leitura} min de leitura
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {artigosProfissionais[0].visualizacoes || 0} visualizações
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4 fill-white" />
                            {artigosProfissionais[0].total_curtidas || 0} curtidas
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
                  {artigosProfissionais.slice(1).map((artigo) => (
                    <ArtigoCard key={artigo.id} artigo={artigo} />
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}