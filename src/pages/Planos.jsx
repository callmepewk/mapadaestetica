
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Sparkles, Star, Zap, Crown, Gem, ArrowRight, X, MessageCircle, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";

const planos = [
  {
    nome: "COBRE",
    tipo: "cobre",
    preco: "Grátis",
    cor: "from-orange-400 to-amber-600",
    icone: Sparkles,
    destaque: false,
    linkPagamento: null, // No Mercado Pago link for free plan
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
      "🔒 Acesso ao WhatsApp dos profissionais",
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
    nome: "PRATA",
    tipo: "prata",
    preco: "R$ 99/mês",
    cor: "from-gray-300 to-gray-500",
    icone: Star,
    destaque: false,
    linkPagamento: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=ecb3830244194758803318fe45d4cbde",
    limites: {
      especialidades: 2,
      anuncios: 10,
      tags: 5,
      dias_exposicao: 7
    },
    beneficios: [
      "✅ Acesso ao WhatsApp dos profissionais",
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
    nome: "OURO",
    tipo: "ouro",
    preco: "R$ 197/mês",
    cor: "from-yellow-400 to-amber-500",
    icone: Crown,
    destaque: true,
    linkPagamento: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=13c2448777fd4359a6ecd5d545beacd1",
    limites: {
      especialidades: 3,
      anuncios: 15,
      tags: 10,
      dias_exposicao: 14
    },
    beneficios: [
      "✅ Acesso ao WhatsApp dos profissionais",
      "3 Especialidades cadastradas",
      "15 Anúncios ativos",
      "10 Tags/palavras-chave premium",
      "14 dias de exposição por anúncio",
      "Prioridade alta nas buscas",
      "Perfil premium com destaque dourado",
      "Suporte VIP com chat direto",
      "Relatórios completos",
      "Selo de Profissional Verificado Ouro",
      "Aparece em posição privilegiada",
      "Galeria de fotos ampliada"
    ],
    naoInclui: [
      "Anúncios ilimitados",
      "Especialidades ilimitadas",
      "Gerente de conta exclusivo",
      "Integração WhatsApp Business API",
      "Assistente IA personalizado",
      "30 dias de exposição máxima"
    ]
  },
  {
    nome: "DIAMANTE",
    tipo: "diamante",
    preco: "R$ 297/mês",
    cor: "from-blue-400 to-cyan-500",
    icone: Gem,
    destaque: false,
    linkPagamento: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=574848385a584cbd9d6b88c6064c07b3",
    limites: {
      especialidades: 5,
      anuncios: 25,
      tags: 20,
      dias_exposicao: 21
    },
    beneficios: [
      "✅ Acesso ao WhatsApp dos profissionais",
      "5 Especialidades cadastradas",
      "25 Anúncios ativos",
      "20 Tags/palavras-chave premium",
      "21 dias de exposição por anúncio",
      "Prioridade máxima nas buscas",
      "Perfil diamante com destaque exclusivo",
      "Suporte VIP 24/7",
      "Relatórios profissionais completos",
      "Selo Diamante Verificado",
      "Destaque na home page",
      "Galeria de fotos e vídeos ilimitada",
      "Integração básica WhatsApp Business"
    ],
    naoInclui: [
      "Anúncios ilimitados",
      "Gerente de conta exclusivo",
      "Assistente IA personalizado",
      "Marketing digital incluso",
      "30 dias de exposição"
    ]
  },
  {
    nome: "PLATINA",
    tipo: "platina",
    preco: "R$ 997/mês",
    cor: "from-purple-500 to-pink-600",
    icone: Zap,
    destaque: false,
    linkPagamento: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=9e7d3e30f0304d178d1656299feaf459",
    limites: {
      especialidades: "Ilimitadas",
      anuncios: "Ilimitados",
      tags: 100,
      dias_exposicao: 30
    },
    beneficios: [
      "✅ Acesso ao WhatsApp dos profissionais",
      "Especialidades ILIMITADAS",
      "Anúncios ILIMITADOS",
      "100 Tags/palavras-chave premium",
      "30 dias de exposição por anúncio",
      "Integração completa WhatsApp Business API",
      "Assistente com IA personalizado",
      "Prioridade ABSOLUTA em todas as buscas",
      "Destaque permanente e exclusivo na home",
      "Suporte VIP 24/7 dedicado",
      "Gerente de conta exclusivo",
      "Analytics profissional completo",
      "Marketing digital incluso",
      "Selo Platina Premium Exclusivo",
      "Conteúdo patrocinado mensal",
      "Campanhas personalizadas"
    ],
    naoInclui: []
  }
];

export default function Planos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const [planoAtualizado, setPlanoAtualizado] = useState("");
  const [verificandoPagamento, setVerificandoPagamento] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Verificar parâmetros de retorno do Mercado Pago
  useEffect(() => {
    const verificarPagamento = async () => {
      const params = new URLSearchParams(location.search);
      
      // Parâmetros que o Mercado Pago retorna
      const collectionStatus = params.get('collection_status'); // approved, pending, rejected
      const paymentId = params.get('payment_id'); // Keeping for potential future use or debugging
      const preferenceId = params.get('preference_id'); // Keeping for potential future use or debugging
      const externalReference = params.get('external_reference'); // Keeping for potential future use or debugging
      const planoParam = params.get('plano');

      // Se tem collection_status, veio do Mercado Pago
      if (collectionStatus && user) {
        setVerificandoPagamento(true);

        if (collectionStatus === 'approved') {
          try {
            // Atualizar plano do usuário
            await base44.auth.updateMe({
              plano_ativo: planoParam || 'prata',
              data_adesao_plano: new Date().toISOString().split('T')[0]
            });

            setPlanoAtualizado((planoParam || 'prata').toUpperCase());
            setMostrarSucesso(true);

            // Recarregar usuário
            const userData = await base44.auth.me();
            setUser(userData);

            // Limpar URL
            window.history.replaceState({}, '', createPageUrl("Planos"));
          } catch (error) {
            console.error("Erro ao atualizar plano:", error);
            alert("Pagamento aprovado, mas houve erro ao ativar o plano. Entre em contato com o suporte.");
          }
        } else if (collectionStatus === 'pending') {
          alert("Seu pagamento está pendente. Assim que for aprovado, seu plano será ativado automaticamente.");
          window.history.replaceState({}, '', createPageUrl("Planos"));
        } else if (collectionStatus === 'rejected') {
          alert("Seu pagamento foi rejeitado. Tente novamente ou entre em contato com o suporte.");
          window.history.replaceState({}, '', createPageUrl("Planos"));
        }

        setVerificandoPagamento(false);
      }
    };

    if (user) {
      verificarPagamento();
    }
  }, [location, user, navigate]);

  const handleContratarPlano = (plano) => {
    if (!user) {
      alert("Por favor, faça login para contratar um plano.");
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (!plano.linkPagamento) {
      // Plano gratuito (COBRE)
      if (user.plano_ativo !== plano.tipo) {
        base44.auth.updateMe({
          plano_ativo: plano.tipo,
          data_adesao_plano: new Date().toISOString().split('T')[0]
        }).then(() => {
          alert(`Parabéns! Seu plano ${plano.nome.toUpperCase()} foi ativado com sucesso.`);
          base44.auth.me().then(setUser).catch(console.error);
        }).catch(error => {
          console.error("Erro ao ativar plano gratuito:", error);
          alert("Ocorreu um erro ao tentar ativar o plano gratuito. Por favor, tente novamente.");
        });
      } else {
        alert("Você já está no plano Cobre gratuito!");
      }
      return;
    }

    // Planos pagos - REDIRECIONAR para Mercado Pago
    const currentUrl = window.location.origin + createPageUrl("Planos");
    const backUrl = `${currentUrl}?plano=${plano.tipo}`;
    
    // Construir URL completa com back_urls
    const mercadoPagoUrl = `${plano.linkPagamento}&back_urls[success]=${encodeURIComponent(backUrl)}&back_urls[pending]=${encodeURIComponent(backUrl)}&back_urls[failure]=${encodeURIComponent(backUrl)}`;
    
    // REDIRECIONAR (não abrir nova aba)
    window.location.href = mercadoPagoUrl;
  };

  const isAdmin = user?.role === 'admin';
  const planosExibidos = planos;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      {/* Alert de Verificação de Pagamento */}
      {verificandoPagamento && (
        <Alert className="max-w-4xl mx-auto mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <AlertDescription className="text-blue-800">
              Verificando seu pagamento... Aguarde um momento.
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Alert de Sucesso */}
      {mostrarSucesso && (
        <Alert className="max-w-4xl mx-auto mb-6 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            🎉 <strong>Parabéns!</strong> Seu plano <strong>{planoAtualizado}</strong> foi ativado com sucesso! 
            Agora você tem acesso a todos os recursos premium.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base px-6 py-2">
            Planos para Profissionais de Estética
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Aumente sua visibilidade, atraia mais clientes e impulsione seu negócio com nossos planos exclusivos
          </p>
        </div>

        {/* Seção de Contato */}
        <div className="mb-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    💬 Fale com o Dr. Beleza
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Nosso assistente inteligente pode te ajudar a escolher o melhor plano!
                  </p>
                  <Button
                    onClick={() => navigate(createPageUrl("PesquisaEspecializada"))}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    Conversar com Dr. Beleza
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Headphones className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    📞 Central de Vendas
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Fale com nossos especialistas e tire todas as suas dúvidas!
                  </p>
                  <a
                    href="https://wa.me/5531972595643?text=Olá!%20Gostaria%20de%20informações%20sobre%20os%20planos%20do%20Mapa%20da%20Estética!%20💆‍♀️"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      WhatsApp: (31) 97259-5643
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {planosExibidos.map((plano, index) => {
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
                  plano.destaque ? "ring-4 ring-yellow-500" : ""
                }`}>
                  {plano.destaque && (
                    <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-500 to-amber-500 text-white px-4 py-1 text-sm font-semibold z-10 rounded-bl-lg">
                      ⭐ Mais Popular
                    </div>
                  )}

                  <div className={`h-48 bg-gradient-to-br ${plano.cor} p-6 relative overflow-hidden flex-shrink-0`}>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                    
                    <div className="relative z-10 text-white">
                      <IconComponent className="w-12 h-12 mb-4" />
                      <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{plano.preco}</span>
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
                          <span className="text-gray-600">Tags:</span>
                          <span className="font-bold">{plano.limites.tags}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="text-gray-600">Exposição:</span>
                          <span className="font-bold text-pink-600">{plano.limites.dias_exposicao} dias</span>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4 flex-1">
                      <h4 className="font-semibold text-sm mb-2 text-green-700">✓ Incluído:</h4>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
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

                    {plano.naoInclui && plano.naoInclui.length > 0 && (
                      <div className="mb-6 p-3 bg-red-50 rounded-lg">
                        <h4 className="font-semibold text-sm mb-2 text-red-700">✗ Não incluído:</h4>
                        <div className="space-y-1">
                          {plano.naoInclui.slice(0, 3).map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <X className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="text-xs text-gray-600">{item}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-red-600 mt-2 font-medium">
                          Faça upgrade!
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 mt-auto">
                      <Button
                        onClick={() => handleContratarPlano(plano)}
                        className={`w-full ${
                          plano.destaque
                            ? "bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                            : plano.tipo === 'cobre'
                            ? "bg-[#2C2C2C] hover:bg-[#3A3A3A]"
                            : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                        }`}
                      >
                        {plano.tipo === 'cobre' ? 'Plano Gratuito' : 'Contratar Agora'}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
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
