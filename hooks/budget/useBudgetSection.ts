import { useState, useMemo, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useTranslation } from 'react-i18next';
import { useFloidSync } from '@/hooks/common/useFloidSync';

const mockBudgetInstances = [
  {
    id: 1,
    budget_template_id: 1,
    start_date: '2024-11-01',
    end_date: '2024-11-30',
    amount: 500000,
    spent_amount: 75000,         // 15% - Verde
    remaining_amount: 425000,
    percentage: 15,
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
    spent_amount: 120000,        // 30% - Verde-amarillo
    remaining_amount: 280000,
    percentage: 30,
    over_budget: false,
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
    spent_amount: 100000,        // 50% - Amarillo
    remaining_amount: 100000,
    percentage: 50,
    over_budget: false,
    category: {
      id: 47,
      name: 'Entretenimiento',
      kind: 'outcome',
      emoji_code: '🎮'
    },
    recurrence: 'monthly'
  },
  {
    id: 4,
    budget_template_id: 4,
    start_date: '2024-11-01',
    end_date: '2024-11-30',
    amount: 300000,
    spent_amount: 210000,        // 70% - Naranja
    remaining_amount: 90000,
    percentage: 70,
    over_budget: false,
    category: {
      id: 48,
      name: 'Servicios',
      kind: 'outcome',
      emoji_code: '💡'
    },
    recurrence: 'monthly'
  },
  {
    id: 5,
    budget_template_id: 5,
    start_date: '2024-11-01',
    end_date: '2024-11-30',
    amount: 250000,
    spent_amount: 300000,        // 120% - Rojo (Excedido)
    remaining_amount: -50000,
    percentage: 120,
    over_budget: true,
    category: {
      id: 49,
      name: 'Compras',
      kind: 'outcome',
      emoji_code: '🛍️'
    },
    recurrence: 'monthly'
  }
];

const mockSummary = {
  total_budgeted: 1100000,
  total_spent: 1200000,       // ~109% del presupuesto (rango 81%+ = rojo)
  total_remaining: -100000,
  categories_count: 3,
  over_budget_count: 2,
  warning_count: 1,
  healthy_count: 0
};

export function useBudgetSection() {
  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();
  const { isSyncing, stopSync } = useFloidSync();
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

  // Month and year selection state
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(months[currentDate.getMonth()]);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear().toString());

  // Generate month options
  const monthOptions = useMemo(() => {
    return months.map((month) => ({
      label: month,
      value: month,
    }));
  }, [months]);

  // Generate year options (current year and 2 years back)
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return [
      { label: (currentYear - 2).toString(), value: (currentYear - 2).toString() },
      { label: (currentYear - 1).toString(), value: (currentYear - 1).toString() },
      { label: currentYear.toString(), value: currentYear.toString() },
    ];
  }, []);

  // Handlers
  const handleNavigateToTransactions = () => {
    router.push('/(tabs)/budget/transactions' as any);
  };

  const handleNavigateToCreateBudget = () => {
    router.push('/(tabs)/budget/create-budget' as any);
  };

  const handleIntegrarDatos = () => {
    router.push('/(tabs)/budget/transactions/floid-screen' as any);
  };

  const handleSyncComplete = () => {
    // Refresh budget data after sync completes
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    // TODO: Refetch budget data for new month
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
    // TODO: Refetch budget data for new year
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

  const handleNavigateToCategories = () => {
    router.push('/(tabs)/budget/transactions/categories-manager' as any);
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
    selectedMonth,
    selectedYear,

    // Data
    budgetInstances,
    summary,
    hasBudgets,

    // Options
    monthOptions,
    yearOptions,

    // Loading states
    subscriptionLoading,
    loading,
    isSyncing,

    // Computed values
    chartSize,
    shouldBlockTab,

    // Handlers
    handleNavigateToTransactions,
    handleNavigateToCreateBudget,
    handleNavigateToBudgetHistory,
    handleNavigateToCategories,
    handleIntegrarDatos,
    handleMonthSelect,
    handleYearSelect,
    stopSync,
    handleSyncComplete,

    t,
  };
}
