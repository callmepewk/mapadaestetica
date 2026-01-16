import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Calendar, Clock, DollarSign } from "lucide-react";

export default function NovoEventoDialog({ open, onClose, user }) {
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    data: "",
    hora: "",
    publico_alvo: "todos",
    preco_tipo: "gratis",
    preco_valor: 0,
    endereco: "",
    bairro: "",
    cidade: "",
    estado: "",
    latitude: "",
    longitude: "",
    imagem_url: "",
  });
  const dataHoraISO = useMemo(() => {
    if (!form.data || !form.hora) return null;
    try { return new Date(`${form.data}T${form.hora}:00`).toISOString(); } catch { return null; }
  }, [form.data, form.hora]);

  const salvar = async () => {
    if (!form.titulo || !form.descricao || !dataHoraISO || !form.cidade || !form.estado) {
      alert("Preencha título, descrição, data, hora, cidade e estado.");
      return;
    }
    await base44.entities.Evento.create({
      titulo: form.titulo,
      descricao: form.descricao,
      data_hora: dataHoraISO,
      publico_alvo: form.publico_alvo,
      preco_tipo: form.preco_tipo,
      preco_valor: form.preco_tipo === 'pago' ? Number(form.preco_valor) || 0 : 0,
      endereco: form.endereco,
      bairro: form.bairro,
      cidade: form.cidade,
      estado: form.estado,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      imagem_url: form.imagem_url,
      organizador_nome: user?.full_name || "",
      organizador_contato: user?.email || "",
      status: 'ativo'
    });
    alert('✅ Evento criado!');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o)=>!o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Título</Label>
            <Input value={form.titulo} onChange={(e)=>setForm({...form, titulo: e.target.value})} />
          </div>
          <div className="md:col-span-2">
            <Label>Descrição</Label>
            <Input value={form.descricao} onChange={(e)=>setForm({...form, descricao: e.target.value})} />
          </div>
          <div>
            <Label className="flex items-center gap-2"><Calendar className="w-4 h-4"/>Data</Label>
            <Input type="date" value={form.data} onChange={(e)=>setForm({...form, data: e.target.value})} />
          </div>
          <div>
            <Label className="flex items-center gap-2"><Clock className="w-4 h-4"/>Hora</Label>
            <Input type="time" value={form.hora} onChange={(e)=>setForm({...form, hora: e.target.value})} />
          </div>
          <div>
            <Label>Público</Label>
            <Select value={form.publico_alvo} onValueChange={(v)=>setForm({...form, publico_alvo: v})}>
              <SelectTrigger><SelectValue placeholder="Todos"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pacientes">Pacientes</SelectItem>
                <SelectItem value="profissionais">Profissionais</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="flex items-center gap-2"><DollarSign className="w-4 h-4"/>Preço</Label>
            <Select value={form.preco_tipo} onValueChange={(v)=>setForm({...form, preco_tipo: v})}>
              <SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="gratis">Grátis</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
              </SelectContent>
            </Select>
            {form.preco_tipo === 'pago' && (
              <div className="mt-2">
                <Input type="number" step="0.01" placeholder="Valor (R$)" value={form.preco_valor} onChange={(e)=>setForm({...form, preco_valor: e.target.value})} />
              </div>
            )}
          </div>
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
            <div>
              <Label>Endereço</Label>
              <Input value={form.endereco} onChange={(e)=>setForm({...form, endereco: e.target.value})} />
            </div>
            <div>
              <Label>Bairro</Label>
              <Input value={form.bairro} onChange={(e)=>setForm({...form, bairro: e.target.value})} />
            </div>
            <div>
              <Label>Cidade</Label>
              <Input value={form.cidade} onChange={(e)=>setForm({...form, cidade: e.target.value})} />
            </div>
            <div>
              <Label>Estado</Label>
              <Input value={form.estado} onChange={(e)=>setForm({...form, estado: e.target.value})} />
            </div>
            <div>
              <Label>Latitude (opcional)</Label>
              <Input value={form.latitude} onChange={(e)=>setForm({...form, latitude: e.target.value})} />
            </div>
            <div>
              <Label>Longitude (opcional)</Label>
              <Input value={form.longitude} onChange={(e)=>setForm({...form, longitude: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Label>Imagem (URL)</Label>
              <Input value={form.imagem_url} onChange={(e)=>setForm({...form, imagem_url: e.target.value})} />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} className="bg-pink-600 hover:bg-pink-700 text-white">Salvar Evento</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}