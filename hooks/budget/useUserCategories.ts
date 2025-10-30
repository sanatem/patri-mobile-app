import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_CATEGORIES_KEY = '@patrimore:user_categories';
const ONBOARDING_COMPLETED_KEY = '@patrimore:categories_onboarding_completed';

export interface UserCategoriesState {
  income: string[];
  expenses: string[];
}

export function useUserCategories() {
  const [userCategories, setUserCategories] = useState<UserCategoriesState>({
    income: [],
    expenses: []
  });
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserCategories();
  }, []);

  const loadUserCategories = async () => {
    try {
      const [categoriesData, onboardingData] = await Promise.all([
        AsyncStorage.getItem(USER_CATEGORIES_KEY),
        AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY)
      ]);

      if (categoriesData) {
        setUserCategories(JSON.parse(categoriesData));
      }

      if (onboardingData) {
        setOnboardingCompleted(JSON.parse(onboardingData));
      }
    } catch (error) {
      console.error('Error loading user categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUserCategories = async (categories: UserCategoriesState) => {
    try {
      await AsyncStorage.setItem(USER_CATEGORIES_KEY, JSON.stringify(categories));
      setUserCategories(categories);
    } catch (error) {
      console.error('Error saving user categories:', error);
      throw error;
    }
  };

  const completeOnboarding = async (categories: UserCategoriesState) => {
    try {
      await Promise.all([
        AsyncStorage.setItem(USER_CATEGORIES_KEY, JSON.stringify(categories)),
        AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, JSON.stringify(true))
      ]);
      setUserCategories(categories);
      setOnboardingCompleted(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.multiRemove([USER_CATEGORIES_KEY, ONBOARDING_COMPLETED_KEY]);
      setUserCategories({ income: [], expenses: [] });
      setOnboardingCompleted(false);
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      throw error;
    }
  };

  return {
    userCategories,
    onboardingCompleted,
    loading,
    saveUserCategories,
    completeOnboarding,
    resetOnboarding
  };
}
