import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Lightbulb, Video, MessageCircle } from "lucide-react";

const normalize = (s) => (s || "").toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export default function ContentTipsForPros() {
  const [topTopics, setTopTopics] = useState([]);

  useEffect(() => {
    (async () => {
      const [events, termos] = await Promise.all([
        base44.entities.SearchEvent.list('-created_date', 800),
        base44.entities.TermoBusca.list('-created_date', 500)
      ]);

      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      const recent = events.filter((e) => e.created_date && (now - new Date(e.created_date).getTime()) <= dayMs);

      const normTermos = (termos || []).map((t) => ({ termo: t.termo, norm: normalize(t.termo), tipo: t.tipo }));
      const counts = new Map();

      for (const ev of recent) {
        const q = normalize(ev.query || "");
        if (!q) continue;
        for (const t of normTermos) {
          if (t.norm && q.includes(t.norm)) {
            counts.set(t.termo, (counts.get(t.termo) || 0) + 1);
          }
        }
      }

      const ranked = Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([termo, count]) => ({ termo, count }));
      setTopTopics(ranked);
    })();
  }, []);

  const tipBlocks = (topic) => [
    {
      icon: <Video className="w-4 h-4" />, 
      title: `Abertura em 3s sobre ${topic}`,
      text: `"${topic}: 3 mitos e verdades em 30s" — comece com um gancho curto e direto.`
    },
    {
      icon: <Lightbulb className="w-4 h-4" />, 
      title: `Explicação prática de ${topic}`,
      text: `O que é, quem é candidato(a), tempo de sessão e cuidados — linguagem simples e objetiva.`
    },
    {
      icon: <MessageCircle className="w-4 h-4" />, 
      title: `CTA local para ${topic}`,
      text: `"Comente '${topic.split(' ')[0]}' que envio um guia gratuito" — estimule conversa e salvos.`
    }
  ];

  return (
    <div className="bg-white border rounded-xl p-4 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Lightbulb className="w-4 h-4 text-amber-600" />
        <span className="font-semibold">Dicas de conteúdo para profissionais (baseadas nas últimas 24h)</span>
      </div>

      {topTopics.length === 0 ? (
        <p className="text-sm text-gray-500">Sem dados suficientes nas últimas 24 horas.</p>
      ) : (
        <div className="space-y-4">
          {topTopics.map((t) => (
            <div key={t.termo} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">{t.termo}</span>
                <span className="text-xs text-gray-500">{t.count} buscas</span>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {tipBlocks(t.termo).map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="mt-0.5 text-amber-600">{b.icon}</div>
                    <div>
                      <p className="font-medium">{b.title}</p>
                      <p className="text-gray-600">{b.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}