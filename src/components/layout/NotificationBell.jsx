
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, Check, Eye, Trash2, X, Rocket, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function NotificationBell({ user }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [popoverAberto, setPopoverAberto] = useState(false);

  const { data: notificacoes = [], isLoading } = useQuery({
    queryKey: ['notificacoes', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Notificacao.filter(
        { usuario_email: user.email },
        '-created_date',
        50
      );
    },
    enabled: !!user,
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const { data: novidades = [], isLoading: loadingNovidades } = useQuery({
    queryKey: ['novidades-usuario'],
    queryFn: async () => {
      return await base44.entities.Novidade.filter(
        { status: 'publicado' },
        '-created_date',
        10
      );
    },
    enabled: !!user,
  });

  const marcarComoLidaMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Notificacao.update(id, {
        lida: true,
        data_leitura: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes', user?.email] });
    },
  });

  const marcarTodasComoLidasMutation = useMutation({
    mutationFn: async () => {
      const naoLidas = notificacoes.filter(n => !n.lida);
      for (const notif of naoLidas) {
        await base44.entities.Notificacao.update(notif.id, {
          lida: true,
          data_leitura: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes', user?.email] });
    },
  });

  const excluirNotificacaoMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.Notificacao.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes', user?.email] });
    },
  });

  const handleClickNotificacao = async (notificacao) => {
    // Se for atualização do sistema, buscar detalhes da novidade
    if (notificacao.tipo === 'nova_atualizacao_sistema' && notificacao.link_acao) {
      const novidadeId = notificacao.link_acao.split('id=')[1];
      const novidade = novidades.find(n => n.id === novidadeId);
      
      if (novidade) {
        setNotificacaoSelecionada({ ...notificacao, novidade });
        setMostrarDetalhes(true);
      }
    } else if (notificacao.link_acao) {
      // Outras notificações: navegar
      navigate(notificacao.link_acao);
    }

    // Marcar como lida
    if (!notificacao.lida) {
      marcarComoLidaMutation.mutate(notificacao.id);
    }
    
    setPopoverAberto(false);
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  if (!user) return null;

  return (
    <>
      <Popover open={popoverAberto} onOpenChange={setPopoverAberto}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {naoLidas > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-600 text-white text-xs">
                {naoLidas > 9 ? '9+' : naoLidas}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Notificações</h3>
              {naoLidas > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => marcarTodasComoLidasMutation.mutate()}
                  className="text-xs"
                  disabled={marcarTodasComoLidasMutation.isPending}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {naoLidas > 0 ? `${naoLidas} não lida${naoLidas > 1 ? 's' : ''}` : 'Tudo em dia!'}
            </p>
          </div>

          <ScrollArea className="h-[400px]">
            {isLoading || loadingNovidades ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-pink-600" />
              </div>
            ) : notificacoes.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y">
                {notificacoes.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notif.lida ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleClickNotificacao(notif)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {notif.tipo === 'nova_atualizacao_sistema' && (
                            <Rocket className="w-4 h-4 text-purple-600" />
                          )}
                          <p className="font-semibold text-sm">{notif.titulo}</p>
                          {!notif.lida && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{notif.mensagem}</p>
                        <p className="text-xs text-gray-400">
                          {format(new Date(notif.created_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          excluirNotificacaoMutation.mutate(notif.id);
                        }}
                        className="h-auto p-1"
                      >
                        <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {/* Modal Detalhes da Atualização */}
      <Dialog open={mostrarDetalhes} onOpenChange={setMostrarDetalhes}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {notificacaoSelecionada?.novidade ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <span className="text-3xl">{notificacaoSelecionada.novidade.icone || '🚀'}</span>
                  {notificacaoSelecionada.novidade.titulo}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-100 text-purple-800">
                    {notificacaoSelecionada.novidade.categoria}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {format(new Date(notificacaoSelecionada.novidade.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border-2 border-purple-200">
                  <h4 className="font-bold text-lg mb-3 text-purple-900">📋 Resumo</h4>
                  <p className="text-gray-700 leading-relaxed">
                    {notificacaoSelecionada.novidade.descricao}
                  </p>
                </div>

                {notificacaoSelecionada.novidade.conteudo_detalhado && (
                  <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
                    <h4 className="font-bold text-lg mb-3 text-gray-900">📖 Detalhes Completos</h4>
                    <div className="prose prose-sm max-w-none">
                      {notificacaoSelecionada.novidade.conteudo_detalhado.split('\n\n').map((paragrafo, index) => (
                        <p key={index} className="text-gray-700 mb-3 leading-relaxed">
                          {paragrafo}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {notificacaoSelecionada.novidade.imagem && (
                  <div className="rounded-lg overflow-hidden border-2 border-gray-200">
                    <img 
                      src={notificacaoSelecionada.novidade.imagem} 
                      alt={notificacaoSelecionada.novidade.titulo}
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setMostrarDetalhes(false);
                    setNotificacaoSelecionada(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Fechar
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Notificação</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-gray-600">Detalhes não disponíveis</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
