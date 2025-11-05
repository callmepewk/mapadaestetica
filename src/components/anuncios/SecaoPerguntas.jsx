import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, CheckCircle, XCircle, Send } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { v4 as uuidv4 } from 'uuid';

const perguntasProntas = [
  {
    texto: "Este produto/serviço ainda está disponível?",
    tipo: "disponibilidade_produto"
  },
  {
    texto: "Esta oferta ainda está disponível?",
    tipo: "disponibilidade_oferta"
  }
];

export default function SecaoPerguntas({ anuncio, user, isAutor }) {
  const queryClient = useQueryClient();
  const [perguntaSelecionada, setPerguntaSelecionada] = useState(null);

  const enviarPerguntaMutation = useMutation({
    mutationFn: async (perguntaTexto) => {
      const novaPergunta = {
        id: uuidv4(),
        usuario_nome: user.full_name,
        usuario_email: user.email,
        pergunta: perguntaTexto.texto,
        tipo_pergunta: perguntaTexto.tipo,
        data_pergunta: new Date().toISOString(),
        respondida: false,
        resposta: "",
        data_resposta: "",
        notificacao_enviada: false
      };

      const perguntasAtuais = anuncio.perguntas || [];
      await base44.entities.Anuncio.update(anuncio.id, {
        perguntas: [...perguntasAtuais, novaPergunta]
      });

      // Criar notificação para o autor do anúncio
      await base44.entities.Notificacao.create({
        usuario_email: anuncio.created_by,
        tipo: 'nova_pergunta',
        titulo: 'Nova pergunta no seu anúncio',
        mensagem: `${user.full_name} perguntou: "${perguntaTexto.texto}"`,
        anuncio_id: anuncio.id,
        pergunta_id: novaPergunta.id,
        link_acao: `${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncio-detalhes'] });
      alert("Pergunta enviada! O profissional será notificado.");
      setPerguntaSelecionada(null);
    },
  });

  const responderPerguntaMutation = useMutation({
    mutationFn: async ({ perguntaId, resposta }) => {
      const perguntasAtuais = anuncio.perguntas || [];
      const perguntasAtualizadas = perguntasAtuais.map(p => {
        if (p.id === perguntaId) {
          return {
            ...p,
            respondida: true,
            resposta: resposta,
            data_resposta: new Date().toISOString()
          };
        }
        return p;
      });

      await base44.entities.Anuncio.update(anuncio.id, {
        perguntas: perguntasAtualizadas
      });

      // Criar notificação para quem perguntou
      const pergunta = perguntasAtuais.find(p => p.id === perguntaId);
      await base44.entities.Notificacao.create({
        usuario_email: pergunta.usuario_email,
        tipo: 'pergunta_respondida',
        titulo: 'Sua pergunta foi respondida',
        mensagem: `O anunciante respondeu "${resposta}" à sua pergunta sobre "${anuncio.titulo}"`,
        anuncio_id: anuncio.id,
        pergunta_id: perguntaId,
        link_acao: `${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anuncio-detalhes'] });
      alert("Resposta enviada! O usuário será notificado.");
    },
  });

  const perguntas = anuncio.perguntas || [];

  return (
    <Card className="border-2 border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-[#F7D426]" />
          Perguntas e Respostas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Área para fazer perguntas (apenas não-autores logados) */}
        {!isAutor && user && (
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="font-semibold text-blue-900 mb-3">
              Faça uma pergunta ao anunciante:
            </p>
            <div className="space-y-2">
              {perguntasProntas.map((pergunta, index) => (
                <Button
                  key={index}
                  onClick={() => enviarPerguntaMutation.mutate(pergunta)}
                  disabled={enviarPerguntaMutation.isPending}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 border-blue-300 hover:bg-blue-100"
                >
                  <Send className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm">{pergunta.texto}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Lista de perguntas e respostas */}
        {perguntas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">Nenhuma pergunta ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {perguntas.map((pergunta) => (
              <div key={pergunta.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    {pergunta.usuario_nome?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">
                      {pergunta.usuario_nome}
                    </p>
                    <p className="text-sm text-gray-700 mt-1">{pergunta.pergunta}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(pergunta.data_pergunta), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* Resposta ou botões para responder */}
                {pergunta.respondida ? (
                  <div className="ml-11 pl-4 border-l-2 border-green-300 bg-green-50 p-3 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <p className="font-semibold text-sm text-green-900">
                        Resposta do Anunciante:
                      </p>
                    </div>
                    <p className="text-sm text-green-800 font-bold">
                      {pergunta.resposta === 'sim' ? '✅ Sim' : '❌ Não'}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      {format(new Date(pergunta.data_resposta), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                ) : isAutor ? (
                  <div className="ml-11 flex gap-2">
                    <Button
                      onClick={() => responderPerguntaMutation.mutate({ perguntaId: pergunta.id, resposta: 'sim' })}
                      disabled={responderPerguntaMutation.isPending}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Sim
                    </Button>
                    <Button
                      onClick={() => responderPerguntaMutation.mutate({ perguntaId: pergunta.id, resposta: 'nao' })}
                      disabled={responderPerguntaMutation.isPending}
                      size="sm"
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Não
                    </Button>
                  </div>
                ) : (
                  <div className="ml-11">
                    <Badge variant="outline" className="text-xs">
                      Aguardando resposta...
                    </Badge>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}