
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  User,
  Calendar,
  FileText,
  Loader2,
  Download,
  Send,
  Trash2,
  X as XIcon
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PLANOS_INFO = {
  cobre: { nome: "Cobre", cor: "bg-orange-100 text-orange-800" },
  prata: { nome: "Prata", cor: "bg-gray-100 text-gray-800" },
  ouro: { nome: "Ouro", cor: "bg-yellow-100 text-yellow-800" },
  diamante: { nome: "Diamante", cor: "bg-blue-100 text-blue-800" },
  platina: { nome: "Platina", cor: "bg-purple-100 text-purple-800" }
};

const STATUS_INFO = {
  aguardando_confirmacao: { label: "Aguardando Confirmação", cor: "bg-yellow-100 text-yellow-800", icon: Clock },
  confirmado_usuario: { label: "Confirmado pelo Usuário", cor: "bg-blue-100 text-blue-800", icon: CheckCircle },
  pagamento_aprovado_mp: { label: "Pagamento Aprovado", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  pagamento_pendente_mp: { label: "Pagamento Pendente", cor: "bg-orange-100 text-orange-800", icon: Clock },
  pagamento_rejeitado_mp: { label: "Pagamento Rejeitado", cor: "bg-red-100 text-red-800", icon: XCircle },
  ativado_admin: { label: "Ativado", cor: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelado: { label: "Cancelado", cor: "bg-gray-100 text-gray-800", icon: XCircle }
};

export default function ControlePlanos() {
  const [user, setUser] = useState(null);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [mostrarModalAtivar, setMostrarModalAtivar] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState(null);
  const [abaSelecionada, setAbaSelecionada] = useState("solicitacoes");
  const [buscaProfissional, setBuscaProfissional] = useState("");
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(userData);
      } catch (error) {
        base44.auth.redirectToLogin(window.location.pathname);
      }
    };
    fetchUser();
  }, []);

  const { data: solicitacoes = [], isLoading: loadingSolicitacoes } = useQuery({
    queryKey: ['solicitacoes-plano'],
    queryFn: () => base44.entities.SolicitacaoAtivacaoPlano.list('-created_date', 50),
    enabled: !!user,
  });

  const { data: usuarios = [], isLoading: loadingUsuarios } = useQuery({
    queryKey: ['usuarios-profissionais'],
    queryFn: async () => {
      const allUsers = await base44.entities.User.list('-created_date', 500);
      return allUsers.filter(u => u.tipo_usuario === 'profissional');
    },
    enabled: !!user,
  });

  const deletarSolicitacaoMutation = useMutation({
    mutationFn: (id) => base44.entities.SolicitacaoAtivacaoPlano.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-plano'] });
      setSucesso("Solicitação excluída com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      console.error("Erro ao excluir:", error);
      setErro("Erro ao excluir solicitação");
      setTimeout(() => setErro(null), 3000);
    }
  });

  const ativarPlanoMutation = useMutation({
    mutationFn: async ({ usuarioEmail, plano, solicitacaoId }) => {
      await base44.auth.updateUser(usuarioEmail, { plano_ativo: plano });
      
      await base44.entities.SolicitacaoAtivacaoPlano.update(solicitacaoId, {
        status: "ativado_admin",
        data_ativacao: new Date().toISOString(),
        observacoes: observacoes
      });

      await base44.integrations.Core.SendEmail({
        to: usuarioEmail,
        subject: "Plano Ativado - Mapa da Estética",
        body: `Olá! Seu plano ${PLANOS_INFO[plano].nome} foi ativado com sucesso! 🎉\n\nVocê já pode aproveitar todos os benefícios.\n\nObrigado por fazer parte do Mapa da Estética!`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-plano'] });
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      setMostrarModalAtivar(false);
      setSolicitacaoSelecionada(null);
      setObservacoes("");
      setSucesso("Plano ativado e email enviado com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      console.error("Erro ao ativar plano:", error);
      setErro("Erro ao ativar plano. Tente novamente.");
      setTimeout(() => setErro(null), 5000);
    }
  });

  const handleAtivarPlano = async () => {
    if (!solicitacaoSelecionada) return;
    setProcessando(true);
    try {
      await ativarPlanoMutation.mutateAsync({
        usuarioEmail: solicitacaoSelecionada.usuario_email,
        plano: solicitacaoSelecionada.plano_solicitado,
        solicitacaoId: solicitacaoSelecionada.id
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleExcluirSolicitacao = (solicitacao) => {
    if (confirm(`Tem certeza que deseja excluir a solicitação de ${solicitacao.usuario_nome}?`)) {
      deletarSolicitacaoMutation.mutate(solicitacao.id);
    }
  };

  const exportarSolicitacoesPDF = () => {
    const dataAtual = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Solicitações de Planos - Mapa da Estética</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #2C2C2C; border-bottom: 3px solid #F7D426; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #2C2C2C; color: #F7D426; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background: #f8f9fa; }
          .header-info { background: #FFF9E6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>📋 Solicitações de Planos</h1>
        <div class="header-info">
          <p><strong>Gerado em:</strong> ${dataAtual}</p>
          <p><strong>Total de Solicitações:</strong> ${solicitacoes.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Plano</th>
              <th>Status</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            ${solicitacoes.map(sol => `
              <tr>
                <td>${sol.usuario_nome}</td>
                <td>${sol.usuario_email}</td>
                <td>${PLANOS_INFO[sol.plano_solicitado]?.nome || sol.plano_solicitado}</td>
                <td>${STATUS_INFO[sol.status]?.label || sol.status}</td>
                <td>${sol.data_solicitacao ? format(new Date(sol.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 40px; text-align: center; color: #999; border-top: 1px solid #ddd; padding-top: 20px;">
          <p><strong>Mapa da Estética - Clube da Beleza</strong></p>
          <p>CNPJ: 46.792.168/0001-88</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Solicitacoes_Planos_${format(new Date(), "yyyy-MM-dd")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Arquivo HTML baixado! Para converter em PDF:\n\n1. Abra o arquivo no navegador\n2. Pressione Ctrl+P (Windows) ou Cmd+P (Mac)\n3. Selecione "Salvar como PDF"\n4. Clique em Salvar');
  };

  const exportarProfissionaisPDF = () => {
    const dataAtual = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });
    
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Lista de Profissionais - Mapa da Estética</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #2C2C2C; border-bottom: 3px solid #F7D426; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #2C2C2C; color: #F7D426; padding: 12px; text-align: left; font-size: 12px; }
          td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px; }
          tr:nth-child(even) { background: #f8f9fa; }
          .header-info { background: #FFF9E6; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>👥 Lista de Profissionais</h1>
        <div class="header-info">
          <p><strong>Gerado em:</strong> ${dataAtual}</p>
          <p><strong>Total de Profissionais:</strong> ${usuariosFiltrados.length}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Cidade</th>
              <th>Estado</th>
              <th>Plano</th>
            </tr>
          </thead>
          <tbody>
            ${usuariosFiltrados.map(user => `
              <tr>
                <td>${user.full_name}</td>
                <td>${user.email}</td>
                <td>${user.telefone || "-"}</td>
                <td>${user.cidade || "-"}</td>
                <td>${user.estado || "-"}</td>
                <td>${PLANOS_INFO[user.plano_ativo || 'cobre']?.nome}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 40px; text-align: center; color: #999; border-top: 1px solid #ddd; padding-top: 20px;">
          <p><strong>Mapa da Estética - Clube da Beleza</strong></p>
          <p>CNPJ: 46.792.168/0001-88</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Profissionais_${format(new Date(), "yyyy-MM-dd")}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Arquivo HTML baixado! Para converter em PDF:\n\n1. Abra o arquivo no navegador\n2. Pressione Ctrl+P (Windows) ou Cmd+P (Mac)\n3. Selecione "Salvar como PDF"\n4. Clique em Salvar');
  };

  const enviarRelatorioWhatsApp = async () => {
    setEnviandoWhatsApp(true);
    
    try {
      const solicitacoesPendentes = solicitacoes.filter(s => 
        s.status === 'aguardando_confirmacao' || 
        s.status === 'confirmado_usuario' ||
        s.status === 'pagamento_pendente_mp'
      );

      let mensagemSolicitacoes = `📋 *SOLICITAÇÕES DE PLANOS*\n`;
      mensagemSolicitacoes += `Data: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}\n`;
      mensagemSolicitacoes += `Total de Solicitações: ${solicitacoes.length}\n`;
      mensagemSolicitacoes += `Pendentes: ${solicitacoesPendentes.length}\n\n`;

      if (solicitacoesPendentes.length > 0) {
        mensagemSolicitacoes += `*🔔 SOLICITAÇÕES PENDENTES:*\n\n`;
        solicitacoesPendentes.forEach((sol, i) => {
          mensagemSolicitacoes += `${i + 1}. ${sol.usuario_nome}\n`;
          mensagemSolicitacoes += `   📧 ${sol.usuario_email}\n`;
          mensagemSolicitacoes += `   💎 Plano: ${PLANOS_INFO[sol.plano_solicitado]?.nome}\n`;
          mensagemSolicitacoes += `   ⏰ Status: ${STATUS_INFO[sol.status]?.label}\n\n`;
        });
      }

      const solicitacoesAtivadas = solicitacoes.filter(s => s.status === 'ativado_admin');
      if (solicitacoesAtivadas.length > 0) {
        mensagemSolicitacoes += `\n*✅ ATIVADAS (${solicitacoesAtivadas.length}):*\n`;
        solicitacoesAtivadas.forEach((sol, i) => {
          mensagemSolicitacoes += `${i + 1}. ${sol.usuario_nome} - ${PLANOS_INFO[sol.plano_solicitado]?.nome}\n`;
        });
      }

      let mensagemProfissionais = `\n\n👥 *LISTA DE PROFISSIONAIS*\n`;
      mensagemProfissionais += `Total: ${usuarios.length} profissionais\n\n`;

      const porPlano = {
        cobre: usuarios.filter(u => u.plano_ativo === 'cobre' || !u.plano_ativo).length,
        prata: usuarios.filter(u => u.plano_ativo === 'prata').length,
        ouro: usuarios.filter(u => u.plano_ativo === 'ouro').length,
        diamante: usuarios.filter(u => u.plano_ativo === 'diamante').length,
        platina: usuarios.filter(u => u.plano_ativo === 'platina').length,
      };

      mensagemProfissionais += `*Distribuição por Plano:*\n`;
      mensagemProfissionais += `🥉 Cobre: ${porPlano.cobre}\n`;
      mensagemProfissionais += `🥈 Prata: ${porPlano.prata}\n`;
      mensagemProfissionais += `🥇 Ouro: ${porPlano.ouro}\n`;
      mensagemProfissionais += `💎 Diamante: ${porPlano.diamante}\n`;
      mensagemProfissionais += `👑 Platina: ${porPlano.platina}\n`;

      const mensagemCompleta = mensagemSolicitacoes + mensagemProfissionais;

      // Codificar mensagem para URL do WhatsApp
      const mensagemCodificada = encodeURIComponent(mensagemCompleta);
      
      // Abrir WhatsApp Web/App com a mensagem
      const whatsappUrl = `https://api.whatsapp.com/send?text=${mensagemCodificada}`;
      window.open(whatsappUrl, '_blank');

      setSucesso("Link do WhatsApp aberto! Cole a mensagem no grupo.");
      
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      setErro("Erro ao gerar relatório");
    } finally {
      setEnviandoWhatsApp(false);
      setTimeout(() => {
        setSucesso(null);
        setErro(null);
      }, 5000);
    }
  };

  const usuariosFiltrados = usuarios.filter(u => 
    !buscaProfissional || 
    u.full_name?.toLowerCase().includes(buscaProfissional.toLowerCase()) ||
    u.email?.toLowerCase().includes(buscaProfissional.toLowerCase()) ||
    u.cidade?.toLowerCase().includes(buscaProfissional.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Controle de Planos
          </h1>
          <p className="text-gray-600">Gerencie solicitações e planos ativos dos profissionais</p>
        </div>

        {erro && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{erro}</AlertDescription>
          </Alert>
        )}

        {sucesso && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{sucesso}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-4 mb-6">
          <Button
            onClick={() => setAbaSelecionada("solicitacoes")}
            variant={abaSelecionada === "solicitacoes" ? "default" : "outline"}
            className={abaSelecionada === "solicitacoes" ? "bg-pink-600 hover:bg-pink-700" : ""}
          >
            <FileText className="w-4 h-4 mr-2" />
            Solicitações ({solicitacoes.length})
          </Button>
          <Button
            onClick={() => setAbaSelecionada("profissionais")}
            variant={abaSelecionada === "profissionais" ? "default" : "outline"}
            className={abaSelecionada === "profissionais" ? "bg-pink-600 hover:bg-pink-700" : ""}
          >
            <User className="w-4 h-4 mr-2" />
            Profissionais ({usuarios.length})
          </Button>
        </div>

        {abaSelecionada === "solicitacoes" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Solicitações de Ativação de Planos</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={exportarSolicitacoesPDF}
                    variant="outline"
                    size="sm"
                    disabled={solicitacoes.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Relatório
                  </Button>
                  <Button
                    onClick={enviarRelatorioWhatsApp}
                    variant="outline"
                    size="sm"
                    disabled={enviandoWhatsApp}
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    {enviandoWhatsApp ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Enviar Relatório
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSolicitacoes ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                </div>
              ) : solicitacoes.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma solicitação encontrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data Solicitação</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solicitacoes.map((solicitacao) => {
                        const StatusIcon = STATUS_INFO[solicitacao.status]?.icon || Clock;
                        return (
                          <TableRow key={solicitacao.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{solicitacao.usuario_nome}</p>
                                <p className="text-sm text-gray-500">{solicitacao.usuario_email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={PLANOS_INFO[solicitacao.plano_solicitado]?.cor}>
                                <CreditCard className="w-3 h-3 mr-1" />
                                {PLANOS_INFO[solicitacao.plano_solicitado]?.nome}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={STATUS_INFO[solicitacao.status]?.cor}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {STATUS_INFO[solicitacao.status]?.label}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                {solicitacao.data_solicitacao
                                  ? format(new Date(solicitacao.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                  : "-"}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {solicitacao.status !== "ativado_admin" && (
                                  <Button
                                    onClick={() => {
                                      setSolicitacaoSelecionada(solicitacao);
                                      setMostrarModalAtivar(true);
                                    }}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Ativar
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleExcluirSolicitacao(solicitacao)}
                                  size="sm"
                                  variant="outline"
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {abaSelecionada === "profissionais" && (
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle>Lista de Profissionais</CardTitle>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Input
                    placeholder="Buscar profissional..."
                    value={buscaProfissional}
                    onChange={(e) => setBuscaProfissional(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={exportarProfissionaisPDF}
                      variant="outline"
                      size="sm"
                      disabled={usuarios.length === 0}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Relatório
                    </Button>
                    <Button
                      onClick={enviarRelatorioWhatsApp}
                      variant="outline"
                      size="sm"
                      disabled={enviandoWhatsApp}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      {enviandoWhatsApp ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Enviar
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingUsuarios ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                </div>
              ) : usuariosFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum profissional encontrado</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Localização</TableHead>
                        <TableHead>Plano Ativo</TableHead>
                        <TableHead>Cadastro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usuariosFiltrados.map((usuario) => (
                        <TableRow key={usuario.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{usuario.full_name}</p>
                              <p className="text-sm text-gray-500">{usuario.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{usuario.telefone || "-"}</p>
                              {usuario.whatsapp && (
                                <p className="text-green-600">WhatsApp: {usuario.whatsapp}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{usuario.cidade || "-"}</p>
                              <p className="text-gray-500">{usuario.estado || "-"}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={PLANOS_INFO[usuario.plano_ativo || 'cobre']?.cor}>
                              {PLANOS_INFO[usuario.plano_ativo || 'cobre']?.nome}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={usuario.cadastro_completo ? "default" : "secondary"}>
                              {usuario.cadastro_completo ? "Completo" : "Incompleto"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={mostrarModalAtivar} onOpenChange={setMostrarModalAtivar}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ativar Plano</DialogTitle>
            <DialogDescription>
              Confirme a ativação do plano para {solicitacaoSelecionada?.usuario_nome}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Profissional:</span>
                <span className="font-medium">{solicitacaoSelecionada?.usuario_nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="font-medium">{solicitacaoSelecionada?.usuario_email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Plano:</span>
                <Badge className={PLANOS_INFO[solicitacaoSelecionada?.plano_solicitado]?.cor}>
                  {PLANOS_INFO[solicitacaoSelecionada?.plano_solicitado]?.nome}
                </Badge>
              </div>
            </div>

            <div>
              <Label>Observações (opcional)</Label>
              <Input
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Adicione observações sobre esta ativação..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setMostrarModalAtivar(false);
                setSolicitacaoSelecionada(null);
                setObservacoes("");
              }}
              disabled={processando}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAtivarPlano}
              disabled={processando}
              className="bg-green-600 hover:bg-green-700"
            >
              {processando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar Ativação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
