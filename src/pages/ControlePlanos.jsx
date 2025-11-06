
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Zap,
  Crown,
  Users
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom"; // Assuming react-router-dom for navigation

const PLANOS_INFO = {
  cobre: { nome: "Cobre", cor: "bg-orange-100 text-orange-800" },
  prata: { nome: "Prata", cor: "bg-gray-100 text-gray-800" },
  ouro: { nome: "Ouro", cor: "bg-yellow-100 text-yellow-800" },
  diamante: { nome: "Diamante", cor: "bg-blue-100 text-blue-800" },
  platina: { nome: "Platina", cor: "bg-purple-100 text-purple-800" }
};

const PLANOS_IMPULSIONAMENTO_INFO = {
  basico: { nome: "Básico", cor: "bg-blue-100 text-blue-800", duracao: 7, valor: 20 },
  intermediario: { nome: "Intermediário", cor: "bg-purple-100 text-purple-800", duracao: 14, valor: 35 },
  turbo: { nome: "Turbo", cor: "bg-orange-100 text-orange-800", duracao: 30, valor: 60 }
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
  const [abaSelecionada, setAbaSelecionada] = useState("planos_mapa");
  const [buscaProfissional, setBuscaProfissional] = useState("");
  const [enviandoWhatsApp, setEnviandoWhatsApp] = useState(false);
  const [planoSelecionadoUsuario, setPlanoSelecionadoUsuario] = useState(null);
  const [mostrarModalTrocarPlano, setMostrarModalTrocarPlano] = useState(false);
  const [novoPlano, setNovoPlano] = useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        if (userData.role !== 'admin') {
          alert("⚠️ Acesso negado. Apenas administradores podem acessar esta página.");
          // Assuming "Inicio" maps to "/" or a defined route like "/inicio"
          navigate("/inicio"); // Replaced createPageUrl("Inicio") with "/inicio" for functionality
          return;
        }
        setUser(userData);
      } catch (error) {
        alert("⚠️ Você precisa estar logado como administrador para acessar esta página.");
        navigate("/inicio"); // Replaced createPageUrl("Inicio") with "/inicio" for functionality
      }
    };
    fetchUser();
  }, [navigate]); // Add navigate to dependency array

  const { data: solicitacoesPlanos = [], isLoading: loadingSolicitacoesPlanos } = useQuery({
    queryKey: ['solicitacoes-plano'],
    queryFn: () => base44.entities.SolicitacaoAtivacaoPlano.list('-created_date', 100),
    enabled: !!user,
  });

  const { data: solicitacoesImpulsionamento = [], isLoading: loadingSolicitacoesImpulsionamento } = useQuery({
    queryKey: ['solicitacoes-impulsionamento'],
    queryFn: () => base44.entities.SolicitacaoImpulsionamento.list('-created_date', 100),
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

  const deletarImpulsionamentoMutation = useMutation({
    mutationFn: (id) => base44.entities.SolicitacaoImpulsionamento.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes-impulsionamento'] });
      setSucesso("Solicitação de impulsionamento excluída com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      console.error("Erro ao excluir impulsionamento:", error);
      setErro("Erro ao excluir solicitação de impulsionamento");
      setTimeout(() => setErro(null), 3000);
    }
  });


  const deletarProfissionalMutation = useMutation({
    mutationFn: async (email) => {
      // Como não podemos deletar usuários diretamente, vamos desativar
      await base44.auth.updateUser(email, {
        tipo_usuario: 'paciente', // Converte para paciente
        plano_ativo: 'cobre'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      setSucesso("Profissional removido com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    },
    onError: (error) => {
      console.error("Erro ao remover profissional:", error);
      setErro("Erro ao remover profissional");
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

  const trocarPlanoMutation = useMutation({
    mutationFn: async ({ email, plano }) => {
      await base44.entities.User.update(email, {
        plano_ativo: plano,
        data_adesao_plano: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios-profissionais'] });
      setSucesso("Plano atualizado com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
      setMostrarModalTrocarPlano(false);
      setPlanoSelecionadoUsuario(null);
      setNovoPlano("");
    },
    onError: () => {
      setErro("Erro ao trocar plano");
      setTimeout(() => setErro(null), 3000);
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

  const handleAtivarImpulsionamento = async (solicitacao) => {
    if (!confirm(`Ativar impulsionamento ${PLANOS_IMPULSIONAMENTO_INFO[solicitacao.plano_impulsionamento]?.nome} para "${solicitacao.anuncio_titulo}"?`)) {
      return;
    }

    setProcessando(true);
    try {
      const dataInicio = new Date();
      const dataFim = new Date();
      dataFim.setDate(dataFim.getDate() + solicitacao.duracao_dias);

      await base44.entities.SolicitacaoImpulsionamento.update(solicitacao.id, {
        status: "ativado_admin",
        data_ativacao: dataInicio.toISOString(),
        data_inicio_impulsionamento: dataInicio.toISOString(),
        data_fim_impulsionamento: dataFim.toISOString()
      });

      // Atualizar anúncio
      await base44.entities.Anuncio.update(solicitacao.anuncio_id, {
        impulsionado: true,
        data_impulsionamento: dataInicio.toISOString()
      });

      // Notificar usuário
      await base44.entities.Notificacao.create({
        usuario_email: solicitacao.usuario_email,
        tipo: "impulsionamento_ativado",
        titulo: `🚀 Impulsionamento Ativado!`,
        mensagem: `Seu anúncio "${solicitacao.anuncio_titulo}" foi impulsionado com sucesso! Válido até ${format(dataFim, "dd/MM/yyyy", { locale: ptBR })}.`,
        link_acao: `/detalhes-anuncio?id=${solicitacao.anuncio_id}`
      });

      queryClient.invalidateQueries({ queryKey: ['solicitacoes-impulsionamento'] });
      setSucesso("Impulsionamento ativado com sucesso!");
      setTimeout(() => setSucesso(null), 3000);
    } catch (error) {
      console.error("Erro ao ativar impulsionamento:", error);
      setErro("Erro ao ativar impulsionamento");
      setTimeout(() => setErro(null), 3000);
    } finally {
      setProcessando(false);
    }
  };


  const handleExcluirSolicitacao = (solicitacao) => {
    if (confirm(`Tem certeza que deseja excluir a solicitação de ${solicitacao.usuario_nome}?`)) {
      deletarSolicitacaoMutation.mutate(solicitacao.id);
    }
  };

  const handleExcluirImpulsionamento = (solicitacao) => {
    if (confirm(`Tem certeza que deseja excluir a solicitação de impulsionamento para ${solicitacao.usuario_nome} - Anúncio "${solicitacao.anuncio_titulo}"?`)) {
      deletarImpulsionamentoMutation.mutate(solicitacao.id);
    }
  };

  const handleExcluirProfissional = (usuario) => {
    if (confirm(`Tem certeza que deseja remover ${usuario.full_name} como profissional? Esta ação irá converter a conta para paciente e plano Cobre.`)) {
      deletarProfissionalMutation.mutate(usuario.email);
    }
  };

  const handleTrocarPlano = (usuario) => {
    setPlanoSelecionadoUsuario(usuario);
    setNovoPlano(usuario.plano_ativo || 'cobre'); // Default to 'cobre' if no plan
    setMostrarModalTrocarPlano(true);
  };

  const confirmarTrocaPlano = () => {
    if (!planoSelecionadoUsuario || !novoPlano) return;
    
    if (confirm(`Confirma a troca do plano de ${planoSelecionadoUsuario.full_name} para ${PLANOS_INFO[novoPlano]?.nome}?`)) {
      trocarPlanoMutation.mutate({
        email: planoSelecionadoUsuario.email,
        plano: novoPlano
      });
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
          <p><strong>Total de Solicitações:</strong> ${solicitacoesPlanos.length}</p>
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
            ${solicitacoesPlanos.map(sol => `
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
      const solicitacoesPendentes = solicitacoesPlanos.filter(s => 
        s.status === 'aguardando_confirmacao' || 
        s.status === 'confirmado_usuario' ||
        s.status === 'pagamento_pendente_mp'
      );

      let mensagemSolicitacoes = `📋 *SOLICITAÇÕES DE PLANOS*\n`;
      mensagemSolicitacoes += `Data: ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}\n`;
      mensagemSolicitacoes += `Total de Solicitações: ${solicitacoesPlanos.length}\n`;
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

      const solicitacoesAtivadas = solicitacoesPlanos.filter(s => s.status === 'ativado_admin');
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
            Controle de Planos e Impulsionamentos
          </h1>
          <p className="text-gray-600">Gerencie todas as solicitações e planos da plataforma</p>
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

        {/* Navegação por Abas */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <Button
            onClick={() => setAbaSelecionada("planos_mapa")}
            variant={abaSelecionada === "planos_mapa" ? "default" : "outline"}
            className={abaSelecionada === "planos_mapa" ? "bg-pink-600 hover:bg-pink-700" : ""}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Planos Mapa ({solicitacoesPlanos.length})
          </Button>

          <Button
            onClick={() => setAbaSelecionada("impulsionamento")}
            variant={abaSelecionada === "impulsionamento" ? "default" : "outline"}
            className={abaSelecionada === "impulsionamento" ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            <Zap className="w-4 h-4 mr-2" />
            Impulsionamentos ({solicitacoesImpulsionamento.length})
          </Button>

          <Button
            onClick={() => setAbaSelecionada("clube_beleza")}
            variant={abaSelecionada === "clube_beleza" ? "default" : "outline"}
            className={abaSelecionada === "clube_beleza" ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            <Crown className="w-4 h-4 mr-2" />
            Clube da Beleza (0)
          </Button>

          <Button
            onClick={() => setAbaSelecionada("patrocinadores")}
            variant={abaSelecionada === "patrocinadores" ? "default" : "outline"}
            className={abaSelecionada === "patrocinadores" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            <Users className="w-4 h-4 mr-2" />
            Patrocinadores (0)
          </Button>

          <Button
            onClick={() => setAbaSelecionada("profissionais")}
            variant={abaSelecionada === "profissionais" ? "default" : "outline"}
            className={abaSelecionada === "profissionais" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <User className="w-4 h-4 mr-2" />
            Profissionais ({usuarios.length})
          </Button>
        </div>

        {/* ABA: PLANOS MAPA DA ESTÉTICA */}
        {abaSelecionada === "planos_mapa" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Solicitações de Planos - Mapa da Estética</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={exportarSolicitacoesPDF}
                    variant="outline"
                    size="sm"
                    disabled={solicitacoesPlanos.length === 0}
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
              {loadingSolicitacoesPlanos ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                </div>
              ) : solicitacoesPlanos.length === 0 ? (
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
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solicitacoesPlanos.map((sol) => {
                        const StatusIcon = STATUS_INFO[sol.status]?.icon || Clock;
                        return (
                          <TableRow key={sol.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{sol.usuario_nome}</p>
                                <p className="text-sm text-gray-500">{sol.usuario_email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={PLANOS_INFO[sol.plano_solicitado]?.cor}>
                                {PLANOS_INFO[sol.plano_solicitado]?.nome}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={STATUS_INFO[sol.status]?.cor}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {STATUS_INFO[sol.status]?.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {sol.data_solicitacao ? format(new Date(sol.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {sol.status !== "ativado_admin" && (
                                  <Button
                                    onClick={() => {
                                      setSolicitacaoSelecionada(sol);
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
                                  onClick={() => handleExcluirSolicitacao(sol)}
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

        {/* ABA: IMPULSIONAMENTOS */}
        {abaSelecionada === "impulsionamento" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Solicitações de Impulsionamento</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {loadingSolicitacoesImpulsionamento ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
                </div>
              ) : solicitacoesImpulsionamento.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma solicitação de impulsionamento encontrada</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profissional</TableHead>
                        <TableHead>Anúncio</TableHead>
                        <TableHead>Plano</TableHead>
                        <TableHead>Duração/Valor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {solicitacoesImpulsionamento.map((sol) => {
                        const StatusIcon = STATUS_INFO[sol.status]?.icon || Clock;
                        const planoInfo = PLANOS_IMPULSIONAMENTO_INFO[sol.plano_impulsionamento];
                        return (
                          <TableRow key={sol.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{sol.usuario_nome}</p>
                                <p className="text-sm text-gray-500">{sol.usuario_email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="text-sm font-medium line-clamp-2">{sol.anuncio_titulo}</p>
                            </TableCell>
                            <TableCell>
                              <Badge className={planoInfo?.cor}>
                                <Zap className="w-3 h-3 mr-1" />
                                {planoInfo?.nome}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <p className="font-medium">{sol.duracao_dias} dias</p>
                                <p className="text-gray-500">R$ {sol.valor?.toFixed(2)}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={STATUS_INFO[sol.status]?.cor}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {STATUS_INFO[sol.status]?.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {sol.data_solicitacao ? format(new Date(sol.data_solicitacao), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {sol.status !== "ativado_admin" && (
                                  <Button
                                    onClick={() => handleAtivarImpulsionamento(sol)}
                                    size="sm"
                                    disabled={processando}
                                    className="bg-orange-600 hover:bg-orange-700"
                                  >
                                    <Zap className="w-4 h-4 mr-1" />
                                    Ativar
                                  </Button>
                                )}
                                <Button
                                  onClick={() => handleExcluirImpulsionamento(sol)}
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

        {/* ABA: CLUBE DA BELEZA */}
        {abaSelecionada === "clube_beleza" && (
          <Card>
            <CardContent className="p-12 text-center">
              <Crown className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Clube da Beleza - Em Desenvolvimento
              </h3>
              <p className="text-gray-600">
                Esta seção exibirá os planos e assinantes do Clube da Beleza
              </p>
            </CardContent>
          </Card>
        )}

        {/* ABA: PATROCINADORES */}
        {abaSelecionada === "patrocinadores" && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Patrocinadores - Em Desenvolvimento
              </h3>
              <p className="text-gray-600">
                Esta seção exibirá os patrocinadores e parcerias da plataforma
              </p>
            </CardContent>
          </Card>
        )}

        {/* ABA: PROFISSIONAIS */}
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
                  <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
                        <TableHead className="text-right">Ações</TableHead>
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
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                onClick={() => handleTrocarPlano(usuario)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <CreditCard className="w-4 h-4 mr-1" />
                                Trocar Plano
                              </Button>
                              <Button
                                onClick={() => {
                                  if (confirm(`Remover ${usuario.full_name} como profissional? Esta ação irá converter a conta para paciente e plano Cobre.`)) {
                                    handleExcluirProfissional(usuario);
                                  }
                                }}
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Remover
                              </Button>
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

      {/* NOVO: Modal de Trocar Plano */}
      <Dialog open={mostrarModalTrocarPlano} onOpenChange={setMostrarModalTrocarPlano}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar Plano do Profissional</DialogTitle>
            <DialogDescription>
              {planoSelecionadoUsuario && (
                <>Altere o plano de <strong>{planoSelecionadoUsuario.full_name}</strong></>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Selecione o Novo Plano</Label>
              <Select value={novoPlano} onValueChange={setNovoPlano}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione um plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cobre">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>COBRE (Grátis)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="prata">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span>PRATA (R$ 99/mês)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="ouro">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span>OURO (R$ 197/mês)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="diamante">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>DIAMANTE (R$ 297/mês)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="platina">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <span>PLATINA (R$ 997/mês)</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {planoSelecionadoUsuario && (
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Plano atual:</strong> {PLANOS_INFO[planoSelecionadoUsuario.plano_ativo || 'cobre']?.nome}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setMostrarModalTrocarPlano(false);
                  setPlanoSelecionadoUsuario(null);
                  setNovoPlano(""); // Clear new plan selection on cancel
                }}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmarTrocaPlano}
                disabled={trocarPlanoMutation.isPending || !novoPlano}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {trocarPlanoMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Troca
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
