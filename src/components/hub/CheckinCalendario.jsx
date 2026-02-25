import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PONTOS_POR_DIA = [5, 10, 15, 20, 30, 50, 100]; // seg..dom

function getMonday(d) {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay(); // 0=Sun
  const diff = (day === 0 ? -6 : 1) - day; // move to Monday
  date.setUTCDate(date.getUTCDate() + diff);
  return date;
}

function iso(d) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10);
}

export default function CheckinCalendario() {
  const [user, setUser] = useState(null);
  const [diasSemana, setDiasSemana] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setUser(await base44.auth.me()); } catch {}
    })();
  }, []);

  useEffect(() => {
    const montarSemana = async () => {
      setLoading(true);
      const hoje = new Date();
      const monday = getMonday(hoje);
      const dias = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(monday);
        d.setUTCDate(monday.getUTCDate() + i);
        return d;
      });
      setDiasSemana(dias);
      if (!user?.email) { setLoading(false); return; }
      const inicio = iso(dias[0]);
      const fim = iso(dias[6]);
      const registros = await base44.entities.CheckinDiario.filter({ user_email: user.email }, '-created_date', 200);
      const semana = registros.filter(r => r.data >= inicio && r.data <= fim).map(r => r.data);
      setCheckins(semana);
      setLoading(false);
    };
    montarSemana();
  }, [user?.email]);

  const hojeISO = iso(new Date());

  const realizarCheckin = async () => {
    if (!user?.email) return;
    if (checkins.includes(hojeISO)) return;
    await base44.entities.CheckinDiario.create({ user_email: user.email, data: hojeISO });
    setCheckins(prev => [...prev, hojeISO]);
  };

  const tiles = useMemo(() => {
    return diasSemana.map((d, i) => {
      const key = iso(d);
      const isToday = key === hojeISO;
      const isPast = new Date(key) < new Date(hojeISO);
      const done = checkins.includes(key);
      const status = done ? 'done' : (isPast ? 'miss' : (isToday ? 'today' : 'upcoming'));
      const pontos = PONTOS_POR_DIA[i];
      return { key, status, pontos, label: d.toLocaleDateString('pt-BR', { weekday: 'short' }) };
    });
  }, [diasSemana, checkins]);

  const feitos = tiles.filter(t => t.status === 'done').length;

  return (
    <Card className="border-2 border-emerald-200 bg-emerald-50/50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-emerald-900">Check-in Diário</h3>
          <Badge className="bg-emerald-100 text-emerald-800">Semana: {feitos}/7</Badge>
        </div>
        <p className="text-sm text-emerald-800 mb-3">Complete sua sequência semanal. Reseta toda segunda-feira.</p>

        {loading ? (
          <p className="text-sm text-gray-600">Carregando...</p>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {tiles.map((t, idx) => (
              <div key={t.key} className={`p-2 rounded-lg text-center border-2 ${
                t.status === 'done' ? 'bg-emerald-100 border-emerald-300 text-emerald-900' :
                t.status === 'today' ? 'bg-white border-emerald-400' :
                t.status === 'miss' ? 'bg-gray-100 border-gray-200 text-gray-500' :
                'bg-white border-gray-200'
              }`}>
                <div className="text-[11px] mb-1 capitalize">{t.label}</div>
                <div className="text-sm font-bold">{t.status === 'miss' ? '—' : `+${t.pontos}`}</div>
                {t.status === 'today' && (
                  <Button onClick={realizarCheckin} size="sm" className="mt-1 h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full">
                    Fazer check-in
                  </Button>
                )}
                {t.status === 'done' && <div className="text-xs mt-1 text-emerald-800">feito</div>}
                {t.status === 'miss' && <div className="text-xs mt-1">perdido</div>}
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-emerald-800 mt-3">Pontos diários: 5, 10, 15, 20, 30, 50, 100</p>
      </CardContent>
    </Card>
  );
}