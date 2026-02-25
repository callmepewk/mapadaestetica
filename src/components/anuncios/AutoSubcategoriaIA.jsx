import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AutoSubcategoriaIA({ formData, setFormData }) {
  const [loading, setLoading] = useState(false);

  const gerar = async () => {
    if (!formData?.descricao) return;
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Leia a descrição abaixo e retorne a subcategoria mais específica (1 frase curta, 2-4 palavras) que melhor representa o serviço/procedimento estético descrito. Se possível, mantenha termos usados no Brasil.\n\nCategoria: ${formData.categoria || '-'}\nDescrição:\n${formData.descricao}`,
        add_context_from_internet: false,
        response_json_schema: { type: "object", properties: { subcategoria: { type: "string" } } }
      });
      if (res?.subcategoria) {
        setFormData(prev => ({ ...prev, subcategoria: String(res.subcategoria).trim() }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (formData?.descricao && !formData?.subcategoria) gerar();
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.descricao]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm">Subcategoria</Label>
        <Button type="button" variant="outline" size="sm" onClick={gerar} disabled={!formData?.descricao || loading} className="text-xs h-8">
          {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
          IA Auto
        </Button>
      </div>
      <Input
        value={formData?.subcategoria || ""}
        onChange={(e) => setFormData(prev => ({ ...prev, subcategoria: e.target.value }))}
        placeholder="Ex: Preenchimento Labial"
        className="h-10 sm:h-11 text-sm"
      />
    </div>
  );
}