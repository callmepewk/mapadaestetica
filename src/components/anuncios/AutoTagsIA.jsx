import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AutoTagsIA({ formData, setFormData }) {
  const [loading, setLoading] = useState(false);

  const gerar = async () => {
    if (!formData?.titulo && !formData?.descricao) return;
    setLoading(true);
    try {
      const prompt = `Você é um media buyer especialista em Meta Ads (Facebook/Instagram).\nAnalise o anúncio abaixo e gere de 6 a 10 palavras‑chave de ALTA INTENÇÃO DE LEAD, em português do Brasil, curtas (1-3 palavras), sem #, todas minúsculas.\nBaseie-se em: intenção de busca, melhores meta tags/descrições de páginas líderes e padrões de anúncios que convertem em Meta Ads no nicho de estética.\nDevolva apenas termos que um cliente em potencial usaria ao procurar esse serviço.\n\nDados do anúncio:\nTítulo: ${formData.titulo || '-'}\nCategoria: ${formData.categoria || '-'}\nSubcategoria: ${formData.subcategoria || '-'}\nCidade/UF: ${formData.cidade || '-'} / ${formData.estado || '-'}\nDescrição:\n${(formData.descricao || '').slice(0, 1200)}\n`;
      const res = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: true,
        response_json_schema: { type: "object", properties: { tags: { type: "array", items: { type: "string" } } } }
      });
      if (Array.isArray(res?.tags) && res.tags.length) {
        const clean = res.tags.map(t => String(t).trim().toLowerCase()).filter(Boolean);
        setFormData(prev => ({ ...prev, tags: clean }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if ((formData?.titulo || formData?.descricao) && (!formData?.tags || formData.tags.length === 0)) gerar();
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData?.titulo, formData?.descricao]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">Palavras‑chave / Hashtags</Label>
        <Button type="button" variant="outline" size="sm" onClick={gerar} disabled={loading || (!formData?.descricao && !formData?.titulo)} className="text-xs h-8">
          {loading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />}
          IA (Meta Ads)
        </Button>
      </div>
      <p className="text-xs text-gray-500 mb-2">
        Sugerimos termos com base em meta tags e padrões que convertem no Meta Ads (leads).
      </p>
      <Input
        value={(formData?.tags || []).join(", ")}
        onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean) }))}
        placeholder="Ex: botox, harmonização, preenchimento"
        className="h-10 sm:h-11 text-sm"
      />
    </div>
  );
}