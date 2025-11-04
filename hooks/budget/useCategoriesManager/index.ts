import { useState, useMemo, useRef } from 'react';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFloidTransactions } from '@/hooks/budget/useFloidTransactions';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
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

  // Expansion state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Refs for scroll
  const scrollViewRef = useRef<any>(null);
  const categoryCardRefs = useRef<Map<string, any>>(new Map()).current;
  const subcategoryCardRefs = useRef<Map<string, any>>(new Map()).current;
  const cardPositions = useRef<Map<string, number>>(new Map()).current;

  // Get accounts
  const { accounts } = useFloidAccounts();
  const selectedAccountIds = useMemo(
    () => accounts?.floid_accounts.map(acc => acc.id.toString()) || [],
    [accounts?.floid_accounts]
  );

  // Get transactions
  const {
    transactions: incomeTransactionsData,
    loading: incomeLoading,
    refetch: refetchIncomeTransactions,
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: selectedAccountIds.length > 0,
    transaction_type: 'income'
  });

  const {
    transactions: expenseTransactionsData,
    loading: expenseLoading,
    refetch: refetchExpenseTransactions,
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: selectedAccountIds.length > 0,
    transaction_type: 'outcome'
  });

  const allTransactionsData = activeTab === 'income' ? incomeTransactionsData : expenseTransactionsData;
  const allTransactions = allTransactionsData?.transactions || [];

  // Refetch both transaction types
  const refetchTransactions = async () => {
    await Promise.all([
      refetchIncomeTransactions(),
      refetchExpenseTransactions()
    ]);
  };

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
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  // Toggle functions with animations
  const toggleCategory = (categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = new Set(expandedCategories);
    const isExpanding = !newExpanded.has(categoryId);

    animations.animateRotation(categoryId, true, isExpanding);

    if (isExpanding) {
      newExpanded.add(categoryId);
    } else {
      newExpanded.delete(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const newExpanded = new Set(expandedSubcategories);
    const isExpanding = !newExpanded.has(subcategoryId);

    animations.animateRotation(subcategoryId, false, isExpanding);

    if (isExpanding) {
      newExpanded.add(subcategoryId);
    } else {
      newExpanded.delete(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
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
  const showSuccessMessage =
    transactionSelection.showSuccessMessage ||
    selection.showSuccessMessage ||
    creation.showSuccessMessage ||
    editing.showSuccessMessage;

  const successMessage =
    transactionSelection.showSuccessMessage ? 'Transacciones categorizadas correctamente' :
    selection.showSuccessMessage ? selection.successMessage :
    creation.showSuccessMessage ? creation.successMessage :
    editing.showSuccessMessage ? editing.successMessage :
    '';

  return {
    activeTab,
    expandedCategories,
    expandedSubcategories,
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
    getRotateStyle: animations.getRotateStyle,

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

    t,
  };
}
