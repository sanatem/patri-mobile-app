import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { Asset, Liability } from '@/types';
import { patrimonyService } from '@/services/patrimony/get-patrimony';
import { usePatrimonyData } from './usePatrimonyData';
import { usePatrimonyFilters } from './usePatrimonyFilters';
import { usePatrimonyModals } from './usePatrimonyModals';
import { usePatrimonyUI } from './usePatrimonyUI';

/**
 * Main hook for Patrimony Overview screen
 * Orchestrates all specialized hooks and provides unified interface
 */
export function usePatrimonyOverview() {
  const { accessToken } = useAuth();
  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();

  // Local state for patrimony service data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [patrimonyData, setPatrimonyData] = useState<{
    MY_ASSETS: Asset[];
    PARTNER_ASSETS: Asset[];
    MY_LIABILITIES: Liability[];
    PARTNER_LIABILITIES: Liability[];
  }>({
    MY_ASSETS: [],
    PARTNER_ASSETS: [],
    MY_LIABILITIES: [],
    PARTNER_LIABILITIES: []
  });

  // UI state hook
  const uiState = usePatrimonyUI();

  // Local search query state (needed before filtersState)
  const [searchQuery, setSearchQuery] = useState('');

  // Data fetching and transformation hook
  const dataState = usePatrimonyData(searchQuery);

  // Filters and pagination hook
  const filtersState = usePatrimonyFilters({
    patrimonyData,
    ownerView: uiState.ownerView,
    activeTab: uiState.activeTab,
    searchQuery,
    transformApiAssets: dataState.transformApiAssets,
    transformApiDebts: dataState.transformApiDebts,
    hasApiAssets: dataState.hasApiAssets,
    hasApiDebts: dataState.hasApiDebts,
    mapSavingInstrumentType: dataState.mapSavingInstrumentType,
    getLastTwoValues: dataState.getLastTwoValues,
    calculateChange: dataState.calculateChange,
  });

  // Load patrimony data from service
  const loadPatrimonyData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = patrimonyService.getPatrimonyDataForComponents();
      setPatrimonyData(data);
    } catch (err) {
      setError('Error al cargar los datos del patrimonio');
      console.error('Error loading patrimony data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Modals management hook
  const modalsState = usePatrimonyModals({
    activeTab: uiState.activeTab,
    accessToken,
    refetchAssets: dataState.refetchAssets,
    refetchDebts: dataState.refetchDebts,
    loadPatrimonyData,
  });

  // Load data on mount
  useEffect(() => {
    loadPatrimonyData();
  }, []);

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadPatrimonyData();
    } catch (error) {
      console.error('Error during refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Computed values for tabs with badges
  const tabs = [
    {
      key: 'assets',
      label: uiState.t('tabConfig.patrimony.assets'),
      badge: (dataState.apiAssets ? dataState.transformApiAssets.length : 0).toString()
    },
    {
      key: 'liabilities',
      label: uiState.t('tabConfig.patrimony.liabilities'),
      badge: (dataState.apiDebts ? dataState.transformApiDebts.length : 0).toString()
    }
  ];

  // Loading states
  const isLoadingData = (uiState.activeTab === 'assets' && dataState.assetsLoading) ||
                       (uiState.activeTab === 'liabilities' && dataState.debtsLoading);

  const currentError = uiState.activeTab === 'assets' ? dataState.assetsError : dataState.debtsError;

  const currentTabTotal = uiState.activeTab === 'assets' ? dataState.totalAssets : dataState.totalLiabilities;

  return {
    // Loading states
    subscriptionLoading,
    shouldBlockTab,
    isLoading,
    error,
    refreshing,
    isLoadingData,

    // UI state
    ...uiState,
    tabs, // Override with badges

    // Data state
    ...dataState,

    // Filters state
    ...filtersState,
    searchQuery, // Override from local state
    setSearchQuery, // Add setter

    // Modals state
    ...modalsState,

    // Computed values
    currentError,
    currentTabTotal,

    // Handlers
    onRefresh,
    loadPatrimonyData,
  };
}
