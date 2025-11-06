import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, TrendingUp, Rocket, Crown, Check, ArrowRight, AlertCircle, Loader2 } from "lucide-react";

export default function ImpulsionarAnuncioModal({ open, onClose, anuncio, user }) {
  const navigate = useNavigate();
  const [opcaoSelecionada, setOpcaoSelecionada] = useState(null);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [processando, setProcessando] = useState(false);

  const opcoesImpulsionamento = [
    {
      id: "basico",
      nome: "Básico",
      preco: 20,
      duracao: 7,
      duracaoTexto: "7 dias",
      beneficios: [
        "+50% de visualizações",
        "Destaque em busca local",
        "Prioridade nos resultados",
        "Badge 'Impulsionado'"
      ],
      cor: "from-blue-500 to-cyan-500",
      icon: <Zap className="w-6 h-6" />,
      linkPagamento: "LINK_BASICO_AQUI" // Você vai fornecer
    },
    {
      id: "intermediario",
      nome: "Intermediário",
      preco: 35,
      duracao: 14,
      duracaoTexto: "14 dias",
      beneficios: [
        "+150% de visualizações",
        "Destaque na Home",
        "Prioridade máxima",
        "Badge 'Destaque Premium'",
        "Relatório de performance"
      ],
      cor: "from-purple-500 to-pink-500",
      icon: <TrendingUp className="w-6 h-6" />,
      popular: true,
      linkPagamento: "LINK_INTERMEDIARIO_AQUI" // Você vai fornecer
    },
    {
      id: "turbo",
      nome: "Turbo",
      preco: 60,
      duracao: 30,
      duracaoTexto: "30 dias",
      beneficios: [
        "+300% de visualizações",
        "Destaque permanente",
        "Topo de todas as buscas",
        "Badge 'Turbo Boost'",
        "Relatório detalhado diário",
        "Suporte prioritário"
      ],
      cor: "from-orange-500 to-red-500",
      icon: <Rocket className="w-6 h-6" />,
      linkPagamento: "LINK_TURBO_AQUI" // Você vai fornecer
    }
  ];

  const handleImpulsionar = async (opcao) => {
    if (!user) {
      alert("Faça login para impulsionar!");
      return;
    }

    setOpcaoSelecionada(opcao);
    
    // Criar solicitação de impulsionamento
    try {
      await base44.entities.SolicitacaoImpulsionamento.create({
        usuario_email: user.email,
        usuario_nome: user.full_name,
        anuncio_id: anuncio.id,
        anuncio_titulo: anuncio.titulo,
        plano_impulsionamento: opcao.id,
        duracao_dias: opcao.duracao,
        valor: opcao.preco,
        link_mercadopago: opcao.linkPagamento,
        status: "aguardando_confirmacao",
        data_solicitacao: new Date().toISOString()
      });

      // Abrir link do Mercado Pago
      window.open(opcao.linkPagamento, '_blank');
      
      // Mostrar modal de confirmação
      setMostrarConfirmacao(true);
    } catch (error) {
      console.error("Erro ao criar solicitação:", error);
      alert("Erro ao processar impulsionamento. Tente novamente.");
    }
  };

  const handleConfirmarPagamento = async () => {
    if (!opcaoSelecionada || !user) return;
    
    setProcessando(true);
    
    try {
      const solicitacoes = await base44.entities.SolicitacaoImpulsionamento.filter(
        { 
          usuario_email: user.email, 
          anuncio_id: anuncio.id,
          plano_impulsionamento: opcaoSelecionada.id
        },
        '-created_date',
        1
      );

      if (solicitacoes.length > 0) {
        const solicitacao = solicitacoes[0];
        
        await base44.entities.SolicitacaoImpulsionamento.update(solicitacao.id, {
          status: "confirmado_usuario",
          data_confirmacao_usuario: new Date().toISOString()
        });

        // Notificar admin
        await base44.entities.Notificacao.create({
          usuario_email: "admin@mapadaestetica.com.br",
          tipo: "nova_confirmacao_plano",
          titulo: `🚀 Impulsionamento Confirmado - ${opcaoSelecionada.nome}`,
          mensagem: `${user.full_name} confirmou pagamento de impulsionamento ${opcaoSelecionada.nome} (R$ ${opcaoSelecionada.preco}) para o anúncio "${anuncio.titulo}".`,
          link_acao: `/controle-planos`
        });

        alert("✅ Confirmação registrada! Seu anúncio será impulsionado em até 24h.");
        setMostrarConfirmacao(false);
        onClose();
      }
    } catch (error) {
      console.error("Erro ao confirmar:", error);
      alert("Erro ao processar confirmação. Entre em contato: (31) 97259-5643");
    } finally {
      setProcessando(false);
    }
  };

  const handleVerPlanos = () => {
    onClose();
    navigate(createPageUrl("Planos"));
  };

  return (
    <>
      <Dialog open={open && !mostrarConfirmacao} onOpenChange={onClose}>
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
                    <p className="text-sm text-gray-500">{opcao.duracaoTexto} de impulsionamento</p>
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

      {/* Modal de Confirmação de Pagamento */}
      <Dialog open={mostrarConfirmacao} onOpenChange={() => setMostrarConfirmacao(false)}>
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
                  <span>Seu anúncio será impulsionado em até 24 horas.</span>
                </li>
              </ol>
            </div>

            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 text-sm">
                <strong>Importante:</strong> O impulsionamento será ativado após verificação do pagamento.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleConfirmarPagamento}
                disabled={processando}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold"
              >
                {processando ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
                  setMostrarConfirmacao(false);
                  onClose();
                }}
                variant="outline"
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}