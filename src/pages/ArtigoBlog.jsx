import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Calendar, Clock, Share2, Heart, MessageCircle, Send, Flag, Trash2, AlertCircle, ThumbsUp } from "lucide-react";
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
  const queryClient = useQueryClient();
  const [artigo, setArtigo] = useState(null);
  const [mostrarCompartilhar, setMostrarCompartilhar] = useState(false);
  const [user, setUser] = useState(null);
  const [novoComentario, setNovoComentario] = useState("");
  const [respondendoA, setRespondendoA] = useState(null);
  const [erro, setErro] = useState(null);

  const artigoId = new URLSearchParams(window.location.search).get('id');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const { data: artigoData, isLoading } = useQuery({
    queryKey: ['artigo', artigoId],
    queryFn: async () => {
      if (!artigoId) return null;
      const artigos = await base44.entities.ArtigoBlog.filter({ id: artigoId }, '', 1);
      if (artigos.length > 0) {
        // Incrementar visualizações
        await base44.entities.ArtigoBlog.update(artigoId, {
          visualizacoes: (artigos[0].visualizacoes || 0) + 1
        });
        return artigos[0];
      }
      return null;
    },
    enabled: !!artigoId,
  });

  const { data: comentarios = [] } = useQuery({
    queryKey: ['comentarios-artigo', artigoId],
    queryFn: async () => {
      if (!artigoId) return [];
      return await base44.entities.ComentarioBlog.filter({ artigo_id: artigoId, status: 'ativo' }, '-created_date', 100);
    },
    enabled: !!artigoId,
  });

  useEffect(() => {
    if (artigoData) {
      setArtigo(artigoData);
    } else if (!isLoading && !artigoId) {
      navigate(createPageUrl("Blog"));
    }
  }, [artigoData, artigoId, isLoading, navigate]);

  const curtirMutation = useMutation({
    mutationFn: async () => {
      if (!user || !artigo) return;
      
      const curtidas = artigo.curtidas || [];
      const jaCurtiu = curtidas.includes(user.email);
      
      const novasCurtidas = jaCurtiu
        ? curtidas.filter(email => email !== user.email)
        : [...curtidas, user.email];
      
      await base44.entities.ArtigoBlog.update(artigo.id, {
        curtidas: novasCurtidas,
        total_curtidas: novasCurtidas.length
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['artigo', artigoId]);
    },
  });

  const comentarMutation = useMutation({
    mutationFn: async (dados) => {
      const comentariosFiltrados = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise o seguinte comentário e determine se contém palavras rudes, ofensivas, discriminatórias ou inadequadas: "${dados.comentario}". Responda apenas com "true" se for inadequado ou "false" se for apropriado.`,
      });
      
      if (comentariosFiltrados.toLowerCase().includes('true')) {
        throw new Error('Comentário contém linguagem inadequada');
      }
      
      return await base44.entities.ComentarioBlog.create(dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comentarios-artigo', artigoId]);
      setNovoComentario("");
      setRespondendoA(null);
    },
    onError: (error) => {
      setErro(error.message);
    },
  });

  const denunciarMutation = useMutation({
    mutationFn: async ({ comentarioId, motivo }) => {
      const comentario = comentarios.find(c => c.id === comentarioId);
      const denuncias = comentario.denuncias || [];
      
      await base44.entities.ComentarioBlog.update(comentarioId, {
        denuncias: [...denuncias, {
          usuario_email: user.email,
          motivo,
          data: new Date().toISOString()
        }]
      });
      
      await base44.integrations.Core.SendEmail({
        to: "pedro_hbfreitas@hotmail.com",
        subject: `Denúncia de Comentário - Artigo: ${artigo.titulo}`,
        body: `
          <h2>Denúncia de Comentário</h2>
          <p><strong>Artigo:</strong> ${artigo.titulo}</p>
          <p><strong>Comentário denunciado:</strong> ${comentario.comentario}</p>
          <p><strong>Autor do comentário:</strong> ${comentario.usuario_nome} (${comentario.usuario_email})</p>
          <p><strong>Denunciado por:</strong> ${user.full_name} (${user.email})</p>
          <p><strong>Motivo:</strong> ${motivo}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        `
      });
    },
    onSuccess: () => {
      alert("Denúncia enviada com sucesso!");
      queryClient.invalidateQueries(['comentarios-artigo', artigoId]);
    },
  });

  const deletarComentarioMutation = useMutation({
    mutationFn: async (comentarioId) => {
      await base44.entities.ComentarioBlog.update(comentarioId, { status: 'deletado' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comentarios-artigo', artigoId]);
    },
  });

  const handleComentar = () => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.pathname + window.location.search);
      return;
    }
    
    if (!novoComentario.trim()) {
      setErro("Por favor, escreva um comentário");
      return;
    }
    
    comentarMutation.mutate({
      artigo_id: artigoId,
      usuario_nome: user.full_name,
      usuario_email: user.email,
      usuario_foto: user.foto_perfil || "",
      comentario: novoComentario,
      comentario_pai_id: respondendoA?.id || null
    });
  };

  if (isLoading || !artigo) {
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

  const comentariosPrincipais = comentarios.filter(c => !c.comentario_pai_id);
  const respostas = (comentarioPaiId) => comentarios.filter(c => c.comentario_pai_id === comentarioPaiId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Blog"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para o Blog
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
                  onClick={() => curtirMutation.mutate()}
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

            {/* Seção de Comentários */}
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-6 h-6" />
                Comentários ({comentariosPrincipais.length})
              </h3>

              {erro && (
                <Alert className="mb-6 bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">{erro}</AlertDescription>
                </Alert>
              )}

              {/* Formulário de Comentário */}
              <div className="mb-8">
                {respondendoA && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-3 flex items-center justify-between">
                    <span className="text-sm text-blue-900">
                      Respondendo a <strong>{respondendoA.usuario_nome}</strong>
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => setRespondendoA(null)}>
                      Cancelar
                    </Button>
                  </div>
                )}
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
                  disabled={!user || comentarMutation.isPending}
                  className="bg-pink-600 hover:bg-pink-700"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {comentarMutation.isPending ? "Enviando..." : "Comentar"}
                </Button>
              </div>

              {/* Lista de Comentários */}
              <div className="space-y-6">
                {comentariosPrincipais.map((comentario) => (
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
                        <p className="text-gray-700 mb-2">{comentario.comentario}</p>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRespondendoA(comentario)}
                            className="text-xs"
                          >
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Responder
                          </Button>
                          {user && user.email === comentario.usuario_email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deletarComentarioMutation.mutate(comentario.id)}
                              className="text-xs text-red-600"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Deletar
                            </Button>
                          )}
                          {user && user.email !== comentario.usuario_email && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const motivo = prompt("Por que você está denunciando este comentário?");
                                if (motivo) {
                                  denunciarMutation.mutate({ comentarioId: comentario.id, motivo });
                                }
                              }}
                              className="text-xs text-orange-600"
                            >
                              <Flag className="w-3 h-3 mr-1" />
                              Denunciar
                            </Button>
                          )}
                        </div>

                        {/* Respostas */}
                        {respostas(comentario.id).length > 0 && (
                          <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100">
                            {respostas(comentario.id).map((resposta) => (
                              <div key={resposta.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white font-bold text-sm">
                                  {resposta.usuario_nome.charAt(0)}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 text-sm">{resposta.usuario_nome}</span>
                                    <span className="text-xs text-gray-500">
                                      {format(new Date(resposta.created_date), "dd/MM/yyyy 'às' HH:mm")}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm mb-2">{resposta.comentario}</p>
                                  <div className="flex items-center gap-3">
                                    {user && user.email === resposta.usuario_email && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deletarComentarioMutation.mutate(resposta.id)}
                                        className="text-xs text-red-600"
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Deletar
                                      </Button>
                                    )}
                                    {user && user.email !== resposta.usuario_email && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const motivo = prompt("Por que você está denunciando este comentário?");
                                          if (motivo) {
                                            denunciarMutation.mutate({ comentarioId: resposta.id, motivo });
                                          }
                                        }}
                                        className="text-xs text-orange-600"
                                      >
                                        <Flag className="w-3 h-3 mr-1" />
                                        Denunciar
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
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

        {/* Dialog de Compartilhamento */}
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
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(artigoTexto)}`, '_blank')}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                📱 Compartilhar no WhatsApp
              </Button>
              
              <Button
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(artigoUrl)}`, '_blank')}
                variant="outline"
                className="w-full"
              >
                📘 Compartilhar no Facebook
              </Button>

              <Button
                onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(artigoTexto)}`, '_blank')}
                variant="outline"
                className="w-full"
              >
                🐦 Compartilhar no Twitter
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}