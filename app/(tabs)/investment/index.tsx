import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import WithoutAccountScreen from './without-account';
import { LoadingSpinner } from '@/components/ui';
import { useHasInvestmentAccount } from '@/hooks/investment/usePortfolioDetails';

export default function InvestmentIndex() {
  const router = useRouter();
  const { hasInvestmentAccount, loading: isLoading } = useHasInvestmentAccount();

  useEffect(() => {
    if (!isLoading && hasInvestmentAccount) {
      router.replace('/investment/portfolio' as any);
    }
  }, [isLoading, hasInvestmentAccount, router]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LoadingSpinner />
      </View>
    );
  }

  if (hasInvestmentAccount) {
    return null;
  }
  
  return <WithoutAccountScreen />;
}
