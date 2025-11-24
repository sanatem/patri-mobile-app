import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import { useGoals } from '@/hooks/investment/useGoals';
import { useTotalWalletValue } from '@/hooks/investment/useTotalWalletValue';
import { getCash } from '@/services/investment/cash/get-cash';
import type { Goal } from '@/types/api';

/**
 * Main hook for Portfolio Overview screen
 * Manages portfolio data, goals, and account type selection
 */
export function usePortfolioOverview() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [cashData, setCashData] = useState<any>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<string>('investment');

  const { goals, loading: goalsLoading, error: goalsError, refetch } = useGoals();
  const { totalWalletValue, investmentWalletValue, savingsWalletValue, loading: walletLoading, error: walletError } = useTotalWalletValue();

  useEffect(() => {
    const loadCashData = async () => {
      if (!accessToken) return;

      try {
        const data = await getCash(accessToken);
        setCashData(data);
      } catch (error) {
        console.error('Portfolio: Error cargando cash:', error);
      }
    };

    loadCashData();
  }, [accessToken]);

  const accountTypeOptions = [
    {
      label: t('portfolio.accountTypes.investment'),
      value: 'investment'
    },
    {
      label: t('portfolio.accountTypes.savings'),
      value: 'savings'
    }
  ];

  const getCurrentGoals = (): Goal[] => {
    if (!goals || goalsLoading) {
      return [];
    }

    if (selectedAccountType === 'investment') {
      return [...(goals.investment?.shortTerm || []), ...(goals.investment?.mediumTerm || []), ...(goals.investment?.longTerm || [])];
    } else {
      return [...(goals.savings?.shortTerm || []), ...(goals.savings?.mediumTerm || []), ...(goals.savings?.longTerm || [])];
    }
  };

  const getPatrimonyValue = (): string => {
    if (walletLoading || goalsLoading) {
      return '';
    }

    if (walletError) {
      return '0';
    }

    const accountValue = selectedAccountType === 'investment' ? investmentWalletValue : savingsWalletValue;

    if (accountValue && accountValue > 0) {
      return `${Math.round(accountValue).toLocaleString('es-CL')}`;
    }

    const currentGoals = getCurrentGoals();
    if (currentGoals.length > 0) {
      const manualTotal = currentGoals.reduce((sum, goal) => {
        return sum + (goal.currentAmount || 0);
      }, 0);

      if (manualTotal > 0) {
        return `${Math.round(manualTotal).toLocaleString('es-CL')}`;
      }
    }

    return '0';
  };

  const getCurrentCashAmount = (): number => {
    if (!cashData?.cash) return 0;

    if (selectedAccountType === 'investment') {
      const userCash = cashData.cash.investment?.user_cash;
      return userCash ? (typeof userCash === 'string' ? parseFloat(userCash) : userCash) : 0;
    } else {
      const userCash = cashData.cash.savings?.user_cash;
      return userCash ? (typeof userCash === 'string' ? parseFloat(userCash) : userCash) : 0;
    }
  };

  const handleInvestPress = () => {
    router.push('/(tabs)/investment/portfolio/movements/investment');
  };

  const handleWithdrawPress = () => {
    router.push('/(tabs)/investment/portfolio/movements/sales');
  };

  const handleGoalPress = (goal: Goal) => {
    router.push({
      pathname: '/investment/portfolio/portfolio-details',
      params: {
        goalId: goal.id,
        goalName: goal.name,
      },
    });
  };

  return {
    // Data
    patrimonyValue: getPatrimonyValue(),
    cashAmount: getCurrentCashAmount(),
    selectedAccountType,
    accountTypeOptions,

    // Loading states
    walletLoading,
    goalsLoading,
    goalsError,

    // Goals data
    currentGoals: getCurrentGoals(),

    // Handlers
    setSelectedAccountType,
    handleInvestPress,
    handleWithdrawPress,
    handleGoalPress,
    refetch,

    // Translation
    t,
  };
}
