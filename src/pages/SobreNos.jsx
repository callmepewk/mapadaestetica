
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Users, Award, Target, Sparkles, ArrowRight, Check, ChevronDown, ChevronUp, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const planosClubeCliente = [
  {
    nome: "LIGHT",
    preco: "Grátis",
    cor: "from-amber-100 to-amber-200",
    textColor: "text-amber-900",
    beneficios: [
      "Acesso ao aplicativo localizador",
      "Busca de profissionais por categoria",
      "Visualização de avaliações",
      "Suporte por email",
      "Notificações de novidades"
    ]
  },
  {
    nome: "GOLD",
    preco: "R$ 49,90/mês",
    cor: "from-yellow-300 to-amber-400",
    textColor: "text-amber-900",
    destaque: true,
    beneficios: [
      "Todos os benefícios do LIGHT",
      "15% de desconto na rede parceira",
      "100 pontos mensais",
      "Agendamento prioritário",
      "Suporte por WhatsApp",
      "Acesso a promoções exclusivas",
      "Programa de indicação (ganhe pontos)",
      "Cashback de 5% em compras"
    ]
  },
  {
    nome: "VIP",
    preco: "R$ 99,90/mês",
    cor: "from-amber-400 to-yellow-600",
    textColor: "text-amber-950",
    beneficios: [
      "Todos os benefícios do GOLD",
      "25% de desconto na rede parceira",
      "300 pontos mensais",
      "Agendamento VIP (prioridade máxima)",
      "Suporte 24/7 dedicado",
      "Teleconsulta gratuita com especialistas",
      "Acesso a eventos exclusivos",
      "Tratamentos personalizados mensais",
      "Cashback de 10% em compras",
      "Cartão físico premium personalizado"
    ]
  }
];

export default function SobreNos() {
  const [mostrarPlanos, setMostrarPlanos] = useState(false);

  const handleSelecionarPlano = (plano) => {
    const mensagem = `Olá, tudo bem? Tenho interesse no plano ${plano.nome} do Clube da Beleza! 💆‍♀️✨`;
    const whatsapp = "5531972595643";
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Logo do Clube da Beleza */}
          <div className="mb-6 flex justify-center">
            <a 
              href="https://clubdabeleza.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe2/b53be18d1_clubeimg.jpeg"
                alt="Clube da Beleza"
                className="h-32 w-auto object-contain"
              />
            </a>
          </div>
          <Badge className="mb-4 bg-amber-600 text-white border-none">
            Sobre o Clube da Beleza
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-6">
            E se você pudesse viver o melhor que a sua beleza pode proporcionar?
          </h1>
          <p className="text-xl text-amber-800 mb-8">
            Somos o clube de benefícios mais completo do Brasil para quem ama cuidar da sua estética e bem-estar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setMostrarPlanos(!mostrarPlanos)}
              size="lg"
              className="bg-amber-600 text-white hover:bg-amber-700 font-bold"
            >
              {mostrarPlanos ? "Ocultar Planos Clube+" : "Ver Planos Clube+"}
              {mostrarPlanos ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
            </Button>
            <a 
              href="https://clubdabeleza.com" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-amber-600 text-amber-600 hover:bg-amber-50 font-bold"
              >
                Visitar Site Clube da Beleza
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Planos Clube+ */}
      {mostrarPlanos && (
        <section className="py-12 bg-gradient-to-br from-amber-50 to-yellow-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-amber-900 mb-4">
                Escolha Seu Plano do Clube da Beleza
              </h2>
              <p className="text-amber-800">
                Benefícios exclusivos para você cuidar da sua beleza com economia
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {planosClubeCliente.map((plano, index) => (
                <Card key={index} className={`border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all ${plano.destaque ? 'ring-4 ring-amber-500 transform scale-105' : ''}`}>
                  {plano.destaque && (
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-center py-2 font-bold text-sm">
                      🌟 MAIS POPULAR
                    </div>
                  )}
                  <div className={`h-32 bg-gradient-to-br ${plano.cor} p-6 flex flex-col justify-center items-center`}>
                    <h3 className={`text-2xl font-bold ${plano.textColor} mb-2`}>{plano.nome}</h3>
                    <p className={`text-3xl font-bold ${plano.textColor}`}>{plano.preco}</p>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-3 mb-6">
                      {plano.beneficios.map((beneficio, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{beneficio}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleSelecionarPlano(plano)}
                      className={`w-full ${plano.destaque ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700' : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600'} text-white`}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Selecionar Plano
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-4">
              Olá! Seja Bem-vindo(a)
            </h2>
            <p className="text-xl text-amber-800 max-w-3xl mx-auto">
              Um clube que oferece benefícios para os associados que consomem serviços e produtos 
              para sua estética e bem-estar. Além de fazer bem, também faz bem no seu bolso!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-3">Clube de Benefícios</h3>
                <p className="text-amber-800">
                  Descontos exclusivos, programa de fidelidade que converte seus gastos em pontos 
                  e prêmios para você e seus entes queridos
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-3">Aplicativo Localizador</h3>
                <p className="text-amber-800">
                  O primeiro app do mundo exclusivo para TODO o ramo da estética! 
                  Mais de 64 categorias de serviços, profissionais e produtos
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-amber-200 shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-amber-900 mb-3">Agendamento Online</h3>
                <p className="text-amber-800">
                  Serviço de teleatendimento para agendar, tirar dúvidas sobre tratamentos, 
                  baixar pontos e até teleconsulta com especialistas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What We Offer */}
          <Card className="border-none shadow-2xl bg-gradient-to-br from-gray-50 to-white mb-16">
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold text-center mb-8">
                O Que Oferecemos
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  "Fazer parte do mais completo clube privativo de beleza e estética",
                  "Ter descontos e benefícios exclusivos em toda rede parceira",
                  "Ter acesso direto aos melhores especialistas em mais de 64 categorias",
                  "Agendamento online para seu conforto",
                  "Serviço de atendimento e informações",
                  "Programas de tratamento exclusivos para membros Clube+",
                  "Eventos e tratamentos exclusivos para sócios",
                  "Acumular pontos e resgatar prêmios incríveis",
                  "Estar apoiando eventos sociais e solidários",
                  "Poder realizar tratamentos com segurança e eficácia"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mt-0.5">
                      <Sparkles className="w-4 h-4 text-pink-600" />
                    </div>
                    <p className="text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mission & Values */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="border-none shadow-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="2xl font-bold mb-4">Nossa Missão</h3>
                <p className="text-gray-600 leading-relaxed">
                  Conectar pessoas aos melhores profissionais de estética do Brasil, 
                  oferecendo uma plataforma completa com benefícios exclusivos, 
                  descontos e um programa de fidelidade que valoriza cada cliente.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h3 className="2xl font-bold mb-4">Nossos Valores</h3>
                <p className="text-gray-600 leading-relaxed">
                  Qualidade, compromisso, inovação e cuidado. Acreditamos que todo mundo 
                  merece ter acesso aos melhores serviços de estética e bem-estar, 
                  com economia e segurança.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statistics - ATUALIZADO COM CORES */}
          <Card className="border-none shadow-2xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold text-center mb-12">
                Clube da Beleza em Números
              </h2>
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold mb-2">64+</div>
                  <p className="text-white/80">Categorias de Serviços</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">3000+</div>
                  <p className="text-white/80">Profissionais Parceiros</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">100%</div>
                  <p className="text-white/80">Satisfação Garantida</p>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">24/7</div>
                  <p className="text-white/80">Suporte Disponível</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-amber-900 mb-6">
            Pronto para Transformar Sua Experiência com Beleza?
          </h2>
          <p className="text-xl text-amber-800 mb-8">
            Junte-se a milhares de pessoas que já fazem parte do Clube da Beleza
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("FaleConosco")}>
              <Button size="lg" className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white">
                Fale Conosco
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("Anuncios")}>
              <Button size="lg" variant="outline" className="border-amber-600 text-amber-600 hover:bg-amber-50">
                Ver Profissionais
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
