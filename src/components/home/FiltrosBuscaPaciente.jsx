import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal } from "lucide-react";

export default function FiltrosBuscaPaciente({
  categorias = [],
  valores,
  onChange,
  onOpenAdvanced,
  onBuscar
}) {
  const precoRanges = [
    { v: "", l: "Preço" },
    { v: "0-500", l: "Até R$ 500" },
    { v: "500-1000", l: "R$ 500 - 1.000" },
    { v: "1000-2000", l: "R$ 1.000 - 2.000" },
    { v: "2000-5000", l: "R$ 2.000 - 5.000" },
    { v: "5000-999999", l: "Acima de R$ 5.000" },
  ];
  const ratingOpts = [
    { v: "", l: "Avaliação" },
    { v: "3", l: "3★+" },
    { v: "4", l: "4★+" },
    { v: "4.5", l: "4.5★+" },
  ];
  const distanciaOpts = [
    { v: "", l: "Distância" },
    { v: "5", l: "Até 5 km" },
    { v: "10", l: "Até 10 km" },
    { v: "25", l: "Até 25 km" },
    { v: "50", l: "Até 50 km" },
  ];

  return (
    <div className="w-full bg-white/80 backdrop-blur border rounded-xl p-3 sm:p-4 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 sm:gap-3">
        <Select value={valores.tipo || ""} onValueChange={(v)=>onChange({ ...valores, tipo: v })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Tipo de serviço" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Tipo de serviço</SelectItem>
            <SelectItem value="servico">Serviço</SelectItem>
            <SelectItem value="procedimento">Procedimento</SelectItem>
            <SelectItem value="produto">Produto</SelectItem>
          </SelectContent>
        </Select>

        <Select value={valores.categoria || ""} onValueChange={(v)=>onChange({ ...valores, categoria: v })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent className="max-h-64">
            <SelectItem value={null}>Categoria</SelectItem>
            {categorias.map((c)=> (
              <SelectItem key={c.nome} value={c.nome}>{c.icon} {c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Especialidade (ex: Dermatologia)"
          value={valores.especialidade || ""}
          onChange={(e)=>onChange({ ...valores, especialidade: e.target.value })}
          className="h-10 col-span-2 md:col-span-1"
        />

        <Select value={valores.preco || ""} onValueChange={(v)=>onChange({ ...valores, preco: v })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Preço" />
          </SelectTrigger>
          <SelectContent>
            {precoRanges.map((p)=> (
              <SelectItem key={p.v} value={p.v}>{p.l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={valores.rating || ""} onValueChange={(v)=>onChange({ ...valores, rating: v })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Avaliação" />
          </SelectTrigger>
          <SelectContent>
            {ratingOpts.map((r)=> (
              <SelectItem key={r.v} value={r.v}>{r.l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={valores.distancia || ""} onValueChange={(v)=>onChange({ ...valores, distancia: v })}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Distância" />
          </SelectTrigger>
          <SelectContent>
            {distanciaOpts.map((d)=> (
              <SelectItem key={d.v} value={d.v}>{d.l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="col-span-2 md:col-span-2 flex gap-2 justify-end">
          <Button variant="outline" className="h-10" onClick={onOpenAdvanced}>
            <SlidersHorizontal className="w-4 h-4 mr-2" /> Mais filtros
          </Button>
          <Button className="h-10 bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold border-2 border-[#2C2C2C]" onClick={onBuscar}>
            <Search className="w-4 h-4 mr-2" /> Buscar
          </Button>
        </div>
      </div>
    </div>
  );
}