import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, Share2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ArtigoBlog() {
  const navigate = useNavigate();
  const [artigo, setArtigo] = useState(null);
  const [mostrarCompartilhar, setMostrarCompartilhar] = useState(false);

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

  const artigoUrl = window.location.href;
  const artigoTexto = `${artigo.titulo}\n\n${artigo.resumo}\n\nLeia mais em: ${artigoUrl}`;

  const compartilharWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(artigoTexto)}`;
    window.open(url, '_blank');
  };

  const compartilharInstagramDirect = () => {
    const url = `https://www.instagram.com/direct/new/?text=${encodeURIComponent(artigoTexto)}`;
    window.open(url, '_blank');
  };

  const compartilharInstagramStories = () => {
    // Para stories, vamos gerar uma imagem compartilhável (1080x1920)
    alert("Para compartilhar nos Stories do Instagram:\n\n1. Faça um print desta página\n2. Abra o Instagram\n3. Vá em Stories\n4. Selecione a imagem capturada\n\nDimensões ideais: 1080x1920px");
  };

  const compartilharFacebookPost = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(artigoUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const compartilharFacebookStories = () => {
    alert("Para compartilhar nos Stories do Facebook:\n\n1. Faça um print desta página\n2. Abra o Facebook\n3. Vá em Stories\n4. Selecione a imagem capturada\n\nDimensões ideais: 1080x1920px");
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
                onClick={() => setMostrarCompartilhar(true)}
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

        {/* Compartilhar Dialog */}
        <Dialog open={mostrarCompartilhar} onOpenChange={setMostrarCompartilhar}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Compartilhar Artigo</DialogTitle>
              <DialogDescription>
                Escolha onde você quer compartilhar este artigo
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <Button
                onClick={compartilharWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                📱 Compartilhar no WhatsApp
              </Button>
              
              <div className="border-t pt-3">
                <p className="text-sm font-semibold mb-2">Instagram</p>
                <div className="grid gap-2">
                  <Button
                    onClick={compartilharInstagramDirect}
                    variant="outline"
                    className="w-full"
                  >
                    💬 Instagram Direct
                  </Button>
                  <Button
                    onClick={compartilharInstagramStories}
                    variant="outline"
                    className="w-full"
                  >
                    📸 Instagram Stories (1080x1920)
                  </Button>
                </div>
              </div>

              <div className="border-t pt-3">
                <p className="text-sm font-semibold mb-2">Facebook</p>
                <div className="grid gap-2">
                  <Button
                    onClick={compartilharFacebookPost}
                    variant="outline"
                    className="w-full"
                  >
                    📰 Facebook Post
                  </Button>
                  <Button
                    onClick={compartilharFacebookStories}
                    variant="outline"
                    className="w-full"
                  >
                    📸 Facebook Stories (1080x1920)
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}