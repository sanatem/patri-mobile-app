import { View, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import WithoutAccountScreen from './without-account';
import { LockedTabOverlay } from '@/components/ui';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useHasInvestmentAccount } from '@/hooks/investment/usePortfolioDetails';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

export default function InvestmentIndex() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  
  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();
  
  const { hasInvestmentAccount, loading: investmentLoading } = useHasInvestmentAccount();

  useEffect(() => {
    if (!subscriptionLoading && !investmentLoading) {
      setIsLoading(false);
    }
  }, [subscriptionLoading, investmentLoading]);

  useEffect(() => {
    if (!isLoading && hasInvestmentAccount) {
      const timer = setTimeout(() => {
        try {
          router.replace('/investment/portfolio');
        } catch (error) {
          Alert.alert('Error', 'No se pudo navegar a la pantalla solicitada');
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, hasInvestmentAccount, router]);

  if (subscriptionLoading || investmentLoading || isLoading) {
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
  
  return <WithoutAccountScreen />;
}
