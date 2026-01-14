import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Users, Award, Target, Sparkles, ArrowRight, Check, ChevronDown, ChevronUp, MessageCircle, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const planosClubeCliente = [
  {
    nome: "LIGHT",
    preco: "R$ 1,00",
    periodo: "/dia",
    imagemCartao: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/370b33900_cartoclube1.jpeg",
    corFundo: "from-orange-200 via-pink-200 to-blue-200",
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
    preco: "12x de R$ 397",
    precoOriginal: "R$ 997",
    badge: "🔥 Oferta Black November",
    descricao: "O plano mais completo",
    imagemCartao: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/66e4013fa_cartoclube2.jpeg",
    corFundo: "from-gray-800 to-gray-900",
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
    preco: "Sob Consulta",
    descricao: "Experiência premium completa e personalizada",
    imagemCartao: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/6ef43fbb5_cartoclube3.jpeg",
    corFundo: "from-gray-900 to-black",
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

  const handleSaberMaisLaserCode = () => {
    const mensagem = "Olá, gostaria de saber mais sobre o aplicativo LaserCode Pro!";
    const whatsapp = "5531972595643";
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const handleSaberMaisDrSpok = () => {
    const mensagem = "Olá, gostaria de saber mais sobre o aplicativo Dr. Spok!";
    const whatsapp = "5531972595643";
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          {/* Logo do Clube da Beleza */}
          <div className="mb-6 flex justify-center">
            <a 
              href="https://clube-da-beleza.base44.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:opacity-80 transition-opacity"
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/652cd0312_clubeimg.jpeg"
                alt="Clube da Beleza"
                className="h-32 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  // Fallback para outras versões da imagem
                  e.target.src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/b53be18d1_clubeimg.jpeg';
                }}
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
              href="https://clube-da-beleza.base44.app" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-amber-600 text-amber-600 hover:bg-amber-50 font-bold"
              >
                Visitar Clube+
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
            <a 
              href="https://clube-mais.base44.app" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-amber-600 text-amber-600 hover:bg-amber-50 font-bold"
              >
                Visitar Clube +
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
                <div key={index} className={`flex flex-col ${plano.destaque ? 'transform scale-105' : ''}`}>
                  {/* Imagem do Cartão */}
                  <div className={`bg-gradient-to-br ${plano.corFundo} rounded-2xl p-8 mb-4 flex items-center justify-center aspect-[3/2] relative overflow-hidden shadow-2xl`}>
                    <img
                      src={plano.imagemCartao}
                      alt={`Cartão ${plano.nome}`}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Informações do Plano */}
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Plano {plano.nome}</h3>
                    
                    {plano.precoOriginal && (
                      <p className="text-sm text-gray-500 line-through mb-1">
                        {plano.precoOriginal}
                      </p>
                    )}
                    
                    <p className="text-3xl font-bold text-amber-600 mb-2">
                      {plano.preco}
                      {plano.periodo && <span className="text-lg">{plano.periodo}</span>}
                    </p>
                    
                    {plano.descricao && (
                      <p className="text-sm text-gray-600 mb-2">{plano.descricao}</p>
                    )}
                    
                    {plano.badge && (
                      <Badge className="bg-pink-600 text-white border-none mb-2">
                        {plano.badge}
                      </Badge>
                    )}
                  </div>

                  {/* Botão */}
                  <Button
                    onClick={() => handleSelecionarPlano(plano)}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold py-6 rounded-xl shadow-lg"
                  >
                    Adquirir Plano →
                  </Button>
                </div>
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
          <Card className="border-none shadow-2xl bg-gradient-to-r from-amber-600 to-yellow-600 text-white mb-16">
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

          {/* NOVA SEÇÃO: Nossos Produtos */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">
                Nosso Ecossistema
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                💼 Nossos Produtos
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Soluções completas para profissionais e clientes do mercado de estética
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
              {/* Clube da Beleza */}
              <Card className="border-2 border-amber-300 shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center p-6">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/7a63c7e8e_clubeimg.jpeg"
                    alt="Clube da Beleza"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/652cd0312_clubeimg.jpeg';
                    }}
                  />
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge className="bg-amber-100 text-amber-800 mb-3">Para Clientes</Badge>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Clube da Beleza</h3>
                    <p className="text-gray-600 mb-4">
                      Clube de benefícios exclusivo com descontos em estabelecimentos parceiros, 
                      programa de pontos e cashback para quem ama cuidar da beleza.
                    </p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>Descontos de até 25% em rede parceira</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>Programa de pontos e cashback</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>Tratamentos exclusivos para membros</span>
                    </div>
                  </div>

                  <a 
                    href="https://clube-da-beleza.base44.app" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white">
                      Acessar Clube da Beleza
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Dr. Beleza */}
              <Card className="border-2 border-cyan-300 shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center p-6">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/04265179e_drbeleza.png"
                    alt="Dr. Beleza"
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe4/ec64a4c52_drbeleza.png';
                    }}
                  />
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge className="bg-cyan-100 text-cyan-800 mb-3">Para Todos</Badge>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Dr. Beleza</h3>
                    <p className="text-gray-600 mb-4">
                      Assistente inteligente com IA que responde suas dúvidas sobre tratamentos, 
                      procedimentos e te ajuda a encontrar a melhor solução estética.
                    </p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <span>Consultas com Inteligência Artificial</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <span>Informações científicas atualizadas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <span>Recomendações personalizadas</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
                      <span>Gratuito e disponível 24/7</span>
                    </div>
                  </div>

                  <a 
                    href="https://dr-beleza-ai.base44.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white">
                      Acessar Dr. Beleza
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* LaserCode Pro */}
              <Card className="border-2 border-blue-300 shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🔬</div>
                    <p className="font-bold text-2xl text-blue-900">LaserCode Pro</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge className="bg-blue-100 text-blue-800 mb-3">Para Profissionais</Badge>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">LaserCode Pro</h3>
                    <p className="text-gray-600 mb-4">
                      Aplicativo profissional para gestão de tratamentos a laser. 
                      Calcule parâmetros, registre sessões e acompanhe resultados com precisão científica.
                    </p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Cálculo automático de parâmetros laser</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Registro completo de sessões</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Acompanhamento de resultados</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>Base de dados científica atualizada</span>
                    </div>
                  </div>

                  <a 
                    href="https://laser-code-pro.base44.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                      Acessar LaserCode Pro
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Dr. Spok */}
              <Card className="border-2 border-green-300 shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-6xl mb-2">🩺</div>
                    <p className="font-bold text-2xl text-green-900">Dr. Spok</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge className="bg-green-100 text-green-800 mb-3">Para Profissionais</Badge>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Dr. Spok PD</h3>
                    <p className="text-gray-600 mb-4">
                      Prontuário digital inteligente e completo para podólogos. 
                      Gerencie pacientes, históricos, fotos e tratamentos de forma profissional e segura.
                    </p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Prontuário digital completo e seguro</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Registro fotográfico de tratamentos</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Histórico completo de pacientes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Gestão de agendamentos e retornos</span>
                    </div>
                  </div>

                  <a 
                    href="https://dr-spok-pd.base44.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
                      Acessar Dr. Spok PD
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>

              {/* Eccellenza */}
              <Card className="border-2 border-orange-300 shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center p-6">
                  <div className="text-center">
                    <div className="text-6xl mb-2">💎</div>
                    <p className="font-bold text-2xl text-orange-900">Eccellenza</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge className="bg-orange-100 text-orange-800 mb-3">Para Profissionais</Badge>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Eccellenza</h3>
                    <p className="text-gray-600 mb-4">
                      Plataforma premium para profissionais de estética que buscam excelência. 
                      Gestão completa, agendamentos, financeiro e relacionamento com clientes.
                    </p>
                  </div>

                  <div className="space-y-2 mb-6 text-sm">
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Gestão completa de agenda e clientes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Controle financeiro profissional</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Marketing e relacionamento inteligente</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span>Relatórios e análises detalhadas</span>
                    </div>
                  </div>

                  <a 
                    href="https://eccellenza.base44.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full"
                  >
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                      Acessar Eccellenza
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>

            {/* Info sobre os produtos */}
            <Card className="mt-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-purple-900 mb-4">
                    🚀 Ecossistema Completo de Soluções
                  </h3>
                  <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
                    Desenvolvemos produtos especializados para atender todas as necessidades do mercado de estética e beleza. 
                    Do cliente ao profissional, temos a solução ideal!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a href="tel:31972595643">
                      <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Phone className="w-5 h-5 mr-2" />
                        Central de Vendas: (31) 97259-5643
                      </Button>
                    </a>
                    <a href="https://wa.me/5531972595643" target="_blank" rel="noopener noreferrer">
                      <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                        <MessageCircle className="w-5 h-5 mr-2" />
                        WhatsApp
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seja Nosso Parceiro */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">Seja nosso parceiro</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Parcerias oficiais do Clube da Beleza</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">Ganhe destaque no mapa, badges de confiança e benefícios do ecossistema Clube+ para impulsionar sua marca e seus resultados.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">Badge de Parceiro</h3>
                <p className="text-sm text-gray-600">Selo “Parceiro do Clube da Beleza” exibido no seu perfil e, opcionalmente, nos seus produtos.</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">Exposição e Confiança</h3>
                <p className="text-sm text-gray-600">Destaque em buscas, vitrine em seções do site e reconhecimento de qualidade Clube+.</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">Benefícios Clube+</h3>
                <p className="text-sm text-gray-600">Ações com Clube+ e conteúdos do ecossistema: <a className="text-purple-700 underline" href="https://clube-mais.base44.app" target="_blank" rel="noopener noreferrer">Clube+</a> e <a className="text-purple-700 underline" href="https://clubdabeleza.com" target="_blank" rel="noopener noreferrer">Clube da Beleza</a>.</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href="https://clubdabeleza.com" target="_blank" rel="noopener noreferrer">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Conhecer Clube da Beleza</Button>
            </a>
            <a href="https://clube-mais.base44.app" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-2 border-purple-600 text-purple-700 hover:bg-purple-50">Ver vantagens no Clube+</Button>
            </a>
            <a href="https://wa.me/5531972595643?text=Quero%20ser%20parceiro%20do%20Clube%20da%20Beleza" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-2">Quero ser parceiro</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Seja Nosso Parceiro */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <Badge className="mb-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-none">Seja nosso parceiro</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Parcerias oficiais do Clube da Beleza</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">Ganhe destaque no mapa, badges de confiança e benefícios do ecossistema Clube+ para impulsionar sua marca e seus resultados.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">Badge de Parceiro</h3>
                <p className="text-sm text-gray-600">Selo “Parceiro do Clube da Beleza” exibido no seu perfil e, opcionalmente, nos seus produtos.</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">Exposição e Confiança</h3>
                <p className="text-sm text-gray-600">Destaque em buscas, vitrine em seções do site e reconhecimento de qualidade Clube+.</p>
              </CardContent>
            </Card>
            <Card className="border-2 border-purple-200">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-2">Benefícios Clube+</h3>
                <p className="text-sm text-gray-600">Ações com Clube+ e conteúdos do ecossistema: <a className="text-purple-700 underline" href="https://clube-mais.base44.app" target="_blank" rel="noopener noreferrer">Clube+</a> e <a className="text-purple-700 underline" href="https://clubdabeleza.com" target="_blank" rel="noopener noreferrer">Clube da Beleza</a>.</p>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a href="https://clubdabeleza.com" target="_blank" rel="noopener noreferrer">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Conhecer Clube da Beleza</Button>
            </a>
            <a href="https://clube-mais.base44.app" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-2 border-purple-600 text-purple-700 hover:bg-purple-50">Ver vantagens no Clube+</Button>
            </a>
            <a href="https://wa.me/5531972595643?text=Quero%20ser%20parceiro%20do%20Clube%20da%20Beleza" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-2">Quero ser parceiro</Button>
            </a>
          </div>
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