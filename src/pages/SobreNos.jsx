import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Users, Award, Target, Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SobreNos() {
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
          <Link to={createPageUrl("Planos")}>
            <Button size="lg" className="bg-white text-pink-600 hover:bg-gray-100">
              Seja Parte Dessa Comunidade
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

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
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Pronto para Transformar Sua Experiência com Beleza?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Junte-se a milhares de pessoas que já fazem parte do Clube da Beleza
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={createPageUrl("Planos")}>
              <Button size="lg" className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700">
                Ver Planos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
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