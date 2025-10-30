import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Animated, Dimensions, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useFloidAccounts } from './useFloidAccounts';
import { useFloidTransactions } from './useFloidTransactions';
import { deleteFloidTransaction } from '@/services/budget/delete-floid-transaction';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useFloidSync } from '@/providers/FloidSyncProvider';
import { useTranslation } from 'react-i18next';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function useBudgetOverview() {
  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();
  const { isSyncing, stopSync } = useFloidSync();
  const { accessToken } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  const { width: screenWidth } = Dimensions.get('window');
  const chartSize = Math.min(screenWidth - 80, 280);
  const contentWidth = Math.min(screenWidth - 40, 320);

  // Month and year management
  const months = useMemo(() => {
    const translated = t('months', { returnObjects: true }) as string[] | undefined;
    return Array.isArray(translated) && translated.length === 12
      ? translated
      : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  }, [t]);

  const monthOptions = useMemo(() => months.map(month => ({
    label: month,
    value: month
  })), [months]);

  const getCurrentMonth = (): string => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    return months[currentMonthIndex] || 'Enero';
  };

  const getCurrentYear = (): number => {
    return new Date().getFullYear();
  };

  const yearOptions = useMemo(() => [
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' }
  ], []);

  // State
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentYear().toString());
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showBudgetSkeletons, setShowBudgetSkeletons] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Animations
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Data fetching
  const { accounts, loading: accountsLoading, refetch: refetchAccounts } = useFloidAccounts();

  const accountOptions = useMemo(() => {
    if (!accounts || accounts.floid_accounts.length === 0) return [];

    const options = [
      { label: t('budget.all_accounts', 'Todas las cuentas'), value: 'all' },
      ...accounts.floid_accounts.map(account => ({
        label: `${account.bank} - ${account.account}`,
        value: account.id.toString()
      }))
    ];

    return options;
  }, [accounts, t]);

  const [selectedAccountId, setSelectedAccountId] = useState<string>('all');

  const selectedAccountIds = useMemo(() => {
    if (selectedAccountId === 'all') {
      return accounts?.floid_accounts.map(acc => acc.id.toString()) || [];
    }
    return [selectedAccountId];
  }, [selectedAccountId, accounts]);

  const getDateRangeForMonth = (monthName: string, year: number) => {
    const monthIndex = months.indexOf(monthName);
    if (monthIndex === -1) return null;

    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0);

    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  };

  const dateRange = useMemo(() =>
    getDateRangeForMonth(selectedMonth, parseInt(selectedYear)),
    [selectedMonth, selectedYear, months]
  );

  const {
    transactions: incomeTransactions,
    loading: incomeLoading,
    refetch: refetchIncome,
    loadMore: loadMoreIncome,
    hasMore: hasMoreIncome
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 10,
    enabled: selectedAccountIds.length > 0,
    start_date: dateRange?.start_date,
    end_date: dateRange?.end_date,
    transaction_type: 'income'
  });

  const {
    transactions: expenseTransactions,
    loading: expenseLoading,
    refetch: refetchExpenses,
    loadMore: loadMoreExpenses,
    hasMore: hasMoreExpenses
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 10,
    enabled: selectedAccountIds.length > 0,
    start_date: dateRange?.start_date,
    end_date: dateRange?.end_date,
    transaction_type: 'outcome'
  });

  const {
    transactions: allIncomeTransactions,
    loading: allIncomeLoading,
    refetch: refetchAllIncome
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: selectedAccountIds.length > 0,
    start_date: dateRange?.start_date,
    end_date: dateRange?.end_date,
    transaction_type: 'income'
  });

  const {
    transactions: allExpenseTransactions,
    loading: allExpenseLoading,
    refetch: refetchAllExpenses
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: selectedAccountIds.length > 0,
    start_date: dateRange?.start_date,
    end_date: dateRange?.end_date,
    transaction_type: 'outcome'
  });

  const transactionsLoading = incomeLoading || expenseLoading;
  const totalsLoading = allIncomeLoading || allExpenseLoading;

  const calculateTotalsFromFloid = (allIncomeData: any, allExpenseData: any) => {
    const incomes = allIncomeData?.transactions || [];
    const expenses = allExpenseData?.transactions || [];

    if (incomes.length === 0 && expenses.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        incomeCount: 0,
        expenseCount: 0,
        hasRealData: false
      };
    }

    const totalIncome = incomes.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum: number, t: any) => sum + parseFloat(t.amount || 0), 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      incomeCount: incomes.length,
      expenseCount: expenses.length,
      hasRealData: true
    };
  };

  const totalsData = useMemo(() => {
    return calculateTotalsFromFloid(allIncomeTransactions, allExpenseTransactions);
  }, [allIncomeTransactions, allExpenseTransactions]);

  const {
    totalIncome,
    totalExpenses,
    balance,
    incomeCount,
    expenseCount,
    hasRealData
  } = totalsData;

  // Handlers
  const handleCollapseIncome = () => {
    refetchIncome();
  };

  const handleCollapseExpenses = () => {
    refetchExpenses();
  };

  const closeModal = () => setShowAddModal(false);

  const handleMonthSelect = (month: string) => setSelectedMonth(month);

  const handleIntegrarDatos = () => router.push('/(tabs)/budget/floid-screen' as any);

  const handleAddTransaction = () => router.push('/(tabs)/budget/transactions/add-transaction' as any);

  const handleCategoriesManager = () => router.push('/(tabs)/budget/categories-manager' as any);

  const handleTransactionPress = (item: any) => {
    const transaction = item.rawData;
    console.log('[useBudgetOverview] Transaction pressed:', transaction.id);
    router.push({
      pathname: '/(tabs)/budget/transactions/edit-transaction' as any,
      params: {
        id: transaction.id.toString()
      }
    });
  };

  const handleTransactionDelete = (item: any) => {
    setTransactionToDelete(item);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!transactionToDelete) return;
    if (!accessToken) {
      Alert.alert('Error', 'Sesión no disponible. Intenta nuevamente.');
      return;
    }

    setIsDeleting(true);

    try {
      await deleteFloidTransaction(
        { transactionId: transactionToDelete.rawData.id.toString() },
        accessToken
      );

      await Promise.all([
        refetchIncome(),
        refetchExpenses(),
        refetchAllIncome(),
        refetchAllExpenses()
      ]);

      setShowDeleteModal(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      Alert.alert('Error', t('budget.error_deleting_transaction'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setTransactionToDelete(null);
  };

  const handleSyncComplete = () => {
    setShowBudgetSkeletons(true);

    const skeletonTimer = setTimeout(async () => {
      setShowBudgetSkeletons(false);

      try {
        await Promise.all([
          refetchAccounts(),
          refetchIncome(),
          refetchExpenses(),
          refetchAllIncome(),
          refetchAllExpenses()
        ]);
      } catch (error) {
        console.error('Error refreshing data after sync:', error);
      }
    }, 60000);

    return () => clearTimeout(skeletonTimer);
  };

  // Effects
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          await Promise.all([
            refetchAccounts(),
            refetchIncome(),
            refetchExpenses(),
            refetchAllIncome(),
            refetchAllExpenses()
          ]);
        } catch (error) {
          console.error('Error refreshing budget data:', error);
        }
      };

      refreshData();
    }, [])
  );

  useEffect(() => {
    if (showAddModal) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [showAddModal]);

  // Computed values
  const hasDataForChart = hasRealData && (totalIncome > 0 || totalExpenses > 0);

  const tabs = [
    { key: 'income', label: t('budget.income'), badge: incomeCount.toString() },
    { key: 'expenses', label: t('budget.expenses'), badge: expenseCount.toString() }
  ];

  const shouldShowSkeletons = totalsLoading || isSyncing || showBudgetSkeletons;
  const shouldShowTransactionSkeletons = transactionsLoading || isSyncing || showBudgetSkeletons;

  return {
    // State
    selectedMonth,
    selectedYear,
    activeTab,
    searchQuery,
    selectedCategory,
    showAddModal,
    modalVisible,
    showBudgetSkeletons,
    showDeleteModal,
    transactionToDelete,
    isDeleting,
    selectedAccountId,

    // Animations
    overlayAnim,
    slideAnim,

    // Data
    accounts,
    accountOptions,
    monthOptions,
    yearOptions,
    incomeTransactions,
    expenseTransactions,
    totalIncome,
    totalExpenses,
    balance,
    incomeCount,
    expenseCount,
    hasRealData,
    hasDataForChart,
    tabs,

    // Loading states
    subscriptionLoading,
    accountsLoading,
    transactionsLoading,
    totalsLoading,
    shouldShowSkeletons,
    shouldShowTransactionSkeletons,
    incomeLoading,
    expenseLoading,
    isSyncing,

    // Pagination
    hasMoreIncome,
    hasMoreExpenses,
    loadMoreIncome,
    loadMoreExpenses,

    // Computed values
    chartSize,
    contentWidth,
    shouldBlockTab,

    // Handlers
    setActiveTab,
    setSearchQuery,
    setSelectedCategory,
    setShowAddModal,
    setSelectedAccountId,
    setSelectedMonth,
    setSelectedYear,
    closeModal,
    handleMonthSelect,
    handleIntegrarDatos,
    handleAddTransaction,
    handleCategoriesManager,
    handleTransactionPress,
    handleTransactionDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleCollapseIncome,
    handleCollapseExpenses,
    stopSync,
    handleSyncComplete,

    t,
  };
}
