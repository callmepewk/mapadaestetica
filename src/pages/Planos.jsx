import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Medal, Trophy, Gem, MapPin, TrendingUp, Rocket, Sparkles } from "lucide-react";

export default function Planos() {
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        setAuth(isAuth);
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
        }
      } catch {}
    })();
  }, []);

  const userPlan = (user?.plano || user?.plano_assinatura || user?.assinatura_plano || "").toLowerCase();

  const handleChoose = (planId) => {
    const nextUrl = location.pathname + location.search;
    if (!auth) {
      base44.auth.redirectToLogin(nextUrl);
      return;
    }
    navigate(createPageUrl(`Checkout?plan=${planId}`));
  };

  const professionalPlans = [
    {
      id: "free",
      name: "Free (Profissional)",
      price: "R$ 0",
      period: "/mês",
      highlighted: false,
      cta: "Começar grátis",
      icon: Star,
      features: [
        "Presença básica no Mapa",
        "Publicação de 1 anúncio por mês",
        "Perfil simples e contato",
        "Suporte por e‑mail"
      ]
    },
    {
      id: "prime",
      name: "Prime (Profissional)",
      price: "R$ 99",
      period: "/mês",
      highlighted: true,
      cta: "Assinar Prime",
      icon: Crown,
      features: [
        "Destaque no Mapa e nos Anúncios",
        "Até 30 anúncios por mês",
        "RABI (Radar) básico + relatórios mensais",
        "Agendamento e WhatsApp 1‑clique",
        "Perfil profissional avançado e avaliações",
        "Impulsionamento mensal incluso",
        "Suporte prioritário"
      ]
    },
    {
      id: "premium",
      name: "Premium (Profissional)",
      price: "Sob consulta",
      period: "",
      highlighted: false,
      cta: "Falar com consultor",
      icon: Star,
      features: [
        "Tudo do Prime",
        "Anúncios ilimitados",
        "RABI completo + IA e insights de mercado",
        "Consultoria dedicada de posicionamento",
        "Impulsionamentos avançados e campanhas",
        "Integrações e relatórios personalizados",
        "Atendimento VIP / Sucesso do Cliente"
      ]
    }
  ];

  const sponsorPlans = [
    {
      id: "cobre",
      name: "Cobre (Patrocinador)",
      price: "A partir de R$ 499",
      period: "/mês",
      highlighted: false,
      cta: "Contratar Cobre",
      icon: Medal,
      features: [
        "1 banner rotativo (posições básicas)",
        "Exibição geográfica ampla",
        "Métricas essenciais (views e cliques)",
        "Tempo de exibição conforme plano"
      ]
    },
    {
      id: "prata",
      name: "Prata (Patrocinador)",
      price: "A partir de R$ 999",
      period: "/mês",
      highlighted: false,
      cta: "Contratar Prata",
      icon: Medal,
      features: [
        "2 banners rotativos",
        "Melhores posições em páginas-chave",
        "Segmentação por cidade/UF (básica)",
        "Relatório mensal de performance"
      ]
    },
    {
      id: "ouro",
      name: "Ouro (Patrocinador)",
      price: "A partir de R$ 1.999",
      period: "/mês",
      highlighted: true,
      cta: "Contratar Ouro",
      icon: Trophy,
      features: [
        "3 banners em posições premium",
        "Segmentação por público e região",
        "Conteúdos editoriais patrocinados",
        "Relatórios detalhados e recomendações"
      ]
    },
    {
      id: "diamante",
      name: "Diamante (Patrocinador)",
      price: "Sob consulta",
      period: "",
      highlighted: false,
      cta: "Falar com consultor",
      icon: Gem,
      features: [
        "4–5 banners com prioridade máxima",
        "Campanhas multi-páginas e formatos",
        "Segmentação avançada e testes A/B",
        "Suporte estratégico e co-criação de ações"
      ]
    },
    {
      id: "platina",
      name: "Platina (Patrocinador)",
      price: "Projeto custom",
      period: "",
      highlighted: false,
      cta: "Solicitar proposta",
      icon: Crown,
      features: [
        "Pacotes especiais e takeovers",
        "Séries de conteúdo e ativações",
        "Eventos, lançamentos e experiências",
        "Relatórios executivos e ROI tracking"
      ]
    }
  ];

  const Section = ({ title, subtitle, plans }) => (
    <section className="mb-12">
      <div className="mb-6 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((p) => {
          const Icon = p.icon || Star;
          const isCurrent = userPlan && userPlan.includes(p.id);
          return (
            <Card key={p.id} className={`${p.highlighted ? "border-2 border-[#F7D426] shadow-lg" : ""}`}>
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-[#F7D426]" />
                  <CardTitle className="text-xl">{p.name}</CardTitle>
                  {p.highlighted && (
                    <Badge className="ml-2 bg-[#F7D426] text-[#2C2C2C] font-bold">Mais Popular</Badge>
                  )}
                </div>
                <div className="text-3xl font-bold">
                  {p.price} {p.period && <span className="text-base font-medium text-gray-500">{p.period}</span>}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${p.highlighted ? "bg-[#2C2C2C] text-[#F7D426] border-2 border-[#2C2C2C]" : ""}`}
                  variant={p.highlighted ? "default" : "outline"}
                  onClick={() => handleChoose(p.id)}
                  disabled={isCurrent}
                >
                  {isCurrent ? "Plano atual" : p.cta}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Planos</h1>
          <p className="mt-2 text-gray-600">Escolha o plano ideal para crescer sua presença e atrair mais pacientes.</p>
          {userPlan && (
            <div className="mt-3 text-sm text-gray-700">
              Seu plano atual: <Badge className="bg-emerald-100 text-emerald-800">{userPlan}</Badge>
            </div>
          )}
        </div>

        {/* Hero estratégico para profissionais */}
        <div className="mb-12 rounded-2xl bg-gradient-to-br from-sky-500 to-violet-600 text-white p-6 md:p-10 shadow-xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="bg-white/15 text-white border-white/20 mb-3">Para Profissionais</Badge>
              <h2 className="text-2xl md:text-4xl font-extrabold leading-tight">
                Faça o Mapa trabalhar por você: atraia pacientes certos, todos os dias
              </h2>
              <p className="mt-3 text-white/90">
                Posicionamento local inteligente no mapa, vitrine sempre ativa e inteligência de mercado (RABI) para você
                decidir o que promover em cada bairro/cidade. Sem promessas vazias — só estratégia, dados e execução.
              </p>
              <ul className="mt-5 space-y-2 text-sm md:text-base">
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-emerald-300"/> Ranqueamento local que prioriza relevância e experiência do paciente</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-emerald-300"/> Leads qualificados com contato 1‑clique (WhatsApp) e agendamento</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-emerald-300"/> RABI: tendências reais de busca para ajustar suas ofertas toda semana</li>
                <li className="flex items-start gap-2"><Check className="w-4 h-4 mt-0.5 text-emerald-300"/> Impulsionamentos e avaliações para acelerar sua autoridade local</li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate(createPageUrl("Mapa"))}
                  className="text-sky-900 font-bold bg-white hover:bg-white/90"
                >
                  Ver o Mapa
                </Button>
                <Button
                  onClick={() => document.getElementById('planos-profissionais')?.scrollIntoView({behavior:'smooth'})}
                  className="bg-black/20 hover:bg-black/30 border border-white/30"
                >
                  Começar agora
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/15">
                <div className="flex items-center gap-2 text-white font-semibold"><MapPin className="w-4 h-4"/> Presença no mapa</div>
                <p className="text-xs text-white/80 mt-1">Seja encontrado por quem já está buscando perto de você.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/15">
                <div className="flex items-center gap-2 text-white font-semibold"><TrendingUp className="w-4 h-4"/> Tendências reais</div>
                <p className="text-xs text-white/80 mt-1">RABI mostra o que as pessoas procuram agora na sua região.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/15">
                <div className="flex items-center gap-2 text-white font-semibold"><Sparkles className="w-4 h-4"/> Autoridade</div>
                <p className="text-xs text-white/80 mt-1">Avaliações + conteúdo certo = confiança e conversão.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 backdrop-blur border border-white/15">
                <div className="flex items-center gap-2 text-white font-semibold"><Rocket className="w-4 h-4"/> Crescimento</div>
                <p className="text-xs text-white/80 mt-1">Impulsionamentos mensais para acelerar resultados.</p>
              </div>
            </div>
          </div>
        </div>

        <div id="planos-profissionais" />
        <Section
          title="Planos para Profissionais"
          subtitle="Foque no que importa: seus resultados e seus pacientes."
          plans={professionalPlans}
        />

        <Section
          title="Planos para Patrocinadores"
          subtitle="Dê escala à sua marca com posições, segmentações e métricas claras."
          plans={sponsorPlans}
        />

        <div className="mt-10 text-center text-xs text-gray-500">
          Valores promocionais por tempo limitado. Você pode cancelar quando quiser.
        </div>
      </div>
    </div>
  );
}