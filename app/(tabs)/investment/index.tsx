import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import WithoutAccountScreen from './without-account';
import { LockedTabOverlay } from '@/components/ui';
import { useHasInvestmentAccount } from '@/hooks/investment/usePortfolioDetails';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import Colors from '@/constants/Colors';

export default function InvestmentIndex() {
  const { shouldBlockTabs, loading: subscriptionLoading } = useSubscriptionStatus();
  const { hasInvestmentAccount, loading: isLoading } = useHasInvestmentAccount();

  if (subscriptionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (shouldBlockTabs) {
    return <LockedTabOverlay tabName="Inversión" />;
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (hasInvestmentAccount) {
    return <Redirect href="/investment/portfolio" />;
  }
  
  return <WithoutAccountScreen />;
}
