import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';

export default function StartProfile() {
  const { t } = useTranslation();
  
  const handleStart = () => {
    router.push('/investment/create-account/investment-survey/profile-question' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Text style={styles.thinkingEmoji}>🤔</Text>
      </View>
      
      <Text style={styles.title} className="font-medium">
        {t('startProfile.title')}
      </Text>
      
      <Text style={styles.subtitle} className="font-regular text-center">
        {t('startProfile.description')}
      </Text>
      
      <View style={styles.timeEstimate}>
        <Text style={styles.timeText} className="font-regular">
          {t('startProfile.timeEstimate')}
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          onPress={handleStart}
          title={t('common.start')}
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
  thinkingEmoji: {
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
    marginBottom: 20,
  },
  timeEstimate: {
    marginBottom: 40,
  },
  timeText: {
    fontSize: 14,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
});
