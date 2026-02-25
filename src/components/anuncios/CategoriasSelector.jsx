import React from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { categoriasAgrupadas } from "./CategoriasData";

export default function CategoriasSelector({
  principal,
  extras = [],
  onAdd,
  onRemove,
  max = 5,
}) {
  const atuais = [principal, ...extras].filter(Boolean);
  const restantes = categoriasAgrupadas.map(g => ({
    label: g.label,
    items: g.items.filter(i => !atuais.includes(i))
  }));

  return (
    <div>
      <Label className="text-sm">Categorias (até {max}) *</Label>
      <div className="p-3 bg-gray-50 rounded-lg border">
        <div className="flex flex-wrap gap-2 mb-2">
          {atuais.length ? (
            atuais.map((cat, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {cat}
                <X className="w-3 h-3 ml-2 cursor-pointer hover:text-red-600" onClick={() => onRemove(cat)} />
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-500">Nenhuma categoria adicionada</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select onValueChange={(value) => onAdd(value)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Adicionar categoria" />
            </SelectTrigger>
            <SelectContent className="max-h-[260px]">
              {restantes.map((group) => (
                <SelectGroup key={group.label}>
                  <SelectLabel className="text-xs text-gray-500">{group.label}</SelectLabel>
                  {group.items.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-gray-500">A primeira é a principal; você pode adicionar mais {max - 1}.</p>
        </div>
      </div>
    </div>
  );
}