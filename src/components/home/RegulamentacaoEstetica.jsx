import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Scale, FileCheck2 } from "lucide-react";

export default function RegulamentacaoEstetica() {
  return (
    <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <Badge className="mb-3 bg-blue-100 text-blue-800">Institucional</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Organizando a Estética com Segurança e Regulamentação</h2>
          <p className="text-gray-700 mt-3 max-w-3xl mx-auto">
            O Mapa da Estética nasceu para organizar o mercado com segurança, transparência e respeito às regulamentações profissionais. 
            Ajudamos pacientes a encontrar profissionais qualificados para cada tipo de tratamento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-2 border-blue-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2"><ShieldCheck className="w-5 h-5"/>Profissionais Regulamentados</div>
              <p className="text-sm text-gray-700">Valorizamos todas as profissões regulamentadas e respeitamos seus escopos de atuação.</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-emerald-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2"><FileCheck2 className="w-5 h-5"/>Informação Correta ao Paciente</div>
              <p className="text-sm text-gray-700">Explicamos limitações de cada categoria profissional e indicamos quem pode fazer cada procedimento.</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-amber-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-amber-700 font-semibold mb-2"><Scale className="w-5 h-5"/>Mercado Organizado</div>
              <p className="text-sm text-gray-700">Promovemos segurança e responsabilidade na contratação de serviços estéticos.</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Exemplos de Escopo Profissional</h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li><strong>Biomédico:</strong> pode atuar em estética.</li>
                <li><strong>Biomédico Esteta:</strong> habilitação específica para procedimentos mais avançados, inclusive alguns invasivos.</li>
                <li><strong>Dentistas com especialização em estética:</strong> podem atuar em estética facial, não em tratamentos corporais.</li>
                <li>Outros profissionais possuem escopos definidos por seus conselhos.</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Nosso Compromisso</h3>
              <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                <li>Valorizar todos os profissionais regulamentados</li>
                <li>Informar corretamente os pacientes</li>
                <li>Organizar o mercado da estética com responsabilidade</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}