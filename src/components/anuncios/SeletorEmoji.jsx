import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export const emojisDisponiveis = [
  "💆", "💆‍♀️", "💆‍♂️", "💅", "💇", "💇‍♀️", "💇‍♂️", "✂️", "💄", "💋",
  "👄", "👁️", "👃", "🦷", "🧖", "🧖‍♀️", "🧖‍♂️", "🧴", "🧼", "🧽",
  "🪒", "💉", "💊", "🩹", "🩺", "⚕️", "🏥", "🏨", "🛁", "🚿",
  "✨", "⭐", "🌟", "💫", "🌸", "🌺", "🌻", "🌼", "🌷", "🌹",
  "🌿", "🍃", "☘️", "🎀", "🎁", "💝", "💖", "💗", "💓", "💞",
  "🦋", "🌈", "☀️", "🌙", "⚡", "🔥", "💧", "❄️", "🧊", "🎨",
  "🖌️", "✏️", "📝", "📋", "📌", "🎯", "🏆", "👑", "💎", "💍",
  "🔬", "🧬", "🧪", "⚗️", "🩻", "🔍", "📊", "📈", "🎓", "🏅"
];

export default function SeletorEmoji({ open, onClose, onSelect, emojiAtual }) {
  const [busca, setBusca] = useState("");
  const emojisFiltrados = busca ? emojisDisponiveis.filter((emoji) => emoji.includes(busca)) : emojisDisponiveis;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">🎨 Selecionar Ícone para o Mapa</DialogTitle>
          <DialogDescription>Escolha o emoji que representará seu anúncio no mapa da estética</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {emojiAtual && (
            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200 text-center">
              <p className="text-sm text-blue-800 mb-2">Emoji atual:</p>
              <span className="text-6xl">{emojiAtual}</span>
            </div>
          )}

          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 p-2">
              {emojisFiltrados.map((emoji, index) => (
                <button
                  key={index}
                  onClick={() => { onSelect(emoji); onClose(); }}
                  className={`text-4xl p-3 rounded-lg hover:bg-blue-100 transition-all hover:scale-110 ${emoji === emojiAtual ? 'bg-blue-200 ring-2 ring-blue-500' : 'bg-gray-50'}`}
                  title={`Emoji ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}