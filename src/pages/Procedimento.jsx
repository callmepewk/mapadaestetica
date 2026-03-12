import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import CardAnuncio from '@/components/anuncios/CardAnuncio';

export default function ProcedimentoPage(){
  const { slug } = useParams();
  const termo = decodeURIComponent(slug||'').toLowerCase();
  const { data: anuncios = [] } = useQuery({
    queryKey: ['proc-page', termo],
    queryFn: async () => {
      const all = await base44.entities.Anuncio.filter({ status: 'ativo' }, '-created_date', 500);
      return (all||[]).filter(a =>
        (a.procedimentos_servicos||[]).some(p=> (p||'').toLowerCase().includes(termo)) ||
        (a.tags||[]).some(t=> (t||'').toLowerCase().includes(termo)) ||
        (a.titulo||'').toLowerCase().includes(termo)
      );
    },
    initialData: []
  });
  return (
    <section className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 capitalize">Procedimento: {termo}</h1>
        <p className="text-sm text-gray-600 mb-4">Profissionais e clínicas que oferecem este procedimento</p>
        {anuncios.length === 0 ? (
          <Card className="border-dashed"><CardContent className="p-6 text-gray-600">Nenhum anúncio encontrado para este procedimento.</CardContent></Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {anuncios.map(a=> <CardAnuncio key={a.id} anuncio={a} />)}
          </div>
        )}
      </div>
    </section>
  );
}