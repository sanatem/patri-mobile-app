import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import es from '../locales/es.json';
import esCL from '../locales/es-CL.json';
import en from '../locales/en.json';

const LANGUAGE_KEY = 'language';

export const resources = {
  es: { translation: es },
  esCL: { translation: esCL },
  en: { translation: en },
};

export const initI18n = async () => {
  try {
    const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
    const locales = Localization.getLocales?.();
    const systemLang = locales?.length ? locales[0].languageCode : 'es';
    const initialLang: string = savedLang ?? systemLang ?? 'es';

    await i18n.use(initReactI18next).init({
      resources,
      lng: initialLang,
      fallbackLng: 'es',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  } catch (error) {
    console.error('Error initializing i18n:', error);
  }
};

export const i18nInitPromise = initI18n();

export const setAppLanguage = async (lang: 'es' | 'en' | 'esCL') => {
  try {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export default i18n;
