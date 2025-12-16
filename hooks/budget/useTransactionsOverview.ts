import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Animated, Dimensions, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useFloidAccounts } from './useFloidAccounts';
import { useBankAccounts } from './useBankAccounts';
import { useFloidTransactions } from './useFloidTransactions';
import { useManualTransactions } from './useManualTransactions';
import { useTransactionMode } from '@/providers/TransactionModeProvider';
import { useBudgetDate } from '@/providers/BudgetDateProvider';
import { deleteFloidTransaction } from '@/services/budget/transactions/delete-floid-transaction';
import { deleteManualTransaction } from '@/services/budget/transactions/manual-transactions';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useFloidSync } from '@/providers/FloidSyncProvider';
import { useTranslation } from 'react-i18next';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface UseTransactionsOverviewOptions {
  initialAccountId?: string;
}

export function useTransactionsOverview(options: UseTransactionsOverviewOptions = {}) {
  const { initialAccountId } = options;
  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();
  const { isSyncing, stopSync } = useFloidSync();
  const { accessToken } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const { mode, loading: modeLoading, hasFloidAccounts, hasBankAccounts, refetchAccounts: refetchModeAccounts } = useTransactionMode();

  // Use shared budget date context
  const {
    selectedMonth: contextSelectedMonth,
    selectedYear: contextSelectedYear,
    getMonthDateRange,
    setSelectedDate,
  } = useBudgetDate();

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

  const yearOptions = useMemo(() => [
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' }
  ], []);

  // Use context values for month/year (synced with budget section)
  const selectedMonth = contextSelectedMonth;
  const selectedYear = contextSelectedYear;
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

  // Data fetching - Floid accounts
  const { accounts: floidAccounts, loading: floidAccountsLoading, refetch: refetchFloidAccounts } = useFloidAccounts();

  // Data fetching - Bank accounts
  const { accounts: bankAccounts, loading: bankAccountsLoading, refetch: refetchBankAccounts } = useBankAccounts();

  // Account options based on mode
  const accountOptions = useMemo(() => {
    if (mode === 'floid') {
      if (!floidAccounts || floidAccounts.floid_accounts.length === 0) return [];
      return [
        { label: t('budget.all_accounts', 'Todas las cuentas'), value: 'all' },
        ...floidAccounts.floid_accounts.map(account => ({
          label: `${account.bank} - ${account.account}`,
          value: account.id.toString()
        }))
      ];
    } else if (mode === 'bank_account') {
      if (!bankAccounts || bankAccounts.length === 0) return [];
      return [
        { label: t('budget.all_accounts', 'Todas las cuentas'), value: 'all' },
        ...bankAccounts.map(account => ({
          label: account.label,
          value: account.id.toString()
        }))
      ];
    }
    return [];
  }, [mode, floidAccounts, bankAccounts, t]);

  const accountsLoading = mode === 'floid' ? floidAccountsLoading : bankAccountsLoading;
  const accounts = mode === 'floid' ? floidAccounts : null;

  const [selectedAccountId, setSelectedAccountId] = useState<string>(initialAccountId || 'all');

  // Update selectedAccountId when initialAccountId changes (e.g., when navigating back from add-transaction)
  useEffect(() => {
    if (initialAccountId) {
      setSelectedAccountId(initialAccountId);
    }
  }, [initialAccountId]);

  const selectedAccountIds = useMemo(() => {
    if (mode === 'floid') {
      if (selectedAccountId === 'all') {
        return floidAccounts?.floid_accounts.map(acc => acc.id.toString()) || [];
      }
      return [selectedAccountId];
    }
    return [];
  }, [selectedAccountId, floidAccounts, mode]);

  const selectedBankAccountId = useMemo(() => {
    if (mode === 'bank_account') {
      if (selectedAccountId === 'all') {
        return undefined;
      }
      return parseInt(selectedAccountId);
    }
    return undefined;
  }, [selectedAccountId, mode]);

  // Use shared date range from context
  const dateRange = useMemo(() => getMonthDateRange(), [getMonthDateRange]);

  // Floid Transactions (only when mode is 'floid')
  const {
    transactions: floidIncomeTransactions,
    loading: floidIncomeLoading,
    refetch: refetchFloidIncome,
    loadMore: loadMoreFloidIncome,
    hasMore: hasMoreFloidIncome
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 10,
    enabled: mode === 'floid' && selectedAccountIds.length > 0,
    start_date: dateRange?.start_date,
    end_date: dateRange?.end_date,
    transaction_type: 'income'
  });

  const {
    transactions: floidExpenseTransactions,
    loading: floidExpenseLoading,
    refetch: refetchFloidExpenses,
    loadMore: loadMoreFloidExpenses,
    hasMore: hasMoreFloidExpenses
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 10,
    enabled: mode === 'floid' && selectedAccountIds.length > 0,
    start_date: dateRange?.start_date,
    end_date: dateRange?.end_date,
    transaction_type: 'outcome'
  });

  const {
    transactions: allFloidIncomeTransactions,
    loading: allFloidIncomeLoading,
    refetch: refetchAllFloidIncome
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: mode === 'floid' && selectedAccountIds.length > 0,
    start_date: dateRange?.start_date,
    end_date: dateRange?.end_date,
    transaction_type: 'income'
  });

  const {
    transactions: allFloidExpenseTransactions,
    loading: allFloidExpenseLoading,
    refetch: refetchAllFloidExpenses
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: mode === 'floid' && selectedAccountIds.length > 0,
    start_date: dateRange?.start_date,
    end_date: dateRange?.end_date,
    transaction_type: 'outcome'
  });

  // Manual Transactions (only when mode is 'bank_account')
  const {
    transactions: manualIncomeTransactions,
    loading: manualIncomeLoading,
    refetch: refetchManualIncome,
    loadMore: loadMoreManualIncome,
    hasMore: hasMoreManualIncome,
    totalIncome: manualTotalIncome
  } = useManualTransactions({
    bankAccountId: selectedBankAccountId,
    startDate: dateRange?.start_date,
    endDate: dateRange?.end_date,
    transactionType: 'income',
    autoFetch: mode === 'bank_account'
  });

  const {
    transactions: manualExpenseTransactions,
    loading: manualExpenseLoading,
    refetch: refetchManualExpenses,
    loadMore: loadMoreManualExpenses,
    hasMore: hasMoreManualExpenses,
    totalExpense: manualTotalExpense
  } = useManualTransactions({
    bankAccountId: selectedBankAccountId,
    startDate: dateRange?.start_date,
    endDate: dateRange?.end_date,
    transactionType: 'expense',
    autoFetch: mode === 'bank_account'
  });

  // Transform manual transactions to match Floid format for display
  const transformManualToFloidFormat = useCallback((manualTxs: any[], type: 'income' | 'expense') => {
    return {
      transactions: manualTxs.map(tx => ({
        id: tx.id,
        transaction_id: `manual_${tx.id}`,
        date: tx.date,
        amount: type === 'income' ? tx.amount_in : tx.amount_out,
        description: tx.description,
        bank: tx.bank_account?.bank_name || 'Cuenta manual',
        account_number: tx.bank_account?.account_number || '',
        // Map user_category to category format expected by TransactionsList
        category: tx.user_category ? {
          id: tx.user_category.id,
          name: tx.user_category.name,
          kind: tx.user_category.kind,
          emoji_code: tx.user_category.emoji_code
        } : null,
        transaction_type: type === 'income' ? 'income' : 'outcome',
        // For manual transactions: categorized = has category, auto_category = false (always manual)
        categorized: !!tx.user_category,
        auto_category: false,
        is_manual: true, // Flag to identify manual transactions
        rawData: tx // Keep original data for editing/deleting
      })),
      pagination: {
        current_page: 1,
        total_count: manualTxs.length,
        total_pages: 1,
        has_next_page: false,
        has_previous_page: false
      }
    };
  }, []);

  // Unified transaction data based on mode
  const incomeTransactions = useMemo(() => {
    if (mode === 'floid') {
      return floidIncomeTransactions;
    } else if (mode === 'bank_account') {
      return transformManualToFloidFormat(manualIncomeTransactions, 'income');
    }
    return null;
  }, [mode, floidIncomeTransactions, manualIncomeTransactions, transformManualToFloidFormat]);

  const expenseTransactions = useMemo(() => {
    if (mode === 'floid') {
      return floidExpenseTransactions;
    } else if (mode === 'bank_account') {
      return transformManualToFloidFormat(manualExpenseTransactions, 'expense');
    }
    return null;
  }, [mode, floidExpenseTransactions, manualExpenseTransactions, transformManualToFloidFormat]);

  // Loading states based on mode
  const incomeLoading = mode === 'floid' ? floidIncomeLoading : manualIncomeLoading;
  const expenseLoading = mode === 'floid' ? floidExpenseLoading : manualExpenseLoading;
  const transactionsLoading = incomeLoading || expenseLoading;
  const totalsLoading = mode === 'floid'
    ? (allFloidIncomeLoading || allFloidExpenseLoading)
    : (manualIncomeLoading || manualExpenseLoading);

  // Pagination based on mode
  const hasMoreIncome = mode === 'floid' ? hasMoreFloidIncome : hasMoreManualIncome;
  const hasMoreExpenses = mode === 'floid' ? hasMoreFloidExpenses : hasMoreManualExpenses;

  const loadMoreIncome = mode === 'floid' ? loadMoreFloidIncome : loadMoreManualIncome;
  const loadMoreExpenses = mode === 'floid' ? loadMoreFloidExpenses : loadMoreManualExpenses;

  // Calculate totals based on mode
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
    if (mode === 'floid') {
      return calculateTotalsFromFloid(allFloidIncomeTransactions, allFloidExpenseTransactions);
    } else if (mode === 'bank_account') {
      const incomeCount = manualIncomeTransactions.length;
      const expenseCount = manualExpenseTransactions.length;
      return {
        totalIncome: manualTotalIncome,
        totalExpenses: manualTotalExpense,
        balance: manualTotalIncome - manualTotalExpense,
        incomeCount,
        expenseCount,
        hasRealData: incomeCount > 0 || expenseCount > 0
      };
    }
    return {
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      incomeCount: 0,
      expenseCount: 0,
      hasRealData: false
    };
  }, [mode, allFloidIncomeTransactions, allFloidExpenseTransactions, manualIncomeTransactions, manualExpenseTransactions, manualTotalIncome, manualTotalExpense]);

  const {
    totalIncome,
    totalExpenses,
    balance,
    incomeCount,
    expenseCount,
    hasRealData
  } = totalsData;

  // Refetch functions based on mode - use callbacks to always check current mode
  const refetchAccounts = useCallback(() => {
    return mode === 'floid' ? refetchFloidAccounts() : refetchBankAccounts();
  }, [mode, refetchFloidAccounts, refetchBankAccounts]);

  const refetchIncome = useCallback(() => {
    if (mode === 'floid') {
      return refetchFloidIncome();
    } else if (mode === 'bank_account') {
      return refetchManualIncome();
    }
    return Promise.resolve();
  }, [mode, refetchFloidIncome, refetchManualIncome]);

  const refetchExpenses = useCallback(() => {
    if (mode === 'floid') {
      return refetchFloidExpenses();
    } else if (mode === 'bank_account') {
      return refetchManualExpenses();
    }
    return Promise.resolve();
  }, [mode, refetchFloidExpenses, refetchManualExpenses]);

  const refetchAllIncome = useCallback(() => {
    if (mode === 'floid') {
      return refetchAllFloidIncome();
    } else if (mode === 'bank_account') {
      return refetchManualIncome();
    }
    return Promise.resolve();
  }, [mode, refetchAllFloidIncome, refetchManualIncome]);

  const refetchAllExpenses = useCallback(() => {
    if (mode === 'floid') {
      return refetchAllFloidExpenses();
    } else if (mode === 'bank_account') {
      return refetchManualExpenses();
    }
    return Promise.resolve();
  }, [mode, refetchAllFloidExpenses, refetchManualExpenses]);

  // Handlers
  const handleCollapseIncome = () => {
    refetchIncome();
  };

  const handleCollapseExpenses = () => {
    refetchExpenses();
  };

  const closeModal = () => setShowAddModal(false);

  // Handle month selection - updates shared context
  const handleMonthSelect = useCallback((month: string) => {
    const monthIndex = months.indexOf(month);
    if (monthIndex !== -1) {
      const year = parseInt(selectedYear);
      setSelectedDate(new Date(year, monthIndex, 1));
    }
  }, [months, selectedYear, setSelectedDate]);

  // Handle year selection - updates shared context
  const handleYearSelect = useCallback((year: string) => {
    const monthIndex = months.indexOf(selectedMonth);
    if (monthIndex !== -1) {
      setSelectedDate(new Date(parseInt(year), monthIndex, 1));
    }
  }, [months, selectedMonth, setSelectedDate]);

  const handleIntegrarDatos = () => router.push('/(tabs)/budget/transactions/floid-screen' as any);

  const handleAddTransaction = () => router.push('/(tabs)/budget/transactions/add-transaction' as any);

  const handleAddIncome = () => router.push({
    pathname: '/(tabs)/budget/transactions/add-transaction' as any,
    params: { type: 'income' }
  });

  const handleAddExpense = () => router.push({
    pathname: '/(tabs)/budget/transactions/add-transaction' as any,
    params: { type: 'expense' }
  });

  const handleCategoriesManager = () => router.push('/(tabs)/budget/transactions/categories-manager' as any);

  const handleTransactionPress = (item: any) => {
    const transaction = item.rawData || item;
    const isManual = item.is_manual || transaction.is_manual;

    console.log('[useTransactionsOverview] Transaction pressed:', transaction.id, 'isManual:', isManual);

    router.push({
      pathname: '/(tabs)/budget/transactions/edit-transaction' as any,
      params: {
        id: transaction.id.toString(),
        isManual: isManual ? 'true' : 'false'
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
      Alert.alert('Error', 'Sesion no disponible. Intenta nuevamente.');
      return;
    }

    setIsDeleting(true);

    try {
      const transaction = transactionToDelete.rawData || transactionToDelete;
      const isManual = transactionToDelete.is_manual || transaction.is_manual || mode === 'bank_account';

      if (isManual) {
        await deleteManualTransaction(transaction.id, accessToken);
      } else {
        await deleteFloidTransaction(
          { transactionId: transaction.id.toString() },
          accessToken
        );
      }

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
        // First refresh the mode accounts to update the mode (floid vs bank_account)
        await refetchModeAccounts();

        // Then refresh the transaction data
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
          // Refresh mode accounts first to ensure correct mode
          await refetchModeAccounts();

          // Then refresh transaction data
          await Promise.all([
            refetchAccounts(),
            refetchIncome(),
            refetchExpenses(),
            refetchAllIncome(),
            refetchAllExpenses()
          ]);
        } catch (error) {
          console.error('Error refreshing transactions data:', error);
        }
      };

      refreshData();
    }, [mode])
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
  const tabs = [
    { key: 'income', label: t('budget.income'), badge: incomeCount.toString() },
    { key: 'expenses', label: t('budget.expenses'), badge: expenseCount.toString() }
  ];

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

    // Transaction mode
    mode,
    modeLoading,
    hasFloidAccounts,
    hasBankAccounts,

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
    tabs,

    // Loading states
    subscriptionLoading,
    accountsLoading,
    transactionsLoading,
    totalsLoading,
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
    closeModal,
    handleMonthSelect,
    handleYearSelect,
    handleIntegrarDatos,
    handleAddTransaction,
    handleAddIncome,
    handleAddExpense,
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
