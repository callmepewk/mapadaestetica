import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Loader2, CheckCircle, ArrowLeft } from "lucide-react";

export default function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [carrinho, setCarrinho] = useState([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [endereco, setEndereco] = useState({ rua: "", numero: "", complemento: "", bairro: "", cidade: "", estado: "", cep: "" });
  const [linhaCartao, setLinhaCartao] = useState("clube"); // clube | beauty
  const [planoCartao, setPlanoCartao] = useState("basic"); // basic | premium | vip | pro | exclusive

  // MOVIDO PARA CIMA: calcular total antes de usar em payloadPagamento
  const totalPedido = useMemo(() => {
    return carrinho.reduce((sum, item) => sum + (item.preco_promocional || item.preco || 0), 0);
  }, [carrinho]);
  const payloadPagamento = useMemo(() => {
    const plano = linhaCartao === 'clube' ? planoCartao : (planoCartao === 'basic' ? 'basic' : planoCartao);
    const texto = `beautybanking://payment?line=${linhaCartao}&plan=${plano}&total=${totalPedido.toFixed(2)}`;
    return texto;
  }, [linhaCartao, planoCartao, totalPedido]);

  useEffect(() => {
    const carregar = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setNome(u?.full_name || "");
        setTelefone(u?.telefone || u?.whatsapp || "");
      } catch {}
    };
    carregar();
    try {
      const salvo = localStorage.getItem("carrinho_mapa_estetica");
      if (salvo) setCarrinho(JSON.parse(salvo));
    } catch {}
  }, []);

  const criarPedidosMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Faça login para continuar");
      if (!carrinho.length) throw new Error("Carrinho vazio");

      const registros = carrinho.map((item) => {
        const valor = item.preco_promocional || item.preco || 0;
        return {
          usuario_email: user.email,
          produto_id: item.id || `custom_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
          produto_nome: item.nome,
          tipo: item.tipo || (item.categoria?.includes("Servi") ? "servico" : "produto"),
          quantidade: 1,
          valor_total: Number(valor) || 0,
          status_pedido: "aguardando_pagamento",
          endereco_entrega: valor > 0 ? { ...endereco } : undefined,
          data_compra: new Date().toISOString(),
          observacoes: observacoes || undefined,
        };
      });

      // Tenta bulkCreate; se não suportar, cria um a um
      try {
        const created = await base44.entities.PedidoProduto.bulkCreate(registros);
        return created;
      } catch {
        const criados = [];
        for (const r of registros) {
          const c = await base44.entities.PedidoProduto.create(r);
          criados.push(c);
        }
        return criados;
      }
    },
    onSuccess: (created) => {
      // Limpa carrinho e segue para agradecimento
      localStorage.removeItem("carrinho_mapa_estetica");
      setCarrinho([]);
      const ids = (created || []).map((c) => c.id).join(",");
      navigate(`${createPageUrl("AgradecimentoCompra")}?pedidos=${encodeURIComponent(ids)}&total=${encodeURIComponent(totalPedido)}`);
    },
  });

  const handleConfirmar = () => {
    if (!user) {
      alert("Por favor, faça login para finalizar o pedido.");
      base44.auth.redirectToLogin(createPageUrl("Checkout"));
      return;
    }
    if (!carrinho.length) {
      alert("Seu carrinho está vazio.");
      navigate(createPageUrl("Produtos"));
      return;
    }
    criarPedidosMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-pink-600" /> Checkout
          </h1>
          <Button variant="outline" onClick={() => navigate(createPageUrl("Produtos"))}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para a loja
          </Button>
        </div>

        {/* Resumo */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 border-none shadow-lg">
            <CardHeader>
              <CardTitle>1. Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              {carrinho.length === 0 ? (
                <p className="text-gray-600">Seu carrinho está vazio.</p>
              ) : (
                <div className="space-y-4">
                  {carrinho.map((item, idx) => {
                    const preco = item.preco_promocional || item.preco || 0;
                    return (
                      <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {item.imagens?.[0] ? (
                            <img src={item.imagens[0]} alt={item.nome} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl">🎁</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 line-clamp-1">{item.nome}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{item.categoria}</Badge>
                            {item.tipo && <Badge className="bg-pink-100 text-pink-700 text-xs">{item.tipo}</Badge>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-pink-600">{preco > 0 ? `R$ ${preco.toFixed(2)}` : (item.preco_texto || "Consultar")}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-pink-200 shadow-xl">
           <CardHeader>
             <CardTitle>2. Pagamento e Resumo</CardTitle>
           </CardHeader>
           <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-semibold">{totalPedido > 0 ? `R$ ${totalPedido.toFixed(2)}` : "A consultar"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Frete</span>
                <span className="font-semibold">A combinar</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-pink-600">{totalPedido > 0 ? `R$ ${totalPedido.toFixed(2)}` : "—"}</span>
              </div>

              <div className="pt-2">
                <p className="text-xs text-gray-500">Após confirmar, seu pedido ficará "Aguardando Pagamento" para validação pela nossa equipe. Você receberá confirmação no próprio site.</p>
              </div>

              {/* Pagamento via Beauty Banking */}
              <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                <p className="font-semibold text-gray-800 mb-2">Pagar com Cartões do Clube da Beleza / Beauty Club</p>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button onClick={()=>setLinhaCartao('clube')} className={`text-xs py-2 rounded border ${linhaCartao==='clube'?'bg-purple-600 text-white border-purple-600':'bg-white'}`}>Clube da Beleza</button>
                  <button onClick={()=>setLinhaCartao('beauty')} className={`text-xs py-2 rounded border ${linhaCartao==='beauty'?'bg-pink-600 text-white border-pink-600':'bg-white'}`}>Beauty Club</button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  { (linhaCartao==='clube' ? ['basic','premium','vip'] : ['basic','pro','exclusive']).map(p => (
                    <button key={p} onClick={()=>setPlanoCartao(p)} className={`text-xs py-2 rounded border capitalize ${planoCartao===p?'bg-black text-white':'bg-white'}`}>{p}</button>
                  )) }
                </div>
                <div className="flex items-center gap-3">
                  <img alt="QR" className="w-28 h-28 border rounded" src={`https://chart.googleapis.com/chart?chs=280x280&cht=qr&chl=${encodeURIComponent(payloadPagamento)}`} />
                  <div className="text-xs text-gray-700">
                    <p className="mb-2">Escaneie no app <strong>Beauty Banking</strong> ou clique abaixo:</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={()=>navigator.clipboard.writeText(payloadPagamento)}>Copiar Código</Button>
                      <a href="https://beautybanking.base44.app" target="_blank" rel="noreferrer">
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">Abrir Beauty Banking</Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dados do comprador */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>3. Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
              <Input placeholder="Telefone/WhatsApp" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
              <Textarea placeholder="Observações do pedido (opcional)" value={observacoes} onChange={(e) => setObservacoes(e.target.value)} rows={3} />
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>4. Endereço (opcional)</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-3">
              <Input placeholder="Rua" value={endereco.rua} onChange={(e) => setEndereco({ ...endereco, rua: e.target.value })} />
              <Input placeholder="Número" value={endereco.numero} onChange={(e) => setEndereco({ ...endereco, numero: e.target.value })} />
              <Input placeholder="Complemento" value={endereco.complemento} onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })} />
              <Input placeholder="Bairro" value={endereco.bairro} onChange={(e) => setEndereco({ ...endereco, bairro: e.target.value })} />
              <Input placeholder="Cidade" value={endereco.cidade} onChange={(e) => setEndereco({ ...endereco, cidade: e.target.value })} />
              <Input placeholder="Estado" value={endereco.estado} onChange={(e) => setEndereco({ ...endereco, estado: e.target.value })} />
              <Input placeholder="CEP" value={endereco.cep} onChange={(e) => setEndereco({ ...endereco, cep: e.target.value })} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" onClick={() => navigate(createPageUrl("Produtos"))}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Continuar comprando
          </Button>
          <Button onClick={handleConfirmar} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
            {criarPedidosMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processando...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" /> Confirmar Pedido
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}