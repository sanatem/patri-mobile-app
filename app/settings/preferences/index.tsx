import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ArrowLeft, Languages } from 'lucide-react-native';

import { Select } from '@/components/ui/Select';
import { setAppLanguage, LANGUAGE_KEY } from '@/lib/i18n';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';

const getLanguageOptions = (t: any) => [
  { value: 'es',  label: t('languages.es')   },
  { value: 'esCL',label: t('languages.es-CL')},
  { value: 'en',  label: t('languages.en')   }
];

export default function PreferencesScreen() {
  const { t } = useTranslation();

  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState('es');
  const [loading, setLoading] = useState(true);
  const LANGUAGES = useMemo(() => getLanguageOptions(t), [t]);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
        const lang = savedLang || 'es';
        setSelectedLang(lang);
      } catch (error) {
        console.error('Error loading saved language:', error);
        setSelectedLang('es');
      } finally {
        setLoading(false);
      }
    };
    initializeLanguage();
  }, []);

  const handleLangChange = async (lang: string) => {
    setSelectedLang(lang);
    await AsyncStorage.setItem(LANGUAGE_KEY, lang);
    await setAppLanguage(lang as 'es' | 'en' | 'esCL');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('preferences.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ArrowLeft size={24} color="#1f2937" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t('preferences.title')}</Text>
          </View>
        </View>
        <Text style={styles.headerSubtitle}>{t('preferences.subtitle')}</Text>
      </View>

      <View style={{ height: 8 }} />

      <View style={styles.card}>
        <View style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.iconContainer}>
              <Languages size={22} color={Colors.primary[500]} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.menuTitle}>{t('preferences.language.title')}</Text>
              <Text style={styles.menuSubtitle}>{t('preferences.language.subtitle')}</Text>
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
          <Select
            label=""
            options={LANGUAGES}
            value={selectedLang}
            onSelect={handleLangChange}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: '#f8f9fa',
  },
  container: {
    flexGrow: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: 'white',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    marginLeft: -8,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    width: 360,
    maxWidth: '95%',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 24,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 40,
  },
});
