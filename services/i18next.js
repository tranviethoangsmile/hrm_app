import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

// Import all translation files
import en from '../locales/en.json';
import vi from '../locales/vi.json';
import ja from '../locales/ja.json';
import pt from '../locales/pt.json';

const resources = {
  en: {
    translation: en,
  },
  vi: {
    translation: vi,
  },
  ja: {
    translation: ja,
  },
  pt: {
    translation: pt,
  },
};

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources,

  interpolation: {
    escapeValue: false,
  },

  react: {
    useSuspense: false,
  },

  debug: __DEV__,
  load: 'languageOnly',
  cleanCode: true,
});

export default i18n;
