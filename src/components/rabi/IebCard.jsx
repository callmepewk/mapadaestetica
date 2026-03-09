import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function IebCard({ value = 0, label = '—', updatedAt }) {
  const color = value >= 120 ? 'bg-emerald-600' : value >= 80 ? 'bg-amber-500' : value >= 50 ? 'bg-blue-600' : 'bg-gray-600';
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-lg">Índice Estético Brasileiro (IEB)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm ${color}`}>IEB {value}</div>
            <div className="mt-2 text-sm text-gray-600">{label}</div>
          </div>
          {updatedAt && <div className="text-xs text-gray-400">Atualizado: {new Date(updatedAt).toLocaleString()}</div>}
        </div>
      </CardContent>
    </Card>
  );
}