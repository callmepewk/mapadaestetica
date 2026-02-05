import React, { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Wand2, Image as ImageIcon } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AdicionarTratamentoModal({ open, onClose, user, onAdded }) {
  const [loading, setLoading] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [lista, setLista] = useState([]); // ProcedimentoMestre
  const [query, setQuery] = useState("");
  const [descricaoIA, setDescricaoIA] = useState("");
  const [sugestoesIA, setSugestoesIA] = useState([]);
  const [selecionado, setSelecionado] = useState("");
  const [imgLoading, setImgLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const rows = await base44.entities.ProcedimentoMestre.list();
        setLista(Array.isArray(rows) ? rows : []);
      } catch {
        setLista([]);
      }
    })();
  }, [open]);

  const resultados = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return lista
      .filter((p) =>
        p.nome_tecnico?.toLowerCase().includes(q) ||
        (Array.isArray(p.categorias_dor_paciente) && p.categorias_dor_paciente.join(" ").toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [lista, query]);

  useEffect(() => {
    if (!open) return;
    const q = query.trim();
    if (q.length < 3 || resultados.length > 0) { setSugestoesIA([]); return; }
    const t = setTimeout(async () => {
      setBuscando(true);
      try {
        const schema = { type: 'object', properties: { sugestoes: { type: 'array', items: { type: 'string' } } } };
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: `Liste até 10 tratamentos/procedimentos de estética relacionados a: "${q}". Apenas nomes curtos e reais no Brasil.`,
          add_context_from_internet: true,
          response_json_schema: schema,
        });
        setSugestoesIA(Array.isArray(res?.sugestoes) ? res.sugestoes : []);
      } finally {
        setBuscando(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [open, query, resultados.length]);

  const handleDescIA = async (nome) => {
    setLoading(true);
    try {
      const schema = { type: 'object', properties: { descricao: { type: 'string' } } };
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Escreva uma descrição curta (até 400 caracteres) e comercial para o tratamento de estética: ${nome}.`,
        add_context_from_internet: true,
        response_json_schema: schema,
      });
      setDescricaoIA(res?.descricao || "");
    } finally {
      setLoading(false);
    }
  };

  const handleDescPorImagem = async (file) => {
    if (!file) return;
    setImgLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const schema = { type: 'object', properties: { nome: { type: 'string' }, descricao: { type: 'string' } } };
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Identifique o tratamento de estética na imagem e gere uma descrição curta (até 300 caracteres). Retorne nome e descricao.`,
        file_urls: [file_url],
        response_json_schema: schema,
      });
      if (res?.nome) setSelecionado(res.nome);
      if (res?.descricao) setDescricaoIA(res.descricao);
    } finally {
      setImgLoading(false);
    }
  };

  const handleSalvar = async () => {
    const nome = selecionado || query.trim();
    if (!nome) return;
    setLoading(true);
    try {
      const payload = {
        tipo: 'servico',
        nome,
        descricao: descricaoIA || 'Tratamento cadastrado pelo profissional.',
        categoria: 'Serviços',
        preco_texto: 'Consultar',
        status: 'ativo',
      };
      await base44.entities.Produto.create(payload);
      onAdded?.();
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>Adicionar Tratamento</DialogTitle>
        </DialogHeader>
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Digite o nome do tratamento (ex: Limpeza de Pele, Botox)"
              value={selecionado ? selecionado : query}
              onChange={(e) => { setSelecionado(""); setQuery(e.target.value); }}
              className="pl-9"
            />
          </div>

          {/* Resultados do banco */}
          {resultados.length > 0 && (
            <div className="grid sm:grid-cols-2 gap-2">
              {resultados.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelecionado(r.nome_tecnico)}
                  className={`text-left p-2 rounded border ${selecionado===r.nome_tecnico? 'border-[#F7D426] bg-yellow-50':'border-gray-200 hover:bg-gray-50'}`}
                >
                  {r.nome_tecnico}
                </button>
              ))}
            </div>
          )}

          {/* Sugestões IA */}
          {buscando && <div className="text-sm text-gray-500"><Loader2 className="inline w-4 h-4 animate-spin mr-1"/>Buscando sugestões…</div>}
          {!buscando && resultados.length === 0 && sugestoesIA.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-500">Sugestões encontradas na web</p>
              <div className="flex flex-wrap gap-2">
                {sugestoesIA.map((s) => (
                  <Badge key={s} variant="outline" className="cursor-pointer" onClick={() => setSelecionado(s)}>{s}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => handleDescIA(selecionado || query)} disabled={loading || !(selecionado||query)}>
              <Wand2 className="w-4 h-4 mr-2"/> Descrição por IA
            </Button>
            <label className="inline-flex items-center">
              <input type="file" className="hidden" accept="image/*" onChange={(e)=> e.target.files && handleDescPorImagem(e.target.files[0])} />
              <Button type="button" variant="outline" disabled={imgLoading}>
                {imgLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <ImageIcon className="w-4 h-4 mr-2"/>}
                Descrição pela imagem
              </Button>
            </label>
          </div>

          <div>
            <Textarea
              placeholder="Descrição (opcional)"
              value={descricaoIA}
              onChange={(e)=>setDescricaoIA(e.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSalvar} disabled={loading || !(selecionado||query)} className="bg-[#2C2C2C] text-[#F7D426] hover:bg-black">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}