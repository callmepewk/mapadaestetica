import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ModalFiltrosAvancados({ open, onOpenChange, valores, onChange, onApply }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Filtros Avançados</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Disponibilidade</Label>
              <Input type="date" value={valores.data || ""} onChange={(e)=>onChange({ ...valores, data: e.target.value })} />
            </div>
            <div>
              <Label>Horário (opcional)</Label>
              <Input type="time" value={valores.hora || ""} onChange={(e)=>onChange({ ...valores, hora: e.target.value })} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label>Atendimento</Label>
              <div className="mt-2 space-y-2 text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!valores.atendimento_domicilio} onChange={(e)=>onChange({ ...valores, atendimento_domicilio: e.target.checked })} />
                  Domiciliar
                </label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!valores.atendimento_local} onChange={(e)=>onChange({ ...valores, atendimento_local: e.target.checked })} />
                  Na clínica/local
                </label>
              </div>
            </div>
            <div>
              <Label>Convênios / Benefícios</Label>
              <Input placeholder="Ex: Clube da Beleza, parceiros" value={valores.convenios || ""} onChange={(e)=>onChange({ ...valores, convenios: e.target.value })} />
              <p className="text-xs text-gray-500 mt-1">Separe por vírgulas</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button>
          <Button onClick={()=>{ onApply?.(); onOpenChange(false); }} className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]">Aplicar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}