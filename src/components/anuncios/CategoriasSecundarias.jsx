import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { categoriasAgrupadas } from "./CategoriasData";

export default function CategoriasSecundarias({ primaryCategory, value = [], onChange }) {
  const todas = Array.from(new Set(categoriasAgrupadas.flatMap((g) => g.items)));
  const opcoes = todas.filter((c) => c !== primaryCategory && c !== "Outros");

  const toggle = (cat, checked) => {
    const atual = Array.isArray(value) ? value : [];
    const novo = checked
      ? Array.from(new Set([...atual, cat]))
      : atual.filter((c) => c !== cat);
    onChange?.(novo);
  };

  return (
    <div>
      <Label className="text-sm">Categorias Secundárias (opcional)</Label>
      <p className="text-xs text-gray-500 mb-2">Selecione outras categorias que também descrevem seu anúncio.</p>
      <ScrollArea className="h-40 border rounded-lg p-3">
        <div className="grid sm:grid-cols-2 gap-2">
          {opcoes.map((cat) => (
            <div key={cat} className="flex items-center gap-2">
              <Checkbox
                id={`sec_${cat}`}
                checked={value.includes(cat)}
                onCheckedChange={(v) => toggle(cat, !!v)}
              />
              <Label htmlFor={`sec_${cat}`} className="text-sm cursor-pointer">
                {cat}
              </Label>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}