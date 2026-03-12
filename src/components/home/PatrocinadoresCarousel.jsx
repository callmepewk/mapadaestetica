import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PatrocinadoresCarousel() {
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["patrocinadores-ativos"],
    queryFn: async () => base44.entities.Banner.filter({ status: "ativo" }, "-created_date", 48),
    staleTime: 0,
  });

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const itemsPerView = useResponsiveItemsPerView();
  const totalSlides = Math.max(1, Math.ceil((banners?.length || 0) / itemsPerView));

  // Avanço automático a cada 3s, pausa ao interagir/abrir modal
  useEffect(() => {
    if (!banners?.length || paused || open) return;
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % totalSlides);
    }, 3000);
    return () => clearInterval(t);
  }, [banners?.length, paused, open, totalSlides]);

  const visible = useMemo(() => {
    if (!banners?.length) return [];
    const start = index * itemsPerView;
    const arr = [];
    for (let i = 0; i < itemsPerView; i++) {
      arr.push(banners[(start + i) % banners.length]);
    }
    return arr;
  }, [banners, index, itemsPerView]);

  if (isLoading) {
    return (
      <div className="relative">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="aspect-square bg-gray-100 animate-pulse" />
            ))}
        </div>
      </div>
    );
  }

  if (!banners?.length) {
    return <p className="text-gray-600 text-center py-6">Sem patrocinadores ativos no momento.</p>;
  }

  const handlePrev = () => setIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  const handleNext = () => setIndex((prev) => (prev + 1) % totalSlides);

  return (
    <div className="relative" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {visible.map((b, i) => (
          <button
            key={(b?.id || "idx") + i}
            onClick={() => {
              setSelected(b);
              setOpen(true);
            }}
            className="text-left"
          >
            <Card className="group relative aspect-square overflow-hidden bg-white hover:shadow-2xl transition-all border">
              {b?.imagem_banner || b?.logo_empresa ? (
                <img src={b.imagem_banner || b.logo_empresa} alt={b.nome_empresa || b.titulo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🎯</div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                <p className="text-xs font-semibold truncate">{b?.nome_empresa || b?.titulo}</p>
                {b?.descricao && <p className="text-[10px] opacity-90 line-clamp-2">{b.descricao}</p>}
                <div className="mt-2">
                  <Button size="sm" variant="secondary" className="bg-white/90 text-black hover:bg-white" onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); const url = b?.links?.[0]?.url || b?.site; if (url) window.open(url, '_blank'); }}>
                    Saiba mais
                  </Button>
                </div>
              </div>
              {b?.plano_patrocinador && (
                <Badge className="absolute top-2 right-2 bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]">
                  {String(b.plano_patrocinador).toUpperCase()}
                </Badge>
              )}
            </Card>
          </button>
        ))}
      </div>

      {/* Controles */}
      {banners.length > itemsPerView && (
        <>
          <Button size="icon" variant="ghost" className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow w-8 h-8" onClick={handlePrev}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow w-8 h-8" onClick={handleNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      {/* Dialog de detalhes */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.nome_empresa || selected.titulo}
                  {selected.plano_patrocinador && (
                    <Badge className="ml-2">{String(selected.plano_patrocinador).toUpperCase()}</Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {selected.logo_empresa && (
                  <img src={selected.logo_empresa} alt="logo" className="h-16 object-contain" />
                )}
                {selected.descricao && <p className="text-sm text-gray-700">{selected.descricao}</p>}
                {selected.links && selected.links.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Contatos e Links:</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.links.map((l, i) => (
                        <Button key={i} size="sm" variant="outline" onClick={() => window.open(l.url, "_blank")}>
                          {l.titulo || l.tipo}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function useResponsiveItemsPerView() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  if (w >= 1024) return 6; // lg+
  if (w >= 768) return 4;  // md
  return 2;                 // sm
}