import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileSpreadsheet, LineChart } from "lucide-react";

export default function RabiGAUploader({ onData }) {
  const [gaFile, setGaFile] = useState(null);
  const [trendsFile, setTrendsFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState({ ga: [], trends: [] });

  const handleProcess = async () => {
    setLoading(true);
    try {
      const result = { gaMetrics: [], trendsSeries: [] };

      if (gaFile) {
        const up = await base44.integrations.Core.UploadFile({ file: gaFile });
        const extracted = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: up.file_url,
          json_schema: {
            type: "object",
            additionalProperties: true
          }
        });
        const rows = Array.isArray(extracted.output) ? extracted.output : [];
        // Heurística: procurar colunas comuns do GA4 export (date, views, sessions)
        const mapped = rows.slice(0, 200).map((r) => ({
          date: r.date || r.data || r.Date || r["Data"] || r["dateHour"] || "",
          views: Number(r.views || r.pageviews || r["Visualizações"] || r["screenPageViews"] || 0),
          sessions: Number(r.sessions || r.Sessions || r["Sessões"] || 0),
        }));
        result.gaMetrics = mapped.filter(m => m.date);
        setPreview(prev => ({ ...prev, ga: mapped.slice(0, 5) }));
      }

      if (trendsFile) {
        const upT = await base44.integrations.Core.UploadFile({ file: trendsFile });
        const extractedT = await base44.integrations.Core.ExtractDataFromUploadedFile({
          file_url: upT.file_url,
          json_schema: {
            type: "object",
            additionalProperties: true
          }
        });
        const rowsT = Array.isArray(extractedT.output) ? extractedT.output : [];
        // Heurística: Google Trends export CSV: columns often: week/date, value, term
        const mappedT = rowsT.slice(0, 500).map((r) => ({
          date: r.week || r.date || r["Week"] || r["Data"] || "",
          value: Number(r.value || r["Value"] || r["Interesse"] || 0),
          term: r.term || r["Term"] || r["Consulta"] || "Termo"
        }));
        result.trendsSeries = mappedT.filter(m => m.date);
        setPreview(prev => ({ ...prev, trends: mappedT.slice(0, 5) }));
      }

      onData && onData(result);
      alert("Dados processados! Você pode visualizar os gráficos abaixo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-yellow-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <LineChart className="w-5 h-5 text-yellow-600" />
            Importar GA4 e Google Trends (CSV)
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg">
            <p className="text-sm mb-2 font-medium">GA4 (CSV export)</p>
            <input type="file" accept=".csv,.xlsx,.json" onChange={(e)=> setGaFile(e.target.files?.[0]||null)} />
            {preview.ga.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                <p className="font-semibold">Prévia:</p>
                {preview.ga.map((r,i)=>(<p key={i}>{r.date} — views: {r.views}, sessions: {r.sessions}</p>))}
              </div>
            )}
          </div>
          <div className="p-3 border rounded-lg">
            <p className="text-sm mb-2 font-medium">Google Trends (CSV export)</p>
            <input type="file" accept=".csv,.xlsx,.json" onChange={(e)=> setTrendsFile(e.target.files?.[0]||null)} />
            {preview.trends.length > 0 && (
              <div className="mt-2 text-xs text-gray-600">
                <p className="font-semibold">Prévia:</p>
                {preview.trends.map((r,i)=>(<p key={i}>{r.date} — {r.term}: {r.value}</p>))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button onClick={handleProcess} disabled={loading || (!gaFile && !trendsFile)} className="bg-[#2C2C2C] text-[#F7D426]">
            {loading ? (<><Upload className="w-4 h-4 mr-2 animate-pulse"/>Processando...</>) : (<><FileSpreadsheet className="w-4 h-4 mr-2"/>Processar Arquivos</>)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}