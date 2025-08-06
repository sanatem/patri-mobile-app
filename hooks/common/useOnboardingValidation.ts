import { useMemo } from 'react';
import { useUserData } from '@/hooks/user/useUserData';
import { shouldShowOnboarding, validateOnboardingCompleteness } from '@/utils/onboarding';

export function useOnboardingValidation() {
  const { userData, loading: userDataLoading } = useUserData();

  const validation = useMemo(() => {
    return validateOnboardingCompleteness(userData);
  }, [userData]);

  const shouldShow = useMemo(() => {
    return shouldShowOnboarding(userData);
  }, [userData]);

  return {
    userData,
    userDataLoading,
    validation,
    shouldShowOnboarding: shouldShow,
    isComplete: validation.isComplete,
    missingFields: validation.missingFields
  };
} 