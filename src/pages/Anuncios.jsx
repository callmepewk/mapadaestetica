
import React, { useState, useEffect } from "react";
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
import { Search, Filter, MapPin, Grid, List } from "lucide-react";
import { Card } from "@/components/ui/card";
import CardAnuncio from "../components/anuncios/CardAnuncio";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge"; // Added Badge import

const categorias = [
  "Todas",
  "Depilação", "Estética Facial", "Estética Corporal", "Massoterapia",
  "Drenagem Linfática", "Micropigmentação", "Design de Sobrancelhas",
  "Extensão de Cílios", "Manicure e Pedicure", "Podologia",
  "Harmonização Facial", "Maquiagem", "Outros"
];

const ITEMS_PER_PAGE = 10;

export default function Anuncios() {
  const [busca, setBusca] = useState("");
  const [cidadeFiltro, setCidadeFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState(""); // New state
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [procedimentoFiltro, setProcedimentoFiltro] = useState(""); // New state
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cidade = urlParams.get('cidade');
    const estado = urlParams.get('estado'); // New param
    const categoria = urlParams.get('categoria');
    const procedimento = urlParams.get('procedimento'); // New param
    
    if (cidade) setCidadeFiltro(cidade);
    if (estado) setEstadoFiltro(estado); // Set new state
    if (categoria) setCategoriaFiltro(categoria);
    if (procedimento) setProcedimentoFiltro(procedimento); // Set new state
  }, []);

  const { data: anuncios, isLoading } = useQuery({
    queryKey: ['anuncios', categoriaFiltro, cidadeFiltro, estadoFiltro, procedimentoFiltro, busca], // Added new filters
    queryFn: async () => {
      let filtros = { status: 'ativo' };
      
      if (categoriaFiltro && categoriaFiltro !== "Todas") {
        filtros.categoria = categoriaFiltro;
      }
      
      // Priorizar planos premium e avançado
      let ordem = '-plano,-created_date'; // Changed sort order
      
      const todosAnuncios = await base44.entities.Anuncio.filter(filtros, ordem);
      
      return todosAnuncios.filter(anuncio => {
        const matchCidade = !cidadeFiltro || 
          anuncio.cidade?.toLowerCase().includes(cidadeFiltro.toLowerCase());
        
        const matchEstado = !estadoFiltro || // New filter logic
          anuncio.estado?.toLowerCase().includes(estadoFiltro.toLowerCase());
        
        const matchProcedimento = !procedimentoFiltro || // New filter logic
          anuncio.procedimentos_servicos?.some(p => 
            p.toLowerCase().includes(procedimentoFiltro.toLowerCase())
          ) ||
          anuncio.titulo?.toLowerCase().includes(procedimentoFiltro.toLowerCase()) ||
          anuncio.descricao?.toLowerCase().includes(procedimentoFiltro.toLowerCase());
        
        const matchBusca = !busca || 
          anuncio.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
          anuncio.profissional?.toLowerCase().includes(busca.toLowerCase()) ||
          anuncio.descricao?.toLowerCase().includes(busca.toLowerCase()) ||
          anuncio.procedimentos_servicos?.some(p => // Added to search
            p.toLowerCase().includes(busca.toLowerCase())
          );
        
        return matchCidade && matchEstado && matchProcedimento && matchBusca; // Combined all filter conditions
      });
    },
    initialData: [],
  });

  const totalPaginas = Math.ceil(anuncios.length / ITEMS_PER_PAGE);
  const anunciosPaginados = anuncios.slice(
    (paginaAtual - 1) * ITEMS_PER_PAGE,
    paginaAtual * ITEMS_PER_PAGE
  );

  const handlePaginaChange = (novaPagina) => {
    setPaginaAtual(novaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Encontre Profissionais de Estética
          </h1>
          <p className="text-gray-600">
            {anuncios.length} profissionais encontrados
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-8 shadow-lg border-none">
          <div className="grid md:grid-cols-5 gap-4"> {/* Changed to 5 columns */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, profissional, procedimento..." {/* Updated placeholder */}
                  value={busca}
                  onChange={(e) => {
                    setBusca(e.target.value);
                    setPaginaAtual(1);
                  }}
                  className="pl-10 h-12"
                />
              </div>
            </div>

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

            <div> {/* New input for Estado */}
              <Input
                placeholder="Estado (UF)"
                value={estadoFiltro}
                onChange={(e) => {
                  setEstadoFiltro(e.target.value);
                  setPaginaAtual(1);
                }}
                className="h-12"
                maxLength={2}
              />
            </div>

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

          <div className="grid md:grid-cols-2 gap-4 mt-4"> {/* New section for procedimento filter */}
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10" />
              <Input
                placeholder="Buscar por procedimento específico (ex: Botox, Peeling...)"
                value={procedimentoFiltro}
                onChange={(e) => {
                  setProcedimentoFiltro(e.target.value);
                  setPaginaAtual(1);
                }}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {anuncios.length} resultado{anuncios.length !== 1 ? 's' : ''}
              </span>
              {procedimentoFiltro && ( // Display badge if procedimento filter is active
                <Badge className="bg-purple-100 text-purple-800">
                  Procedimento: {procedimentoFiltro}
                </Badge>
              )}
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
        </Card>

        {/* Results */}
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

            {/* Pagination */}
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
    </div>
  );
}
