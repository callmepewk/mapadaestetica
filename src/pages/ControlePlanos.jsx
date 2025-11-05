import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { ArrowLeft, Search, Crown, Filter, Check, X, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

const planosDisponiveis = [
  { value: "cobre", label: "COBRE", cor: "from-orange-500 to-amber-600" },
  { value: "prata", label: "PRATA", cor: "from-gray-400 to-gray-600" },
  { value: "ouro", label: "OURO", cor: "from-yellow-400 to-amber-500" },
  { value: "diamante", label: "DIAMANTE", cor: "from-cyan-500 to-blue-600" },
  { value: "platina", label: "PLATINA", cor: "from-purple-600 to-pink-600" }
];

export default function ControlePlanos() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtroPlano, setFiltroPlano] = useState("todos");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [alterandoPlano, setAlterandoPlano] = useState(null);
  const [sucessoMsg, setSucessoMsg] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Verificar se é admin
        if (userData.role !== 'admin') {
          navigate(createPageUrl("Inicio"));
        }
      } catch {
        navigate(createPageUrl("Inicio"));
      }
    };
    checkAuth();
  }, [navigate]);

  // Buscar solicitações de ativação
  const { data: solicitacoes = [], isLoading, refetch } = useQuery({
    queryKey: ['solicitacoes-planos'],
    queryFn: async () => {
      const todas = await base44.entities.SolicitacaoAtivacaoPlano.list('-created_date', 100);
      return todas;
    },
    enabled: !!user?.role && user.role === 'admin',
  });

  // Buscar todos os usuários profissionais
  const { data: profissionais = [] } = useQuery({
    queryKey: ['profissionais-todos'],
    queryFn: async () => {
      const users = await base44.entities.User.list('', 500);
      return users.filter(u => u.tipo_usuario === 'profissional');
    },
    enabled: !!user?.role && user.role === 'admin',
  });

  const handleAlterarPlano = async (usuarioEmail, novoPlano) => {
    const confirma = window.confirm(
      `Confirmar alteração de plano?\n\nUsuário: ${usuarioEmail}\nNovo plano: ${novoPlano.toUpperCase()}\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirma) return;

    try {
      setAlterandoPlano(usuarioEmail);
      
      // Atualizar o plano do usuário
      const usuarios = await base44.entities.User.filter({ email: usuarioEmail });
      if (usuarios.length > 0) {
        await base44.entities.User.update(usuarios[0].id, {
          plano_ativo: novoPlano,
          data_adesao_plano: new Date().toISOString().split('T')[0]
        });
        
        setSucessoMsg(`✅ Plano de ${usuarioEmail} alterado para ${novoPlano.toUpperCase()} com sucesso!`);
        setTimeout(() => setSucessoMsg(""), 5000);
        refetch();
      }
    } catch (error) {
      console.error("Erro ao alterar plano:", error);
      alert("Erro ao alterar plano. Tente novamente.");
    } finally {
      setAlterandoPlano(null);
    }
  };

  const handleMarcarComoAtivado = async (solicitacaoId, usuarioEmail, planoSolicitado) => {
    const confirma = window.confirm(
      `Ativar plano ${planoSolicitado.toUpperCase()} para ${usuarioEmail}?`
    );

    if (!confirma) return;

    try {
      // Atualizar solicitação
      await base44.entities.SolicitacaoAtivacaoPlano.update(solicitacaoId, {
        status: 'ativado_admin',
        data_ativacao: new Date().toISOString()
      });

      // Atualizar plano do usuário
      await handleAlterarPlano(usuarioEmail, planoSolicitado);
    } catch (error) {
      console.error("Erro ao ativar plano:", error);
      alert("Erro ao ativar plano. Tente novamente.");
    }
  };

  // Filtrar dados
  const solicitacoesFiltradas = solicitacoes.filter(sol => {
    const matchBusca = !busca || 
      sol.usuario_email?.toLowerCase().includes(busca.toLowerCase()) ||
      sol.usuario_nome?.toLowerCase().includes(busca.toLowerCase());
    
    const matchStatus = filtroStatus === "todos" || sol.status === filtroStatus;
    
    return matchBusca && matchStatus;
  });

  const profissionaisFiltrados = profissionais.filter(prof => {
    const matchBusca = !busca ||
      prof.email?.toLowerCase().includes(busca.toLowerCase()) ||
      prof.full_name?.toLowerCase().includes(busca.toLowerCase()) ||
      prof.telefone?.includes(busca);
    
    const matchPlano = filtroPlano === "todos" || prof.plano_ativo === filtroPlano;
    
    return matchBusca && matchPlano;
  });

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-4">Apenas administradores podem acessar esta página.</p>
          <Button onClick={() => navigate(createPageUrl("Inicio"))}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Inicio"))}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Controle de Planos
              </h1>
              <p className="text-gray-600">
                Gerencie planos e ativações de usuários
              </p>
            </div>
            <Badge className="bg-purple-600 text-white text-lg px-4 py-2">
              <Crown className="w-5 h-5 mr-2" />
              Admin
            </Badge>
          </div>
        </div>

        {/* Mensagem de Sucesso */}
        {sucessoMsg && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {sucessoMsg}
            </AlertDescription>
          </Alert>
        )}

        {/* Filtros */}
        <Card className="mb-6 border-none shadow-lg">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filtroPlano} onValueChange={setFiltroPlano}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Planos</SelectItem>
                  {planosDisponiveis.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="aguardando_confirmacao">Aguardando Confirmação</SelectItem>
                  <SelectItem value="confirmado_usuario">Confirmado pelo Usuário</SelectItem>
                  <SelectItem value="ativado_admin">Ativado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <Button
            variant="outline"
            className="border-2"
            onClick={() => document.getElementById('solicitacoes').scrollIntoView({ behavior: 'smooth' })}
          >
            Solicitações Pendentes ({solicitacoesFiltradas.filter(s => s.status !== 'ativado_admin').length})
          </Button>
          <Button
            variant="outline"
            className="border-2"
            onClick={() => document.getElementById('profissionais').scrollIntoView({ behavior: 'smooth' })}
          >
            Todos os Profissionais ({profissionaisFiltrados.length})
          </Button>
        </div>

        {/* Solicitações de Ativação */}
        <div id="solicitacoes" className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Solicitações de Ativação</h2>
          <Card className="border-none shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <TableHead className="text-white">Data</TableHead>
                  <TableHead className="text-white">Usuário</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Plano</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : solicitacoesFiltradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhuma solicitação encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  solicitacoesFiltradas.map((sol) => (
                    <TableRow key={sol.id}>
                      <TableCell>
                        {new Date(sol.created_date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="font-medium">{sol.usuario_nome}</TableCell>
                      <TableCell>{sol.usuario_email}</TableCell>
                      <TableCell>
                        <Badge className={`bg-gradient-to-r ${planosDisponiveis.find(p => p.value === sol.plano_solicitado)?.cor} text-white`}>
                          {sol.plano_solicitado?.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          sol.status === 'ativado_admin' ? 'default' :
                          sol.status === 'confirmado_usuario' ? 'secondary' :
                          sol.status === 'cancelado' ? 'destructive' : 'outline'
                        }>
                          {sol.status === 'aguardando_confirmacao' && 'Aguardando'}
                          {sol.status === 'confirmado_usuario' && 'Confirmado'}
                          {sol.status === 'ativado_admin' && 'Ativado'}
                          {sol.status === 'cancelado' && 'Cancelado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {sol.status !== 'ativado_admin' && sol.status !== 'cancelado' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarcarComoAtivado(sol.id, sol.usuario_email, sol.plano_solicitado)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Ativar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Lista de Todos os Profissionais */}
        <div id="profissionais">
          <h2 className="text-2xl font-bold mb-4">Todos os Profissionais</h2>
          <Card className="border-none shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-600 to-cyan-600">
                  <TableHead className="text-white">Nome</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Telefone</TableHead>
                  <TableHead className="text-white">Plano Atual</TableHead>
                  <TableHead className="text-white text-center">Alterar Plano</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profissionaisFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum profissional encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  profissionaisFiltrados.map((prof) => (
                    <TableRow key={prof.id}>
                      <TableCell className="font-medium">{prof.full_name}</TableCell>
                      <TableCell>{prof.email}</TableCell>
                      <TableCell>{prof.telefone || 'Não informado'}</TableCell>
                      <TableCell>
                        <Badge className={`bg-gradient-to-r ${planosDisponiveis.find(p => p.value === prof.plano_ativo)?.cor} text-white`}>
                          {prof.plano_ativo?.toUpperCase() || 'COBRE'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={prof.plano_ativo || 'cobre'}
                          onValueChange={(novoPlano) => handleAlterarPlano(prof.email, novoPlano)}
                          disabled={alterandoPlano === prof.email}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {planosDisponiveis.map(p => (
                              <SelectItem key={p.value} value={p.value}>
                                {p.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}