import React, { useEffect, useRef, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

export default function ChatPedido({ pedidoId, onClose }) {
  const [user, setUser] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    (async () => { try { setUser(await base44.auth.me()); } catch {} })();
  }, []);

  useEffect(() => {
    if (!pedidoId) return;
    (async () => {
      const m = await base44.entities.ChatMensagem.filter({ pedido_id: pedidoId }, '-created_date', 200);
      setMsgs(m.reverse());
    })();
    const unsub = base44.entities.ChatMensagem.subscribe((e) => {
      if (e.data?.pedido_id === pedidoId && e.type === 'create') {
        setMsgs((prev) => [...prev, e.data]);
        setTimeout(() => listRef.current?.lastElementChild?.scrollIntoView({ behavior: 'smooth' }), 50);
      }
    });
    return () => unsub?.();
  }, [pedidoId]);

  const send = async () => {
    if (!text.trim() || !pedidoId || !user) return;
    await base44.entities.ChatMensagem.create({ pedido_id: pedidoId, remetente_email: user.email, texto: text.trim() });
    setText("");
  };

  return (
    <Card className="border-2">
      <CardContent className="p-0 flex flex-col h-[60vh]">
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
          {msgs.map((m, i) => {
            const mine = m.remetente_email === user?.email;
            return (
              <div key={i} className={`max-w-[80%] ${mine ? 'ml-auto text-white bg-pink-600' : 'mr-auto bg-white border'} rounded-lg px-3 py-2`}> 
                <div className="text-[10px] opacity-80">{m.remetente_email}</div>
                <div className="text-sm">{m.texto}</div>
              </div>
            );
          })}
        </div>
        <div className="p-3 border-t flex gap-2">
          <Input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Escreva uma mensagem" onKeyDown={(e)=>{ if(e.key==='Enter') send(); }} />
          <Button onClick={send} className="bg-pink-600 hover:bg-pink-700"><Send className="w-4 h-4"/></Button>
        </div>
      </CardContent>
    </Card>
  );
}