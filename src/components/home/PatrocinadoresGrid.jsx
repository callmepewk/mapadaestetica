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
        <Card key={b.id} className="aspect-square flex items-center justify-center bg-white hover:shadow-xl transition-shadow border-none">
          <CardContent className="p-4 flex items-center justify-center w-full h-full">
            {b.logo_empresa || b.imagem_banner ? (
              <img src={b.logo_empresa || b.imagem_banner} alt={b.nome_empresa || b.titulo} className="max-h-full max-w-full object-contain" />
            ) : (
              <div className="text-center">
                <div className="text-2xl mb-1">🏢</div>
                <p className="text-xs text-gray-500">{b.nome_empresa || b.titulo}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}