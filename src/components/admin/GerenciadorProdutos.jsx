import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, CheckCircle, XCircle, Clock, Trash2, Edit, AlertCircle } from 'lucide-react';

const STATUS_CONFIG = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  inativo: { label: 'Inativo', color: 'bg-gray-100 text-gray-800', icon: XCircle },
  rejeitado: { label: 'Rejeitado', color: 'bg-red-100 text-red-800', icon: XCircle },
  esgotado: { label: 'Esgotado', color: 'bg-orange-100 text-orange-800', icon: AlertCircle },
};

export default function GerenciadorProdutos() {
  const queryClient = useQueryClient();
  const [aba, setAba] = useState('pendente');
  const [busca, setBusca] = useState('');
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [mostrarModalEdicao, setMostrarModalEdicao] = useState(false);
  const [produtoPreview, setProdutoPreview] = useState(null);
  const [mostrarModalPreview, setMostrarModalPreview] = useState(false);

  const { data: produtos = [], isLoading } = useQuery({
    queryKey: ['admin-produtos'],
    queryFn: () => base44.entities.Produto.list('-created_date', 1000),
  });

  const mutation = useMutation({
    mutationFn: async ({ id, data }) => base44.entities.Produto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-produtos']);
      setMostrarModalEdicao(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => base44.entities.Produto.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-produtos']);
    },
  });

  const handleStatusChange = (id, status) => {
    mutation.mutate({ id, data: { status } });
  };

  const handleEdit = (produto) => {
    setProdutoEditando({ ...produto });
    setMostrarModalEdicao(true);
  };
  
  const handleSaveEdit = () => {
    const { id, ...dataToUpdate } = produtoEditando;
    mutation.mutate({ id, data: dataToUpdate });
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este produto permanentemente?')) {
      deleteMutation.mutate(id);
    }
  };

  const produtosFiltrados = useMemo(() => {
    return produtos
      .filter(p => p.status === aba)
      .filter(p => 
        busca ? p.nome.toLowerCase().includes(busca.toLowerCase()) || p.created_by.toLowerCase().includes(busca.toLowerCase()) : true
      );
  }, [produtos, aba, busca]);

  return (
    <>
      <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Produtos e Serviços</CardTitle>
        <p className="text-sm text-gray-500">Aprove, edite ou recuse produtos e serviços enviados por patrocinadores.</p>
      </CardHeader>
      <CardContent>
        <Tabs value={aba} onValueChange={setAba}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pendente">Pendentes ({produtos.filter(p=>p.status === 'pendente').length})</TabsTrigger>
            <TabsTrigger value="ativo">Ativos ({produtos.filter(p=>p.status === 'ativo').length})</TabsTrigger>
            <TabsTrigger value="rejeitado">Rejeitados ({produtos.filter(p=>p.status === 'rejeitado').length})</TabsTrigger>
            <TabsTrigger value="inativo">Inativos ({produtos.filter(p=>p.status === 'inativo').length})</TabsTrigger>
          </TabsList>
          <div className="my-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar por nome ou email do criador..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : (
            <TabsContent value={aba}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto/Serviço</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum item nesta categoria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    produtosFiltrados.map(p => {
                      const StatusIcon = STATUS_CONFIG[p.status]?.icon || Clock;
                      return (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.nome}</TableCell>
                          <TableCell className="text-sm text-gray-600">{p.created_by}</TableCell>
                          <TableCell>R$ {p.preco?.toFixed(2) || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_CONFIG[p.status]?.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {STATUS_CONFIG[p.status]?.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                             <div className="flex gap-2 justify-end">
                               <Button size="sm" variant="outline" onClick={() => { setProdutoPreview(p); setMostrarModalPreview(true); }}>Ver</Button>
                               {p.status === 'pendente' && (
                                 <>
                                   <Button size="sm" variant="success" onClick={() => handleStatusChange(p.id, 'ativo')}><CheckCircle className="w-4 h-4 mr-1"/> Aprovar</Button>
                                   <Button size="sm" variant="destructive" onClick={() => handleStatusChange(p.id, 'rejeitado')}><XCircle className="w-4 h-4 mr-1"/> Rejeitar</Button>
                                 </>
                               )}
                               <Button size="sm" variant="outline" onClick={() => handleEdit(p)}><Edit className="w-4 h-4 mr-1"/> Editar</Button>
                               <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                             </div>
                           </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          )}
        </Tabs>
        
        {produtoEditando && (
          <Dialog open={mostrarModalEdicao} onOpenChange={setMostrarModalEdicao}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editando: {produtoEditando.nome}</DialogTitle>
                <DialogDescription>Ajuste os detalhes do produto/serviço abaixo.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nome" className="text-right">Nome</Label>
                  <Input id="nome" value={produtoEditando.nome} onChange={e => setProdutoEditando({...produtoEditando, nome: e.target.value})} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="preco" className="text-right">Preço</Label>
                  <Input id="preco" type="number" value={produtoEditando.preco} onChange={e => setProdutoEditando({...produtoEditando, preco: parseFloat(e.target.value) || 0})} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                   <select
                      id="status"
                      value={produtoEditando.status}
                      onChange={(e) => setProdutoEditando({ ...produtoEditando, status: e.target.value })}
                      className="col-span-3 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                    >
                      {Object.keys(STATUS_CONFIG).map(statusKey => (
                        <option key={statusKey} value={statusKey}>{STATUS_CONFIG[statusKey].label}</option>
                      ))}
                    </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setMostrarModalEdicao(false)}>Cancelar</Button>
                <Button onClick={handleSaveEdit} disabled={mutation.isPending}>
                  {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>

    {produtoPreview && (
      <Dialog open={mostrarModalPreview} onOpenChange={setMostrarModalPreview}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Prévia: {produtoPreview.nome}</DialogTitle>
            <DialogDescription>Visualização completa do produto/serviço.</DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded overflow-hidden bg-gray-100">
              {produtoPreview.imagens && produtoPreview.imagens.length > 0 ? (
                <img
                  src={produtoPreview.imagens[0]}
                  alt={produtoPreview.nome}
                  className="w-full h-64 object-cover"
                  onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'; }}
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-5xl text-gray-400">📦</div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2"><Badge variant="outline">{produtoPreview.categoria || 'Sem categoria'}</Badge></p>
              <p className="text-sm text-gray-700 whitespace-pre-line mb-3">{produtoPreview.descricao || 'Sem descrição'}</p>
              <div className="space-y-2 text-sm">
                {typeof produtoPreview.preco === 'number' && <p><strong>Preço:</strong> R$ {produtoPreview.preco.toFixed(2)}</p>}
                {typeof produtoPreview.pontos_necessarios === 'number' && <p><strong>Pontos necessários:</strong> {produtoPreview.pontos_necessarios}</p>}
                {typeof produtoPreview.estoque === 'number' && <p><strong>Estoque:</strong> {produtoPreview.estoque}</p>}
                {produtoPreview.marca && <p><strong>Marca:</strong> {produtoPreview.marca}</p>}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
}