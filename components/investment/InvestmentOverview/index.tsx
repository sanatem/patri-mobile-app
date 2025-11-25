import React, { useEffect } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { LockedTabOverlay, LoadingSpinner } from '@/components/ui';
import { WithoutAccount } from '@/components/investment/InvestmentOverview/WithoutAccount';
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
    hasSeenIntro,

    // Actions
    markIntroAsSeen,

    // Translation
    t,
  } = useInvestmentOverview();

  const isLoading = subscriptionLoading || investmentLoading || isLoadingFormData || hasSeenIntro === null;

  useEffect(() => {
    // Si tiene cuenta de inversión, redirigir a portfolio
    if (!isLoading && hasInvestmentAccount) {
      router.replace('/(tabs)/investment/portfolio' as any);
    }
    // Si ya vio la intro Y tiene formularios con datos, redirigir a complete-profile
    else if (!isLoading && !hasInvestmentAccount && hasSeenIntro && hasAnyFormData) {
      router.replace('/(tabs)/investment/create-account/complete-profile' as any);
    }
  }, [isLoading, hasInvestmentAccount, hasAnyFormData, hasSeenIntro]);

  if (isLoading) {
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

  // Si ya vio la intro y tiene datos, mostrar loading mientras redirige
  if (hasSeenIntro && hasAnyFormData) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <LoadingSpinner />
      </View>
    );
  }

  // Mostrar pantalla de introducción (primera vez o sin datos de formulario)
  return <WithoutAccount hasAnyFormData={hasAnyFormData} onStartCreateAccount={markIntroAsSeen} />;
}
