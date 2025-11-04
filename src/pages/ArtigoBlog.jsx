import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Calendar, Clock, Share2, Heart, MessageCircle, Send, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";

export default function ArtigoBlog() {
  const navigate = useNavigate();
  const [artigo, setArtigo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mostrarCompartilhar, setMostrarCompartilhar] = useState(false);
  const [user, setUser] = useState(null);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentarios, setComentarios] = useState([]);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Buscar usuário
        try {
          const userData = await base44.auth.me();
          setUser(userData);
        } catch {
          setUser(null);
        }

        // Buscar artigo
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get('id');
        
        if (!id) {
          setLoading(false);
          return;
        }

        const artigos = await base44.entities.ArtigoBlog.filter({ id: id });
        
        if (artigos && artigos.length > 0) {
          const artigoEncontrado = artigos[0];
          setArtigo(artigoEncontrado);
          
          // Incrementar visualizações
          await base44.entities.ArtigoBlog.update(id, {
            visualizacoes: (artigoEncontrado.visualizacoes || 0) + 1
          });

          // Buscar comentários
          const comentariosData = await base44.entities.ComentarioBlog.filter(
            { artigo_id: id, status: 'ativo' },
            '-created_date',
            100
          );
          setComentarios(comentariosData);
        }
      } catch (error) {
        console.error("Erro:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  const handleCurtir = async () => {
    if (!user || !artigo) return;
    
    try {
      const curtidas = artigo.curtidas || [];
      const jaCurtiu = curtidas.includes(user.email);
      
      const novasCurtidas = jaCurtiu
        ? curtidas.filter(email => email !== user.email)
        : [...curtidas, user.email];
      
      await base44.entities.ArtigoBlog.update(artigo.id, {
        curtidas: novasCurtidas,
        total_curtidas: novasCurtidas.length
      });

      setArtigo({ ...artigo, curtidas: novasCurtidas, total_curtidas: novasCurtidas.length });
    } catch (error) {
      console.error("Erro ao curtir:", error);
    }
  };

  const handleComentar = async () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname + window.location.search);
      return;
    }
    
    if (!novoComentario.trim()) {
      setErro("Por favor, escreva um comentário");
      return;
    }
    
    try {
      await base44.entities.ComentarioBlog.create({
        artigo_id: artigo.id,
        usuario_nome: user.full_name,
        usuario_email: user.email,
        usuario_foto: user.foto_perfil || "",
        comentario: novoComentario
      });

      // Recarregar comentários
      const comentariosData = await base44.entities.ComentarioBlog.filter(
        { artigo_id: artigo.id, status: 'ativo' },
        '-created_date',
        100
      );
      setComentarios(comentariosData);
      setNovoComentario("");
      setErro(null);
    } catch (error) {
      setErro("Erro ao enviar comentário");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando artigo...</p>
        </div>
      </div>
    );
  }

  if (!artigo) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md mx-4">
          <div className="text-6xl mb-4">📰</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Artigo não encontrado
          </h3>
          <p className="text-gray-600 mb-6">
            Este artigo não existe ou foi removido.
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Blog"))}
            className="bg-gradient-to-r from-pink-600 to-rose-600"
          >
            Voltar para o Blog
          </Button>
        </Card>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Blog"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="border-none shadow-2xl overflow-hidden">
          <div className="h-48 md:h-96 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-6xl md:text-8xl">
            {artigo.imagem_capa ? (
              <img src={artigo.imagem_capa} alt={artigo.titulo} className="w-full h-full object-cover" />
            ) : (
              "✨"
            )}
          </div>

          <CardContent className="p-6 md:p-12">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Badge className={getCategoriaColor(artigo.categoria)}>
                {artigo.categoria}
              </Badge>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(artigo.created_date), "dd/MM/yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {artigo.tempo_leitura} min
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCurtir}
                  disabled={!user}
                  className={artigo.curtidas?.includes(user?.email) ? "text-red-600 border-red-600" : ""}
                >
                  <Heart className={`w-4 h-4 mr-2 ${artigo.curtidas?.includes(user?.email) ? 'fill-red-600' : ''}`} />
                  {artigo.total_curtidas || 0}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMostrarCompartilhar(true)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {artigo.titulo}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed border-l-4 border-pink-500 pl-6 italic">
              {artigo.resumo}
            </p>

            <div className="prose prose-lg max-w-none">
              {artigo.conteudo.split('\n\n').map((paragrafo, index) => (
                <p key={index} className="text-gray-700 mb-6 leading-relaxed text-base md:text-lg">
                  {paragrafo}
                </p>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Comentários ({comentarios.length})
              </h3>

              {erro && (
                <Alert className="mb-6 bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{erro}</AlertDescription>
                </Alert>
              )}

              <div className="mb-8">
                <Textarea
                  placeholder={user ? "Escreva seu comentário..." : "Faça login para comentar"}
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  disabled={!user}
                  className="mb-3"
                  rows={4}
                />
                <Button
                  onClick={handleComentar}
                  disabled={!user}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Comentar
                </Button>
              </div>

              <div className="space-y-6">
                {comentarios.map((comentario) => (
                  <div key={comentario.id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white font-bold">
                        {comentario.usuario_nome.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">{comentario.usuario_nome}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(comentario.created_date), "dd/MM/yyyy 'às' HH:mm")}
                          </span>
                        </div>
                        <p className="text-gray-700">{comentario.comentario}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 md:p-8 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  Gostou deste artigo?
                </h3>
                <p className="text-gray-600 mb-6">
                  Continue explorando nosso blog para mais conteúdos sobre estética e beleza.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate(createPageUrl("Blog"))}
                    className="bg-gradient-to-r from-pink-600 to-rose-600"
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

        <Dialog open={mostrarCompartilhar} onOpenChange={setMostrarCompartilhar}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Compartilhar Artigo</DialogTitle>
              <DialogDescription>
                Escolha onde você quer compartilhar
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <Button
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(artigoTexto)}`, '_blank')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                📱 WhatsApp
              </Button>
              
              <Button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(artigoUrl)}`, '_blank')}
                variant="outline"
              >
                📘 Facebook
              </Button>

              <Button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(artigoTexto)}`, '_blank')}
                variant="outline"
              >
                🐦 Twitter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}