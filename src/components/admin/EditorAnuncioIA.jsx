import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Image as ImageIcon, Check, X } from "lucide-react";

export default function EditorAnuncioIA({ open, onClose, anuncio, onSaved }) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState("");
  const [galeria, setGaleria] = useState([]);
  const [prompt, setPrompt] = useState("");
  const [gerando, setGerando] = useState(false);
  const [gerandoImgs, setGerandoImgs] = useState(false);
  const [qtd, setQtd] = useState(3);

  useEffect(()=>{
    if (anuncio) {
      setTitulo(anuncio.titulo || "");
      setDescricao(anuncio.descricao || "");
      setImagem(anuncio.imagem_principal || anuncio.logo || "");
      setGaleria(anuncio.imagens_galeria || []);
    }
  }, [anuncio]);

  const gerarTextoIA = async () => {
    setGerando(true);
    try {
      const p = prompt && prompt.trim().length > 3
        ? `Você é redator do Mapa da Estética. Com base no prompt do admin, gere um título conciso e uma descrição de até 120 caracteres para um anúncio público. Responda como JSON {"titulo":"...","descricao":"..."}.\nPrompt: ${prompt}`
        : `Você é redator do Mapa da Estética. Gere um título conciso e uma descrição (até 120 caracteres) para o anúncio "${anuncio?.titulo||''}" na categoria ${anuncio?.categoria||''}. Responda como JSON {"titulo":"...","descricao":"..."}.`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt: p });
      let obj = null;
      if (typeof res === 'string') {
        try { obj = JSON.parse(res); } catch { obj = null; }
      } else {
        obj = res;
      }
      if (obj) {
        if (obj.titulo) setTitulo(obj.titulo);
        if (obj.descricao) setDescricao(obj.descricao);
      }
    } finally { setGerando(false); }
  };

  const gerarImagemIA = async () => {
    setGerandoImgs(true);
    try {
      const p = prompt && prompt.trim().length > 3
        ? prompt
        : `Imagem publicitária bonita e limpa para ${anuncio?.categoria||'estética'}, foco em ${titulo||anuncio?.titulo||'serviços'}, fundo suave, sem textos.`;
      const { url } = await base44.integrations.Core.GenerateImage({ prompt: p });
      setImagem(url);
    } finally { setGerandoImgs(false); }
  };

  const gerarCarrosselIA = async () => {
    setGerandoImgs(true);
    try {
      const imgs = [];
      for (let i=0;i<Math.min(5, Math.max(1, parseInt(qtd)||3));i++) {
        const { url } = await base44.integrations.Core.GenerateImage({ prompt: `${prompt || 'campanha de estética'} - variação ${i+1}` });
        imgs.push(url);
      }
      setGaleria(imgs);
    } finally { setGerandoImgs(false); }
  };

  const salvar = async () => {
    if (!anuncio) return;
    const data = {
      titulo,
      descricao,
      imagem_principal: imagem,
      imagens_galeria: galeria,
    };
    await base44.entities.Anuncio.update(anuncio.id, data);
    onSaved && onSaved(data);
    onClose && onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" /> Edição com IA
          </DialogTitle>
          <DialogDescription>
            Substitua título, descrição ou imagens com IA. Também é possível criar um carrossel a partir de um prompt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Prompt (opcional)</Label>
            <Textarea value={prompt} onChange={(e)=> setPrompt(e.target.value)} placeholder="Descreva o estilo/tema da campanha..." />
            <div className="flex gap-2 mt-2">
              <Button onClick={gerarTextoIA} disabled={gerando} variant="outline">
                {gerando ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                Gerar Título/Descrição
              </Button>
              <Button onClick={gerarImagemIA} disabled={gerandoImgs} variant="outline">
                {gerandoImgs ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <ImageIcon className="w-4 h-4 mr-2"/>}
                Gerar Imagem Principal
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Título</Label>
              <Input value={titulo} onChange={(e)=> setTitulo(e.target.value)} />
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea rows={3} value={descricao} onChange={(e)=> setDescricao(e.target.value)} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Imagem Principal</Label>
              {imagem ? (
                <img src={imagem} alt="principal" className="w-full h-40 object-cover rounded border" />
              ) : (
                <Card className="h-40 bg-gray-50 border-dashed border-2"><CardContent className="h-full flex items-center justify-center text-gray-500"><ImageIcon className="w-5 h-5 mr-2"/>Sem imagem</CardContent></Card>
              )}
              <Input type="file" accept="image/*" className="mt-2" onChange={async (e)=>{ const f=e.target.files?.[0]; if(!f) return; const {file_url}= await base44.integrations.Core.UploadFile({file:f}); setImagem(file_url);} }/>
            </div>
            <div>
              <Label>Carrossel (até 5)</Label>
              <div className="grid grid-cols-5 gap-1 mb-2">
                {galeria.slice(0,5).map((u,i)=> (
                  <img key={i} src={u} alt={`g${i}`} className="h-16 w-full object-cover rounded border" />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" min={1} max={5} value={qtd} onChange={(e)=> setQtd(e.target.value)} className="w-24" />
                <Button onClick={gerarCarrosselIA} disabled={gerandoImgs} variant="outline">
                  {gerandoImgs ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Sparkles className="w-4 h-4 mr-2"/>}
                  Gerar Carrossel por IA
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}><X className="w-4 h-4 mr-2"/>Cancelar</Button>
          <Button onClick={salvar} className="bg-purple-600 hover:bg-purple-700"><Check className="w-4 h-4 mr-2"/>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}