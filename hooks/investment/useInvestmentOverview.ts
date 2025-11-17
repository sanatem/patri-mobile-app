import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useHasInvestmentAccount } from '@/hooks/investment/usePortfolioDetails';
import { getContactInformation } from '@/services/investment/create-account/contact-information/get-contact-information';
import { getPersonalInformation } from '@/services/investment/create-account/personal-information/get-personal-information';
import { getRiskProfile } from '@/services/investment/create-account/investment-survey/get-risk-profile';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

/**
 * Main hook for Investment Overview screen
 * Manages investment account status and form data
 */
export function useInvestmentOverview() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [isLoadingFormData, setIsLoadingFormData] = useState(true);
  const [hasAnyFormData, setHasAnyFormData] = useState(false);

  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();
  const { hasInvestmentAccount, loading: investmentLoading } = useHasInvestmentAccount();

  useFocusEffect(
    useCallback(() => {
      checkForExistingFormData();
    }, [accessToken])
  );

  const checkForExistingFormData = async () => {
    if (!accessToken) {
      setIsLoadingFormData(false);
      return;
    }

    try {
      const [contactResponse, personalResponse, riskResponse] = await Promise.all([
        getContactInformation(accessToken),
        getPersonalInformation(accessToken),
        getRiskProfile(accessToken),
      ]);

      const hasContactData = !!(
        contactResponse.success &&
        contactResponse.contact_information &&
        (contactResponse.contact_information.address ||
          contactResponse.contact_information.phones?.length ||
          contactResponse.contact_information.floor_number)
      );

      const hasPersonalData = !!(
        personalResponse.success &&
        personalResponse.personal_information &&
        (personalResponse.personal_information.gender ||
          personalResponse.personal_information.employment_situation ||
          personalResponse.personal_information.marital_status)
      );

      const hasRiskData = !!(
        riskResponse.success &&
        riskResponse.risk_profile &&
        (riskResponse.risk_profile.goal ||
          riskResponse.risk_profile.investment_knowledge)
      );

      setHasAnyFormData(hasContactData || hasPersonalData || hasRiskData);
    } catch (error) {
      console.error('Error checking for existing form data:', error);
    } finally {
      setIsLoadingFormData(false);
    }
  };

  useEffect(() => {
    if (!subscriptionLoading && !investmentLoading && !isLoadingFormData && hasInvestmentAccount) {
      const timer = setTimeout(() => {
        try {
          router.replace('/(tabs)/investment/portfolio');
        } catch (error) {
          Alert.alert('Error', 'No se pudo navegar a la pantalla solicitada');
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [subscriptionLoading, investmentLoading, isLoadingFormData, hasInvestmentAccount, router]);

  return {
    // Loading states
    subscriptionLoading,
    investmentLoading,
    isLoadingFormData,

    // Data
    hasInvestmentAccount,
    hasAnyFormData,
    shouldBlockTab,

    // Translation
    t,
  };
}
