import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categoriasAgrupadas } from "./CategoriasData";

export default function CategoriaSelector({ value, onChange, categoriaOutros, onChangeOutros }) {
  return (
    <div>
      <Label className="text-sm">Categoria * <span className="ml-1">{(value||'').trim()? '✅':'❌'}</span></Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-1 h-10 sm:h-11 text-sm">
          <SelectValue placeholder="Selecione a categoria" />
        </SelectTrigger>
        <SelectContent className="max-h-[250px] sm:max-h-[350px]">
          {categoriasAgrupadas.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel className="text-xs text-gray-500">{group.label}</SelectLabel>
              {group.items.map((cat) => (
                <SelectItem key={cat} value={cat} className="text-sm">{cat}</SelectItem>
              ))}
            </SelectGroup>
          ))}
          <SelectItem value="Outros" className="text-sm">Outros</SelectItem>
        </SelectContent>
      </Select>
      {value === 'Outros' && (
        <div className="mt-2">
          <Label className="text-sm">Especifique a categoria</Label>
          <Input value={categoriaOutros || ''} onChange={(e)=>onChangeOutros?.(e.target.value)} placeholder="Digite aqui" className="h-10 sm:h-11 text-sm" />
          <p className="text-xs text-gray-500 mt-1">Ao escolher "Outros", informe a categoria que melhor descreve seu serviço.</p>
        </div>
      )}
    </div>
  );
}