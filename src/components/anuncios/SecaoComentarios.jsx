import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Send, Heart, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SecaoComentarios({ anuncio, user }) {
  const queryClient = useQueryClient();
  const [novoComentario, setNovoComentario] = useState("");
  const [erro, setErro] = useState(null);

  const { data: comentarios = [], isLoading } = useQuery({
    queryKey: ['comentarios-anuncio', anuncio.id],
    queryFn: async () => {
      // Buscar comentários do anúncio
      const result = await base44.entities.Anuncio.filter({ id: anuncio.id });
      return result[0]?.comentarios || [];
    },
    initialData: [],
    staleTime: 30000,
  });

  const enviarComentarioMutation = useMutation({
    mutationFn: async (comentarioTexto) => {
      const comentariosAtuais = anuncio.comentarios || [];
      const novoComentarioObj = {
        usuario_nome: user.full_name,
        usuario_email: user.email,
        comentario: comentarioTexto,
        data: new Date().toISOString(),
        avaliacao_amenidades: {}
      };

      await base44.entities.Anuncio.update(anuncio.id, {
        comentarios: [...comentariosAtuais, novoComentarioObj]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comentarios-anuncio'] });
      setNovoComentario("");
      setErro(null);
      alert("Comentário enviado com sucesso!");
      window.location.reload();
    },
    onError: (error) => {
      setErro("Erro ao enviar comentário");
      console.error("Erro ao enviar comentário:", error);
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

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#F7D426]" />
          Comentários ({comentarios.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área para fazer comentários */}
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

        {/* Prompt para usuários não logados */}
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

        {/* Lista de comentários */}
        {isLoading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7D426] mx-auto"></div>
          </div>
        ) : comentarios.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">Nenhum comentário ainda</p>
            <p className="text-xs text-gray-400 mt-1">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comentarios.map((comentario, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                      {comentario.usuario_nome?.charAt(0) || 'U'}
                    </AvatarFallback>
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
                    <p className="text-sm text-gray-700">{comentario.comentario}</p>
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