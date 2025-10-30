import { View, ScrollView } from 'react-native';
import FormLayout from '@/components/ui/FormLayout';
import { useCategoriesOnboarding } from '@/hooks/budget/useCategoriesOnboarding';
import { CategoryCard } from './CategoryCard';
import { ErrorMessage } from './ErrorMessage';
import { LoadingState } from './LoadingState';

interface CategoriesOnboardingProps {
  onComplete: (selectedCategories: { income: string[]; expenses: string[] }) => void;
}

export function CategoriesOnboarding({ onComplete }: CategoriesOnboardingProps) {
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
    onComplete({
      income: selectedIncome,
      expenses: selectedExpenses
    });
  };

  if (loading) {
    return <LoadingState loadingText={t('budget.loading_categories', 'Cargando categorías...')} />;
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
          ? t('budget.onboarding_income_subtitle', 'Selecciona de 1 a 4 categorías principales para organizar tus ingresos')
          : t('budget.onboarding_expenses_subtitle', 'Selecciona de 1 a 6 categorías principales para organizar tus gastos')
      }
      currentStep={currentStep}
      totalSteps={2}
      onNext={currentStep === 1 ? handleNext : handleComplete}
      onPrevious={currentStep === 2 ? handleBack : undefined}
      nextButtonTitle={
        currentStep === 1
          ? t('common.continue', 'Continuar')
          : t('common.finish', 'Finalizar')
      }
      previousButtonTitle={t('common.back', 'Volver')}
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
