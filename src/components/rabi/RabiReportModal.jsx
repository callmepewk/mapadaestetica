import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Mail } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function RabiReportModal({ open, onClose, summary, userEmail }) {
  const handlePrint = () => {
    window.print();
  };

  const handleEmail = async () => {
    const to = userEmail || '';
    if (!to) return alert('Entre para enviar por e-mail.');
    await base44.integrations.Core.SendEmail({
      to,
      subject: 'Relatório R.A.B.I — Leitura Estratégica (parcial)',
      body: summary,
    });
    alert('Relatório enviado para seu e-mail.');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-extrabold">Relatório R.A.B.I (Prévia)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            <div className="prose prose-sm max-w-none">
              <h3>Resumo Executivo</h3>
              <p>{summary}</p>
              <p className="text-xs text-gray-500">Esta é uma versão resumida e impressa da leitura estratégica. Para um diagnóstico aprofundado, solicite consultoria.</p>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}