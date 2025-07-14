export const locales = ['en', 'zh', 'ja'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

export const languages = {
  en: 'English',
  zh: '中文',
  ja: '日本語'
};

export const languageFlags = {
  en: '🇺🇸',
  zh: '🇨🇳', 
  ja: '🇯🇵'
};