import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Eye, Search as SearchIcon, Activity } from "lucide-react";
import { format } from "date-fns";

function getSessionId() {
  try {
    let id = localStorage.getItem('site_session_id');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('site_session_id', id); }
    return id;
  } catch { return Math.random().toString(36).slice(2); }
}

export default function HomeRealtimeStats() {
  const [user, setUser] = useState(null);
  const [views, setViews] = useState([]);
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const u = await base44.auth.me(); setUser(u); } catch {}
      try {
        const lastViews = await base44.entities.PageView.list('-created_date', 1000);
        const lastSearch = await base44.entities.SearchEvent.list('-created_date', 1000);
        setViews(lastViews || []);
        setSearches(lastSearch || []);
      } finally { setLoading(false); }
    })();

    const unsubV = base44.entities.PageView.subscribe((e) => {
      if (e.type === 'create') setViews(prev => [e.data, ...prev].slice(0, 1000));
    });
    const unsubS = base44.entities.SearchEvent.subscribe((e) => {
      if (e.type === 'create') setSearches(prev => [e.data, ...prev].slice(0, 1000));
    });
    return () => { unsubV?.(); unsubS?.(); };
  }, []);

  const now = Date.now();
  const startOfDay = new Date(); startOfDay.setHours(0,0,0,0);

  const online = useMemo(() => {
    const fiveMin = now - 5*60*1000;
    const sessions = new Set(
      views.filter(v => new Date(v.created_date).getTime() >= fiveMin)
           .map(v => v.session_id).filter(Boolean)
    );
    return sessions.size;
  }, [views, now]);

  const visitsToday = useMemo(() => views.filter(v => new Date(v.created_date) >= startOfDay).length, [views]);
  const uniquesToday = useMemo(() => {
    const s = new Set(views.filter(v => new Date(v.created_date) >= startOfDay).map(v => v.session_id));
    return s.size;
  }, [views]);
  const searchesToday = useMemo(() => searches.filter(s => new Date(s.created_date) >= startOfDay).length, [searches]);

  const isAdmin = user?.role === 'admin';

  return (
    <div className="grid md:grid-cols-4 gap-4">
      <Card className="border-2 border-blue-200"><CardContent className="p-4">
        <div className="flex items-center gap-2 text-blue-700"><Users className="w-4 h-4"/> Online agora</div>
        <p className="text-3xl font-bold mt-2">{loading ? '-' : online}</p>
        <p className="text-xs text-gray-500">Sessões ativas nos últimos 5 min</p>
      </CardContent></Card>

      <Card className="border-2 border-emerald-200"><CardContent className="p-4">
        <div className="flex items-center gap-2 text-emerald-700"><Eye className="w-4 h-4"/> Acessos hoje</div>
        <p className="text-3xl font-bold mt-2">{loading ? '-' : visitsToday}</p>
        <p className="text-xs text-gray-500">Total de visualizações de hoje</p>
      </CardContent></Card>

      <Card className="border-2 border-violet-200"><CardContent className="p-4">
        <div className="flex items-center gap-2 text-violet-700"><Activity className="w-4 h-4"/> Usuários únicos</div>
        <p className="text-3xl font-bold mt-2">{loading ? '-' : uniquesToday}</p>
        <p className="text-xs text-gray-500">Sessões únicas hoje</p>
      </CardContent></Card>

      <Card className="border-2 border-rose-200"><CardContent className="p-4">
        <div className="flex items-center gap-2 text-rose-700"><SearchIcon className="w-4 h-4"/> Pesquisas hoje</div>
        <p className="text-3xl font-bold mt-2">{loading ? '-' : searchesToday}</p>
        <p className="text-xs text-gray-500">Buscas internas registradas</p>
      </CardContent></Card>

      {isAdmin && (
        <div className="md:col-span-4 mt-2">
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800 text-sm">
              SEO interno: contadores derivados de PageView/SearchEvent. Para métricas do Google (impressões/pesquisas), habilite Backend Functions e integraremos Search Console.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}