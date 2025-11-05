import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Heart, AlertCircle, Pin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SecaoComentarios({ anuncio, user, isAutor }) {
  const queryClient = useQueryClient();
  const [novoComentario, setNovoComentario] = useState("");
  const [erro, setErro] = useState(null);
  const [comentariosLocal, setComentariosLocal] = useState(anuncio.comentarios || []);

  useEffect(() => {
    setComentariosLocal(anuncio.comentarios || []);
  }, [anuncio.comentarios]);

  const enviarComentarioMutation = useMutation({
    mutationFn: async (comentarioTexto) => {
      const comentariosAtuais = anuncio.comentarios || [];
      const novoComentarioObj = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        usuario_nome: user.full_name,
        usuario_email: user.email,
        usuario_foto: user.foto_perfil || "",
        comentario: comentarioTexto,
        data: new Date().toISOString(),
        curtidas: 0,
        usuarios_curtiram: [],
        fixado: false
      };

      await base44.entities.Anuncio.update(anuncio.id, {
        comentarios: [...comentariosAtuais, novoComentarioObj]
      });

      return novoComentarioObj;
    },
    onSuccess: (novoComentarioObj) => {
      setComentariosLocal(prev => [...prev, novoComentarioObj]);
      setNovoComentario("");
      setErro(null);
    },
    onError: (error) => {
      setErro("Erro ao enviar comentário");
      console.error("Erro ao enviar comentário:", error);
    }
  });

  const curtirComentarioMutation = useMutation({
    mutationFn: async (comentarioId) => {
      const comentariosAtuais = anuncio.comentarios || [];
      const comentariosAtualizados = comentariosAtuais.map(c => {
        if (c.id === comentarioId) {
          const usuarios_curtiram = c.usuarios_curtiram || [];
          const jaCurtiu = usuarios_curtiram.includes(user.email);
          
          return {
            ...c,
            usuarios_curtiram: jaCurtiu 
              ? usuarios_curtiram.filter(email => email !== user.email)
              : [...usuarios_curtiram, user.email],
            curtidas: jaCurtiu 
              ? Math.max((c.curtidas || 0) - 1, 0)
              : (c.curtidas || 0) + 1
          };
        }
        return c;
      });

      await base44.entities.Anuncio.update(anuncio.id, {
        comentarios: comentariosAtualizados
      });

      return comentariosAtualizados;
    },
    onSuccess: (comentariosAtualizados) => {
      setComentariosLocal(comentariosAtualizados);
    }
  });

  const fixarComentarioMutation = useMutation({
    mutationFn: async (comentarioId) => {
      const comentariosAtuais = anuncio.comentarios || [];
      const comentariosAtualizados = comentariosAtuais.map(c => {
        if (c.id === comentarioId) {
          return { ...c, fixado: !c.fixado };
        }
        return c;
      });

      await base44.entities.Anuncio.update(anuncio.id, {
        comentarios: comentariosAtualizados
      });

      return comentariosAtualizados;
    },
    onSuccess: (comentariosAtualizados) => {
      setComentariosLocal(comentariosAtualizados);
    }
  });

  const handleEnviarComentario = () => {
    if (!user) {
      alert("Faça login para comentar!");
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    if (!novoComentario.trim()) {
      setErro("Por favor, escreva um comentário");
      return;
    }

    enviarComentarioMutation.mutate(novoComentario);
  };

  const handleCurtirComentario = (comentarioId) => {
    if (!user) {
      alert("Faça login para curtir!");
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    curtirComentarioMutation.mutate(comentarioId);
  };

  const handleFixarComentario = (comentarioId) => {
    if (!isAutor) return;
    fixarComentarioMutation.mutate(comentarioId);
  };

  const comentariosOrdenados = [...comentariosLocal].sort((a, b) => {
    if (a.fixado && !b.fixado) return -1;
    if (!a.fixado && b.fixado) return 1;
    return new Date(b.data) - new Date(a.data);
  });

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#F7D426]" />
          Comentários ({comentariosLocal.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <p className="font-semibold text-blue-900 mb-3">
            Deixe seu comentário:
          </p>
          
          {erro && (
            <Alert variant="destructive" className="mb-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{erro}</AlertDescription>
            </Alert>
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
            onClick={handleEnviarComentario}
            disabled={!user || !novoComentario.trim() || enviarComentarioMutation.isPending}
            className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
          >
            <Send className="w-4 h-4 mr-2" />
            {enviarComentarioMutation.isPending ? "Enviando..." : "Comentar"}
          </Button>
        </div>

        {!user && (
          <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
            <p className="font-semibold text-yellow-900 mb-2">
              Faça login para comentar
            </p>
            <p className="text-sm text-yellow-800 mb-3">
              Crie uma conta grátis para poder comentar!
            </p>
            <Button
              onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
              className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold"
            >
              Criar Conta Grátis
            </Button>
          </div>
        )}

        {comentariosOrdenados.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">Nenhum comentário ainda</p>
            <p className="text-xs text-gray-400 mt-1">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comentariosOrdenados.map((comentario) => (
              <div key={comentario.id} className={`p-4 rounded-lg relative ${comentario.fixado ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'}`}>
                {comentario.fixado && (
                  <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                    <Pin className="w-3 h-3 mr-1" />
                    Fixado
                  </Badge>
                )}
                
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    {comentario.usuario_foto ? (
                      <AvatarImage src={comentario.usuario_foto} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                        {comentario.usuario_nome?.charAt(0) || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-sm text-gray-900">
                        {comentario.usuario_nome}
                      </p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(comentario.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{comentario.comentario}</p>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleCurtirComentario(comentario.id)}
                        disabled={!user}
                        className={`flex items-center gap-1 text-sm transition-colors ${
                          comentario.usuarios_curtiram?.includes(user?.email)
                            ? 'text-red-600'
                            : 'text-gray-500 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${comentario.usuarios_curtiram?.includes(user?.email) ? 'fill-red-600' : ''}`} />
                        {comentario.curtidas || 0}
                      </button>

                      {isAutor && (
                        <button
                          onClick={() => handleFixarComentario(comentario.id)}
                          className="flex items-center gap-1 text-sm text-gray-500 hover:text-yellow-600 transition-colors"
                        >
                          <Pin className="w-4 h-4" />
                          {comentario.fixado ? 'Desafixar' : 'Fixar'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}