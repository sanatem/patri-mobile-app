import React from 'react';
import { View } from 'react-native';
import { LockedTabOverlay, LoadingSpinner } from '@/components/ui';
import { WithoutAccount } from '@/components/investment/InvestmentOverview/WithoutAccount';
import Colors from '@/constants/Colors';
import { useInvestmentOverview } from '@/hooks/investment/useInvestmentOverview';

export function InvestmentOverview() {
  const {
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
  } = useInvestmentOverview();

  if (subscriptionLoading || investmentLoading || isLoadingFormData) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LoadingSpinner />
      </View>
    );
  }

  if (shouldBlockTab("Inversión")) {
    return <LockedTabOverlay tabName={t('investments.title')} />;
  }

  if (hasInvestmentAccount) {
    return null;
  }

  return <WithoutAccount hasAnyFormData={hasAnyFormData} />;
}
