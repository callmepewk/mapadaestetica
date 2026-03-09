import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TrendsTopList({ title, items = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-1 list-decimal list-inside text-sm text-gray-700">
          {items.slice(0, 15).map((t, idx) => (
            <li key={idx} className="flex items-center justify-between">
              <span className="truncate">{t.term || t.name || t}</span>
              {typeof t.growthPct === 'number' && (
                <span className={`ml-2 text-xs ${t.growthPct >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {t.growthPct >= 0 ? '+' : ''}{Math.round(t.growthPct * 10) / 10}%
                </span>
              )}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}