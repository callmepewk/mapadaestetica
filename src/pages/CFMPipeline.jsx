import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Database, Shield, Activity, Upload, Rocket, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

const UF_COUNTS = [
  { uf: 'RS', total: 2636 }, { uf: 'SC', total: 42585 }, { uf: 'PR', total: 62861 }, { uf: 'MS', total: 16034 },
  { uf: 'SP', total: 280833 }, { uf: 'RJ', total: 142134 }, { uf: 'ES', total: 23556 }, { uf: 'DF', total: 34982 },
  { uf: 'AC', total: 3839 }, { uf: 'AL', total: 120398 }, { uf: 'AM', total: 141168 }, { uf: 'AP', total: 3461 },
  { uf: 'BA', total: 51154 }, { uf: 'CE', total: 30810 }, { uf: 'GO', total: 39508 }, { uf: 'MA', total: 16872 },
  { uf: 'MT', total: 16941 }, { uf: 'PA', total: 22051 }, { uf: 'PB', total: 19783 }, { uf: 'PI', total: 12079 },
  { uf: 'RN', total: 14966 }, { uf: 'RO', total: 9975 }, { uf: 'RR', total: 3206 }, { uf: 'SE', total: 9527 }, { uf: 'TO', total: 9299 }
];

async function sha256(str) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function normalize(raw, uf, fonte) {
  const nome = (raw.nome || raw.nome_completo || '').trim();
  const crm = String(raw.crm || raw.CRM || '').replace(/[^0-9]/g, '');
  const uf_crm = (raw.uf_crm || raw.uf || uf || '').toUpperCase();
  const situacaoMap = { 'ATIVO': 'ativo', 'INATIVO': 'inativo', 'SUSPENSO': 'suspenso', 'CANCELADO': 'cancelado' };
  const situacaoRaw = (raw.situacao || raw.status || '').toString().toUpperCase();
  const situacao = situacaoMap[situacaoRaw] || 'ativo';
  const data_inscricao = raw.data_inscricao || raw.inscricao || '';
  const municipio = raw.municipio || raw.cidade || '';
  const especialidade = raw.especialidade || raw.especialidades || '';
  const ultima_atualizacao = new Date().toISOString();
  const id_nacional = raw.id_nacional || '';
  const key = `${crm}|${uf_crm}|${nome}|${situacao}|${especialidade}|${municipio}|${data_inscricao}`;
  const base = {
    id_nacional,
    nome_completo: nome,
    crm,
    uf_crm,
    situacao,
    especialidade,
    data_inscricao,
    municipio,
    ultima_atualizacao,
    fonte,
  };
  return { base, key };
}

export default function CFMPipeline() {
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState('simulado'); // simulado | upload
  const [sampleSize, setSampleSize] = useState(100);
  const [selectedUFs, setSelectedUFs] = useState([]);
  const [uploadMap, setUploadMap] = useState({}); // uf -> file object
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentUF, setCurrentUF] = useState(null);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    (async () => {
      try { const u = await base44.auth.me(); setUser(u); }
      catch { setUser(null); }
    })();
  }, []);

  useEffect(() => {
    // carregar runs recentes para admin
    (async () => {
      try {
        const data = await base44.entities.PipelineRun.list('-created_date', 50);
        setRuns(data || []);
      } catch {}
    })();
  }, [running]);

  const isAdmin = user?.role === 'admin';
  const allUFs = UF_COUNTS.map(u => u.uf);

  const toggleUF = (uf) => {
    setSelectedUFs(prev => prev.includes(uf) ? prev.filter(x => x !== uf) : [...prev, uf]);
  };

  const handleUpload = (uf, file) => {
    setUploadMap(prev => ({ ...prev, [uf]: file }));
  };

  const log = async (runId, level, message) => {
    try {
      const run = runs.find(r => r.id === runId);
      const newLog = { ts: new Date().toISOString(), level, message };
      await base44.entities.PipelineRun.update(runId, { logs: [...(run?.logs || []), newLog] });
    } catch {}
  };

  const processUF = async (uf) => {
    setCurrentUF(uf);
    const inicio = Date.now();
    let run = await base44.entities.PipelineRun.create({ uf, modo: mode, inicio_execucao: new Date().toISOString(), total_registros: 0, novos_registros: 0, atualizados: 0, erros: 0, logs: [] });
    const runId = run.id;

    try {
      let rows = [];
      if (mode === 'simulado') {
        const n = Math.min(1000, Math.max(1, parseInt(sampleSize) || 100));
        const sim = await base44.integrations.Core.InvokeLLM({
          prompt: `Gere ${n} médicos SIMULADOS da UF ${uf} no Brasil. Devolva JSON array com campos: nome_completo, crm (número), uf_crm, situacao (ativo|inativo|suspenso|cancelado), especialidade, data_inscricao (YYYY-MM-DD), municipio.`,
          response_json_schema: { type: 'object', properties: { data: { type: 'array' } } }
        });
        // caso não venha no wrapper {data:[]} tentar interpretar diretamente
        rows = sim?.data || sim || [];
        await log(runId, 'info', `Gerados ${rows.length} registros simulados para ${uf}`);
      } else {
        const file = uploadMap[uf];
        if (!file) throw new Error('Nenhum arquivo enviado para ' + uf);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        run = await base44.entities.PipelineRun.update(runId, { file_url });
        const schema = { type: 'object', properties: { nome_completo: { type: 'string' }, crm: { type: 'string' }, uf_crm: { type: 'string' }, situacao: { type: 'string' }, especialidade: { type: 'string' }, data_inscricao: { type: 'string' }, municipio: { type: 'string' } } };
        const parsed = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: schema });
        if (parsed.status !== 'success') throw new Error(parsed.details || 'Falha ao extrair dados');
        rows = Array.isArray(parsed.output) ? parsed.output : [parsed.output];
        await log(runId, 'info', `Extraídos ${rows.length} registros do arquivo (${uf})`);
      }

      let total = 0, novos = 0, atualizados = 0, erros = 0;
      for (const raw of rows) {
        total++;
        try {
          const { base, key } = normalize(raw, uf, mode);
          const hash = await sha256(key);
          const exist = await base44.entities.Doctor.filter({ crm: base.crm, uf_crm: base.uf_crm }, '-created_date', 1);
          if (exist && exist.length) {
            const d = exist[0];
            if (d.hash_registro !== hash) {
              await base44.entities.Doctor.update(d.id, { ...base, hash_registro: hash, version: (d.version || 1) + 1, source_run_id: runId, status_validacao: base.crm && base.uf_crm ? 'valido' : 'inconsistente', inconsistencia_motivo: base.crm && base.uf_crm ? '' : 'crm/uf ausente' });
              await base44.entities.DoctorVersion.create({ doctor_id: d.id, crm: base.crm, uf_crm: base.uf_crm, hash_anterior: d.hash_registro, hash_novo: hash, change_type: 'update', run_id: runId, snapshot: { ...base, fonte: mode } });
              atualizados++;
            }
          } else {
            const created = await base44.entities.Doctor.create({ ...base, hash_registro: hash, version: 1, source_run_id: runId, status_validacao: base.crm && base.uf_crm ? 'valido' : 'inconsistente', inconsistencia_motivo: base.crm && base.uf_crm ? '' : 'crm/uf ausente' });
            await base44.entities.DoctorVersion.create({ doctor_id: created.id, crm: base.crm, uf_crm: base.uf_crm, hash_novo: hash, change_type: 'create', run_id: runId, snapshot: { ...base, fonte: mode } });
            novos++;
          }
        } catch (e) {
          erros++;
          await log(runId, 'error', e.message);
        }
      }

      const fim = Date.now();
      await base44.entities.PipelineRun.update(runId, { total_registros: total, novos_registros: novos, atualizados, erros, fim_execucao: new Date().toISOString(), tempo_execucao_ms: fim - inicio });
      await log(runId, 'info', `Concluído ${uf}: total=${total}, novos=${novos}, atualizados=${atualizados}, erros=${erros}`);
    } catch (e) {
      await log(runId, 'error', e.message);
      throw e;
    }
  };

  const runAll = async () => {
    if (!isAdmin) { setErr('Acesso restrito a administradores.'); return; }
    if (!selectedUFs.length) { setErr('Selecione ao menos uma UF.'); return; }
    setErr(null); setMsg(null); setRunning(true); setProgress(0);
    for (let i = 0; i < selectedUFs.length; i++) {
      const uf = selectedUFs[i];
      try { await processUF(uf); }
      catch (e) { console.error(e); }
      setProgress(Math.round(((i + 1) / selectedUFs.length) * 100));
    }
    setRunning(false);
    setMsg('Pipeline concluído.');
  };

  if (!user) return (<div className="min-h-screen flex items-center justify-center text-gray-600">Carregando...</div>);
  if (!isAdmin) return (<div className="min-h-screen flex items-center justify-center text-gray-600">Acesso restrito aos administradores.</div>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <Badge className="mb-3">Pipeline CFM</Badge>
          <h1 className="text-3xl font-bold mb-2">Ingestão Nacional de Registros Médicos</h1>
          <p className="text-gray-600">Camada de conector, normalização, versionamento e métricas</p>
        </div>

        {err && (
          <Alert className="bg-red-50 border-red-200"><AlertCircle className="h-4 w-4 text-red-600" /><AlertDescription className="text-red-800">{err}</AlertDescription></Alert>
        )}
        {msg && (
          <Alert className="bg-green-50 border-green-200"><CheckCircle className="h-4 w-4 text-green-600" /><AlertDescription className="text-green-800">{msg}</AlertDescription></Alert>
        )}

        <Card className="border-2 border-gray-200">
          <CardContent className="p-6 space-y-4">
            <div className="grid md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-sm font-semibold">Modo</label>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simulado">Simulado (gera dados sintéticos)</SelectItem>
                    <SelectItem value="upload">Upload (CSV/PDF de origem)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {mode === 'simulado' && (
                <div>
                  <label className="text-sm font-semibold">Registros por UF (amostra)</label>
                  <Input type="number" value={sampleSize} onChange={e=> setSampleSize(e.target.value)} className="mt-1" />
                </div>
              )}
              <div className="md:col-span-2 text-right">
                <Button disabled={running} onClick={runAll} className="bg-blue-600 hover:bg-blue-700">
                  {running ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Processando...</> : <><Rocket className="w-4 h-4 mr-2"/>Executar Pipeline</>}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
              {UF_COUNTS.map(({ uf, total }) => (
                <div key={uf} className={`rounded-lg border p-3 ${selectedUFs.includes(uf) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" checked={selectedUFs.includes(uf)} onChange={()=> toggleUF(uf)} />
                      <span className="font-semibold">{uf}</span>
                    </div>
                    <Badge variant="outline">{total.toLocaleString()}</Badge>
                  </div>
                  {mode === 'upload' && (
                    <label className="block text-xs text-gray-600">
                      <Input type="file" accept=".csv,.pdf,.xlsx,.xls,.json,.txt,.png,.jpg,.jpeg" onChange={e=> handleUpload(uf, e.target.files?.[0])} />
                    </label>
                  )}
                </div>
              ))}
            </div>

            {running && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Processando UF: <strong>{currentUF || '-'}</strong></span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2"><Activity className="w-4 h-4"/> Execuções Recentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500">
                    <th className="p-2">Data</th>
                    <th className="p-2">UF</th>
                    <th className="p-2">Modo</th>
                    <th className="p-2">Total</th>
                    <th className="p-2">Novos</th>
                    <th className="p-2">Atualizados</th>
                    <th className="p-2">Erros</th>
                    <th className="p-2">Tempo</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map(r => (
                    <tr key={r.id} className="border-t">
                      <td className="p-2">{new Date(r.created_date).toLocaleString('pt-BR')}</td>
                      <td className="p-2">{r.uf}</td>
                      <td className="p-2">{r.modo}</td>
                      <td className="p-2">{r.total_registros}</td>
                      <td className="p-2 text-green-700">{r.novos_registros}</td>
                      <td className="p-2 text-blue-700">{r.atualizados}</td>
                      <td className="p-2 text-red-700">{r.erros}</td>
                      <td className="p-2">{r.tempo_execucao_ms ? `${Math.round(r.tempo_execucao_ms/1000)}s` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 text-sm">
            Esta implementação simula o conector em modo "Simulado" e suporta Upload de arquivos para ingestão real. Para conector automático ao site do CFM, habilite Backend Functions e substitua o Data Connector por um serviço servidor (rate-limit, backoff, autenticação, etc.).
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}