import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCategories, getIncomeCategories, getExpenseCategories } from '@/services/budget/categories-manager';
import type { UserCategory, TransactionCategory } from '@/services/budget/categories-manager';
import { getTranslatedNames, getEmojiForCategory, getEmojiFromBudgetCategories } from '@/services/budget/utils/category-utils';
import type { CategoryData, GroupedData, SelectOption } from './types';

interface UseCategoriesDataProps {
  activeTab: 'income' | 'expenses';
  allTransactions: any[];
  currentLang: string;
}

export function useCategoriesData({ activeTab, allTransactions, currentLang }: UseCategoriesDataProps) {
  const { accessToken } = useAuth();

  // API categories state
  const [apiIncomeCategories, setApiIncomeCategories] = useState<UserCategory[]>([]);
  const [apiExpenseCategories, setApiExpenseCategories] = useState<UserCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // System categories state (transaction_categories)
  const [systemIncomeCategories, setSystemIncomeCategories] = useState<TransactionCategory[]>([]);
  const [systemExpenseCategories, setSystemExpenseCategories] = useState<TransactionCategory[]>([]);

  // Load categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;

      try {
        setCategoriesLoading(true);

        const [incomeResponse, expenseResponse, systemIncomeResponse, systemExpenseResponse] = await Promise.all([
          getUserCategories({ kind: 'income', per_page: 100 }, accessToken),
          getUserCategories({ kind: 'expense', per_page: 100 }, accessToken),
          getIncomeCategories({ per_page: 100 }, accessToken),
          getExpenseCategories({ per_page: 100 }, accessToken)
        ]);

        if (incomeResponse?.success && incomeResponse.data) {
          const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
          setApiIncomeCategories(parentCategories);
        }

        if (expenseResponse?.success && expenseResponse.data) {
          const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
          setApiExpenseCategories(parentCategories);
        }

        if (systemIncomeResponse?.success && systemIncomeResponse.data) {
          const parentCategories = systemIncomeResponse.data.filter(cat => cat.parent_id === null);
          setSystemIncomeCategories(parentCategories);
        }

        if (systemExpenseResponse?.success && systemExpenseResponse.data) {
          const parentCategories = systemExpenseResponse.data.filter(cat => cat.parent_id === null);
          setSystemExpenseCategories(parentCategories);
        }

      } catch (error) {
        console.error('Error fetching user categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [accessToken]);

  // Reload categories from API
  const reloadCategories = async () => {
    if (!accessToken) return;

    const [incomeResponse, expenseResponse, systemIncomeResponse, systemExpenseResponse] = await Promise.all([
      getUserCategories({ kind: 'income', per_page: 100 }, accessToken),
      getUserCategories({ kind: 'expense', per_page: 100 }, accessToken),
      getIncomeCategories({ per_page: 100 }, accessToken),
      getExpenseCategories({ per_page: 100 }, accessToken)
    ]);

    if (incomeResponse?.success && incomeResponse.data) {
      const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
      setApiIncomeCategories(parentCategories);
    }

    if (expenseResponse?.success && expenseResponse.data) {
      const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
      setApiExpenseCategories(parentCategories);
    }

    if (systemIncomeResponse?.success && systemIncomeResponse.data) {
      const parentCategories = systemIncomeResponse.data.filter(cat => cat.parent_id === null);
      setSystemIncomeCategories(parentCategories);
    }

    if (systemExpenseResponse?.success && systemExpenseResponse.data) {
      const parentCategories = systemExpenseResponse.data.filter(cat => cat.parent_id === null);
      setSystemExpenseCategories(parentCategories);
    }
  };

  // Transform API categories to component format
  const categories = useMemo(() => {
    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const isIncome = activeTab === 'income';

    if (apiCategories.length > 0) {
      return apiCategories.map(category => {
        const translatedNames = getTranslatedNames(category.display_name, isIncome);
        return {
          id: category.id.toString(),
          name: translatedNames,
          emoji: category.emoji_code || getEmojiForCategory(category.display_name, isIncome),
          originalName: category.display_name,
          originalEmoji: category.emoji_code || '',
          subcategories: (category.children || []).map(subcat => {
            const subTranslatedNames = getTranslatedNames(subcat.display_name, isIncome);
            return {
              id: subcat.id.toString(),
              name: subTranslatedNames,
              emoji: subcat.emoji_code || getEmojiForCategory(subcat.display_name, isIncome),
              originalName: subcat.display_name,
              originalEmoji: subcat.emoji_code || '',
              transactions: [],
              total: 0
            };
          }),
          total: 0,
          transactionCount: 0,
          uncategorizedTransactions: []
        };
      });
    }

    return [];
  }, [activeTab, apiIncomeCategories, apiExpenseCategories]);

  // Group transactions by category and subcategory
  const groupedData = useMemo((): GroupedData => {
    const uncategorized = allTransactions.filter(t => !t.category || !t.category.id);
    const categorizedTransactions = allTransactions.filter(t => t.category && t.category.id);

    const categorized = categories.map(category => {
      const categoryId = parseInt(category.id);
      const categoryTransactions = allTransactions.filter(t => t.category?.id === categoryId);

      const subcategoriesData = category.subcategories?.map(subcat => {
        const subcatId = parseInt(subcat.id);
        const subcatTransactions = allTransactions.filter(t => t.category?.id === subcatId);

        return {
          ...subcat,
          transactions: subcatTransactions,
          total: subcatTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
        };
      }) || [];

      const subcategoryIds = category.subcategories?.map(s => parseInt(s.id)) || [];
      const uncategorizedInCategory = categoryTransactions.filter(t => {
        const tCategoryId = t.category?.id;
        return tCategoryId === categoryId && !subcategoryIds.includes(tCategoryId);
      });

      const subcategoriesTotal = subcategoriesData.reduce((sum, sub) => sum + sub.total, 0);
      const categoryTotal = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      const total = categoryTotal + subcategoriesTotal;

      return {
        ...category,
        subcategories: subcategoriesData,
        uncategorizedTransactions: uncategorizedInCategory,
        total,
        transactionCount: categoryTransactions.length + subcategoriesData.reduce((sum, sub) => sum + sub.transactions.length, 0)
      };
    });

    return { categorized, uncategorized, categorizedTransactions };
  }, [allTransactions, categories]);

  // Category options for select dropdowns
  const categoryOptions = useMemo((): SelectOption[] => {
    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    if (apiCategories.length === 0) return [];
    const isIncome = activeTab === 'income';

    return apiCategories
      .filter(category => category && category.id !== undefined && category.id !== null)
      .map(category => {
        const translatedNames = getTranslatedNames(category.display_name, isIncome);
        return {
          label: translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || category.display_name || '',
          value: category.id.toString()
        };
      });
  }, [activeTab, apiIncomeCategories, apiExpenseCategories, currentLang]);

  // Subcategory options for select dropdowns
  const getSubcategoryOptions = (selectedCategoryId: string | null): SelectOption[] => {
    if (!selectedCategoryId) return [];

    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const category = apiCategories.find(cat => cat && cat.id && cat.id.toString() === selectedCategoryId);

    if (!category || !category.children || category.children.length === 0) return [];
    const isIncome = activeTab === 'income';

    return category.children
      .filter(subcat => subcat && subcat.id !== undefined && subcat.id !== null)
      .map(subcat => {
        const translatedNames = getTranslatedNames(subcat.display_name, isIncome);
        return {
          label: translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || subcat.display_name || '',
          value: subcat.id.toString()
        };
      });
  };

  // Available system categories (not yet created by user)
  const availableSystemCategories = useMemo(() => {
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;
    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const isIncome = activeTab === 'income';

    const userCategoryIds = new Set(
      userCategories
        .filter(cat => cat.transaction_category_id !== undefined && cat.transaction_category_id !== null)
        .map(cat => cat.transaction_category_id)
    );

    return systemCategories
      .filter(cat => !userCategoryIds.has(cat.id))
      .map(cat => ({
        id: cat.id.toString(),
        name: {
          es: cat.translated_name || cat.name,
          en: cat.name,
          pt: cat.translated_name || cat.name,
          'es-CL': cat.translated_name || cat.name
        },
        emoji: getEmojiFromBudgetCategories(cat.name, isIncome),
        transactionCategoryId: cat.id
      }));
  }, [activeTab, apiIncomeCategories, apiExpenseCategories, systemIncomeCategories, systemExpenseCategories]);

  return {
    // State
    apiIncomeCategories,
    apiExpenseCategories,
    systemIncomeCategories,
    systemExpenseCategories,
    categoriesLoading,

    // Computed data
    categories,
    groupedData,
    categoryOptions,
    availableSystemCategories,

    // Functions
    reloadCategories,
    getSubcategoryOptions,

    // Setters (for external updates)
    setApiIncomeCategories,
    setApiExpenseCategories,
    setSystemIncomeCategories,
    setSystemExpenseCategories,
  };
}
