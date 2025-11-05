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
import { ArrowLeft, Download, Filter, Search, TrendingUp, DollarSign } from "lucide-react";

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

  const relatoriosFiltrados = relatorios.filter(r => {
    if (filtroCategoria && r.categoria !== filtroCategoria) return false;
    if (filtroCidade && r.cidade && !r.cidade.toLowerCase().includes(filtroCidade.toLowerCase())) return false;
    if (filtroEstado && r.estado !== filtroEstado) return false;
    if (filtroBusca && !r.procedimento.toLowerCase().includes(filtroBusca.toLowerCase()) && !r.profissional_nome.toLowerCase().includes(filtroBusca.toLowerCase())) return false;
    return true;
  });

  // Calcular estatísticas
  const stats = {
    total: relatoriosFiltrados.length,
    valorMedio: relatoriosFiltrados.length > 0 
      ? (relatoriosFiltrados.reduce((acc, r) => acc + (r.valor_medio || 0), 0) / relatoriosFiltrados.length).toFixed(2)
      : 0,
    economico: relatoriosFiltrados.filter(r => r.faixa_preco === '$').length,
    moderado: relatoriosFiltrados.filter(r => r.faixa_preco === '$$').length,
    premium: relatoriosFiltrados.filter(r => r.faixa_preco === '$$$').length,
  };

  const getFaixaPrecoColor = (faixa) => {
    if (faixa === '$') return 'bg-green-100 text-green-800';
    if (faixa === '$$') return 'bg-yellow-100 text-yellow-800';
    if (faixa === '$$$') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const exportarCSV = () => {
    const headers = ['Profissional', 'Email', 'Categoria', 'Procedimento', 'Valor Mínimo', 'Valor Máximo', 'Valor Médio', 'Faixa', 'Cidade', 'Estado', 'Data'];
    const rows = relatoriosFiltrados.map(r => [
      r.profissional_nome,
      r.profissional_email,
      r.categoria,
      r.procedimento,
      r.valor_minimo || '-',
      r.valor_maximo || '-',
      r.valor_medio,
      r.faixa_preco,
      r.cidade || '-',
      r.estado || '-',
      r.data_coleta || new Date().toLocaleDateString()
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-precos-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
                  <p className="text-3xl font-bold text-green-600">R$ {stats.valorMedio}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <p className="text-sm text-gray-600 mb-2">Por Faixa de Preço</p>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>$ Econômico:</span>
                  <span className="font-bold text-green-600">{stats.economico}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$$ Moderado:</span>
                  <span className="font-bold text-yellow-600">{stats.moderado}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$$$ Premium:</span>
                  <span className="font-bold text-red-600">{stats.premium}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <Button
                onClick={exportarCSV}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={relatoriosFiltrados.length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-none shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Filtros</h3>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todas</SelectItem>
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

        {/* Tabela */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
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
                      <TableHead>Faixa</TableHead>
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
                          <div>
                            <p className="font-bold text-green-600">R$ {rel.valor_medio?.toFixed(2) || '-'}</p>
                            {rel.valor_minimo && rel.valor_maximo && (
                              <p className="text-xs text-gray-500">
                                R$ {rel.valor_minimo?.toFixed(2)} - R$ {rel.valor_maximo?.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getFaixaPrecoColor(rel.faixa_preco)}>
                            {rel.faixa_preco}
                          </Badge>
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
      </div>
    </div>
  );
}