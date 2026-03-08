import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, CheckCircle2 } from "lucide-react";

export default function FaleConosco() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [ok, setOk] = useState(false);

  const handleEnviar = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !mensagem.trim()) return;
    setEnviando(true);
    setOk(false);
    try {
      await base44.integrations.Core.SendEmail({
        to: "pedro_hbfreitas@hotmail.com",
        subject: `Suporte - ${nome}`,
        body: `Nome: ${nome}\nEmail: ${email}\n\nMensagem:\n${mensagem}`,
      });
      setOk(true);
      setNome(""); setEmail(""); setMensagem("");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-blue-100 text-blue-800 border-blue-300">
            <Mail className="w-3 h-3 mr-1" /> Suporte por Email
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Fale Conosco</h1>
          <p className="text-gray-600 mt-1">Envie sua dúvida e nossa equipe responderá por email.</p>
        </div>

        <Card className="border-2 border-gray-200 shadow-xl">
          <CardContent className="p-6">
            <form onSubmit={handleEnviar} className="space-y-4">
              <div>
                <label className="text-sm text-gray-700">Nome</label>
                <Input value={nome} onChange={(e)=>setNome(e.target.value)} placeholder="Seu nome" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Email</label>
                <Input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="seu@email.com" />
              </div>
              <div>
                <label className="text-sm text-gray-700">Mensagem</label>
                <Textarea rows={5} value={mensagem} onChange={(e)=>setMensagem(e.target.value)} placeholder="Como podemos ajudar?" />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={enviando} className="bg-[#2C2C2C] text-[#F7D426]">
                  {enviando ? <Send className="w-4 h-4 mr-2 animate-pulse" /> : <Send className="w-4 h-4 mr-2" />} Enviar
                </Button>
                <Button type="button" variant="outline" onClick={()=> window.location.href = 'mailto:pedro_hbfreitas@hotmail.com'}>
                  Abrir no Email
                </Button>
                {ok && (
                  <span className="inline-flex items-center text-green-700 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Mensagem enviada com sucesso!
                  </span>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}