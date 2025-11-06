
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Check,
  Download,
  MessageCircle,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ControleProdutos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [sucesso, setSucesso] = useState(null);
  const [erro, setErro] = useState(null);
  const [gerandoRelatorio, setGerandoRelatorio] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          alert("⚠️ Acesso negado. Apenas administradores podem acessar esta página.");
          navigate(createPageUrl("Inicio"));
          return;
        }
        setUser(userData);
      } catch (error) {
        alert("⚠️ Você precisa estar logado como administrador para acessar esta página.");
        navigate(createPageUrl("Inicio"));
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['pedidos-produtos'],
    queryFn: () => base44.entities.PedidoProduto.list('-created_date', 500),
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

  // Obter usuários únicos dos pedidos
  const usuariosUnicos = [...new Set(pedidos.map(p => p.usuario_email))].sort();

  const pedidosFiltrados = pedidos.filter(pedido => {
    const matchBusca = !busca || 
      pedido.usuario_email?.toLowerCase().includes(busca.toLowerCase()) ||
      pedido.produto_nome?.toLowerCase().includes(busca.toLowerCase()) ||
      pedido.id?.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = !filtroStatus || pedido.status_pedido === filtroStatus;
    const matchUsuario = !filtroUsuario || pedido.usuario_email === filtroUsuario;
    
    return matchBusca && matchStatus && matchUsuario;
  });

  const pedidosPendentes = pedidosFiltrados.filter(p => p.status_pedido === 'aguardando_pagamento');
  const pedidosAprovados = pedidosFiltrados.filter(p => p.status_pedido === 'pago' || p.status_pedido === 'entregue');
  const pedidosCancelados = pedidosFiltrados.filter(p => p.status_pedido === 'cancelado');

  // Agrupar pedidos por usuário
  const pedidosPorUsuario = pedidosFiltrados.reduce((acc, pedido) => {
    if (!acc[pedido.usuario_email]) {
      acc[pedido.usuario_email] = [];
    }
    acc[pedido.usuario_email].push(pedido);
    return acc;
  }, {});

  // Função para gerar relatório via WhatsApp
  const handleEnviarWhatsApp = (emailUsuario = null) => {
    const pedidosParaRelatorio = emailUsuario 
      ? pedidosPorUsuario[emailUsuario] 
      : pedidosFiltrados;

    if (pedidosParaRelatorio.length === 0) {
      alert("Nenhum pedido para gerar relatório!");
      return;
    }

    let mensagem = `📊 *RELATÓRIO DE COMPRAS - MAPA DA ESTÉTICA*\n\n`;
    
    if (emailUsuario) {
      mensagem += `👤 *Cliente:* ${emailUsuario}\n`;
      mensagem += `📦 *Total de Pedidos:* ${pedidosParaRelatorio.length}\n\n`;
    } else {
      mensagem += `📦 *Total de Pedidos:* ${pedidosParaRelatorio.length}\n`;
      mensagem += `👥 *Total de Clientes:* ${Object.keys(pedidosPorUsuario).length}\n\n`;
    }

    mensagem += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (emailUsuario) {
      // Relatório individual
      pedidosParaRelatorio.forEach((pedido, index) => {
        mensagem += `*${index + 1}. ${pedido.produto_nome}*\n`;
        mensagem += `   Tipo: ${pedido.tipo === 'servico' ? 'Serviço' : 'Produto'}\n`;
        mensagem += `   Valor: R$ ${pedido.valor_total?.toFixed(2)}\n`;
        mensagem += `   Status: ${pedido.status_pedido.replace(/_/g, ' ')}\n`;
        mensagem += `   Data: ${format(new Date(pedido.created_date), "dd/MM/yyyy", { locale: ptBR })}\n\n`;
      });

      const totalGasto = pedidosParaRelatorio.reduce((sum, p) => sum + (p.valor_total || 0), 0);
      mensagem += `━━━━━━━━━━━━━━━━━━━━\n`;
      mensagem += `💰 *TOTAL GASTO: R$ ${totalGasto.toFixed(2)}*\n`;
    } else {
      // Relatório geral
      Object.entries(pedidosPorUsuario).forEach(([email, pedidosUsuario]) => {
        const totalUsuario = pedidosUsuario.reduce((sum, p) => sum + (p.valor_total || 0), 0);
        mensagem += `👤 *${email}*\n`;
        mensagem += `   Pedidos: ${pedidosUsuario.length}\n`;
        mensagem += `   Total: R$ ${totalUsuario.toFixed(2)}\n\n`;
      });

      const totalGeral = pedidosFiltrados.reduce((sum, p) => sum + (p.valor_total || 0), 0);
      mensagem += `━━━━━━━━━━━━━━━━━━━━\n`;
      mensagem += `💰 *TOTAL GERAL: R$ ${totalGeral.toFixed(2)}*\n`;
    }

    mensagem += `\n📅 Gerado em: ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`;

    const whatsapp = "5531972595643";
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  // Função para salvar PDF (simulação - requer biblioteca externa em produção)
  const handleSalvarPDF = async (emailUsuario = null) => {
    setGerandoRelatorio(true);
    
    try {
      const pedidosParaRelatorio = emailUsuario 
        ? pedidosPorUsuario[emailUsuario] 
        : pedidosFiltrados;

      if (pedidosParaRelatorio.length === 0) {
        alert("Nenhum pedido para gerar relatório!");
        return;
      }

      // Gerar HTML do relatório
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Relatório de Compras - Mapa da Estética</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #F7D426; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #F7D426; color: #2C2C2C; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>📊 Relatório de Compras - Mapa da Estética</h1>
          <p><strong>Data:</strong> ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
      `;

      if (emailUsuario) {
        htmlContent += `<p><strong>Cliente:</strong> ${emailUsuario}</p>`;
        htmlContent += `<p><strong>Total de Pedidos:</strong> ${pedidosParaRelatorio.length}</p>`;
      } else {
        htmlContent += `<p><strong>Total de Pedidos:</strong> ${pedidosParaRelatorio.length}</p>`;
        htmlContent += `<p><strong>Total de Clientes:</strong> ${Object.keys(pedidosPorUsuario).length}</p>`;
      }

      htmlContent += `
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Cliente</th>
              <th>Produto/Serviço</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
      `;

      pedidosParaRelatorio.forEach(pedido => {
        htmlContent += `
          <tr>
            <td>${format(new Date(pedido.created_date), "dd/MM/yyyy", { locale: ptBR })}</td>
            <td>${pedido.usuario_email}</td>
            <td>${pedido.produto_nome}</td>
            <td>${pedido.tipo === 'servico' ? 'Serviço' : 'Produto'}</td>
            <td>R$ ${pedido.valor_total?.toFixed(2)}</td>
            <td>${pedido.status_pedido.replace(/_/g, ' ')}</td>
          </tr>
        `;
      });

      const totalGeral = pedidosParaRelatorio.reduce((sum, p) => sum + (p.valor_total || 0), 0);
      
      htmlContent += `
          </tbody>
        </table>
        <p class="total">💰 TOTAL: R$ ${totalGeral.toFixed(2)}</p>
        </body>
        </html>
      `;

      // Criar blob e fazer download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio-compras-${emailUsuario || 'geral'}-${format(new Date(), 'yyyyMMdd')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert("✅ Relatório HTML gerado! Você pode abrir no navegador e salvar como PDF.");
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório");
    } finally {
      setGerandoRelatorio(false);
    }
  };

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
          <p className="text-gray-600">Gerencie pedidos e gere relatórios de compras</p>
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
                  <p className="text-3xl font-bold text-gray-900">{pedidosFiltrados.length}</p>
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

        {/* Filtros */}
        <Card className="mb-6 border-none shadow-lg">
          <CardHeader>
            <CardTitle>Filtros de Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Buscar</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Email, produto ou ID..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos</SelectItem>
                    <SelectItem value="aguardando_pagamento">Aguardando Pagamento</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="processando">Processando</SelectItem>
                    <SelectItem value="enviado">Enviado</SelectItem>
                    <SelectItem value="em_transito">Em Trânsito</SelectItem>
                    <SelectItem value="entregue">Entregue</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cliente</Label>
                <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos</SelectItem>
                    {usuariosUnicos.map(email => (
                      <SelectItem key={email} value={email}>{email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end gap-2">
                <Button
                  onClick={() => handleEnviarWhatsApp()}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={pedidosFiltrados.length === 0}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => handleSalvarPDF()}
                  variant="outline"
                  className="flex-1"
                  disabled={pedidosFiltrados.length === 0 || gerandoRelatorio}
                >
                  {gerandoRelatorio ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Pedidos */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Lista de Pedidos ({pedidosFiltrados.length})</CardTitle>
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
                      <TableHead>Data</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Produto/Serviço</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedidosFiltrados.map((pedido) => (
                      <TableRow key={pedido.id}>
                        <TableCell className="text-sm">
                          {format(new Date(pedido.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{pedido.usuario_email}</p>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 h-auto text-xs"
                              onClick={() => handleEnviarWhatsApp(pedido.usuario_email)}
                            >
                              Ver relatório do cliente
                            </Button>
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
