import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import { useFloidTransactions } from '@/hooks/budget/useFloidTransactions';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { useManualTransactions } from '@/hooks/budget/useManualTransactions';
import { useTransactionMode } from '@/providers/TransactionModeProvider';
import { UserCategoriesState } from '../useUserCategories';
import { useCategoriesData } from './useCategoriesData';
import { useCategoryAnimations } from './useCategoryAnimations';
import { useCategorySelection } from './useCategorySelection';
import { useTransactionSelection } from './useTransactionSelection';
import { useCategoryEditing } from './useCategoryEditing';
import { useCategoryCreation } from './useCategoryCreation';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface UseCategoriesManagerProps {
  userCategories: UserCategoriesState;
}

export function useCategoriesManager({ userCategories }: UseCategoriesManagerProps) {
  const { t } = useTranslation();

  // Tab state
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');

  // Transaction list active/expanded state
  const [activeTransactionList, setActiveTransactionList] = useState<'uncategorized' | 'categorized'>('uncategorized');
  const [isUncategorizedExpanded, setIsUncategorizedExpanded] = useState(false);
  const [isCategorizedExpanded, setIsCategorizedExpanded] = useState(false);
  // Control when content should be visible (prevents flash when switching cards)
  const [shouldShowUncategorizedContent, setShouldShowUncategorizedContent] = useState(false);
  const [shouldShowCategorizedContent, setShouldShowCategorizedContent] = useState(false);

  // Expansion state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Refs for scroll
  const scrollViewRef = useRef<any>(null);
  const categoryCardRefs = useRef<Map<string, any>>(new Map()).current;
  const subcategoryCardRefs = useRef<Map<string, any>>(new Map()).current;
  const cardPositions = useRef<Map<string, number>>(new Map()).current;

  // Get transaction mode
  const { mode, refetchAccounts: refetchModeAccounts } = useTransactionMode();

  // Get Floid accounts
  const { accounts } = useFloidAccounts();
  const selectedAccountIds = useMemo(
    () => accounts?.floid_accounts.map(acc => acc.id.toString()) || [],
    [accounts?.floid_accounts]
  );

  // Get Floid transactions (only when mode is 'floid')
  const {
    transactions: floidIncomeTransactionsData,
    loading: floidIncomeLoading,
    refetch: refetchFloidIncomeTransactions,
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: mode === 'floid' && selectedAccountIds.length > 0,
    transaction_type: 'income'
  });

  const {
    transactions: floidExpenseTransactionsData,
    loading: floidExpenseLoading,
    refetch: refetchFloidExpenseTransactions,
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: mode === 'floid' && selectedAccountIds.length > 0,
    transaction_type: 'outcome'
  });

  // Get manual transactions (only when mode is 'bank_account')
  const {
    transactions: manualIncomeTransactions,
    loading: manualIncomeLoading,
    refetch: refetchManualIncomeTransactions,
  } = useManualTransactions({
    transactionType: 'income',
    perPage: 1000,
    autoFetch: mode === 'bank_account'
  });

  const {
    transactions: manualExpenseTransactions,
    loading: manualExpenseLoading,
    refetch: refetchManualExpenseTransactions,
  } = useManualTransactions({
    transactionType: 'expense',
    perPage: 1000,
    autoFetch: mode === 'bank_account'
  });

  // Transform manual transactions to match Floid format
  const transformManualTransactions = useCallback((manualTxs: any[], type: 'income' | 'expense') => {
    return manualTxs.map(tx => ({
      id: tx.id,
      transaction_id: `manual_${tx.id}`,
      date: tx.date,
      amount: type === 'income' ? tx.amount_in : tx.amount_out,
      description: tx.description,
      bank: tx.bank_account?.bank_name || 'Cuenta manual',
      account_number: tx.bank_account?.account_number || '',
      category: tx.user_category ? {
        id: tx.user_category.id,
        name: tx.user_category.name,
        kind: tx.user_category.kind,
        emoji_code: tx.user_category.emoji_code
      } : null,
      transaction_type: type === 'income' ? 'income' : 'outcome',
      categorized: !!tx.user_category,
      auto_category: false,
      is_manual: true,
      rawData: tx
    }));
  }, []);

  // Unified transactions based on mode
  const incomeTransactionsData = useMemo(() => {
    if (mode === 'floid') {
      return floidIncomeTransactionsData;
    } else if (mode === 'bank_account') {
      return {
        transactions: transformManualTransactions(manualIncomeTransactions, 'income')
      };
    }
    return { transactions: [] };
  }, [mode, floidIncomeTransactionsData, manualIncomeTransactions, transformManualTransactions]);

  const expenseTransactionsData = useMemo(() => {
    if (mode === 'floid') {
      return floidExpenseTransactionsData;
    } else if (mode === 'bank_account') {
      return {
        transactions: transformManualTransactions(manualExpenseTransactions, 'expense')
      };
    }
    return { transactions: [] };
  }, [mode, floidExpenseTransactionsData, manualExpenseTransactions, transformManualTransactions]);

  const incomeLoading = mode === 'floid' ? floidIncomeLoading : manualIncomeLoading;
  const expenseLoading = mode === 'floid' ? floidExpenseLoading : manualExpenseLoading;

  const allTransactionsData = activeTab === 'income' ? incomeTransactionsData : expenseTransactionsData;
  const allTransactions = allTransactionsData?.transactions || [];

  // Refetch both transaction types based on mode
  const refetchTransactions = useCallback(async () => {
    if (mode === 'floid') {
      await Promise.all([
        refetchFloidIncomeTransactions(),
        refetchFloidExpenseTransactions()
      ]);
    } else if (mode === 'bank_account') {
      await Promise.all([
        refetchManualIncomeTransactions(),
        refetchManualExpenseTransactions()
      ]);
    }
  }, [mode, refetchFloidIncomeTransactions, refetchFloidExpenseTransactions, refetchManualIncomeTransactions, refetchManualExpenseTransactions]);

  // Refresh mode and transactions when screen gains focus
  useFocusEffect(
    useCallback(() => {
      const refreshData = async () => {
        try {
          // Refresh mode accounts first to ensure correct mode
          await refetchModeAccounts();
          // Then refresh transactions
          await refetchTransactions();
        } catch (error) {
          console.error('Error refreshing categories manager data:', error);
        }
      };
      refreshData();
    }, [mode])
  );

  const currentLang = t('common.language_code', 'es');

  const animations = useCategoryAnimations();

  const categoriesData = useCategoriesData({
    activeTab,
    allTransactions,
    currentLang,
  });

  // Initialize editing hook
  const editing = useCategoryEditing({
    activeTab,
    apiIncomeCategories: categoriesData.apiIncomeCategories,
    apiExpenseCategories: categoriesData.apiExpenseCategories,
    categories: categoriesData.categories,
    currentLang,
    expandedCategories,
    toggleCategory: (categoryId: string) => {
      const newExpanded = new Set(expandedCategories);
      const isExpanding = !newExpanded.has(categoryId);

      animations.animateRotation(categoryId, true, isExpanding);

      if (isExpanding) {
        newExpanded.add(categoryId);
      } else {
        newExpanded.delete(categoryId);
      }
      setExpandedCategories(newExpanded);
    },
    reloadCategories: categoriesData.reloadCategories,
  });

  // Initialize creation hook
  const creation = useCategoryCreation({
    activeTab,
    apiIncomeCategories: categoriesData.apiIncomeCategories,
    apiExpenseCategories: categoriesData.apiExpenseCategories,
    systemIncomeCategories: categoriesData.systemIncomeCategories,
    systemExpenseCategories: categoriesData.systemExpenseCategories,
    reloadCategories: categoriesData.reloadCategories,
    refetchTransactions,
    scrollViewRef,
  });

  // Initialize selection hook
  const selection = useCategorySelection({
    categories: categoriesData.categories,
    groupedData: categoriesData.groupedData,
    animateSelection: animations.animateSelection,
    batchAnimateSelections: animations.batchAnimateSelections,
    reloadCategories: categoriesData.reloadCategories,
    refetchTransactions,
  });

  // Initialize transaction selection hook
  const transactionSelection = useTransactionSelection({
    groupedData: categoriesData.groupedData,
    animateTransactionSelection: animations.animateTransactionSelection,
    batchAnimateTransactionSelections: animations.batchAnimateTransactionSelections,
    refetchTransactions,
  });

  // Clear transaction selections when switching tabs
  useEffect(() => {
    if (transactionSelection.selectedTransactions.size > 0) {
      transactionSelection.handleCancelTransactionSelection();
    }
  }, [activeTab]);

  // Toggle functions with animations
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    const isExpanding = !newExpanded.has(categoryId);

    // Don't call animateRotation here - useEffect will handle it

    if (isExpanding) {
      newExpanded.add(categoryId);
    } else {
      newExpanded.delete(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    const isExpanding = !newExpanded.has(subcategoryId);

    // Don't call animateRotation here - useEffect will handle it

    if (isExpanding) {
      newExpanded.add(subcategoryId);
    } else {
      newExpanded.delete(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  // Toggle transaction lists (uncategorized/categorized)
  const toggleUncategorizedList = () => {
    // If uncategorized is already active, just toggle expansion
    if (activeTransactionList === 'uncategorized') {
      const newExpanded = !isUncategorizedExpanded;
      setIsUncategorizedExpanded(newExpanded);
      setShouldShowUncategorizedContent(newExpanded);
    } else {
      // Switching to uncategorized from categorized
      // STEP 1: Collapse content of currently active card (200ms) if expanded
      if (isCategorizedExpanded) {
        setShouldShowCategorizedContent(false);
        setIsCategorizedExpanded(false);

        // STEP 2: After collapse, switch active card and start horizontal transition (350ms)
        setTimeout(() => {
          setActiveTransactionList('uncategorized');
          // Keep content hidden during horizontal transition
          setShouldShowUncategorizedContent(false);
          setIsUncategorizedExpanded(false);
        }, 200);
      } else {
        // If categorized wasn't expanded, switch immediately (no collapse animation needed)
        setActiveTransactionList('uncategorized');
        setShouldShowUncategorizedContent(false);
        setIsUncategorizedExpanded(false);
      }

      // Always ensure categorized is fully reset
      setIsCategorizedExpanded(false);
      setShouldShowCategorizedContent(false);
    }
  };

  const toggleCategorizedList = () => {
    // If categorized is already active, just toggle expansion
    if (activeTransactionList === 'categorized') {
      const newExpanded = !isCategorizedExpanded;
      setIsCategorizedExpanded(newExpanded);
      setShouldShowCategorizedContent(newExpanded);
    } else {
      // Switching to categorized from uncategorized
      // STEP 1: Collapse content of currently active card (200ms) if expanded
      if (isUncategorizedExpanded) {
        setShouldShowUncategorizedContent(false);
        setIsUncategorizedExpanded(false);

        // STEP 2: After collapse, switch active card and start horizontal transition (350ms)
        setTimeout(() => {
          setActiveTransactionList('categorized');
          // Keep content hidden during horizontal transition
          setShouldShowCategorizedContent(false);
          setIsCategorizedExpanded(false);
        }, 200);
      } else {
        // If uncategorized wasn't expanded, switch immediately (no collapse animation needed)
        setActiveTransactionList('categorized');
        setShouldShowCategorizedContent(false);
        setIsCategorizedExpanded(false);
      }

      // Always ensure uncategorized is fully reset
      setIsUncategorizedExpanded(false);
      setShouldShowUncategorizedContent(false);
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    selection.handleCategoryPress(categoryId, () => toggleCategory(categoryId));
  };

  const handleSubcategoryPress = (subcategoryId: string) => {
    selection.handleSubcategoryPress(subcategoryId, () => toggleSubcategory(subcategoryId));
  };

  const subcategoryOptions = categoriesData.getSubcategoryOptions(
    transactionSelection.selectedDestinationCategory
  );

  const loading = incomeLoading || expenseLoading || categoriesData.categoriesLoading;
  const totalVisibleTransactions = categoriesData.groupedData.uncategorized.length;

  // Combine success messages from different hooks
  // Priority order matters: check most specific operations first
  const showSuccessMessage =
    selection.showSuccessMessage ||
    editing.showSuccessMessage ||
    creation.showSuccessMessage ||
    transactionSelection.showSuccessMessage;

  const successMessage =
    selection.showSuccessMessage ? selection.successMessage :
    editing.showSuccessMessage ? editing.successMessage :
    creation.showSuccessMessage ? creation.successMessage :
    transactionSelection.showSuccessMessage ? transactionSelection.successMessage :
    '';

  return {
    activeTab,
    expandedCategories,
    expandedSubcategories,
    activeTransactionList,
    isUncategorizedExpanded,
    isCategorizedExpanded,
    shouldShowUncategorizedContent,
    shouldShowCategorizedContent,
    loading,
    currentLang,
    totalVisibleTransactions,

    groupedData: categoriesData.groupedData,
    categoryOptions: categoriesData.categoryOptions,
    subcategoryOptions,
    categories: categoriesData.categories,
    availableSystemCategories: categoriesData.availableSystemCategories,
    apiIncomeCategories: categoriesData.apiIncomeCategories,
    apiExpenseCategories: categoriesData.apiExpenseCategories,
    categoriesLoading: categoriesData.categoriesLoading,

    selectionAnimations: animations.selectionAnimations,
    transactionAnimations: animations.transactionAnimations,

    scrollViewRef,
    categoryCardRefs,
    subcategoryCardRefs,

    selectionMode: selection.selectionMode,
    selectedCategories: selection.selectedCategories,
    selectedSubcategories: selection.selectedSubcategories,
    showDeleteModal: selection.showDeleteModal,
    totalTransactionsToUncategorize: selection.totalTransactionsToUncategorize,
    deletingCategories: selection.deletingCategories,

    transactionSelectionMode: transactionSelection.transactionSelectionMode,
    selectedTransactions: transactionSelection.selectedTransactions,
    showMoveModal: transactionSelection.showMoveModal,
    showDeleteTransactionsModal: transactionSelection.showDeleteTransactionsModal,
    selectedDestinationCategory: transactionSelection.selectedDestinationCategory,
    selectedDestinationSubcategory: transactionSelection.selectedDestinationSubcategory,
    showSuccessMessage, // Combined from all hooks
    successMessage, // Combined message text
    assigningCategories: transactionSelection.assigningCategories,
    deletingTransactions: transactionSelection.deletingTransactions,

    editingParentCategoryId: editing.editingParentCategoryId,
    updatingCategory: editing.updatingCategory,
    pendingEdits: editing.pendingEdits,

    creatingNewCategory: creation.creatingNewCategory,
    creatingCustomCategory: creation.creatingCustomCategory,
    creatingCategory: creation.creatingCategory,
    multipleNewCategories: creation.multipleNewCategories,
    multipleCustomCategories: creation.multipleCustomCategories,
    addingSubcategoryForCategoryId: creation.addingSubcategoryForCategoryId,
    multipleNewSubcategories: creation.multipleNewSubcategories,
    multipleCustomSubcategories: creation.multipleCustomSubcategories,

    setActiveTab,
    toggleCategory,
    toggleSubcategory,
    toggleUncategorizedList,
    toggleCategorizedList,

    handleLongPress: selection.handleLongPress,
    handleCategoryLongPress: selection.handleCategoryLongPress,
    handleCategoryPress,
    handleSubcategoryPress,
    handleCancelSelection: selection.handleCancelSelection,
    handleDeleteSelected: selection.handleDeleteSelected,
    confirmDelete: selection.confirmDelete,
    setShowDeleteModal: selection.setShowDeleteModal,

    handleTransactionPress: transactionSelection.handleTransactionPress,
    handleCancelTransactionSelection: transactionSelection.handleCancelTransactionSelection,
    handleDeleteTransactions: transactionSelection.handleDeleteTransactions,
    confirmDeleteTransactions: transactionSelection.confirmDeleteTransactions,
    handleMoveTransactions: transactionSelection.handleMoveTransactions,
    handleCategoryChange: transactionSelection.handleCategoryChange,
    handleSubcategoryChange: transactionSelection.handleSubcategoryChange,
    confirmMoveTransactions: transactionSelection.confirmMoveTransactions,
    handleCloseMoveModal: transactionSelection.handleCloseMoveModal,
    handleSelectAllTransactions: transactionSelection.handleSelectAllTransactions,
    handleDeselectAllTransactions: transactionSelection.handleDeselectAllTransactions,
    setShowDeleteTransactionsModal: transactionSelection.setShowDeleteTransactionsModal,

    handleStartEdit: editing.handleStartEdit,
    handleCancelEdit: editing.handleCancelEdit,
    handleSaveEdit: editing.handleSaveEdit,
    handleEditNameChange: editing.handleEditNameChange,
    handleEditEmojiChange: editing.handleEditEmojiChange,

    handleNewCategory: creation.handleNewCategory,
    handleNewCustomCategory: creation.handleNewCustomCategory,
    handleCancelNewCategory: creation.handleCancelNewCategory,
    handleSelectSystemCategory: creation.handleSelectSystemCategory,
    handleConfirmNewCategory: creation.handleConfirmNewCategory,
    handleConfirmCustomCategory: creation.handleConfirmCustomCategory,
    handleCustomCategoryNameChange: creation.handleCustomCategoryNameChange,
    handleCustomCategoryEmojiChange: creation.handleCustomCategoryEmojiChange,
    handleAddNewCategoryCard: creation.handleAddNewCategoryCard,
    handleRemoveNewCategoryCard: creation.handleRemoveNewCategoryCard,
    getMaxCategoriesAllowed: creation.getMaxCategoriesAllowed,
    canAddMoreSystemCategories: creation.canAddMoreSystemCategories,
    getAvailableCategoriesForCard: creation.getAvailableCategoriesForCard,
    handleAddSubcategory: creation.handleAddSubcategory,
    handleCancelAddSubcategory: creation.handleCancelAddSubcategory,
    handleSelectSystemSubcategory: creation.handleSelectSystemSubcategory,
    handleAddNewSubcategoryCard: creation.handleAddNewSubcategoryCard,
    handleRemoveNewSubcategoryCard: creation.handleRemoveNewSubcategoryCard,
    handleCustomSubcategoryNameChange: creation.handleCustomSubcategoryNameChange,
    handleCustomSubcategoryEmojiChange: creation.handleCustomSubcategoryEmojiChange,
    handleAddNewCustomSubcategoryCard: creation.handleAddNewCustomSubcategoryCard,
    handleRemoveCustomSubcategoryCard: creation.handleRemoveCustomSubcategoryCard,
    handleConfirmNewSubcategories: creation.handleConfirmNewSubcategories,
    getAvailableSubcategoriesForCategory: creation.getAvailableSubcategoriesForCategory,
    canAddMoreSubcategories: creation.canAddMoreSubcategories,
    getMaxSubcategoriesAllowed: creation.getMaxSubcategoriesAllowed,

    getRotateStyle: animations.getRotateStyle,
    getExpansionStyle: animations.getExpansionStyle,
    categoryRotations: animations.categoryRotations,
    categoryExpansions: animations.categoryExpansions,
    subcategoryRotations: animations.subcategoryRotations,
    subcategoryExpansions: animations.subcategoryExpansions,

    t,
  };
}
