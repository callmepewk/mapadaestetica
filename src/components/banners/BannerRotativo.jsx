import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BannerRotativo({ posicao = "home_topo" }) {
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [tempoVisualizacao, setTempoVisualizacao] = useState(0);

  const { data: banners = [] } = useQuery({
    queryKey: ['banners-ativos', posicao],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const bannersAtivos = await base44.entities.Banner.filter({
        status: 'ativo',
        posicao: posicao,
        data_inicio: { $lte: hoje }
      }, '-prioridade', 20);
      
      return bannersAtivos.filter(b => !b.data_fim || b.data_fim >= hoje);
    },
    staleTime: 5 * 60 * 1000,
  });

  // Auto-rotação dos banners
  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setIndiceAtivo((prev) => (prev + 1) % banners.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // Rastrear tempo de visualização
  useEffect(() => {
    if (banners.length === 0) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      setTempoVisualizacao(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => {
      clearInterval(interval);
      // Atualizar métrica de tempo de visualização
      if (banners[indiceAtivo]) {
        try {
          const banner = banners[indiceAtivo];
          const novoTempo = Math.floor((Date.now() - startTime) / 1000);
          const mediaAtual = banner.metricas?.tempo_medio_visualizacao || 0;
          const views = banner.metricas?.visualizacoes || 0;
          const novaMedia = views > 0 ? (mediaAtual * views + novoTempo) / (views + 1) : novoTempo;
          
          base44.entities.Banner.update(banner.id, {
            metricas: {
              ...banner.metricas,
              tempo_medio_visualizacao: Math.floor(novaMedia)
            }
          });
        } catch (error) {
          console.error("Erro ao atualizar tempo de visualização:", error);
        }
      }
    };
  }, [indiceAtivo, banners]);

  // Incrementar visualização quando banner muda
  useEffect(() => {
    if (banners.length === 0 || !banners[indiceAtivo]) return;

    const incrementarVisualizacao = async () => {
      try {
        const banner = banners[indiceAtivo];
        await base44.entities.Banner.update(banner.id, {
          metricas: {
            ...banner.metricas,
            visualizacoes: (banner.metricas?.visualizacoes || 0) + 1
          }
        });
      } catch (error) {
        console.error("Erro ao incrementar visualização:", error);
      }
    };

    incrementarVisualizacao();
  }, [indiceAtivo, banners]);

  const handleClique = async (banner) => {
    try {
      await base44.entities.Banner.update(banner.id, {
        metricas: {
          ...banner.metricas,
          cliques: (banner.metricas?.cliques || 0) + 1
        }
      });

      // Abrir link principal se existir
      if (banner.links && banner.links.length > 0) {
        window.open(banner.links[0].url, '_blank');
      }
    } catch (error) {
      console.error("Erro ao registrar clique:", error);
    }
  };

  const bannerAtual = banners[indiceAtivo];

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 mb-4 sm:mb-6 md:mb-8">
      <Card className="overflow-hidden border-none shadow-xl">
        <div className="relative group">
          {/* Banner Image */}
          <div 
            onClick={() => handleClique(bannerAtual)}
            className="cursor-pointer relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200"
          >
            <img
              src={bannerAtual.imagem_banner}
              alt={bannerAtual.titulo}
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            
            {/* Overlay com info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 sm:p-4 md:p-6">
              <div className="text-white w-full">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm sm:text-base md:text-lg lg:text-xl mb-1 truncate">
                      {bannerAtual.titulo}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90 line-clamp-2">
                      {bannerAtual.descricao}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ml-2 flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Logo da empresa */}
            {bannerAtual.logo_empresa && (
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 md:p-3 rounded-lg">
                <img
                  src={bannerAtual.logo_empresa}
                  alt={bannerAtual.nome_empresa}
                  className="h-6 sm:h-8 md:h-12 w-auto"
                />
              </div>
            )}

            {/* Badge do plano */}
            <Badge className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
              {bannerAtual.plano_patrocinador.toUpperCase()}
            </Badge>
          </div>

          {/* Navegação - apenas se houver múltiplos banners */}
          {banners.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndiceAtivo((prev) => (prev - 1 + banners.length) % banners.length);
                }}
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIndiceAtivo((prev) => (prev + 1) % banners.length);
                }}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Button>

              {/* Indicadores */}
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndiceAtivo(index);
                    }}
                    className={`transition-all rounded-full ${
                      indiceAtivo === index 
                        ? "bg-white w-6 sm:w-8 h-1.5 sm:h-2" 
                        : "bg-white/50 w-1.5 sm:w-2 h-1.5 sm:h-2"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Links da empresa - MOBILE OPTIMIZED */}
        {bannerAtual.links && bannerAtual.links.length > 0 && (
          <div className="p-3 sm:p-4 bg-gray-50 border-t">
            <div className="flex flex-wrap gap-2">
              {bannerAtual.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 hover:underline"
                >
                  {link.titulo}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}