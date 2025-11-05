import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Rocket, Crown, Check, ArrowRight } from "lucide-react";

export default function ImpulsionarAnuncioModal({ open, onClose, anuncio }) {
  const navigate = useNavigate();
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);

  const opcoesImpulsionamento = [
    {
      id: "basico",
      nome: "Básico",
      preco: 97,
      duracao: "7 dias",
      beneficios: [
        "+50% de visualizações",
        "Destaque em busca local",
        "Prioridade nos resultados",
        "Badge 'Impulsionado'"
      ],
      cor: "from-blue-500 to-cyan-500",
      icon: <Zap className="w-6 h-6" />
    },
    {
      id: "premium",
      nome: "Premium",
      preco: 197,
      duracao: "15 dias",
      beneficios: [
        "+150% de visualizações",
        "Destaque na Home",
        "Prioridade máxima",
        "Badge 'Destaque Premium'",
        "Relatório de performance"
      ],
      cor: "from-purple-500 to-pink-500",
      icon: <TrendingUp className="w-6 h-6" />,
      popular: true
    },
    {
      id: "turbo",
      nome: "Turbo",
      preco: 397,
      duracao: "30 dias",
      beneficios: [
        "+300% de visualizações",
        "Destaque permanente",
        "Topo de todas as buscas",
        "Badge 'Turbo Boost'",
        "Relatório detalhado diário",
        "Suporte prioritário"
      ],
      cor: "from-orange-500 to-red-500",
      icon: <Rocket className="w-6 h-6" />
    }
  ];

  const handleImpulsionar = (opcao) => {
    const mensagem = `Olá! Quero impulsionar meu anúncio "${anuncio.titulo}" com o plano ${opcao.nome} por ${opcao.duracao} - R$ ${opcao.preco}`;
    window.open(`https://wa.me/5531972595643?text=${encodeURIComponent(mensagem)}`, '_blank');
    onClose();
  };

  const handleVerPlanos = () => {
    onClose();
    navigate(createPageUrl("Planos"));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold flex items-center gap-2">
            <Zap className="w-8 h-8 text-[#F7D426]" />
            Impulsionar Anúncio
          </DialogTitle>
          <DialogDescription className="text-base">
            Aumente a visibilidade do seu anúncio "<strong>{anuncio?.titulo}</strong>" e receba mais clientes
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 py-6">
          {opcoesImpulsionamento.map((opcao) => (
            <Card 
              key={opcao.id}
              className={`border-2 transition-all cursor-pointer ${
                opcaoSelecionada?.id === opcao.id 
                  ? 'border-[#F7D426] shadow-xl scale-105' 
                  : 'border-gray-200 hover:border-[#F7D426] hover:shadow-lg'
              } ${opcao.popular ? 'ring-4 ring-purple-200' : ''}`}
              onClick={() => setOpcaoSelecionada(opcao)}
            >
              {opcao.popular && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center py-2 font-bold text-sm">
                  ⭐ MAIS POPULAR
                </div>
              )}
              <CardContent className="p-6">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${opcao.cor} flex items-center justify-center text-white mx-auto mb-4`}>
                  {opcao.icon}
                </div>

                <h3 className="text-2xl font-bold text-center mb-2">{opcao.nome}</h3>
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold text-[#2C2C2C]">R$ {opcao.preco}</p>
                  <p className="text-sm text-gray-500">{opcao.duracao} de impulsionamento</p>
                </div>

                <ul className="space-y-2 mb-6">
                  {opcao.beneficios.map((beneficio, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{beneficio}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleImpulsionar(opcao)}
                  className={`w-full bg-gradient-to-r ${opcao.cor} text-white font-bold hover:opacity-90`}
                >
                  Escolher {opcao.nome}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Sugestão de Upgrade de Plano */}
        <div className="mt-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <Crown className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-purple-900 mb-2">
                💡 Dica: Que tal garantir visibilidade sempre?
              </h3>
              <p className="text-purple-800 mb-4">
                Ao invés de impulsionar suas postagens pontualmente, você pode <strong>garantir maior visibilidade SEMPRE</strong> com nossos planos <strong>Diamante</strong> e <strong>Platina</strong>!
              </p>
              <ul className="space-y-2 mb-4 text-sm text-purple-800">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600" />
                  <span><strong>Plano Diamante:</strong> Até 1.000.000 impressões/mês + Topo fixo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600" />
                  <span><strong>Plano Platina:</strong> Impressões ILIMITADAS + Exclusividade de categoria</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-purple-600" />
                  <span>Melhor custo-benefício no longo prazo</span>
                </li>
              </ul>
              <Button
                onClick={handleVerPlanos}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold"
              >
                <Crown className="w-4 h-4 mr-2" />
                Ver Planos Diamante e Platina
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}