import { View, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import WithoutAccountScreen from './without-account';
import { LockedTabOverlay } from '@/components/ui';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useHasInvestmentAccount } from '@/hooks/investment/usePortfolioDetails';
import { getContactInformation } from '@/services/investment/create-account/contact-information/get-contact-information';
import { getPersonalInformation } from '@/services/investment/create-account/personal-information/get-personal-information';
import { getRiskProfile } from '@/services/investment/create-account/investment-survey/get-risk-profile';
import { useAuth } from '@/providers/AuthProvider';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

export default function InvestmentIndex() {
  const router = useRouter();
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [isLoadingFormData, setIsLoadingFormData] = useState(true);
  const [hasAnyFormData, setHasAnyFormData] = useState(false);

  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();

  const { hasInvestmentAccount, loading: investmentLoading } = useHasInvestmentAccount();

  useEffect(() => {
    checkForExistingFormData();
  }, [accessToken]);

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
          router.replace('/(tabs)/investment/portfolio')
        } catch (error) {
          Alert.alert('Error', 'No se pudo navegar a la pantalla solicitada')
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [subscriptionLoading, investmentLoading, isLoadingFormData, hasInvestmentAccount, router]);

  useEffect(() => {
    if (!subscriptionLoading && !investmentLoading && !isLoadingFormData && !hasInvestmentAccount && hasAnyFormData) {
      const timer = setTimeout(() => {
        try {
          router.replace('/(tabs)/investment/create-account/summary')
        } catch (error) {
          Alert.alert('Error', 'No se pudo navegar a la pantalla solicitada')
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [subscriptionLoading, investmentLoading, isLoadingFormData, hasInvestmentAccount, hasAnyFormData, router]);

  if (subscriptionLoading || investmentLoading || isLoadingFormData) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (shouldBlockTab("Inversión")) {
    return <LockedTabOverlay tabName={t('investments.title')} />;
  }

  if (hasInvestmentAccount) {
    return null;
  }

  if (hasAnyFormData) {
    return null;
  }

  return <WithoutAccountScreen />;
}
