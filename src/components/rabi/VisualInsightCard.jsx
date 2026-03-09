import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function VisualInsightCard({ title, subtitle, img, source }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all">
      <a href={img} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img src={img} alt={title} className="w-full h-full object-cover" />
        </div>
      </a>
      <CardContent className="p-4">
        <h4 className="font-semibold text-gray-900 text-sm md:text-base">{title}</h4>
        {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
        {source && <p className="text-[11px] text-gray-400 mt-2">Fonte: {source}</p>}
      </CardContent>
    </Card>
  );
}