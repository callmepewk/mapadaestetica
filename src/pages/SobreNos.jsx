
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
    cor: "from-gray-400 to-gray-500",
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
    cor: "from-yellow-400 to-amber-500",
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
    cor: "from-purple-600 to-pink-600",
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

const planosAnunciantes = [
  {
    nome: "COBRE",
    preco: "12x R$ 97",
    total: "R$ 1.164/ano",
    cor: "from-orange-600 to-orange-400",
    dimensoes: "300x250px (Banner Médio)",
    posicionamento: "Rodapé das páginas internas",
    prioridade: "Baixa",
    segmentacao: "1 categoria específica",
    acesso_contatos: "Não incluído",
    impressoes: "Até 50.000 impressões/mês",
    beneficios: [
      "Banner médio (300x250px)",
      "Posicionamento no rodapé",
      "Segmentação em 1 categoria",
      "Até 50.000 impressões/mês",
      "Relatório mensal básico",
      "Suporte por email"
    ]
  },
  {
    nome: "PRATA",
    preco: "12x R$ 197",
    total: "R$ 2.364/ano",
    cor: "from-gray-400 to-gray-300",
    dimensoes: "728x90px (Banner Superior)",
    posicionamento: "Topo das páginas de categoria",
    prioridade: "Média",
    segmentacao: "Até 3 categorias",
    acesso_contatos: "Email dos leads",
    impressoes: "Até 150.000 impressões/mês",
    beneficios: [
      "Banner superior (728x90px)",
      "Topo das páginas de categoria",
      "Segmentação em até 3 categorias",
      "Até 150.000 impressões/mês",
      "Acesso aos emails dos leads",
      "Relatório semanal detalhado",
      "Badge 'Patrocinador Prata'",
      "Suporte prioritário"
    ]
  },
  {
    nome: "OURO",
    preco: "12x R$ 597",
    total: "R$ 7.164/ano",
    cor: "from-yellow-500 to-yellow-400",
    dimensoes: "970x250px (Billboard)",
    posicionamento: "Destaque na Home + Páginas Principais",
    prioridade: "Alta",
    segmentacao: "Até 10 categorias ou todas",
    acesso_contatos: "Email + Telefone dos leads",
    impressoes: "Até 500.000 impressões/mês",
    destaque: true,
    beneficios: [
      "Billboard premium (970x250px)",
      "Destaque na Home e páginas principais",
      "Segmentação em até 10 categorias",
      "Até 500.000 impressões/mês",
      "Email + Telefone dos leads qualificados",
      "Post patrocinado mensal no blog",
      "Destaque no newsletter semanal",
      "Relatório em tempo real",
      "Badge 'Patrocinador Ouro'",
      "Gerente de conta dedicado"
    ]
  },
  {
    nome: "DIAMANTE",
    preco: "12x R$ 997",
    total: "R$ 11.964/ano",
    cor: "from-cyan-400 to-blue-500",
    dimensoes: "1920x400px (Banner Full)",
    posicionamento: "Topo Fixo + Pop-up Estratégico",
    prioridade: "Máxima",
    segmentacao: "Todas as categorias + Geolocalização",
    acesso_contatos: "Dados completos + WhatsApp",
    impressoes: "Até 1.000.000 impressões/mês",
    beneficios: [
      "Banner Full HD (1920x400px)",
      "Topo fixo + Pop-up estratégico",
      "Todas as categorias + geolocalização",
      "Até 1.000.000 impressões/mês",
      "Dados completos dos leads (Email, Tel, WhatsApp)",
      "4 posts patrocinados/mês no blog",
      "Destaque premium no newsletter",
      "Campanha de email marketing mensal",
      "Vídeo institucional na home (30s)",
      "Badge 'Patrocinador Diamante'",
      "Analytics avançado em tempo real",
      "Gerente de sucesso dedicado"
    ]
  },
  {
    nome: "PLATINA",
    preco: "12x R$ 1.597",
    total: "R$ 19.164/ano",
    cor: "from-purple-600 to-pink-600",
    dimensoes: "Formatos Personalizados",
    posicionamento: "Exclusividade Total + Takeover",
    prioridade: "EXCLUSIVA",
    segmentacao: "Controle total + IA personalizada",
    acesso_contatos: "CRM integrado + API",
    impressoes: "ILIMITADAS",
    beneficios: [
      "Formatos de banner personalizados",
      "Exclusividade de categoria (sem concorrentes)",
      "Takeover da plataforma (1 dia/mês)",
      "Impressões ILIMITADAS",
      "CRM integrado + API para leads",
      "Posts patrocinados ILIMITADOS",
      "Email marketing semanal",
      "Co-branding em materiais oficiais",
      "Presença em eventos do Mapa da Estética",
      "Landing page personalizada",
      "Badge 'Parceiro Estratégico Platina'",
      "Inteligência de mercado e analytics premium",
      "Equipe de sucesso dedicada"
    ]
  }
];

export default function SobreNos() {
  const [mostrarPlanos, setMostrarPlanos] = useState(false);
  const [mostrarPlanosAnunciantes, setMostrarPlanosAnunciantes] = useState(false);

  const handleSelecionarPlano = (plano) => {
    const mensagem = `Olá, tudo bem? Tenho interesse no plano ${plano.nome} do Clube da Beleza! 💆‍♀️✨`;
    const whatsapp = "5531972595643";
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const handleSelecionarPlanoAnunciante = (plano) => {
    const mensagem = `Olá! Tenho interesse no plano ${plano.nome} para Anunciantes (${plano.preco}). Gostaria de mais informações! 📢`;
    const whatsapp = "5531972595643"; // Updated WhatsApp number
    const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero */}
      <section className="bg-gradient-to-r from-pink-600 to-rose-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-none">
            Sobre o Clube da Beleza
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            E se você pudesse viver o melhor que a sua beleza pode proporcionar?
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Somos o clube de benefícios mais completo do Brasil para quem ama cuidar da sua estética e bem-estar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-pink-600 hover:bg-gray-100"
              onClick={() => setMostrarPlanos(!mostrarPlanos)}
            >
              Seja Parte Dessa Comunidade
              {mostrarPlanos ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 text-white border-white hover:bg-white/20"
              onClick={() => setMostrarPlanosAnunciantes(!mostrarPlanosAnunciantes)}
            >
              Quero Ser um Anunciante
              {mostrarPlanosAnunciantes ? <ChevronUp className="w-5 h-5 ml-2" /> : <ChevronDown className="w-5 h-5 ml-2" />}
            </Button>
          </div>
        </div>
      </section>

      {/* Planos Clube+ */}
      {mostrarPlanos && (
        <section className="py-12 bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Escolha Seu Plano do Clube da Beleza
              </h2>
              <p className="text-gray-600">
                Benefícios exclusivos para você cuidar da sua beleza com economia
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {planosClubeCliente.map((plano, index) => (
                <Card key={index} className={`border-none shadow-xl hover:shadow-2xl transition-all ${plano.destaque ? 'ring-4 ring-yellow-500 transform scale-105' : ''}`}>
                  {plano.destaque && (
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-center py-2 font-bold text-sm">
                      🌟 MAIS POPULAR
                    </div>
                  )}
                  <div className={`h-32 bg-gradient-to-br ${plano.cor} p-6 flex flex-col justify-center items-center text-white`}>
                    <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                    <p className="text-3xl font-bold">{plano.preco}</p>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-3 mb-6">
                      {plano.beneficios.map((beneficio, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600">{beneficio}</span>
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={() => handleSelecionarPlano(plano)}
                      className={`w-full ${plano.destaque ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700' : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700'}`}
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

      {/* Planos Anunciantes */}
      {mostrarPlanosAnunciantes && (
        <section className="py-12 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-yellow-500 text-gray-900 font-bold">
                Planos para Anunciantes
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Amplifique Sua Marca no Maior Marketplace de Estética
              </h2>
              <p className="text-gray-300 text-lg">
                Milhões de impressões mensais • Público altamente segmentado • ROI comprovado
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {planosAnunciantes.map((plano, index) => (
                <Card key={index} className={`border-none shadow-2xl hover:shadow-3xl transition-all bg-gray-800 text-white ${plano.destaque ? 'ring-4 ring-yellow-500 transform scale-105' : ''}`}>
                  {plano.destaque && (
                    <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-gray-900 text-center py-2 font-bold text-sm">
                      ⭐ RECOMENDADO
                    </div>
                  )}
                  <div className={`h-40 bg-gradient-to-br ${plano.cor} p-6 flex flex-col justify-center items-center`}>
                    <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                    <p className="text-2xl font-bold">{plano.preco}</p>
                    <p className="text-sm opacity-80 mt-1">{plano.total}</p>
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2 text-sm border-b border-gray-700 pb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dimensões:</span>
                        <span className="font-semibold text-right">{plano.dimensoes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Posicionamento:</span>
                        <span className="font-semibold text-right">{plano.posicionamento}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Prioridade:</span>
                        <Badge className={`${plano.prioridade === 'EXCLUSIVA' ? 'bg-purple-600' : plano.prioridade === 'Máxima' ? 'bg-red-600' : plano.prioridade === 'Alta' ? 'bg-orange-600' : 'bg-gray-600'}`}>
                          {plano.prioridade}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Segmentação:</span>
                        <span className="font-semibold text-right">{plano.segmentacao}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Acesso:</span>
                        <span className="font-semibold text-right">{plano.acesso_contatos}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Impressões:</span>
                        <span className="font-semibold text-right">{plano.impressoes}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plano.beneficios.map((beneficio, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-300">{beneficio}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={() => handleSelecionarPlanoAnunciante(plano)}
                      className={`w-full ${plano.destaque ? 'bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700' : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'}`}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contratar {plano.nome}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="text-center mt-12">
              <p className="text-gray-400 mb-4">
                🎯 Todos os planos incluem relatórios detalhados e suporte especializado
              </p>
              <a
                href={`https://wa.me/5531972595643?text=${encodeURIComponent("Olá! Gostaria de informações sobre os planos para anunciantes do Mapa da Estética! 📢")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="border-white text-black bg-white hover:bg-gray-100">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Falar com Especialista
                </Button>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Olá! Seja Bem-vindo(a)
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Um clube que oferece benefícios para os associados que consomem serviços e produtos 
              para sua estética e bem-estar. Além de fazer bem, também faz bem no seu bolso!
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-none shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Clube de Benefícios</h3>
                <p className="text-gray-600">
                  Descontos exclusivos, programa de fidelidade que converte seus gastos em pontos 
                  e prêmios para você e seus entes queridos
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Aplicativo Localizador</h3>
                <p className="text-gray-600">
                  O primeiro app do mundo exclusivo para TODO o ramo da estética! 
                  Mais de 64 categorias de serviços, profissionais e produtos
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl hover:shadow-2xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">Agendamento Online</h3>
                <p className="text-gray-600">
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
                <h3 className="text-2xl font-bold mb-4">Nossa Missão</h3>
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
                <h3 className="text-2xl font-bold mb-4">Nossos Valores</h3>
                <p className="text-gray-600 leading-relaxed">
                  Qualidade, compromisso, inovação e cuidado. Acreditamos que todo mundo 
                  merece ter acesso aos melhores serviços de estética e bem-estar, 
                  com economia e segurança.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statistics */}
          <Card className="border-none shadow-2xl bg-gradient-to-r from-pink-600 to-rose-600 text-white">
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
      <section className="py-20 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="max-w-4xl mx-auto px-4 =">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Pronto para Transformar Sua Experiência com Beleza?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Junte-se a milhares de pessoas que já fazem parte do Clube da Beleza
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setMostrarPlanos(!mostrarPlanos)}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
            >
              Ver Planos Clube+
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Link to={createPageUrl("FaleConosco")}>
              <Button size="lg" variant="outline">
                Fale Conosco
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
