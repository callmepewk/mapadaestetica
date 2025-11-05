
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
import { Search, Filter, MapPin, Grid, List, Locate, Sparkles, X } from "lucide-react";
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
import { Label } from "@/components/ui/label"; // Added import for Label

const categorias = [
  "Todas",
  "Estética Facial - Tratamentos Básicos",
  "Estética Facial - Rejuvenescimento",
  "Estética Facial - Tratamento de Condições",
  "Estética Facial - Harmonização",
  "Estética Corporal - Redução de Medidas",
  "Estética Corporal - Celulite e Estrias",
  "Estética Corporal - Flacidez e Contorno",
  "Depilação",
  "Drenagem Linfática",
  "Estética Capilar e Tricologia",
  "Transplante Capilar",
  "Manicure e Pedicure",
  "Podologia",
  "Micropigmentação e Design de Sobrancelhas",
  "Micropigmentação - Olhos e Lábios",
  "Extensão e Alongamento de Cílios",
  "Medicina Estética",
  "Dermatologia",
  "Cirurgia Plástica",
  "Fisioterapia Dermato Funcional",
  "Nutrição Estética",
  "Psicologia e Coaching de Imagem",
  "Pilates e Fitness",
  "Acupuntura Estética",
  "Terapias Integrativas e Complementares",
  "Biomedicina Estética",
  "Enfermagem Estética",
  "Farmácia Estética",
  "Odontologia Estética",
  "Massoterapia",
  "Barbearia",
  "Tatuagem e Piercing",
  "Spa e Bem-Estar",
  "Longevidade e Medicina Integrativa",
  "Clínicas e Consultórios",
  "Salões de Beleza",
  "Equipamentos - Venda",
  "Equipamentos - Locação",
  "Equipamentos - Seminovos",
  "Cosméticos e Produtos",
  "Injetáveis e Preenchedores",
  "Nutracêuticos e Suplementos",
  "Móveis e Decoração para Clínicas",
  "Softwares de Gestão",
  "Uniformes e Vestuário Profissional",
  "Roupas de Compressão Pós-Cirúrgica",
  "Alimentação Saudável e Fitness",
  "Educação - Cursos e Workshops",
  "Eventos - Congressos e Feiras",
  "Consultoria e Assessoria",
  "Franquias",
  "Turismo de Saúde",
  "Seguros e Financiamentos",
  "Marketing e Design",
  "Outros"
];

const estados = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const faixasPreco = ["Todas", "$", "$$", "$$$", "$$$$", "$$$$$"];

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
  const [buscaTexto, setBuscaTexto] = useState(""); // Changed from busca
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [procedimentoFiltro, setProcedimentoFiltro] = useState("");
  const [tagFiltro, setTagFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [localizando, setLocalizando] = useState(false);
  const [ordenacao, setOrdenacao] = useState("mais_recentes");
  const [faixaPrecoFiltro, setFaixaPrecoFiltro] = useState("Todas"); // Changed from filtroFaixaPreco
  const [filtroTipoAnuncio, setFiltroTipoAnuncio] = useState("");
  const [filtroStatusFuncionamento, setFiltroStatusFuncionamento] = useState("");
  const [mostrarSeletorProcedimentos, setMostrarSeletorProcedimentos] = useState(false);
  const [apenasVerificados, setApenasVerificados] = useState(false); // New state

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
    const verificados = urlParams.get('verificados');


    if (cidade) setCidadeFiltro(cidade);
    if (estado) setEstadoFiltro(estado);
    if (categoria) setCategoriaFiltro(categoria);
    if (procedimento) setProcedimentoFiltro(procedimento);
    if (tag) setTagFiltro(tag);
    if (ordem) setOrdenacao(ordem);
    if (faixaPreco) setFaixaPrecoFiltro(faixaPreco); // Changed state here
    if (tipoAnuncio) setFiltroTipoAnuncio(tipoAnuncio);
    if (statusFuncionamentoParam) setFiltroStatusFuncionamento(statusFuncionamentoParam);
    if (verificados) setApenasVerificados(verificados === 'true'); // New state here
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
        
        const matchBusca = !buscaTexto || // Changed from busca
          anuncio.titulo?.toLowerCase().includes(buscaTexto.toLowerCase()) || // Changed from busca
          anuncio.profissional?.toLowerCase().includes(buscaTexto.toLowerCase()) || // Changed from busca
          anuncio.descricao?.toLowerCase().includes(buscaTexto.toLowerCase()) || // Changed from busca
          anuncio.horario_funcionamento?.toLowerCase().includes(buscaTexto.toLowerCase()) || // Changed from busca
          anuncio.procedimentos_servicos?.some(p => 
            p.toLowerCase().includes(buscaTexto.toLowerCase()) // Changed from busca
          ) ||
          anuncio.tags?.some(t => 
            t.toLowerCase().includes(buscaTexto.toLowerCase()) // Changed from busca
          );
        
        const matchCidade = !cidadeFiltro || 
          anuncio.cidade?.toLowerCase().includes(cidadeFiltro.toLowerCase());
        
        const matchEstado = !estadoFiltro ||
          anuncio.estado?.toLowerCase().includes(estadoFiltro.toLowerCase());

        // Changed from filtroFaixaPreco
        const matchFaixaPreco = faixaPrecoFiltro === "Todas" || anuncio.faixa_preco === faixaPrecoFiltro; 
        
        const matchTipoAnuncio = !filtroTipoAnuncio || anuncio.tipo_anuncio === filtroTipoAnuncio;
        const matchStatusFuncionamento = !filtroStatusFuncionamento || anuncio.status_funcionamento === filtroStatusFuncionamento;
        
        const matchVerificados = !apenasVerificados || anuncio.verificado; // New filter

        return matchCidade && matchEstado && matchProcedimento && matchTag && matchBusca && matchFaixaPreco && matchTipoAnuncio && matchStatusFuncionamento && matchVerificados; // Added matchVerificados
      })
      .sort((a, b) => {
        const planoA = planoOrdem[a.plano] || 0;
        const planoB = planoOrdem[b.plano] || 0;
        if (planoB !== planoA) {
          return planoB - planoA;
        }
        return new Date(b.created_date) - new Date(a.created_date);
      });
  }, [fetchedAnuncios, buscaTexto, procedimentoFiltro, tagFiltro, cidadeFiltro, estadoFiltro, faixaPrecoFiltro, filtroTipoAnuncio, filtroStatusFuncionamento, apenasVerificados]); // Added buscaTexto, apenasVerificados

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
    setCategoriaFiltro("Todas");
    setCidadeFiltro("");
    setEstadoFiltro("");
    setBuscaTexto(""); // Changed from setBusca
    setProcedimentoFiltro("");
    setTagFiltro(""); // Keep tagFiltro, though UI for it is removed, it might be set by URL
    setFaixaPrecoFiltro("Todas"); // Changed from setFiltroFaixaPreco
    setFiltroTipoAnuncio(""); // Kept, though UI for it is removed, it might be set by URL
    setFiltroStatusFuncionamento(""); // Kept, though UI for it is removed, it might be set by URL
    setApenasVerificados(false); // New
    setPaginaAtual(1);

    // Remover parâmetros da URL
    const url = new URL(window.location);
    url.search = '';
    window.history.pushState({}, '', url);
  };

  // Verificar se há algum filtro ativo
  const temFiltrosAtivos = 
    categoriaFiltro !== "Todas" ||
    cidadeFiltro !== "" ||
    estadoFiltro !== "" ||
    buscaTexto !== "" ||
    procedimentoFiltro !== "" ||
    tagFiltro !== "" || // Include tagFiltro
    filtroTipoAnuncio !== "" || // Include tipoAnuncio
    filtroStatusFuncionamento !== "" || // Include statusFuncionamento
    faixaPrecoFiltro !== "Todas" ||
    apenasVerificados;

  const getFaixaPrecoInfo = (faixa) => {
    const info = {
      "$": { texto: "Até R$ 500", emoji: "💚" },
      "$$": { texto: "R$ 500 - R$ 1.000", emoji: "💙" },
      "$$$": { texto: "R$ 1.000 - R$ 2.000", emoji: "💛" },
      "$$$$": { texto: "R$ 2.000 - R$ 5.000", emoji: "🧡" },
      "$$$$$": { texto: "Acima de R$ 5.000", emoji: "❤️" }
    };
    return info[faixa]; // Removed || info["$"] as "Todas" is now a valid value
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Encontre Profissionais de Estética
          </h1>
          <p className="text-gray-600">
            Explore os melhores profissionais de estética perto de você
          </p>
        </div>

        {/* Filtros */}
        <Card className="p-6 mb-8 shadow-lg border-none">
          <CardContent className="p-6"> {/* Original CardContent className was "p-6", but outline removes it, keeping it for consistency */}
            <div className="space-y-4">
              {/* Primeira linha de filtros */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="mb-2 block font-semibold">Buscar por nome ou palavra-chave</Label>
                  <Input
                    placeholder="Digite aqui..."
                    value={buscaTexto} // Changed from busca
                    onChange={(e) => {
                      setBuscaTexto(e.target.value); // Changed from setBusca
                      setPaginaAtual(1);
                    }}
                    className="w-full h-12"
                  />
                </div>

                <div>
                  <Label className="mb-2 block font-semibold">Categoria</Label>
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

                <div>
                  <Label className="mb-2 block font-semibold">Procedimento</Label>
                  <Input
                    placeholder="Ex: Botox, Preenchimento..."
                    value={procedimentoFiltro}
                    onChange={(e) => {
                      setProcedimentoFiltro(e.target.value);
                      setPaginaAtual(1);
                    }}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Segunda linha de filtros */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="mb-2 block font-semibold">Cidade</Label>
                  <Input
                    placeholder="Digite a cidade"
                    value={cidadeFiltro}
                    onChange={(e) => {
                      setCidadeFiltro(e.target.value);
                      setPaginaAtual(1);
                    }}
                    className="h-12"
                  />
                </div>

                <div>
                  <Label className="mb-2 block font-semibold">Estado</Label>
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
                      <SelectItem value={null}>Todos</SelectItem> {/* Changed from null */}
                      {estados.map((estado) => (
                        <SelectItem key={estado} value={estado}>{estado}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block font-semibold">Faixa de Preço</Label>
                  <Select
                    value={faixaPrecoFiltro} // Changed from filtroFaixaPreco
                    onValueChange={(value) => {
                      setFaixaPrecoFiltro(value); // Changed from setFiltroFaixaPreco
                      setPaginaAtual(1);
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Faixa de Preço" />
                    </SelectTrigger>
                    <SelectContent>
                      {faixasPreco.map((faixa) => (
                        <SelectItem key={faixa} value={faixa}>
                          {faixa === "Todas" ? "Todas as faixas" : getFaixaPrecoInfo(faixa) ? `${getFaixaPrecoInfo(faixa).emoji} ${faixa} - ${getFaixaPrecoInfo(faixa).texto}` : faixa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-2 block font-semibold">Verificação</Label>
                  <label className="flex items-center gap-2 mt-2 cursor-pointer h-12">
                    <input
                      type="checkbox"
                      checked={apenasVerificados}
                      onChange={(e) => {
                        setApenasVerificados(e.target.checked);
                        setPaginaAtual(1);
                      }}
                      className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                    />
                    <span className="text-sm text-gray-700">Apenas verificados</span>
                  </label>
                </div>
              </div>

              {/* Botão Limpar Filtros */}
              {temFiltrosAtivos && (
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={limparFiltros}
                    variant="outline"
                    className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Existing Localização e Ordenação - Retained for now, though structure changed */}
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

        {/* Badges e Botão de Limpar Filtros (Old section - removing or updating this based on new filter UI) */}
        {/* Original badges section is completely replaced by new filter UI and temFiltrosAtivos logic above */}

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

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="h-96 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : anuncios.length === 0 ? (
          <Card className="p-12 text-center mt-8">
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
              ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8" 
              : "space-y-4 mt-8"
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

      {/* Modal de Seletor de Procedimentos (Still relevant if we keep the simple input and want a picker) */}
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
