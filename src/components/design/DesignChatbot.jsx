import React from "react";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, Image as ImageIcon, Copy, CheckCircle2, Lock, Crown } from "lucide-react";

export default function DesignChatbot({ open, onClose, user }) {
  const [step, setStep] = React.useState(1); // 1: converter, 2: gerar
  const [sourceText, setSourceText] = React.useState("");
  const [convertedPrompt, setConvertedPrompt] = React.useState("");
  const [pastingPrompt, setPastingPrompt] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState("");
  const [erro, setErro] = React.useState("");
  const [uso, setUso] = React.useState({ usos_convertidos: 0, usos_imagens: 0 });

  const mesRef = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  }, []);

  const isProf = user?.tipo_usuario === 'profissional';
  const isPatroc = user?.tipo_usuario === 'patrocinador';
  const profPlan = user?.plano_ativo || 'free';
  const patrocPlan = user?.plano_patrocinador || 'nenhum';

  const limites = React.useMemo(() => {
    if (isProf) {
      if (profPlan === 'prime') return { imagens: 4 };
      if (profPlan === 'premium') return { imagens: 20 };
      return { imagens: 0 };
    }
    if (isPatroc) {
      if (patrocPlan === 'platina') return { imagens: Infinity };
      return { imagens: 0 };
    }
    return { imagens: 0 };
  }, [isProf, isPatroc, profPlan, patrocPlan]);

  const permitido = limites.imagens > 0;

  React.useEffect(() => {
    if (!open || !user) return;
    (async () => {
      try {
        const list = await base44.entities.DesignIAUso.filter({ user_email: user.email, mes_referencia: mesRef }, '-created_date', 1);
        if (list && list.length) {
          setUso({ usos_convertidos: list[0].usos_convertidos || 0, usos_imagens: list[0].usos_imagens || 0 });
        } else {
          setUso({ usos_convertidos: 0, usos_imagens: 0 });
        }
      } catch {}
    })();
  }, [open, user, mesRef]);

  const salvarUso = async (campo) => {
    try {
      const list = await base44.entities.DesignIAUso.filter({ user_email: user.email, mes_referencia: mesRef }, '-created_date', 1);
      if (list && list.length) {
        const rec = list[0];
        await base44.entities.DesignIAUso.update(rec.id, { [campo]: (rec[campo] || 0) + 1, ultimo_uso: new Date().toISOString() });
      } else {
        await base44.entities.DesignIAUso.create({ user_email: user.email, mes_referencia: mesRef, [campo]: 1, ultimo_uso: new Date().toISOString() });
      }
    } catch {}
  };

  const handleConverter = async () => {
    setErro("");
    if (!sourceText.trim()) { setErro('Digite o que você quer criar.'); return; }
    setLoading(true);
    try {
      const prompt = `Transforme o texto abaixo em um prompt PROFISSIONAL e ULTRA detalhado para gerar IMAGENS publicitárias de alta qualidade. Respeite exatamente a intenção do usuário e inclua: estilo artístico, iluminação, composição, câmera/lente, plano de fundo, cores, proporções, formato, qualidade, variações. Saída em português, clara e objetiva. Texto do usuário:\n\n${sourceText}`;
      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const out = typeof res === 'string' ? res : JSON.stringify(res);
      setConvertedPrompt(out);
      setStep(2);
      setUso(u => ({ ...u, usos_convertidos: (u.usos_convertidos||0)+1 }));
      await salvarUso('usos_convertidos');
    } finally {
      setLoading(false);
    }
  };

  const handleGerarImagem = async () => {
    setErro("");
    if (!permitido) { setErro('Seu plano não tem acesso a este recurso.'); return; }
    if (!pastingPrompt.trim() || pastingPrompt.trim().length < 40) { setErro('Cole o prompt convertido da Etapa 1 (mín. 40 caracteres).'); return; }
    if (Number.isFinite(limites.imagens) && uso.usos_imagens >= limites.imagens) { setErro('Você atingiu seu limite mensal de geração de imagens.'); return; }
    setLoading(true);
    try {
      const { url } = await base44.integrations.Core.GenerateImage({ prompt: pastingPrompt.trim() });
      if (url) {
        setImageUrl(url);
        setUso(u => ({ ...u, usos_imagens: (u.usos_imagens||0)+1 }));
        await salvarUso('usos_imagens');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(convertedPrompt); } catch {}
  };

  const reset = () => {
    setStep(1); setSourceText(""); setConvertedPrompt(""); setPastingPrompt(""); setImageUrl(""); setErro("");
  };

  return (
    <Dialog open={open} onOpenChange={() => { reset(); onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assistente de Design (2 etapas)</DialogTitle>
          <DialogDescription>1) Conversor de Prompts • 2) Gerador de Imagens – Apenas imagens no site; vídeos use o prompt gerado em outras IAs.</DialogDescription>
        </DialogHeader>

        {!user && (
          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-sm">Faça login para usar o assistente.</div>
        )}

        {user && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Badge variant="outline">Etapa {step} de 2</Badge>
                {isProf && (profPlan === 'prime' || profPlan === 'premium') && (
                  <Badge className="bg-purple-600 text-white">Profissional {profPlan.toUpperCase()} • Imagens {Number.isFinite(limites.imagens) ? `${uso.usos_imagens}/${limites.imagens}` : 'ilimitadas'}</Badge>
                )}
                {isPatroc && patrocPlan && (
                  <Badge className="bg-amber-500 text-black flex items-center gap-1"><Crown className="w-3 h-3"/>Patrocinador {patrocPlan.toUpperCase()}</Badge>
                )}
              </div>
              {!permitido && step === 2 && (
                <div className="text-xs text-red-600 flex items-center gap-2"><Lock className="w-4 h-4"/>Recurso exclusivo: Prime (4/mês), Premium (20/mês), Patrocinador Platina (ilimitado)</div>
              )}
            </div>

            {step === 1 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Descreva o que você quer (imagem):</label>
                <Textarea rows={5} placeholder="Ex: Banner para Instagram de clínica de estética com paleta neutra..." value={sourceText} onChange={(e)=>setSourceText(e.target.value)} />
                {erro && <div className="text-sm text-red-600">{erro}</div>}
                <Button onClick={handleConverter} disabled={loading} className="bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] font-bold">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Wand2 className="w-4 h-4 mr-2"/>}
                  Converter em Prompt Profissional
                </Button>
                {convertedPrompt && (
                  <div className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold">Prompt convertido</span>
                      <Button size="sm" variant="outline" onClick={handleCopy}><Copy className="w-4 h-4 mr-1"/>Copiar</Button>
                    </div>
                    <pre className="whitespace-pre-wrap text-sm">{convertedPrompt}</pre>
                    <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs font-semibold text-amber-800">
                      Copie o prompt acima e COLE na Etapa 2 para gerar a imagem exatamente como você pediu.
                    </div>
                    <div className="mt-3 text-right">
                      <Button onClick={()=>setStep(2)} variant="outline">Ir para Etapa 2</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3">
                <label className="text-sm font-medium">Cole aqui o prompt convertido (Etapa 1):</label>
                <Textarea rows={5} placeholder="Cole aqui o prompt convertido..." value={pastingPrompt} onChange={(e)=>setPastingPrompt(e.target.value)} />
                {erro && <div className="text-sm text-red-600">{erro}</div>}
                <Button onClick={handleGerarImagem} disabled={loading || !permitido} className="bg-purple-600 hover:bg-purple-700 text-white">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <ImageIcon className="w-4 h-4 mr-2"/>}
                  Gerar Imagem em Alta Qualidade
                </Button>
                {imageUrl && (
                  <div className="mt-3 space-y-2">
                    <img src={imageUrl} alt="imagem gerada" className="w-full rounded-lg border" />
                    <div className="text-green-700 text-sm flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/>Imagem gerada com sucesso!</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}