import React, { useState } from 'react';
import { ActivityIndicator, View, Alert } from 'react-native';
import { CategoriesManager } from '@/components/budget/CategoriesManager';
import { CategoriesOnboarding } from '@/components/budget/CategoriesManager/CategoriesOnboarding';
import { useUserCategories } from '@/hooks/budget/useUserCategories';
import { useAuth } from '@/providers/AuthProvider';
import { createUserCategory } from '@/services/budget/categories-manager';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';
import Colors from '@/constants/Colors';

export default function CategoriesManagerScreen() {
  const { accessToken } = useAuth();
  const { onboardingCompleted, loading, completeOnboarding, userCategories, refetch } = useUserCategories();
  const [creatingCategories, setCreatingCategories] = useState(false);

  const handleOnboardingComplete = async (selectedCategories: { income: string[]; expenses: string[] }) => {
    if (!accessToken) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      return;
    }

    try {
      setCreatingCategories(true);

      // Crear todas las categorías de ingresos seleccionadas en el backend
      const incomePromises = selectedCategories.income.map(categoryId => {
        const category = INCOME_CATEGORIES.find(cat => cat.id === categoryId);
        return createUserCategory(
          {
            name: category?.name.en || 'Income',
            kind: 'income',
            emoji_code: category?.emoji || '💰',
            transaction_category_id: parseInt(categoryId)
          },
          accessToken
        );
      });

      // Crear todas las categorías de gastos seleccionadas en el backend
      const expensePromises = selectedCategories.expenses.map(categoryId => {
        const category = EXPENSE_CATEGORIES.find(cat => cat.id === categoryId);
        return createUserCategory(
          {
            name: category?.name.en || 'Expense',
            kind: 'expense',
            emoji_code: category?.emoji || '💸',
            transaction_category_id: parseInt(categoryId)
          },
          accessToken
        );
      });

      await Promise.all([...incomePromises, ...expensePromises]);

      // Marcar onboarding como completado en AsyncStorage
      await completeOnboarding(selectedCategories);

      // Refrescar las categorías del backend
      await refetch();

    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Hubo un problema al guardar las categorías');
    } finally {
      setCreatingCategories(false);
    }
  };

  if (loading || creatingCategories) {
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
