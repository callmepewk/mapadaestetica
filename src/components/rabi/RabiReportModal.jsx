import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RabiReportModal({ open, onClose, summary, userEmail, sections = [], loading = false }) {
  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    const to = userEmail || '';
    if (!to) return alert('Entre para enviar por e-mail.');
    const bodyFromSections = (sections || []).map(s => `\n\n## ${s.title}\n- ${s.items.join('\n- ')}`).join('');
    await base44.integrations.Core.SendEmail({
      to,
      subject: 'Relatório R.A.B.I — Leitura Estratégica (parcial)',
      body: bodyFromSections || summary || 'Relatório sintético do R.A.B.I.',
    });
    alert('Relatório enviado para seu e-mail.');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl w-[95vw] sm:w-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold">Relatório R.A.B.I (Prévia)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {loading ? (
            <div className="rounded-xl border bg-white p-6 flex items-center gap-3 text-gray-700">
              <span className="w-4 h-4 rounded-full border-2 border-[#F7D426] border-t-transparent animate-spin inline-block" />
              Analisando dados estratégicos...
            </div>
          ) : (
            <>
              <div className="rounded-xl border bg-white p-4">
                <div className="prose prose-sm max-w-none">
                  {sections && sections.length > 0 ? (
                    <>
                      {sections.map((sec) => (
                        <div key={sec.title} className="mb-4">
                          <h3 className="font-bold">{sec.title}</h3>
                          <ul className="list-disc pl-5">
                            {(sec.items || []).map((it, idx) => (
                              <li key={idx}>{it}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">Conteúdo baseado no uso da plataforma (últimos 30 dias) e limitado conforme seu plano. Para um diagnóstico aprofundado, solicite consultoria.</p>
                    </>
                  ) : (
                    <>
                      <h3>Resumo Executivo</h3>
                      <p>{summary}</p>
                      <p className="text-xs text-gray-500">Esta é uma versão resumida e impressa da leitura estratégica. Para um diagnóstico aprofundado, solicite consultoria.</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 justify-end">
                <Button onClick={handlePrint} className="bg-[#2C2C2C] text-[#F7D426]">
                  <FileText className="w-4 h-4 mr-2" /> Imprimir / Salvar PDF
                </Button>
                <Button onClick={handleEmail} variant="outline" className="border-2">
                  <Mail className="w-4 h-4 mr-2" /> Enviar por e-mail
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}