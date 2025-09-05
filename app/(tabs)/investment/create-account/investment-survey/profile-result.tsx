import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';

export default function ProfileResult() {
  const { t } = useTranslation();
  
  const handleContinue = () => {
    router.push('/investment/create-account/identity-step/identity-upload' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.detectiveEmoji}>🕵️‍♀️</Text>
      </View>
      
      <Text style={styles.title} className="font-medium">
        {t('profileResult.title')}
      </Text>
      
      <Text style={styles.subtitle} className="font-regular text-center">
        {`${t('profileResult.description1')} ${t('profileResult.description2')}`}
      </Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          onPress={handleContinue}
          title={t('common.understoodAndContinue')}
          className="w-full"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
    backgroundColor: Colors.light.background,
  },
  iconContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 100,
  },
  detectiveEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    color: Colors.primary[700],
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.primary[500],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
});
