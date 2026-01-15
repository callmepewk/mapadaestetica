import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Share2, MessageCircle, Instagram, CheckCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function BoostProfile() {
  const [count, setCount] = React.useState(0);
  const goal = 10;
  React.useEffect(() => {
    const saved = Number(localStorage.getItem("compartilhamentos_perfil_count") || 0);
    setCount(isNaN(saved) ? 0 : saved);
  }, []);

  const shareLink = typeof window !== 'undefined' ? `${window.location.origin}${createPageUrl("Perfil")}` : createPageUrl("Perfil");
  const message = `Confira meu perfil no Mapa da Estética e conheça meus serviços: ${shareLink}`;

  const inc = () => {
    setCount((prev) => {
      const next = Math.min(goal, prev + 1);
      localStorage.setItem("compartilhamentos_perfil_count", String(next));
      base44.analytics.track({ eventName: "profile_share_click", properties: { count: next } });
      return next;
    });
  };

  const shareNative = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Meu perfil no Mapa da Estética", text: message, url: shareLink }); } catch {}
      inc();
    } else {
      shareWhatsApp();
    }
  };

  const shareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    inc();
  };

  const shareInstagram = async () => {
    try { await navigator.clipboard.writeText(message); } catch {}
    window.open("https://www.instagram.com/direct/new/", "_blank");
    inc();
    alert("Mensagem copiada. Cole no Direct do Instagram.");
  };

  const percent = Math.round((count / goal) * 100);

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Share2 className="w-4 h-4"/> Turbine seu perfil</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-3">Compartilhe seu perfil com 10 pessoas e aumente seu engajamento agora.</p>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Progresso: {count}/{goal}</span>
          {count >= goal && (
            <span className="flex items-center gap-1 text-green-600 text-sm"><CheckCircle className="w-4 h-4"/> Concluído</span>
          )}
        </div>
        <Progress value={percent} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <Button onClick={shareNative} className="w-full bg-pink-600 hover:bg-pink-700 text-white">Compartilhar (nativo)</Button>
          <Button onClick={shareWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white"><MessageCircle className="w-4 h-4 mr-2"/> WhatsApp</Button>
          <Button onClick={shareInstagram} variant="outline" className="w-full text-gray-800 border-gray-300 hover:bg-gray-50"><Instagram className="w-4 h-4 mr-2"/> Instagram Direct</Button>
        </div>
        <p className="text-xs text-gray-500 mt-3">O link do seu perfil será compartilhado. No Instagram, a mensagem é copiada para você colar no Direct.</p>
      </CardContent>
    </Card>
  );
}