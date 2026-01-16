import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";

const normalize = (s) => (s || "").toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function TopAnatomicalAreas24h() {
  const [loading, setLoading] = useState(true);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    (async () => {
      const [events, procedimentos] = await Promise.all([
        base44.entities.SearchEvent.list('-created_date', 800),
        base44.entities.ProcedimentoMestre.list('-created_date', 500)
      ]);

      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const recent = events.filter((e) => e.created_date && (now - new Date(e.created_date).getTime()) <= dayMs);

      const termosSet = new Set();
      procedimentos.forEach((p) => (p.anatomia_alvo || []).forEach((a) => a && termosSet.add(a)));
      // fallback básico, caso a base de procedimentos não traga termos
      ["rosto", "olheiras", "papada", "pescoço", "colo", "barriga", "flancos", "glúteos", "pernas", "mãos", "cicatrizes", "acne"].forEach(t => termosSet.add(t));

      const termos = Array.from(termosSet);
      const normTermos = termos.map((t) => ({ raw: t, norm: normalize(t) }));

      const counter = new Map();
      for (const ev of recent) {
        const q = normalize(ev.query || "");
        if (!q) continue;
        for (const t of normTermos) {
          if (t.norm && q.includes(t.norm)) {
            counter.set(t.raw, (counter.get(t.raw) || 0) + 1);
          }
        }
      }

      const ranked = Array.from(counter.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, count]) => ({ label, count }));

      setAreas(ranked);
      setLoading(false);
    })();
  }, []);

  const maxCount = useMemo(() => (areas.length ? Math.max(...areas.map((a) => a.count)) : 0), [areas]);

  return (
    <div className="bg-white border rounded-xl p-4 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-pink-600" />
        <span className="font-semibold">Áreas anatômicas mais buscadas (24h)</span>
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-40 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Carregando...
        </div>
      ) : areas.length === 0 ? (
        <p className="text-sm text-gray-500">Sem dados suficientes nas últimas 24 horas.</p>
      ) : (
        <ul className="space-y-3">
          {areas.map((a) => (
            <li key={a.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-800">{a.label}</span>
                <Badge className="bg-pink-100 text-pink-700">{a.count}</Badge>
              </div>
              <div className="h-2 bg-gray-100 rounded">
                <div
                  className="h-2 bg-pink-500 rounded"
                  style={{ width: `${maxCount ? Math.max(8, Math.round((a.count / maxCount) * 100)) : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}