
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Sparkles, Star, Zap, Crown, Gem, ArrowRight, X, MessageCircle, Headphones, AlertCircle, CreditCard, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

import DrBelezaPlanosModal from "../components/home/DrBelezaPlanosModal";

const planos = [
  {
    nome: "FREE",
    tipo: "cobre",
    preco: "Grátis",
    cor: "from-orange-400 to-amber-600",
    icone: Sparkles,
    destaque: false,
    linkPagamento: null,
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
    nome: "BÁSICO",
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
    nome: "PRO",
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
      "Selo de Profissional Verificado PRO",
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
    nome: "PRIME",
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
      "Perfil PRIME com destaque exclusivo",
      "Suporte VIP 24/7",
      "Relatórios profissionais completos",
      "Selo PRIME Verificado",
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
    nome: "DELUXE",
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
      "Selo DELUXE Premium Exclusivo",
      "Conteúdo patrocinado mensal",
      "Campanhas personalizadas"
    ],
    naoInclui: []
  }
];

// NOVO: Planos de Patrocinadores
const planosPatrocinadores = [
  {
    nome: "COBRE",
    tipo: "cobre",
    preco: "R$ 297/mês",
    cor: "from-orange-400 to-amber-600",
    icone: Star,
    destaque: false,
    linkPagamento: null, // Configurar
    beneficios: [
      "Logo na home page",
      "1 banner rotativo",
      "Link para site/redes sociais",
      "Destaque em busca",
      "Relatório mensal",
      "Suporte básico"
    ]
  },
  {
    nome: "PRATA",
    tipo: "prata",
    preco: "R$ 497/mês",
    cor: "from-gray-300 to-gray-500",
    icone: Star,
    destaque: false,
    linkPagamento: null,
    beneficios: [
      "Logo destacado na home",
      "3 banners rotativos",
      "Link para site/redes sociais",
      "Prioridade alta em buscas",
      "Post mensal no blog",
      "Relatório semanal",
      "Suporte prioritário"
    ]
  },
  {
    nome: "OURO",
    tipo: "ouro",
    preco: "R$ 997/mês",
    cor: "from-yellow-400 to-amber-500",
    icone: Crown,
    destaque: true,
    linkPagamento: null,
    beneficios: [
      "Logo premium na home",
      "5 banners rotativos",
      "Seção exclusiva de patrocinador",
      "Artigos mensais no blog",
      "Prioridade máxima em buscas",
      "Campanhas personalizadas",
      "Relatório diário",
      "Suporte VIP 24/7"
    ]
  },
  {
    nome: "DIAMANTE",
    tipo: "diamante",
    preco: "R$ 1.997/mês",
    cor: "from-blue-400 to-cyan-500",
    icone: Gem,
    destaque: false,
    linkPagamento: null,
    beneficios: [
      "Logo destaque máximo",
      "10 banners rotativos",
      "Seção exclusiva premium",
      "2 artigos mensais no blog",
      "Campanhas de email marketing",
      "Webinars mensais",
      "Prioridade absoluta",
      "Gerente de conta dedicado",
      "Relatórios em tempo real"
    ]
  },
  {
    nome: "PLATINA",
    tipo: "platina",
    preco: "Sob Consulta",
    cor: "from-purple-500 to-pink-600",
    icone: Zap,
    destaque: false,
    linkPagamento: null,
    beneficios: [
      "Parceria estratégica completa",
      "Banners ilimitados",
      "Co-branding da plataforma",
      "Eventos exclusivos",
      "Conteúdo ilimitado no blog",
      "Campanhas de performance",
      "Integração API completa",
      "Equipe dedicada",
      "Dashboards personalizados",
      "Primeiro a saber novidades"
    ]
  }
];

export default function Planos() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);
  const [planoAtualizado, setPlanoAtualizado] = useState("");
  const [verificandoPagamento, setVerificandoPagamento] = useState(false);

  const [mostrarModalConfirmacao, setMostrarModalConfirmacao] = useState(false);
  const [planoSelecionado, setPlanoSelecionado] = useState(null);
  const [aguardandoConfirmacao, setAguardandoConfirmacao] = useState(false);

  const [mostrarDrBeleza, setMostrarDrBeleza] = useState(false);
  const [abaPlanos, setAbaPlanos] = useState("mapa_estetica"); // NOVO

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
      
      const collectionStatus = params.get('collection_status'); // approved, pending, rejected
      const planoParam = params.get('plano');

      // Se tem collection_status, veio do Mercado Pago
      if (collectionStatus && user && planoParam) {
        setVerificandoPagamento(true);

        try {
          // Buscar a solicitação mais recente deste usuário para este plano
          const solicitacoes = await base44.entities.SolicitacaoAtivacaoPlano.filter(
            { 
              usuario_email: user.email, 
              plano_solicitado: planoParam,
            },
            '-created_date',
            1
          );

          if (solicitacoes.length > 0) {
            const solicitacao = solicitacoes[0];
            let updateData = {};
            let alertMessage = "";
            let notificationType = null;
            let notificationTitle = null;
            let notificationMessage = null;

            if (collectionStatus === 'approved') {
              updateData = { 
                status: 'pagamento_aprovado_mp', 
                data_pagamento_mp: new Date().toISOString() 
              };
              
              notificationType = "nova_confirmacao_plano";
              notificationTitle = `✅ Pagamento Aprovado - Plano ${planoParam.toUpperCase()}`;
              notificationMessage = `${user.full_name} (${user.email}) teve um pagamento APROVADO via Mercado Pago para o plano ${planoParam.toUpperCase()}. Verifique e ative o plano.`;

              setPlanoAtualizado(planoParam.toUpperCase());
              setMostrarSucesso(true);
              
              alertMessage = `🎉 Parabéns! Seu pagamento foi aprovado pelo Mercado Pago!\n\nNossa equipe foi notificada e seu plano ${planoParam.toUpperCase()} será ativado em até 24 horas.\n\nVocê receberá um e-mail de confirmação assim que o plano estiver ativo.`;
              
            } else if (collectionStatus === 'pending') {
              updateData = { 
                status: 'pagamento_pendente_mp', 
                data_pagamento_mp: new Date().toISOString() 
              };
              alertMessage = "⏳ Seu pagamento está pendente de aprovação.\n\nAssim que o Mercado Pago aprovar, nossa equipe será notificada para ativar seu plano.\n\nVocê receberá uma confirmação por e-mail.";
              
            } else if (collectionStatus === 'rejected') {
              updateData = { 
                status: 'pagamento_rejeitado_mp', 
                data_pagamento_mp: new Date().toISOString() 
              };
              alertMessage = "❌ Seu pagamento foi rejeitado pelo Mercado Pago.\n\nTente novamente ou entre em contato com nosso suporte:\n(31) 97259-5643";
            }

            if (Object.keys(updateData).length > 0) {
              await base44.entities.SolicitacaoAtivacaoPlano.update(solicitacao.id, updateData);
            }
            
            if (notificationType) {
              await base44.entities.Notificacao.create({
                usuario_email: "admin@mapadaestetica.com.br",
                tipo: notificationType,
                titulo: notificationTitle,
                mensagem: notificationMessage,
                link_acao: `/solicitacoes-plano`
              });
            }
            
            if (alertMessage) {
              alert(alertMessage);
            }
          } else {
            // Sem solicitação prévia - criar uma nova
            if (collectionStatus === 'approved') {
              await base44.entities.SolicitacaoAtivacaoPlano.create({
                usuario_email: user.email,
                usuario_nome: user.full_name,
                plano_solicitado: planoParam,
                link_mercadopago: "Retorno direto do MP",
                status: "pagamento_aprovado_mp",
                data_solicitacao: new Date().toISOString(),
                data_pagamento_mp: new Date().toISOString()
              });

              await base44.entities.Notificacao.create({
                usuario_email: "admin@mapadaestetica.com.br",
                tipo: "nova_confirmacao_plano",
                titulo: `✅ Pagamento Aprovado - Plano ${planoParam.toUpperCase()}`,
                mensagem: `${user.full_name} (${user.email}) teve um pagamento APROVADO via Mercado Pago para o plano ${planoParam.toUpperCase()}. Verifique e ative o plano.`,
                link_acao: `/solicitacoes-plano`
              });

              setPlanoAtualizado(planoParam.toUpperCase());
              setMostrarSucesso(true);
              alert(`🎉 Parabéns! Seu pagamento foi aprovado!\n\nSeu plano ${planoParam.toUpperCase()} será ativado em até 24 horas.`);
            } else if (collectionStatus === 'pending') {
              alert("⏳ Seu pagamento está pendente. Aguarde a aprovação do Mercado Pago.");
            } else if (collectionStatus === 'rejected') {
              alert("❌ Seu pagamento foi rejeitado. Tente novamente ou entre em contato: (31) 97259-5643");
            }
          }
        } catch (error) {
          console.error("Erro ao processar retorno do Mercado Pago:", error);
          alert("❌ Ocorreu um erro ao processar seu pagamento.\n\nPor favor, entre em contato com o suporte:\n(31) 97259-5643");
        } finally {
          setVerificandoPagamento(false);
          window.history.replaceState({}, '', createPageUrl("Planos"));
        }
      }
    };

    if (user) {
      verificarPagamento();
    }
  }, [location, user]);

  const handleContratarPlano = async (plano) => {
    if (!user) {
      alert("Por favor, faça login para contratar um plano.");
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (!plano.linkPagamento) {
      // Plano gratuito (COBRE)
      if (user.plano_ativo !== plano.tipo) {
        try {
          await base44.auth.updateMe({
            plano_ativo: plano.tipo,
            data_adesao_plano: new Date().toISOString().split('T')[0]
          });
          alert(`Parabéns! Seu plano ${plano.nome.toUpperCase()} foi ativado com sucesso.`);
          const userData = await base44.auth.me();
          setUser(userData);
        } catch (error) {
          console.error("Erro ao ativar plano gratuito:", error);
          alert("Ocorreu um erro ao tentar ativar o plano gratuito. Por favor, tente novamente.");
        }
      } else {
        alert("Você já está no plano Cobre gratuito!");
      }
      return;
    }

    // Planos pagos
    setPlanoSelecionado(plano);
    
    // Criar solicitação de ativação
    try {
      await base44.entities.SolicitacaoAtivacaoPlano.create({
        usuario_email: user.email,
        usuario_nome: user.full_name,
        plano_solicitado: plano.tipo,
        link_mercadopago: plano.linkPagamento,
        status: "aguardando_confirmacao",
        data_solicitacao: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erro ao criar solicitação de plano:", error);
      alert("Ocorreu um erro ao iniciar a contratação do plano. Por favor, tente novamente.");
      return;
    }

    // Abrir link do Mercado Pago em nova aba (SEM back_urls - já configurado no painel do MP)
    window.open(plano.linkPagamento, '_blank');
    
    // Mostrar modal de confirmação
    setMostrarModalConfirmacao(true);
  };

  const handleConfirmarPagamento = async () => {
    if (!planoSelecionado || !user) return;
    
    setAguardandoConfirmacao(true);
    
    try {
      const solicitacoes = await base44.entities.SolicitacaoAtivacaoPlano.filter(
        { 
          usuario_email: user.email, 
          plano_solicitado: planoSelecionado.tipo,
        },
        '-created_date',
        1
      );

      if (solicitacoes.length > 0) {
        const solicitacao = solicitacoes[0];
        
        // Não atualizar se já foi aprovado pelo MP
        if (solicitacao.status === 'pagamento_aprovado_mp' || solicitacao.status === 'ativado_admin') {
          alert("✅ Seu pagamento já foi confirmado! Aguarde a ativação.");
          setMostrarModalConfirmacao(false);
          setPlanoSelecionado(null);
          return;
        }
        
        await base44.entities.SolicitacaoAtivacaoPlano.update(solicitacao.id, {
          status: "confirmado_usuario",
          data_confirmacao_usuario: new Date().toISOString()
        });

        await base44.entities.Notificacao.create({
          usuario_email: "admin@mapadaestetica.com.br",
          tipo: "nova_confirmacao_plano",
          titulo: `💬 Usuário Confirmou Pagamento - Plano ${planoSelecionado.nome.toUpperCase()}`,
          mensagem: `${user.full_name} (${user.email}) CONFIRMOU manualmente o pagamento do plano ${planoSelecionado.nome.toUpperCase()}. Verifique o pagamento no Mercado Pago e ative o plano.`,
          link_acao: `/solicitacoes-plano`
        });

        setPlanoAtualizado(planoSelecionado.nome.toUpperCase());
        setMostrarSucesso(true);
        setMostrarModalConfirmacao(false);
        setPlanoSelecionado(null);
        
        alert("✅ Sua confirmação foi registrada!\n\nNossa equipe foi notificada e ativará seu plano em até 24 horas.\n\nVocê receberá um e-mail de confirmação.");
      } else {
        alert("❌ Não encontramos uma solicitação de plano ativa.\n\nPor favor, tente novamente ou entre em contato:\n(31) 97259-5643");
      }
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      alert("❌ Erro ao processar sua confirmação.\n\nEntre em contato com o suporte:\n(31) 97259-5643");
    } finally {
      setAguardandoConfirmacao(false);
    }
  };

  const isAdmin = user?.role === 'admin';

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
            Você receberá um e-mail de confirmação em breve.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-base px-6 py-2">
            Planos para Profissionais e Empresas
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal para Você
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Aumente sua visibilidade, atraia mais clientes e impulsione seu negócio com nossos planos exclusivos
          </p>
        </div>

        {/* NOVO: Navegação por Abas */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setAbaPlanos("mapa_estetica")}
            variant={abaPlanos === "mapa_estetica" ? "default" : "outline"}
            className={`${abaPlanos === "mapa_estetica" ? "bg-pink-600 hover:bg-pink-700 text-white" : "text-gray-700 hover:text-pink-600 border-gray-300 hover:border-pink-600"}`}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Profissionais (Mapa da Estética)
          </Button>
          
          <Button
            onClick={() => setAbaPlanos("patrocinadores")}
            variant={abaPlanos === "patrocinadores" ? "default" : "outline"}
            className={`${abaPlanos === "patrocinadores" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-700 hover:text-blue-600 border-gray-300 hover:border-blue-600"}`}
          >
            <Users className="w-4 h-4 mr-2" />
            Empresas (Patrocinadores)
          </Button>
        </div>

        {/* Seção de Contato */}
        <div className="mb-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe4/ec64a4c52_drbeleza.png"
                    alt="Dr. Beleza"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <MessageCircle className="w-6 h-6 text-white hidden" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    💬 Fale com o Dr. Beleza
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Nosso assistente inteligente pode te ajudar a escolher o melhor plano!
                  </p>
                  <Button
                    onClick={() => setMostrarDrBeleza(true)}
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

      {/* ABA: PLANOS MAPA DA ESTÉTICA */}
      {abaPlanos === "mapa_estetica" && (
        <>
          {/* Plans Grid */}
          <div className="max-w-7xl mx-auto px-4 mb-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
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
        </>
      )}

      {/* ABA: PLANOS DE PATROCINADORES */}
      {abaPlanos === "patrocinadores" && (
        <>
          <div className="max-w-7xl mx-auto px-4 mb-12">
            <Alert className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
              <Users className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-900">
                <strong>Planos de Patrocínio:</strong> Torne-se um parceiro estratégico do Mapa da Estética e alcance milhares de profissionais e pacientes da área de estética!
              </AlertDescription>
            </Alert>
          </div>

          <div className="max-w-7xl mx-auto px-4 mb-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {planosPatrocinadores.map((plano, index) => {
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

                        <div className="space-y-2 mt-auto">
                          <Button
                            onClick={() => {
                              const mensagem = `Olá! Tenho interesse no Plano de Patrocínio ${plano.nome} do Mapa da Estética! 🤝`;
                              window.open(`https://wa.me/5531972595643?text=${encodeURIComponent(mensagem)}`, '_blank');
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                          >
                            Falar com Comercial
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

          {/* Benefits Section para Patrocinadores */}
          <Card className="border-none shadow-2xl bg-gradient-to-br from-blue-900 to-cyan-800 text-white mb-16">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4">Por Que Patrocinar o Mapa da Estética?</h2>
                <p className="text-blue-100">
                  Conecte sua marca com milhares de profissionais e clientes do setor de estética
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🎯</span>
                  </div>
                  <h3 className="font-semibold mb-2">Público Qualificado</h3>
                  <p className="text-sm text-blue-100">
                    Profissionais e clientes da área de estética
                  </p>
                </div>

                <div>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📈</span>
                  </div>
                  <h3 className="font-semibold mb-2">Máxima Visibilidade</h3>
                  <p className="text-sm text-blue-100">
                    Destaque em toda a plataforma
                  </p>
                </div>

                <div>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💼</span>
                  </div>
                  <h3 className="font-semibold mb-2">Relatórios Completos</h3>
                  <p className="text-sm text-blue-100">
                    Acompanhe o desempenho em tempo real
                  </p>
                </div>

                <div>
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🤝</span>
                  </div>
                  <h3 className="font-semibold mb-2">Parceria Estratégica</h3>
                  <p className="text-sm text-blue-100">
                    Equipe dedicada ao seu sucesso
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center">
            <p className="text-gray-600 mb-4 text-lg">Interessado em patrocinar?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={`https://wa.me/5531972595643?text=${encodeURIComponent("Olá! Gostaria de informações sobre patrocínio no Mapa da Estética! 🤝")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="bg-[#F7D426] hover:bg-[#E5C215] text-[#2C2C2C] font-bold">
                  Fale Conosco
                </Button>
              </a>
            </div>
          </div>
        </>
      )}

      {/* Modal de Confirmação de Pagamento */}
      <Dialog open={mostrarModalConfirmacao} onOpenChange={setMostrarModalConfirmacao}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">
              🔄 Finalize seu Pagamento
            </DialogTitle>
            <DialogDescription className="text-center">
              O Mercado Pago foi aberto em uma nova aba
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-lg mb-3 text-center">
                📋 Instruções:
              </h3>
              <ol className="space-y-3 text-sm list-none p-0">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs mt-0.5">1</span>
                  <span>Complete o pagamento na aba do Mercado Pago.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs mt-0.5">2</span>
                  <span>Após finalizar, volte aqui e clique em "Confirmar Pagamento".</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs mt-0.5">3</span>
                  <span>Seu plano será ativado em até 24 horas após a confirmação pela nossa equipe.</span>
                </li>
              </ol>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-sm">
                <strong>Importante:</strong> Você receberá uma confirmação por email assim que seu plano for ativado pela nossa equipe.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleConfirmarPagamento}
                disabled={aguardandoConfirmacao}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
              >
                {aguardandoConfirmacao ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar Pagamento Realizado
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  setMostrarModalConfirmacao(false);
                  setPlanoSelecionado(null);
                }}
                variant="outline"
                className="w-full"
              >
                Cancelar
              </Button>

              <p className="text-xs text-center text-gray-500">
                Dúvidas? Entre em contato: (31) 97259-5643
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dr. Beleza */}
      <DrBelezaPlanosModal
        open={mostrarDrBeleza}
        onClose={() => setMostrarDrBeleza(false)}
      />
    </div>
  );
}
