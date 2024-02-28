import i18next from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from '../locales/en.json';
import vn from '../locales/vn.json';
import br from '../locales/br.json';
import jp from '../locales/jp.json';

export const languageResources = {
  en: {translation: en},
  jp: {translation: jp},
  vn: {translation: vn},
  br: {translation: br},
};

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: languageResources,
});

export default i18next;
