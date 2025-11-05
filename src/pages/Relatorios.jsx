
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, TrendingUp, DollarSign, Search, Eye, Users, ShoppingCart, BarChart3, Download, FileText } from "lucide-react";

export default function Relatorios() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
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

  const exportarPDF = async (tipoRelatorio) => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');
    
    let conteudoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório ${tipoRelatorio} - Mapa da Estética</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #F7D426; padding-bottom: 20px; }
          .logo { max-width: 200px; margin-bottom: 10px; }
          h1 { color: #2C2C2C; margin: 0; font-size: 28px; }
          .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
          .info-box { background: #FFF9E6; padding: 15px; border-radius: 8px; margin: 20px 0; border: 2px solid #F7D426; }
          .metric { background: white; border-left: 4px solid #F7D426; padding: 15px; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .metric-title { font-weight: bold; color: #2C2C2C; margin-bottom: 5px; }
          .metric-value { font-size: 32px; font-weight: bold; color: #F7D426; }
          .metric-subtitle { color: #666; font-size: 12px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #2C2C2C; color: #F7D426; padding: 12px; text-align: left; font-weight: bold; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background: #f8f9fa; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          .highlight { background: #FFF9E6; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
          .page-break { page-break-after: always; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Relatório ${tipoRelatorio}</h1>
          <p class="subtitle">Mapa da Estética - Clube da Beleza</p>
          <p class="subtitle">Gerado em: ${dataAtual} às ${horaAtual}</p>
        </div>
    `;

    if (tipoRelatorio === 'SEO Diário') {
      conteudoHTML += `
        <div class="info-box">
          <h2>📅 Resumo do Dia</h2>
          <p>Métricas de tráfego e engajamento das últimas 24 horas</p>
        </div>
        
        <div class="metric">
          <div class="metric-title">👁️ Total de Visualizações</div>
          <div class="metric-value">1,234</div>
          <div class="metric-subtitle">+15% comparado a ontem</div>
        </div>
        
        <div class="metric">
          <div class="metric-title">📄 Páginas Mais Vistas</div>
          <div class="metric-value">Anúncios</div>
          <div class="metric-subtitle">456 visualizações</div>
        </div>
        
        <div class="metric">
          <div class="metric-title">⏱️ Tempo Médio na Página</div>
          <div class="metric-value">3:42</div>
          <div class="metric-subtitle">+8% comparado a ontem</div>
        </div>
        
        <div class="metric">
          <div class="metric-title">📊 Taxa de Rejeição</div>
          <div class="metric-value">24.5%</div>
          <div class="metric-subtitle">-3% comparado a ontem</div>
        </div>
      `;
    } else if (tipoRelatorio === 'SEO Mensal') {
      conteudoHTML += `
        <div class="info-box">
          <h2>📊 Resumo Mensal</h2>
          <p>Desempenho consolidado do mês</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Métrica</th>
              <th>Valor</th>
              <th>Crescimento</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Total de Visitas</strong></td>
              <td class="highlight">34,567</td>
              <td style="color: green;">+23% vs mês anterior</td>
            </tr>
            <tr>
              <td><strong>Novos Usuários</strong></td>
              <td class="highlight">2,345</td>
              <td style="color: green;">+18% vs mês anterior</td>
            </tr>
            <tr>
              <td><strong>Conversões</strong></td>
              <td class="highlight">456</td>
              <td style="color: green;">+31% vs mês anterior</td>
            </tr>
          </tbody>
        </table>
      `;
    } else if (tipoRelatorio === 'SEO Anual') {
      conteudoHTML += `
        <div class="info-box">
          <h2>📈 Resumo Anual</h2>
          <p>Visão geral do ano completo</p>
        </div>
        
        <div class="metric">
          <div class="metric-title">🎯 Total de Visitas do Ano</div>
          <div class="metric-value">456,789</div>
          <div class="metric-subtitle">Crescimento de 145% vs ano anterior</div>
        </div>
        
        <div class="metric">
          <div class="metric-title">💰 Receita Total do Ano</div>
          <div class="metric-value">R$ 287.5K</div>
          <div class="metric-subtitle">Crescimento de 89% vs ano anterior</div>
        </div>
      `;
    } else if (tipoRelatorio === 'Transações') {
      conteudoHTML += `
        <div class="info-box">
          <h2>💳 Resumo de Transações</h2>
          <p>Todas as transações financeiras da plataforma</p>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Data/Hora</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Produto</strong></td>
              <td>Beauty Box - Clube da Beleza</td>
              <td>user@example.com</td>
              <td style="color: green; font-weight: bold;">R$ 149,90</td>
              <td>Hoje, 14:32</td>
            </tr>
            <tr>
              <td><strong>Upgrade</strong></td>
              <td>Plano OURO</td>
              <td>profissional@example.com</td>
              <td style="color: green; font-weight: bold;">R$ 597,00</td>
              <td>Hoje, 11:15</td>
            </tr>
            <tr>
              <td><strong>Resgate</strong></td>
              <td>Massagem Relaxante 60min</td>
              <td>cliente@example.com</td>
              <td style="color: purple; font-weight: bold;">800 pontos</td>
              <td>Ontem, 16:45</td>
            </tr>
          </tbody>
        </table>
        
        <div class="metric">
          <div class="metric-title">💵 Receita Hoje</div>
          <div class="metric-value">R$ 1.2K</div>
        </div>
        
        <div class="metric">
          <div class="metric-title">🛒 Total de Transações</div>
          <div class="metric-value">45</div>
        </div>

        <div class="metric">
          <div class="metric-title">📊 Ticket Médio</div>
          <div class="metric-value">R$ 27</div>
        </div>

        <div class="metric">
          <div class="metric-title">⭐ Pontos Resgatados</div>
          <div class="metric-value">2.5K</div>
        </div>
      `;
    } else if (tipoRelatorio === 'Completo') {
      // Buscar dados reais de preços médios
      try {
        const anuncios = await base44.entities.Anuncio.filter({ status: 'ativo' });
        
        const distribuicao = {
          "$": anuncios.filter(a => a.faixa_preco === "$").length,
          "$$": anuncios.filter(a => a.faixa_preco === "$$").length,
          "$$$": anuncios.filter(a => a.faixa_preco === "$$$").length,
          "$$$$": anuncios.filter(a => a.faixa_preco === "$$$$").length,
          "$$$$$": anuncios.filter(a => a.faixa_preco === "$$$$$").length,
        };

        const procedimentosMap = {};
        anuncios.forEach(anuncio => {
          anuncio.procedimentos_servicos?.forEach(proc => {
            procedimentosMap[proc] = (procedimentosMap[proc] || 0) + 1;
          });
        });

        const procedimentosComuns = Object.entries(procedimentosMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        conteudoHTML += `
          <div class="info-box">
            <h2>📋 Relatório Completo do Sistema</h2>
            <p>Compilação de todos os relatórios em um único documento</p>
          </div>

          <h2 style="border-bottom: 2px solid #F7D426; padding-bottom: 10px; margin-top: 40px;">💰 PREÇOS MÉDIOS</h2>
          
          <div class="metric">
            <div class="metric-title">📊 Total de Anúncios Ativos</div>
            <div class="metric-value">${anuncios.length}</div>
            <div class="metric-subtitle">Profissionais cadastrados na plataforma</div>
          </div>

          <h3 style="margin-top: 30px;">Distribuição por Faixa de Preço</h3>
          <table>
            <thead>
              <tr>
                <th>Faixa</th>
                <th>Valor</th>
                <th>Quantidade</th>
                <th>Percentual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>$</strong></td>
                <td>Até R$ 500</td>
                <td class="highlight">${distribuicao["$"]}</td>
                <td>${anuncios.length > 0 ? ((distribuicao["$"] / anuncios.length) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td><strong>$$</strong></td>
                <td>R$ 500 - R$ 1.000</td>
                <td class="highlight">${distribuicao["$$"]}</td>
                <td>${anuncios.length > 0 ? ((distribuicao["$$"] / anuncios.length) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td><strong>$$$</strong></td>
                <td>R$ 1.000 - R$ 2.000</td>
                <td class="highlight">${distribuicao["$$$"]}</td>
                <td>${anuncios.length > 0 ? ((distribuicao["$$$"] / anuncios.length) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td><strong>$$$$</strong></td>
                <td>R$ 2.000 - R$ 5.000</td>
                <td class="highlight">${distribuicao["$$$$"]}</td>
                <td>${anuncios.length > 0 ? ((distribuicao["$$$$"] / anuncios.length) * 100).toFixed(1) : 0}%</td>
              </tr>
              <tr>
                <td><strong>$$$$$</strong></td>
                <td>Acima de R$ 5.000</td>
                <td class="highlight">${distribuicao["$$$$$"]}</td>
                <td>${anuncios.length > 0 ? ((distribuicao["$$$$$"] / anuncios.length) * 100).toFixed(1) : 0}%</td>
              </tr>
            </tbody>
          </table>

          <h3 style="margin-top: 30px;">Top 10 Procedimentos Mais Oferecidos</h3>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Procedimento</th>
                <th>Profissionais</th>
              </tr>
            </thead>
            <tbody>
              ${procedimentosComuns.length > 0 ? procedimentosComuns.map(([proc, count], index) => `
                <tr>
                  <td><strong>${index + 1}º</strong></td>
                  <td>${proc}</td>
                  <td class="highlight">${count}</td>
                </tr>
              `).join('') : `<tr><td colspan="3">Nenhum procedimento encontrado.</td></tr>`}
            </tbody>
          </table>

          <div class="page-break"></div>

          <h2 style="border-bottom: 2px solid #F7D426; padding-bottom: 10px; margin-top: 40px;">📈 SEO & TRÁFEGO</h2>
          <table>
            <thead><tr><th>Métrica</th><th>Valor Atual</th><th>Crescimento</th></tr></thead>
            <tbody>
              <tr><td>Visitas Hoje</td><td class="highlight">1,234</td><td style="color: green;">+15%</td></tr>
              <tr><td>Novos Usuários</td><td class="highlight">89</td><td style="color: green;">+12%</td></tr>
              <tr><td>Taxa de Conversão</td><td class="highlight">12.5%</td><td style="color: green;">+5%</td></tr>
            </tbody>
          </table>

          <h2 style="border-bottom: 2px solid #F7D426; padding-bottom: 10px; margin-top: 40px;">💳 TRANSAÇÕES</h2>
          <table>
            <thead><tr><th>Métrica</th><th>Valor</th></tr></thead>
            <tbody>
              <tr><td>Receita Hoje</td><td class="highlight">R$ 1.2K</td></tr>
              <tr><td>Total de Transações</td><td class="highlight">45</td></tr>
              <tr><td>Ticket Médio</td><td class="highlight">R$ 27</td></tr>
              <tr><td>Pontos Resgatados</td><td class="highlight">2.5K</td></tr>
            </tbody>
          </table>
        `;
      } catch (error) {
        console.error("Erro ao buscar dados para o relatório completo:", error);
        conteudoHTML += `
          <div class="info-box">
            <h2>📋 Relatório Completo do Sistema</h2>
            <p>Erro ao carregar dados. Por favor, tente novamente.</p>
          </div>
          <h2 style="border-bottom: 2px solid #F7D426; padding-bottom: 10px; margin-top: 40px;">📈 SEO & TRÁFEGO</h2>
          <table>
            <thead><tr><th>Métrica</th><th>Valor Atual</th><th>Crescimento</th></tr></thead>
            <tbody>
              <tr><td>Visitas Hoje</td><td class="highlight">1,234</td><td style="color: green;">+15%</td></tr>
              <tr><td>Novos Usuários</td><td class="highlight">89</td><td style="color: green;">+12%</td></tr>
              <tr><td>Taxa de Conversão</td><td class="highlight">12.5%</td><td style="color: green;">+5%</td></tr>
            </tbody>
          </table>

          <h2 style="border-bottom: 2px solid #F7D426; padding-bottom: 10px; margin-top: 40px;">💳 TRANSAÇÕES</h2>
          <table>
            <thead><tr><th>Métrica</th><th>Valor</th></tr></thead>
            <tbody>
              <tr><td>Receita Hoje</td><td class="highlight">R$ 1.2K</td></tr>
              <tr><td>Total de Transações</td><td class="highlight">45</td></tr>
              <tr><td>Ticket Médio</td><td class="highlight">R$ 27</td></tr>
              <tr><td>Pontos Resgatados</td><td class="highlight">2.5K</td></tr>
            </tbody>
          </table>
        `;
      }
    }

    conteudoHTML += `
        <div class="footer">
          <p><strong>Mapa da Estética - Clube da Beleza</strong></p>
          <p>CNPJ: 46.792.168/0001-88</p>
          <p>www.mapadaestetica.com.br | (31) 97259-5643</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([conteudoHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Relatorio_${tipoRelatorio.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Relatório exportado em HTML! Para converter em PDF:\n\n1. Abra o arquivo HTML no seu navegador\n2. Pressione Ctrl+P (Windows) ou Cmd+P (Mac)\n3. Selecione "Salvar como PDF" como destino\n4. Clique em "Salvar"\n\nO arquivo será salvo como PDF no seu computador.');
  };

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
            className="bg-[#F7D426] text-[#2C2C2C] hover:bg-[#E5C215] border-2 border-[#2C2C2C]"
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
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl("Perfil"))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Button 
            onClick={() => exportarPDF('Completo')}
            className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] hover:from-[#E5C215] hover:to-[#F7D426] border-2 border-[#2C2C2C] font-bold"
          >
            <FileText className="w-4 h-4 mr-2" />
            Gerar Relatório Completo (HTML para PDF)
          </Button>
        </div>

        <div className="mb-8">
          <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]">
            Admin - Central de Relatórios
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Relatórios do Sistema
          </h1>
          <p className="text-gray-600">
            Análise completa de todos os dados da plataforma
          </p>
        </div>

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
            <Card className="border-2 border-gray-200">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Relatório de Preços Médios</CardTitle>
                <Button 
                  onClick={() => navigate(createPageUrl("RelatorioPrecoMedio"))} 
                  className="bg-[#2C2C2C] text-[#F7D426] hover:bg-[#3A3A3A]"
                >
                  Ver Relatório Completo
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Acesse análise detalhada de preços praticados pelos profissionais, distribuição por faixas de preço e procedimentos mais oferecidos.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de SEO & Tráfego */}
          <TabsContent value="seo" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-2 border-blue-200">
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

              <Card className="border-2 border-green-200">
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

              <Card className="border-2 border-purple-200">
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

              <Card className="border-2 border-orange-200">
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

            <Tabs defaultValue="diario">
              <TabsList>
                <TabsTrigger value="diario">Diário</TabsTrigger>
                <TabsTrigger value="mensal">Mensal</TabsTrigger>
                <TabsTrigger value="anual">Anual</TabsTrigger>
              </TabsList>

              <TabsContent value="diario" className="space-y-4">
                <Card className="border-2 border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Relatório SEO Diário</CardTitle>
                    <Button onClick={() => exportarPDF('SEO Diário')} variant="outline" size="sm" className="border-[#F7D426] text-[#2C2C2C]">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#F7D426]">
                        <p className="text-sm text-gray-600 mb-1">Total de Visualizações</p>
                        <p className="text-2xl font-bold">1,234</p>
                        <p className="text-xs text-green-600 mt-1">+15% vs ontem</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#F7D426]">
                        <p className="text-sm text-gray-600 mb-1">Páginas Mais Vistas</p>
                        <p className="text-lg font-semibold">Anúncios</p>
                        <p className="text-xs text-gray-500 mt-1">456 visualizações</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#F7D426]">
                        <p className="text-sm text-gray-600 mb-1">Tempo Médio na Página</p>
                        <p className="text-2xl font-bold">3:42</p>
                        <p className="text-xs text-blue-600 mt-1">+8% vs ontem</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#F7D426]">
                        <p className="text-sm text-gray-600 mb-1">Taxa de Rejeição</p>
                        <p className="text-2xl font-bold">24.5%</p>
                        <p className="text-xs text-red-600 mt-1">-3% vs ontem</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="mensal" className="space-y-4">
                <Card className="border-2 border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Relatório SEO Mensal</CardTitle>
                    <Button onClick={() => exportarPDF('SEO Mensal')} variant="outline" size="sm" className="border-[#F7D426] text-[#2C2C2C]">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-4 rounded-lg border-2 border-blue-200">
                        <p className="text-sm text-blue-900 mb-1 font-semibold">Total de Visitas</p>
                        <p className="text-3xl font-bold text-blue-600">34,567</p>
                        <p className="text-xs text-blue-700 mt-1">+23% vs mês anterior</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border-2 border-green-200">
                        <p className="text-sm text-green-900 mb-1 font-semibold">Novos Usuários</p>
                        <p className="text-3xl font-bold text-green-600">2,345</p>
                        <p className="text-xs text-green-700 mt-1">+18% vs mês anterior</p>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                        <p className="text-sm text-purple-900 mb-1 font-semibold">Conversões</p>
                        <p className="text-3xl font-bold text-purple-600">456</p>
                        <p className="text-xs text-purple-700 mt-1">+31% vs mês anterior</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="anual" className="space-y-4">
                <Card className="border-2 border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Relatório SEO Anual</CardTitle>
                    <Button onClick={() => exportarPDF('SEO Anual')} variant="outline" size="sm" className="border-[#F7D426] text-[#2C2C2C]">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-lg border-2 border-yellow-200">
                        <p className="text-sm text-yellow-900 mb-2 font-semibold">Total de Visitas do Ano</p>
                        <p className="text-4xl font-bold text-yellow-600">456,789</p>
                        <p className="text-xs text-yellow-700 mt-2">Crescimento de 145% vs ano anterior</p>
                      </div>
                      <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-6 rounded-lg border-2 border-pink-200">
                        <p className="text-sm text-pink-900 mb-2 font-semibold">Receita Total do Ano</p>
                        <p className="text-4xl font-bold text-pink-600">R$ 287.5K</p>
                        <p className="text-xs text-pink-700 mt-2">Crescimento de 89% vs ano anterior</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Aba de Transações */}
          <TabsContent value="transacoes" className="space-y-6">
            <div className="flex justify-end mb-4">
              <Button onClick={() => exportarPDF('Transações')} variant="outline" className="border-[#F7D426] text-[#2C2C2C]">
                <Download className="w-4 h-4 mr-2" />
                Exportar Transações em PDF
              </Button>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-2 border-green-200">
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

              <Card className="border-2 border-blue-200">
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

              <Card className="border-2 border-purple-200">
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

              <Card className="border-2 border-orange-200">
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

            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Últimas Transações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-green-400">
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

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-[#F7D426]">
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

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-purple-400">
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
