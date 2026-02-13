import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import { HeartPulse, Calendar, Sparkles } from "lucide-react";

export default function PlannerWellnessPromo({ audience = "paciente" }) {
  const title = audience === 'paciente' ? 'Planner Wellness — cuide de você com constância' : 'Planner Wellness — fidelize com jornadas de 12 meses';
  const subtitle = audience === 'paciente' ? 'Check-ins, metas e rotina de autocuidado na nossa paleta visual.' : 'Crie planos guiados, registre check-ins e aumente recorrência.';
  return (
    <section className="py-8 bg-gradient-to-r from-[#FFF9E6] to-white">
      <div className="max-w-7xl mx-auto px-4">
        <Card className="border-2 border-[#F7D426] bg-white/90 backdrop-blur">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-[#F7D426]/20 flex items-center justify-center flex-shrink-0">
              <HeartPulse className="w-10 h-10 text-[#2C2C2C]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <Badge className="mb-2 bg-[#F7D426] text-[#2C2C2C] border-none font-bold">Planner Wellness</Badge>
              <h3 className="text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-1">{title}</h3>
              <p className="text-gray-700">{subtitle}</p>
            </div>
            <a href={createPageUrl('PlannerWellness')}>
              <Button className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold">
                Acessar Planner
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}