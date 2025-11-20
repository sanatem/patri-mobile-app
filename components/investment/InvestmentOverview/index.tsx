import React, { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
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

  useEffect(() => {
    // Si tiene cuenta de inversión, redirigir a portfolio
    if (!subscriptionLoading && !investmentLoading && !isLoadingFormData && hasInvestmentAccount) {
      router.replace('/(tabs)/investment/portfolio' as any);
    }
    // Si tiene al menos un formulario completado (pero no cuenta), redirigir a complete-profile
    else if (!subscriptionLoading && !investmentLoading && !isLoadingFormData && !hasInvestmentAccount && hasAnyFormData) {
      router.replace('/(tabs)/investment/create-account/complete-profile' as any);
    }
  }, [subscriptionLoading, investmentLoading, isLoadingFormData, hasInvestmentAccount, hasAnyFormData]);

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
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LoadingSpinner />
      </View>
    );
  }

  // Si tiene datos de formulario, mostrar loading mientras redirige
  if (hasAnyFormData) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LoadingSpinner />
      </View>
    );
  }

  return <WithoutAccount hasAnyFormData={hasAnyFormData} />;
}
