import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const REGIONS = [
  { id: "Norte", label: "Norte", grid: "col-span-2" },
  { id: "Nordeste", label: "Nordeste", grid: "" },
  { id: "Centro-Oeste", label: "Centro-Oeste", grid: "" },
  { id: "Sudeste", label: "Sudeste", grid: "" },
  { id: "Sul", label: "Sul", grid: "col-start-3" },
];

export default function BrazilRegionHeatmap({ data = {}, onSelect }) {
  const values = REGIONS.map(r => data[r.id] || 0);
  const max = Math.max(1, ...values);
  const color = (v) => {
    const n = v / max; // 0..1
    if (n === 0) return "bg-gray-100 text-gray-500";
    if (n < 0.2) return "bg-emerald-50 text-emerald-800";
    if (n < 0.4) return "bg-emerald-100 text-emerald-900";
    if (n < 0.6) return "bg-emerald-200 text-emerald-900";
    if (n < 0.8) return "bg-emerald-300 text-emerald-900";
    return "bg-emerald-400 text-emerald-950";
  };

  return (
    <Card className="border-2 border-emerald-200">
      <CardContent className="p-4 space-y-3">
        <div className="text-emerald-900 font-semibold">Mapa por Região (24h)</div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-xl">
          {REGIONS.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelect && onSelect(r.id)}
              className={`rounded-lg p-3 sm:p-4 text-xs sm:text-sm font-semibold shadow-sm hover:opacity-90 transition ${r.grid} ${color(data[r.id] || 0)}`}
              title={`${r.label}: ${data[r.id] || 0} buscas (24h)`}
            >
              <div className="flex items-center justify-between">
                <span>{r.label}</span>
                <span className="text-[10px] sm:text-xs">{data[r.id] || 0}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-600">Clique em uma região para ver os termos mais buscados nas últimas 24h.</div>
      </CardContent>
    </Card>
  );
}