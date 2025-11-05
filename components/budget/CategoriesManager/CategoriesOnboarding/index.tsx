import { View, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import FormLayout from '@/components/ui/FormLayout';
import { useCategoriesOnboarding } from '@/hooks/budget/useCategoriesOnboarding';
import { CategoryCard } from './CategoryCard';
import { ErrorMessage } from './ErrorMessage';
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

interface CategoriesOnboardingProps {
  onComplete: (selectedCategories: { income: SelectedCategory[]; expenses: SelectedCategory[] }) => void;
}

export function CategoriesOnboarding({ onComplete }: CategoriesOnboardingProps) {
  const router = useRouter();
  const {
    // State
    currentStep,
    selectedIncome,
    selectedExpenses,
    error,
    loading,
    currentLang,

    // Computed
    incomeCategories,
    expenseCategories,
    isIncomeValid,
    isExpenseValid,

    // Handlers
    toggleIncomeCategory,
    toggleExpenseCategory,
    handleNext,
    handleBack,

    // Translation
    t
  } = useCategoriesOnboarding();

  const handleComplete = () => {
    if (!isExpenseValid) {
      return;
    }

    // Map selected IDs to full category objects with emoji data
    const selectedIncomeObjects = incomeCategories.filter(cat =>
      selectedIncome.includes(cat.id)
    );
    const selectedExpenseObjects = expenseCategories.filter(cat =>
      selectedExpenses.includes(cat.id)
    );

    onComplete({
      income: selectedIncomeObjects,
      expenses: selectedExpenseObjects
    });
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  return (
    <FormLayout
      title={
        currentStep === 1
          ? t('budget.onboarding_income_title', 'Personaliza tus Ingresos 🔖 ')
          : t('budget.onboarding_expenses_title', 'Personaliza tus Gastos 🔖 ')
      }
      subtitle={
        currentStep === 1
          ? t('budget.onboarding_income_subtitle', 'Selecciona las categorías principales para organizar tus ingresos')
          : t('budget.onboarding_expenses_subtitle', 'Selecciona las categorías principales para organizar tus gastos')
      }
      currentStep={currentStep}
      totalSteps={2}
      onNext={currentStep === 1 ? handleNext : handleComplete}
      onPrevious={currentStep === 2 ? handleBack : undefined}
      onCancel={currentStep === 1 ? handleCancel : undefined}
      nextButtonTitle={
        currentStep === 1
          ? t('common.continue', 'Continuar')
          : t('common.finish', 'Finalizar')
      }
      previousButtonTitle={t('common.back', 'Volver')}
      cancelButtonTitle={t('common.cancel', 'Cancelar')}
      isNextDisabled={currentStep === 1 ? !isIncomeValid : !isExpenseValid}
      showLogo={false}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View style={{ gap: 8 }}>
          <ErrorMessage error={error} />

          {currentStep === 1
            ? incomeCategories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={selectedIncome.includes(category.id)}
                  onToggle={() => toggleIncomeCategory(category.id)}
                  currentLang={currentLang}
                />
              ))
            : expenseCategories.map(category => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  isSelected={selectedExpenses.includes(category.id)}
                  onToggle={() => toggleExpenseCategory(category.id)}
                  currentLang={currentLang}
                />
              ))
          }
        </View>
      </ScrollView>
    </FormLayout>
  );
}
