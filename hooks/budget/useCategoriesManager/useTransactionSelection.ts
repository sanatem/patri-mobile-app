import { useState } from 'react';
import { LayoutAnimation, Alert } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useTransactionMode, TransactionMode } from '@/providers/TransactionModeProvider';
import { assignTransactionCategory } from '@/services/budget/transactions/assign-transaction-category';
import { deleteFloidTransaction } from '@/services/budget/transactions/delete-floid-transaction';
import { deleteManualTransaction, updateManualTransaction } from '@/services/budget/transactions/manual-transactions';
import type { GroupedData } from './types';

interface UseTransactionSelectionProps {
  groupedData: GroupedData;
  animateTransactionSelection: (id: number, selected: boolean) => void;
  batchAnimateTransactionSelections: (ids: number[], selected: boolean) => void;
  refetchTransactions: () => Promise<void>;
}

export function useTransactionSelection({
  groupedData,
  animateTransactionSelection,
  batchAnimateTransactionSelections,
  refetchTransactions,
}: UseTransactionSelectionProps) {
  const { accessToken } = useAuth();
  const { mode } = useTransactionMode();

  const [transactionSelectionMode, setTransactionSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteTransactionsModal, setShowDeleteTransactionsModal] = useState(false);
  const [selectedDestinationCategory, setSelectedDestinationCategory] = useState<string | null>(null);
  const [selectedDestinationSubcategory, setSelectedDestinationSubcategory] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [assigningCategories, setAssigningCategories] = useState(false);
  const [deletingTransactions, setDeletingTransactions] = useState(false);

  // Handle transaction press (toggle selection)
  const handleTransactionPress = (transactionId: number) => {
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
  };

  // Cancel transaction selection
  const handleCancelTransactionSelection = () => {
    const transactionIds = Array.from(selectedTransactions);
    batchAnimateTransactionSelections(transactionIds, false);

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTransactionSelectionMode(false);
    setSelectedTransactions(new Set());
  };

  // Show delete transactions modal
  const handleDeleteTransactions = () => {
    setShowDeleteTransactionsModal(true);
  };

  // Confirm delete transactions
  const confirmDeleteTransactions = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      setShowDeleteTransactionsModal(false);
      return;
    }

    try {
      setDeletingTransactions(true);

      const transactionIds = Array.from(selectedTransactions);

      // Delete based on mode
      if (mode === 'floid') {
        const deletePromises = transactionIds.map(id =>
          deleteFloidTransaction({ transactionId: id.toString() }, accessToken)
        );
        await Promise.all(deletePromises);
      } else if (mode === 'bank_account') {
        const deletePromises = transactionIds.map(id =>
          deleteManualTransaction(id, accessToken)
        );
        await Promise.all(deletePromises);
      }

      await refetchTransactions();

      batchAnimateTransactionSelections(transactionIds, false);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(false);
      setSelectedTransactions(new Set());

      setShowDeleteTransactionsModal(false);
      setDeletingTransactions(false);

      // Show success message instead of Alert
      const count = transactionIds.length;
      setSuccessMessage(`${count} ${count === 1 ? 'transacción eliminada' : 'transacciones eliminadas'} correctamente`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

    } catch (error) {
      console.error('Error deleting transactions:', error);
      setShowDeleteTransactionsModal(false);
      setDeletingTransactions(false);
      Alert.alert('Error', 'Hubo un problema al eliminar las transacciones. Por favor intenta nuevamente.');
    }
  };

  // Show move transactions modal
  const handleMoveTransactions = () => {
    setShowMoveModal(true);
  };

  // Handle category change in move modal
  const handleCategoryChange = (categoryId: string) => {
    setSelectedDestinationCategory(categoryId);
    setSelectedDestinationSubcategory(null);
  };

  // Handle subcategory change in move modal
  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedDestinationSubcategory(subcategoryId);
  };

  // Confirm move transactions
  const confirmMoveTransactions = async () => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    if (!selectedDestinationCategory) {
      console.error('No destination category selected');
      return;
    }

    try {
      setAssigningCategories(true);

      const categoryId = selectedDestinationSubcategory
        ? parseInt(selectedDestinationSubcategory)
        : parseInt(selectedDestinationCategory);

      const transactionIds = Array.from(selectedTransactions);

      // Assign category based on mode
      if (mode === 'floid') {
        await assignTransactionCategory(
          {
            transaction_ids: transactionIds,
            user_category_id: categoryId,
            auto_category: false
          },
          accessToken
        );
      } else if (mode === 'bank_account') {
        // For manual transactions, update each one individually
        const updatePromises = transactionIds.map(id =>
          updateManualTransaction(
            id,
            { user_category_id: categoryId },
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
      setSelectedDestinationCategory(null);
      setSelectedDestinationSubcategory(null);

    } catch (error) {
      console.error('Error assigning categories to transactions:', error);
    } finally {
      setAssigningCategories(false);
    }
  };

  // Close move modal
  const handleCloseMoveModal = () => {
    setShowMoveModal(false);
    setSelectedDestinationCategory(null);
    setSelectedDestinationSubcategory(null);
  };

  // Select all uncategorized transactions
  const handleSelectAllTransactions = () => {
    const allTransactionIds = new Set<number>(groupedData.uncategorized.map(t => t.id));

    batchAnimateTransactionSelections(Array.from(allTransactionIds), true);

    setSelectedTransactions(allTransactionIds);

    if (!transactionSelectionMode && allTransactionIds.size > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(true);
    }
  };

  // Deselect all transactions
  const handleDeselectAllTransactions = () => {
    const transactionIds = Array.from(selectedTransactions);
    batchAnimateTransactionSelections(transactionIds, false);
    setSelectedTransactions(new Set());
  };

  return {
    // State
    transactionSelectionMode,
    selectedTransactions,
    showMoveModal,
    showDeleteTransactionsModal,
    selectedDestinationCategory,
    selectedDestinationSubcategory,
    showSuccessMessage,
    successMessage,
    assigningCategories,
    deletingTransactions,

    // Functions
    handleTransactionPress,
    handleCancelTransactionSelection,
    handleDeleteTransactions,
    confirmDeleteTransactions,
    handleMoveTransactions,
    handleCategoryChange,
    handleSubcategoryChange,
    confirmMoveTransactions,
    handleCloseMoveModal,
    handleSelectAllTransactions,
    handleDeselectAllTransactions,

    // Setters
    setShowDeleteTransactionsModal,
  };
}
