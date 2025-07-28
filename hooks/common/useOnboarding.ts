import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const seen = await AsyncStorage.getItem('has_seen_onboarding');
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      
      const hasSeen = onboardingCompleted === 'true';
      setHasSeenOnboarding(hasSeen);
    } catch (error) {
      setHasSeenOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsSeen = async () => {
    try {
      await AsyncStorage.setItem('has_seen_onboarding', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      // Manejar error si es necesario
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('has_seen_onboarding');
      setHasSeenOnboarding(false);
    } catch (error) {
      // Manejar error si es necesario
    }
  };

  return {
    hasSeenOnboarding,
    isLoading,
    markAsSeen,
    resetOnboarding,
  };
}; 