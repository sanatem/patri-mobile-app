import { useState, useMemo, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useTranslation } from 'react-i18next';

// Mock data for budget instances - will be replaced with API call
const mockBudgetInstances = [
  {
    id: 1,
    budget_template_id: 1,
    start_date: '2024-11-01',
    end_date: '2024-11-30',
    amount: 500000,
    spent_amount: 130000,
    remaining_amount: 370000,
    percentage: 26,
    over_budget: false,
    category: {
      id: 45,
      name: 'Alimentación',
      kind: 'outcome',
      emoji_code: '🍔'
    },
    recurrence: 'monthly'
  },
  {
    id: 2,
    budget_template_id: 2,
    start_date: '2024-11-01',
    end_date: '2024-11-30',
    amount: 400000,
    spent_amount: 450000,
    remaining_amount: -50000,
    percentage: 112.5,
    over_budget: true,
    category: {
      id: 46,
      name: 'Transporte',
      kind: 'outcome',
      emoji_code: '🚗'
    },
    recurrence: 'monthly'
  },
  {
    id: 3,
    budget_template_id: 3,
    start_date: '2024-11-01',
    end_date: '2024-11-30',
    amount: 200000,
    spent_amount: 80000,
    remaining_amount: 120000,
    percentage: 40,
    over_budget: false,
    category: {
      id: 47,
      name: 'Entretenimiento',
      kind: 'outcome',
      emoji_code: '🎮'
    },
    recurrence: 'monthly'
  }
];

const mockSummary = {
  total_budgeted: 1100000,
  total_spent: 660000,
  total_remaining: 440000,
  categories_count: 3,
  over_budget_count: 1,
  warning_count: 0,
  healthy_count: 2
};

export function useBudgetSection() {
  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();
  const router = useRouter();
  const { t } = useTranslation();

  const { width: screenWidth } = Dimensions.get('window');
  const chartSize = Math.min(screenWidth - 80, 280);

  // Month and year management
  const months = useMemo(() => {
    const translated = t('months', { returnObjects: true }) as string[] | undefined;
    return Array.isArray(translated) && translated.length === 12
      ? translated
      : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  }, [t]);

  const getCurrentMonthYear = (): string => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    return `${months[currentMonthIndex]} ${currentYear}`;
  };

  // State
  const [budgetInstances, setBudgetInstances] = useState(mockBudgetInstances);
  const [summary, setSummary] = useState(mockSummary);
  const [loading, setLoading] = useState(false);
  const [currentPeriod] = useState(getCurrentMonthYear());

  // Handlers
  const handleNavigateToTransactions = () => {
    router.push('/(tabs)/budget/transactions' as any);
  };

  const handleNavigateToCreateBudget = () => {
    router.push('/(tabs)/budget/create-budget' as any);
  };

  const handleNavigateToBudgetHistory = (instanceId: number, categoryName: string) => {
    router.push({
      pathname: '/(tabs)/budget/budget-history' as any,
      params: {
        instanceId: instanceId.toString(),
        categoryName
      }
    });
  };

  // Effects - will fetch data from API when available
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          setLoading(true);
          // TODO: Replace with actual API call
          // const response = await getBudgetInstancesCurrent(accessToken);
          // setBudgetInstances(response.budget_instances);
          // setSummary(response.summary);

          // Simulate loading
          setTimeout(() => {
            setLoading(false);
          }, 500);
        } catch (error) {
          console.error('Error refreshing budget data:', error);
          setLoading(false);
        }
      };

      refreshData();
    }, [])
  );

  // Computed values
  const hasBudgets = budgetInstances.length > 0;

  return {
    // State
    currentPeriod,

    // Data
    budgetInstances,
    summary,
    hasBudgets,

    // Loading states
    subscriptionLoading,
    loading,

    // Computed values
    chartSize,
    shouldBlockTab,

    // Handlers
    handleNavigateToTransactions,
    handleNavigateToCreateBudget,
    handleNavigateToBudgetHistory,

    t,
  };
}
