import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SponsorPopup({ user }) {
  const [banners, setBanners] = useState([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const checkAndLoad = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) return; // visitantes não veem
        const today = new Date().toISOString().slice(0, 10);
        const key = `sponsor_popup_last_${today}`;
        if (localStorage.getItem(key)) return; // já visto hoje

        const list = await base44.entities.Banner.filter({ status: "ativo" }, "-created_date", 100);
        const now = new Date();
        const eligible = (list || []).filter((b) => {
          const created = new Date(b.created_date || b.created_at || now);
          const days = Math.floor((now - created) / (1000 * 60 * 60 * 24));
          const plano = (b.plano_patrocinador || "").toLowerCase();
          if (plano === "cobre") return days < 30; // 30 dias
          if (plano === "diamante") return days < 60; // 60 dias
          return false; // apenas cobre/diamante
        });

        // Embaralhar e limitar a 5 por exibição
        for (let i = eligible.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
        }
        const sliced = eligible.slice(0, 5);
        if (sliced.length) {
          setBanners(sliced);
          setOpen(true);
          localStorage.setItem(key, "1");
        }
      } catch {}
    };
    checkAndLoad();
  }, []);

  const current = banners[index] || null;
  if (!open || !current) return null;

  const next = () => setIndex((i) => (i + 1) % banners.length);
  const prev = () => setIndex((i) => (i - 1 + banners.length) % banners.length);

  return (
    <div className="fixed inset-0 z-[4000] bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white shadow" onClick={() => setOpen(false)} aria-label="Fechar">
          <X className="w-5 h-5" />
        </button>

        <div className="relative">
          {current?.imagem_banner || current?.imagem_url ? (
            <img src={current.imagem_banner || current.imagem_url} alt={current.titulo || "Banner"} className="w-full h-72 object-cover" />
          ) : (
            <div className="w-full h-72 bg-gray-100 flex items-center justify-center text-gray-500">Sem imagem</div>
          )}
          {banners.length > 1 && (
            <>
              <button className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow" onClick={prev} aria-label="Anterior">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 hover:bg-white shadow" onClick={next} aria-label="Próximo">
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Patrocinador</p>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{current.titulo || current.nome_empresa || "Patrocinador"}</h3>
            </div>
            {current.link_redirecionamento && (
              <Button asChild className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C]">
                <a href={current.link_redirecionamento} target="_blank" rel="noopener noreferrer">Visitar</a>
              </Button>
            )}
          </div>
          {banners.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1">
              {banners.map((_, i) => (
                <span key={i} className={`w-2 h-2 rounded-full ${i === index ? "bg-gray-800" : "bg-gray-300"}`}></span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}