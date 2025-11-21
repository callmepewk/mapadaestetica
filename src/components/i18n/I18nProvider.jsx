import React, { createContext, useContext, useState, useEffect } from 'react';

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

// Traduções em português (base)
const translations_pt_BR = {
  common: {
    welcome: "Bem-vindo",
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
    no: "Não"
  },
  navigation: {
    home: "Início",
    map: "Mapa",
    products: "Produtos",
    plans: "Planos",
    blog: "Blog",
    about: "Sobre Nós",
    contact: "Fale Conosco",
    profile: "Meu Perfil",
    myPlan: "Meu Plano"
  },
  auth: {
    createFreeAccount: "Criar Conta Grátis",
    alreadyHaveAccount: "Já tem uma conta?",
    dontHaveAccount: "Não tem uma conta?",
    forgotPassword: "Esqueceu a senha?",
    resetPassword: "Redefinir Senha",
    email: "Email",
    password: "Senha",
    confirmPassword: "Confirmar Senha",
    fullName: "Nome Completo"
  },
  footer: {
    quickLinks: "Links Rápidos",
    contacts: "Contatos",
    institutional: "Institucional",
    salesCenter: "Central de Vendas",
    technicalSupport: "Suporte Técnico",
    businessPartnerships: "Business & Partnerships",
    allRightsReserved: "Todos os direitos reservados"
  }
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
  const [translations, setTranslations] = useState(translations_pt_BR);
  const [loading, setLoading] = useState(false);

  // Detectar idioma do navegador
  useEffect(() => {
    const savedLanguage = localStorage.getItem('mapadaestetica_language');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      setLanguage(savedLanguage);
      loadTranslations(savedLanguage);
    } else {
      // Detectar idioma do navegador
      const browserLang = navigator.language || navigator.userLanguage;
      const detectedLang = Object.keys(LANGUAGES).find(lang => 
        browserLang.startsWith(lang) || browserLang.startsWith(lang.split('-')[0])
      );
      const finalLang = detectedLang || 'pt-BR';
      setLanguage(finalLang);
      if (finalLang !== 'pt-BR') {
        loadTranslations(finalLang);
      }
    }
  }, []);

  // Carregar ou gerar traduções
  const loadTranslations = async (targetLanguage) => {
    if (targetLanguage === 'pt-BR') {
      setTranslations(translations_pt_BR);
      return;
    }

    setLoading(true);
    try {
      // Tentar carregar do localStorage primeiro
      const cachedTranslations = localStorage.getItem(`translations_${targetLanguage}`);
      if (cachedTranslations) {
        setTranslations(JSON.parse(cachedTranslations));
        setLoading(false);
        return;
      }

      // Se não houver cache, usar traduções hardcoded ou gerar via IA
      const hardcodedTranslations = getHardcodedTranslations(targetLanguage);
      if (hardcodedTranslations) {
        setTranslations(hardcodedTranslations);
        localStorage.setItem(`translations_${targetLanguage}`, JSON.stringify(hardcodedTranslations));
      } else {
        // Fallback para português
        setTranslations(translations_pt_BR);
      }
    } catch (error) {
      console.error('Erro ao carregar traduções:', error);
      setTranslations(translations_pt_BR);
    } finally {
      setLoading(false);
    }
  };

  // Traduções hardcoded para todos os idiomas
  const getHardcodedTranslations = (lang) => {
    const translations = {
      'pt-PT': {
        common: {
          welcome: "Bem-vindo",
          login: "Entrar",
          logout: "Sair",
          signup: "Criar Conta",
          save: "Guardar",
          cancel: "Cancelar",
          delete: "Eliminar",
          edit: "Editar",
          search: "Pesquisar",
          filter: "Filtrar",
          loading: "A carregar...",
          error: "Erro",
          success: "Sucesso",
          back: "Voltar",
          next: "Próximo",
          previous: "Anterior",
          close: "Fechar",
          confirm: "Confirmar",
          yes: "Sim",
          no: "Não"
        },
        navigation: {
          home: "Início",
          map: "Mapa",
          products: "Produtos",
          plans: "Planos",
          blog: "Blog",
          about: "Sobre Nós",
          contact: "Fale Connosco",
          profile: "Meu Perfil",
          myPlan: "Meu Plano"
        },
        auth: {
          createFreeAccount: "Criar Conta Grátis",
          alreadyHaveAccount: "Já tem uma conta?",
          dontHaveAccount: "Não tem uma conta?",
          forgotPassword: "Esqueceu a palavra-passe?",
          resetPassword: "Redefinir Palavra-passe",
          email: "Email",
          password: "Palavra-passe",
          confirmPassword: "Confirmar Palavra-passe",
          fullName: "Nome Completo"
        },
        footer: {
          quickLinks: "Links Rápidos",
          contacts: "Contactos",
          institutional: "Institucional",
          salesCenter: "Central de Vendas",
          technicalSupport: "Suporte Técnico",
          businessPartnerships: "Business & Parcerias",
          allRightsReserved: "Todos os direitos reservados"
        }
      },
      'en': {
        common: {
          welcome: "Welcome",
          login: "Login",
          logout: "Logout",
          signup: "Sign Up",
          save: "Save",
          cancel: "Cancel",
          delete: "Delete",
          edit: "Edit",
          search: "Search",
          filter: "Filter",
          loading: "Loading...",
          error: "Error",
          success: "Success",
          back: "Back",
          next: "Next",
          previous: "Previous",
          close: "Close",
          confirm: "Confirm",
          yes: "Yes",
          no: "No"
        },
        navigation: {
          home: "Home",
          map: "Map",
          products: "Products",
          plans: "Plans",
          blog: "Blog",
          about: "About Us",
          contact: "Contact Us",
          profile: "My Profile",
          myPlan: "My Plan"
        },
        auth: {
          createFreeAccount: "Create Free Account",
          alreadyHaveAccount: "Already have an account?",
          dontHaveAccount: "Don't have an account?",
          forgotPassword: "Forgot password?",
          resetPassword: "Reset Password",
          email: "Email",
          password: "Password",
          confirmPassword: "Confirm Password",
          fullName: "Full Name"
        },
        footer: {
          quickLinks: "Quick Links",
          contacts: "Contacts",
          institutional: "Institutional",
          salesCenter: "Sales Center",
          technicalSupport: "Technical Support",
          businessPartnerships: "Business & Partnerships",
          allRightsReserved: "All rights reserved"
        }
      },
      'es': {
        common: {
          welcome: "Bienvenido",
          login: "Iniciar Sesión",
          logout: "Cerrar Sesión",
          signup: "Crear Cuenta",
          save: "Guardar",
          cancel: "Cancelar",
          delete: "Eliminar",
          edit: "Editar",
          search: "Buscar",
          filter: "Filtrar",
          loading: "Cargando...",
          error: "Error",
          success: "Éxito",
          back: "Volver",
          next: "Siguiente",
          previous: "Anterior",
          close: "Cerrar",
          confirm: "Confirmar",
          yes: "Sí",
          no: "No"
        },
        navigation: {
          home: "Inicio",
          map: "Mapa",
          products: "Productos",
          plans: "Planes",
          blog: "Blog",
          about: "Sobre Nosotros",
          contact: "Contáctanos",
          profile: "Mi Perfil",
          myPlan: "Mi Plan"
        },
        auth: {
          createFreeAccount: "Crear Cuenta Gratis",
          alreadyHaveAccount: "¿Ya tienes una cuenta?",
          dontHaveAccount: "¿No tienes una cuenta?",
          forgotPassword: "¿Olvidaste tu contraseña?",
          resetPassword: "Restablecer Contraseña",
          email: "Correo Electrónico",
          password: "Contraseña",
          confirmPassword: "Confirmar Contraseña",
          fullName: "Nombre Completo"
        },
        footer: {
          quickLinks: "Enlaces Rápidos",
          contacts: "Contactos",
          institutional: "Institucional",
          salesCenter: "Centro de Ventas",
          technicalSupport: "Soporte Técnico",
          businessPartnerships: "Negocios y Asociaciones",
          allRightsReserved: "Todos los derechos reservados"
        }
      },
      'fr': {
        common: {
          welcome: "Bienvenue",
          login: "Connexion",
          logout: "Déconnexion",
          signup: "Créer un Compte",
          save: "Enregistrer",
          cancel: "Annuler",
          delete: "Supprimer",
          edit: "Modifier",
          search: "Rechercher",
          filter: "Filtrer",
          loading: "Chargement...",
          error: "Erreur",
          success: "Succès",
          back: "Retour",
          next: "Suivant",
          previous: "Précédent",
          close: "Fermer",
          confirm: "Confirmer",
          yes: "Oui",
          no: "Non"
        },
        navigation: {
          home: "Accueil",
          map: "Carte",
          products: "Produits",
          plans: "Plans",
          blog: "Blog",
          about: "À Propos",
          contact: "Contactez-nous",
          profile: "Mon Profil",
          myPlan: "Mon Plan"
        },
        auth: {
          createFreeAccount: "Créer un Compte Gratuit",
          alreadyHaveAccount: "Vous avez déjà un compte?",
          dontHaveAccount: "Vous n'avez pas de compte?",
          forgotPassword: "Mot de passe oublié?",
          resetPassword: "Réinitialiser le Mot de Passe",
          email: "Email",
          password: "Mot de Passe",
          confirmPassword: "Confirmer le Mot de Passe",
          fullName: "Nom Complet"
        },
        footer: {
          quickLinks: "Liens Rapides",
          contacts: "Contacts",
          institutional: "Institutionnel",
          salesCenter: "Centre de Ventes",
          technicalSupport: "Support Technique",
          businessPartnerships: "Affaires et Partenariats",
          allRightsReserved: "Tous droits réservés"
        }
      },
      'de': {
        common: {
          welcome: "Willkommen",
          login: "Anmelden",
          logout: "Abmelden",
          signup: "Konto Erstellen",
          save: "Speichern",
          cancel: "Abbrechen",
          delete: "Löschen",
          edit: "Bearbeiten",
          search: "Suchen",
          filter: "Filtern",
          loading: "Laden...",
          error: "Fehler",
          success: "Erfolg",
          back: "Zurück",
          next: "Weiter",
          previous: "Zurück",
          close: "Schließen",
          confirm: "Bestätigen",
          yes: "Ja",
          no: "Nein"
        },
        navigation: {
          home: "Startseite",
          map: "Karte",
          products: "Produkte",
          plans: "Pläne",
          blog: "Blog",
          about: "Über Uns",
          contact: "Kontakt",
          profile: "Mein Profil",
          myPlan: "Mein Plan"
        },
        auth: {
          createFreeAccount: "Kostenloses Konto Erstellen",
          alreadyHaveAccount: "Haben Sie bereits ein Konto?",
          dontHaveAccount: "Haben Sie kein Konto?",
          forgotPassword: "Passwort vergessen?",
          resetPassword: "Passwort Zurücksetzen",
          email: "E-Mail",
          password: "Passwort",
          confirmPassword: "Passwort Bestätigen",
          fullName: "Vollständiger Name"
        },
        footer: {
          quickLinks: "Schnelllinks",
          contacts: "Kontakte",
          institutional: "Institutionell",
          salesCenter: "Vertriebszentrum",
          technicalSupport: "Technischer Support",
          businessPartnerships: "Geschäft und Partnerschaften",
          allRightsReserved: "Alle Rechte vorbehalten"
        }
      },
      'it': {
        common: {
          welcome: "Benvenuto",
          login: "Accedi",
          logout: "Esci",
          signup: "Crea Account",
          save: "Salva",
          cancel: "Annulla",
          delete: "Elimina",
          edit: "Modifica",
          search: "Cerca",
          filter: "Filtra",
          loading: "Caricamento...",
          error: "Errore",
          success: "Successo",
          back: "Indietro",
          next: "Avanti",
          previous: "Precedente",
          close: "Chiudi",
          confirm: "Conferma",
          yes: "Sì",
          no: "No"
        },
        navigation: {
          home: "Home",
          map: "Mappa",
          products: "Prodotti",
          plans: "Piani",
          blog: "Blog",
          about: "Chi Siamo",
          contact: "Contattaci",
          profile: "Il Mio Profilo",
          myPlan: "Il Mio Piano"
        },
        auth: {
          createFreeAccount: "Crea Account Gratuito",
          alreadyHaveAccount: "Hai già un account?",
          dontHaveAccount: "Non hai un account?",
          forgotPassword: "Hai dimenticato la password?",
          resetPassword: "Reimposta Password",
          email: "Email",
          password: "Password",
          confirmPassword: "Conferma Password",
          fullName: "Nome Completo"
        },
        footer: {
          quickLinks: "Link Rapidi",
          contacts: "Contatti",
          institutional: "Istituzionale",
          salesCenter: "Centro Vendite",
          technicalSupport: "Supporto Tecnico",
          businessPartnerships: "Business e Partnership",
          allRightsReserved: "Tutti i diritti riservati"
        }
      },
      'ja': {
        common: {
          welcome: "ようこそ",
          login: "ログイン",
          logout: "ログアウト",
          signup: "アカウント作成",
          save: "保存",
          cancel: "キャンセル",
          delete: "削除",
          edit: "編集",
          search: "検索",
          filter: "フィルター",
          loading: "読み込み中...",
          error: "エラー",
          success: "成功",
          back: "戻る",
          next: "次へ",
          previous: "前へ",
          close: "閉じる",
          confirm: "確認",
          yes: "はい",
          no: "いいえ"
        },
        navigation: {
          home: "ホーム",
          map: "マップ",
          products: "製品",
          plans: "プラン",
          blog: "ブログ",
          about: "私たちについて",
          contact: "お問い合わせ",
          profile: "マイプロフィール",
          myPlan: "マイプラン"
        },
        auth: {
          createFreeAccount: "無料アカウント作成",
          alreadyHaveAccount: "すでにアカウントをお持ちですか？",
          dontHaveAccount: "アカウントをお持ちでないですか？",
          forgotPassword: "パスワードを忘れましたか？",
          resetPassword: "パスワードをリセット",
          email: "メール",
          password: "パスワード",
          confirmPassword: "パスワードを確認",
          fullName: "フルネーム"
        },
        footer: {
          quickLinks: "クイックリンク",
          contacts: "連絡先",
          institutional: "機関",
          salesCenter: "販売センター",
          technicalSupport: "テクニカルサポート",
          businessPartnerships: "ビジネスとパートナーシップ",
          allRightsReserved: "全著作権所有"
        }
      },
      'zh': {
        common: {
          welcome: "欢迎",
          login: "登录",
          logout: "登出",
          signup: "创建账户",
          save: "保存",
          cancel: "取消",
          delete: "删除",
          edit: "编辑",
          search: "搜索",
          filter: "筛选",
          loading: "加载中...",
          error: "错误",
          success: "成功",
          back: "返回",
          next: "下一步",
          previous: "上一步",
          close: "关闭",
          confirm: "确认",
          yes: "是",
          no: "否"
        },
        navigation: {
          home: "首页",
          map: "地图",
          products: "产品",
          plans: "计划",
          blog: "博客",
          about: "关于我们",
          contact: "联系我们",
          profile: "我的资料",
          myPlan: "我的计划"
        },
        auth: {
          createFreeAccount: "创建免费账户",
          alreadyHaveAccount: "已有账户？",
          dontHaveAccount: "没有账户？",
          forgotPassword: "忘记密码？",
          resetPassword: "重置密码",
          email: "电子邮件",
          password: "密码",
          confirmPassword: "确认密码",
          fullName: "全名"
        },
        footer: {
          quickLinks: "快速链接",
          contacts: "联系方式",
          institutional: "机构",
          salesCenter: "销售中心",
          technicalSupport: "技术支持",
          businessPartnerships: "商业合作",
          allRightsReserved: "保留所有权利"
        }
      },
      'ru': {
        common: {
          welcome: "Добро пожаловать",
          login: "Войти",
          logout: "Выйти",
          signup: "Создать Аккаунт",
          save: "Сохранить",
          cancel: "Отмена",
          delete: "Удалить",
          edit: "Редактировать",
          search: "Поиск",
          filter: "Фильтр",
          loading: "Загрузка...",
          error: "Ошибка",
          success: "Успех",
          back: "Назад",
          next: "Далее",
          previous: "Назад",
          close: "Закрыть",
          confirm: "Подтвердить",
          yes: "Да",
          no: "Нет"
        },
        navigation: {
          home: "Главная",
          map: "Карта",
          products: "Продукты",
          plans: "Планы",
          blog: "Блог",
          about: "О Нас",
          contact: "Связаться с Нами",
          profile: "Мой Профиль",
          myPlan: "Мой План"
        },
        auth: {
          createFreeAccount: "Создать Бесплатный Аккаунт",
          alreadyHaveAccount: "Уже есть аккаунт?",
          dontHaveAccount: "Нет аккаунта?",
          forgotPassword: "Забыли пароль?",
          resetPassword: "Сбросить Пароль",
          email: "Электронная Почта",
          password: "Пароль",
          confirmPassword: "Подтвердить Пароль",
          fullName: "Полное Имя"
        },
        footer: {
          quickLinks: "Быстрые Ссылки",
          contacts: "Контакты",
          institutional: "Институциональный",
          salesCenter: "Центр Продаж",
          technicalSupport: "Техническая Поддержка",
          businessPartnerships: "Бизнес и Партнерство",
          allRightsReserved: "Все права защищены"
        }
      },
      'ar': {
        common: {
          welcome: "مرحبا",
          login: "تسجيل الدخول",
          logout: "تسجيل الخروج",
          signup: "إنشاء حساب",
          save: "حفظ",
          cancel: "إلغاء",
          delete: "حذف",
          edit: "تعديل",
          search: "بحث",
          filter: "تصفية",
          loading: "جاري التحميل...",
          error: "خطأ",
          success: "نجاح",
          back: "رجوع",
          next: "التالي",
          previous: "السابق",
          close: "إغلاق",
          confirm: "تأكيد",
          yes: "نعم",
          no: "لا"
        },
        navigation: {
          home: "الرئيسية",
          map: "الخريطة",
          products: "المنتجات",
          plans: "الخطط",
          blog: "المدونة",
          about: "من نحن",
          contact: "اتصل بنا",
          profile: "ملفي الشخصي",
          myPlan: "خطتي"
        },
        auth: {
          createFreeAccount: "إنشاء حساب مجاني",
          alreadyHaveAccount: "هل لديك حساب بالفعل؟",
          dontHaveAccount: "ليس لديك حساب؟",
          forgotPassword: "نسيت كلمة المرور؟",
          resetPassword: "إعادة تعيين كلمة المرور",
          email: "البريد الإلكتروني",
          password: "كلمة المرور",
          confirmPassword: "تأكيد كلمة المرور",
          fullName: "الاسم الكامل"
        },
        footer: {
          quickLinks: "روابط سريعة",
          contacts: "جهات الاتصال",
          institutional: "مؤسسي",
          salesCenter: "مركز المبيعات",
          technicalSupport: "الدعم الفني",
          businessPartnerships: "الأعمال والشراكات",
          allRightsReserved: "جميع الحقوق محفوظة"
        }
      }
    };

    return translations[lang] || null;
  };

  // Função de tradução
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Retorna a chave se não encontrar
      }
    }

    if (typeof value === 'string') {
      // Substituir parâmetros
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }

    return key;
  };

  // Mudar idioma
  const changeLanguage = (newLanguage) => {
    if (LANGUAGES[newLanguage]) {
      setLanguage(newLanguage);
      localStorage.setItem('mapadaestetica_language', newLanguage);
      loadTranslations(newLanguage);
      
      // Atualizar direção do texto para idiomas RTL
      if (newLanguage === 'ar') {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
      } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = newLanguage;
      }
    }
  };

  return (
    <I18nContext.Provider value={{ t, language, changeLanguage, loading, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
};