import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, MessageSquare, Check, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function NotificationBell({ user }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notificacoes = [], isLoading } = useQuery({
    queryKey: ['notificacoes', user?.email],
    queryFn: async () => {
      if (!user) return [];
      const result = await base44.entities.Notificacao.filter(
        { usuario_email: user.email },
        '-created_date',
        50
      );
      return result;
    },
    enabled: !!user,
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const notificacoesNaoLidas = notificacoes.filter(n => !n.lida);

  const marcarComoLidaMutation = useMutation({
    mutationFn: async (notificacaoId) => {
      await base44.entities.Notificacao.update(notificacaoId, {
        lida: true,
        data_leitura: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });

  const marcarTodasComoLidasMutation = useMutation({
    mutationFn: async () => {
      const promises = notificacoesNaoLidas.map(n =>
        base44.entities.Notificacao.update(n.id, {
          lida: true,
          data_leitura: new Date().toISOString()
        })
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });

  const limparNotificacoesMutation = useMutation({
    mutationFn: async () => {
      const promises = notificacoes.map(n =>
        base44.entities.Notificacao.delete(n.id)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes'] });
    },
  });

  const handleNotificacaoClick = (notificacao) => {
    if (!notificacao.lida) {
      marcarComoLidaMutation.mutate(notificacao.id);
    }
    
    if (notificacao.link_acao) {
      setOpen(false);
      navigate(notificacao.link_acao);
    }
  };

  const handleMarcarTodasLidas = () => {
    if (notificacoesNaoLidas.length === 0) return;
    marcarTodasComoLidasMutation.mutate();
  };

  const handleLimparTodas = () => {
    if (!confirm("Deseja realmente limpar todas as notificações?")) return;
    limparNotificacoesMutation.mutate();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {notificacoesNaoLidas.length > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
              {notificacoesNaoLidas.length > 9 ? '9+' : notificacoesNaoLidas.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="border-b p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-lg">Notificações</h3>
            {notificacoes.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLimparTodas}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
          {notificacoesNaoLidas.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarcarTodasLidas}
              className="w-full justify-start text-blue-600"
            >
              <Check className="w-4 h-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F7D426] mx-auto"></div>
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500 text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao.id}
                  onClick={() => handleNotificacaoClick(notificacao)}
                  className={`p-4 cursor-pointer transition-colors ${
                    notificacao.lida 
                      ? 'hover:bg-gray-50' 
                      : 'bg-blue-50 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      notificacao.lida ? 'bg-gray-300' : 'bg-blue-600'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className={`font-semibold text-sm ${
                          notificacao.lida ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {notificacao.titulo}
                        </p>
                        {notificacao.tipo === 'nova_pergunta' && (
                          <MessageSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className={`text-xs mb-2 ${
                        notificacao.lida ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notificacao.mensagem}
                      </p>
                      <p className="text-xs text-gray-400">
                        {format(new Date(notificacao.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}