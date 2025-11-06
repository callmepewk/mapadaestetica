import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Clock,
  ShoppingCart,
  User,
  Package,
  Loader2,
  Search,
  Eye,
  Check
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ControleProdutos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [busca, setBusca] = useState("");
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          navigate(createPageUrl("Inicio"));
          return;
        }
        setUser(userData);
      } catch (error) {
        navigate(createPageUrl("Inicio"));
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos-produtos'],
    queryFn: () => base44.entities.PedidoProduto.list('-created_date', 200),
    enabled: !!user,
  });

  const aprovarPedidoMutation = useMutation({
    mutationFn: async (pedidoId) => {
      await base44.entities.PedidoProduto.update(pedidoId, {
        status_pedido: "pago"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-produtos'] });
      setSucesso("Pedido aprovado com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: () => {
      setErro("Erro ao aprovar pedido");
      setTimeout(() => setErro(null), 3000);
    }
  });

  const rejeitarPedidoMutation = useMutation({
    mutationFn: async (pedidoId) => {
      await base44.entities.PedidoProduto.update(pedidoId, {
        status_pedido: "cancelado"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos-produtos'] });
      setSucesso("Pedido rejeitado com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: () => {
      setErro("Erro ao rejeitar pedido");
      setTimeout(() => setErro(null), 3000);
    }
  });

  const pedidosFiltrados = pedidos.filter(pedido => {
    if (!busca) return true;
    const searchLower = busca.toLowerCase();
    return (
      pedido.usuario_email?.toLowerCase().includes(searchLower) ||
      pedido.produto_nome?.toLowerCase().includes(searchLower) ||
      pedido.id?.toLowerCase().includes(searchLower)
    );
  });

  const pedidosPendentes = pedidosFiltrados.filter(p => p.status_pedido === 'aguardando_pagamento');
  const pedidosAprovados = pedidosFiltrados.filter(p => p.status_pedido === 'pago' || p.status_pedido === 'entregue');
  const pedidosCancelados = pedidosFiltrados.filter(p => p.status_pedido === 'cancelado');

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Controle de Produtos e Serviços
          </h1>
          <p className="text-gray-600">Gerencie pedidos e aprovações de compras</p>
        </div>

        {sucesso && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{sucesso}</AlertDescription>
          </Alert>
        )}

        {erro && (
          <Alert variant="destructive" className="mb-6">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Pedidos</p>
                  <p className="text-3xl font-bold text-gray-900">{pedidos.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendentes</p>
                  <p className="text-3xl font-bold text-yellow-600">{pedidosPendentes.length}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aprovados</p>
                  <p className="text-3xl font-bold text-green-600">{pedidosAprovados.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Cancelados</p>
                  <p className="text-3xl font-bold text-red-600">{pedidosCancelados.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca */}
        <Card className="mb-6 border-none shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar por email, produto ou ID do pedido..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Pedidos */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Lista de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum pedido encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto/Serviço</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosFiltrados.map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{pedido.usuario_email}</p>
                            <p className="text-xs text-gray-500">ID: {pedido.id.slice(0, 8)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{pedido.produto_nome}</p>
                          <p className="text-xs text-gray-500">Qtd: {pedido.quantidade}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            pedido.tipo === 'servico' ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                          }>
                            {pedido.tipo === 'servico' ? 'Serviço' : 'Produto'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-sm">R$ {pedido.valor_total?.toFixed(2)}</p>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            pedido.status_pedido === 'aguardando_pagamento' ? 'bg-yellow-100 text-yellow-800' :
                            pedido.status_pedido === 'pago' || pedido.status_pedido === 'entregue' ? 'bg-green-100 text-green-800' :
                            pedido.status_pedido === 'cancelado' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {pedido.status_pedido === 'aguardando_pagamento' && <Clock className="w-3 h-3 mr-1" />}
                            {(pedido.status_pedido === 'pago' || pedido.status_pedido === 'entregue') && <CheckCircle className="w-3 h-3 mr-1" />}
                            {pedido.status_pedido === 'cancelado' && <XCircle className="w-3 h-3 mr-1" />}
                            {pedido.status_pedido.replace(/_/g, ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {pedido.created_date ? format(new Date(pedido.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {pedido.status_pedido === 'aguardando_pagamento' && (
                              <>
                                <Button
                                  onClick={() => aprovarPedidoMutation.mutate(pedido.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  disabled={aprovarPedidoMutation.isPending}
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Aprovar
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (confirm("Tem certeza que deseja rejeitar este pedido?")) {
                                      rejeitarPedidoMutation.mutate(pedido.id);
                                    }
                                  }}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                  disabled={rejeitarPedidoMutation.isPending}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Rejeitar
                                </Button>
                              </>
                            )}
                            {pedido.status_pedido !== 'aguardando_pagamento' && (
                              <Badge variant="outline">
                                {pedido.status_pedido === 'cancelado' ? 'Rejeitado' : 'Processado'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}