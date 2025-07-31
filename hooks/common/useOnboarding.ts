import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const useOnboarding = () => {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
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
      const hasSeen = onboardingCompleted === 'true';
      
      setHasSeenOnboarding(hasSeen);
    } catch (error) {
      console.error('useOnboarding - Error checking status:', error);
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
      console.error('useOnboarding - Error marking as seen:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('onboarding_completed');
      setHasSeenOnboarding(false);
    } catch (error) {
      console.error('useOnboarding - Error resetting onboarding:', error);
    }
  };

  const refreshOnboardingStatus = async () => {
    setIsLoading(true);
    await checkOnboardingStatus();
  };

  return {
    hasSeenOnboarding,
    isLoading,
    markAsSeen,
    resetOnboarding,
    refreshOnboardingStatus,
  };
}; 