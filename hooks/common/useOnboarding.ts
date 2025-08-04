import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const useOnboarding = () => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      if (Platform.OS !== 'web') {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
      
      if (onboardingCompleted === null) {
        setHasCompletedOnboarding(false);
      } else {
        const hasCompleted = onboardingCompleted === 'true';
        setHasCompletedOnboarding(hasCompleted);
      }
    } catch (error) {
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsCompleted = async () => {
    try {
      await AsyncStorage.setItem('onboarding_completed', 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('onboarding_completed');
      setHasCompletedOnboarding(false);
    } catch (error) {
    }
  };

  const refreshOnboardingStatus = async () => {
    setIsLoading(true);
    await checkOnboardingStatus();
  };

  return {
    hasSeenOnboarding: hasCompletedOnboarding,
    hasCompletedOnboarding,
    isLoading,
    markAsSeen: markAsCompleted,
    markAsCompleted,
    resetOnboarding,
    refreshOnboardingStatus,
  };
}; 