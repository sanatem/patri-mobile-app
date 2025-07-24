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
      setHasSeenOnboarding(seen === 'true');
    } catch (error) {
      console.log('Error checking onboarding status:', error);
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
      console.log('Error marking onboarding as seen:', error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem('has_seen_onboarding');
      setHasSeenOnboarding(false);
    } catch (error) {
      console.log('Error resetting onboarding:', error);
    }
  };

  return {
    hasSeenOnboarding,
    isLoading,
    markAsSeen,
    resetOnboarding,
  };
}; 