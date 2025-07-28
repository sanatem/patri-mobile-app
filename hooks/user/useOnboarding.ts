import { useState } from 'react';
import { submitOnboarding, OnboardingRequest, OnboardingResponse } from '@/services/user/onboarding';
import { useAuth } from '@/providers/AuthProvider';

interface UseOnboardingReturn {
  submitOnboardingData: (data: OnboardingRequest) => Promise<OnboardingResponse | null>;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function useOnboarding(): UseOnboardingReturn {
  const { accessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitOnboardingData = async (data: OnboardingRequest): Promise<OnboardingResponse | null> => {
    if (!accessToken) {
      setError('No hay token de autenticación disponible');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const response = await submitOnboarding(accessToken, data);
      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitOnboardingData,
    loading,
    error,
    success,
  };
} 