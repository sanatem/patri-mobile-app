import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useTranslation } from 'react-i18next';
import { getBudgetInstanceById } from '@/services/budget/budget-instances';
import { deactivateBudgetTemplate } from '@/services/budget/budget-templates';
import type { BudgetInstanceWithTransactions, BudgetInstanceTransaction } from '@/services/budget/budget-instances';

interface UseBudgetDetailProps {
  instanceId: string;
}

export function useBudgetDetail({ instanceId }: UseBudgetDetailProps) {
  const { accessToken } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();

  // State
  const [budgetInstance, setBudgetInstance] = useState<BudgetInstanceWithTransactions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch budget instance data (includes transactions)
  const fetchBudgetInstance = useCallback(async () => {
    if (!accessToken || !instanceId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getBudgetInstanceById(instanceId, accessToken);

      if (response.success && response.budget_instance) {
        setBudgetInstance(response.budget_instance);
      }
    } catch (err) {
      console.error('Error fetching budget instance:', err);
      setError(t('budget.error_loading', 'Error al cargar el presupuesto'));
    } finally {
      setLoading(false);
    }
  }, [accessToken, instanceId, t]);

  // Handle deactivate budget
  const handleDeactivate = useCallback(async () => {
    if (!accessToken || !budgetInstance?.budget_template_id) return;

    try {
      setIsDeleting(true);
      await deactivateBudgetTemplate(budgetInstance.budget_template_id, accessToken);
      setShowDeleteModal(false);
      router.back();
    } catch (err) {
      console.error('Error deactivating budget:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [accessToken, budgetInstance, router]);

  // Handle edit
  const handleEdit = useCallback(() => {
    if (!budgetInstance) return;
    // TODO: Navigate to edit budget screen
    console.log('Edit budget template:', budgetInstance.budget_template_id);
  }, [budgetInstance]);

  // Navigation
  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  // Fetch data on focus
  useFocusEffect(
    useCallback(() => {
      fetchBudgetInstance();
    }, [fetchBudgetInstance])
  );

  // Get transactions from budget instance
  const transactions: BudgetInstanceTransaction[] = budgetInstance?.transactions || [];

  return {
    // Data
    budgetInstance,
    transactions,
    transactionsCount: budgetInstance?.transactions_count || 0,

    // Loading states
    loading,
    error,

    // Modal states
    showDeleteModal,
    setShowDeleteModal,
    isDeleting,

    // Handlers
    handleDeactivate,
    handleEdit,
    handleGoBack,
    refetch: fetchBudgetInstance,

    // Translation
    t,
  };
}
