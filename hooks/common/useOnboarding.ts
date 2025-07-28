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
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      
      // Para usuarios nuevos, onboardingCompleted será null, por lo que hasSeenOnboarding será false
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
      await AsyncStorage.setItem('onboarding_completed', 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('onboarding_completed');
      setHasSeenOnboarding(false);
    } catch (error) {
      console.error('Error al resetear el onboarding:', error);
    }
  };

  return {
    hasSeenOnboarding,
    isLoading,
    markAsSeen,
    resetOnboarding,
  };
}; 