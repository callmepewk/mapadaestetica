import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Eye, Search as SearchIcon, Activity, MapPin } from "lucide-react";
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
  const [selectedRadiusKm, setSelectedRadiusKm] = useState(25);
  const [center, setCenter] = useState({ lat: null, lon: null });
  const [geoLoading, setGeoLoading] = useState(false);

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

  async function handleUseMyLocation() {
    if (!navigator.geolocation) { alert('Geolocalização não suportada.'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCenter({ lat: latitude, lon: longitude });
        setGeoLoading(false);
      },
      () => setGeoLoading(false)
    );
  }

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
  const searchesToday = useMemo(() => {
    const todays = searches.filter(s => new Date(s.created_date) >= startOfDay);
    if (!center.lat || !center.lon) return todays.length;
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dist = (a, b, c, d) => {
      const dLat = toRad(c - a);
      const dLon = toRad(d - b);
      const aa = Math.sin(dLat/2)**2 + Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dLon/2)**2;
      return 2 * R * Math.asin(Math.sqrt(aa));
    };
    return todays.filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number' && dist(center.lat, center.lon, s.latitude, s.longitude) <= selectedRadiusKm).length;
  }, [searches, startOfDay, center, selectedRadiusKm]);

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {[1,5,10,25,50,100].map((km) => (
          <Button
            key={km}
            size="sm"
            variant={selectedRadiusKm === km ? "default" : "outline"}
            onClick={() => setSelectedRadiusKm(km)}
          >
            {km} km
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={handleUseMyLocation} disabled={geoLoading}>
          <MapPin className="w-4 h-4 mr-1" /> {geoLoading ? 'Localizando...' : 'Usar minha localização'}
        </Button>
        {center.lat && (
          <Badge variant="outline" className="hidden sm:inline">
            lat {center.lat.toFixed(2)}, lon {center.lon.toFixed(2)}
          </Badge>
        )}
      </div>
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
  </div>
  );
}