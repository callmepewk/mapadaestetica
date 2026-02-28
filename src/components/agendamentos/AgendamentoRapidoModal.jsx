import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

function gerarSlots(date) {
  const day = date.getDay(); // 0=Dom,1=Seg,...6=Sáb
  const slots = [];
  const pushRange = (start, end) => {
    for (let h = start; h < end; h++) {
      slots.push(`${String(h).padStart(2,'0')}:00`);
      if (h < end - 1) slots.push(`${String(h).padStart(2,'0')}:30`);
    }
  };
  if (day === 2 || day === 3) { // Ter/Qua
    pushRange(9, 13);
  } else if (day === 4) { // Qui
    pushRange(14, 20);
  } else if (day === 5) { // Sex
    pushRange(9, 13);
  }
  return slots;
}

export default function AgendamentoRapidoModal({ open, onClose, item }) {
  const [data, setData] = React.useState(() => new Date());
  const [hora, setHora] = React.useState("");
  const [depositoMarcado, setDepositoMarcado] = React.useState(false);
  const [salvando, setSalvando] = React.useState(false);
  const [valorDeposito, setValorDeposito] = React.useState(0);

  const nome = item?.nome || item?.titulo || "Atendimento";
  const precoBase = Number(item?.preco_promocional || item?.preco || 0) || 0;
  const linkPagamento = item?.link_pagamento || "";
  const depositoSugerido = Math.max(0, Math.round(precoBase * 0.2));

  React.useEffect(() => {
    setValorDeposito(depositoSugerido || 0);
  }, [depositoSugerido]);

  const slots = React.useMemo(() => gerarSlots(data), [data]);

  const qrUrl = React.useMemo(() => {
    if (!linkPagamento || !valorDeposito) return "";
    const payUrl = `${linkPagamento}${linkPagamento.includes('?') ? '&' : '?'}amount=${encodeURIComponent(valorDeposito)}&note=${encodeURIComponent('Reserva - ' + nome)}`;
    return `https://quickchart.io/qr?text=${encodeURIComponent(payUrl)}&margin=2&size=220`;
  }, [linkPagamento, valorDeposito, nome]);

  const handleConfirmar = async () => {
    if (!hora) return;
    if (linkPagamento && valorDeposito > 0 && !depositoMarcado) return; // se QR disponível, exigir confirmação do depósito

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
        produto_id: item?.id ? String(item.id) : 'generico',
        produto_nome: nome,
        cliente_email: user?.email,
        data_hora: dataISO,
        status: "reservado",
        valor_total: precoBase,
        valor_deposito: Number(valorDeposito || 0),
        deposito_confirmado: !!depositoMarcado,
        endereco: item?.endereco || "",
        cidade: item?.cidade || "",
        estado: item?.estado || "",
        observacoes: item?.descricao ? `Ref.: ${item.descricao.slice(0, 140)}` : ""
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
          <DialogTitle>Agendar {nome}</DialogTitle>
          <DialogDescription>
            Selecione data e horário. Depósito sugerido de 20% quando houver link de pagamento.
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
            <p className="text-xs text-gray-500 mt-1">Ter/Qua manhã, Qui tarde/noite, Sex manhã. Seg indisponível.</p>
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

          <div className="p-3 rounded-lg border bg-gray-50 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">Depósito</p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  value={valorDeposito}
                  onChange={(e)=> setValorDeposito(Number(e.target.value || 0))}
                  className="h-8 w-28"
                />
                <span className="text-xs text-gray-500">R$</span>
              </div>
            </div>
            {qrUrl ? (
              <div className="mt-2 flex items-center gap-3">
                <img src={qrUrl} alt="QR de pagamento" className="w-40 h-40" />
                <div className="text-xs text-gray-600 break-all">
                  Escaneie o QR para pagar o sinal e habilitar a confirmação.
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600">Sem link de pagamento disponível. Você pode reservar sem depósito agora.</p>
            )}
            <label className="flex items-center gap-2 mt-1 text-sm">
              <input type="checkbox" checked={depositoMarcado} onChange={(e) => setDepositoMarcado(e.target.checked)} />
              {qrUrl ? 'Marcar depósito como pago' : 'Reservar sem depósito agora'}
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onClose(false)}>Cancelar</Button>
            <Button disabled={!hora || salvando || (qrUrl && !depositoMarcado)} onClick={handleConfirmar}>
              {salvando ? 'Salvando...' : 'Confirmar Reserva'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}