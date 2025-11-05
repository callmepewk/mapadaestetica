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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Download, TrendingUp, DollarSign, MapPin, Calendar, Filter } from "lucide-react";

const categorias = [
  "Todas",
  "Estética Facial", "Estética Corporal", "Depilação", "Harmonização Facial",
  "Massoterapia e Drenagem", "Micropigmentação e Design", "Manicure e Pedicure"
];

export default function RelatorioPrecoMedio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [procedimentoBusca, setProcedimentoBusca] = useState("");

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

  const { data: anuncios = [], isLoading } = useQuery({
    queryKey: ['anuncios-relatorio'],
    queryFn: async () => {
      const result = await base44.entities.Anuncio.filter({ status: 'ativo' });
      return result;
    },
    enabled: !!user && user.role === 'admin',
  });

  // Calcular estatísticas
  const estatisticas = React.useMemo(() => {
    let anunciosFiltrados = anuncios;

    if (categoriaFiltro !== "Todas") {
      anunciosFiltrados = anunciosFiltrados.filter(a => a.categoria === categoriaFiltro);
    }
    if (cidadeFiltro) {
      anunciosFiltrados = anunciosFiltrados.filter(a => 
        a.cidade?.toLowerCase().includes(cidadeFiltro.toLowerCase())
      );
    }
    if (estadoFiltro) {
      anunciosFiltrados = anunciosFiltrados.filter(a => 
        a.estado?.toUpperCase() === estadoFiltro.toUpperCase()
      );
    }
    if (procedimentoBusca) {
      anunciosFiltrados = anunciosFiltrados.filter(a =>
        a.procedimentos_servicos?.some(p =>
          p.toLowerCase().includes(procedimentoBusca.toLowerCase())
        )
      );
    }

    // Contar por faixa de preço
    const distribuicao = {
      "$": anunciosFiltrados.filter(a => a.faixa_preco === "$").length,
      "$$": anunciosFiltrados.filter(a => a.faixa_preco === "$$").length,
      "$$$": anunciosFiltrados.filter(a => a.faixa_preco === "$$$").length,
      "$$$$": anunciosFiltrados.filter(a => a.faixa_preco === "$$$$").length,
      "$$$$$": anunciosFiltrados.filter(a => a.faixa_preco === "$$$$$").length,
    };

    // Procedimentos mais comuns
    const procedimentosMap = {};
    anunciosFiltrados.forEach(anuncio => {
      anuncio.procedimentos_servicos?.forEach(proc => {
        procedimentosMap[proc] = (procedimentosMap[proc] || 0) + 1;
      });
    });

    const procedimentosComuns = Object.entries(procedimentosMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([nome, count]) => ({ nome, count }));

    return {
      total: anunciosFiltrados.length,
      distribuicao,
      procedimentosComuns,
      porCategoria: categorias
        .filter(c => c !== "Todas")
        .map(cat => ({
          categoria: cat,
          quantidade: anunciosFiltrados.filter(a => a.categoria === cat).length
        }))
        .filter(c => c.quantidade > 0)
        .sort((a, b) => b.quantidade - a.quantidade)
    };
  }, [anuncios, categoriaFiltro, cidadeFiltro, estadoFiltro, procedimentoBusca]);

  const exportarPDF = () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const horaAtual = new Date().toLocaleTimeString('pt-BR');
    
    const conteudoHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Relatório de Preços Médios - Mapa da Estética</title>
        <style>
          @page { size: A4; margin: 2cm; }
          body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #F7D426; padding-bottom: 20px; }
          h1 { color: #2C2C2C; margin: 0; font-size: 28px; }
          .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
          .filtros { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .metric { background: white; border-left: 4px solid #F7D426; padding: 15px; margin: 10px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .metric-title { font-weight: bold; color: #2C2C2C; margin-bottom: 5px; }
          .metric-value { font-size: 32px; font-weight: bold; color: #F7D426; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #2C2C2C; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:nth-child(even) { background: #f8f9fa; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #ddd; padding-top: 20px; }
          .highlight { background: #FFF9E6; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
          .chart-bar { background: #F7D426; height: 20px; display: inline-block; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>💰 Relatório de Preços Médios</h1>
          <p class="subtitle">Mapa da Estética - Clube da Beleza</p>
          <p class="subtitle">Gerado em: ${dataAtual} às ${horaAtual}</p>
        </div>

        <div class="filtros">
          <h3>Filtros Aplicados:</h3>
          <p><strong>Categoria:</strong> ${categoriaFiltro}</p>
          ${cidadeFiltro ? `<p><strong>Cidade:</strong> ${cidadeFiltro}</p>` : ''}
          ${estadoFiltro ? `<p><strong>Estado:</strong> ${estadoFiltro}</p>` : ''}
          ${procedimentoBusca ? `<p><strong>Procedimento:</strong> ${procedimentoBusca}</p>` : ''}
        </div>
        
        <div class="metric">
          <div class="metric-title">📊 Total de Anúncios Analisados</div>
          <div class="metric-value">${estatisticas.total}</div>
        </div>

        <h2>Distribuição por Faixa de Preço</h2>
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
              <td class="highlight">${estatisticas.distribuicao["$"]}</td>
              <td>${((estatisticas.distribuicao["$"] / estatisticas.total) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td><strong>$$</strong></td>
              <td>R$ 500 - R$ 1.000</td>
              <td class="highlight">${estatisticas.distribuicao["$$"]}</td>
              <td>${((estatisticas.distribuicao["$$"] / estatisticas.total) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td><strong>$$$</strong></td>
              <td>R$ 1.000 - R$ 2.000</td>
              <td class="highlight">${estatisticas.distribuicao["$$$"]}</td>
              <td>${((estatisticas.distribuicao["$$$"] / estatisticas.total) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td><strong>$$$$</strong></td>
              <td>R$ 2.000 - R$ 5.000</td>
              <td class="highlight">${estatisticas.distribuicao["$$$$"]}</td>
              <td>${((estatisticas.distribuicao["$$$$"] / estatisticas.total) * 100).toFixed(1)}%</td>
            </tr>
            <tr>
              <td><strong>$$$$$</strong></td>
              <td>Acima de R$ 5.000</td>
              <td class="highlight">${estatisticas.distribuicao["$$$$$"]}</td>
              <td>${((estatisticas.distribuicao["$$$$$"] / estatisticas.total) * 100).toFixed(1)}%</td>
            </tr>
          </tbody>
        </table>

        <h2>Procedimentos Mais Oferecidos</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Procedimento</th>
              <th>Profissionais</th>
            </tr>
          </thead>
          <tbody>
            ${estatisticas.procedimentosComuns.map((proc, index) => `
              <tr>
                <td><strong>${index + 1}º</strong></td>
                <td>${proc.nome}</td>
                <td class="highlight">${proc.count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2>Distribuição por Categoria</h2>
        <table>
          <thead>
            <tr>
              <th>Categoria</th>
              <th>Quantidade de Profissionais</th>
              <th>Percentual</th>
            </tr>
          </thead>
          <tbody>
            ${estatisticas.porCategoria.map(cat => `
              <tr>
                <td><strong>${cat.categoria}</strong></td>
                <td class="highlight">${cat.quantidade}</td>
                <td>${((cat.quantidade / estatisticas.total) * 100).toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

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
    link.download = `Relatorio_Precos_Medios_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Relatório exportado! Abra o arquivo HTML e use Ctrl+P (ou Cmd+P no Mac) para salvar como PDF.');
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h3>
          <p className="text-gray-600 mb-6">
            Apenas administradores podem acessar relatórios
          </p>
          <Button onClick={() => navigate(createPageUrl("Inicio"))} className="bg-[#F7D426] text-[#2C2C2C] hover:bg-[#E5C215] border-2 border-[#2C2C2C]">
            Voltar ao Início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate(createPageUrl("Relatorios"))} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar aos Relatórios
        </Button>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]">
              Admin - Relatório de Preços
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Relatório de Preços Médios
            </h1>
            <p className="text-gray-600">
              Análise completa de preços praticados na plataforma
            </p>
          </div>
          <Button onClick={exportarPDF} className="bg-[#2C2C2C] text-[#F7D426] hover:bg-[#3A3A3A] border-2 border-[#F7D426]">
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
        </div>

        {/* Filtros */}
        <Card className="mb-8 border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Cidade</Label>
                <Input
                  value={cidadeFiltro}
                  onChange={(e) => setCidadeFiltro(e.target.value)}
                  placeholder="Ex: São Paulo"
                />
              </div>

              <div>
                <Label>Estado (UF)</Label>
                <Input
                  value={estadoFiltro}
                  onChange={(e) => setEstadoFiltro(e.target.value)}
                  placeholder="Ex: SP"
                  maxLength={2}
                />
              </div>

              <div>
                <Label>Procedimento</Label>
                <Input
                  value={procedimentoBusca}
                  onChange={(e) => setProcedimentoBusca(e.target.value)}
                  placeholder="Ex: Botox"
                />
              </div>
            </div>

            {(categoriaFiltro !== "Todas" || cidadeFiltro || estadoFiltro || procedimentoBusca) && (
              <div className="mt-4 flex gap-2">
                {categoriaFiltro !== "Todas" && <Badge variant="secondary">Categoria: {categoriaFiltro}</Badge>}
                {cidadeFiltro && <Badge variant="secondary">Cidade: {cidadeFiltro}</Badge>}
                {estadoFiltro && <Badge variant="secondary">Estado: {estadoFiltro}</Badge>}
                {procedimentoBusca && <Badge variant="secondary">Procedimento: {procedimentoBusca}</Badge>}
                <Button size="sm" variant="ghost" onClick={() => {
                  setCategoriaFiltro("Todas");
                  setCidadeFiltro("");
                  setEstadoFiltro("");
                  setProcedimentoBusca("");
                }}>
                  Limpar Filtros
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F7D426] mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Card de Resumo */}
            <Card className="mb-8 border-2 border-[#F7D426] bg-gradient-to-br from-[#FFF9E6] to-white">
              <CardContent className="p-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#2C2C2C] mb-2">Total de Anúncios Analisados</h2>
                  <p className="text-6xl font-bold text-[#F7D426] mb-4">{estatisticas.total}</p>
                  <p className="text-gray-600">
                    Dados coletados de profissionais ativos na plataforma
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Distribuição por Faixa de Preço */}
            <Card className="mb-8 border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-[#F7D426]" />
                  Distribuição por Faixa de Preço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(estatisticas.distribuicao).map(([faixa, quantidade]) => {
                    const percentual = estatisticas.total > 0 ? (quantidade / estatisticas.total) * 100 : 0;
                    const labels = {
                      "$": "Até R$ 500",
                      "$$": "R$ 500 - R$ 1.000",
                      "$$$": "R$ 1.000 - R$ 2.000",
                      "$$$$": "R$ 2.000 - R$ 5.000",
                      "$$$$$": "Acima de R$ 5.000"
                    };

                    return (
                      <div key={faixa}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-lg text-[#2C2C2C]">{faixa}</span>
                            <span className="text-sm text-gray-600">{labels[faixa]}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-[#F7D426]">{quantidade} profissionais</span>
                            <span className="text-sm text-gray-500">{percentual.toFixed(1)}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] h-3 rounded-full transition-all"
                            style={{ width: `${percentual}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Procedimentos Mais Oferecidos */}
            <Card className="mb-8 border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-[#F7D426]" />
                  Top 10 Procedimentos Mais Oferecidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {estatisticas.procedimentosComuns.map((proc, index) => (
                    <div key={proc.nome} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-[#F7D426]">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-[#F7D426] rounded-full flex items-center justify-center text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-gray-900">{proc.nome}</span>
                      </div>
                      <Badge className="bg-[#2C2C2C] text-[#F7D426]">
                        {proc.count} profissionais
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribuição por Categoria */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-[#F7D426]" />
                  Distribuição por Categoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {estatisticas.porCategoria.map(cat => {
                    const percentual = (cat.quantidade / estatisticas.total) * 100;
                    return (
                      <div key={cat.categoria} className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#F7D426]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{cat.categoria}</span>
                          <Badge className="bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]">
                            {cat.quantidade}
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] h-2 rounded-full"
                            style={{ width: `${percentual}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{percentual.toFixed(1)}% do total</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}