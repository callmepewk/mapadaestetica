import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const planos = [
  {
    nome: "LIGHT",
    tipo: "light",
    preco: "Grátis",
    cor: "from-gray-400 to-gray-500",
    icone: Sparkles,
    destaque: false,
    beneficios: [
      "Sem mensalidade",
      "Checkup da Pele",
      "Oferece descontos e benefícios",
      "Acumula pontos ao consumir produtos ou serviços",
      "Aceito em mais de 3.000 serviços e profissionais",
      "CHÁ DA BELEZA - Voucher mensal não cumulativo"
    ],
    limitacoes: [
      "Pontos somente ao consumir",
      "Sem créditos automáticos"
    ]
  },
  {
    nome: "GOLD",
    tipo: "gold",
    preco: "Consulte",
    cor: "from-yellow-400 to-amber-500",
    icone: Star,
    destaque: true,
    beneficios: [
      "Programa Spa da Pele - incluso kit Beauty Drink",
      "12 sessões Skincare Mood* Clube+",
      "Crédito automático de 250 pontos/mês",
      "Oferece descontos e benefícios na Rede Parceiro",
      "Aceito em mais de 3.000 serviços",
      "Check da Pele - dermahelp/teleconsulta 50%",
      "Beauty Pass Máquinas da Beleza*",
      "CHÁ DA BELEZA - Voucher mensal cortesia"
    ]
  },
  {
    nome: "VIP",
    tipo: "vip",
    preco: "Consulte",
    cor: "from-purple-500 to-pink-500",
    icone: Crown,
    destaque: false,
    beneficios: [
      "SOFTLIFT CLUBERS",
      "Botox Day + Injetável AH",
      "Check da Up Pele anual",
      "Beauty Pass VIP Face Skincare",
      "Beauty Pass VIP Máquinas da Beleza",
      "CHA DA BELEZA - Beauty Drink Anytime",
      "Eventos exclusivos para sócios",
      "Programas de tratamento exclusivos"
    ]
  }
];

export default function Planos() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-pink-100 text-pink-700">
            Clube de Benefícios
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Escolha Seu Plano
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Cartão Clube+ - Descontos exclusivos, pontos e benefícios em toda rede parceira
          </p>
        </div>

        {/* How it Works */}
        <div className="mb-16">
          <Card className="border-none shadow-xl bg-gradient-to-br from-pink-50 to-rose-50">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-center mb-8">Como Funciona</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    1
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Escolha o Cartão</h3>
                  <p className="text-gray-600 text-sm">
                    Selecione o plano que melhor atende suas necessidades
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    2
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Associe-se</h3>
                  <p className="text-gray-600 text-sm">
                    Faça seu cadastro e receba seu cartão virtual
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                    3
                  </div>
                  <h3 className="font-semibold text-lg mb-2">Aproveite!</h3>
                  <p className="text-gray-600 text-sm">
                    Use seus benefícios e acumule pontos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {planos.map((plano, index) => {
            const IconComponent = plano.icone;
            return (
              <motion.div
                key={plano.tipo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={plano.destaque ? "md:-translate-y-4" : ""}
              >
                <Card className={`relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  plano.destaque ? "ring-4 ring-pink-500" : ""
                }`}>
                  {plano.destaque && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-1 text-sm font-semibold">
                      Mais Popular
                    </div>
                  )}

                  {/* Card Visual */}
                  <div className={`h-48 bg-gradient-to-br ${plano.cor} p-6 relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                    
                    <div className="relative z-10 text-white">
                      <IconComponent className="w-12 h-12 mb-4" />
                      <h3 className="text-3xl font-bold mb-2">{plano.nome}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold">{plano.preco}</span>
                        {plano.preco !== "Grátis" && <span className="text-sm opacity-80">Consulte</span>}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="space-y-3 mb-6">
                      {plano.beneficios.map((beneficio, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-600">{beneficio}</span>
                        </div>
                      ))}
                    </div>

                    {plano.limitacoes && (
                      <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 font-medium mb-2">Observações:</p>
                        {plano.limitacoes.map((lim, i) => (
                          <p key={i} className="text-xs text-gray-600">• {lim}</p>
                        ))}
                      </div>
                    )}

                    <Link to={createPageUrl("FaleConosco")}>
                      <Button
                        className={`w-full ${
                          plano.destaque
                            ? "bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
                            : "bg-gray-900 hover:bg-gray-800"
                        }`}
                      >
                        {plano.preco === "Grátis" ? "Começar Grátis" : "Saiba Mais"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Benefits Section */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Benefícios Exclusivos</h2>
              <p className="text-gray-300">
                Todos os planos incluem acesso à nossa rede de parceiros
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎁</span>
                </div>
                <h3 className="font-semibold mb-2">Descontos Exclusivos</h3>
                <p className="text-sm text-gray-300">
                  Em toda rede parceira
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">⭐</span>
                </div>
                <h3 className="font-semibold mb-2">Acumule Pontos</h3>
                <p className="text-sm text-gray-300">
                  Troque por prêmios
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🏆</span>
                </div>
                <h3 className="font-semibold mb-2">Eventos Exclusivos</h3>
                <p className="text-sm text-gray-300">
                  Para membros do clube
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">💝</span>
                </div>
                <h3 className="font-semibold mb-2">Ações Solidárias</h3>
                <p className="text-sm text-gray-300">
                  Apoie projetos sociais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-4">Tem dúvidas sobre qual plano escolher?</p>
          <Link to={createPageUrl("FaleConosco")}>
            <Button size="lg" variant="outline">
              Fale Conosco
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}