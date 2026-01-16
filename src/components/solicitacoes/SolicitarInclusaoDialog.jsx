import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";

export default function SolicitarInclusaoDialog({ open, onClose, item, user }) {
  const [destinos, setDestinos] = useState({ produtos: true, loja_pontos: true });
  const [observacoes, setObservacoes] = useState("");
  const pontosSugeridos = useMemo(() => {
    if (!item) return 0;
    if (typeof item.pontos_necessarios === 'number' && item.pontos_necessarios > 0) return item.pontos_necessarios;
    const preco = typeof item.preco === 'number' ? item.preco : 0;
    return Math.max(0, Math.round(preco)); // 1 real = 1 ponto
  }, [item]);

  const handleSubmit = async () => {
    if (!item || !user) return;
    const sel = Object.entries(destinos).filter(([,v])=>v).map(([k])=>k);
    if (sel.length === 0) { alert('Selecione pelo menos um destino.'); return; }
    await base44.entities.SolicitacaoInclusaoLoja.create({
      produto_id: item.id,
      produto_nome: item.nome,
      solicitante_email: user.email,
      destinos: sel,
      status: 'pendente',
      preco_referencia: item.preco || 0,
      pontos_sugeridos: pontosSugeridos,
      observacoes
    });
    alert('✅ Solicitação enviada aos administradores!');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o)=>!o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Solicitar inclusão nas lojas</DialogTitle>
        </DialogHeader>
        {item && (
          <div className="space-y-4">
            <div>
              <Label>Item</Label>
              <Input value={item.nome || ''} readOnly />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={destinos.produtos} onCheckedChange={(c)=>setDestinos(d=>({...d, produtos: !!c}))} />
                <span>Loja de Produtos</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={destinos.loja_pontos} onCheckedChange={(c)=>setDestinos(d=>({...d, loja_pontos: !!c}))} />
                <span>Loja de Pontos</span>
              </label>
            </div>
            <div className="bg-gray-50 p-3 rounded border">
              <p className="text-sm text-gray-700"><strong>Conversão automática:</strong> 1 real = 1 ponto</p>
              <p className="text-sm text-gray-700">Preço referência: R$ {Number(item.preco||0).toFixed(2)} • Pontos sugeridos: <strong>{pontosSugeridos}</strong></p>
            </div>
            <div>
              <Label>Observações (opcional)</Label>
              <Input value={observacoes} onChange={(e)=>setObservacoes(e.target.value)} placeholder="Ex: expor em destaque, lote mínimo, etc." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleSubmit} className="bg-pink-600 hover:bg-pink-700 text-white">Enviar solicitação</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}