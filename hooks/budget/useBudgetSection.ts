import { useState, useMemo, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useTranslation } from 'react-i18next';
import { useFloidSync } from '@/hooks/common/useFloidSync';
import { useAuth } from '@/providers/AuthProvider';
import { getBudgetInstancesCurrent } from '@/services/budget/budget-instances';
import type { BudgetInstance, BudgetSummary } from '@/services/budget/budget-templates/types';

const emptySummary: BudgetSummary = {
  total_budget: 0,
  total_spent: 0,
  total_remaining: 0,
  categories_count: 0,
  over_budget_count: 0,
  warning_count: 0,
  healthy_count: 0
};

export function useBudgetSection() {
  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();
  const { isSyncing, stopSync } = useFloidSync();
  const { accessToken } = useAuth();
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
  const [budgetInstances, setBudgetInstances] = useState<BudgetInstance[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
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

  // Fetch budget data from API
  const fetchBudgetData = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await getBudgetInstancesCurrent(accessToken);

      if (response.success && response.budget_instances) {
        setBudgetInstances(response.budget_instances);
        setSummary(response.summary);
      } else {
        setBudgetInstances([]);
        setSummary(emptySummary);
      }
    } catch (error) {
      console.error('Error fetching budget data:', error);
      setBudgetInstances([]);
      setSummary(emptySummary);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

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
    fetchBudgetData();
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
  };

  const handleYearSelect = (year: string) => {
    setSelectedYear(year);
  };

  const handleNavigateToBudgetDetail = (instanceId: number) => {
    router.push({
      pathname: '/(tabs)/budget/budget-detail' as any,
      params: {
        instanceId: instanceId.toString(),
      }
    });
  };

  const handleNavigateToCategories = () => {
    router.push('/(tabs)/budget/transactions/categories-manager' as any);
  };

  // Effects - fetch data from API on focus
  useFocusEffect(
    useCallback(() => {
      fetchBudgetData();
    }, [fetchBudgetData])
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
    handleNavigateToBudgetDetail,
    handleNavigateToCategories,
    handleIntegrarDatos,
    handleMonthSelect,
    handleYearSelect,
    stopSync,
    handleSyncComplete,

    // Refetch function
    refetch: fetchBudgetData,

    t,
  };
}
