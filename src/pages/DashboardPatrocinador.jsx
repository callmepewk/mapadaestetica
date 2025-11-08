import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Crown,
  Image as ImageIcon,
  ShoppingBag,
  Newspaper,
  TrendingUp,
  BarChart3,
  Eye,
  MousePointer,
  Clock,
  Share2,
  Package,
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardPatrocinador() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodoRelatorio, setPeriodoRelatorio] = useState("tempo_real");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        
        const isPatrocinador = userData.plano_patrocinador && userData.plano_patrocinador !== 'nenhum';
        const isAdmin = userData.role === 'admin';
        
        if (!isPatrocinador && !isAdmin) {
          alert("Acesso negado! Esta área é exclusiva para Patrocinadores e Administradores.");
          navigate(createPageUrl("Inicio"));
          return;
        }
        
        setUser(userData);
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        navigate(createPageUrl("Inicio"));
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const { data: banners = [] } = useQuery({
    queryKey: ['meus-banners', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Banner.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const { data: meusProdutos = [] } = useQuery({
    queryKey: ['meus-produtos-patrocinador', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.Produto.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  const { data: meusArtigos = [] } = useQuery({
    queryKey: ['meus-artigos-patrocinador', user?.email],
    queryFn: async () => {
      if (!user) return [];
      return await base44.entities.ArtigoBlog.filter({ created_by: user.email });
    },
    enabled: !!user,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const planoNome = user?.plano_patrocinador?.toUpperCase() || "PLATINA";

  // Métricas agregadas
  const totalVisualizacoesBanners = banners.reduce((acc, b) => acc + (b.metricas?.visualizacoes || 0), 0);
  const totalCliquesBanners = banners.reduce((acc, b) => acc + (b.metricas?.cliques || 0), 0);
  const totalCompartilhamentos = banners.reduce((acc, b) => acc + (b.metricas?.compartilhamentos || 0), 0);
  const totalConversoes = banners.reduce((acc, b) => acc + (b.metricas?.conversoes_produtos || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-4 sm:py-6 md:py-8 px-2 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Perfil"))}
          className="mb-4 sm:mb-6 text-xs sm:text-sm h-9 sm:h-10"
        >
          <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
          Voltar
        </Button>

        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs sm:text-sm px-3 py-1.5">
            <Crown className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
            Dashboard de Patrocinador
          </Badge>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
                Bem-vindo, {user?.full_name}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Seu plano: <strong>{planoNome}</strong>
              </p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("CriacaoBanner"))}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Banner
            </Button>
          </div>
        </div>

        {/* Métricas Principais - CARDS RESPONSIVOS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {totalVisualizacoesBanners.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Visualizações</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <MousePointer className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {totalCliquesBanners.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Cliques</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <Share2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {totalCompartilhamentos.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Compartilhamentos</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {totalConversoes.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-gray-600">Conversões</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs - MOBILE OPTIMIZED */}
        <Tabs defaultValue="banners" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6 h-auto gap-1">
            <TabsTrigger value="banners" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Banners
            </TabsTrigger>
            <TabsTrigger value="producao" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Produção
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Relatórios
            </TabsTrigger>
            <TabsTrigger value="conteudo" className="text-xs sm:text-sm py-2 sm:py-2.5">
              <Newspaper className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Conteúdo
            </TabsTrigger>
          </TabsList>

          {/* Tab Banners */}
          <TabsContent value="banners">
            <Card className="border-none shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Meus Banners</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {banners.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg">
                    <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      Você ainda não criou nenhum banner
                    </p>
                    <Button
                      onClick={() => navigate(createPageUrl("CriacaoBanner"))}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-10 sm:h-11"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Banner
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {banners.map((banner) => (
                      <div key={banner.id} className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                          <div className="w-full sm:w-32 md:w-40 h-20 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={banner.imagem_banner} alt={banner.titulo} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div className="min-w-0 flex-1">
                                <h3 className="font-bold text-sm sm:text-base truncate">{banner.titulo}</h3>
                                <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{banner.descricao}</p>
                              </div>
                              <Badge className={banner.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {banner.status}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3 text-xs sm:text-sm">
                              <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                <span>{banner.metricas?.visualizacoes || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MousePointer className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                <span>{banner.metricas?.cliques || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Share2 className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                <span>{banner.metricas?.compartilhamentos || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Package className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                                <span>{banner.metricas?.conversoes_produtos || 0}</span>
                              </div>
                            </div>

                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" className="text-xs h-8">
                                <Edit className="w-3 h-3 mr-1" />
                                Editar
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs h-8 text-red-600">
                                <Trash2 className="w-3 h-3 mr-1" />
                                Excluir
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Produção */}
          <TabsContent value="producao">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors cursor-pointer" onClick={() => navigate(createPageUrl("AdicionarProduto"))}>
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2">Adicionar Produto</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Cadastre produtos na loja do Mapa da Estética
                  </p>
                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                    {meusProdutos.length} produtos cadastrados
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors cursor-pointer" onClick={() => navigate(createPageUrl("ArtigoBlog"))}>
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Newspaper className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2">Post no Blog</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    Crie artigos para o blog da plataforma
                  </p>
                  <Badge className="bg-purple-100 text-purple-800 text-xs">
                    {meusArtigos.length} artigos publicados
                  </Badge>
                </CardContent>
              </Card>

              <Card className="border-2 border-green-200 hover:border-green-400 transition-colors cursor-pointer">
                <CardContent className="p-4 sm:p-6 text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-base sm:text-lg mb-2">Novidades</h3>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    {isAdmin ? "Publicar atualizações da plataforma" : "Em breve"}
                  </p>
                  <Badge className="bg-green-100 text-green-800 text-xs">
                    {isAdmin ? "Admin only" : "Aguarde"}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab Relatórios - MOBILE OPTIMIZED */}
          <TabsContent value="relatorios">
            <Card className="border-none shadow-lg">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <CardTitle className="text-lg sm:text-xl">Relatórios de Performance</CardTitle>
                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                    <Button
                      size="sm"
                      variant={periodoRelatorio === "tempo_real" ? "default" : "outline"}
                      onClick={() => setPeriodoRelatorio("tempo_real")}
                      className="flex-shrink-0 h-8 sm:h-9 text-xs"
                    >
                      Tempo Real
                    </Button>
                    <Button
                      size="sm"
                      variant={periodoRelatorio === "semanal" ? "default" : "outline"}
                      onClick={() => setPeriodoRelatorio("semanal")}
                      className="flex-shrink-0 h-8 sm:h-9 text-xs"
                    >
                      Semanal
                    </Button>
                    <Button
                      size="sm"
                      variant={periodoRelatorio === "mensal" ? "default" : "outline"}
                      onClick={() => setPeriodoRelatorio("mensal")}
                      className="flex-shrink-0 h-8 sm:h-9 text-xs"
                    >
                      Mensal
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Alcance dos Banners */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border-2 border-blue-200">
                    <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      Alcance dos Banners
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Visualizações:</span>
                        <span className="font-bold text-blue-900">{totalVisualizacoesBanners}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Taxa de Cliques:</span>
                        <span className="font-bold text-blue-900">
                          {totalVisualizacoesBanners > 0 ? ((totalCliquesBanners / totalVisualizacoesBanners) * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Tempo Médio:</span>
                        <span className="font-bold text-blue-900">
                          {banners.length > 0 ? Math.floor(banners.reduce((acc, b) => acc + (b.metricas?.tempo_medio_visualizacao || 0), 0) / banners.length) : 0}s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Produtos na Loja */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                    <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                      Produtos na Loja
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Produtos:</span>
                        <span className="font-bold text-purple-900">{meusProdutos.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Produtos Ativos:</span>
                        <span className="font-bold text-purple-900">
                          {meusProdutos.filter(p => p.status === 'ativo').length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Conversões:</span>
                        <span className="font-bold text-purple-900">{totalConversoes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Posts no Blog */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg border-2 border-orange-200">
                    <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <Newspaper className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                      Posts no Blog
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total Posts:</span>
                        <span className="font-bold text-orange-900">{meusArtigos.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Visualizações:</span>
                        <span className="font-bold text-orange-900">
                          {meusArtigos.reduce((acc, a) => acc + (a.visualizacoes || 0), 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Curtidas:</span>
                        <span className="font-bold text-orange-900">
                          {meusArtigos.reduce((acc, a) => acc + (a.total_curtidas || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compartilhamentos */}
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
                    <h4 className="font-semibold text-sm sm:text-base mb-3 flex items-center gap-2">
                      <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                      Compartilhamentos
                    </h4>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Total:</span>
                        <span className="font-bold text-green-900">{totalCompartilhamentos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Alcance Estimado:</span>
                        <span className="font-bold text-green-900">
                          {(totalCompartilhamentos * 150).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <Alert className="mt-6 bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-xs sm:text-sm">
                    📊 <strong>Relatórios {periodoRelatorio === 'tempo_real' ? 'em Tempo Real' : periodoRelatorio === 'semanal' ? 'Semanais' : 'Mensais'}</strong> - Dados atualizados constantemente
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Conteúdo */}
          <TabsContent value="conteudo">
            <div className="space-y-4 sm:space-y-6">
              {/* Produtos */}
              <Card className="border-none shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Meus Produtos na Loja</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {meusProdutos.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                      <p className="text-sm sm:text-base text-gray-600">Nenhum produto cadastrado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meusProdutos.map((produto) => (
                        <div key={produto.id} className="p-3 border rounded-lg flex flex-col sm:flex-row items-start gap-3">
                          <div className="w-full sm:w-20 h-20 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                            {produto.imagens?.[0] && (
                              <img src={produto.imagens[0]} alt={produto.nome} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm sm:text-base truncate">{produto.nome}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {produto.preco ? `R$ ${produto.preco.toFixed(2)}` : produto.preco_texto || "Consultar"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Artigos */}
              <Card className="border-none shadow-lg">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="text-lg sm:text-xl">Meus Posts no Blog</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {meusArtigos.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                      <p className="text-sm sm:text-base text-gray-600">Nenhum artigo publicado</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {meusArtigos.map((artigo) => (
                        <div key={artigo.id} className="p-3 border rounded-lg">
                          <h4 className="font-bold text-sm sm:text-base mb-1">{artigo.titulo}</h4>
                          <div className="flex flex-wrap gap-2 text-xs sm:text-sm text-gray-600">
                            <span>{artigo.visualizacoes || 0} visualizações</span>
                            <span>•</span>
                            <span>{artigo.total_curtidas || 0} curtidas</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}