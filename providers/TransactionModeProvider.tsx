import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { useBankAccounts } from '@/hooks/budget/useBankAccounts';
import { useAuth } from '@/providers/AuthProvider';
import { deactivateAllBudgetTemplates } from '@/services/budget/budget-templates';

export type TransactionMode = 'floid' | 'bank_account' | 'none';

const FLOID_SYNC_STARTED_KEY = '@patrimore:floid_sync_started';
const BUDGETS_DEACTIVATED_FOR_FLOID_KEY = '@patrimore:budgets_deactivated_for_floid';

interface TransactionModeContextType {
  mode: TransactionMode;
  loading: boolean;
  hasFloidAccounts: boolean;
  hasBankAccounts: boolean;
  floidAccountsCount: number;
  bankAccountsCount: number;
  floidSyncStarted: boolean;
  // For manual mode selection if needed in the future
  setMode: (mode: TransactionMode) => void;
  // Refresh accounts to update mode
  refetchAccounts: () => Promise<void>;
  // Mark that Floid sync has been started
  markFloidSyncStarted: () => Promise<void>;
  // Clear Floid sync started flag (if user wants to switch back to manual)
  clearFloidSyncStarted: () => Promise<void>;
}

const TransactionModeContext = createContext<TransactionModeContextType | undefined>(undefined);

interface TransactionModeProviderProps {
  children: ReactNode;
}

export function TransactionModeProvider({ children }: TransactionModeProviderProps) {
  const { accounts: floidAccounts, loading: floidLoading, refetch: refetchFloid } = useFloidAccounts();
  const { accounts: bankAccounts, loading: bankLoading, refetch: refetchBank } = useBankAccounts();
  const { accessToken } = useAuth();
  const [manualMode, setManualMode] = useState<TransactionMode | null>(null);
  const [floidSyncStarted, setFloidSyncStarted] = useState(false);
  const [syncFlagLoading, setSyncFlagLoading] = useState(true);
  const [budgetsDeactivatedForFloid, setBudgetsDeactivatedForFloid] = useState(false);
  const deactivatingBudgetsRef = useRef(false);

  // Load flags from AsyncStorage on mount
  useEffect(() => {
    const loadFlags = async () => {
      try {
        const [syncValue, deactivatedValue] = await Promise.all([
          AsyncStorage.getItem(FLOID_SYNC_STARTED_KEY),
          AsyncStorage.getItem(BUDGETS_DEACTIVATED_FOR_FLOID_KEY)
        ]);
        setFloidSyncStarted(syncValue === 'true');
        setBudgetsDeactivatedForFloid(deactivatedValue === 'true');
      } catch (error) {
        console.error('Error loading flags:', error);
      } finally {
        setSyncFlagLoading(false);
      }
    };
    loadFlags();
  }, []);

  // Mark that Floid sync has been started
  const markFloidSyncStarted = useCallback(async () => {
    try {
      await AsyncStorage.setItem(FLOID_SYNC_STARTED_KEY, 'true');
      setFloidSyncStarted(true);
    } catch (error) {
      console.error('Error saving floid sync flag:', error);
    }
  }, []);

  // Clear Floid sync started flag
  const clearFloidSyncStarted = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(FLOID_SYNC_STARTED_KEY);
      setFloidSyncStarted(false);
    } catch (error) {
      console.error('Error clearing floid sync flag:', error);
    }
  }, []);

  // Function to refresh accounts and update mode
  const refetchAccounts = useCallback(async () => {
    await Promise.all([refetchFloid(), refetchBank()]);
  }, [refetchFloid, refetchBank]);

  const hasFloidAccounts = useMemo(() => {
    return (floidAccounts?.floid_accounts?.length || 0) > 0;
  }, [floidAccounts]);

  const hasBankAccounts = useMemo(() => {
    return (bankAccounts?.length || 0) > 0;
  }, [bankAccounts]);

  const floidAccountsCount = floidAccounts?.floid_accounts?.length || 0;
  const bankAccountsCount = bankAccounts?.length || 0;

  // Clear floidSyncStarted flag if user has no Floid accounts but has bank accounts
  // This handles the case when user removes their Floid accounts
  useEffect(() => {
    if (!floidLoading && !hasFloidAccounts && floidSyncStarted && hasBankAccounts) {
      clearFloidSyncStarted();
    }
  }, [floidLoading, hasFloidAccounts, floidSyncStarted, hasBankAccounts, clearFloidSyncStarted]);

  // Deactivate all budget templates when user has Floid accounts and budgets haven't been deactivated yet
  // This ensures manual transaction budgets are cleared when switching to Floid mode
  useEffect(() => {
    const deactivateBudgetsForFloid = async () => {
      // Only run if:
      // - Not already deactivating
      // - User has Floid accounts
      // - Budgets haven't been deactivated for Floid yet
      // - We have an access token
      // - Floid loading is complete
      if (
        deactivatingBudgetsRef.current ||
        !hasFloidAccounts ||
        budgetsDeactivatedForFloid ||
        !accessToken ||
        floidLoading
      ) {
        return;
      }

      deactivatingBudgetsRef.current = true;

      try {
        console.log('Deactivating budget templates for Floid mode...');
        const result = await deactivateAllBudgetTemplates(accessToken);

        if (result.deactivatedCount > 0) {
          console.log(`Deactivated ${result.deactivatedCount} budget templates for Floid mode`);
        }

        // Mark budgets as deactivated for Floid
        await AsyncStorage.setItem(BUDGETS_DEACTIVATED_FOR_FLOID_KEY, 'true');
        setBudgetsDeactivatedForFloid(true);
      } catch (error) {
        console.error('Error deactivating budgets for Floid:', error);
      } finally {
        deactivatingBudgetsRef.current = false;
      }
    };

    deactivateBudgetsForFloid();
  }, [hasFloidAccounts, budgetsDeactivatedForFloid, accessToken, floidLoading]);

  // Clear budgetsDeactivatedForFloid flag when user no longer has Floid accounts
  // This allows budgets to be created again in manual mode
  useEffect(() => {
    const clearDeactivatedFlag = async () => {
      if (!floidLoading && !hasFloidAccounts && budgetsDeactivatedForFloid) {
        try {
          await AsyncStorage.removeItem(BUDGETS_DEACTIVATED_FOR_FLOID_KEY);
          setBudgetsDeactivatedForFloid(false);
        } catch (error) {
          console.error('Error clearing budgets deactivated flag:', error);
        }
      }
    };

    clearDeactivatedFlag();
  }, [floidLoading, hasFloidAccounts, budgetsDeactivatedForFloid]);

  // Determine the mode based on available accounts
  // Priority:
  // 1. If user has Floid accounts, use Floid
  // 2. If user has bank accounts, use bank_account (even if floidSyncStarted, prioritize existing accounts)
  // 3. If user has started Floid sync but has no accounts yet, use Floid (waiting for sync)
  // 4. Otherwise, none
  const determinedMode = useMemo((): TransactionMode => {
    if (manualMode) return manualMode;

    // If user has Floid accounts, always use Floid
    if (hasFloidAccounts) {
      return 'floid';
    }

    // If user has bank accounts, use bank_account mode
    // This takes priority over floidSyncStarted when there are no Floid accounts
    if (hasBankAccounts) {
      return 'bank_account';
    }

    // If user has started Floid sync (waiting for accounts to sync) but has no accounts yet
    if (floidSyncStarted) {
      return 'floid';
    }

    return 'none';
  }, [hasFloidAccounts, hasBankAccounts, floidSyncStarted, manualMode]);

  const loading = floidLoading || bankLoading || syncFlagLoading;

  const value: TransactionModeContextType = {
    mode: determinedMode,
    loading,
    hasFloidAccounts,
    hasBankAccounts,
    floidAccountsCount,
    bankAccountsCount,
    floidSyncStarted,
    setMode: setManualMode,
    refetchAccounts,
    markFloidSyncStarted,
    clearFloidSyncStarted,
  };

  return (
    <TransactionModeContext.Provider value={value}>
      {children}
    </TransactionModeContext.Provider>
  );
}

export function useTransactionMode(): TransactionModeContextType {
  const context = useContext(TransactionModeContext);
  if (context === undefined) {
    throw new Error('useTransactionMode must be used within a TransactionModeProvider');
  }
  return context;
}
