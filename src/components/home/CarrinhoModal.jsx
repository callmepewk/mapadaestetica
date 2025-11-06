import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingCart, Trash2, Send, X } from "lucide-react";

export default function CarrinhoModal({ open, onClose, carrinho, onRemoverItem, onLimparCarrinho }) {
  const navigate = useNavigate();

  const calcularTotal = () => {
    return carrinho.reduce((total, item) => {
      const preco = item.preco_promocional || item.preco || 0;
      return total + preco;
    }, 0);
  };

  const finalizarCompra = () => {
    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    let mensagem = `🛍️ *PEDIDO - MAPA DA ESTÉTICA*\n\n`;
    mensagem += `📋 *ITENS DO PEDIDO:*\n\n`;

    carrinho.forEach((item, index) => {
      const preco = item.preco_promocional || item.preco || 0;
      mensagem += `${index + 1}. *${item.nome}*\n`;
      mensagem += `   Categoria: ${item.categoria}\n`;
      if (preco > 0) {
        mensagem += `   Valor: R$ ${preco.toFixed(2)}\n`;
      } else {
        mensagem += `   Valor: ${item.preco_texto || "Consultar"}\n`;
      }
      mensagem += `\n`;
    });

    const total = calcularTotal();
    if (total > 0) {
      mensagem += `\n💰 *TOTAL: R$ ${total.toFixed(2)}*\n\n`;
    }

    mensagem += `📞 Gostaria de finalizar este pedido!`;

    const whatsapp = "5531972595643";
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');

    // Limpar carrinho após enviar
    onLimparCarrinho();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <ShoppingCart className="w-6 h-6 text-pink-600" />
            Meu Carrinho
          </DialogTitle>
          <DialogDescription>
            Revise seus itens antes de finalizar o pedido
          </DialogDescription>
        </DialogHeader>

        {carrinho.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Seu carrinho está vazio</p>
            <Button
              onClick={() => {
                onClose();
                navigate(createPageUrl("Produtos"));
              }}
              className="bg-gradient-to-r from-pink-600 to-rose-600"
            >
              Ir para Produtos
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="max-h-96 pr-4">
              <div className="space-y-4">
                {carrinho.map((item, index) => {
                  const preco = item.preco_promocional || item.preco || 0;
                  return (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {item.imagens && item.imagens.length > 0 ? (
                          <img
                            src={item.imagens[0]}
                            alt={item.nome}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl">
                            {item.categoria?.includes("Serviço") ? "💼" : "🎁"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">
                          {item.nome}
                        </h4>
                        <Badge variant="outline" className="mb-2 text-xs">
                          {item.categoria}
                        </Badge>
                        <p className="text-sm font-bold text-pink-600">
                          {preco > 0 ? `R$ ${preco.toFixed(2)}` : item.preco_texto || "Consultar"}
                        </p>
                      </div>

                      <Button
                        onClick={() => onRemoverItem(index)}
                        size="icon"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-pink-600">
                  {calcularTotal() > 0 ? `R$ ${calcularTotal().toFixed(2)}` : "A consultar"}
                </span>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={onLimparCarrinho}
                  variant="outline"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Carrinho
                </Button>
                <Button
                  onClick={finalizarCompra}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Finalizar Pedido
                </Button>
              </div>

              <p className="text-xs text-center text-gray-500">
                Você será redirecionado para o WhatsApp para finalizar o pedido
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}