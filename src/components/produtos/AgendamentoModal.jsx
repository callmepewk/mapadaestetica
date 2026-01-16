import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

function gerarSlots(date) {
  // Regras de disponibilidade (simplificadas conforme instruções)
  // Seg: bloqueado (P&D/cursos)
  // Ter/Qua: 9-13 (Dermato/consulta)
  // Qui: 14-20 (programas)
  // Sex: 9-13 (cirurgias)
  // Sáb/Dom: fechado
  const day = date.getDay(); // 0=Dom,1=Seg,...6=Sáb
  const slots = [];
  const pushRange = (start, end) => {
    for (let h = start; h < end; h++) {
      slots.push(`${String(h).padStart(2,'0')}:00`);
      if (h < end - 1) slots.push(`${String(h).padStart(2,'0')}:30`);
    }
  };
  if (day === 2 || day === 3) { // Ter(2) / Qua(3)
    pushRange(9, 13);
  } else if (day === 4) { // Qui
    pushRange(14, 20);
  } else if (day === 5) { // Sex
    pushRange(9, 13);
  }
  return slots;
}

export default function AgendamentoModal({ open, onClose, produto }) {
  const [data, setData] = React.useState(() => new Date());
  const [hora, setHora] = React.useState("");
  const [depositoMarcado, setDepositoMarcado] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  const precoBase = produto?.preco_promocional || produto?.preco || 0;
  const deposito = Math.max(0, Math.round(precoBase * 0.2));
  const slots = React.useMemo(() => gerarSlots(data), [data]);

  const qrUrl = React.useMemo(() => {
    if (!produto?.link_pagamento || deposito <= 0) return "";
    const payUrl = `${produto.link_pagamento}${produto.link_pagamento.includes('?') ? '&' : '?'}amount=${encodeURIComponent(deposito)}&note=${encodeURIComponent('Reserva 20% - ' + (produto?.nome || 'Procedimento'))}`;
    return `https://quickchart.io/qr?text=${encodeURIComponent(payUrl)}&margin=2&size=220`;
  }, [produto, deposito]);

  const handleConfirmar = async () => {
    if (!hora || !depositoMarcado) return;
    setSalvando(true);
    try {
      const user = await base44.auth.me();
      const dataISO = new Date(
        data.getFullYear(),
        data.getMonth(),
        data.getDate(),
        parseInt(hora.split(':')[0], 10),
        parseInt(hora.split(':')[1], 10)
      ).toISOString();
      await base44.entities.Agendamento.create({
        produto_id: produto.id,
        produto_nome: produto.nome,
        cliente_email: user?.email,
        data_hora: dataISO,
        status: "reservado",
        valor_total: precoBase,
        valor_deposito: deposito,
        deposito_confirmado: true,
        endereco: produto.endereco || "",
        cidade: produto.cidade || "",
        estado: produto.estado || "",
      });
      onClose(true);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agendar {produto?.nome}</DialogTitle>
          <DialogDescription>
            Selecione data e horário conforme disponibilidade. Para confirmar, realize o depósito de 20%.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Data</Label>
            <input
              type="date"
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={`${data.getFullYear()}-${String(data.getMonth()+1).padStart(2,'0')}-${String(data.getDate()).padStart(2,'0')}`}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split('-').map(Number);
                setHora("");
                setData(new Date(y, m - 1, d));
              }}
            />
            <p className="text-xs text-gray-500 mt-1">Disponibilidade: Ter/Qua manhã, Qui tarde/noite, Sex manhã. Seg indisponível.</p>
          </div>

          <div>
            <Label>Horário</Label>
            <Select value={hora} onValueChange={setHora}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={slots.length ? "Selecione" : "Indisponível para a data"} /></SelectTrigger>
              <SelectContent>
                {slots.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 rounded-lg border bg-gray-50">
            <p className="text-sm font-medium">Depósito (20%): R$ {deposito.toLocaleString('pt-BR')}</p>
            {qrUrl ? (
              <div className="mt-2 flex items-center gap-3">
                <img src={qrUrl} alt="QR de pagamento" className="w-40 h-40" />
                <div className="text-xs text-gray-600 break-all">
                  Escaneie o QR para pagar o sinal e habilitar a confirmação.
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-600 mt-2">Defina preço e link_pagamento no produto para gerar o QR.</p>
            )}
            <label className="flex items-center gap-2 mt-3 text-sm">
              <input type="checkbox" checked={depositoMarcado} onChange={(e) => setDepositoMarcado(e.target.checked)} />
              Marcar depósito como pago
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onClose(false)}>Cancelar</Button>
            <Button disabled={!hora || !depositoMarcado || salvando} onClick={handleConfirmar}>
              {salvando ? 'Salvando...' : 'Confirmar Reserva'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}