import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Sparkles, TrendingUp } from "lucide-react";
import TrendWordCloud from "./TrendWordCloud";
import TrendSeasonalityChart from "./TrendSeasonalityChart";
import TrendSharePie from "./TrendSharePie";
import TrendHeatmap from "./TrendHeatmap";
import TrendListModal from "./TrendListModal";
import BrazilRegionHeatmap from "./BrazilRegionHeatmap";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PT_STOPWORDS = new Set(["de","da","do","das","dos","a","o","e","ou","em","no","na","nas","nos","para","por","preço","valor","o que é","como","onde","com","sem","um","uma","sobre","ao"]);

const SYNONYMS = {
  "botox": "Toxina Botulínica",
  "toxina botulinica": "Toxina Botulínica",
  "toxina botulínica": "Toxina Botulínica",
  "preenchimento labial": "Preenchimento Labial",
  "lipo enzimatica": "Lipo Enzimática",
  "lipo enzimática": "Lipo Enzimática",
  "ultraformer": "HIFU",
  "liftera": "HIFU",
  "hifu": "HIFU",
  "laser co2": "Laser CO2",
  "bioestimulador gluteo": "Bioestimulador de Glúteo",
  "bioestimulador glúteo": "Bioestimulador de Glúteo",
  "fios pdo": "Fios de PDO",
  "gordura localizada": "Gordura Localizada",
  "papada": "Papada"
};

const CATEGORY_MAP = {
  "Toxina Botulínica": "Facial",
  "Preenchimento Labial": "Facial",
  "HIFU": "Facial",
  "Laser CO2": "Facial",
  "Fios de PDO": "Facial",
  "Gordura Localizada": "Corporal",
  "Bioestimulador de Glúteo": "Corporal",
  "Papada": "Facial",
};

function normalize(str) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD").replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(q) {
  const n = normalize(q);
  const parts = n.split(/\s*\|\s*|\s+/); // suporta "Cidade | Categoria"
  return parts.filter(p => p && !PT_STOPWORDS.has(p));
}

export default function TrendRadar() {
  const [user, setUser] = useState(null);
  const [searches, setSearches] = useState([]);
  const [period, setPeriod] = useState("7"); // dias: 7,30,90
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openAll, setOpenAll] = useState(false);
  const [localizationMode, setLocalizationMode] = useState('radius'); // 'radius' | 'city'
  const [radiusKm, setRadiusKm] = useState(25);
  const [center, setCenter] = useState({ lat: null, lon: null });
  const [citySel, setCitySel] = useState('');
  const [stateSel, setStateSel] = useState('');
  const [countrySel, setCountrySel] = useState('');
  const [geoLoading, setGeoLoading] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [openRegionModal, setOpenRegionModal] = useState(false);

  useEffect(() => {
    (async () => {
      try { const u = await base44.auth.me(); setUser(u); } catch {}
      try {
        const rows = await base44.entities.SearchEvent.list('-created_date', 5000);
        setSearches(rows || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const now = Date.now();
  const days = parseInt(period, 10);
  const start = new Date(now - days*24*60*60*1000);
  const prevStart = new Date(start.getTime() - days*24*60*60*1000);

  const filteredSearches = useMemo(() => {
    if (localizationMode === 'radius') {
      if (!center.lat || !center.lon) return searches;
      const R = 6371;
      const toRad = (v) => (v * Math.PI) / 180;
      const dist = (a, b, c, d) => {
        const dLat = toRad(c - a);
        const dLon = toRad(d - b);
        const aa = Math.sin(dLat/2)**2 + Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(dLon/2)**2;
        return 2 * R * Math.asin(Math.sqrt(aa));
      };
      return searches.filter(s => typeof s.latitude === 'number' && typeof s.longitude === 'number' && dist(center.lat, center.lon, s.latitude, s.longitude) <= radiusKm);
    } else {
      const cityN = (citySel || '').toLowerCase().trim();
      const stateN = (stateSel || '').toLowerCase().trim();
      const countryN = (countrySel || '').toLowerCase().trim();
      return searches.filter(s => {
        const c = (s.cidade || '').toLowerCase();
        const e = (s.estado || '').toLowerCase();
        const p = (s.pais || '').toLowerCase();
        const cityOk = cityN ? c === cityN : true;
        const stateOk = stateN ? e === stateN : true;
        const countryOk = countryN ? p === countryN : true;
        return cityOk && stateOk && countryOk;
      });
    }
  }, [searches, localizationMode, center, radiusKm, citySel, stateSel, countrySel]);

  const byDay = useMemo(() => {
    // agrega contagens por dia e termo canônico
    const fmt = (d) => new Date(d).toISOString().slice(0,10);
    const curr = {}; const prev = {};
    for (const s of filteredSearches) {
      const ts = new Date(s.created_date);
      const bucket = fmt(ts);
      const tokens = tokenize(s.query || "");
      tokens.forEach(t => {
        const canon = SYNONYMS[t] || (t.charAt(0).toUpperCase() + t.slice(1));
        const target = ts >= start ? curr : (ts >= prevStart && ts < start ? prev : null);
        if (!target) return;
        target[canon] = target[canon] || {};
        target[canon][bucket] = (target[canon][bucket] || 0) + 1;
      });
    }
    return { curr, prev };
  }, [searches, period]);

  const cloudData = useMemo(() => {
    // soma total por termo no período e calcula growth vs janela anterior
    const sum = (obj) => Object.values(obj || {}).reduce((a,b)=>a+b,0);
    const terms = Object.keys(byDay.curr);
    const arr = terms.map(term => {
      const count = sum(byDay.curr[term]);
      const prevCount = sum(byDay.prev[term] || {});
      const growth = prevCount > 0 ? (count - prevCount) / prevCount : (count > 0 ? 1 : null);
      return { term, count, growth };
    }).filter(x => x.count > 0)
      .sort((a,b)=> b.count - a.count)
      .slice(0, 30);
    return arr;
  }, [byDay]);

  const seasonality = useMemo(() => {
    if (!selected || !byDay.curr[selected]) return [];
    const allDays = new Set();
    Object.keys(byDay.curr[selected]).forEach(d => allDays.add(d));
    // ordena dias crescentes
    const ordered = Array.from(allDays).sort();
    return ordered.map(label => ({ label, count: byDay.curr[selected][label] || 0 }));
  }, [selected, byDay]);

  const shareData = useMemo(() => {
    const totals = {};
    cloudData.forEach(({ term, count }) => {
      const cat = CATEGORY_MAP[term] || 'Outros';
      totals[cat] = (totals[cat] || 0) + count;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [cloudData]);

  const heatMatrix = useMemo(() => {
    const m = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    for (const s of filteredSearches) {
      const ts = new Date(s.created_date);
      if (ts < start || ts > new Date(now)) continue;
      const d = ts.getDay();
      const h = ts.getHours();
      m[d][h] += 1;
    }
    return m;
  }, [filteredSearches, start, now]);

  async function handleUseMyLocation() {
    if (!navigator.geolocation) { alert('Geolocalização não suportada.'); return; }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await resp.json();
        const cidade = data.address.city || data.address.town || data.address.village || data.address.county || '';
        const estado = data.address.state || data.address.region || '';
        const pais = data.address.country || '';
        setCenter({ lat: latitude, lon: longitude });
        if (!citySel) setCitySel(cidade);
        if (!stateSel) setStateSel(estado);
        if (!countrySel) setCountrySel(pais);
      } catch {}
      setGeoLoading(false);
    }, () => setGeoLoading(false));
  }





  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#F7D426] text-[#2C2C2C]">Radar de Tendências</Badge>
          <span className="text-sm text-gray-600 hidden sm:inline">MVP com base nas buscas internas</span>
        </div>
        <div className="flex items-center gap-2">
          {user?.cidade && user?.estado && (
            <div className="hidden sm:flex items-center gap-1 text-gray-600 text-sm">
              <MapPin className="w-4 h-4" /> Sua região: {user.cidade}/{user.estado}
            </div>
          )}
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[120px]"><SelectValue placeholder="Período"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 dias</SelectItem>
              <SelectItem value="30">30 dias</SelectItem>
              <SelectItem value="90">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 items-end">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={localizationMode} onValueChange={setLocalizationMode}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Localização"/></SelectTrigger>
            <SelectContent>
              <SelectItem value="radius">Raio (km)</SelectItem>
              <SelectItem value="city">Cidade/Estado</SelectItem>
            </SelectContent>
          </Select>
          {localizationMode === 'radius' ? (
            <>
              <Input type="number" min="1" max="200" value={radiusKm} onChange={(e)=>setRadiusKm(parseInt(e.target.value) || 1)} className="w-24" />
              <Button variant="outline" onClick={handleUseMyLocation} disabled={geoLoading}>
                <MapPin className="w-4 h-4 mr-1" /> {geoLoading ? 'Localizando...' : 'Usar minha localização'}
              </Button>
              {center.lat && <Badge variant="outline" className="hidden sm:inline">lat {center.lat.toFixed(2)}, lon {center.lon.toFixed(2)}</Badge>}
            </>
          ) : (
            <>
              <Input placeholder="Cidade" value={citySel} onChange={(e)=>setCitySel(e.target.value)} className="w-40" />
              <Input placeholder="Estado" value={stateSel} onChange={(e)=>setStateSel(e.target.value)} className="w-32" />
              <Input placeholder="País" value={countrySel} onChange={(e)=>setCountrySel(e.target.value)} className="w-32" />
            </>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {localizationMode === 'radius' && !center.lat && 'Dica: clique em "Usar minha localização" para filtrar por raio.'}
        </div>
      </div>

      <Card className="border-2 border-gray-200">
        <CardContent className="p-4 space-y-4">
          {/* Word Cloud */}
          <div>
            <div className="flex items-center gap-2 mb-2 text-gray-800 font-semibold">
              <Sparkles className="w-4 h-4" /> Nuvem de Oportunidades
            </div>
            <TrendWordCloud items={cloudData.slice(0,5)} onSelect={setSelected} selected={selected} />
            <div className="mt-2">
              <Button variant="outline" onClick={() => setOpenAll(true)}>Ver todas</Button>
            </div>
          </div>

          {/* Charts */}
          <div className="grid md:grid-cols-2 gap-4">
            <TrendSeasonalityChart data={seasonality} title={selected ? `Sazonalidade: ${selected}` : "Sazonalidade"} />
            <TrendSharePie data={shareData} title="Market Share por Categoria" />
          </div>

          {/* Heatmap temporal */}
          <TrendHeatmap matrix={heatMatrix} />

          {/* Mapa por Regiões (24h) */}
          <BrazilRegionHeatmap
            data={regionAgg}
            onSelect={(reg) => { setSelectedRegion(reg); setOpenRegionModal(true); }}
          />

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t pt-3">
            <div className="text-sm text-gray-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-pink-600" />
              Dica: clique em um termo para ver a tendência e ajustar suas campanhas.
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = "/" + "Perfil"}
              className="border-2 border-[#F7D426] text-[#F7D426] hover:bg-[#FFF9E6]"
            >
              Ver todas
            </Button>
          </div>
        </CardContent>
      </Card>
      <TrendListModal open={openAll} onOpenChange={setOpenAll} items={cloudData} />
      <TrendListModal open={openRegionModal} onOpenChange={setOpenRegionModal} items={selectedRegion ? regionItems(selectedRegion) : []} />
    </div>
  );
}