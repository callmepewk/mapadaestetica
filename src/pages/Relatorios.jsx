import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, DollarSign, Calendar, Search, Eye, Users, ShoppingCart, BarChart3 } from "lucide-react";

export default function Relatorios() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Bloquear acesso para não-admins
        if (userData.role !== 'admin') {
          alert("Acesso negado. Apenas administradores podem acessar relatórios.");
          navigate(createPageUrl("Inicio"));
        }
      } catch (error) {
        navigate(createPageUrl("Inicio"));
      }
    };
    checkAdmin();
  }, [navigate]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Acesso Restrito
          </h3>
          <p className="text-gray-600 mb-6">
            Apenas administradores podem acessar esta página
          </p>
          <Button
            onClick={() => navigate(createPageUrl("Inicio"))}
            className="bg-gradient-to-r from-pink-600 to-rose-600"
          >
            Voltar ao Início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Perfil"))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <div className="mb-8">
          <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
            Admin - Central de Relatórios
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Relatórios do Sistema
          </h1>
          <p className="text-gray-600">
            Análise completa de todos os dados da plataforma
          </p>
        </div>

        {/* Tabs principais */}
        <Tabs defaultValue="preco" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="preco">
              <DollarSign className="w-4 h-4 mr-2" />
              Preços Médios
            </TabsTrigger>
            <TabsTrigger value="seo">
              <BarChart3 className="w-4 h-4 mr-2" />
              SEO & Tráfego
            </TabsTrigger>
            <TabsTrigger value="transacoes">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Transações
            </TabsTrigger>
          </TabsList>

          {/* Aba de Preços Médios */}
          <TabsContent value="preco">
            <Card>
              <CardHeader>
                <CardTitle>Relatório de Preços Médios</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Análise de preços praticados pelos profissionais da plataforma
                </p>
                <Button onClick={() => navigate(createPageUrl("RelatorioPrecoMedio"))}>
                  Ver Relatório Completo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de SEO & Tráfego */}
          <TabsContent value="seo" className="space-y-6">
            {/* Cards de Métricas */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Visitas Hoje</p>
                      <p className="text-3xl font-bold text-gray-900">1.234</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Eye className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Novos Usuários</p>
                      <p className="text-3xl font-bold text-green-600">89</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Taxa de Conversão</p>
                      <p className="text-3xl font-bold text-purple-600">12.5%</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pesquisas</p>
                      <p className="text-3xl font-bold text-orange-600">567</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <Search className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Secundários: Diário, Mensal, Anual */}
            <Tabs defaultValue="diario">
              <TabsList>
                <TabsTrigger value="diario">Diário</TabsTrigger>
                <TabsTrigger value="mensal">Mensal</TabsTrigger>
                <TabsTrigger value="anual">Anual</TabsTrigger>
              </TabsList>

              <TabsContent value="diario" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Relatório SEO Diário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Total de Visualizações</p>
                          <p className="text-2xl font-bold">1,234</p>
                          <p className="text-xs text-green-600 mt-1">+15% vs ontem</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Páginas Mais Vistas</p>
                          <p className="text-lg font-semibold">Anúncios</p>
                          <p className="text-xs text-gray-500 mt-1">456 visualizações</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Tempo Médio na Página</p>
                          <p className="text-2xl font-bold">3:42</p>
                          <p className="text-xs text-blue-600 mt-1">+8% vs ontem</p>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Taxa de Rejeição</p>
                          <p className="text-2xl font-bold">24.5%</p>
                          <p className="text-xs text-red-600 mt-1">-3% vs ontem</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mensal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Relatório SEO Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg">
                          <p className="text-sm text-blue-900 mb-1 font-semibold">Total de Visitas</p>
                          <p className="text-3xl font-bold text-blue-600">34,567</p>
                          <p className="text-xs text-blue-700 mt-1">+23% vs mês anterior</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                          <p className="text-sm text-green-900 mb-1 font-semibold">Novos Usuários</p>
                          <p className="text-3xl font-bold text-green-600">2,345</p>
                          <p className="text-xs text-green-700 mt-1">+18% vs mês anterior</p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                          <p className="text-sm text-purple-900 mb-1 font-semibold">Conversões</p>
                          <p className="text-3xl font-bold text-purple-600">456</p>
                          <p className="text-xs text-purple-700 mt-1">+31% vs mês anterior</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="anual" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Relatório SEO Anual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-lg">
                          <p className="text-sm text-yellow-900 mb-2 font-semibold">Total de Visitas do Ano</p>
                          <p className="text-4xl font-bold text-yellow-600">456,789</p>
                          <p className="text-xs text-yellow-700 mt-2">Crescimento de 145% vs ano anterior</p>
                        </div>
                        <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg">
                          <p className="text-sm text-pink-900 mb-2 font-semibold">Receita Total do Ano</p>
                          <p className="text-4xl font-bold text-pink-600">R$ 287.5K</p>
                          <p className="text-xs text-pink-700 mt-2">Crescimento de 89% vs ano anterior</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Aba de Transações */}
          <TabsContent value="transacoes" className="space-y-6">
            {/* Cards de Métricas */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Receita Hoje</p>
                      <p className="text-3xl font-bold text-green-600">R$ 1.2K</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Transações</p>
                      <p className="text-3xl font-bold text-blue-600">45</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
                      <p className="text-3xl font-bold text-purple-600">R$ 27</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pontos Resgatados</p>
                      <p className="text-3xl font-bold text-orange-600">2.5K</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Histórico de Transações */}
            <Card>
              <CardHeader>
                <CardTitle>Últimas Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Compra de Produto</p>
                      <p className="text-sm text-gray-600">Beauty Box - Clube da Beleza</p>
                      <p className="text-xs text-gray-500">user@example.com</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">R$ 149,90</p>
                      <p className="text-xs text-gray-500">Hoje, 14:32</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Upgrade de Plano</p>
                      <p className="text-sm text-gray-600">Plano OURO</p>
                      <p className="text-xs text-gray-500">profissional@example.com</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">R$ 597,00</p>
                      <p className="text-xs text-gray-500">Hoje, 11:15</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold">Resgate de Pontos</p>
                      <p className="text-sm text-gray-600">Massagem Relaxante 60min</p>
                      <p className="text-xs text-gray-500">cliente@example.com</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-purple-600">800 pontos</p>
                      <p className="text-xs text-gray-500">Ontem, 16:45</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}