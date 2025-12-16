import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { useBankAccounts } from '@/hooks/budget/useBankAccounts';

export type TransactionMode = 'floid' | 'bank_account' | 'none';

const FLOID_SYNC_STARTED_KEY = '@patrimore:floid_sync_started';

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
  const [manualMode, setManualMode] = useState<TransactionMode | null>(null);
  const [floidSyncStarted, setFloidSyncStarted] = useState(false);
  const [syncFlagLoading, setSyncFlagLoading] = useState(true);

  // Load floid sync started flag from AsyncStorage on mount
  useEffect(() => {
    const loadSyncFlag = async () => {
      try {
        const value = await AsyncStorage.getItem(FLOID_SYNC_STARTED_KEY);
        setFloidSyncStarted(value === 'true');
      } catch (error) {
        console.error('Error loading floid sync flag:', error);
      } finally {
        setSyncFlagLoading(false);
      }
    };
    loadSyncFlag();
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

  // Determine the mode based on available accounts
  // Priority:
  // 1. If user has Floid accounts, use Floid
  // 2. If user has started Floid sync (even if accounts not yet available), use Floid
  // 3. Otherwise, use BankAccount if available
  const determinedMode = useMemo((): TransactionMode => {
    if (manualMode) return manualMode;

    // If user has Floid accounts, always use Floid
    if (hasFloidAccounts) {
      return 'floid';
    }

    // If user has started Floid sync (waiting for accounts to sync), use Floid mode
    if (floidSyncStarted) {
      return 'floid';
    }

    // Otherwise use bank_account if available
    if (hasBankAccounts) {
      return 'bank_account';
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
