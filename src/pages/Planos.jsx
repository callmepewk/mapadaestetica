import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, Sparkles, Star, Zap, Crown, Gem, ArrowRight, X, MessageCircle, Headphones, AlertCircle, CreditCard, Users, Loader2 } from "lucide-react";
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
      radar_frequencia: 1,
      relatorios: 1,
      especialidades: 1,
      anuncios: 1,
      tags: 1,
      dias_exposicao: 30
    },
    beneficios: [
      "1 Especialidade cadastrada",
      "1 Anúncio ativo",
      "1 Tag/palavra-chave do Google Negócio",
      "30 dias de exposição do anúncio",
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
    nome: "LITE",
    tipo: "lite",
    preco: "R$ 9,90/mês",
    cor: "from-rose-300 to-pink-500",
    icone: Sparkles,
    destaque: false,
    linkPagamento: "https://wa.me/5521980343873?text=Quero%20assinar%20o%20plano%20LITE%20(R$9,90)%20do%20Mapa%20da%20Est%C3%A9tica",
    limites: {
      radar_frequencia: 0,
      relatorios: 0,
      especialidades: 1,
      anuncios: 4,
      tags: 4,
      dias_exposicao: 30
    },
    beneficios: [
      "✅ Acesso ao WhatsApp dos profissionais",
      "1 Especialidade cadastrada",
      "Até 4 anúncios ativos",
      "4 Tags/palavras-chave",
      "30 dias de exposição por anúncio",
      "Perfil com leve destaque",
      "Estatísticas essenciais"
    ],
    naoInclui: [
      "Prioridade nas buscas",
      "Badge de verificação",
      "Suporte prioritário",
      "Relatórios avançados"
    ]
  },
  {
    nome: "BÁSICO",
    tipo: "prata",
    preco: "R$ 19,90/mês",
    cor: "from-gray-300 to-gray-500",
    icone: Star,
    destaque: false,
    linkPagamento: "https://payfast.greenn.com.br/146196",
    limites: {
      radar_frequencia: 1,
      relatorios: 2,
      especialidades: 1,
      anuncios: 8,
      tags: 8,
      dias_exposicao: 45
    },
    beneficios: [
      "✅ Acesso ao WhatsApp dos profissionais",
      "1 Especialidade cadastrada",
      "8 Anúncios ativos",
      "8 Tags/palavras-chave do Google Negócio",
      "45 dias de exposição por anúncio",
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
    preco: "R$ 39,90/mês",
    cor: "from-yellow-400 to-amber-500",
    icone: Crown,
    destaque: true,
    linkPagamento: "https://payfast.greenn.com.br/146197",
    limites: {
      radar_frequencia: 2,
      relatorios: 4,
      especialidades: 2,
      anuncios: 20,
      tags: 20,
      dias_exposicao: 60
    },
    beneficios: [
      "✅ Acesso ao WhatsApp dos profissionais",
      "1 Especialidade cadastrada",
      "20 Anúncios ativos",
      "20 Tags/palavras-chave premium",
      "30 dias de exposição por anúncio",
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
    preco: "R$ 99,90/mês",
    cor: "from-blue-400 to-cyan-500",
    icone: Gem,
    destaque: false,
    linkPagamento: "https://payfast.greenn.com.br/146195",
    limites: {
      radar_frequencia: 4,
      relatorios: 10,
      especialidades: 3,
      anuncios: 25,
      tags: 20,
      dias_exposicao: 30
    },
    beneficios: [
      "✅ Acesso ao WhatsApp dos profissionais",
      "3 Especialidades cadastradas",
      "25 Anúncios ativos",
      "20 Tags/palavras-chave premium",
      "30 dias de exposição por anúncio",
      "Até 200 pacientes (Cloud.IA) - R$ 697",
      "Prioridade máxima nas buscas",
      "Perfil PRIME com destaque exclusivo",
      "Suporte VIP 24/7",
      "Relatórios profissionais completos",
      "Selo PRIME Verificado",
      "Destaque na home page",
      "Galeria de fotos e vídeos ilimitada",
      "Integração básica WhatsApp Business"
    ],
    observacao: "💎 Condições especiais ao assinar o Cloud IA no plano PRIME - Créditos a mais sob consulta",
    naoInclui: [
      "Anúncios ilimitados",
      "Gerente de conta exclusivo",
      "Assistente IA personalizado",
      "Marketing digital incluso",
      "30 dias de exposição"
    ]
  },
  {
    nome: "PREMIUM",
    tipo: "platina",
    preco: "Consulte",
    cor: "from-purple-500 to-pink-600",
    icone: Zap,
    destaque: false,
    linkPagamento: null,
    limites: {
      radar_frequencia: 4,
      relatorios: 10,
      especialidades: "2 ou+",
      anuncios: 20,
      tags: 20,
      dias_exposicao: 90
    },
    beneficios: [
      "✅ Acesso ao WhatsApp dos profissionais",
      "2 ou+ Especialidades",
      "Até 20 anúncios",
      "20 Tags/palavras-chave premium",
      "90 dias de exposição por anúncio",
      "Smart Clinic R$ 298 + R$ 399 (e Cloud IA) - Incluídos",
      "Cloud.IA sem integração de sistemas internos (sob consulta)",
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
    observacao: "💎 Condições especiais ao assinar o Cloud IA no plano DELUXE - Créditos a mais sob consulta",
    naoInclui: []
  }
];

// Planos de Patrocinadores
const planosPatrocinadores = [
  {
    nome: "COBRE",
    tipo: "cobre",
    preco: "R$ 97/mês",
    precoNumerico: 97,
    minContratacao: "90 dias",
    pacotes: "3, 6 ou 12 meses",
    cor: "from-orange-400 to-amber-600",
    icone: Star,
    destaque: false,
    linkPagamento: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=64f4c445e58443728fa6a1f17b709f77",
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
    preco: "R$ 297/mês",
    precoNumerico: 297,
    minContratacao: "90 dias",
    pacotes: "3, 6 ou 12 meses",
    cor: "from-gray-300 to-gray-500",
    icone: Star,
    destaque: false,
    linkPagamento: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=3dc10d6629d0434b9ca9508a5cd29b14",
    beneficios: [
      "Logo destacado na home",
      "5 banners rotativos",
      "Link para site/redes sociais",
      "Produtos na loja (a partir do Prata)",
      "Prioridade alta em buscas",
      "Post mensal no blog",
      "Relatório mensal",
      "Suporte prioritário"
    ]
  },
  {
    nome: "OURO",
    tipo: "ouro",
    preco: "R$ 497/mês",
    precoNumerico: 497,
    minContratacao: "90 dias",
    pacotes: "3, 6 ou 12 meses",
    cor: "from-yellow-400 to-amber-500",
    icone: Crown,
    destaque: true,
    linkPagamento: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=7a61721455d54390b2ab88cb00359c33",
    beneficios: [
      "Logo premium na home",
      "10 banners rotativos",
      "Produtos na loja",
      "Seção exclusiva de patrocinador",
      "Artigos mensais no blog",
      "Espaço Golden Doctors",
      "Prioridade máxima em buscas",
      "Campanhas personalizadas",
      "Relatório semanal",
      "Suporte prioritário"
    ]
  },
  {
    nome: "DIAMANTE",
    tipo: "diamante",
    preco: "R$ 997/mês",
    precoNumerico: 997,
    minContratacao: "90 dias",
    pacotes: "3, 6 ou 12 meses",
    cor: "from-blue-400 to-cyan-500",
    icone: Gem,
    destaque: false,
    linkPagamento: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=a56e5ac52e244ea5a987d3138b7114c6",
    beneficios: [
      "Logo destaque máximo",
      "15 banners rotativos",
      "Produtos na loja",
      "Seção exclusiva premium",
      "2 artigos mensais no blog",
      "Espaço Golden Doctors",
      "Até 200 pacientes (Cloud.IA) - R$ 697",
      "Campanhas de email marketing",
      "Prioridade absoluta com assistente de vendas virtual 24h",
      "Relatório semanal",
      "Dashboards personalizados"
    ],
    observacao: "💎 Condições especiais ao assinar o Cloud IA no plano DIAMANTE - Créditos a mais sob consulta"
  },
  {
    nome: "PLATINA",
    tipo: "platina",
    preco: "R$ 1.997/mês",
    precoNumerico: 1997,
    minContratacao: "90 dias",
    pacotes: "3, 6 ou 12 meses",
    cor: "from-purple-500 to-pink-600",
    icone: Zap,
    destaque: false,
    linkPagamento: "https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=adde87a060b34328a11e5cd77f56fbd8",
    beneficios: [
      "Parceria estratégica completa",
      "Banners ilimitados",
      "Produtos na loja",
      "Smart Clinic R$ 298 + R$ 399 (e Cloud IA) - Incluídos",
      "Cloud.IA sem integração de sistemas internos (sob consulta)",
      "Programa de Afiliado",
      "Clube Golden Doctors",
      "Conteúdo ilimitado no blog",
      "Campanhas de performance",
      "Integração API completa",
      "Assistente de Marketing Virtual",
      "Relatórios em tempo real",
      "Dashboards personalizados",
      "Primeiro a saber novidades"
    ],
    observacao: "💎 Condições especiais ao assinar o Cloud IA no plano PLATINA - Créditos a mais sob consulta"
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
  const [abaPlanos, setAbaPlanos] = useState("mapa_estetica");

  const [mostrarModalConfirmacaoPatrocinador, setMostrarModalConfirmacaoPatrocinador] = useState(false);
  const [planoSelecionadoPatrocinador, setPlanoSelecionadoPatrocinador] = useState(null);
  const [enviandoSolicitacao, setEnviandoSolicitacao] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState(null);
  const [mensagemErro, setMensagemErro] = useState(null);

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
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const abaParam = params.get('aba');
    if (abaParam === 'patrocinadores') {
      setAbaPlanos('patrocinadores');
    }
  }, [location.search]);

  useEffect(() => {
    const verificarPagamento = async () => {
      const params = new URLSearchParams(location.search);
      
      // Suporte para ambos: Mercado Pago (collection_status) e Greenn (status)
      const collectionStatus = params.get('collection_status') || params.get('status');
      const planoParam = params.get('plano');
      const tipoPlanoParam = params.get('tipo_plano');

      if (collectionStatus && user && planoParam) {
        setVerificandoPagamento(true);

        try {
          const solicitacoes = await base44.entities.SolicitacaoAtivacaoPlano.filter(
            { 
              usuario_email: user.email, 
              plano_solicitado: planoParam,
              tipo_plano: tipoPlanoParam || 'profissional'
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

            // Aceitar tanto 'approved' quanto 'paid' (Greenn)
            if (collectionStatus === 'approved' || collectionStatus === 'paid') {
              updateData = { 
                status: 'pagamento_aprovado_mp', 
                data_pagamento_mp: new Date().toISOString() 
              };
              
              notificationType = `nova_confirmacao_plano_${tipoPlanoParam || 'profissional'}`;
              notificationTitle = `✅ Pagamento Aprovado - Plano ${planoParam.toUpperCase()} (${tipoPlanoParam || 'Profissional'})`;
              notificationMessage = `${user.full_name} (${user.email}) teve um pagamento APROVADO via Mercado Pago para o plano ${planoParam.toUpperCase()} (${tipoPlanoParam || 'Profissional'}). Verifique e ative o plano.`;

              setPlanoAtualizado(planoParam.toUpperCase());
              setMostrarSucesso(true);
              
              alertMessage = `🎉 Parabéns! Seu pagamento foi aprovado pelo Mercado Pago!\n\nNossa equipe foi notificada e seu plano ${planoParam.toUpperCase()} (${tipoPlanoParam || 'Profissional'}) será ativado em até 24 horas.\n\nVocê receberá um e-mail de confirmação assim que o plano estiver ativo.`;
              
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
              alertMessage = "❌ Seu pagamento foi rejeitado pelo Mercado Pago.\n\nTente novamente ou entre em contato com nosso suporte:\n(21) 98034-3873";
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
            if (collectionStatus === 'approved' || collectionStatus === 'paid') {
              await base44.entities.SolicitacaoAtivacaoPlano.create({
                usuario_email: user.email,
                usuario_nome: user.full_name,
                plano_solicitado: planoParam,
                tipo_plano: tipoPlanoParam || 'profissional',
                link_mercadopago: "Retorno direto do MP",
                status: "pagamento_aprovado_mp",
                data_solicitacao: new Date().toISOString(),
                data_pagamento_mp: new Date().toISOString()
              });

              await base44.entities.Notificacao.create({
                usuario_email: "admin@mapadaestetica.com.br",
                tipo: `nova_confirmacao_plano_${tipoPlanoParam || 'profissional'}`,
                titulo: `✅ Pagamento Aprovado - Plano ${planoParam.toUpperCase()} (${tipoPlanoParam || 'Profissional'})`,
                mensagem: `${user.full_name} (${user.email}) teve um pagamento APROVADO via Mercado Pago para o plano ${planoParam.toUpperCase()} (${tipoPlanoParam || 'Profissional'}). Verifique e ative o plano.`,
                link_acao: `/solicitacoes-plano`
              });

              setPlanoAtualizado(planoParam.toUpperCase());
              setMostrarSucesso(true);
              alert(`🎉 Parabéns! Seu pagamento foi aprovado!\n\nSeu plano ${planoParam.toUpperCase()} (${tipoPlanoParam || 'Profissional'}) será ativado em até 24 horas.`);
            } else if (collectionStatus === 'pending') {
              alert("⏳ Seu pagamento está pendente. Aguarde a aprovação do Mercado Pago.");
            } else if (collectionStatus === 'rejected') {
              alert("❌ Seu pagamento foi rejeitado. Tente novamente ou entre em contato: (21) 98034-3873");
            }
          }
        } catch (error) {
          console.error("Erro ao processar retorno do Mercado Pago:", error);
          alert("❌ Ocorreu um erro ao processar seu pagamento.\n\nPor favor, entre em contato com o suporte:\n(21) 98034-3873");
        } finally {
          setVerificandoPagamento(false);
          const cleanUrl = createPageUrl("Planos");
          window.history.replaceState({}, '', cleanUrl);
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

    setPlanoSelecionado(plano);
    
    try {
      await base44.entities.SolicitacaoAtivacaoPlano.create({
        usuario_email: user.email,
        usuario_nome: user.full_name,
        plano_solicitado: plano.tipo,
        tipo_plano: "profissional",
        link_mercadopago: plano.linkPagamento,
        status: "aguardando_confirmacao",
        data_solicitacao: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erro ao criar solicitação de plano:", error);
      alert("Ocorreu um erro ao iniciar a contratação do plano. Por favor, tente novamente.");
      return;
    }

    // Greenn/PayFast - abre diretamente o link
    window.open(plano.linkPagamento, '_blank');
    
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
          tipo_plano: "profissional",
        },
        '-created_date',
        1
      );

      if (solicitacoes.length > 0) {
        const solicitacao = solicitacoes[0];
        
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
          tipo: "nova_confirmacao_plano_profissional",
          titulo: `💬 Usuário Confirmou Pagamento - Plano ${planoSelecionado.nome.toUpperCase()} (Profissional)`,
          mensagem: `${user.full_name} (${user.email}) CONFIRMOU manualmente o pagamento do plano ${planoSelecionado.nome.toUpperCase()} (Profissional). Verifique o pagamento no Mercado Pago e ative o plano.`,
          link_acao: `/solicitacoes-plano`
        });

        setPlanoAtualizado(planoSelecionado.nome.toUpperCase());
        setMostrarSucesso(true);
        setMostrarModalConfirmacao(false);
        setPlanoSelecionado(null);
        
        alert("✅ Sua confirmação foi registrada!\n\nNossa equipe foi notificada e ativará seu plano em até 24 horas.\n\nVocê receberá um e-mail de confirmação.");
      } else {
        alert("❌ Não encontramos uma solicitação de plano ativa para este tipo.\n\nPor favor, tente novamente ou entre em contato:\n(21) 98034-3873");
      }
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      alert("❌ Erro ao processar sua confirmação.\n\nEntre em contato com o suporte:\n(21) 98034-3873");
    } finally {
      setAguardandoConfirmacao(false);
    }
  };

  const handleContratarPatrocinador = (plano) => {
    if (!user) {
      alert("Por favor, faça login para contratar um plano de patrocinador.");
      base44.auth.redirectToLogin(window.location.href);
      return;
    }

    if (!plano.linkPagamento) {
      alert("Link de pagamento em breve para este plano! Entre em contato pelo WhatsApp para mais informações.");
      return;
    }
    setPlanoSelecionadoPatrocinador(plano);
    setMostrarModalConfirmacaoPatrocinador(true);
  };

  const handleConfirmarPatrocinio = async () => {
    if (!planoSelecionadoPatrocinador || !user) return;

    setEnviandoSolicitacao(true);

    try {
      await base44.entities.SolicitacaoAtivacaoPlano.create({
        usuario_email: user.email,
        usuario_nome: user.full_name,
        plano_solicitado: planoSelecionadoPatrocinador.tipo,
        tipo_plano: "patrocinador",
        link_mercadopago: planoSelecionadoPatrocinador.linkPagamento,
        status: "aguardando_confirmacao",
        data_solicitacao: new Date().toISOString(),
        valor_mensal: planoSelecionadoPatrocinador.precoNumerico,
        observacoes: `Plano de Patrocinador ${planoSelecionadoPatrocinador.nome} - Contratação mínima: ${planoSelecionadoPatrocinador.minContratacao}`
      });

      await base44.integrations.Core.SendEmail({
        to: "suporte@mapadaestetica.com.br",
        subject: `Nova Solicitação de Plano Patrocinador - ${planoSelecionadoPatrocinador.nome}`,
        body: `
          Nova solicitação de plano patrocinador recebida:
          
          Usuário: ${user.full_name}
          Email: ${user.email}
          Plano: ${planoSelecionadoPatrocinador.nome} (${planoSelecionadoPatrocinador.tipo})
          Valor: ${planoSelecionadoPatrocinador.preco}
          Contratação mínima: ${planoSelecionadoPatrocinador.minContratacao}
          Data: ${new Date().toLocaleString('pt-BR')}
          
          Link de pagamento: ${planoSelecionadoPatrocinador.linkPagamento}
        `
      });

      // Abre o link direto da Greenn/PayFast para patrocinadores
      window.open(planoSelecionadoPatrocinador.linkPagamento, '_blank');
      
      setMostrarModalConfirmacaoPatrocinador(false);
      setMensagemSucesso("Solicitação de patrocínio enviada com sucesso! Você será redirecionado para o pagamento.");
      setTimeout(() => setMensagemSucesso(null), 5000);
    } catch (error) {
      console.error("Erro ao enviar solicitação de patrocínio:", error);
      setMensagemErro("Erro ao enviar solicitação de patrocínio. Por favor, tente novamente.");
      setTimeout(() => setMensagemErro(null), 5000);
    } finally {
      setEnviandoSolicitacao(false);
    }
  };

  const handleConsultarCreditos = () => {
    const mensagem = "Olá! Gostaria de saber sobre créditos adicionais para o Cloud IA no plano PRIME/DELUXE.";
    window.open(`https://wa.me/5521980343873?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const handleConsultarCreditosPatrocinador = () => {
    const mensagem = "Olá! Gostaria de saber sobre créditos adicionais para o Cloud IA no plano DIAMANTE/PLATINA de Patrocinador.";
    window.open(`https://wa.me/5521980343873?text=${encodeURIComponent(mensagem)}`, '_blank');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
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

      {mostrarSucesso && (
        <Alert className="max-w-4xl mx-auto mb-6 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            🎉 <strong>Parabéns!</strong> Seu plano <strong>{planoAtualizado}</strong> foi ativado com sucesso! 
            Você receberá um e-mail de confirmação em breve.
          </AlertDescription>
        </Alert>
      )}

      {mensagemSucesso && (
        <Alert className="max-w-4xl mx-auto mb-6 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{mensagemSucesso}</AlertDescription>
        </Alert>
      )}
      {mensagemErro && (
        <Alert className="max-w-4xl mx-auto mb-6 bg-red-50 border-red-200">
          <X className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{mensagemErro}</AlertDescription>
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

        {/* NAVEGAÇÃO POR ABAS */}
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
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/8b8866b2d_drbeleza.png"
                    alt="Dr da Beleza"
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
                    💬 Fale com o Dr da Beleza
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Nosso assistente inteligente pode te ajudar a escolher o melhor plano!
                  </p>
                  <Button
                    onClick={() => setMostrarDrBeleza(true)}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    Conversar com Dr da Beleza
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
                    href="https://wa.me/5521980343873?text=Olá%21%20Gostaria%20de%20informações%20sobre%20os%20planos%20do%20Mapa%20da%20Estética%21%20💆%uFE0F"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                      WhatsApp: (21) 98034-3873
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
                              <span className="text-gray-600">R.F (Radar de Frequência):</span>
                              <span className="font-bold">{plano.limites.radar_frequencia}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Relatórios:</span>
                              <span className="font-bold">{plano.limites.relatorios}</span>
                            </div>
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

                        {plano.observacao && (
                          <Alert className="mb-4 bg-blue-50 border-blue-200">
                            <AlertCircle className="h-3 w-3 text-blue-600" />
                            <AlertDescription className="text-blue-800 text-xs">
                              {plano.observacao}
                              <button
                                onClick={handleConsultarCreditos}
                                className="block mt-2 text-blue-700 hover:underline font-semibold"
                              >
                                📞 Falar com Central de Vendas
                              </button>
                            </AlertDescription>
                          </Alert>
                        )}

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
                            onClick={() => {
                              if (plano.tipo === 'platina') {
                                const mensagem = `Olá! Tenho interesse no Plano DELUXE do Mapa da Estética! Gostaria de saber mais detalhes e valores. 💎`;
                                window.open(`https://wa.me/5521980343873?text=${encodeURIComponent(mensagem)}`, '_blank');
                              } else {
                                handleContratarPlano(plano);
                              }
                            }}
                            className={`w-full ${
                              plano.destaque
                                ? "bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700"
                                : plano.tipo === 'cobre'
                                ? "bg-[#2C2C2C] hover:bg-[#3A3A3A]"
                                : plano.tipo === 'platina'
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                : "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                            }`}
                          >
                            {plano.tipo === 'cobre' ? 'Plano Gratuito' : plano.tipo === 'platina' ? 'Falar com Comercial' : 'Contratar Agora'}
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
                href={`https://wa.me/5521980343873?text=${encodeURIComponent("Olá! Gostaria de informações sobre os planos do Mapa da Estética! 💆‍♀️")}`}
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
                <br/>
                <span className="text-sm mt-1 block">⏱️ Contratação mínima: 90 dias | Pacotes disponíveis: 3, 6 ou 12 meses</span>
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
                          <div className="flex flex-col">
                            <span className="text-2xl font-bold">{plano.preco}</span>
                            <span className="text-xs mt-1 opacity-80">Min: {plano.minContratacao}</span>
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
                          
                          <div className="mt-4 pt-4 border-t">
                            <p className="text-xs text-gray-500 mb-1">📦 Pacotes:</p>
                            <p className="text-xs font-semibold text-gray-700">{plano.pacotes}</p>
                          </div>
                        </div>

                        {plano.observacao && (
                          <Alert className="mb-4 bg-blue-50 border-blue-200">
                            <AlertCircle className="h-3 w-3 text-blue-600" />
                            <AlertDescription className="text-blue-800 text-xs">
                              {plano.observacao}
                              <button
                                onClick={handleConsultarCreditosPatrocinador}
                                className="block mt-2 text-blue-700 hover:underline font-semibold"
                              >
                                📞 Falar com Central de Vendas
                              </button>
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="space-y-2 mt-auto">
                          <Button
                            onClick={() => handleContratarPatrocinador(plano)}
                            disabled={!plano.linkPagamento}
                            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                          >
                            {plano.linkPagamento ? "Adquirir Agora" : "Em Breve"}
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                          <Button
                            onClick={() => {
                              const mensagem = `Olá! Tenho interesse no Plano de Patrocínio ${plano.nome} do Mapa da Estética! 🤝`;
                              window.open(`https://wa.me/5521980343873?text=${encodeURIComponent(mensagem)}`, '_blank');
                            }}
                            variant="outline"
                            className="w-full text-sm"
                          >
                            Falar com Comercial
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
                href={`https://wa.me/5521980343873?text=${encodeURIComponent("Olá! Gostaria de informações sobre patrocínio no Mapa da Estética! 🤝")}`}
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

      {/* Modal de Confirmação de Pagamento (Profissional Plans) */}
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
                Dúvidas? Entre em contato: (21) 98034-3873
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Dr da Beleza */}
      <DrBelezaPlanosModal
        open={mostrarDrBeleza}
        onClose={() => setMostrarDrBeleza(false)}
      />

      {/* Modal de Confirmação de Patrocínio */}
      <Dialog open={mostrarModalConfirmacaoPatrocinador} onOpenChange={setMostrarModalConfirmacaoPatrocinador}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Confirmar Contratação de Plano Patrocinador</DialogTitle>
            <DialogDescription className="text-center">
              Você está prestes a contratar o plano de Patrocínio:
            </DialogDescription>
          </DialogHeader>

          {planoSelecionadoPatrocinador && (
            <div className="space-y-4 py-4">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800 text-sm">
                  <strong>Plano:</strong> {planoSelecionadoPatrocinador.nome}
                  <br/>
                  <strong>Valor:</strong> {planoSelecionadoPatrocinador.preco}
                  <br/>
                  <strong>Contratação mínima:</strong> {planoSelecionadoPatrocinador.minContratacao}
                  <br/>
                  <strong>Pacotes:</strong> {planoSelecionadoPatrocinador.pacotes}
                </AlertDescription>
              </Alert>

              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                <p className="text-sm text-yellow-900">
                  <strong>⚠️ Importante:</strong> Após clicar em "Confirmar e Pagar", você será redirecionado para o Mercado Pago para concluir o pagamento. 
                  Uma solicitação será enviada automaticamente para nossa equipe de suporte.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-4">
                <Button
                  onClick={() => {
                    setMostrarModalConfirmacaoPatrocinador(false);
                    setPlanoSelecionadoPatrocinador(null);
                  }}
                  variant="outline"
                  className="flex-1"
                  disabled={enviandoSolicitacao}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleConfirmarPatrocinio}
                  disabled={enviandoSolicitacao}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                >
                  {enviandoSolicitacao ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Confirmar e Pagar
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}