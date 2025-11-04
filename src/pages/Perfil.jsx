
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Edit,
  Save,
  LogOut,
  Trash2,
  Eye,
  TrendingUp,
  Clock,
  Star,
  AlertCircle,
  MessageCircle,
  ShoppingCart
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from 'date-fns';

export default function Perfil() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [mostrarMeusAnuncios, setMostrarMeusAnuncios] = useState(false); // This state seems unused now with Tabs
  const [editandoSenha, setEditandoSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [user, setUser] = useState(null);
  const [perfilEditado, setPerfilEditado] = useState({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        setPerfilEditado(userData);
      } catch (error) {
        navigate(createPageUrl("Inicio"));
      }
    };
    fetchUser();
  }, [navigate]);

  const isPaciente = user?.tipo_usuario === 'paciente';
  const isProfissional = user?.tipo_usuario === 'profissional';

  // CARREGAMENTO INSTANTÂNEO
  const { data: meusAnuncios = [], isLoading: isLoadingAnuncios } = useQuery({
    queryKey: ['meus-anuncios', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Anuncio.filter({ created_by: user.email });
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 15 * 60 * 1000, // 15 minutos
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialData: [],
  });

  const { data: meusPedidos = [], isLoading: isLoadingPedidos } = useQuery({
    queryKey: ['meus-pedidos', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.PedidoProduto.filter({ usuario_email: user.email });
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    cacheTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    initialData: [],
  });

  const updatePerfilMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
    },
    onSuccess: async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      setPerfilEditado(userData);
      setEditandoPerfil(false);
      queryClient.invalidateQueries(['user']);
    },
  });

  const atualizarStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await base44.entities.Anuncio.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['meus-anuncios']);
    },
  });

  const excluirContaMutation = useMutation({
    mutationFn: async () => {
      base44.auth.logout();
    },
  });

  const handleSalvarPerfil = () => {
    updatePerfilMutation.mutate(perfilEditado);
  };

  const handleSair = () => {
    base44.auth.logout();
  };

  const handleVerAnuncio = (anuncioId) => {
    navigate(`${createPageUrl("DetalhesAnuncio")}?id=${anuncioId}`);
  };

  const handleEditarAnuncio = (anuncioId) => {
    navigate(`${createPageUrl("EditarAnuncio")}?id=${anuncioId}`);
  };

  const handleSolicitarMudancaTipo = () => {
    const mensagem = `Olá! Gostaria de alterar o tipo de conta no Mapa da Estética.\n\nDados do usuário:\nNome: ${user.full_name}\nEmail: ${user.email}\nTipo atual: ${user.tipo_usuario}\n\nPor favor, me ajudem com essa alteração.`;
    window.open(`mailto:pedro_hbfreitas@hotmail.com?subject=Solicitação de Alteração de Tipo de Conta&body=${encodeURIComponent(mensagem)}`, '_blank');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  const anunciosAtivos = meusAnuncios.filter(a => a.status === 'ativo').length;
  const anunciosPendentes = meusAnuncios.filter(a => a.status === 'pendente').length;
  const anunciosDestaque = meusAnuncios.filter(a => a.em_destaque).length;
  const anunciosExpirados = meusAnuncios.filter(a => a.status === 'expirado').length;
  const totalVisualizacoes = meusAnuncios.reduce((acc, a) => acc + (a.visualizacoes || 0), 0);

  const planoNome = user?.plano_ativo === 'free' ? 'FREE' :
                   user?.plano_ativo === 'basico' ? 'BÁSICO' :
                   user?.plano_ativo === 'avancado' ? 'AVANÇADO' :
                   user?.plano_ativo === 'premium' ? 'PREMIUM' : 'FREE';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="border-none shadow-xl mb-8 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-[#F7D426] to-[#FFE066] relative">
            {/* Background image or pattern can go here */}
          </div>

          <CardContent className="px-6 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 -mt-16 relative z-10">
              <div className="flex items-center gap-4">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-xl">
                  <AvatarImage src={user?.foto_perfil} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-[#F7D426] to-[#FFE066] text-[#2C2C2C]">
                    {user?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="mt-16 md:mt-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{user?.full_name}</h1>
                  <p className="text-gray-600">{user?.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={isPaciente ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"}>
                      {isPaciente ? "👤 Paciente" : "💼 Profissional"}
                    </Badge>
                    <Badge className="bg-[#F7D426] text-[#2C2C2C] font-bold">
                      Plano {planoNome}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  onClick={() => setEditandoPerfil(true)}
                  variant="outline"
                  className="flex-1 md:flex-initial"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
                <Button
                  onClick={() => setEditandoPerfil(true)}
                  className="flex-1 md:flex-initial bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C]"
                >
                  <User className="w-4 h-4 mr-2" />
                  Preencha seu Perfil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* SETOR PROFISSIONAL: Stats e Tabs completas */}
          {isProfissional && (
            <div className="lg:col-span-2 space-y-6">
              {/* Statistics Cards */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Eye className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">{totalVisualizacoes}</p>
                    <p className="text-sm text-gray-600">Visualizações</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">{anunciosAtivos}</p>
                    <p className="text-sm text-gray-600">Ativos</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold">{anunciosDestaque}</p>
                    <p className="text-sm text-gray-600">Em Destaque</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold">{anunciosPendentes}</p>
                    <p className="text-sm text-gray-600">Pendentes</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="anuncios" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="anuncios">Meus Anúncios</TabsTrigger>
                  <TabsTrigger value="produtos">Produtos & Serviços</TabsTrigger>
                  <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
                  <TabsTrigger value="atividades">Atividades</TabsTrigger>
                </TabsList>

                {/* TabsContent for "anuncios" */}
                <TabsContent value="anuncios" className="space-y-4">
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Resumo dos Anúncios</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium">Anúncios Ativos</span>
                          <Badge className="bg-green-600">{anunciosAtivos}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                          <span className="font-medium">Anúncios Pendentes</span>
                          <Badge className="bg-yellow-600">{anunciosPendentes}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium">Anúncios em Destaque</span>
                          <Badge className="bg-blue-600">{anunciosDestaque}</Badge>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">Anúncios Expirados</span>
                          <Badge className="bg-gray-600">{anunciosExpirados}</Badge>
                        </div>
                      </div>

                      <Button
                        onClick={() => navigate(createPageUrl("CadastrarAnuncio"))}
                        className="w-full mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                      >
                        Criar Novo Anúncio
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* NOVA ABA: Meus Produtos e Serviços */}
                <TabsContent value="produtos" className="space-y-4">
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-pink-600" />
                        Meus Produtos e Serviços Contratados
                      </h3>

                      {meusPedidos.length === 0 ? (
                        <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                          <div className="text-6xl mb-4">🛍️</div>
                          <p className="text-gray-500 mb-4">
                            Você ainda não possui produtos ou serviços contratados
                          </p>
                          <Button
                            onClick={() => navigate(createPageUrl("Produtos"))}
                            className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                          >
                            Ver Produtos Disponíveis
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {meusPedidos.map((pedido) => (
                            <div
                              key={pedido.id}
                              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    {pedido.tipo === 'servico' ? (
                                      <Badge className="bg-blue-100 text-blue-800">Serviço</Badge>
                                    ) : (
                                      <Badge className="bg-green-100 text-green-800">Produto</Badge>
                                    )}
                                    <Badge className={
                                      pedido.status_pedido === 'entregue' ? 'bg-green-100 text-green-800' :
                                      pedido.status_pedido === 'em_transito' ? 'bg-blue-100 text-blue-800' :
                                      pedido.status_pedido === 'enviado' ? 'bg-yellow-100 text-yellow-800' :
                                      pedido.status_pedido === 'cancelado' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {pedido.status_pedido.replace(/_/g, ' ')}
                                    </Badge>
                                  </div>
                                  <h5 className="font-medium text-gray-900 mb-1">{pedido.produto_nome}</h5>
                                  <p className="text-sm text-gray-600">
                                    Pedido #{pedido.id.slice(0, 8)} • {format(new Date(pedido.created_date), "dd/MM/yyyy 'às' HH:mm")}
                                  </p>
                                  <p className="text-sm font-bold text-gray-900 mt-2">
                                    Valor: R$ {pedido.valor_total.toFixed(2)}
                                  </p>
                                </div>
                              </div>

                              {/* Rastreamento */}
                              {pedido.codigo_rastreio && (
                                <div className="mt-3 pt-3 border-t bg-blue-50 p-3 rounded">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-blue-900">
                                      📦 Rastreamento
                                    </p>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        const url = pedido.transportadora === 'Correios'
                                          ? `https://www.correios.com.br/rastreamento?codigo=${pedido.codigo_rastreio}`
                                          : `https://www.google.com/search?q=rastrear+${pedido.codigo_rastreio}`;
                                        window.open(url, '_blank');
                                      }}
                                      className="text-xs"
                                    >
                                      Rastrear Encomenda
                                    </Button>
                                  </div>
                                  <p className="text-xs text-blue-700">
                                    Código: <span className="font-mono font-bold">{pedido.codigo_rastreio}</span>
                                  </p>
                                  {pedido.transportadora && (
                                    <p className="text-xs text-blue-700 mt-1">
                                      Transportadora: {pedido.transportadora}
                                    </p>
                                  )}

                                  {/* Histórico de Rastreio */}
                                  {pedido.historico_rastreio && pedido.historico_rastreio.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                      <p className="text-xs font-medium text-blue-900">Últimas atualizações:</p>
                                      {pedido.historico_rastreio.slice(-3).reverse().map((item, i) => (
                                        <div key={i} className="text-xs bg-white p-2 rounded border border-blue-200">
                                          <div className="flex justify-between mb-1">
                                            <span className="font-medium">{item.status}</span>
                                            <span className="text-gray-500">
                                              {format(new Date(item.data), "dd/MM HH:mm")}
                                            </span>
                                          </div>
                                          {item.localizacao && (
                                            <p className="text-gray-600">📍 {item.localizacao}</p>
                                          )}
                                          {item.descricao && (
                                            <p className="text-gray-600">{item.descricao}</p>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Endereço de Entrega */}
                              {pedido.endereco_entrega && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs font-medium text-gray-700 mb-1">Endereço de Entrega:</p>
                                  <p className="text-xs text-gray-600">
                                    {pedido.endereco_entrega.rua}, {pedido.endereco_entrega.numero}
                                    {pedido.endereco_entrega.complemento && ` - ${pedido.endereco_entrega.complemento}`}
                                    <br />
                                    {pedido.endereco_entrega.bairro} - {pedido.endereco_entrega.cidade}/{pedido.endereco_entrega.estado}
                                    <br />
                                    CEP: {pedido.endereco_entrega.cep}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TabsContent for "relatorios" */}
                <TabsContent value="relatorios" className="space-y-4">
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-pink-600" />
                        Relatórios de Performance
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Acompanhe o desempenho dos seus anúncios com relatórios detalhados, similar ao Google Negócios
                      </p>

                      {/* Overview Cards */}
                      <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-900">Visualizações Totais</span>
                            <Eye className="w-5 h-5 text-blue-600" />
                          </div>
                          <p className="text-3xl font-bold text-blue-900">{totalVisualizacoes}</p>
                          <p className="text-xs text-blue-700 mt-1">Nos últimos 30 dias</p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-900">Taxa de Cliques</span>
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          </div>
                          <p className="text-3xl font-bold text-green-900">
                            {totalVisualizacoes > 0 ? ((meusAnuncios.length / totalVisualizacoes) * 100).toFixed(1) : 0}%
                          </p>
                          <p className="text-xs text-green-700 mt-1">CTR médio dos anúncios</p>
                        </div>
                      </div>

                      {/* Performance by Ad */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-gray-700 mb-3">Desempenho por Anúncio</h4>
                        {meusAnuncios.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500">Você ainda não possui anúncios ativos</p>
                            <Button
                              onClick={() => navigate(createPageUrl("CadastrarAnuncio"))}
                              className="mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                            >
                              Criar Primeiro Anúncio
                            </Button>
                          </div>
                        ) : (
                          meusAnuncios.slice(0, 5).map((anuncio) => (
                            <div
                              key={anuncio.id}
                              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 mb-1">{anuncio.titulo}</h5>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Badge className={
                                      anuncio.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                      anuncio.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {anuncio.status}
                                    </Badge>
                                    <span>•</span>
                                    <span>{anuncio.categoria}</span>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`${createPageUrl("DetalhesAnuncio")}?id=${anuncio.id}`)}
                                >
                                  Ver Detalhes
                                </Button>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <Eye className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">Visualizações</span>
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">{anuncio.visualizacoes || 0}</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <Star className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">Curtidas</span>
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">{anuncio.curtidas || 0}</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <MessageCircle className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">Comentários</span>
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">{anuncio.comentarios?.length || 0}</p>
                                </div>
                              </div>

                              {/* Tags/Keywords */}
                              {anuncio.tags && anuncio.tags.length > 0 && (
                                <div className="mt-3 pt-3 border-t">
                                  <p className="text-xs text-gray-500 mb-2">Palavras-chave (Google Business):</p>
                                  <div className="flex flex-wrap gap-1">
                                    {anuncio.tags.slice(0, 5).map((tag, i) => (
                                      <Badge key={i} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <Alert className="mt-6 bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-sm">
                          💡 Dica: Use palavras-chave (tags) estratégicas para melhorar seu posicionamento no Google e aumentar suas visualizações!
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* TabsContent for "atividades" */}
                <TabsContent value="atividades" className="space-y-4">
                  <Card className="border-none shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg mb-4">Atividades Recentes</h3>
                      {meusAnuncios.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                          <p className="text-gray-500">Nenhuma atividade recente</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {meusAnuncios.map((anuncio) => (
                            <div
                              key={anuncio.id}
                              className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-[#F7D426] transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 mb-1">{anuncio.titulo}</h5>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Badge className={
                                      anuncio.status === 'ativo' ? 'bg-green-100 text-green-800' :
                                      anuncio.status === 'pendente' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }>
                                      {anuncio.status}
                                    </Badge>
                                    <span>•</span>
                                    <span>{anuncio.categoria}</span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  {anuncio.status === 'pendente' && (
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        atualizarStatusMutation.mutate({ id: anuncio.id, status: 'ativo' });
                                      }}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      Ativar
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEditarAnuncio(anuncio.id)}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleVerAnuncio(anuncio.id)}
                                  >
                                    Ver
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t">
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <Eye className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">Visualizações</span>
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">{anuncio.visualizacoes || 0}</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <Star className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">Curtidas</span>
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">{anuncio.curtidas || 0}</p>
                                </div>
                                <div className="text-center">
                                  <div className="flex items-center justify-center gap-1 mb-1">
                                    <MessageCircle className="w-3 h-3 text-gray-400" />
                                    <span className="text-xs text-gray-500">Comentários</span>
                                  </div>
                                  <p className="text-lg font-bold text-gray-900">{anuncio.comentarios?.length || 0}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* SETOR PACIENTE: Apenas Produtos & Serviços */}
          {isPaciente && (
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-pink-600" />
                    Meus Produtos e Serviços Contratados
                  </h3>

                  {meusPedidos.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
                      <div className="text-6xl mb-4">🛍️</div>
                      <p className="text-gray-500 mb-4">
                        Você ainda não possui produtos ou serviços contratados
                      </p>
                      <Button
                        onClick={() => navigate(createPageUrl("Produtos"))}
                        className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                      >
                        Ver Produtos Disponíveis
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {meusPedidos.map((pedido) => (
                        <div
                          key={pedido.id}
                          className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-pink-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {pedido.tipo === 'servico' ? (
                                  <Badge className="bg-blue-100 text-blue-800">Serviço</Badge>
                                ) : (
                                  <Badge className="bg-green-100 text-green-800">Produto</Badge>
                                )}
                                <Badge className={
                                  pedido.status_pedido === 'entregue' ? 'bg-green-100 text-green-800' :
                                  pedido.status_pedido === 'em_transito' ? 'bg-blue-100 text-blue-800' :
                                  pedido.status_pedido === 'enviado' ? 'bg-yellow-100 text-yellow-800' :
                                  pedido.status_pedido === 'cancelado' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }>
                                  {pedido.status_pedido.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                              <h5 className="font-medium text-gray-900 mb-1">{pedido.produto_nome}</h5>
                              <p className="text-sm text-gray-600">
                                Pedido #{pedido.id.slice(0, 8)} • {format(new Date(pedido.created_date), "dd/MM/yyyy 'às' HH:mm")}
                              </p>
                              <p className="text-sm font-bold text-gray-900 mt-2">
                                Valor: R$ {pedido.valor_total.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          {/* Rastreamento */}
                          {pedido.codigo_rastreio && (
                            <div className="mt-3 pt-3 border-t bg-blue-50 p-3 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-blue-900">
                                  📦 Rastreamento
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    const url = pedido.transportadora === 'Correios'
                                      ? `https://www.correios.com.br/rastreamento?codigo=${pedido.codigo_rastreio}`
                                      : `https://www.google.com/search?q=rastrear+${pedido.codigo_rastreio}`;
                                    window.open(url, '_blank');
                                  }}
                                  className="text-xs"
                                >
                                  Rastrear Encomenda
                                </Button>
                              </div>
                              <p className="text-xs text-blue-700">
                                Código: <span className="font-mono font-bold">{pedido.codigo_rastreio}</span>
                              </p>
                              {pedido.transportadora && (
                                <p className="text-xs text-blue-700 mt-1">
                                  Transportadora: {pedido.transportadora}
                                </p>
                              )}

                              {/* Histórico de Rastreio */}
                              {pedido.historico_rastreio && pedido.historico_rastreio.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  <p className="text-xs font-medium text-blue-900">Últimas atualizações:</p>
                                  {pedido.historico_rastreio.slice(-3).reverse().map((item, i) => (
                                    <div key={i} className="text-xs bg-white p-2 rounded border border-blue-200">
                                      <div className="flex justify-between mb-1">
                                        <span className="font-medium">{item.status}</span>
                                        <span className="text-gray-500">
                                          {format(new Date(item.data), "dd/MM HH:mm")}
                                        </span>
                                      </div>
                                      {item.localizacao && (
                                        <p className="text-gray-600">📍 {item.localizacao}</p>
                                      )}
                                      {item.descricao && (
                                        <p className="text-gray-600">{item.descricao}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Endereço de Entrega */}
                          {pedido.endereco_entrega && (
                            <div className="mt-3 pt-3 border-t">
                              <p className="text-xs font-medium text-gray-700 mb-1">Endereço de Entrega:</p>
                              <p className="text-xs text-gray-600">
                                {pedido.endereco_entrega.rua}, {pedido.endereco_entrega.numero}
                                {pedido.endereco_entrega.complemento && ` - ${pedido.endereco_entrega.complemento}`}
                                <br />
                                {pedido.endereco_entrega.bairro} - {pedido.endereco_entrega.cidade}/{pedido.endereco_entrega.estado}
                                <br />
                                CEP: {pedido.endereco_entrega.cep}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Profile Settings - AMBOS */}
          <div className="space-y-6">
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Informações do Perfil</h3>
                <div className="space-y-4">
                  {editandoPerfil ? (
                    <>
                      <div>
                        <Label htmlFor="telefone">Telefone</Label>
                        <Input
                          id="telefone"
                          value={perfilEditado.telefone || ""}
                          onChange={(e) => setPerfilEditado({ ...perfilEditado, telefone: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="whatsapp">WhatsApp</Label>
                        <Input
                          id="whatsapp"
                          value={perfilEditado.whatsapp || ""}
                          onChange={(e) => setPerfilEditado({ ...perfilEditado, whatsapp: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cidade">Cidade</Label>
                        <Input
                          id="cidade"
                          value={perfilEditado.cidade || ""}
                          onChange={(e) => setPerfilEditado({ ...perfilEditado, cidade: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estado">Estado</Label>
                        <Input
                          id="estado"
                          value={perfilEditado.estado || ""}
                          onChange={(e) => setPerfilEditado({ ...perfilEditado, estado: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="instagram">Instagram</Label>
                        <Input
                          id="instagram"
                          value={perfilEditado.instagram || ""}
                          onChange={(e) => setPerfilEditado({ ...perfilEditado, instagram: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="facebook">Facebook</Label>
                        <Input
                          id="facebook"
                          value={perfilEditado.facebook || ""}
                          onChange={(e) => setPerfilEditado({ ...perfilEditado, facebook: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <Button
                        onClick={handleSalvarPerfil}
                        disabled={updatePerfilMutation.isPending}
                        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </Button>
                    </>
                  ) : (
                    <>
                      {user.telefone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{user.telefone}</span>
                        </div>
                      )}
                      {user.cidade && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{user.cidade}, {user.estado}</span>
                        </div>
                      )}
                      {user.instagram && (
                        <div className="flex items-center gap-2 text-sm">
                          <Instagram className="w-4 h-4 text-gray-400" />
                          <a href={user.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                            Instagram
                          </a>
                        </div>
                      )}
                      {user.facebook && (
                        <div className="flex items-center gap-2 text-sm">
                          <Facebook className="w-4 h-4 text-gray-400" />
                          <a href={user.facebook} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">
                            Facebook
                          </a>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tipo de Conta */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Tipo de Conta</h3>
                <div className="text-center mb-4">
                  <Badge className={`text-lg px-4 py-2 ${isPaciente ? "bg-blue-600" : "bg-purple-600"}`}>
                    {isPaciente ? "👤 Paciente" : "💼 Profissional"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4 text-center">
                  {isPaciente
                    ? "Você tem acesso a busca de profissionais e produtos"
                    : "Você pode criar anúncios e gerenciar seu negócio"}
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSolicitarMudancaTipo}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Solicitar Mudança de Tipo
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Entre em contato com o suporte para alterar
                </p>
              </CardContent>
            </Card>

            {/* Plan Info - PROFISSIONAIS ou FREE para PACIENTES */}
            {(isProfissional || (isPaciente && user.plano_ativo === 'free')) && (
              <Card className="border-none shadow-lg bg-gradient-to-br from-pink-50 to-rose-50">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Seu Plano</h3>
                  <div className="text-center">
                    <Badge className="mb-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg px-4 py-2">
                      {planoNome}
                    </Badge>
                    {isProfissional && (
                      <>
                        <p className="text-sm text-gray-600 mb-4">
                          Pontos Acumulados: <span className="font-bold">{user.pontos_acumulados || 0}</span>
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(createPageUrl("MeuPlano"))}
                        >
                          Ver Meu Plano
                        </Button>
                      </>
                    )}
                    {isPaciente && (
                      <p className="text-sm text-gray-600 mt-2">
                        Plano gratuito para pacientes
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions - AMBOS */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6 space-y-3">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Saída</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja sair da sua conta?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleSair}>
                        Sair
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Separator />

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Conta
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Todos os seus dados e anúncios serão permanentemente removidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => excluirContaMutation.mutate()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Excluir Definitivamente
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
