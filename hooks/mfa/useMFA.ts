/**
 * useMFA Hook
 *
 * Manages MFA state and actions for the application.
 * Provides methods to enable/disable MFA and manage recovery codes.
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getMFAStatus,
  enableMFA as enableMFAService,
  disableMFA as disableMFAService,
  regenerateRecoveryCodes as regenerateRecoveryCodesService,
} from '@/services/mfa';
import type { MFAStatus, UseMFAReturn } from '@/types/mfa';

const RECOVERY_CODES_PROMPT_DISMISSED_KEY = 'mfa_recovery_codes_prompt_dismissed';

export function useMFA(): UseMFAReturn {
  const { accessToken } = useAuth();

  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);
  const [promptDismissed, setPromptDismissed] = useState<boolean | null>(null);

  /**
   * Fetch current MFA status from the backend
   */
  const fetchStatus = useCallback(async () => {
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mfaStatus = await getMFAStatus(accessToken);
      setStatus(mfaStatus);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch MFA status';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  /**
   * Enable MFA for the user
   * Returns true if successful (user should be logged out after)
   */
  const enableMFA = useCallback(async (): Promise<boolean> => {
    if (!accessToken) {
      setError('No access token available');
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await enableMFAService(accessToken);
      // Reset prompt dismissed state so user sees the prompt after re-enabling
      await AsyncStorage.removeItem(RECOVERY_CODES_PROMPT_DISMISSED_KEY);
      setPromptDismissed(false);
      // Update local status
      setStatus(prev => prev ? { ...prev, mfa_enabled: true } : null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enable MFA';
      setError(message);
      console.error('Error enabling MFA:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [accessToken]);

  /**
   * Disable MFA for the user
   * Returns true if successful (user should be logged out after)
   */
  const disableMFA = useCallback(async (): Promise<boolean> => {
    if (!accessToken) {
      setError('No access token available');
      return false;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await disableMFAService(accessToken);
      // Update local status
      setStatus(prev => prev ? {
        ...prev,
        mfa_enabled: false,
        enrolled: false,
        factors: [],
        recovery_codes_remaining: null,
      } : null);
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to disable MFA';
      setError(message);
      console.error('Error disabling MFA:', err);
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [accessToken]);

  /**
   * Regenerate recovery codes
   * Returns the new codes if successful, null otherwise
   */
  const regenerateRecoveryCodes = useCallback(async (): Promise<string[] | null> => {
    if (!accessToken) {
      setError('No access token available');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await regenerateRecoveryCodesService(accessToken);
      const codes = response.recovery_codes;

      if (!codes || codes.length === 0) {
        setError('No recovery codes received from server');
        return null;
      }

      setNewRecoveryCodes(codes);
      // Update recovery codes count
      setStatus(prev => prev ? {
        ...prev,
        recovery_codes_remaining: codes.length,
      } : null);
      return codes;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate recovery codes';
      setError(message);
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [accessToken]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear new recovery codes after user has seen them
   */
  const clearNewRecoveryCodes = useCallback(() => {
    setNewRecoveryCodes(null);
  }, []);

  /**
   * Dismiss the first-time recovery codes prompt
   * This saves to AsyncStorage so it won't show again
   */
  const dismissRecoveryCodesPrompt = useCallback(async () => {
    try {
      await AsyncStorage.setItem(RECOVERY_CODES_PROMPT_DISMISSED_KEY, 'true');
      setPromptDismissed(true);
    } catch {
      // Silent fail - not critical
    }
  }, []);

  /**
   * Reset the prompt dismissed state (useful after MFA is disabled and re-enabled)
   */
  const resetRecoveryCodesPrompt = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(RECOVERY_CODES_PROMPT_DISMISSED_KEY);
      setPromptDismissed(false);
    } catch {
      // Silent fail - not critical
    }
  }, []);

  // Check if prompt was previously dismissed
  useEffect(() => {
    const checkPromptDismissed = async () => {
      try {
        const dismissed = await AsyncStorage.getItem(RECOVERY_CODES_PROMPT_DISMISSED_KEY);
        setPromptDismissed(dismissed === 'true');
      } catch {
        setPromptDismissed(false);
      }
    };
    checkPromptDismissed();
  }, []);

  // Fetch status on mount if we have a token
  useEffect(() => {
    if (accessToken) {
      fetchStatus();
    }
  }, [accessToken, fetchStatus]);

  /**
   * Determine if the first-time recovery codes prompt should be shown
   * Conditions:
   * - MFA is enabled (user opted in)
   * - User is enrolled (TOTP setup complete)
   * - No recovery codes exist (recovery_codes_remaining is null)
   * - Prompt hasn't been dismissed before
   * - Not currently loading
   */
  const needsRecoveryCodesSetup = useMemo(() => {
    if (isLoading || promptDismissed === null) return false;
    if (promptDismissed) return false;
    if (!status) return false;

    const { mfa_enabled, enrolled, recovery_codes_remaining } = status;

    // User has MFA enabled and enrolled, but no recovery codes yet
    return (
      mfa_enabled === true &&
      enrolled === true &&
      recovery_codes_remaining === null
    );
  }, [status, isLoading, promptDismissed]);

  return {
    // State
    status,
    isLoading,
    isProcessing,
    error,
    newRecoveryCodes,
    needsRecoveryCodesSetup,
    // Actions
    fetchStatus,
    enableMFA,
    disableMFA,
    regenerateRecoveryCodes,
    clearError,
    clearNewRecoveryCodes,
    dismissRecoveryCodesPrompt,
    resetRecoveryCodesPrompt,
  };
}
