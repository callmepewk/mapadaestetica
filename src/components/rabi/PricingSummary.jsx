import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PricingSummary({ procedures = [] }) {
  const top = procedures.slice(0, 8);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Preço Médio — Procedimentos (Brasil)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-3">
          {top.map((p, i) => (
            <div key={i} className="p-3 rounded-lg border bg-white/60">
              <div className="font-medium text-gray-900">{p.name}</div>
              <div className="text-sm text-gray-700">média R$ {Math.round((p.price_mean_br || 0))}
                {p.price_low_br && p.price_high_br && (
                  <span className="text-gray-500"> — faixa R$ {Math.round(p.price_low_br)}–{Math.round(p.price_high_br)}</span>
                )}
              </div>
              {p.sources && p.sources.length > 0 && (
                <div className="mt-1 text-[11px] text-gray-500">Fontes: {p.sources.slice(0,2).join(', ')}{p.sources.length>2?'…':''}</div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}