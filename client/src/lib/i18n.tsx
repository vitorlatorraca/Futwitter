import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'pt-BR' | 'en-US';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Traduções
const translations: Record<Language, Record<string, string>> = {
  'pt-BR': {
    // Navigation
    'nav.feed': 'Feed',
    'nav.myTeam': 'Meu Time',
    'nav.profile': 'Perfil',
    'nav.journalist': 'Painel Jornalista',
    'nav.logout': 'Sair',
    
    // Landing Page
    'landing.hero.title': 'Sua paixão pelo Brasileirão em uma só plataforma',
    'landing.hero.subtitle': 'Avalie jogadores, leia notícias exclusivas e conecte-se com milhares de torcedores apaixonados',
    'landing.cta.signup': 'Criar Conta Grátis',
    'landing.cta.login': 'Já tenho conta',
    'landing.stats.teams': '20 Times',
    'landing.stats.players': '500+ Jogadores',
    'landing.stats.fans': 'Milhares de Torcedores',
    'landing.features.title': 'Tudo que você precisa em um só lugar',
    'landing.features.rate.title': 'Avalie Jogadores',
    'landing.features.rate.description': 'Dê notas e comentários sobre o desempenho dos jogadores do seu time em cada partida',
    'landing.features.news.title': 'Notícias Exclusivas',
    'landing.features.news.description': 'Fique por dentro das últimas notícias, análises e bastidores do seu time favorito',
    'landing.features.connect.title': 'Conecte-se',
    'landing.features.connect.description': 'Interaja com outros torcedores, curta e comente notícias da sua torcida',
    'landing.footer.copyright': '© 2024 Brasileirão. Todos os direitos reservados.',
    'landing.footer.about': 'Sobre',
    'landing.footer.terms': 'Termos',
    'landing.footer.privacy': 'Privacidade',
    
    // Login Page
    'login.title': 'Bem-vindo de volta',
    'login.subtitle': 'Entre com sua conta para continuar',
    'login.email': 'Email',
    'login.password': 'Senha',
    'login.submit': 'Entrar',
    'login.submitting': 'Entrando...',
    'login.noAccount': 'Não tem uma conta?',
    'login.createAccount': 'Criar conta grátis',
    'login.error.fillFields': 'Preencha todos os campos',
    'login.error.invalid': 'Erro ao fazer login',
    'login.error.checkCredentials': 'Verifique suas credenciais e tente novamente',
    'login.success': 'Login realizado!',
    'login.welcome': 'Bem-vindo de volta',
    
    // Signup Page
    'signup.title': 'Criar Conta',
    'signup.subtitle': 'Junte-se à maior comunidade de torcedores do Brasileirão',
    'signup.name': 'Nome',
    'signup.email': 'Email',
    'signup.password': 'Senha',
    'signup.confirmPassword': 'Confirmar Senha',
    'signup.team': 'Selecione seu time',
    'signup.submit': 'Criar Conta',
    'signup.submitting': 'Criando conta...',
    'signup.hasAccount': 'Já tem uma conta?',
    'signup.login': 'Fazer login',
    'signup.error.fillFields': 'Preencha todos os campos',
    'signup.error.passwordMatch': 'As senhas não coincidem',
    'signup.error.create': 'Erro ao criar conta',
    'signup.success': 'Conta criada com sucesso!',
    'signup.welcome': 'Bem-vindo ao Brasileirão!',
    
    // Common
    'common.loading': 'Carregando...',
    'common.error': 'Erro',
    'common.success': 'Sucesso',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Excluir',
    'common.edit': 'Editar',
    'common.close': 'Fechar',
  },
  'en-US': {
    // Navigation
    'nav.feed': 'Feed',
    'nav.myTeam': 'My Team',
    'nav.profile': 'Profile',
    'nav.journalist': 'Journalist Panel',
    'nav.logout': 'Logout',
    
    // Landing Page
    'landing.hero.title': 'Your passion for Brasileirão in one platform',
    'landing.hero.subtitle': 'Rate players, read exclusive news and connect with thousands of passionate fans',
    'landing.cta.signup': 'Create Free Account',
    'landing.cta.login': 'I already have an account',
    'landing.stats.teams': '20 Teams',
    'landing.stats.players': '500+ Players',
    'landing.stats.fans': 'Thousands of Fans',
    'landing.features.title': 'Everything you need in one place',
    'landing.features.rate.title': 'Rate Players',
    'landing.features.rate.description': 'Give ratings and comments on your team players performance in each match',
    'landing.features.news.title': 'Exclusive News',
    'landing.features.news.description': 'Stay up to date with the latest news, analysis and behind the scenes of your favorite team',
    'landing.features.connect.title': 'Connect',
    'landing.features.connect.description': 'Interact with other fans, like and comment on news from your fanbase',
    'landing.footer.copyright': '© 2024 Brasileirão. All rights reserved.',
    'landing.footer.about': 'About',
    'landing.footer.terms': 'Terms',
    'landing.footer.privacy': 'Privacy',
    
    // Login Page
    'login.title': 'Welcome back',
    'login.subtitle': 'Sign in to your account to continue',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Sign In',
    'login.submitting': 'Signing in...',
    'login.noAccount': "Don't have an account?",
    'login.createAccount': 'Create free account',
    'login.error.fillFields': 'Please fill all fields',
    'login.error.invalid': 'Login error',
    'login.error.checkCredentials': 'Check your credentials and try again',
    'login.success': 'Login successful!',
    'login.welcome': 'Welcome back',
    
    // Signup Page
    'signup.title': 'Create Account',
    'signup.subtitle': 'Join the largest Brasileirão fan community',
    'signup.name': 'Name',
    'signup.email': 'Email',
    'signup.password': 'Password',
    'signup.confirmPassword': 'Confirm Password',
    'signup.team': 'Select your team',
    'signup.submit': 'Create Account',
    'signup.submitting': 'Creating account...',
    'signup.hasAccount': 'Already have an account?',
    'signup.login': 'Sign in',
    'signup.error.fillFields': 'Please fill all fields',
    'signup.error.passwordMatch': 'Passwords do not match',
    'signup.error.create': 'Error creating account',
    'signup.success': 'Account created successfully!',
    'signup.welcome': 'Welcome to Brasileirão!',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
  },
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Recupera o idioma salvo no localStorage ou usa pt-BR como padrão
    const saved = localStorage.getItem('language') as Language;
    return saved && (saved === 'pt-BR' || saved === 'en-US') ? saved : 'pt-BR';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

