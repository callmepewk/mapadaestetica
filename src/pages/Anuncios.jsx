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
import { Search, Filter, MapPin, Grid, List, Locate } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("Todas");
  const [procedimentoFiltro, setProcedimentoFiltro] = useState("");
  const [tagFiltro, setTagFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const [localizando, setLocalizando] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const cidade = urlParams.get('cidade');
    const estado = urlParams.get('estado');
    const categoria = urlParams.get('categoria');
    const procedimento = urlParams.get('procedimento');
    const tag = urlParams.get('tag');
    
    if (cidade) setCidadeFiltro(cidade);
    if (estado) setEstadoFiltro(estado);
    if (categoria) setCategoriaFiltro(categoria);
    if (procedimento) setProcedimentoFiltro(procedimento);
    if (tag) setTagFiltro(tag);
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
          alert("Erro ao obter localização. Tente novamente.");
        } finally {
          setLocalizando(false);
        }
      },
      (error) => {
        alert("Não foi possível obter sua localização. Verifique as permissões.");
        setLocalizando(false);
      }
    );
  };

  const { data: anuncios, isLoading } = useQuery({
    queryKey: ['anuncios', categoriaFiltro, cidadeFiltro, estadoFiltro, procedimentoFiltro, tagFiltro, busca],
    queryFn: async () => {
      let filtros = { status: 'ativo' };
      
      if (categoriaFiltro && categoriaFiltro !== "Todas") {
        filtros.categoria = categoriaFiltro;
      }
      
      const todosAnuncios = await base44.entities.Anuncio.filter(filtros, '-created_date');
      
      const planoOrdem = { 'premium': 4, 'avancado': 3, 'intermediario': 2, 'basico': 1 };
      
      return todosAnuncios
        .filter(anuncio => {
          const matchCidade = !cidadeFiltro || 
            anuncio.cidade?.toLowerCase().includes(cidadeFiltro.toLowerCase());
          
          const matchEstado = !estadoFiltro ||
            anuncio.estado?.toLowerCase().includes(estadoFiltro.toLowerCase());
          
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
            anuncio.procedimentos_servicos?.some(p => 
              p.toLowerCase().includes(busca.toLowerCase())
            ) ||
            anuncio.tags?.some(t => 
              t.toLowerCase().includes(busca.toLowerCase())
            );
          
          return matchCidade && matchEstado && matchProcedimento && matchTag && matchBusca;
        })
        .sort((a, b) => {
          const planoA = planoOrdem[a.plano] || 0;
          const planoB = planoOrdem[b.plano] || 0;
          if (planoB !== planoA) {
            return planoB - planoA;
          }
          return new Date(b.created_date) - new Date(a.created_date);
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
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Encontre Profissionais de Estética
          </h1>
          <p className="text-gray-600">
            {anuncios.length} profissionais encontrados
          </p>
        </div>

        <Card className="p-6 mb-8 shadow-lg border-none">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, profissional, procedimento..."
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

            <div>
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

          <div className="grid md:grid-cols-2 gap-4 mt-4">
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
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400 z-10" />
              <Input
                placeholder="Buscar por tag (ex: #microagulhamento #peeling)"
                value={tagFiltro}
                onChange={(e) => {
                  setTagFiltro(e.target.value);
                  setPaginaAtual(1);
                }}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              onClick={usarMinhaLocalizacao}
              disabled={localizando}
              variant="outline"
              className="w-full md:w-auto"
            >
              <Locate className="w-4 h-4 mr-2" />
              {localizando ? "Localizando..." : "Usar Minha Localização"}
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {anuncios.length} resultado{anuncios.length !== 1 ? 's' : ''}
              </span>
              {procedimentoFiltro && (
                <Badge className="bg-purple-100 text-purple-800">
                  Procedimento: {procedimentoFiltro}
                </Badge>
              )}
              {tagFiltro && (
                <Badge className="bg-blue-100 text-blue-800">
                  Tag: {tagFiltro}
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
    </div>
  );
}