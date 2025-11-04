
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Star, Zap, Crown, ArrowRight, X } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const planos = [
  {
    nome: "FREE",
    tipo: "free",
    preco: "Grátis",
    cor: "from-gray-400 to-gray-500",
    icone: Sparkles,
    destaque: false,
    limites: {
      especialidades: 1,
      anuncios: 1,
      tags: 1,
      dias_exposicao: 3
    },
    beneficios: [
      "1 Especialidade cadastrada",
      "1 Anúncio ativo",
      "1 Tag/palavra-chave do Google Negócio",
      "3 dias de exposição do anúncio",
      "Perfil básico na plataforma",
      "Suporte por email",
      "Estatísticas básicas"
    ],
    naoInclui: [
      "Perfil destacado",
      "Badge de verificação",
      "Prioridade nas buscas",
      "Suporte prioritário",
      "Estatísticas avançadas",
      "Relatórios detalhados",
      "Maior tempo de exposição"
    ]
  },
  {
    nome: "BÁSICO",
    tipo: "basico",
    preco: "R$ 99/mês",
    cor: "from-blue-400 to-cyan-500",
    icone: Star,
    destaque: false,
    limites: {
      especialidades: 2,
      anuncios: 10,
      tags: 5,
      dias_exposicao: 7
    },
    beneficios: [
      "2 Especialidades cadastradas",
      "10 Anúncios ativos",
      "5 Tags/palavras-chave do Google Negócio",
      "7 dias de exposição por anúncio",
      "Perfil destacado",
      "Suporte prioritário",
      "Estatísticas avançadas",
      "Badge de verificação",
      "Aparece nas buscas principais"
    ],
    naoInclui: [
      "Prioridade máxima nas buscas",
      "Perfil premium",
      "Suporte VIP 24/7",
      "Gerente de conta dedicado",
      "Marketing digital incluso",
      "Integração WhatsApp Business",
      "30 dias de exposição"
    ]
  },
  {
    nome: "AVANÇADO",
    tipo: "avancado",
    preco: "R$ 297/mês",
    cor: "from-purple-500 to-pink-500",
    icone: Zap,
    destaque: true,
    limites: {
      especialidades: 5,
      anuncios: 10,
      tags: 20,
      dias_exposicao: 14
    },
    beneficios: [
      "5 Especialidades cadastradas",
      "10 Anúncios ativos",
      "20 Tags/palavras-chave premium",
      "14 dias de exposição por anúncio",
      "Prioridade máxima nas buscas",
      "Perfil premium com destaque",
      "Suporte VIP com chat direto",
      "Relatórios completos (estilo Google Negócios)",
      "Selo de Profissional Verificado",
      "Aparece no topo dos resultados",
      "Galeria de fotos ampliada"
    ],
    naoInclui: [
      "Anúncios ilimitados",
      "Especialidades ilimitadas",
      "Gerente de conta exclusivo",
      "Integração WhatsApp Business API",
      "Assistente IA personalizado",
      "Conteúdo patrocinado mensal",
      "30 dias de exposição máxima"
    ]
  },
  {
    nome: "PREMIUM",
    tipo: "premium",
    preco: "Consulte",
    cor: "from-yellow-400 to-amber-500",
    icone: Crown,
    destaque: false,
    limites: {
      especialidades: "Ilimitadas",
      anuncios: "Ilimitados",
      tags: 100,
      dias_exposicao: 30
    },
    beneficios: [
      "Especialidades ILIMITADAS",
      "Anúncios ILIMITADOS",
      "100 Tags/palavras-chave premium",
      "30 dias de exposição por anúncio",
      "Integração com WhatsApp Business",
      "Assistente com IA integrado",
      "Prioridade MÁXIMA em todas as buscas",
      "Destaque permanente na home",
      "Suporte 24/7 dedicado",
      "Gerente de conta exclusivo (Géssica)",
      "Analytics profissional completo",
      "Marketing digital incluso",
      "Selo Premium Exclusivo",
      "Conteúdo patrocinado mensal"
    ],
    naoInclui: [], // Premium não tem limitações
    consultePremium: true
  }
];

export default function Planos() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <Badge className="mb-4 bg-[#F7D426] text-[#2C2C2C] font-bold">
          Planos Mapa da Estética
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Escolha Seu Plano de Anúncios
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Diferentes opções para atender profissionais de todos os tamanhos
        </p>
      </div>

      {/* Plans Comparison */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {planos.map((plano, index) => {
          const IconComponent = plano.icone;
          return (
            <motion.div
              key={plano.tipo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${plano.destaque ? "lg:-translate-y-4" : ""}`}
            >
              <Card className={`relative overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col w-full ${
                plano.destaque ? "ring-4 ring-purple-500" : ""
              }`}>
                {plano.destaque && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-semibold z-10">
                    Mais Popular
                  </div>
                )}

                {/* Card Visual */}
                <div className={`h-48 bg-gradient-to-br ${plano.cor} p-6 relative overflow-hidden flex-shrink-0`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                  
                  <div className="relative z-10 text-white">
                    <IconComponent className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">{plano.preco}</span>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-white rounded-lg border-2 border-gray-200">
                    <h4 className="font-bold mb-3 text-center">Limites</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Especialidades:</span>
                        <span className="font-bold">{plano.limites.especialidades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Anúncios:</span>
                        <span className="font-bold">{plano.limites.anuncios}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tags/Keywords:</span>
                        <span className="font-bold">{plano.limites.tags}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-gray-600">Exposição:</span>
                        <span className="font-bold text-pink-600">{plano.limites.dias_exposicao} dias</span>
                      </div>
                    </div>
                  </div>

                  {/* Benefícios Incluídos */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-sm mb-2 text-green-700">✓ O que está incluído:</h4>
                    <div className="space-y-2">
                      {plano.beneficios.map((beneficio, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="flex-shrink-0 w-4 h-4 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-xs text-gray-600">{beneficio}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* O que NÃO está incluído */}
                  {plano.naoInclui && plano.naoInclui.length > 0 && (
                    <div className="mb-6 p-3 bg-red-50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 text-red-700">✗ Não incluído neste plano:</h4>
                      <div className="space-y-1">
                        {plano.naoInclui.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <X className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600">{item}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-red-600 mt-2 font-medium">
                        Faça upgrade para ter acesso a esses recursos!
                      </p>
                    </div>
                  )}

                  {plano.consultePremium ? (
                    <a
                      href={`https://wa.me/5531972595643?text=${encodeURIComponent(`Olá! Gostaria de informações sobre o plano ${plano.nome} do Mapa da Estética! 💎`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-auto"
                    >
                      <Button
                        className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                      >
                        Consulte Mais Informações
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </a>
                  ) : (
                    <Link to={createPageUrl("FaleConosco")} className="mt-auto">
                      <Button
                        className={`w-full ${
                          plano.destaque
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            : "bg-[#2C2C2C] hover:bg-[#3A3A3A]"
                        }`}
                      >
                        Contratar Plano
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Benefits Section */}
      <Card className="border-none shadow-2xl bg-gradient-to-br from-gray-900 to-gray-800 text-white mb-16">
        <CardContent className="p-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Por Que Anunciar Conosco?</h2>
            <p className="text-gray-300">
              A maior plataforma de profissionais de estética do Brasil
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-[#F7D426]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-semibold mb-2">Público Qualificado</h3>
              <p className="text-sm text-gray-300">
                Milhares de clientes buscando serviços
              </p>
            </div>

            <div>
              <div className="w-16 h-16 bg-[#F7D426]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="font-semibold mb-2">Mais Visibilidade</h3>
              <p className="text-sm text-gray-300">
                Destaque nos resultados de busca
              </p>
            </div>

            <div>
              <div className="w-16 h-16 bg-[#F7D426]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💼</span>
              </div>
              <h3 className="font-semibold mb-2">Gestão Profissional</h3>
              <p className="text-sm text-gray-300">
                Ferramentas para gerenciar seus anúncios
              </p>
            </div>

            <div>
              <div className="w-16 h-16 bg-[#F7D426]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="font-semibold mb-2">Suporte Dedicado</h3>
              <p className="text-sm text-gray-300">
                Equipe pronta para ajudar
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <p className="text-gray-600 mb-4 text-lg">Tem dúvidas sobre qual plano escolher?</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={`https://wa.me/5531972595643?text=${encodeURIComponent("Olá! Gostaria de informações sobre os planos do Mapa da Estética! 💆‍♀️")}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold">
              Fale Conosco
            </Button>
          </a>
          <Link to={createPageUrl("CadastrarAnuncio")}>
            <Button size="lg" variant="outline">
              Criar Anúncio Grátis
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
