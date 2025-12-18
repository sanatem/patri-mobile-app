import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useFloidTransactions } from '@/hooks/budget/useFloidTransactions';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { useManualTransactions } from '@/hooks/budget/useManualTransactions';
import { useTransactionMode } from '@/providers/TransactionModeProvider';
import { assignTransactionCategory } from '@/services/budget/transactions/assign-transaction-category';
import { updateManualTransaction } from '@/services/budget/transactions/manual-transactions';
import type { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface UseBudgetDetailUncategorizedProps {
  budgetCategoryId: number | null;
  budgetCategoryKind: 'expense' | 'income' | null;
}

export function useBudgetDetailUncategorized({
  budgetCategoryId,
  budgetCategoryKind,
}: UseBudgetDetailUncategorizedProps) {
  const { accessToken } = useAuth();
  const { mode } = useTransactionMode();

  // Get Floid accounts
  const { accounts } = useFloidAccounts();
  const selectedAccountIds = useMemo(
    () => accounts?.floid_accounts.map(acc => acc.id.toString()) || [],
    [accounts?.floid_accounts]
  );

  // Determine transaction type based on budget category kind
  const transactionType = budgetCategoryKind === 'income' ? 'income' : 'outcome';

  // Get Floid transactions
  const {
    transactions: floidTransactionsData,
    loading: floidLoading,
    refetch: refetchFloidTransactions,
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: mode === 'floid' && selectedAccountIds.length > 0 && budgetCategoryKind !== null,
    transaction_type: transactionType,
  });

  // Get manual transactions
  const {
    transactions: manualTransactionsData,
    loading: manualLoading,
    refetch: refetchManualTransactions,
  } = useManualTransactions({
    transactionType: budgetCategoryKind === 'income' ? 'income' : 'expense',
    perPage: 1000,
    autoFetch: mode === 'bank_account' && budgetCategoryKind !== null,
  });

  // Transform manual transactions to match Floid format
  const transformManualTransactions = useCallback((manualTxs: any[], type: 'income' | 'expense'): FloidTransaction[] => {
    return manualTxs.map(tx => ({
      id: tx.id,
      transaction_id: `manual_${tx.id}`,
      date: tx.date,
      balance: 0,
      amount: type === 'income' ? tx.amount_in : tx.amount_out,
      description: tx.description,
      bank: tx.bank_account?.bank_name || 'Cuenta manual',
      account_number: tx.bank_account?.account_number || '',
      category: tx.user_category ? {
        id: tx.user_category.id,
        name: tx.user_category.name,
        translated_name: tx.user_category.name,
        kind: tx.user_category.kind === 'income' ? 'income' : 'expense',
        emoji_code: tx.user_category.emoji_code
      } : null,
      transaction_type: type === 'income' ? 'income' as const : 'outcome' as const,
      categorized: !!tx.user_category,
      auto_category: false,
    }));
  }, []);

  // Unified transactions based on mode
  const allTransactions: FloidTransaction[] = useMemo(() => {
    if (mode === 'floid') {
      return floidTransactionsData?.transactions || [];
    } else if (mode === 'bank_account') {
      return transformManualTransactions(
        manualTransactionsData,
        budgetCategoryKind === 'income' ? 'income' : 'expense'
      );
    }
    return [];
  }, [mode, floidTransactionsData, manualTransactionsData, budgetCategoryKind, transformManualTransactions]);

  // Filter uncategorized transactions
  const uncategorizedTransactions = useMemo(() => {
    return allTransactions.filter((t: FloidTransaction) => !t.category || !t.category.id);
  }, [allTransactions]);

  // State for selection
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [transactionSelectionMode, setTransactionSelectionMode] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [assigningCategories, setAssigningCategories] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Animation refs
  const transactionAnimations = useRef(new Map<number, Animated.Value>()).current;
  const categoryRotations = useRef(new Map<string, Animated.Value>()).current;
  const categoryExpansions = useRef(new Map<string, Animated.Value>()).current;

  // Initialize animation for uncategorized
  useEffect(() => {
    if (!categoryRotations.has('uncategorized')) {
      categoryRotations.set('uncategorized', new Animated.Value(0));
    }
    if (!categoryExpansions.has('uncategorized')) {
      categoryExpansions.set('uncategorized', new Animated.Value(0));
    }
  }, []);

  // Get rotate style
  const getRotateStyle = useCallback((key: string, isCategory: boolean = true) => {
    const rotations = isCategory ? categoryRotations : categoryRotations;
    const rotation = rotations.get(key);

    if (!rotation) {
      return { transform: [{ rotate: '0deg' }] };
    }

    return {
      transform: [{
        rotate: rotation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '180deg']
        })
      }]
    };
  }, [categoryRotations]);

  // Get expansion style
  const getExpansionStyle = useCallback((key: string, isCategory: boolean = true) => {
    const expansions = isCategory ? categoryExpansions : categoryExpansions;
    const expansion = expansions.get(key);

    if (!expansion) {
      return { opacity: 0, maxHeight: 0 };
    }

    return {
      opacity: expansion.interpolate({
        inputRange: [0, 0.3, 1],
        outputRange: [0, 0.6, 1]
      }),
      maxHeight: expansion.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 10000]
      })
    };
  }, [categoryExpansions]);

  // Animate transaction selection
  const animateTransactionSelection = useCallback((transactionId: number, selected: boolean) => {
    if (!transactionAnimations.has(transactionId)) {
      transactionAnimations.set(transactionId, new Animated.Value(selected ? 1 : 0));
    }

    Animated.spring(transactionAnimations.get(transactionId)!, {
      toValue: selected ? 1 : 0,
      useNativeDriver: true,
      tension: 40,
      friction: 8
    }).start();
  }, [transactionAnimations]);

  // Batch animate transaction selections
  const batchAnimateTransactionSelections = useCallback((ids: number[], selected: boolean) => {
    ids.forEach(id => {
      animateTransactionSelection(id, selected);
    });
  }, [animateTransactionSelection]);

  // Handle transaction press
  const handleTransactionPress = useCallback((transactionId: number) => {
    const newSelected = new Set(selectedTransactions);
    const isCurrentlySelected = newSelected.has(transactionId);

    if (isCurrentlySelected) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);

    animateTransactionSelection(transactionId, !isCurrentlySelected);

    if (newSelected.size > 0 && !transactionSelectionMode) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(true);
    } else if (newSelected.size === 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(false);
    }
  }, [selectedTransactions, transactionSelectionMode, animateTransactionSelection]);

  // Cancel transaction selection
  const handleCancelTransactionSelection = useCallback(() => {
    const transactionIds = Array.from(selectedTransactions);
    batchAnimateTransactionSelections(transactionIds, false);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTransactionSelectionMode(false);
    setSelectedTransactions(new Set());
  }, [selectedTransactions, batchAnimateTransactionSelections]);

  // Select all transactions
  const handleSelectAllTransactions = useCallback(() => {
    const allTransactionIds = new Set<number>(uncategorizedTransactions.map((t: FloidTransaction) => t.id));

    batchAnimateTransactionSelections(Array.from(allTransactionIds), true);
    setSelectedTransactions(allTransactionIds);

    if (!transactionSelectionMode && allTransactionIds.size > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(true);
    }
  }, [uncategorizedTransactions, transactionSelectionMode, batchAnimateTransactionSelections]);

  // Deselect all transactions
  const handleDeselectAllTransactions = useCallback(() => {
    const transactionIds = Array.from(selectedTransactions);
    batchAnimateTransactionSelections(transactionIds, false);
    setSelectedTransactions(new Set());
  }, [selectedTransactions, batchAnimateTransactionSelections]);

  // Toggle uncategorized list
  const toggleUncategorizedList = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // Show categorize modal
  const handleCategorize = useCallback(() => {
    setShowMoveModal(true);
  }, []);

  // Close modal
  const handleCloseMoveModal = useCallback(() => {
    setShowMoveModal(false);
  }, []);

  // Refetch transactions
  const refetchTransactions = useCallback(async () => {
    if (mode === 'floid') {
      await refetchFloidTransactions();
    } else if (mode === 'bank_account') {
      await refetchManualTransactions();
    }
  }, [mode, refetchFloidTransactions, refetchManualTransactions]);

  // Confirm categorization with budget's category
  const confirmCategorization = useCallback(async () => {
    if (!accessToken || !budgetCategoryId) {
      console.error('No access token or budget category available');
      return;
    }

    try {
      setAssigningCategories(true);

      const transactionIds = Array.from(selectedTransactions);

      if (mode === 'floid') {
        await assignTransactionCategory(
          {
            transaction_ids: transactionIds,
            user_category_id: budgetCategoryId,
            auto_category: false
          },
          accessToken
        );
      } else if (mode === 'bank_account') {
        const updatePromises = transactionIds.map(id =>
          updateManualTransaction(
            id,
            { user_category_id: budgetCategoryId },
            accessToken
          )
        );
        await Promise.all(updatePromises);
      }

      await refetchTransactions();

      batchAnimateTransactionSelections(transactionIds, false);

      setShowMoveModal(false);

      const count = transactionIds.length;
      setSuccessMessage(`${count} ${count === 1 ? 'transacción categorizada' : 'transacciones categorizadas'} correctamente`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(false);
      setSelectedTransactions(new Set());

    } catch (error) {
      console.error('Error assigning categories to transactions:', error);
    } finally {
      setAssigningCategories(false);
    }
  }, [
    accessToken,
    budgetCategoryId,
    selectedTransactions,
    mode,
    refetchTransactions,
    batchAnimateTransactionSelections
  ]);

  const loading = floidLoading || manualLoading;

  return {
    // Data
    uncategorizedTransactions,
    loading,

    // Selection state
    selectedTransactions,
    transactionSelectionMode,
    isExpanded,
    showMoveModal,
    assigningCategories,
    showSuccessMessage,
    successMessage,

    // Animation refs
    transactionAnimations,
    categoryRotations,
    categoryExpansions,

    // Functions
    getRotateStyle,
    getExpansionStyle,
    handleTransactionPress,
    handleCancelTransactionSelection,
    handleSelectAllTransactions,
    handleDeselectAllTransactions,
    toggleUncategorizedList,
    handleCategorize,
    handleCloseMoveModal,
    confirmCategorization,
    refetchTransactions,
  };
}
