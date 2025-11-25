import { useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/providers/AuthProvider';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useHasInvestmentAccount } from '@/hooks/investment/usePortfolioDetails';
import { getContactInformation } from '@/services/investment/create-account/contact-information/get-contact-information';
import { getPersonalInformation } from '@/services/investment/create-account/personal-information/get-personal-information';
import { getRiskProfile } from '@/services/investment/create-account/investment-survey/get-risk-profile';
import { checkRequirements } from '@/services/investment/create-account/broker-documentation';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const INVESTMENT_INTRO_SEEN_KEY = 'investment_intro_seen';

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
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean | null>(null);

  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();
  const { hasInvestmentAccount, loading: investmentLoading } = useHasInvestmentAccount();

  // Verificar si ya vio la pantalla de introducción
  useEffect(() => {
    const checkIntroSeen = async () => {
      try {
        const seen = await AsyncStorage.getItem(INVESTMENT_INTRO_SEEN_KEY);
        setHasSeenIntro(seen === 'true');
      } catch {
        setHasSeenIntro(false);
      }
    };
    checkIntroSeen();
  }, []);

  // Función para marcar la intro como vista
  const markIntroAsSeen = async () => {
    try {
      await AsyncStorage.setItem(INVESTMENT_INTRO_SEEN_KEY, 'true');
      setHasSeenIntro(true);
    } catch {
      // Error guardando el flag
    }
  };

  // Solo verificar datos de formulario si el usuario NO tiene cuenta de inversión
  // Esto evita llamadas innecesarias a los endpoints de create-account
  useFocusEffect(
    useCallback(() => {
      if (!investmentLoading && !hasInvestmentAccount) {
        checkAccountStatusAndFormData();
      } else if (hasInvestmentAccount) {
        // Si ya tiene cuenta, no necesitamos verificar datos de formulario
        setIsLoadingFormData(false);
      }
    }, [accessToken, investmentLoading, hasInvestmentAccount])
  );

  const checkAccountStatusAndFormData = async () => {
    if (!accessToken) {
      setIsLoadingFormData(false);
      return;
    }

    try {
      // Primero verificar si los documentos del broker están aprobados
      const requirementsResponse = await checkRequirements(accessToken);

      if (requirementsResponse.success) {
        const brokerDocs = requirementsResponse.data?.details?.forms_status?.broker_documents;
        const isApproved = brokerDocs?.some(doc => doc.status === 'approved');

        if (isApproved) {
          // Si está aprobado, redirigir directamente al portfolio
          setIsLoadingFormData(false);
          router.replace('/(tabs)/investment/portfolio');
          return;
        }
      }

      // Solo si no está aprobado, verificar los datos del formulario
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
      console.error('Error checking account status:', error);
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
    hasSeenIntro,

    // Actions
    markIntroAsSeen,

    // Translation
    t,
  };
}
