import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from '../locales/en.json';
import vi from '../locales/vi.json';
import pt from '../locales/pt.json';
import ja from '../locales/ja.json';

export const languageResources = {
  en: {translation: en},
  ja: {translation: ja},
  vi: {translation: vi},
  pt: {translation: pt},
};

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: languageResources,
});

export default i18next;
