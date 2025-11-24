import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";

// Idiomas suportados
export const LANGUAGES = {
  'pt-BR': { name: 'Português (BR)', flag: '🇧🇷' },
  'pt-PT': { name: 'Português (PT)', flag: '🇵🇹' },
  'en': { name: 'English', flag: '🇺🇸' },
  'es': { name: 'Español', flag: '🇪🇸' },
  'fr': { name: 'Français', flag: '🇫🇷' },
  'de': { name: 'Deutsch', flag: '🇩🇪' },
  'it': { name: 'Italiano', flag: '🇮🇹' },
  'ja': { name: '日本語', flag: '🇯🇵' },
  'zh': { name: '中文', flag: '🇨🇳' },
  'ru': { name: 'Русский', flag: '🇷🇺' },
  'ar': { name: 'العربية', flag: '🇸🇦' }
};

// Context para i18n
const I18nContext = createContext();

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};

// Provider de i18n
export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt-BR');
  const [translations, setTranslations] = useState(null);
  const [loading, setLoading] = useState(true);

  // Detectar e carregar idioma
  useEffect(() => {
    const initializeLanguage = async () => {
      const savedLanguage = localStorage.getItem('mapadaestetica_language');
      if (savedLanguage && LANGUAGES[savedLanguage]) {
        setLanguage(savedLanguage);
        await loadTranslations(savedLanguage);
      } else {
        const browserLang = navigator.language || navigator.userLanguage;
        const detectedLang = Object.keys(LANGUAGES).find(lang => 
          browserLang.startsWith(lang) || browserLang.startsWith(lang.split('-')[0])
        );
        const finalLang = detectedLang || 'pt-BR';
        setLanguage(finalLang);
        await loadTranslations(finalLang);
      }
    };
    
    initializeLanguage();
  }, []);

  // Carregar traduções (gerar via IA se necessário)
  const loadTranslations = async (targetLanguage) => {
    setLoading(true);
    
    try {
      // Tentar carregar do localStorage
      const cacheKey = `translations_full_${targetLanguage}_v2`;
      const cachedTranslations = localStorage.getItem(cacheKey);
      
      if (cachedTranslations) {
        setTranslations(JSON.parse(cachedTranslations));
        setLoading(false);
        return;
      }

      // Se não tiver cache, gerar via IA
      console.log(`Gerando traduções para ${targetLanguage}...`);
      
      const prompt = `Traduza TODAS as seguintes strings para ${LANGUAGES[targetLanguage].name}.
      
IMPORTANTE: Retorne um objeto JSON válido com TODAS as traduções mantendo a mesma estrutura.

Base em Português (pt-BR):
${JSON.stringify(getPortugueseBase(), null, 2)}

REGRAS:
1. Mantenha a EXATA estrutura do JSON
2. Traduza TODOS os valores de string
3. NÃO traduza as chaves (keys) do JSON
4. Mantenha placeholders como {{count}}, {{name}}, etc.
5. Seja natural e fluente no idioma alvo
6. Para termos técnicos de estética, use os termos mais comuns no país

Retorne APENAS o JSON com as traduções, sem explicações.`;

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            nav: { type: "object" },
            common: { type: "object" },
            auth: { type: "object" },
            home: { type: "object" },
            map: { type: "object" },
            products: { type: "object" },
            plans: { type: "object" },
            blog: { type: "object" },
            ads: { type: "object" },
            profile: { type: "object" },
            chatbot: { type: "object" },
            footer: { type: "object" },
            alerts: { type: "object" },
            forms: { type: "object" },
            notifications: { type: "object" },
            cart: { type: "object" }
          }
        }
      });

      // Salvar no cache
      localStorage.setItem(cacheKey, JSON.stringify(resultado));
      setTranslations(resultado);
      
    } catch (error) {
      console.error('Erro ao carregar traduções:', error);
      // Fallback para português
      setTranslations(getPortugueseBase());
    } finally {
      setLoading(false);
    }
  };

  // Base em português
  const getPortugueseBase = () => ({
    nav: {
      home: "Início",
      map: "Mapa",
      products: "Produtos",
      plans: "Planos",
      blog: "Blog",
      about: "Sobre Nós",
      contact: "Fale Conosco",
      profile: "Meu Perfil",
      myPlan: "Meu Plano",
      myAds: "Meus Anúncios",
      createAd: "Cadastrar Anúncio",
      beautyClub: "Clube da Beleza",
      clubePlus: "Clube +",
      drBeleza: "Dr. Beleza",
      reports: "Relatórios",
      adminPanel: "Painel Admin",
      sponsorDashboard: "Dashboard Patrocinador",
      pointsStore: "Loja de Pontos",
      switchAccountType: "Trocar Tipo de Conta"
    },
    
    common: {
      welcome: "Bem-vindo",
      welcomeTo: "Bem-vindo ao Mapa da Estética",
      bestProfessionals: "Os melhores profissionais perto de você",
      login: "Entrar",
      logout: "Sair",
      signup: "Criar Conta",
      save: "Salvar",
      cancel: "Cancelar",
      delete: "Excluir",
      edit: "Editar",
      search: "Buscar",
      filter: "Filtrar",
      loading: "Carregando...",
      error: "Erro",
      success: "Sucesso",
      back: "Voltar",
      next: "Próximo",
      previous: "Anterior",
      close: "Fechar",
      confirm: "Confirmar",
      yes: "Sim",
      no: "Não",
      seeMore: "Ver mais",
      showLess: "Ver menos",
      readMore: "Ler mais",
      viewAll: "Ver todos",
      apply: "Aplicar",
      clear: "Limpar",
      send: "Enviar",
      share: "Compartilhar",
      like: "Curtir",
      comment: "Comentar",
      download: "Baixar",
      upload: "Enviar",
      uploading: "Enviando...",
      remove: "Remover",
      add: "Adicionar",
      select: "Selecionar",
      optional: "Opcional",
      required: "Obrigatório",
      phone: "Telefone",
      email: "Email",
      address: "Endereço",
      city: "Cidade",
      state: "Estado",
      zipCode: "CEP",
      name: "Nome",
      fullName: "Nome Completo",
      description: "Descrição",
      category: "Categoria",
      subcategory: "Subcategoria",
      price: "Preço",
      date: "Data",
      time: "Hora",
      status: "Status",
      active: "Ativo",
      inactive: "Inativo",
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
      expired: "Expirado",
      image: "Imagem",
      video: "Vídeo",
      images: "Imagens",
      videos: "Vídeos",
      uploadImage: "Enviar Imagem",
      uploadVideo: "Enviar Vídeo",
      addImage: "Adicionar Imagem",
      addVideo: "Adicionar Vídeo",
      gallery: "Galeria",
      contactInfo: "Informações de Contato",
      location: "Localização",
      hours: "Horário de Funcionamento",
      amenities: "Amenidades",
      services: "Serviços",
      aboutUs: "Sobre",
      reviews: "Avaliações",
      questions: "Perguntas",
      points: "Pontos",
      beautyCoins: "Beauty Coins",
      cart: "Carrinho",
      checkout: "Finalizar Compra",
      total: "Total",
      subtotal: "Subtotal",
      discount: "Desconto",
      viewMore: "Ver Mais",
      contactNow: "Entrar em Contato",
      clickToUpload: "Clique para enviar",
      dragAndDrop: "Arraste e solte arquivos aqui",
      maxFileSize: "Tamanho máximo",
      allowedFormats: "Formatos permitidos",
      professional: "Profissional",
      patient: "Paciente",
      sponsor: "Patrocinador"
    },

    auth: {
      loginTitle: "Entre na sua conta",
      signupTitle: "Crie sua conta",
      createFreeAccount: "Criar Conta Grátis",
      alreadyHaveAccount: "Já tem uma conta?",
      dontHaveAccount: "Não tem uma conta?",
      forgotPassword: "Esqueceu a senha?",
      resetPassword: "Redefinir Senha",
      email: "Email",
      password: "Senha",
      confirmPassword: "Confirmar Senha",
      fullName: "Nome Completo",
      loginButton: "Entrar",
      signupButton: "Cadastrar"
    },

    home: {
      heroTitle: "Encontre os Melhores Profissionais de Estética Perto de Você",
      heroSubtitle: "Mais de 64 categorias de serviços, milhares de profissionais verificados",
      searchPlaceholder: "Buscar procedimentos, profissionais...",
      cityPlaceholder: "Cidade",
      searchButton: "Buscar Profissionais",
      featuredCategories: "Categorias em Destaque",
      featuredAds: "Anúncios em Destaque",
      noAds: "Nenhum anúncio encontrado",
      drBelezaTitle: "🤖 Dr. Beleza - Assistente Inteligente",
      drBelezaDesc: "Tire suas dúvidas sobre tratamentos estéticos com nosso assistente IA",
      askDrBeleza: "Perguntar ao Dr. Beleza",
      becomeProfessional: "É profissional? Anuncie aqui!",
      joinNetwork: "Faça parte da maior rede de estética do Brasil",
      createAdButton: "Criar Anúncio Grátis",
      myAdsTitle: "Meus Anúncios",
      totalAds: "Total de Anúncios",
      totalViews: "Total de Visualizações",
      totalLikes: "Total de Curtidas",
      seeAllAds: "Ver Todos os Anúncios",
      blogTitle: "📰 Blog - Novidades e Tendências",
      blogDesc: "Fique por dentro das últimas novidades do mundo da estética",
      accessBlog: "Acessar Blog",
      ecosystemTitle: "💼 Nosso Ecossistema",
      clubeBelezaDesc: "Clube de benefícios com descontos exclusivos",
      clubePlusDesc: "Sistema completo de gestão para clínicas",
      accessPlatform: "Acessar Plataforma",
      sponsorsTitle: "🤝 Patrocinadores",
      sponsorsDesc: "Empresas que confiam na gente",
      viewSponsorPlans: "Ver Planos de Patrocínio",
      followUs: "Siga-nos nas Redes Sociais",
      followOnInstagram: "Siga no Instagram",
      followOnFacebook: "Siga no Facebook"
    },

    map: {
      title: "Mapa da Estética",
      subtitle: "Encontre profissionais e estabelecimentos perto de você",
      searchPlaceholder: "Buscar por nome, categoria, procedimento...",
      filterByCategory: "Filtrar por Categoria",
      filterByPrice: "Filtrar por Preço",
      filterByDistance: "Filtrar por Distância",
      allCategories: "Todas as Categorias",
      orderBy: "Ordenar por",
      distance: "Distância",
      rating: "Avaliação",
      recent: "Mais Recentes",
      priceRange: "Faixa de Preço",
      establishmentType: "Tipo de Estabelecimento",
      showingResults: "Mostrando {{count}} resultados",
      noResults: "Nenhum resultado encontrado",
      mapView: "Mapa",
      listView: "Lista",
      gridView: "Grade",
      getDirections: "Como Chegar",
      viewDetails: "Ver Detalhes",
      callNow: "Ligar Agora",
      whatsapp: "WhatsApp",
      openNow: "Aberto Agora",
      closed: "Fechado",
      alwaysOpen: "Sempre Aberto",
      notAvailable: "N/D",
      kmAway: "{{distance}} km",
      verified: "Verificado",
      sponsored: "Patrocinado",
      specialties: "Especialidades",
      amenitiesTitle: "Amenidades",
      parking: "Estacionamento",
      valetParking: "Valet",
      petFriendly: "Aceita Pets",
      lounge: "Lounge",
      loungeBar: "Lounge Bar",
      ambientMusic: "Música Ambiente",
      security24h: "Segurança 24h"
    },

    products: {
      title: "Produtos e Serviços",
      subtitle: "Encontre produtos e serviços especializados",
      allProducts: "Todos os Produtos",
      allServices: "Todos os Serviços",
      forProfessionals: "Para Profissionais",
      forPatients: "Para Pacientes",
      addToCart: "Adicionar ao Carrinho",
      buyNow: "Comprar Agora",
      learnMore: "Saiba Mais",
      outOfStock: "Fora de Estoque",
      inStock: "Em Estoque",
      exclusive: "Exclusivo para Membros",
      searchProducts: "Buscar produtos...",
      filterByCategory: "Filtrar por Categoria",
      sortBy: "Ordenar por",
      relevance: "Relevância",
      priceLowToHigh: "Menor Preço",
      priceHighToLow: "Maior Preço",
      newest: "Mais Novos",
      mostPopular: "Mais Populares",
      noProducts: "Nenhum produto encontrado",
      from: "A partir de",
      price: "Preço",
      contactForPrice: "Consultar",
      featured: "Destaque"
    },

    plans: {
      title: "Escolha Seu Plano",
      subtitle: "Planos profissionais com benefícios exclusivos",
      professionalPlans: "Planos Profissionais - Mapa da Estética",
      sponsorPlans: "Planos de Patrocínio - Empresas",
      clubePlans: "Planos Clube da Beleza",
      monthly: "/mês",
      perMonth: "por mês",
      perDay: "/dia",
      mostPopular: "Mais Popular",
      recommended: "Recomendado",
      currentPlan: "Plano Atual",
      upgrade: "Fazer Upgrade",
      hirePlan: "Contratar Plano",
      talkToSales: "Falar com Vendas",
      freePlan: "Plano Grátis",
      features: "Recursos Inclusos",
      limitations: "Limitações",
      notIncluded: "Não Incluído",
      contactSales: "Falar com Vendas",
      compare: "Comparar Planos",
      faq: "Perguntas Frequentes",
      benefits: "Benefícios",
      allFeatures: "Todos os Recursos",
      inXInstallments: "12x de",
      originalPrice: "De",
      blackNovember: "🔥 Oferta Black November",
      limitedOffer: "Oferta Limitada",
      signUpNow: "Assinar Agora",
      freeForever: "Grátis para Sempre",
      bestValue: "Melhor Custo-Benefício",
      premiumExperience: "Experiência Premium",
      consultPrice: "Sob Consulta",
      whatYouGet: "O que você recebe",
      professionalAccess: "Acesso ao Mapa da Estética",
      verifiedBadge: "Selo de Verificação",
      priority: "Prioridade",
      support24_7: "Suporte 24/7"
    },

    blog: {
      title: "Blog",
      subtitle: "Novidades, tendências e dicas de estética",
      allArticles: "Todos os Artigos",
      forProfessionals: "Para Profissionais",
      forGeneral: "Público Geral",
      readArticle: "Ler Artigo",
      minutesRead: "{{minutes}} min",
      minutesOfReading: "{{minutes}} minutos de leitura",
      relatedArticles: "Artigos Relacionados",
      shareArticle: "Compartilhar",
      comments: "Comentários",
      writeComment: "Escrever comentário...",
      sendComment: "Enviar",
      reply: "Responder",
      loadMore: "Carregar mais",
      noComments: "Nenhum comentário ainda",
      beFirst: "Seja o primeiro a comentar!",
      createPost: "Criar Publicação",
      createWithAI: "Criar com IA",
      writePost: "Escrever publicação...",
      publishNow: "Publicar Agora",
      schedule: "Agendar",
      draft: "Rascunho",
      published: "Publicado",
      aiAssistant: "Assistente IA",
      generateWithAI: "Gerar com IA",
      externalSources: "Fontes Externas",
      theme: "Tema",
      targetAudience: "Público-Alvo",
      generateArticle: "Gerar Artigo",
      generating: "Gerando...",
      postCreated: "Publicação criada com sucesso!",
      views: "{{count}} visualizações",
      likes: "{{count}} curtidas",
      readingTime: "Tempo de leitura",
      author: "Autor",
      publishedOn: "Publicado em",
      updatedOn: "Atualizado em",
      categories: "Categorias",
      tags: "Tags",
      sponsored: "Patrocinado"
    },

    ads: {
      createAd: "Criar Anúncio",
      editAd: "Editar Anúncio",
      myAds: "Meus Anúncios",
      savedAds: "Anúncios Salvos",
      adDetails: "Detalhes do Anúncio",
      basicInfo: "Informações Básicas",
      title: "Título",
      titlePlaceholder: "Ex: Harmonização Facial Completa com Especialista",
      description: "Descrição",
      descriptionPlaceholder: "Descreva detalhadamente os serviços oferecidos...",
      category: "Categoria",
      selectCategory: "Selecione a categoria",
      subcategory: "Subcategoria",
      adType: "Tipo de Anúncio",
      selectType: "Selecione o tipo",
      priceRange: "Faixa de Preço",
      selectPriceRange: "Selecione a faixa",
      images: "Imagens",
      videos: "Vídeos",
      imagesAndVideos: "Imagens e Vídeos do Anúncio",
      mainMedia: "Mídia Principal",
      mainImage: "Imagem Principal",
      mainVideo: "Vídeo Principal",
      chooseImageOrVideo: "Escolha uma imagem ou vídeo de capa",
      gallery: "Galeria",
      imageGallery: "Galeria de Imagens",
      videoGallery: "Galeria de Vídeos",
      upToXImages: "até {{count}} imagens",
      upToXVideos: "até {{count}} vídeos de 30s cada",
      addMoreImages: "Adicionar mais imagens",
      addVideos: "Adicionar vídeos (máx 30s cada)",
      maxVideoDuration: "Vídeos devem ter no máximo 30 segundos",
      videoMaxDuration: "máx 30 segundos",
      videoExceedsLimit: "O vídeo deve ter no máximo 30 segundos",
      invalidVideo: "Por favor, selecione um arquivo de vídeo válido",
      contactInfo: "Informações de Contato",
      professional: "Profissional",
      phone: "Telefone",
      whatsapp: "WhatsApp",
      email: "Email",
      socialMedia: "Redes Sociais",
      instagram: "Instagram",
      facebook: "Facebook",
      website: "Site",
      location: "Localização",
      exactLocation: "Compartilhar Localização Exata",
      exactLocationDesc: "Permitir que clientes obtenham direções precisas usando GPS",
      useMyLocation: "Usar Minha Localização",
      gettingLocation: "Buscando localização...",
      street: "Rua",
      number: "Número",
      complement: "Complemento",
      neighborhood: "Bairro",
      city: "Cidade",
      state: "Estado",
      zipCode: "CEP",
      addressObservations: "Observações do Endereço",
      addressPlaceholder: "Ex: Próximo ao metrô, estacionamento na rua",
      hours: "Horário de Funcionamento",
      hoursPlaceholder: "Ex: Seg a Sex: 9h às 18h",
      operatingStatus: "Status de Funcionamento",
      selectStatus: "Selecione o status",
      openNow: "Aberto Agora",
      closed: "Fechado",
      alwaysOpen: "Sempre Aberto (24h)",
      notInformed: "Não Informado",
      amenities: "Amenidades do Estabelecimento",
      parking: "🅿️ Estacionamento",
      valetParking: "🚗 Estacionamento com Valet",
      petFriendly: "🐕 Aceita Pets",
      lounge: "🛋️ Lounge",
      loungeBar: "🍷 Lounge Bar",
      ambientMusic: "🎵 Música Ambiente",
      security: "🛡️ Segurança 24h",
      verification: "Verificação de Autoridade",
      becomeVerified: "Torne-se um Profissional Verificado",
      verifiedDesc: "Ganhe o selo de verificação ✓ similar ao Meta e aumente sua credibilidade!",
      howItWorks: "Como funciona",
      uploadDocuments: "Envie os 3 documentos abaixo e nossa equipe irá verificar",
      afterApproval: "Após aprovação, você receberá o selo de profissional verificado!",
      healthLicense: "Licença Sanitária",
      operatingPermit: "Alvará de Funcionamento",
      professionalRegistry: "Registro Profissional",
      documentSent: "✓ Documento enviado",
      uploadDocument: "Clique para enviar",
      sendForVerification: "Enviar para Verificação",
      procedures: "Procedimentos/Serviços Oferecidos",
      selectProcedures: "Selecionar Procedimentos",
      noProceduresAdded: "Nenhum procedimento adicionado",
      clickToAdd: "Clique em 'Selecionar Procedimentos' para adicionar",
      searchProcedure: "Buscar procedimento...",
      noProceduresFound: "Nenhum procedimento encontrado",
      tags: "Palavras-chave / Hashtags",
      tagsPlaceholder: "Ex: botox, harmonização, preenchimento",
      tagsHelp: "Adicione palavras-chave para melhorar a busca do seu anúncio",
      mapIcon: "Ícone no Mapa",
      chooseEmoji: "🎨 Escolher Emoji",
      aiSuggestEmoji: "IA Sugerir",
      thisEmojiWillAppear: "Este emoji aparecerá no mapa",
      clickToChange: "Clique para alterar",
      establishmentType: "Tipo de Estabelecimento",
      selectEstablishment: "Selecione o tipo de estabelecimento",
      establishmentDesc: "Cada tipo possui uma classificação em estrelas",
      classification: "Classificação",
      star: "estrela",
      stars: "estrelas",
      aiHelp: "Pedir Ajuda IA",
      generateComplete: "Gerar Anúncio Completo com IA",
      aiDescription: "Receba sugestões de descrição baseadas no seu título e categoria",
      aiTitle: "Receba sugestões de título baseadas na sua categoria",
      generating: "Gerando...",
      generatedTitle: "Título Gerado",
      generatedDescription: "Descrição Gerada",
      copyText: "Copiar Texto",
      generateAnother: "Gerar Outro",
      useThis: "Usar Este",
      applied: "Aplicado com sucesso!",
      fillBasicInfo: "Preencha informações básicas e deixe a IA criar seu anúncio completo",
      businessType: "Tipo de Negócio",
      mainSpecialty: "Especialidade Principal",
      differentials: "Diferenciais do Seu Negócio",
      targetAudience: "Público-Alvo",
      yearsExperience: "Anos de Experiência",
      generateAd: "Gerar Anúncio",
      adGenerated: "Anúncio gerado com sucesso!",
      reviewBeforeApply: "Revise as informações abaixo antes de aplicar",
      applyToForm: "Aplicar ao Formulário",
      generateAgain: "Gerar Novamente",
      fieldsKept: "Os campos que você já havia preenchido foram mantidos",
      professionalDesign: "Design Profissional de Imagens",
      exclusiveService: "Serviço exclusivo com equipe especializada",
      wantToHire: "Deseja Contratar Este Serviço Exclusivo?",
      designTeamDesc: "Nossa equipe de design profissional criará imagens personalizadas e de alta qualidade",
      professionalDesignFeature: "Design Profissional",
      highQuality: "Alta Qualidade",
      customization: "Personalização",
      contactDesignTeam: "Falar com Equipe de Design",
      maybeLater: "Talvez Depois",
      investment: "Investimento",
      contactForPricing: "Entre em contato para saber valores e prazos",
      publishAd: "Cadastrar Anúncio",
      publishing: "Cadastrando...",
      adPublished: "Anúncio cadastrado com sucesso! Redirecionando...",
      fillRequired: "Preencha os campos obrigatórios",
      logo: "Logo / Foto do Profissional",
      logoDescription: "Imagem que aparecerá como identificação do seu perfil",
      coverImage: "Imagem de capa do seu anúncio",
      preferablySquare: "Preferencialmente quadrada (1:1)",
      locationAlert: "Para garantir que seu estabelecimento apareça no Mapa da Estética, preencha todas as informações de endereço",
      moreComplete: "Quanto mais completo, melhor sua visibilidade!"
    },

    profile: {
      myProfile: "Meu Perfil",
      editProfile: "Editar Perfil",
      saveChanges: "Salvar Alterações",
      cancel: "Cancelar",
      personalInfo: "Informações Pessoais",
      professionalInfo: "Informações Profissionais",
      documents: "Documentos Profissionais",
      accountSettings: "Configurações da Conta",
      accountType: "Tipo de Conta",
      patient: "👤 Paciente",
      professional: "💼 Profissional",
      sponsor: "👑 Patrocinador",
      admin: "👑 Admin",
      tester: "Tester",
      daysTest: "(7 dias)",
      switchType: "Trocar Tipo de Conta",
      cantSwitchYet: "Você poderá trocar novamente em",
      days: "dias",
      contactSupport: "Contatar Suporte",
      myPlan: "Meu Plano",
      currentPlan: "Plano Atual",
      upgradePlan: "Fazer Upgrade",
      planExpires: "Expira em",
      pointsAccumulated: "Pontos Acumulados",
      beautyCoins: "Beauty Coins",
      goToStore: "Ir para Loja",
      referralProgram: "Programa de Indicação",
      myReferrals: "Minhas Indicações",
      referralLink: "Link de Indicação",
      copyLink: "Copiar Link",
      linkCopied: "Link copiado!",
      totalReferrals: "Total de Indicações",
      validatedReferrals: "Indicações Validadas",
      pendingReferrals: "Pendentes",
      earnedPoints: "Pontos Ganhos",
      shareAndEarn: "Compartilhe e ganhe pontos!",
      statistics: "Estatísticas",
      totalAds: "Total de Anúncios",
      totalViews: "Total de Visualizações",
      totalLikes: "Total de Curtidas",
      performanceReport: "Relatório de Desempenho",
      exportReport: "Exportar Relatório",
      sendReport: "Enviar Relatório",
      sendViaWhatsApp: "Enviar via WhatsApp",
      downloadHTML: "Baixar HTML",
      whatsappNumber: "Número do WhatsApp",
      enterNumber: "Digite o número com código do país",
      close: "Fechar",
      myOrders: "Meus Pedidos",
      order: "Pedido",
      orderDate: "Data do Pedido",
      orderStatus: "Status",
      trackOrder: "Rastrear",
      viewOrder: "Ver Pedido",
      noOrders: "Nenhum pedido encontrado",
      tabs: {
        info: "Informações",
        myAds: "Meus Anúncios",
        savedAds: "Anúncios Salvos",
        stats: "Estatísticas",
        products: "Produtos & Serviços",
        referrals: "Indicações"
      },
      deleteAccount: "Excluir Conta",
      confirmDeleteAccount: "Tem certeza que deseja excluir sua conta permanentemente?",
      thisActionCannot: "Esta ação não pode ser desfeita",
      accountDeleted: "Conta excluída com sucesso",
      photo: "Foto de Perfil",
      changePhoto: "Alterar Foto",
      bio: "Biografia",
      bioPlaceholder: "Conte um pouco sobre você...",
      specialties: "Especialidades",
      experience: "Experiência",
      yearsOfExperience: "{{years}} anos de experiência",
      education: "Formação",
      certifications: "Certificações",
      uploadCertificate: "Enviar Certificado",
      awards: "Prêmios e Reconhecimentos",
      completeCadastro: "Completar Cadastro",
      cadastroIncomplete: "Cadastro Incompleto",
      completeNow: "Complete agora para ter acesso total!"
    },

    chatbot: {
      greeting: "Olá! Sou o Dr. Beleza, seu assistente virtual. Como posso ajudar?",
      placeholder: "Digite sua mensagem...",
      send: "Enviar",
      thinking: "Pensando...",
      typing: "Digitando...",
      suggestedQuestions: "Perguntas Sugeridas",
      howCanIHelp: "Como posso te ajudar hoje?",
      askAboutProcedures: "Perguntar sobre procedimentos",
      findProfessionals: "Encontrar profissionais",
      learnAboutPlans: "Saber sobre planos",
      generalQuestions: "Dúvidas gerais",
      completeCadastro: "Completar Cadastro",
      needHelp: "Precisa de ajuda?",
      talkToHuman: "Falar com Atendente",
      closeChat: "Fechar Chat",
      minimize: "Minimizar",
      examples: "Exemplos de perguntas",
      exampleQ1: "Quais são os planos disponíveis?",
      exampleQ2: "Como faço para anunciar?",
      exampleQ3: "Quais categorias vocês oferecem?",
      newConversation: "Nova Conversa",
      clearHistory: "Limpar Histórico",
      poweredByAI: "Powered by AI"
    },

    footer: {
      description: "A maior plataforma de profissionais de estética do Brasil",
      quickLinks: "Links Rápidos",
      start: "Início",
      map: "Mapa",
      products: "Produtos",
      plans: "Planos",
      blog: "Blog",
      contacts: "Contatos",
      salesCenter: "Central de Vendas",
      technicalSupport: "Suporte Técnico",
      businessPartnerships: "Business & Partnerships",
      sponsorshipsAndAdvertisers: "Patrocínios e Anunciantes",
      institutional: "Institucional",
      contactUs: "Fale Conosco",
      aboutUs: "Sobre Nós",
      drBeleza: "Dr. Beleza",
      allRightsReserved: "Todos os direitos reservados",
      cnpj: "CNPJ",
      exclusiveBenefits: "Clube de Benefícios Exclusivos",
      ourProducts: "🌟 Nossos Produtos",
      beautyClub: "Clube da Beleza",
      clubePlus: "Clube +"
    },

    alerts: {
      testExpired: "Seu período de teste expirou!",
      testExpiredDesc: "Faça upgrade agora e continue aproveitando todos os recursos ilimitados",
      viewPlans: "Ver Planos",
      incompleteCadastro: "Complete seu cadastro para ter acesso total à plataforma!",
      completeNow: "Completar Agora",
      successCreated: "Criado com sucesso!",
      successUpdated: "Atualizado com sucesso!",
      successDeleted: "Excluído com sucesso!",
      successSaved: "Salvo com sucesso!",
      errorOccurred: "Ocorreu um erro. Tente novamente.",
      confirmAction: "Confirmar ação",
      areYouSure: "Tem certeza?",
      cannotUndo: "Esta ação não pode ser desfeita",
      fillRequired: "Preencha todos os campos obrigatórios",
      invalidData: "Dados inválidos. Verifique e tente novamente.",
      locationNotAvailable: "Não foi possível obter sua localização",
      grantPermission: "Conceda permissão de localização ao navegador",
      tryAgain: "Tente novamente",
      processing: "Processando...",
      pleaseWait: "Por favor, aguarde...",
      redirecting: "Redirecionando...",
      sendingRequest: "Enviando solicitação...",
      requestSent: "Solicitação enviada com sucesso!",
      emailNotification: "Você receberá um email quando for processada"
    },

    forms: {
      fillAllRequired: "Preencha todos os campos obrigatórios",
      invalidEmail: "Email inválido",
      invalidPhone: "Telefone inválido",
      passwordTooShort: "Senha muito curta (mínimo 6 caracteres)",
      passwordsDontMatch: "As senhas não conferem",
      uploadSuccess: "Upload realizado com sucesso!",
      uploadError: "Erro no upload. Tente novamente.",
      saveChanges: "Salvar Alterações",
      discardChanges: "Descartar Alterações",
      unsavedChanges: "Você tem alterações não salvas",
      confirmDiscard: "Deseja realmente descartar as alterações?",
      fileTooBig: "Arquivo muito grande",
      invalidFormat: "Formato de arquivo inválido",
      maxSize: "Tamanho máximo",
      allowedFormats: "Formatos permitidos",
      required: "*",
      optionalField: "(Opcional)"
    },

    notifications: {
      title: "Notificações",
      noNotifications: "Nenhuma notificação",
      markAsRead: "Marcar como lida",
      markAllAsRead: "Marcar todas como lidas",
      deleteAll: "Excluir todas",
      newQuestion: "Nova pergunta no seu anúncio",
      questionAnswered: "Sua pergunta foi respondida",
      availabilityCheck: "Verifique a disponibilidade",
      newLike: "Alguém curtiu seu anúncio",
      newComment: "Novo comentário no seu anúncio",
      newReply: "Nova resposta ao seu comentário",
      adApproved: "Seu anúncio foi aprovado",
      adRejected: "Seu anúncio foi rejeitado",
      planActivated: "Seu plano foi ativado",
      pointsEarned: "Você ganhou pontos!",
      unread: "Não lidas",
      all: "Todas",
      today: "Hoje",
      yesterday: "Ontem",
      thisWeek: "Esta Semana",
      older: "Mais Antigas"
    },

    cart: {
      title: "Carrinho de Compras",
      empty: "Seu carrinho está vazio",
      emptyDesc: "Adicione produtos ou serviços para começar",
      startShopping: "Começar a Comprar",
      items: "{{count}} itens",
      item: "{{count}} item",
      total: "Total",
      subtotal: "Subtotal",
      remove: "Remover",
      clear: "Limpar Carrinho",
      confirmClear: "Tem certeza que deseja limpar todo o carrinho?",
      proceed: "Finalizar Compra",
      continueShoppingButton: "Continuar Comprando",
      itemAdded: "Item adicionado!",
      itemRemoved: "Item removido",
      quantity: "Quantidade",
      unitPrice: "Preço Unitário",
      contactSeller: "Contatar Vendedor",
      contactViaWhatsApp: "Contato via WhatsApp",
      checkoutMessage: "Gostaria de finalizar a compra destes itens"
    },

    contact: {
      title: "Fale Conosco",
      subtitle: "Estamos aqui para ajudar",
      getInTouch: "Entre em contato conosco ou converse com nosso assistente virtual",
      clubeBelezaInfo: "💬 Informações sobre Planos do Clube da Beleza",
      contactInfo: "Informações de Contato",
      salesCenter: "📞 Central de Vendas",
      technicalSupport: "📞 Suporte Técnico",
      businessPartnerships: "🤝 Business & Partnerships",
      phoneWhatsApp: "Telefone / WhatsApp",
      salesAndPlans: "Vendas e Planos",
      sponsorshipsAndAdvertisers: "Patrocínios e Anunciantes",
      schedule: "Seg-Sex: 9h às 18h | Sáb: 9h às 13h",
      scheduleWeekdays: "Seg-Sex: 9h às 18h",
      email: "Email",
      location: "Localização",
      virtualAssistant: "Assistente Virtual",
      askAI: "Tire suas dúvidas instantaneamente com nossa IA",
      openChat: "Abrir Chat IA",
      closeChat: "Fechar Chat",
      sendMessage: "Enviar uma Mensagem",
      fullName: "Nome Completo",
      yourEmail: "Email",
      phone: "Telefone",
      subject: "Assunto",
      message: "Mensagem",
      yourMessage: "Escreva sua mensagem aqui...",
      sendButton: "Enviar Mensagem",
      sending: "Enviando...",
      messageSent: "Mensagem enviada com sucesso!",
      contactSoon: "Entraremos em contato em breve",
      faq: "Perguntas Frequentes",
      faqQ1: "Como faço para anunciar?",
      faqA1: "Basta criar uma conta, escolher seu plano e preencher as informações do seu anúncio",
      faqQ2: "Quais são os planos disponíveis?",
      faqA2: "Oferecemos 3 planos: Light (grátis), Gold e VIP",
      faqQ3: "Como funciona o programa de pontos?",
      faqA3: "Você acumula pontos ao consumir serviços e pode trocá-los por prêmios",
      faqQ4: "Posso alterar meu plano depois?",
      faqA4: "Sim! Você pode fazer upgrade ou downgrade a qualquer momento",
      aiResponse: "Resposta:",
      examplesTitle: "💡 Exemplos de perguntas",
      askYourQuestion: "Digite sua pergunta..."
    },

    about: {
      title: "Sobre Nós",
      subtitle: "Conheça o Clube da Beleza",
      heroTitle: "E se você pudesse viver o melhor que a sua beleza pode proporcionar?",
      heroSubtitle: "Somos o clube de benefícios mais completo do Brasil para quem ama cuidar da sua estética e bem-estar",
      viewClubePlans: "Ver Planos Clube+",
      hideClubePlans: "Ocultar Planos Clube+",
      visitClubeClub: "Visitar Clube+",
      visitBeautyClub: "Visitar Clube da Beleza",
      chooseYourPlan: "Escolha Seu Plano do Clube da Beleza",
      exclusiveBenefits: "Benefícios exclusivos para você cuidar da sua beleza com economia",
      getCurrentPlan: "Adquirir Plano",
      plan: "Plano",
      welcomeTitle: "Olá! Seja Bem-vindo(a)",
      welcomeDesc: "Um clube que oferece benefícios para os associados que consomem serviços e produtos para sua estética e bem-estar",
      alsoGoodForWallet: "Além de fazer bem, também faz bem no seu bolso!",
      benefitsClub: "Clube de Benefícios",
      benefitsDesc: "Descontos exclusivos, programa de fidelidade que converte seus gastos em pontos e prêmios",
      locatorApp: "Aplicativo Localizador",
      locatorDesc: "O primeiro app do mundo exclusivo para TODO o ramo da estética! Mais de 64 categorias",
      onlineScheduling: "Agendamento Online",
      schedulingDesc: "Serviço de teleatendimento para agendar, tirar dúvidas e até teleconsulta",
      whatWeOffer: "O Que Oferecemos",
      offersList1: "Fazer parte do mais completo clube privativo de beleza e estética",
      offersList2: "Ter descontos e benefícios exclusivos em toda rede parceira",
      offersList3: "Ter acesso direto aos melhores especialistas em mais de 64 categorias",
      offersList4: "Agendamento online para seu conforto",
      offersList5: "Serviço de atendimento e informações",
      offersList6: "Programas de tratamento exclusivos para membros Clube+",
      offersList7: "Eventos e tratamentos exclusivos para sócios",
      offersList8: "Acumular pontos e resgatar prêmios incríveis",
      offersList9: "Estar apoiando eventos sociais e solidários",
      offersList10: "Poder realizar tratamentos com segurança e eficácia",
      ourMission: "Nossa Missão",
      missionText: "Conectar pessoas aos melhores profissionais de estética do Brasil, oferecendo uma plataforma completa",
      ourValues: "Nossos Valores",
      valuesText: "Qualidade, compromisso, inovação e cuidado. Acreditamos que todo mundo merece ter acesso aos melhores serviços",
      inNumbers: "Clube da Beleza em Números",
      categoriesOfServices: "Categorias de Serviços",
      partnerProfessionals: "Profissionais Parceiros",
      satisfactionGuaranteed: "Satisfação Garantida",
      supportAvailable: "Suporte Disponível",
      ourEcosystem: "Nosso Ecossistema",
      ourProducts: "💼 Nossos Produtos",
      completeSolutions: "Soluções completas para profissionais e clientes",
      forClients: "Para Clientes",
      forProfessionals: "Para Profissionais",
      forAll: "Para Todos",
      exclusiveBenefits: "Clube de benefícios exclusivo com descontos",
      completeManagement: "Sistema completo de gestão para clínicas e consultórios",
      intelligentAssistant: "Assistente inteligente com IA para dúvidas sobre tratamentos",
      aiConsultations: "Consultas com Inteligência Artificial",
      scientificInfo: "Informações científicas atualizadas",
      personalizedRecommendations: "Recomendações personalizadas",
      freeAnd247: "Gratuito e disponível 24/7",
      laserManagement: "Gestão profissional de tratamentos a laser",
      autoCalculation: "Cálculo automático de parâmetros laser",
      sessionTracking: "Registro completo de sessões",
      resultsMonitoring: "Acompanhamento de resultados",
      scientificDatabase: "Base de dados científica atualizada",
      digitalRecords: "Prontuário digital inteligente e completo para podólogos",
      secureRecords: "Prontuário digital completo e seguro",
      photoRegistry: "Registro fotográfico de tratamentos",
      patientHistory: "Histórico completo de pacientes",
      appointmentManagement: "Gestão de agendamentos e retornos",
      premiumPlatform: "Plataforma premium para profissionais de excelência",
      completeClinicManagement: "Gestão completa de agenda e clientes",
      financialControl: "Controle financeiro profissional",
      intelligentMarketing: "Marketing e relacionamento inteligente",
      detailedReports: "Relatórios e análises detalhadas",
      completeSolutionsSystem: "🚀 Ecossistema Completo de Soluções",
      ecosystemDesc: "Desenvolvemos produtos especializados para atender todas as necessidades do mercado",
      readyToTransform: "Pronto para Transformar Sua Experiência com Beleza?",
      joinThousands: "Junte-se a milhares de pessoas que já fazem parte",
      viewProfessionals: "Ver Profissionais"
    },

    notifications: {
      title: "Notificações",
      noNotifications: "Nenhuma notificação",
      markAsRead: "Marcar como lida",
      markAllAsRead: "Marcar todas como lidas",
      deleteAll: "Excluir todas",
      unreadCount: "{{count}} não lidas",
      all: "Todas",
      unread: "Não lidas",
      today: "Hoje",
      yesterday: "Ontem",
      thisWeek: "Esta Semana",
      older: "Mais Antigas",
      newQuestion: "Nova pergunta",
      questionAnswered: "Pergunta respondida",
      newComment: "Novo comentário",
      newLike: "Nova curtida",
      adApproved: "Anúncio aprovado",
      adRejected: "Anúncio rejeitado",
      planActivated: "Plano ativado",
      pointsEarned: "Pontos ganhos"
    }
  });

  // Carregar traduções
  const loadTranslations = async (lang) => {
    if (lang === 'pt-BR') {
      setTranslations(getPortugueseBase());
      setLoading(false);
      return;
    }

    setLoading(true);
    
    try {
      const cacheKey = `translations_${lang}_v3`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        setTranslations(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const basePt = getPortugueseBase();
      
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a professional translator. Translate ALL the following JSON strings from Portuguese to ${LANGUAGES[lang].name}.

CRITICAL RULES:
1. Keep the EXACT same JSON structure
2. Translate ONLY the string values
3. Do NOT translate JSON keys
4. Keep placeholders like {{count}}, {{name}}, {{distance}} exactly as they are
5. Maintain emojis and special characters
6. Be natural and fluent in the target language
7. For aesthetic/beauty terms, use the most common terms in that language

JSON to translate:
${JSON.stringify(basePt, null, 2)}

Return ONLY the translated JSON, no explanations.`,
        response_json_schema: {
          type: "object",
          properties: {
            nav: { type: "object" },
            common: { type: "object" },
            auth: { type: "object" },
            home: { type: "object" },
            map: { type: "object" },
            products: { type: "object" },
            plans: { type: "object" },
            blog: { type: "object" },
            ads: { type: "object" },
            profile: { type: "object" },
            chatbot: { type: "object" },
            footer: { type: "object" },
            alerts: { type: "object" },
            forms: { type: "object" },
            notifications: { type: "object" },
            cart: { type: "object" },
            contact: { type: "object" },
            about: { type: "object" }
          }
        }
      });

      localStorage.setItem(cacheKey, JSON.stringify(resultado));
      setTranslations(resultado);
      
    } catch (error) {
      console.error('Translation error:', error);
      setTranslations(getPortugueseBase());
    } finally {
      setLoading(false);
    }
  };

  const t = (key, params = {}) => {
    if (!translations) return key;
    
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value === 'string') {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return key;
  };

  const changeLanguage = async (newLang) => {
    if (!LANGUAGES[newLang]) return;
    
    setLanguage(newLang);
    localStorage.setItem('mapadaestetica_language', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
    
    await loadTranslations(newLang);
  };

  return (
    <I18nContext.Provider value={{ t, language, changeLanguage, loading, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
};