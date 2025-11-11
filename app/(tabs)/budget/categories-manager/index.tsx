import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { LoadingSpinner, Container } from '@/components/ui';
import { CategoriesManager } from '@/components/budget/CategoriesManager';
import { CategoriesOnboarding } from '@/components/budget/CategoriesManager/CategoriesOnboarding';
import { useUserCategories } from '@/hooks/budget/useUserCategories';
import { useAuth } from '@/providers/AuthProvider';
import { createUserCategory } from '@/services/budget/categories-manager';
import Colors from '@/constants/Colors';

interface SelectedCategory {
  id: string;
  emoji: string;
  name: {
    en: string;
    es: string;
    'es-CL': string;
  };
}

export default function CategoriesManagerScreen() {
  const { accessToken } = useAuth();
  const { onboardingCompleted, loading, completeOnboarding, userCategories, refetch, resetOnboarding } = useUserCategories();
  const [creatingCategories, setCreatingCategories] = useState(false);

  const handleOnboardingComplete = async (selectedCategories: { income: SelectedCategory[]; expenses: SelectedCategory[] }) => {
    if (!accessToken) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      return;
    }

    try {
      setCreatingCategories(true);

      // Crear todas las categorías de ingresos seleccionadas en el backend
      const incomePromises = selectedCategories.income.map(category => {
        return createUserCategory(
          {
            name: category.name.en,
            kind: 'income',
            emoji_code: category.emoji,
            transaction_category_id: parseInt(category.id)
          },
          accessToken
        );
      });

      // Crear todas las categorías de gastos seleccionadas en el backend
      const expensePromises = selectedCategories.expenses.map(category => {
        return createUserCategory(
          {
            name: category.name.en,
            kind: 'expense',
            emoji_code: category.emoji,
            transaction_category_id: parseInt(category.id)
          },
          accessToken
        );
      });

      await Promise.all([...incomePromises, ...expensePromises]);

      // Marcar onboarding como completado en AsyncStorage (solo IDs)
      await completeOnboarding({
        income: selectedCategories.income.map(cat => cat.id),
        expenses: selectedCategories.expenses.map(cat => cat.id)
      });

      // Refrescar las categorías del backend
      await refetch();

    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Hubo un problema al guardar las categorías');
    } finally {
      setCreatingCategories(false);
    }
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      'Reiniciar Categorías',
      '¿Estás seguro que deseas reiniciar tus categorías? Esto eliminará todas tus categorías personalizadas y podrás seleccionar nuevamente.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: async () => {
            try {
              setCreatingCategories(true);
              await resetOnboarding();
              Alert.alert('Éxito', 'Categorías reiniciadas correctamente');
            } catch (error) {
              console.error('Error resetting onboarding:', error);
              Alert.alert('Error', 'Hubo un problema al reiniciar las categorías');
            } finally {
              setCreatingCategories(false);
            }
          }
        }
      ]
    );
  };

  if (loading || creatingCategories) {
    return (
      <View style={{ flex: 1, position: 'relative' }}>
        <LoadingSpinner overlay />
      </View>
    );
  }

  if (!onboardingCompleted) {
    return <CategoriesOnboarding onComplete={handleOnboardingComplete} />;
  }

  return <CategoriesManager userCategories={userCategories} onResetOnboarding={handleResetOnboarding} />;
}
