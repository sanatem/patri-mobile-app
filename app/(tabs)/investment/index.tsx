import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import WithoutAccountScreen from './without-account';
import { LockedTabOverlay } from '@/components/ui';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useHasInvestmentAccount } from '@/hooks/investment/usePortfolioDetails';
import Colors from '@/constants/Colors';

export default function InvestmentIndex() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  const { shouldBlockTabs, loading: subscriptionLoading } = useSubscriptionStatus();
  
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
          console.log('Navigation error:', error);
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

  if (shouldBlockTabs) {
    return <LockedTabOverlay tabName="Inversión" />;
  }

  if (hasInvestmentAccount) {
    return null;
  }
  
  return <WithoutAccountScreen />;
}
