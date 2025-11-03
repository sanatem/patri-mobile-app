import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';
import { getExpenseCategories } from '@/services/budget/categories-manager/system-categories/get-expense-categories';
import { getIncomeCategories } from '@/services/budget/categories-manager/system-categories/get-income-categories';
import type { TransactionCategory } from '@/services/budget/categories-manager/system-categories/get-expense-categories';

export function useCategoriesOnboarding() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedIncome, setSelectedIncome] = useState<string[]>([]);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [apiIncomeCategories, setApiIncomeCategories] = useState<TransactionCategory[]>([]);
  const [apiExpenseCategories, setApiExpenseCategories] = useState<TransactionCategory[]>([]);

  const currentLang = t('common.language_code', 'es');

  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;

      try {
        setLoading(true);

        const [incomeResponse, expenseResponse] = await Promise.all([
          getIncomeCategories({ per_page: 100 }, accessToken),
          getExpenseCategories({ per_page: 100 }, accessToken)
        ]);

        if (incomeResponse?.success && incomeResponse.data) {
          setApiIncomeCategories(incomeResponse.data);
        }

        if (expenseResponse?.success && expenseResponse.data) {
          setApiExpenseCategories(expenseResponse.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [accessToken]);

  const getEmojiForCategory = (name: string, isIncome: boolean): string => {
    const staticCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const normalizedName = name.toLowerCase().trim();

    const found = staticCategories.find(cat => {
      const catNameEs = cat.name.es.toLowerCase();
      const catNameEsCl = cat.name['es-CL'].toLowerCase();
      const catNameEn = cat.name.en.toLowerCase();

      return catNameEs === normalizedName ||
             catNameEsCl === normalizedName ||
             catNameEn === normalizedName ||
             catNameEs.includes(normalizedName) ||
             normalizedName.includes(catNameEs);
    });

    if (found) return found.emoji;

    for (const cat of staticCategories) {
      if (cat.subcategories) {
        const subFound = cat.subcategories.find(sub => {
          const subNameEs = sub.name.es.toLowerCase();
          const subNameEsCl = sub.name['es-CL'].toLowerCase();
          const subNameEn = sub.name.en.toLowerCase();

          return subNameEs === normalizedName ||
                 subNameEsCl === normalizedName ||
                 subNameEn === normalizedName ||
                 subNameEs.includes(normalizedName) ||
                 normalizedName.includes(subNameEs);
        });

        if (subFound) return subFound.emoji;
      }
    }

    return isIncome ? '💰' : '💸';
  };

  const incomeCategories = useMemo(() => {
    if (apiIncomeCategories.length > 0) {
      return apiIncomeCategories.map(category => ({
        id: category.id.toString(),
        name: {
          en: category.name,
          es: category.translated_name,
          'es-CL': category.translated_name
        },
        emoji: getEmojiForCategory(category.translated_name, true),
        subcategories: category.children.map(subcat => ({
          id: subcat.id.toString(),
          name: {
            en: subcat.name,
            es: subcat.translated_name,
            'es-CL': subcat.translated_name
          },
          emoji: getEmojiForCategory(subcat.translated_name, true)
        }))
      }));
    }
    return INCOME_CATEGORIES;
  }, [apiIncomeCategories]);

  const expenseCategories = useMemo(() => {
    if (apiExpenseCategories.length > 0) {
      return apiExpenseCategories.map(category => ({
        id: category.id.toString(),
        name: {
          en: category.name,
          es: category.translated_name,
          'es-CL': category.translated_name
        },
        emoji: getEmojiForCategory(category.translated_name, false),
        subcategories: category.children.map(subcat => ({
          id: subcat.id.toString(),
          name: {
            en: subcat.name,
            es: subcat.translated_name,
            'es-CL': subcat.translated_name
          },
          emoji: getEmojiForCategory(subcat.translated_name, false)
        }))
      }));
    }
    return EXPENSE_CATEGORIES;
  }, [apiExpenseCategories]);

  const toggleIncomeCategory = (categoryId: string) => {
    setError(null);
    setSelectedIncome(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        if (prev.length >= 3) {
          setError(t('budget.max_income_categories', 'Puedes seleccionar hasta 3 categorías de ingresos'));
          return prev;
        }
        return [...prev, categoryId];
      }
    });
  };

  const toggleExpenseCategory = (categoryId: string) => {
    setError(null);
    setSelectedExpenses(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        if (prev.length >= 3) {
          setError(t('budget.max_expense_categories', 'Puedes seleccionar hasta 3 categorías de gastos'));
          return prev;
        }
        return [...prev, categoryId];
      }
    });
  };

  const isIncomeValid = useMemo(() => {
    return selectedIncome.length >= 1 && selectedIncome.length <= 3;
  }, [selectedIncome]);

  const isExpenseValid = useMemo(() => {
    return selectedExpenses.length >= 1 && selectedExpenses.length <= 3;
  }, [selectedExpenses]);

  const handleNext = () => {
    if (currentStep === 1) {
      if (!isIncomeValid) {
        setError(t('budget.select_income_categories', 'Debes seleccionar entre 1 y 4 categorías de ingresos'));
        return;
      }
      setError(null);
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setError(null);
      setCurrentStep(1);
    }
  };

  return {
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
    setCurrentStep,

    // Translation
    t
  };
}
