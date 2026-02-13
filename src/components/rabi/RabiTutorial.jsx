import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, BarChart3, MapPin, Calendar, Download, Bell } from "lucide-react";

export default function RabiTutorial() {
  const Item = ({ title, children, icon: Icon }) => (
    <Card className="border-2 border-gray-200 bg-white/80">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FFF9E6] flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-[#2C2C2C]" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
            <div className="text-sm text-gray-700 leading-relaxed">{children}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="bg-white rounded-2xl border-2 border-[#F7D426]/30 p-6 md:p-8">
      <div className="flex items-center gap-2 mb-4">
        <Badge className="bg-[#F7D426] text-[#2C2C2C] font-bold">Guia Completo</Badge>
        <span className="text-sm text-gray-600">R.A.B.I — Radar Analítico de Beleza e Inovação</span>
      </div>
      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Como usar o R.A.B.I do início ao fim</h3>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <Item title="Objetivo do R.A.B.I" icon={Sparkles}>
          O R.A.B.I antecipa tendências, mostra frequência/recorrência e consolida insights do mercado de estética para você tomar decisões melhores sobre comunicação, portfólio e preços.
        </Item>
        <Item title="Acesso e versão" icon={Calendar}>
          Acesse em Radares (menu). Conteúdos avançados podem depender do seu plano. Você pode gerar relatórios, ativar alertas e importar dados externos (GA4/Trends) quando desejar.
        </Item>
        <Item title="Tendências (o que é)" icon={TrendingUp}>
          Leitura do que está crescendo nas buscas/consultas. Palavras‑chave, categorias e cidades são ranqueadas por ganho recente de interesse.
        </Item>
        <Item title="Frequência (o que é)" icon={BarChart3}>
          Entende a constância do interesse por tema e ajuda a identificar sazonais e oportunidades de calendário (lançamentos/ações).
        </Item>
        <Item title="Mapa & Cidades" icon={MapPin}>
          Descubra onde a demanda está se concentrando. Use isso para segmentar anúncios, planejar eventos e parcerias locais.
        </Item>
        <Item title="Relatórios e Alertas" icon={Bell}>
          Gere relatórios com 1 clique (PDF/E‑mail) e ative alertas para receber novidades em cadência. Útil para time e parceiros.
        </Item>
      </div>

      <div className="mt-8">
        <h4 className="text-xl font-bold text-gray-900 mb-3">Passo a passo rápido</h4>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-gray-700">
          <li>Abra Radares e veja o herói com o resumo do período.</li>
          <li>Em “Tendências”, observe os Top termos e categorias. Foque nos que mais crescem.</li>
          <li>Use “Adoção por Categoria” para entender onde há mais oferta e onde ainda dá para se diferenciar.</li>
          <li>Cheque “Cidades com Maior Oferta” para ajustar suas campanhas locais.</li>
          <li>Na seção de Integrações, importe CSV do GA4/Trends para cruzar as leituras do seu tráfego.</li>
          <li>Gere um Relatório e compartilhe com a equipe. Ative alertas diários/semanais/mensais se quiser acompanhamento contínuo.</li>
        </ol>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <Item title="Nomenclaturas essenciais" icon={Sparkles}>
          <ul className="list-disc pl-5 space-y-1">
            <li>Tendência: termo/categoria com crescimento recente de interesse.</li>
            <li>Frequência: quão constante é o interesse em um tema.</li>
            <li>Relevância: combinação de volume, crescimento e aderência ao público.</li>
            <li>Adoção por Categoria: quantos anúncios/itens existem por categoria.</li>
          </ul>
        </Item>
        <Item title="Métricas e interpretação" icon={BarChart3}>
          <ul className="list-disc pl-5 space-y-1">
            <li>Top consultas (30 dias): termos mais buscados recentemente.</li>
            <li>Distribuição por categoria/cidade: onde há maior concentração de oferta.</li>
            <li>GA4 (views): performance de páginas do seu site/app.</li>
            <li>Google Trends: interesse externo ao longo do tempo por termo.</li>
          </ul>
        </Item>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button className="bg-[#2C2C2C] text-[#F7D426] border-2 border-[#2C2C2C]" size="sm">
          <Download className="w-4 h-4 mr-2" /> Baixar guia PDF
        </Button>
        <span className="text-xs text-gray-500">Precisa de ajuda? Fale com nosso time para uma sessão guiada.</span>
      </div>
    </section>
  );
}