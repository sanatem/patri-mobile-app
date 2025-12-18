/**
 * useMFA Hook
 *
 * Manages MFA state and actions for the application.
 * Provides methods to enable/disable MFA and manage recovery codes.
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import {
  getMFAStatus,
  enableMFA as enableMFAService,
  disableMFA as disableMFAService,
  regenerateRecoveryCodes as regenerateRecoveryCodesService,
} from '@/services/mfa';
import type { MFAStatus, UseMFAReturn } from '@/types/mfa';

export function useMFA(): UseMFAReturn {
  const { accessToken } = useAuth();

  const [status, setStatus] = useState<MFAStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);

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
      console.log('[MFA] Status from backend:', JSON.stringify(mfaStatus));
      setStatus(mfaStatus);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch MFA status';
      setError(message);
      console.error('[MFA] Error fetching status:', err);
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
        recovery_codes_remaining: 0,
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
      console.error('Error regenerating recovery codes:', err);
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

  // Fetch status on mount if we have a token
  useEffect(() => {
    if (accessToken) {
      fetchStatus();
    }
  }, [accessToken, fetchStatus]);

  return {
    // State
    status,
    isLoading,
    isProcessing,
    error,
    newRecoveryCodes,
    // Actions
    fetchStatus,
    enableMFA,
    disableMFA,
    regenerateRecoveryCodes,
    clearError,
    clearNewRecoveryCodes,
  };
}

