import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ImageWithLoader from "../common/ImageWithLoader";
import { ShoppingCart, Crown, Star, DollarSign } from "lucide-react";

function determinarFaixaPreco(preco) {
  if (preco == null || isNaN(preco)) return '';
  if (preco <= 500) return '$';
  if (preco <= 1000) return '$$';
  if (preco <= 2000) return '$$$';
  if (preco <= 5000) return '$$$$';
  return '$$$$$';
}

function pontosPorFaixa(f) {
  return { '$': 1, '$$': 5, '$$$': 10, '$$$$': 50, '$$$$$': 100 }[f] || 0;
}

export default function ProductCard({ produto, onClick }) {
  const basePrice = produto.preco_promocional || produto.preco;
  const faixa = determinarFaixaPreco(basePrice);
  const pontos = pontosPorFaixa(faixa);
  const isExclusivo = produto.preco === 0 || !produto.preco || produto.requer_assinatura;

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-none group cursor-pointer" onClick={onClick}>
      <div className="relative h-44 bg-gray-100">
        {produto.imagens?.length ? (
          <ImageWithLoader src={produto.imagens[0]} alt={produto.nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-sm text-gray-600">1200 × 900</div>
        )}
        {produto.em_destaque && (
          <Badge className="absolute top-2 right-2 bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]">
            <Star className="w-3 h-3 mr-1 fill-[#2C2C2C]" /> Destaque
          </Badge>
        )}
        {isExclusivo && (
          <Badge className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold">
            <Crown className="w-3 h-3 mr-1" /> EXCLUSIVO
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">{produto.categoria || 'Produto'}</Badge>
          {produto.programa_12_meses && (
            <Badge className="bg-amber-100 text-amber-800">Programa 12 meses</Badge>
          )}
        </div>
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{produto.nome}</h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{produto.descricao}</p>
        <div className="flex items-center justify-between pt-3 border-t">
          <div>
            {basePrice > 0 ? (
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-gray-900">R$ {Number(basePrice).toFixed(2)}</span>
                {produto.preco_promocional && produto.preco && (
                  <span className="text-sm text-gray-500 line-through">R$ {Number(produto.preco).toFixed(2)}</span>
                )}
              </div>
            ) : (
              <span className="text-sm font-bold text-purple-600">{produto.preco_texto || 'Consultar'}</span>
            )}
          </div>
          <Badge className="bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]">
            <DollarSign className="w-3 h-3 mr-1" /> +{pontos} pts
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}