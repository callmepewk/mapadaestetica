import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShoppingCart, ArrowRight } from "lucide-react";
import SolicitarInclusaoDialog from "../components/solicitacoes/SolicitarInclusaoDialog";

export default function MeusProdutos() {
  const [user, setUser] = useState(null);
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} })(); }, []);
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const rows = await base44.entities.Produto.filter({ tipo: 'produto', created_by: user.email }, '-updated_date', 200);
      setItens(rows || []);
      setLoading(false);
    })();
  }, [user?.email]);

  if (!user) return (<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Meus Produtos</h1>
          <Button onClick={()=>window.location.href = '/'+encodeURIComponent('AdicionarProduto')} className="bg-[#2C2C2C] text-[#F7D426] hover:bg-black">
            Adicionar novo
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-gray-600"><Loader2 className="w-6 h-6 animate-spin inline mr-2"/>Carregando...</div>
        ) : itens.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-3">🎁</div>
            <p className="text-gray-700">Você ainda não cadastrou produtos.</p>
            <Button onClick={()=>window.location.href = '/'+encodeURIComponent('AdicionarProduto')} className="mt-4 bg-pink-600 hover:bg-pink-700 text-white">Cadastrar meu primeiro produto</Button>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itens.map((p)=> (
              <Card key={p.id} className="overflow-hidden border-2">
                <div className="h-40 bg-gray-100 flex items-center justify-center text-6xl">{p.imagens?.[0] ? (<img src={p.imagens[0]} alt={p.nome} className="h-full w-auto object-contain"/>) : '🎁'}</div>
                <CardContent className="p-4 space-y-2">
                  <Badge variant="outline">{p.categoria || 'Sem categoria'}</Badge>
                  <h3 className="font-bold line-clamp-2">{p.nome}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{p.descricao}</p>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="font-semibold">R$ {Number(p.preco||0).toFixed(2)}</span>
                    <span className="text-gray-500">Estoque: {p.estoque||0}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={()=>setSelecionado(p)}>Solicitar inclusão</Button>
                    <Button className="flex-1 bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]">Ver no site <ArrowRight className="w-4 h-4 ml-1"/></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-900">
          <p className="font-semibold mb-1">Como funciona a Loja de Pontos?</p>
          <p>Conversão automática: 1 real = 1 ponto. Ex.: R$ 199,90 ≈ 200 pontos.</p>
        </div>
      </div>

      <SolicitarInclusaoDialog open={!!selecionado} onClose={()=>setSelecionado(null)} item={selecionado} user={user} />
    </div>
  );
}