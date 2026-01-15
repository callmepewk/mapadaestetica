import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function PatrocinadoresGrid(){
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['patrocinadores-ativos'],
    queryFn: async () => base44.entities.Banner.filter({ status: 'ativo' }, '-created_date', 24),
    staleTime: 0,
  });
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  if (isLoading) {
    return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">{Array(6).fill(0).map((_,i)=>(<Card key={i} className="aspect-square bg-gray-100 animate-pulse"/>))}</div>;
  }

  if (!banners.length) {
    return <p className="text-gray-600 text-center py-6">Sem patrocinadores ativos no momento.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
        {banners.map((b) => (
          <button key={b.id} onClick={()=>{setSelected(b); setOpen(true);}} className="text-left">
            <Card className="relative aspect-square overflow-hidden bg-white hover:shadow-2xl transition-all border">
              <img src={b.imagem_banner || b.logo_empresa} alt={b.nome_empresa || b.titulo} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
                <p className="text-xs font-semibold truncate">{b.nome_empresa || b.titulo}</p>
                {b.descricao && <p className="text-[10px] opacity-90 line-clamp-2">{b.descricao}</p>}
              </div>
            </Card>
          </button>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selected.nome_empresa || selected.titulo}
                  {selected.plano_patrocinador && (
                    <Badge className="ml-2">{selected.plano_patrocinador.toUpperCase()}</Badge>
                  )}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                {selected.logo_empresa && (
                  <img src={selected.logo_empresa} alt="logo" className="h-16 object-contain" />
                )}
                {selected.descricao && <p className="text-sm text-gray-700">{selected.descricao}</p>}
                {selected.links && selected.links.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-500">Contatos e Links:</p>
                    <div className="flex flex-wrap gap-2">
                      {selected.links.map((l, i)=>(
                        <Button key={i} size="sm" variant="outline" onClick={()=> window.open(l.url, '_blank')}>
                          {l.titulo || l.tipo}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}