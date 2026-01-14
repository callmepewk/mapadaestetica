import React from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, DollarSign } from "lucide-react";

export default function FloatingQuickbar({ user, cartCount = 0, onOpenCart }) {
  return (
    <div className="fixed bottom-4 right-4 z-[1000] flex flex-col items-end gap-2">
      <div className="flex items-center gap-2 bg-white/90 backdrop-blur border rounded-full shadow-lg px-3 py-2">
        <div className="flex items-center gap-1 text-[#F7D426]"><Star className="w-4 h-4"/><span className="font-bold text-sm">{user?.pontos_acumulados || 0}</span></div>
        <div className="w-px h-4 bg-gray-200"/>
        <div className="flex items-center gap-1 text-purple-600"><DollarSign className="w-4 h-4"/><span className="font-bold text-sm">{user?.beauty_coins || 0}</span></div>
      </div>
      <Button size="icon" className="rounded-full shadow-xl bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]" onClick={onOpenCart}>
        <div className="relative">
          <ShoppingCart className="w-5 h-5"/>
          {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-pink-600 text-white text-[10px] rounded-full px-1">{cartCount > 99 ? '99+' : cartCount}</span>}
        </div>
      </Button>
    </div>
  );
}