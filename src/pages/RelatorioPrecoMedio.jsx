
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Download, Filter, Search, TrendingUp, DollarSign, Calendar } from "lucide-react";

const categorias = [
  "Depilação", "Estética Facial", "Estética Corporal", "Massoterapia",
  "Harmonização Facial", "Micropigmentação", "Design de Sobrancelhas",
  "Manicure e Pedicure", "Podologia", "Outros"
];

export default function RelatorioPrecoMedio() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroCidade, setFiltroCidade] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroBusca, setFiltroBusca] = useState("");
  const [abaSelecionada, setAbaSelecionada] = useState("individuais");
  const [mesReferencia, setMesReferencia] = useState("");

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Verificar se é admin
        if (userData.role !== 'admin') {
          alert("Acesso restrito a administradores");
          navigate(createPageUrl("Inicio"));
        }
      } catch (error) {
        navigate(createPageUrl("Inicio"));
      }
    };
    checkAdmin();
  }, [navigate]);

  const { data: relatorios = [], isLoading } = useQuery({
    queryKey: ['relatorios-preco'],
    queryFn: () => base44.entities.RelatorioPreco.list('-data_coleta', 1000),
    initialData: [],
  });

  const { data: relatoriosConsolidados = [], isLoading: isLoadingConsolidados } = useQuery({
    queryKey: ['relatorios-consolidados'],
    queryFn: () => base44.entities.RelatorioPrecoConsolidado.list('-mes_referencia', 100),
    initialData: [],
  });

  // Função para gerar relatório consolidado do mês atual
  const gerarRelatorioMensal = async () => {
    try {
      const mesAtual = new Date().toISOString().substring(0, 7); // YYYY-MM
      
      // Buscar todos os registros do mês
      const registrosMes = relatorios.filter(r => {
        if (!r.data_coleta) return false;
        const mesRegistro = r.data_coleta.substring(0, 7);
        return mesRegistro === mesAtual;
      });

      if (registrosMes.length === 0) {
        alert("Não há registros para o mês atual");
        return;
      }

      // Agrupar por procedimento e categoria
      const agrupado = {};
      registrosMes.forEach(r => {
        const key = `${r.procedimento}_${r.categoria}`;
        if (!agrupado[key]) {
          agrupado[key] = {
            procedimento: r.procedimento,
            categoria: r.categoria,
            registros: []
          };
        }
        agrupado[key].registros.push(r);
      });

      // Criar relatórios consolidados
      for (const key in agrupado) {
        const grupo = agrupado[key];
        const valores = grupo.registros.map(r => r.valor_medio).filter(v => typeof v === 'number');
        
        if (valores.length === 0) continue;

        const valorMinimo = Math.min(...valores);
        const valorMaximo = Math.max(...valores);
        const valorMedio = valores.reduce((a, b) => a + b, 0) / valores.length;
        const valorTotal = valores.reduce((a, b) => a + b, 0);

        // Distribuição por faixas
        const distribuicao = {
          economico: grupo.registros.filter(r => r.faixa_preco === '$').length,
          moderado: grupo.registros.filter(r => r.faixa_preco === '$$').length,
          medio_alto: grupo.registros.filter(r => r.faixa_preco === '$$$').length,
          alto: grupo.registros.filter(r => r.faixa_preco === '$$$$').length,
          premium: grupo.registros.filter(r => r.faixa_preco === '$$$$$').length,
        };

        // Faixa predominante
        const faixaMaisComumEntry = Object.entries(distribuicao)
          .sort((a, b) => b[1] - a[1])[0];
        
        const faixaMap = {
          economico: '$',
          moderado: '$$',
          medio_alto: '$$$',
          alto: '$$$$',
          premium: '$$$$$'
        };
        const faixaPredominanteSymbol = faixaMap[faixaMaisComumEntry[0]];

        // Check if a consolidated report for this month/procedimento/category already exists
        const existingReport = relatoriosConsolidados.find(
          (r) => r.mes_referencia === mesAtual && r.procedimento === grupo.procedimento && r.categoria === grupo.categoria
        );

        if (existingReport) {
          await base44.entities.RelatorioPrecoConsolidado.update(existingReport.id, {
            quantidade_registros: grupo.registros.length,
            valor_minimo: valorMinimo,
            valor_maximo: valorMaximo,
            valor_medio: valorMedio,
            valor_total: valorTotal,
            faixa_preco_predominante: faixaPredominanteSymbol,
            distribuicao_faixas: distribuicao,
            profissionais_analisados: [...new Set(grupo.registros.map(r => r.profissional_email))],
            data_geracao: new Date().toISOString()
          });
          console.log(`Relatório consolidado atualizado para ${mesAtual} - ${grupo.procedimento}`);
        } else {
          await base44.entities.RelatorioPrecoConsolidado.create({
            mes_referencia: mesAtual,
            procedimento: grupo.procedimento,
            categoria: grupo.categoria,
            quantidade_registros: grupo.registros.length,
            valor_minimo: valorMinimo,
            valor_maximo: valorMaximo,
            valor_medio: valorMedio,
            valor_total: valorTotal,
            faixa_preco_predominante: faixaPredominanteSymbol,
            distribuicao_faixas: distribuicao,
            profissionais_analisados: [...new Set(grupo.registros.map(r => r.profissional_email))],
            tipo_relatorio: 'geral',
            data_geracao: new Date().toISOString()
          });
          console.log(`Novo relatório consolidado criado para ${mesAtual} - ${grupo.procedimento}`);
        }
      }

      alert("Relatório mensal gerado/atualizado com sucesso!");
      window.location.reload();
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      alert("Erro ao gerar relatório mensal");
    }
  };

  const relatoriosFiltrados = relatorios.filter(r => {
    if (filtroCategoria && r.categoria !== filtroCategoria) return false;
    if (filtroCidade && r.cidade && !r.cidade.toLowerCase().includes(filtroCidade.toLowerCase())) return false;
    if (filtroEstado && r.estado !== filtroEstado) return false;
    if (filtroBusca && !r.procedimento.toLowerCase().includes(filtroBusca.toLowerCase()) && !r.profissional_nome.toLowerCase().includes(filtroBusca.toLowerCase())) return false;
    return true;
  });

  const consolidadosFiltrados = relatoriosConsolidados.filter(r => {
    let matches = true;
    if (filtroCategoria && r.categoria !== filtroCategoria) matches = false;
    // Note: filtroCidade and filtroEstado are not directly stored on consolidated reports
    // so they are not applied here.
    if (filtroBusca && !r.procedimento.toLowerCase().includes(filtroBusca.toLowerCase())) matches = false;
    if (mesReferencia && r.mes_referencia !== mesReferencia) matches = false;
    return matches;
  });

  // Calcular estatísticas
  const stats = {
    total: relatoriosFiltrados.length,
    valorMedio: relatoriosFiltrados.length > 0 && relatoriosFiltrados.some(r => r.valor_medio)
      ? (relatoriosFiltrados.reduce((acc, r) => acc + (r.valor_medio || 0), 0) / relatoriosFiltrados.filter(r => typeof r.valor_medio === 'number' && !isNaN(r.valor_medio)).length).toFixed(2)
      : 0,
    economico: relatoriosFiltrados.filter(r => r.faixa_preco === '$').length,
    moderado: relatoriosFiltrados.filter(r => r.faixa_preco === '$$').length,
    medioAlto: relatoriosFiltrados.filter(r => r.faixa_preco === '$$$').length,
    alto: relatoriosFiltrados.filter(r => r.faixa_preco === '$$$$').length,
    premium: relatoriosFiltrados.filter(r => r.faixa_preco === '$$$$$').length,
  };

  const getFaixaPrecoColor = (faixa) => {
    const colors = {
      '$': 'bg-green-100 text-green-800',
      '$$': 'bg-blue-100 text-blue-800',
      '$$$': 'bg-yellow-100 text-yellow-800',
      '$$$$': 'bg-orange-100 text-orange-800',
      '$$$$$': 'bg-red-100 text-red-800'
    };
    return colors[faixa] || 'bg-gray-100 text-gray-800';
  };

  const getFaixaPrecoTexto = (faixa) => {
    const textos = {
      '$': 'Até R$ 500',
      '$$': 'R$ 500-1.000',
      '$$$': 'R$ 1.000-2.000',
      '$$$$': 'R$ 2.000-5.000',
      '$$$$$': 'Acima de R$ 5.000'
    };
    return textos[faixa] || faixa;
  };

  const exportarCSV = () => {
    const headers = ['Profissional', 'Email', 'Categoria', 'Procedimento', 'Valor Médio', 'Faixa Preço', 'Faixa Descrição', 'Cidade', 'Estado', 'Data'];
    const rows = relatoriosFiltrados.map(r => [
      r.profissional_nome,
      r.profissional_email,
      r.categoria,
      r.procedimento,
      r.valor_medio || '-',
      r.faixa_preco,
      getFaixaPrecoTexto(r.faixa_preco),
      r.cidade || '-',
      r.estado || '-',
      r.data_coleta ? new Date(r.data_coleta).toLocaleDateString('pt-BR') : '-'
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-precos-individuais-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
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
            Admin - Relatórios
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Relatório de Preços Médios
          </h1>
          <p className="text-gray-600">
            Análise de preços praticados pelos profissionais na plataforma
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total de Registros</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Preço Médio Geral</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.valorMedio > 0 ? `R$ ${stats.valorMedio}` : 'N/A'}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg md:col-span-2">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">Distribuição por Faixa de Preço</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex justify-between text-sm">
                  <span>$ (até 500):</span>
                  <span className="font-bold text-green-600">{stats.economico}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$$ (500-1k):</span>
                  <span className="font-bold text-blue-600">{stats.moderado}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$$$ (1k-2k):</span>
                  <span className="font-bold text-yellow-600">{stats.medioAlto}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$$$$ (2k-5k):</span>
                  <span className="font-bold text-orange-600">{stats.alto}</span>
                </div>
                <div className="flex justify-between text-sm md:col-span-2">
                  <span>$$$$$ (5k+):</span>
                  <span className="font-bold text-red-600">{stats.premium}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs para alternar entre relatórios */}
        <Tabs value={abaSelecionada} onValueChange={setAbaSelecionada} className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individuais">Registros Individuais</TabsTrigger>
            <TabsTrigger value="consolidados">
              Relatórios Mensais Consolidados
              <Badge className="ml-2 bg-purple-600">{relatoriosConsolidados.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individuais" className="space-y-8">
            {/* Filtros */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold">Filtros</h3>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label>Categoria</Label>
                    <Select value={filtroCategoria} onValueChange={(value) => setFiltroCategoria(value === "Todas" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todas">Todas</SelectItem>
                        {categorias.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={filtroCidade}
                      onChange={(e) => setFiltroCidade(e.target.value)}
                      placeholder="Filtrar por cidade"
                    />
                  </div>

                  <div>
                    <Label>Estado</Label>
                    <Input
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      placeholder="Ex: SP"
                      maxLength={2}
                    />
                  </div>

                  <div>
                    <Label>Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        value={filtroBusca}
                        onChange={(e) => setFiltroBusca(e.target.value)}
                        placeholder="Procedimento ou profissional"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {(filtroCategoria || filtroCidade || filtroEstado || filtroBusca) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFiltroCategoria("");
                      setFiltroCidade("");
                      setFiltroEstado("");
                      setFiltroBusca("");
                    }}
                    className="mt-4"
                  >
                    Limpar Filtros
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Tabela Individual */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Dados Coletados</h3>
                  <Button
                    onClick={exportarCSV}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={relatoriosFiltrados.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar CSV
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando relatórios...</p>
                    </div>
                  ) : relatoriosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 text-lg mb-2">Nenhum registro encontrado</p>
                      <p className="text-sm text-gray-400">Ajuste os filtros ou aguarde novos dados</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Profissional</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Procedimento</TableHead>
                          <TableHead>Valor Médio</TableHead>
                          <TableHead>Faixa de Preço</TableHead>
                          <TableHead>Localização</TableHead>
                          <TableHead>Data</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {relatoriosFiltrados.map((rel) => (
                          <TableRow key={rel.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">{rel.profissional_nome}</p>
                                <p className="text-xs text-gray-500">{rel.profissional_email}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{rel.categoria}</Badge>
                            </TableCell>
                            <TableCell>{rel.procedimento}</TableCell>
                            <TableCell>
                              {typeof rel.valor_medio === 'number' ? (
                                <p className="font-bold text-green-600">R$ {rel.valor_medio.toFixed(2)}</p>
                              ) : (
                                <p className="text-gray-400">-</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <Badge className={getFaixaPrecoColor(rel.faixa_preco)}>
                                  {rel.faixa_preco}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {getFaixaPrecoTexto(rel.faixa_preco)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {rel.cidade && rel.estado ? `${rel.cidade}/${rel.estado}` : '-'}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {rel.data_coleta ? new Date(rel.data_coleta).toLocaleDateString('pt-BR') : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consolidados" className="space-y-8">
            {/* Ações e Filtros Consolidados */}
            <Card className="border-none shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Relatórios Mensais Automáticos</h3>
                    <p className="text-sm text-gray-600">
                      Consolidação automática de dados a cada 30 dias por procedimento
                    </p>
                  </div>
                  <Button
                    onClick={gerarRelatorioMensal}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Gerar/Atualizar Relatório do Mês Atual
                  </Button>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label>Mês de Referência</Label>
                    <Input
                      type="month"
                      value={mesReferencia}
                      onChange={(e) => setMesReferencia(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Categoria</Label>
                    <Select value={filtroCategoria} onValueChange={(value) => setFiltroCategoria(value === "Todas" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Todas">Todas</SelectItem>
                        {categorias.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Buscar Procedimento</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <Input
                        value={filtroBusca}
                        onChange={(e) => setFiltroBusca(e.target.value)}
                        placeholder="Nome do procedimento"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFiltroCategoria("");
                        setFiltroBusca("");
                        setMesReferencia("");
                      }}
                      className="w-full"
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabela Consolidada */}
            <Card className="border-none shadow-lg">
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  {isLoadingConsolidados ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Carregando relatórios consolidados...</p>
                    </div>
                  ) : consolidadosFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg mb-2">Nenhum relatório consolidado encontrado</p>
                      <p className="text-sm text-gray-400 mb-4">Gere o relatório do mês atual clicando no botão acima ou ajuste os filtros.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Mês</TableHead>
                          <TableHead>Procedimento</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Qtd. Registros</TableHead>
                          <TableHead>Valor Médio</TableHead>
                          <TableHead>Faixa Predominante</TableHead>
                          <TableHead>Distribuição</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consolidadosFiltrados.map((rel) => (
                          <TableRow key={rel.id}>
                            <TableCell>
                              <Badge className="bg-blue-100 text-blue-800">
                                {new Date(rel.mes_referencia + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <p className="font-medium">{rel.procedimento}</p>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{rel.categoria}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-gray-400" />
                                <span className="font-bold">{rel.quantidade_registros}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-bold text-green-600 text-lg">R$ {rel.valor_medio?.toFixed(2)}</p>
                                {rel.valor_minimo && rel.valor_maximo && (
                                  <p className="text-xs text-gray-500">
                                    Min: R$ {rel.valor_minimo.toFixed(2)} | Max: R$ {rel.valor_maximo.toFixed(2)}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                  Total: R$ {rel.valor_total?.toFixed(2)}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getFaixaPrecoColor(rel.faixa_preco_predominante)}>
                                {rel.faixa_preco_predominante}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-xs">
                                {rel.distribuicao_faixas && (
                                  <>
                                    <div className="flex justify-between">
                                      <span>$:</span>
                                      <span className="font-bold text-green-600">{rel.distribuicao_faixas.economico || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>$$:</span>
                                      <span className="font-bold text-blue-600">{rel.distribuicao_faixas.moderado || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>$$$:</span>
                                      <span className="font-bold text-yellow-600">{rel.distribuicao_faixas.medio_alto || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>$$$$:</span>
                                      <span className="font-bold text-orange-600">{rel.distribuicao_faixas.alto || 0}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>$$$$$:</span>
                                      <span className="font-bold text-red-600">{rel.distribuicao_faixas.premium || 0}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
