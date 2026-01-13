import React from "react";
import { Badge } from "@/components/ui/badge";

export default function TrendWordCloud({ items, onSelect, selected }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-sm text-gray-500">Sem dados suficientes de buscas para o período selecionado.</div>
    );
  }

  const max = Math.max(...items.map(i => i.count || 1));
  const min = Math.min(...items.map(i => i.count || 1));

  const scale = (v) => {
    if (max === min) return 1;
    const n = (v - min) / (max - min);
    return 0.9 + n * 1.6; // font-size scale ~0.9x a 2.5x
  };

  const colorFor = (growth) => {
    if (growth == null) return "text-gray-700";
    if (growth >= 0.2) return "text-emerald-700";
    if (growth <= -0.1) return "text-rose-700";
    return "text-gray-700";
  };

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.term}
          onClick={() => onSelect?.(it.term)}
          className={`transition-all hover:opacity-80 ${selected === it.term ? "ring-2 ring-[#F7D426] rounded" : ""}`}
          title={`${it.term} • ${it.count} buscas${it.growth != null ? ` • ${Math.round(it.growth*100)}%` : ""}`}
        >
          <span
            className={`${colorFor(it.growth)} font-semibold`}
            style={{ fontSize: `${scale(it.count)}rem`, lineHeight: 1 }}
          >
            {it.term}
          </span>
          {it.growth != null && (
            <Badge className={`ml-1 ${it.growth >= 0.2 ? "bg-emerald-100 text-emerald-800" : it.growth <= -0.1 ? "bg-rose-100 text-rose-800" : "bg-gray-100 text-gray-700"} border-none`}> 
              {it.growth >= 0 ? "+" : ""}{Math.round(it.growth*100)}%
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
}