import React from "react";
import { Card, CardContent } from "@/components/ui/card";

// Mostra 5 curiosidades que mudam a cada mês (usa índice do mês para variar a janela)
const CURIOSIDADES = [
  "O Brasil está entre os 3 maiores mercados de estética do mundo",
  "Procedimentos não invasivos cresceram mais de 20% no último ano",
  "Skincare é a categoria mais buscada entre 25 e 34 anos",
  "Clínicas com presença digital geram até 3x mais consultas",
  "Conteúdos com antes/depois têm 2,3x mais engajamento",
  "Ácido hialurônico segue entre os ativos favoritos em 2025",
  "Tecnologias de laser combinadas melhoram resultados clínicos",
  "Pix e carteiras digitais já são o meio de pagamento nº1 nas clínicas",
  "Vídeos curtos aumentam em 40% as conversões de agendamentos",
  "SEO local responde por mais de 60% das buscas por procedimentos"
];

export default function CuriosidadesMes(){
  const monthIndex = new Date().getMonth();
  const items = Array.from({length:5}).map((_,i)=> CURIOSIDADES[(monthIndex + i) % CURIOSIDADES.length]);
  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-6 items-center">
          <img
            src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=1200&q=80"
            alt="Tendências em Estética"
            className="rounded-2xl shadow-xl w-full object-cover"
          />
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-semibold mb-3">Curiosidades do mês</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">O mercado que não para de crescer</h2>
            <Card className="border-none shadow-none">
              <CardContent className="p-0">
                <ul className="space-y-2 text-gray-700 text-sm list-disc pl-5">
                  {items.map((c,i)=> (<li key={i}>{c}</li>))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}