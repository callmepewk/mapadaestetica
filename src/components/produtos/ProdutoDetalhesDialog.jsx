import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Star, ShoppingCart } from "lucide-react";
import ImageWithLoader from "@/components/common/ImageWithLoader";

export default function ProdutoDetalhesDialog({ open, onClose, produto }) {
  if (!produto) return null;
  const precoBase = produto.preco_promocional || produto.preco || 0;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{produto.nome}</DialogTitle>
          <DialogDescription>{produto.categoria}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            {produto.imagens?.[0] ? (
              <ImageWithLoader src={produto.imagens[0]} alt={produto.nome} className="w-full h-64 object-cover rounded-lg" />
            ) : (
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center text-5xl">🎁</div>
            )}
          </div>
          <div className="space-y-3">
            {produto.em_destaque && (
              <Badge className="bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]"><Star className="w-3 h-3 mr-1"/>Destaque</Badge>
            )}
            {(produto.mostrar_tag_clube || produto.beauty_club_exclusivo) && (
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"><Crown className="w-3 h-3 mr-1"/>Parceiro Clube+</Badge>
            )}
            <p className="text-sm text-gray-600">{produto.descricao}</p>
            {produto.marca && <p className="text-xs text-gray-500">Marca: {produto.marca}</p>}
            {produto.pontos_necessarios ? (
              <p className="text-sm">Resgate por: <strong>{produto.pontos_necessarios} pontos</strong></p>
            ) : (
              <p className="text-sm">Ganha pontos ao comprar</p>
            )}
            <div className="pt-2 border-t">
              {precoBase > 0 ? (
                <p className="text-xl font-bold">R$ {precoBase.toFixed(2)}</p>
              ) : (
                <p className="text-lg font-bold text-purple-600">{produto.preco_texto || 'Consultar'}</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}