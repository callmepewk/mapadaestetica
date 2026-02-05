import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import AdicionarTratamentoModal from "../components/tratamentos/AdicionarTratamentoModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Star } from "lucide-react";
import SolicitarInclusaoDialog from "../components/solicitacoes/SolicitarInclusaoDialog";

export default function MeusTratamentos() {
  const [user, setUser] = useState(null);
  const [itens, setItens] = useState([]);
  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);

  useEffect(() => { (async () => { try { setUser(await base44.auth.me()); } catch {} })(); }, []);
  const carregar = async (uEmail) => {
    setLoading(true);
    const rows = await base44.entities.Produto.filter({ tipo: 'servico', created_by: uEmail }, '-updated_date', 200);
    const tratamentos = (rows||[]).filter(p => (p.tratamentos_inclusos_nomes && p.tratamentos_inclusos_nomes.length > 0) || (p.categoria && p.categoria.includes('Servi')));
    setItens(tratamentos);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.email) return;
    carregar(user.email);
  }, [user?.email]);

  if (!user) return (<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Meus Tratamentos</h1>
          <Button onClick={()=>setOpenAdd(true)} className="bg-[#2C2C2C] text-[#F7D426] hover:bg-black">Adicionar Tratamento</Button>
        </div>
        {loading ? (
          <div className="py-12 text-center text-gray-600"><Loader2 className="w-6 h-6 animate-spin inline mr-2"/>Carregando...</div>
        ) : itens.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-5xl mb-3">✨</div>
            <p className="text-gray-700">Você ainda não tem tratamentos cadastrados.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {itens.map((p)=> (
              <Card key={p.id} className="overflow-hidden border-2">
                <div className="h-40 bg-gray-100 flex items-center justify-center text-6xl">{p.imagens?.[0] ? (<img src={p.imagens[0]} alt={p.nome} className="h-full w-auto object-contain"/>) : '✨'}</div>
                <CardContent className="p-4 space-y-2">
                  <Badge variant="outline">{p.categoria || 'Tratamento'}</Badge>
                  <h3 className="font-bold line-clamp-2">{p.nome}</h3>
                  <p className="text-sm text-gray-600 line-clamp-3">{p.descricao}</p>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={()=>setSelecionado(p)}>Solicitar inclusão</Button>
                    <Button className="flex-1 bg-[#F7D426] text-[#2C2C2C] border-2 border-[#2C2C2C]"><Star className="w-4 h-4 mr-1"/>Destaque</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <SolicitarInclusaoDialog open={!!selecionado} onClose={()=>setSelecionado(null)} item={selecionado} user={user} />
      <AdicionarTratamentoModal open={openAdd} onClose={()=>setOpenAdd(false)} user={user} onAdded={()=>carregar(user.email)} />
    </div>
  );
}