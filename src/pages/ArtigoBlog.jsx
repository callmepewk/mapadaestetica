import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Share2 } from "lucide-react";

export default function ArtigoBlog() {
  const navigate = useNavigate();
  const [artigo, setArtigo] = useState(null);

  useEffect(() => {
    const artigoSalvo = localStorage.getItem('artigo_selecionado');
    if (artigoSalvo) {
      setArtigo(JSON.parse(artigoSalvo));
    } else {
      navigate(createPageUrl("Blog"));
    }
  }, [navigate]);

  if (!artigo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

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

  const handleCompartilhar = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: artigo.titulo,
          text: artigo.resumo,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Erro ao compartilhar:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Blog"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o Blog
        </Button>

        {/* Article Card */}
        <Card className="border-none shadow-2xl overflow-hidden">
          {/* Header Image */}
          <div className="h-48 md:h-96 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-6xl md:text-8xl">
            ✨
          </div>

          <CardContent className="p-6 md:p-12">
            {/* Category and Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className={getCategoriaColor(artigo.categoria)}>
                {artigo.categoria}
              </Badge>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {artigo.data}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {artigo.tempo_leitura} min de leitura
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompartilhar}
                className="ml-auto"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {artigo.titulo}
            </h1>

            {/* Summary */}
            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-pink-500 pl-6 italic">
              {artigo.resumo}
            </p>

            {/* Content */}
            <div className="prose prose-lg max-w-none">
              {artigo.conteudo.split('\n\n').map((paragrafo, index) => (
                <p key={index} className="text-gray-700 mb-6 leading-relaxed text-base md:text-lg">
                  {paragrafo}
                </p>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 md:p-8 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Gostou deste artigo?
                </h3>
                <p className="text-gray-600 mb-6">
                  Continue explorando nosso blog para mais conteúdos sobre estética, beleza e bem-estar.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate(createPageUrl("Blog"))}
                    className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                  >
                    Ver Mais Artigos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate(createPageUrl("Anuncios"))}
                  >
                    Encontrar Profissionais
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}