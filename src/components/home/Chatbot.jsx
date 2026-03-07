import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  X,
  ChevronRight,
  ArrowLeft,
  Home,
  Star,
  Sparkles,
  MapPin,
  CalendarCheck,
  ShieldCheck,
  HelpCircle,
  Phone
} from "lucide-react";

// Estrutura de respostas/menu sem IA
const buildMenus = (navigate) => {
  const openPlanos = () => navigate(createPageUrl("Planos"));
  const openMapa = () => navigate(createPageUrl("Mapa"));
  const openFaleConosco = () => navigate(createPageUrl("FaleConosco"));
  const openCadastrarAnuncio = () => navigate(createPageUrl("CadastrarAnuncio"));

  const NAV_ITEMS = {
    menu_inicial: { id: "menu_inicial", label: "⬅ Voltar ao menu inicial", next: "root", icon: Home },
    ver_outras: { id: "ver_outras", label: "❓ Ver outras dúvidas", next: "root", icon: HelpCircle },
    encerrar: { id: "encerrar", label: "✖ Encerrar conversa", action: "end" },
  };

  const MENUS = {
    root: {
      prompt: "Olá! 👋 Sou o Dr da Beleza.\nComo posso ajudar você?",
      optionsByType: {
        paciente: [
          { id: "encontrar_profissionais", label: "1️⃣ Como encontrar profissionais", icon: MapPin },
          { id: "agendar", label: "4️⃣ Como agendar um procedimento", icon: CalendarCheck },
          { id: "avaliar", label: "5️⃣ Como avaliar um profissional", icon: Star },
          { id: "planos", label: "3️⃣ Como funcionam os planos", icon: Sparkles },
          { id: "conta", label: "6️⃣ Problemas com minha conta", icon: ShieldCheck },
          { id: "suporte", label: "7️⃣ Falar com suporte", icon: Phone },
          NAV_ITEMS.encerrar,
        ],
        profissional: [
          { id: "cadastrar_anuncio", label: "2️⃣ Como cadastrar meu anúncio", icon: Sparkles },
          { id: "planos", label: "3️⃣ Como funcionam os planos", icon: Sparkles },
          { id: "encontrar_profissionais", label: "1️⃣ Como os pacientes me encontram", icon: MapPin },
          { id: "agendar", label: "4️⃣ Como agendamentos funcionam", icon: CalendarCheck },
          { id: "conta", label: "6️⃣ Problemas com minha conta", icon: ShieldCheck },
          { id: "suporte", label: "7️⃣ Falar com suporte", icon: Phone },
          NAV_ITEMS.encerrar,
        ],
        patrocinador: [
          { id: "planos", label: "3️⃣ Como funcionam os planos", icon: Sparkles },
          { id: "suporte", label: "7️⃣ Falar com suporte", icon: Phone },
          { id: "conta", label: "6️⃣ Problemas com minha conta", icon: ShieldCheck },
          NAV_ITEMS.encerrar,
        ],
        generico: [
          { id: "encontrar_profissionais", label: "1️⃣ Como encontrar profissionais", icon: MapPin },
          { id: "cadastrar_anuncio", label: "2️⃣ Como cadastrar meu anúncio", icon: Sparkles },
          { id: "planos", label: "3️⃣ Como funcionam os planos", icon: Sparkles },
          { id: "agendar", label: "4️⃣ Como agendar um procedimento", icon: CalendarCheck },
          { id: "avaliar", label: "5️⃣ Como avaliar um profissional", icon: Star },
          { id: "conta", label: "6️⃣ Problemas com minha conta", icon: ShieldCheck },
          { id: "suporte", label: "7️⃣ Falar com suporte", icon: Phone },
          NAV_ITEMS.encerrar,
        ],
      },
    },

    // Encontrar profissionais
    encontrar_profissionais: {
      answer:
        "Para encontrar profissionais no Mapa da Estética:\n\n1. Acesse o Mapa (menu superior)\n2. Use a barra de busca para procurar por cidade, tratamento ou profissional\n3. Aplique filtros por categoria, preço, distância e verificação\n4. Clique no card para ver detalhes, fotos, avaliações e contatos",
      options: [
        { id: "pesquisar_mapa", label: "Como pesquisar no mapa", icon: MapPin },
        { id: "filtrar_servicos", label: "Como filtrar serviços", icon: ChevronRight },
        NAV_ITEMS.menu_inicial,
        NAV_ITEMS.ver_outras,
        NAV_ITEMS.encerrar,
      ],
    },
    pesquisar_mapa: {
      answer:
        "Pesquisar no mapa:\n• Digite o nome do tratamento (ex: toxina, limpeza de pele) ou da cidade\n• Ative sua localização para ver opções próximas\n• Clique nos pinos para abrir o card do profissional",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
      cta: { label: "Abrir Mapa", action: openMapa },
    },
    filtrar_servicos: {
      answer:
        "Filtrar serviços:\n• Use filtros por: categoria, faixa de preço, avaliação e distância\n• Marque 'Profissional verificado' para ver quem possui documentação validada",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
    },

    // Cadastrar anúncio
    cadastrar_anuncio: {
      answer:
        "Para cadastrar seu anúncio no Mapa da Estética:\n\n1. Crie sua conta (ou faça login)\n2. Complete seu perfil profissional\n3. Escolha um plano disponível\n4. Publique seu anúncio no guia da cidade\n\nSeu anúncio aparecerá no mapa e no guia de profissionais.",
      options: [
        { id: "ver_planos", label: "Ver planos disponíveis", icon: Sparkles },
        { id: "destacar_anuncio", label: "Como destacar meu anúncio", icon: Star },
        NAV_ITEMS.menu_inicial,
        NAV_ITEMS.ver_outras,
        NAV_ITEMS.encerrar,
      ],
      cta: { label: "Cadastrar Anúncio", action: openCadastrarAnuncio },
    },
    ver_planos: {
      answer:
        "Planos disponíveis: cada plano desbloqueia mais visibilidade, ferramentas e benefícios. Profissionais com planos maiores têm prioridade no ranking e destaque nos resultados.",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
      cta: { label: "Abrir página de Planos", action: openPlanos },
    },
    destacar_anuncio: {
      answer:
        "Para destacar seu anúncio:\n• Complete todas as informações com fotos de qualidade\n• Ative o impulsionamento para subir posições temporariamente\n• Mantenha avaliações altas respondendo clientes com rapidez",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
    },

    // Planos
    planos: {
      answer:
        "Como funcionam os planos:\n• Cada plano oferece nível de exposição e recursos diferentes\n• Você pode fazer upgrade a qualquer momento\n• Alguns recursos são exclusivos (ex: IA, impulsionamento, badges)",
      options: [
        { id: "beneficios", label: "Benefícios dos planos", icon: Sparkles },
        { id: "diferencas", label: "Diferença entre os planos", icon: ChevronRight },
        NAV_ITEMS.menu_inicial,
        NAV_ITEMS.ver_outras,
        NAV_ITEMS.encerrar,
      ],
      cta: { label: "Ver planos", action: openPlanos },
    },
    beneficios: {
      answer:
        "Benefícios comuns dos planos:\n• Maior visibilidade no mapa e no guia\n• Recursos de destaque e impulsionamento\n• Ferramentas para conversão (contatos, avaliações, IA)\n• Suporte prioritário conforme o plano",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
      cta: { label: "Conhecer planos", action: openPlanos },
    },
    diferencas: {
      answer:
        "Diferenças entre os planos:\n• Exposição no mapa e ranking\n• Recursos habilitados (impulsionamento, badges, IA)\n• Limite de anúncios e categorias\n• Suporte e relatórios avançados",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
      cta: { label: "Comparar planos", action: openPlanos },
    },

    // Agendamentos
    agendar: {
      answer:
        "Agendar um procedimento:\n1. Abra o card do profissional\n2. Clique em Agendar ou entre em contato (WhatsApp/Telefone)\n3. Escolha data/horário e confirme",
      options: [
        { id: "como_agendar", label: "Como agendar", icon: CalendarCheck },
        { id: "como_cancelar", label: "Como cancelar", icon: ChevronRight },
        NAV_ITEMS.menu_inicial,
        NAV_ITEMS.ver_outras,
        NAV_ITEMS.encerrar,
      ],
    },
    como_agendar: {
      answer:
        "Como agendar:\n• No card, clique em 'Agendar'\n• Selecione data/horário disponível\n• Confirme os dados e finalize",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
    },
    como_cancelar: {
      answer:
        "Como cancelar:\n• Entre no seu perfil ou retorne ao card\n• Solicite cancelamento pelo canal do profissional\n• Verifique políticas de reembolso/horários",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
    },

    // Avaliações
    avaliar: {
      answer:
        "Avaliar um profissional:\n1. Abra o card do atendimento concluído\n2. Clique em 'Avaliar'\n3. Dê sua nota e deixe um comentário sincero",
      options: [
        { id: "como_avaliar", label: "Como avaliar", icon: Star },
        { id: "etiqueta_avaliacao", label: "Boas práticas ao avaliar", icon: ChevronRight },
        NAV_ITEMS.menu_inicial,
        NAV_ITEMS.ver_outras,
        NAV_ITEMS.encerrar,
      ],
    },
    como_avaliar: {
      answer:
        "Como avaliar:\n• Encontre o profissional atendido\n• Clique em 'Avaliar'\n• Descreva sua experiência com cordialidade",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
    },
    etiqueta_avaliacao: {
      answer:
        "Boas práticas:\n• Seja objetivo e educado\n• Informe o que funcionou e o que poderia melhorar\n• Evite dados pessoais sensíveis",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
    },

    // Conta / Suporte
    conta: {
      answer:
        "Sobre sua conta:\n• Edite seu perfil em 'Meu Perfil'\n• Caso esqueça a senha, use 'Esqueci minha senha' na tela de login\n• Para trocar tipo de conta, use a opção no menu do usuário",
      options: [
        { id: "editar_perfil", label: "Editar meu perfil", icon: ShieldCheck },
        { id: "problemas_login", label: "Problemas de login", icon: HelpCircle },
        NAV_ITEMS.menu_inicial,
        NAV_ITEMS.ver_outras,
        NAV_ITEMS.encerrar,
      ],
    },
    editar_perfil: {
      answer:
        "Editar perfil:\n• Acesse 'Meu Perfil' no menu do usuário (canto superior)\n• Atualize suas informações e salve",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
    },
    problemas_login: {
      answer:
        "Problemas de login:\n• Verifique seu e-mail e senha\n• Use 'Esqueci minha senha' para redefinir\n• Se persistir, fale com nosso suporte",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
    },
    suporte: {
      answer:
        "Suporte oficial:\n• WhatsApp: (21) 98034-3873\n• Página Fale Conosco para abrir um chamado",
      options: [NAV_ITEMS.menu_inicial, NAV_ITEMS.ver_outras, NAV_ITEMS.encerrar],
      cta: { label: "Abrir Fale Conosco", action: openFaleConosco },
    },
  };

  return MENUS;
};

export default function Chatbot({ user }) {
  const navigate = useNavigate();
  const MENUS = useMemo(() => buildMenus(navigate), [navigate]);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentKey, setCurrentKey] = useState("root");
  const [currentOptions, setCurrentOptions] = useState([]);

  const scrollRef = useRef(null);

  const tipo = user?.tipo_usuario || "generico";

  const resetToStart = () => {
    setMessages([
      { type: "bot", text: "Olá! 👋 Sou o Dr da Beleza.\nComo posso ajudar você?" },
    ]);
    const opts = MENUS.root.optionsByType[tipo] || MENUS.root.optionsByType.generico;
    setCurrentOptions(opts);
    setCurrentKey("root");
  };

  useEffect(() => {
    if (isOpen) resetToStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tipo]);

  useEffect(() => {
    try { scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }); } catch {}
  }, [messages, currentOptions]);

  const handleSelect = (option) => {
    // Encerrar conversa
    if (option.action === "end" || option.id === "encerrar") {
      resetToStart();
      return;
    }

    // Voltar/menu inicial
    if (option.next === "root" || option.id === "menu_inicial" || option.id === "ver_outras") {
      setMessages((prev) => [
        ...prev,
        { type: "user", text: option.label },
        { type: "bot", text: "Menu inicial aberto. Como posso ajudar?" },
      ]);
      const opts = MENUS.root.optionsByType[tipo] || MENUS.root.optionsByType.generico;
      setCurrentOptions(opts);
      setCurrentKey("root");
      return;
    }

    // CTA (ação imediata)
    if (option.action && typeof option.action === "function") {
      setMessages((prev) => [...prev, { type: "user", text: option.label }]);
      option.action();
      // Após ação, manter no mesmo menu oferecendo navegação
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Pronto! O que mais deseja fazer?" },
      ]);
      setCurrentOptions([
        { id: "menu_inicial", label: "⬅ Voltar ao menu inicial" },
        { id: "ver_outras", label: "❓ Ver outras dúvidas" },
        { id: "encerrar", label: "✖ Encerrar conversa", action: "end" },
      ]);
      return;
    }

    // Fluxo de menu/resposta
    const node = MENUS[option.id];
    if (!node) return;

    const navTail = [
      { id: "menu_inicial", label: "⬅ Voltar ao menu inicial" },
      { id: "ver_outras", label: "❓ Ver outras dúvidas" },
      { id: "encerrar", label: "✖ Encerrar conversa", action: "end" },
    ];

    setMessages((prev) => [
      ...prev,
      { type: "user", text: option.label },
      { type: "bot", text: node.answer || "Certo!" },
    ]);

    const nextOptions = [
      ...(node.options || []),
      // Garante botões obrigatórios sempre
      ...navTail.filter((base) => !(node.options || []).some((o) => o.id === base.id)),
    ];
    setCurrentOptions(nextOptions);
    setCurrentKey(option.id);
  };

  const renderOptions = (options) => (
    <div className="grid grid-cols-1 gap-2">
      {options.map((opt) => (
        <Button
          key={opt.id + opt.label}
          variant="outline"
          className="justify-between w-full text-left bg-white hover:bg-[#FFF9E6] border-2"
          onClick={() => handleSelect(opt)}
        >
          <span className="flex items-center gap-2">
            {opt.icon ? <opt.icon className="w-4 h-4" /> : null}
            {opt.label}
          </span>
          <ChevronRight className="w-4 h-4 opacity-60" />
        </Button>
      ))}
    </div>
  );

  return (
    <>
      {/* Botão Flutuante */}
      {!isOpen && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-[9999]">
          <div className="relative group">
            <div className="hidden sm:block absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-900 text-white text-sm rounded-lg py-3 px-4 shadow-xl max-w-xs">
                <p className="font-bold mb-1">💬 Dr da Beleza - Seu Assistente Virtual</p>
                <p className="text-xs text-gray-300">Menu interativo: dúvidas rápidas sem consumir IA.</p>
                <div className="absolute -bottom-2 right-4 w-4 h-4 bg-gray-900 transform rotate-45" />
              </div>
            </div>

            <button
              aria-label="Abrir chat Dr da Beleza"
              onClick={() => setIsOpen(true)}
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-2xl border-2 border-[#F7D426] overflow-hidden hover:scale-110 transition-transform duration-300 bg-[#F7D426]"
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/ec64a4c52_drbeleza.png"
                alt="Dr da Beleza"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div className="absolute inset-0 rounded-full bg-[#F7D426] opacity-30 animate-pulse pointer-events-none" />
            </button>
            <div className="sm:hidden absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-bold text-[#F7D426] bg-white px-2 py-1 rounded-full shadow-md border border-[#F7D426]">Dr da Beleza</span>
            </div>
          </div>
        </div>
      )}

      {/* Janela do Chat */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[10000] w-full p-2 sm:p-0 sm:w-[320px] md:w-[380px] sm:max-w-[calc(100vw-3rem)]">
          {/* Overlay mobile */}
          <div
            className="sm:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[9990]"
            onClick={() => setIsOpen(false)}
          />

          {/* Card do Chat */}
          <Card className="relative sm:border-none shadow-2xl overflow-hidden rounded-t-2xl sm:rounded-2xl h-[60vh] sm:h-[60vh] md:h-[480px] flex flex-col z-[10000] pointer-events-auto">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-[#F7D426] to-[#FFE066] p-4 flex items-center justify-between border-b-2 border-[#2C2C2C] flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-[#2C2C2C]">
                  <img
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/690153e49c59659beac8bfe7/ec64a4c52_drbeleza.png"
                    alt="Dr da Beleza"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-[#2C2C2C] text-base sm:text-lg">Dr da Beleza</h3>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-[#2C2C2C]/80">Assistente Virtual • Online</p>
                    <Badge className="bg-white text-[#2C2C2C] border border-[#2C2C2C] text-[10px]">
                      {tipo === 'profissional' ? '💼 Profissional' : tipo === 'paciente' ? '👤 Paciente' : tipo === 'patrocinador' ? '👑 Patrocinador' : '🌐 Visitante'}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button aria-label="Fechar chat" onClick={() => setIsOpen(false)} variant="ghost" size="icon" className="text-[#2C2C2C] hover:bg-[#2C2C2C]/10 w-10 h-10">
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mensagens */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain p-4 bg-gray-50 space-y-4 min-h-0">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`${m.type === 'user' ? 'bg-gradient-to-r from-[#F7D426] to-[#FFE066] text-[#2C2C2C] border-2 border-[#2C2C2C]' : 'bg-white shadow-md'} max-w-[85%] sm:max-w-[80%] rounded-2xl p-3`}>
                    <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                  </div>
                </div>
              ))}

              {/* CTA do nó atual, se existir */}
              {MENUS[currentKey]?.cta && (
                <div className="flex justify-start">
                  <Button onClick={MENUS[currentKey].cta.action} className="bg-[#2C2C2C] hover:bg-[#3A3A3A] text-[#F7D426] font-bold">
                    {MENUS[currentKey].cta.label}
                  </Button>
                </div>
              )}

              {/* Opções de navegação atuais */}
              <div className="mt-2">
                {renderOptions(currentOptions)}
              </div>
            </div>

            {/* Rodapé informativo */}
            <div className="p-2 bg-white border-t text-[11px] text-gray-500 text-center">
              Chat com respostas rápidas (sem consumo de IA)
            </div>
          </Card>

          {/* Overlay desktop clicável atrás do card */}
          <div className="hidden sm:block fixed inset-0 z-[9000] bg-transparent" onClick={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}