import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import WithoutAccountScreen from './without-account';
import { LoadingSpinner } from '@/components/ui';

export default function InvestmentIndex() {
  const router = useRouter();
  const [hasInvestmentAccount, setHasInvestmentAccount] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkInvestmentAccount = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const hasAccount = true;
        
        setHasInvestmentAccount(hasAccount);
      } catch (error) {
        console.error('Error checking investment account:', error);
        setHasInvestmentAccount(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkInvestmentAccount();
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LoadingSpinner />
      </View>
    );
  }

  if (hasInvestmentAccount) {
    router.replace('/investment/portfolio' as any);
    return null;
  }
  return <WithoutAccountScreen />;
}
