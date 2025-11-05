
import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, MapPin, Grid, List, Locate, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CardAnuncio from "../components/anuncios/CardAnuncio";
import SeletorProcedimentos from "../components/anuncios/SeletorProcedimentos";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import LoginPromptModal from "../components/home/LoginPromptModal";

const categorias = [
  "Todas",
  "Depilação", "Estética Facial", "Estética Corporal", "Massoterapia",
  "Drenagem Linfática", "Micropigmentação", "Design de Sobrancelhas",
  "Extensão de Cílios", "Manicure e Pedicure", "Podologia",
  "Harmonização Facial", "Maquiagem", "Outros"
];

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const ITEMS_PER_PAGE = 10;

const tiposAnuncio = [
  { valor: "servico", label: "💼 Serviço" },
  { valor: "procedimento", label: "🔬 Procedimento" },
  { valor: "tecnica", label: "✨ Técnica" },
  { valor: "consultorio", label: "🏢 Consultório" },
  { valor: "clinica", label: "🏥 Clínica" },
  { valor: "promocao", label: "🎁 Promoção" },
  { valor: "venda_produto", label: "🛍️ Venda de Produto" },
  { valor: "venda_aparelho", label: "⚙️ Venda de Aparelho" },
  { valor: "aluguel_produto", label: "📦 Aluguel de Produto" },
  { valor: "aluguel_aparelho", label: "🔧 Aluguel de Aparelho" },
  { valor: "troca_produto", label: "🔄 Troca de Produto" },
  { valor: "troca_aparelho", label: "♻️ Troca de Aparelho" }
];

const statusFuncionamento = [
  { valor: "Aberto Agora", label: "🟢 Aberto Agora" },
  { valor: "Fechado", label: "🔴 Fechado" },
  { valor: "Sempre Aberto", label: "🔵 Sempre Aberto (24h)" },
  { valor: "N/D", label: "⚪ Não Informado" }
];

export default function Anuncios() {
  const [busca, setBusca] = useState("");
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [procedimentoFiltro, setProcedimentoFiltro] = useState("");
  const [tagFiltro, setTagFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [localizando, setLocalizando] = useState(false);
  const [ordenacao, setOrdenacao] = useState("mais_recentes");
  const [filtroFaixaPreco, setFiltroFaixaPreco] = useState("");
  const [filtroTipoAnuncio, setFiltroTipoAnuncio] = useState("");
  const [filtroStatusFuncionamento, setFiltroStatusFuncionamento] = useState("");
  const [mostrarSeletorProcedimentos, setMostrarSeletorProcedimentos] = useState(false);

  const [user, setUser] = useState(null);
  const [mostrarLoginPrompt, setMostrarLoginPrompt] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
        // MOSTRAR MODAL APÓS 1 SEGUNDO
        setTimeout(() => {
          setMostrarLoginPrompt(true);
        }, 1000);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cidade = urlParams.get('cidade');
    const estado = urlParams.get('estado');
    const categoria = urlParams.get('categoria');
    const procedimento = urlParams.get('procedimento');
    const tag = urlParams.get('tag');
    const ordem = urlParams.get('ordem');
    const faixaPreco = urlParams.get('faixaPreco');
    const tipoAnuncio = urlParams.get('tipoAnuncio');
    const statusFuncionamentoParam = urlParams.get('statusFuncionamento');


    if (cidade) setCidadeFiltro(cidade);
    if (estado) setEstadoFiltro(estado);
    if (categoria) setCategoriaFiltro(categoria);
    if (procedimento) setProcedimentoFiltro(procedimento);
    if (tag) setTagFiltro(tag);
    if (ordem) setOrdenacao(ordem);
    if (faixaPreco) setFiltroFaixaPreco(faixaPreco);
    if (tipoAnuncio) setFiltroTipoAnuncio(tipoAnuncio);
    if (statusFuncionamentoParam) setFiltroStatusFuncionamento(statusFuncionamentoParam);
  }, []);

  const usarMinhaLocalizacao = async () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada pelo seu navegador");
      return;
    }

    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const cidade = data.address.city || data.address.town || data.address.village || "";
          const estado = data.address.state_code || data.address.state || "";
          
          if (cidade) setCidadeFiltro(cidade);
          if (estado) setEstadoFiltro(estado.substring(0, 2).toUpperCase());
          setPaginaAtual(1);
        } catch (error) {
          console.error("Erro ao obter localização ou reverter:", error);
          alert("Erro ao obter localização. Tente novamente.");
        } finally {
          setLocalizando(false);
        }
      },
      (error) => {
        console.error("Erro de geolocalização:", error);
        alert("Não foi possível obter sua localização. Verifique as permissões.");
        setLocalizando(false);
      }
    );
  };

  const serverSideFilters = useMemo(() => ({
    cidade: cidadeFiltro,
    estado: estadoFiltro,
    categoria: categoriaFiltro,
  }), [cidadeFiltro, estadoFiltro, categoriaFiltro]);

  const { data: fetchedAnuncios = [], isLoading } = useQuery({
    queryKey: ['anuncios', serverSideFilters, ordenacao],
    queryFn: async () => {
      let query = { status: 'ativo' };
      
      if (serverSideFilters.cidade) {
        query.cidade = { $regex: serverSideFilters.cidade, $options: 'i' };
      }
      
      if (serverSideFilters.categoria && serverSideFilters.categoria !== 'Todas') {
        query.categoria = serverSideFilters.categoria;
      }
      
      if (serverSideFilters.estado) {
        query.estado = serverSideFilters.estado.toUpperCase();
      }
      
      let ordemParam = '-created_date';
      if (ordenacao === 'mais_visualizados') ordemParam = '-visualizacoes';
      if (ordenacao === 'mais_antigos') ordemParam = 'created_date';
      
      const result = await base44.entities.Anuncio.filter(query, ordemParam, 100);
      return result;
    },
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: false,
    initialData: [],
  });

  const anuncios = useMemo(() => {
    const planoOrdem = { 'premium': 4, 'avancado': 3, 'intermediario': 2, 'basico': 1 };
    
    return fetchedAnuncios
      .filter(anuncio => {
        const matchProcedimento = !procedimentoFiltro ||
          anuncio.procedimentos_servicos?.some(p => 
            p.toLowerCase().includes(procedimentoFiltro.toLowerCase())
          ) ||
          anuncio.titulo?.toLowerCase().includes(procedimentoFiltro.toLowerCase()) ||
          anuncio.descricao?.toLowerCase().includes(procedimentoFiltro.toLowerCase());
        
        const matchTag = !tagFiltro ||
          anuncio.tags?.some(t => 
            t.toLowerCase().includes(tagFiltro.toLowerCase())
          );
        
        const matchBusca = !busca || 
          anuncio.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
          anuncio.profissional?.toLowerCase().includes(busca.toLowerCase()) ||
          anuncio.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
          anuncio.horario_funcionamento?.toLowerCase().includes(busca.toLowerCase()) ||
          anuncio.procedimentos_servicos?.some(p => 
            p.toLowerCase().includes(busca.toLowerCase())
          ) ||
          anuncio.tags?.some(t => 
            t.toLowerCase().includes(busca.toLowerCase())
          );
        
        const matchCidade = !cidadeFiltro || 
          anuncio.cidade?.toLowerCase().includes(cidadeFiltro.toLowerCase());
        
        const matchEstado = !estadoFiltro ||
          anuncio.estado?.toLowerCase().includes(estadoFiltro.toLowerCase());

        const matchFaixaPreco = !filtroFaixaPreco || anuncio.faixa_preco === filtroFaixaPreco;
        const matchTipoAnuncio = !filtroTipoAnuncio || anuncio.tipo_anuncio === filtroTipoAnuncio;
        const matchStatusFuncionamento = !filtroStatusFuncionamento || anuncio.status_funcionamento === filtroStatusFuncionamento;


        return matchCidade && matchEstado && matchProcedimento && matchTag && matchBusca && matchFaixaPreco && matchTipoAnuncio && matchStatusFuncionamento;
      })
      .sort((a, b) => {
        const planoA = planoOrdem[a.plano] || 0;
        const planoB = planoOrdem[b.plano] || 0;
        if (planoB !== planoA) {
          return planoB - planoA;
        }
        return new Date(b.created_date) - new Date(a.created_date);
      });
  }, [fetchedAnuncios, busca, procedimentoFiltro, tagFiltro, cidadeFiltro, estadoFiltro, filtroFaixaPreco, filtroTipoAnuncio, filtroStatusFuncionamento]);

  const totalPaginas = Math.ceil(anuncios.length / ITEMS_PER_PAGE);
  const anunciosPaginados = anuncios.slice(
    (paginaAtual - 1) * ITEMS_PER_PAGE,
    paginaAtual * ITEMS_PER_PAGE
  );

  const handlePaginaChange = (novaPagina) => {
    setPaginaAtual(novaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limparFiltros = () => {
    setBusca("");
    setCidadeFiltro("");
    setEstadoFiltro("");
    setCategoriaFiltro("Todas");
    setProcedimentoFiltro("");
    setTagFiltro("");
    setFiltroFaixaPreco("");
    setFiltroTipoAnuncio("");
    setFiltroStatusFuncionamento("");
    setPaginaAtual(1);
  };

  const getFaixaPrecoInfo = (faixa) => {
    const info = {
      "$": { texto: "Até R$ 500", emoji: "💚" },
      "$$": { texto: "R$ 500 - R$ 1.000", emoji: "💙" },
      "$$$": { texto: "R$ 1.000 - R$ 2.000", emoji: "💛" },
      "$$$$": { texto: "R$ 2.000 - R$ 5.000", emoji: "🧡" },
      "$$$$$": { texto: "Acima de R$ 5.000", emoji: "❤️" }
    };
    return info[faixa] || info["$"];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Encontre Profissionais de Estética
          </h1>
          <p className="text-gray-600">
            {anuncios.length} profissional{anuncios.length !== 1 ? 'is' : ''} encontrado{anuncios.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Filtros */}
        <Card className="p-6 mb-8 shadow-lg border-none">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Busca input */}
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, profissional..."
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setPaginaAtual(1);
                  }}
                  className="pl-10 h-12"
                />
              </div>

              {/* Cidade input */}
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10" />
                <Input
                  placeholder="Cidade"
                  value={cidadeFiltro}
                  onChange={(e) => {
                    setCidadeFiltro(e.target.value);
                    setPaginaAtual(1);
                  }}
                  className="pl-10 h-12"
                />
              </div>

              {/* Estado Select */}
              <Select
                value={estadoFiltro}
                onValueChange={(value) => {
                  setEstadoFiltro(value);
                  setPaginaAtual(1);
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Estado (UF)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todos</SelectItem>
                  {estados.map((estado) => (
                    <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Categoria Select */}
              <Select
                value={categoriaFiltro}
                onValueChange={(value) => {
                  setCategoriaFiltro(value);
                  setPaginaAtual(1);
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* NOVO: Botão para abrir seletor de procedimentos */}
              <div className="md:col-span-2">
                <Button
                  onClick={() => setMostrarSeletorProcedimentos(true)}
                  variant="outline"
                  className="w-full h-12 border-2 border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  {procedimentoFiltro 
                    ? `Procedimento: ${procedimentoFiltro}` 
                    : "Selecionar Procedimento Específico"}
                </Button>
              </div>

              {/* Tag input */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10" />
                <Input
                  placeholder="Buscar por palavra-chave (ex: #microagulhamento)"
                  value={tagFiltro}
                  onChange={(e) => {
                    setTagFiltro(e.target.value);
                    setPaginaAtual(1);
                  }}
                  className="pl-10 h-12"
                />
              </div>

              {/* Filtro Faixa de Preço */}
              <Select
                value={filtroFaixaPreco}
                onValueChange={(value) => {
                  setFiltroFaixaPreco(value);
                  setPaginaAtual(1);
                }}
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Faixa de Preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>Todas as faixas</SelectItem>
                  <SelectItem value="$">💚 $ - Até R$ 500</SelectItem>
                  <SelectItem value="$$">💙 $$ - R$ 500 - R$ 1.000</SelectItem>
                  <SelectItem value="$$$">💛 $$$ - R$ 1.000 - R$ 2.000</SelectItem>
                  <SelectItem value="$$$$">🧡 $$$$ - R$ 2.000 - R$ 5.000</SelectItem>
                  <SelectItem value="$$$$$">❤️ $$$$$ - Acima de R$ 5.000</SelectItem>
                </SelectContent>
              </Select>

              {/* NOVO: Filtro Tipo de Anúncio */}
              <div>
                <Select
                  value={filtroTipoAnuncio}
                  onValueChange={(value) => {
                    setFiltroTipoAnuncio(value);
                    setPaginaAtual(1);
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Tipo de Anúncio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os tipos</SelectItem>
                    {tiposAnuncio.map(tipo => (
                      <SelectItem key={tipo.valor} value={tipo.valor}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status de Funcionamento */}
              <div>
                <Select
                  value={filtroStatusFuncionamento}
                  onValueChange={(value) => {
                    setFiltroStatusFuncionamento(value);
                    setPaginaAtual(1);
                  }}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Status de Funcionamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos os status</SelectItem>
                    {statusFuncionamento.map(status => (
                      <SelectItem key={status.valor} value={status.valor}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Badges e Botão de Limpar Filtros */}
            {(busca || cidadeFiltro || estadoFiltro || categoriaFiltro !== "Todas" || procedimentoFiltro || tagFiltro || filtroFaixaPreco || filtroTipoAnuncio || filtroStatusFuncionamento) && (
              <div className="mt-4 flex items-center justify-between mb-4">
                <div className="flex flex-wrap gap-2">
                  {busca && <Badge variant="secondary">Busca: {busca}</Badge>}
                  {cidadeFiltro && <Badge variant="secondary">Cidade: {cidadeFiltro}</Badge>}
                  {estadoFiltro && <Badge variant="secondary">Estado: {estadoFiltro}</Badge>}
                  {categoriaFiltro !== "Todas" && <Badge variant="secondary">Categoria: {categoriaFiltro}</Badge>}
                  {procedimentoFiltro && (
                    <Badge className="bg-purple-100 text-purple-800">
                      Procedimento: {procedimentoFiltro}
                    </Badge>
                  )}
                  {tagFiltro && <Badge variant="secondary">Palavra-chave: {tagFiltro}</Badge>}
                  {filtroFaixaPreco && (
                    <Badge variant="secondary">
                      {getFaixaPrecoInfo(filtroFaixaPreco).emoji} {getFaixaPrecoInfo(filtroFaixaPreco).texto}
                    </Badge>
                  )}
                  {filtroTipoAnuncio && (
                    <Badge variant="secondary">
                      Tipo: {tiposAnuncio.find(t => t.valor === filtroTipoAnuncio)?.label || filtroTipoAnuncio}
                    </Badge>
                  )}
                  {filtroStatusFuncionamento && (
                    <Badge variant="secondary">
                      Status: {statusFuncionamento.find(s => s.valor === filtroStatusFuncionamento)?.label || filtroStatusFuncionamento}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={limparFiltros}>
                  Limpar Filtros
                </Button>
              </div>
            )}

            {/* Localização e Ordenação */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-4">
              <Button
                onClick={usarMinhaLocalizacao}
                disabled={localizando}
                variant="outline"
                className="w-full md:w-auto h-12"
              >
                <Locate className="w-4 h-4 mr-2" />
                {localizando ? "Localizando..." : "Usar Minha Localização"}
              </Button>
              
              <Select
                value={ordenacao}
                onValueChange={(value) => {
                  setOrdenacao(value);
                  setPaginaAtual(1);
                }}
              >
                <SelectTrigger className="w-full md:w-64 h-12">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mais_recentes">Mais Recentes</SelectItem>
                  <SelectItem value="mais_visualizados">Mais Visualizados</SelectItem>
                  <SelectItem value="mais_antigos">Mais Antigos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Resultados e Modo de Visualização */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {anuncios.length} resultado{anuncios.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "bg-pink-600 hover:bg-pink-700" : ""}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "bg-pink-600 hover:bg-pink-700" : ""}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : anuncios.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum anúncio encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar os filtros ou fazer uma nova busca
            </p>
          </Card>
        ) : (
          <>
            <div className={viewMode === "grid" 
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
            }>
              {anunciosPaginados.map((anuncio) => (
                <CardAnuncio key={anuncio.id} anuncio={anuncio} />
              ))}
            </div>

            {totalPaginas > 1 && (
              <div className="mt-12 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => paginaAtual > 1 && handlePaginaChange(paginaAtual - 1)}
                        className={paginaAtual === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                      let pageNum;
                      if (totalPaginas <= 5) {
                        pageNum = i + 1;
                      } else if (paginaAtual <= 3) {
                        pageNum = i + 1;
                      } else if (paginaAtual >= totalPaginas - 2) {
                        pageNum = totalPaginas - 4 + i;
                      } else {
                        pageNum = paginaAtual - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => handlePaginaChange(pageNum)}
                            isActive={paginaAtual === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => paginaAtual < totalPaginas && handlePaginaChange(paginaAtual + 1)}
                        className={paginaAtual === totalPaginas ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de Seletor de Procedimentos */}
      <SeletorProcedimentos
        open={mostrarSeletorProcedimentos}
        onClose={() => setMostrarSeletorProcedimentos(false)}
        onSelect={(procedimento) => {
          setProcedimentoFiltro(procedimento);
          setPaginaAtual(1);
        }}
        procedimentoAtual={procedimentoFiltro}
      />

      {/* Modal de Login Prompt */}
      <LoginPromptModal
        open={mostrarLoginPrompt}
        onClose={() => setMostrarLoginPrompt(false)}
        pageName="anuncios"
      />
    </div>
  );
}
