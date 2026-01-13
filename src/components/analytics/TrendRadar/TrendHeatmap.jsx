import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function TrendHeatmap({ matrix }) {
  // matrix: 7 x 24 (day x hour) counts
  const max = Math.max(1, ...matrix.flat());
  const color = (v) => {
    const n = v / max; // 0..1
    if (n === 0) return "bg-gray-100";
    // scale to green
    const shades = ["bg-emerald-50","bg-emerald-100","bg-emerald-200","bg-emerald-300","bg-emerald-400"]; 
    return shades[Math.min(shades.length - 1, Math.floor(n * shades.length))];
  };

  return (
    <Card className="border-2 border-emerald-200">
      <CardContent className="p-4">
        <div className="text-emerald-800 font-semibold mb-2">Mapa de Calor de Buscas (último período)</div>
        <div className="overflow-x-auto">
          <div className="inline-grid grid-cols-[auto_repeat(24,minmax(14px,1fr))] gap-1">
            <div></div>
            {Array.from({ length: 24 }).map((_, h) => (
              <div key={h} className="text-[10px] text-gray-500 text-center">{h}</div>
            ))}
            {matrix.map((row, d) => (
              <React.Fragment key={d}>
                <div className="text-[10px] text-gray-600 pr-1">{days[d]}</div>
                {row.map((v, h) => (
                  <div key={`${d}-${h}`} title={`${days[d]} ${h}:00 • ${v} buscas`} className={`w-4 h-4 sm:w-5 sm:h-5 rounded ${color(v)}`}></div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}