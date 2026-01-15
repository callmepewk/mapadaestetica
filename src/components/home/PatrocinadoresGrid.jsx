import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';

export default function PatrocinadoresGrid(){
  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['patrocinadores-ativos'],
    queryFn: async () => base44.entities.Banner.filter({ status: 'ativo' }, '-created_date', 24),
    staleTime: 0,
  });

  if (isLoading) {
    return <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">{Array(6).fill(0).map((_,i)=>(<Card key={i} className="aspect-square bg-gray-100 animate-pulse"/>))}</div>;
  }

  if (!banners.length) {
    return <p className="text-gray-600 text-center py-6">Sem patrocinadores ativos no momento.</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
      {banners.map((b) => (
        <Card key={b.id} className="relative aspect-square overflow-hidden bg-white hover:shadow-2xl transition-all border">
          <img src={b.imagem_banner || b.logo_empresa} alt={b.nome_empresa || b.titulo} className="w-full h-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-white">
            <p className="text-xs font-semibold truncate">{b.nome_empresa || b.titulo}</p>
            {b.descricao && <p className="text-[10px] opacity-90 line-clamp-2">{b.descricao}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}