import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from "@/api/base44Client";

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

const I18nContext = createContext();

export const useTranslation = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return context;
};

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
    drBeleza: "Dr. Beleza"
  },
  common: {
    welcome: "Bem-vindo",
    login: "Entrar",
    logout: "Sair",
    loading: "Carregando...",
    save: "Salvar",
    cancel: "Cancelar",
    delete: "Excluir",
    edit: "Editar",
    search: "Buscar",
    close: "Fechar",
    yes: "Sim",
    no: "Não"
  }
});

export const I18nProvider = ({ children }) => {
  const [language, setLanguage] = useState('pt-BR');
  const [translations, setTranslations] = useState(getPortugueseBase());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const saved = localStorage.getItem('mapadaestetica_language');
      const lang = (saved && LANGUAGES[saved]) ? saved : 'pt-BR';
      setLanguage(lang);
      await loadTranslations(lang);
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    };
    init();
  }, []);

  const loadTranslations = async (lang) => {
    if (lang === 'pt-BR') {
      setTranslations(getPortugueseBase());
      return;
    }

    setLoading(true);
    try {
      const cacheKey = `tr_${lang}_v1`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTranslations(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate this JSON from Portuguese to ${LANGUAGES[lang].name}. Keep structure, keys, emojis, and {{placeholders}} unchanged:\n${JSON.stringify(getPortugueseBase(), null, 2)}`,
        response_json_schema: { type: "object", properties: { nav: { type: "object" }, common: { type: "object" } } }
      });

      localStorage.setItem(cacheKey, JSON.stringify(result));
      setTranslations(result);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslations(getPortugueseBase());
    } finally {
      setLoading(false);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    for (const k of keys) {
      value = value?.[k];
      if (!value) return key;
    }
    return value || key;
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