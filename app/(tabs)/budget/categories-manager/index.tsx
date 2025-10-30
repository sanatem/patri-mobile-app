import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { CategoriesManager } from '@/components/budget/CategoriesManager';
import { CategoriesOnboarding } from '@/components/budget/CategoriesManager/CategoriesOnboarding';
import { useUserCategories } from '@/hooks/budget/useUserCategories';
import Colors from '@/constants/Colors';

export default function CategoriesManagerScreen() {
  const { onboardingCompleted, loading, completeOnboarding, userCategories } = useUserCategories();

  const handleOnboardingComplete = async (selectedCategories: { income: string[]; expenses: string[] }) => {
    try {
      await completeOnboarding(selectedCategories);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
      </View>
    );
  }

  if (!onboardingCompleted) {
    return <CategoriesOnboarding onComplete={handleOnboardingComplete} />;
  }

  return <CategoriesManager userCategories={userCategories} />;
}
