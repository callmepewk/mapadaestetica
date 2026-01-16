import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BannerRotativo({ posicao = "home_topo" }) {
  const [indiceAtivo, setIndiceAtivo] = useState(0);
  const [tempoVisualizacao, setTempoVisualizacao] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [bannerFechado, setBannerFechado] = useState(false);
  const [bannersVistosHoje, setBannersVistosHoje] = useState([]);
  const intervaloRef = useRef(null);
  const startTimeRef = useRef(null);

  const { data: banners = [] } = useQuery({
    queryKey: ['banners-ativos', posicao],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const mesAtual = new Date().toISOString().substring(0, 7);
      
      const bannersAtivos = await base44.entities.Banner.filter({
        status: 'ativo',
        posicao: posicao,
        data_inicio: { $lte: hoje }
      }, '-prioridade', 50);
      
      // Filtrar por data fim, dias de exibição no mês, e frequência
      const bannersFiltrados = [];
      
      for (const banner of bannersAtivos) {
        // Verificar data fim
        if (banner.data_fim && banner.data_fim < hoje) continue;
        
        // Resetar contador se mudou de mês
        if (banner.mes_referencia !== mesAtual) {
          await base44.entities.Banner.update(banner.id, {
            mes_referencia: mesAtual,
            dias_exibidos_mes_atual: 0
          });
          banner.dias_exibidos_mes_atual = 0;
        }
        
        // Verificar se ainda tem dias disponíveis no mês
        if (banner.dias_exibidos_mes_atual >= banner.dias_exibicao_mes) continue;
        
        bannersFiltrados.push(banner);
      }
      
      return bannersFiltrados;
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });

  // Verificar banners vistos hoje (localStorage)
  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(`banners_vistos_${hoje}`);
    if (stored) {
      setBannersVistosHoje(JSON.parse(stored));
    }
  }, []);

  // Filtrar por frequência
  const bannersVisiveis = banners.filter(banner => {
    if (banner.frequencia_exibicao === 'uma_vez_por_dia') {
      return !bannersVistosHoje.includes(banner.id);
    }
    return true;
  });

  // Auto-rotação com tempo configurável por banner
  useEffect(() => {
    if (bannersVisiveis.length <= 1 || bannerFechado) return;

    const bannerAtual = bannersVisiveis[indiceAtivo];
    const tempoExibicao = (bannerAtual?.tempo_exibicao_segundos || 5) * 1000;

    startTimeRef.current = Date.now();
    
    // Atualizar progresso
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setProgresso((elapsed / tempoExibicao) * 100);
    }, 50);

    // Rotacionar banner
    const timeout = setTimeout(() => {
      handleProximoBanner();
    }, tempoExibicao);

    return () => {
      clearTimeout(timeout);
      clearInterval(progressInterval);
    };
  }, [indiceAtivo, bannersVisiveis.length, bannerFechado]);

  const handleProximoBanner = () => {
    setIndiceAtivo((prev) => (prev + 1) % bannersVisiveis.length);
    setProgresso(0);
  };

  const handleAnteriorBanner = () => {
    setIndiceAtivo((prev) => (prev - 1 + bannersVisiveis.length) % bannersVisiveis.length);
    setProgresso(0);
  };

  const handlePularBanner = async () => {
    const bannerAtual = bannersVisiveis[indiceAtivo];
    if (bannerAtual) {
      try {
        await base44.entities.Banner.update(bannerAtual.id, {
          metricas: {
            ...bannerAtual.metricas,
            banners_pulados: (bannerAtual.metricas?.banners_pulados || 0) + 1
          }
        });
      } catch (error) {
        console.error("Erro ao registrar pulo:", error);
      }
    }
    handleProximoBanner();
  };

  const handleFecharBanner = async () => {
    const bannerAtual = bannersVisiveis[indiceAtivo];
    if (bannerAtual) {
      try {
        await base44.entities.Banner.update(bannerAtual.id, {
          metricas: {
            ...bannerAtual.metricas,
            banners_fechados: (bannerAtual.metricas?.banners_fechados || 0) + 1
          }
        });
      } catch (error) {
        console.error("Erro ao registrar fechamento:", error);
      }
    }
    setBannerFechado(true);
  };

  // Incrementar visualização quando banner muda
  useEffect(() => {
    if (bannersVisiveis.length === 0 || !bannersVisiveis[indiceAtivo] || bannerFechado) return;

    const incrementarVisualizacao = async () => {
      try {
        const banner = bannersVisiveis[indiceAtivo];
        
        // Marcar como visto hoje
        const hoje = new Date().toISOString().split('T')[0];
        const novosVistos = [...bannersVistosHoje, banner.id];
        setBannersVistosHoje(novosVistos);
        localStorage.setItem(`banners_vistos_${hoje}`, JSON.stringify(novosVistos));
        
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
  }, [indiceAtivo, bannersVisiveis.length, bannerFechado]);

  const handleClique = async (banner) => {
    try {
      await base44.entities.Banner.update(banner.id, {
        metricas: {
          ...banner.metricas,
          cliques: (banner.metricas?.cliques || 0) + 1
        }
      });

      if (banner.links && banner.links.length > 0) {
        window.open(banner.links[0].url, '_blank');
      }
    } catch (error) {
      console.error("Erro ao registrar clique:", error);
    }
  };

  const bannerAtual = bannersVisiveis[indiceAtivo];

  if (!bannersVisiveis || bannersVisiveis.length === 0 || bannerFechado) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 mb-4 sm:mb-6 md:mb-8">
      <Card className="overflow-hidden border-none shadow-xl relative">
        {/* Botão Fechar - SEMPRE DISPONÍVEL */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-1 right-1 sm:top-2 sm:right-2 z-20 bg-white/90 hover:bg-white w-7 h-7 sm:w-8 sm:h-8 rounded-full shadow-lg"
          onClick={handleFecharBanner}
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>

        {/* Barra de Progresso */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 z-10">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-100"
            style={{ width: `${progresso}%` }}
          />
        </div>

        <div className="relative group">
          <div 
            onClick={() => handleClique(bannerAtual)}
            className="cursor-pointer relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200"
          >
            <div className="overflow-x-auto">
              <img
                src={bannerAtual.imagem_banner}
                alt={bannerAtual.titulo}
                className="max-w-none h-[260px] sm:h-[300px] md:h-[360px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            
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

            {bannerAtual.logo_empresa && (
              <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 md:p-3 rounded-lg">
                <img
                  src={bannerAtual.logo_empresa}
                  alt={bannerAtual.nome_empresa}
                  className="h-6 sm:h-8 md:h-12 w-auto"
                />
              </div>
            )}

            <Badge className="absolute top-2 right-10 sm:top-4 sm:right-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs">
              {bannerAtual.plano_patrocinador.toUpperCase()}
            </Badge>
          </div>

          {/* Navegação Manual - SEMPRE DISPONÍVEL */}
          {bannersVisiveis.length > 1 && (
            <>
              <Button
                size="icon"
                variant="ghost"
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnteriorBanner();
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
                  handlePularBanner();
                }}
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
              </Button>

              {/* Indicadores */}
              <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2">
                {bannersVisiveis.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndiceAtivo(index);
                      setProgresso(0);
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

        {/* Links e Info - MOBILE OPTIMIZED */}
        {bannerAtual.links && bannerAtual.links.length > 0 && (
          <div className="p-3 sm:p-4 bg-gray-50 border-t">
            <div className="flex flex-wrap gap-2">
              {bannerAtual.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async () => {
                    try {
                      await base44.entities.Banner.update(bannerAtual.id, {
                        metricas: {
                          ...bannerAtual.metricas,
                          cliques: (bannerAtual.metricas?.cliques || 0) + 1
                        }
                      });
                    } catch (error) {
                      console.error("Erro ao registrar clique no link:", error);
                    }
                  }}
                  className="text-xs sm:text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1 hover:underline"
                >
                  {link.titulo}
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
            
            {/* Indicador de tempo restante */}
            <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
              <span>
                {bannersVisiveis.length > 1 ? `${indiceAtivo + 1} de ${bannersVisiveis.length}` : ''}
              </span>
              <span className="flex items-center gap-1">
                ⏱️ {Math.max(0, (bannerAtual.tempo_exibicao_segundos || 5) - Math.floor(progresso / 20))}s
              </span>
            </div>
          </div>
        )}

        {/* Dica para usuário */}
        <div className="px-3 sm:px-4 py-2 bg-purple-50 border-t text-xs text-center text-purple-700">
          💡 Use as setas {bannersVisiveis.length > 1 && '← →'} para navegar ou {bannerAtual.pode_fechar && 'clique no X para fechar'}
        </div>
      </Card>
    </div>
  );
}