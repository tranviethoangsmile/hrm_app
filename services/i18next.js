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

// Dịch message NHƯNG chỉ khi message là key hợp lệ trong translations.
// Tránh i18next missingKey warning khi message là chuỗi lỗi thô (VD: "Request failed with status code 401").
export const translateMessage = message => {
  if (typeof message !== 'string' || message === '') return message;
  return i18n.exists(message) ? i18n.t(message) : message;
};

export default i18n;
