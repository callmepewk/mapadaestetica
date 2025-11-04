
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar, Clock, TrendingUp, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Blog() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [artigos, setArtigos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [carregouInicial, setCarregouInicial] = useState(false);

  const buscarArtigos = async () => {
    setCarregando(true);
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Crie exatamente 6 artigos sobre estética, beleza, cuidados com a pele e tratamentos estéticos.
        
        Para cada artigo, forneça:
        - titulo: título atraente e profissional
        - resumo: resumo de 2-3 linhas  
        - categoria: uma das categorias (Estética Facial, Estética Corporal, Cuidados com a Pele, Tratamentos, Tendências, Novidades)
        - data: data atual no formato dd/MM/yyyy
        - tempo_leitura: número entre 3 e 8 minutos
        - conteudo: texto completo com 5-6 parágrafos detalhados sobre o tema, com informações úteis e profissionais
        
        IMPORTANTE: Retorne exatamente este formato JSON:
        {
          "artigos": [
            {
              "titulo": "string",
              "resumo": "string", 
              "categoria": "string",
              "data": "string",
              "tempo_leitura": number,
              "conteudo": "string"
            }
          ]
        }`,
        response_json_schema: {
          type: "object",
          properties: {
            artigos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  titulo: { type: "string" },
                  resumo: { type: "string" },
                  categoria: { type: "string" },
                  data: { type: "string" },
                  tempo_leitura: { type: "number" },
                  conteudo: { type: "string" }
                },
                required: ["titulo", "resumo", "categoria", "data", "tempo_leitura", "conteudo"]
              }
            }
          },
          required: ["artigos"]
        }
      });
      
      setArtigos(resultado.artigos || []);
      setCarregouInicial(true);
    } catch (error) {
      console.error("Erro ao buscar artigos:", error);
      setArtigos([
        {
          titulo: "Tendências em Harmonização Facial para 2025",
          resumo: "Descubra as principais tendências de harmonização facial que estão dominando o mercado de estética.",
          categoria: "Harmonização Facial",
          data: "03/01/2025",
          tempo_leitura: 5,
          conteudo: "A harmonização facial continua em alta, mas com uma abordagem mais natural. Os procedimentos minimamente invasivos estão ganhando cada vez mais espaço, priorizando resultados sutis que respeitam as características únicas de cada rosto.\n\nOs preenchimentos com ácido hialurônico continuam sendo os queridinhos, mas agora com técnicas mais refinadas. O foco está em restaurar volumes perdidos de forma estratégica, criando um aspecto rejuvenescido sem parecer artificial.\n\nA toxina botulínica também evoluiu. Além do tratamento tradicional de rugas, agora é usada para lifting de sobrancelhas, redução de sorriso gengival e até para afinar o rosto através da aplicação no músculo masseter.\n\nOs fios de sustentação PDO estão revolucionando o rejuvenescimento. Eles proporcionam lifting imediato e estimulam a produção de colágeno, com resultados que duram até 18 meses.\n\nA tecnologia também trouxe inovações como ultrassom microfocado e radiofrequência fracionada, que complementam os procedimentos injetáveis oferecendo firmeza e melhora da textura da pele sem cirurgia."
        }
      ]);
      setCarregouInicial(true);
    }
    setCarregando(false);
  };

  useEffect(() => {
    if (!carregouInicial) {
      buscarArtigos();
    }
  }, [carregouInicial]);

  const artigosFiltrados = artigos.filter(artigo =>
    !busca || 
    artigo.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    artigo.resumo?.toLowerCase().includes(busca.toLowerCase())
  );

  const getCategoriaColor = (categoria) => {
    const colors = {
      "Estética Facial": "bg-purple-100 text-purple-800",
      "Estética Corporal": "bg-blue-100 text-blue-800",
      "Cuidados com a Pele": "bg-green-100 text-green-800",
      "Tratamentos": "bg-pink-100 text-pink-800",
      "Tendências": "bg-orange-100 text-orange-800",
      "Novidades": "bg-red-100 text-red-800",
      "Harmonização Facial": "bg-violet-100 text-violet-800"
    };
    return colors[categoria] || "bg-gray-100 text-gray-800";
  };

  const handleArtigoClick = (artigo) => {
    localStorage.setItem('artigo_selecionado', JSON.stringify(artigo));
    navigate(createPageUrl("ArtigoBlog"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Atualizado diariamente</span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 px-4">
            Fique por Dentro do Universo da Estética
          </h1>
          <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Acompanhe as últimas tendências, novidades e dicas do mundo da estética e beleza
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8 md:mb-12 px-4">
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar artigos..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-12 h-12 md:h-14 text-base md:text-lg shadow-lg border-none"
            />
          </div>
        </div>

        {/* Featured Section */}
        {!carregando && artigos.length > 0 && (
          <div className="mb-8 md:mb-12 px-4">
            <Card 
              className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-white cursor-pointer hover:shadow-3xl transition-shadow"
              onClick={() => handleArtigoClick(artigos[0])}
            >
              <CardContent className="p-6 md:p-12">
                <Badge className="mb-4 bg-white/20 text-white border-none">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Artigo em Destaque
                </Badge>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                  {artigos[0].titulo}
                </h2>
                <p className="text-base md:text-lg text-white/90 mb-6">
                  {artigos[0].resumo}
                </p>
                <div className="flex items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {artigos[0].data}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {artigos[0].tempo_leitura} min de leitura
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Articles Grid */}
        {carregando ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : artigosFiltrados.length === 0 ? (
          <Card className="p-12 text-center mx-4">
            <div className="text-6xl mb-4">📰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum artigo encontrado
            </h3>
            <p className="text-gray-600">
              Tente ajustar sua busca ou volte mais tarde para novos conteúdos
            </p>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
            {artigosFiltrados.map((artigo, index) => (
              <Card
                key={index}
                onClick={() => handleArtigoClick(artigo)}
                className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none cursor-pointer group"
              >
                <div className="h-48 bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">
                  ✨
                </div>
                <CardContent className="p-4 md:p-6">
                  <Badge className={`mb-3 ${getCategoriaColor(artigo.categoria)}`}>
                    {artigo.categoria}
                  </Badge>
                  <h3 className="font-bold text-lg md:text-xl mb-3 line-clamp-2 group-hover:text-pink-600 transition-colors">
                    {artigo.titulo}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {artigo.resumo}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 pt-4 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {artigo.data}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {artigo.tempo_leitura} min
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Reload Button */}
        <div className="text-center mt-8 md:mt-12 px-4">
          <Button
            onClick={buscarArtigos}
            disabled={carregando}
            size="lg"
            className="w-full sm:w-auto bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
          >
            {carregando ? "Carregando..." : "Atualizar Artigos"}
          </Button>
        </div>
      </div>
    </div>
  );
}
