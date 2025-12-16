import { useState, useMemo, useCallback } from 'react';
import { Dimensions, Alert, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useTranslation } from 'react-i18next';
import { useFloidSync } from '@/hooks/common/useFloidSync';
import { useAuth } from '@/providers/AuthProvider';
import { useBudgetDate } from '@/providers/BudgetDateProvider';
import { getBudgetInstances } from '@/services/budget/budget-instances';
import { getBudgetTemplates, updateBudgetTemplate, deactivateBudgetTemplate } from '@/services/budget/budget-templates';
import type { BudgetInstance, BudgetSummary, BudgetTemplate, CombinedBudget } from '@/services/budget/budget-templates/types';

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

  // Use shared budget date context
  const {
    selectedDate,
    currentPeriod,
    isCurrentMonth,
    handlePreviousMonth,
    handleNextMonth,
    getMonthDateRange,
  } = useBudgetDate();

  const { width: screenWidth } = Dimensions.get('window');
  const chartSize = Math.min(screenWidth - 80, 280);

  // State
  const [budgetInstances, setBudgetInstances] = useState<BudgetInstance[]>([]);
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>(emptySummary);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Fetch budget data from API (templates + instances for selected month)
  const fetchBudgetData = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Get date range for selected month
      const { start_date, end_date } = getMonthDateRange();

      // Llamar templates primero (es el principal)
      try {
        const templatesResponse = await getBudgetTemplates(accessToken);
        if (templatesResponse.success && templatesResponse.budget_templates) {
          setTemplates(templatesResponse.budget_templates);
        } else {
          setTemplates([]);
        }
      } catch (templatesError) {
        console.error('Error fetching templates:', templatesError);
        setTemplates([]);
      }

      // Llamar instances con filtro de fechas del mes seleccionado
      try {
        const instancesResponse = await getBudgetInstances(
          { start_date, end_date },
          accessToken
        );
        if (instancesResponse.success && instancesResponse.budget_instances) {
          // Sort instances: active first, inactive at the end
          const sortedInstances = [...instancesResponse.budget_instances].sort((a, b) => {
            // Active instances come first (template_active: true or undefined)
            const aActive = a.template_active !== false;
            const bActive = b.template_active !== false;
            if (aActive && !bActive) return -1;
            if (!aActive && bActive) return 1;
            return 0;
          });
          setBudgetInstances(sortedInstances);
          setSummary(instancesResponse.summary || emptySummary);
        } else {
          setBudgetInstances([]);
          setSummary(emptySummary);
        }
      } catch (instancesError) {
        console.error('Error fetching instances:', instancesError);
        setBudgetInstances([]);
        setSummary(emptySummary);
      }

    } catch (error) {
      console.error('Error fetching budget data:', error);
      setTemplates([]);
      setBudgetInstances([]);
      setSummary(emptySummary);
    } finally {
      setLoading(false);
    }
  }, [accessToken, selectedDate, getMonthDateRange]);

  // Combinar templates con instances
  const combinedBudgets: CombinedBudget[] = useMemo(() => {
    return templates.map(template => {
      const instance = budgetInstances.find(i => i.budget_template_id === template.id);
      return {
        template,
        instance: instance || null,
        hasProgress: !!instance
      };
    });
  }, [templates, budgetInstances]);

  // Gestionar presupuesto - Actualizar monto
  const handleUpdateBudgetAmount = useCallback(async (templateId: number, newAmount: number) => {
    if (!accessToken) return;

    try {
      setIsUpdating(true);
      await updateBudgetTemplate(templateId, { amount: newAmount }, accessToken);
      await fetchBudgetData();
      if (Platform.OS === 'web') {
        window.alert(t('budget.amount_updated', 'Monto actualizado correctamente'));
      } else {
        Alert.alert(t('common.success', 'Éxito'), t('budget.amount_updated', 'Monto actualizado correctamente'));
      }
    } catch (error) {
      console.error('Error updating budget amount:', error);
      if (Platform.OS === 'web') {
        window.alert(t('budget.error_updating', 'No se pudo actualizar el monto'));
      } else {
        Alert.alert(t('common.error', 'Error'), t('budget.error_updating', 'No se pudo actualizar el monto'));
      }
    } finally {
      setIsUpdating(false);
    }
  }, [accessToken, fetchBudgetData, t]);

  // Gestionar presupuesto - Desactivar
  const handleDeactivateBudget = useCallback(async (templateId: number) => {
    if (!accessToken) return;

    try {
      setIsDeactivating(true);
      await deactivateBudgetTemplate(templateId, accessToken);
      await fetchBudgetData();
    } catch (error) {
      console.error('Error deactivating budget:', error);
      if (Platform.OS === 'web') {
        window.alert(t('budget.error_deactivating', 'No se pudo desactivar el presupuesto'));
      } else {
        Alert.alert(t('common.error', 'Error'), t('budget.error_deactivating', 'No se pudo desactivar el presupuesto'));
      }
    } finally {
      setIsDeactivating(false);
    }
  }, [accessToken, fetchBudgetData, t]);

  // Navegar al historial de un presupuesto
  const handleNavigateToBudgetHistory = useCallback((template: BudgetTemplate) => {
    router.push({
      pathname: '/(tabs)/budget/budget-history' as any,
      params: {
        templateId: template.id.toString(),
        categoryId: template.user_category.id.toString(),
        categoryName: template.user_category.name
      }
    });
  }, [router]);

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

  const handleNavigateToBudgetSettings = () => {
    router.push('/(tabs)/budget/budget-settings' as any);
  };

  // Effects - fetch data from API on focus
  useFocusEffect(
    useCallback(() => {
      fetchBudgetData();
    }, [fetchBudgetData])
  );

  // Computed values - mostrar si hay templates activos O instancias (incluyendo inactivas)
  const hasBudgets = templates.length > 0 || budgetInstances.length > 0;

  return {
    // State
    currentPeriod,
    selectedDate,
    isCurrentMonth,

    // Data
    budgetInstances,
    templates,
    combinedBudgets,
    summary,
    hasBudgets,

    // Loading states
    subscriptionLoading,
    loading,
    isSyncing,
    isUpdating,
    isDeactivating,

    // Computed values
    chartSize,
    shouldBlockTab,

    // Handlers
    handleNavigateToTransactions,
    handleNavigateToCreateBudget,
    handleNavigateToBudgetDetail,
    handleNavigateToCategories,
    handleNavigateToBudgetHistory,
    handleNavigateToBudgetSettings,
    handleUpdateBudgetAmount,
    handleDeactivateBudget,
    handleIntegrarDatos,
    handlePreviousMonth,
    handleNextMonth,
    stopSync,
    handleSyncComplete,

    // Refetch function
    refetch: fetchBudgetData,

    t,
  };
}
