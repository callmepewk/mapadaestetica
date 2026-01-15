import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Check, Loader2 } from "lucide-react";

export default function InstitutosAdmin() {
  const [user, setUser] = useState(null);
  const [instituto, setInstituto] = useState("");
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      try { setUser(await base44.auth.me()); } catch {}
    })();
  }, []);

  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertDescription className="text-yellow-800">Acesso restrito a administradores.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleProcess = async () => {
    if (!file || !instituto) { alert('Escolha um arquivo e informe o instituto.'); return; }
    setProcessing(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const schema = { type: 'object', additionalProperties: true };
      const res = await base44.integrations.Core.ExtractDataFromUploadedFile({ file_url, json_schema: schema });
      if (res.status !== 'success' || !res.output) { alert('Não foi possível extrair dados.'); return; }
      const rows = Array.isArray(res.output) ? res.output : [res.output];
      for (const r of rows.slice(0, 500)) {
        try {
          await base44.entities.DoctorInstituteInfo.create({ instituto, dados: r, arquivo_origem: file_url, crm: r.crm || r.CRM || undefined, uf_crm: r.uf || r.UF || undefined });
        } catch {}
      }
      alert('Registros salvos com sucesso.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="border-none shadow-xl">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-2">Importar dados de Institutos (além do CFM)</h1>
            <p className="text-gray-600 mb-4">Faça upload de CSV/PDF/JPG com listas de profissionais ou informações complementares de institutos como SBCP, AMB, etc. Os dados serão estruturados e salvos.</p>

            <div className="grid gap-4">
              <div>
                <label className="text-sm">Instituto/Fonte</label>
                <Input value={instituto} onChange={e=>setInstituto(e.target.value)} placeholder="Ex: SBCP"/>
              </div>
              <div>
                <label className="text-sm">Arquivo</label>
                <Input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleProcess} disabled={processing}>
                  {processing ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Upload className="w-4 h-4 mr-2"/>}
                  Processar e Salvar
                </Button>
              </div>
          
              <div className="text-xs text-gray-500 flex items-center gap-2"><FileText className="w-3 h-3"/> Suporta csv, png, jpg, jpeg, pdf</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}