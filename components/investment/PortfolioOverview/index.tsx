import React from 'react';
import { View, ScrollView } from 'react-native';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Select } from '@/components/ui/Select';
import { usePortfolioOverview } from '@/hooks/investment/usePortfolioOverview';
import { PortfolioHeader } from './Header';
import { PortfolioMovements } from './Movements';
import { GoalsSection } from './Goals';

export function PortfolioOverview() {
  const {
    // Data
    patrimonyValue,
    cashAmount,
    selectedAccountType,
    accountTypeOptions,

    // Loading states
    walletLoading,
    goalsLoading,
    goalsError,

    // Goals data
    currentGoals,

    // Handlers
    setSelectedAccountType,
    handleInvestPress,
    handleWithdrawPress,
    handleGoalPress,
    refetch,

    // Translation
    t,
  } = usePortfolioOverview();

  return (
    <Container variant="secondaryPage">
      <Header title={t('portfolio.title')} />
      <View className="flex-1">
        <ScrollView
          className="flex-1 px-5 mt-16"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >
          <PortfolioHeader
            patrimony={patrimonyValue}
            isLoading={walletLoading}
            cashAmount={cashAmount}
            selectedAccountType={selectedAccountType}
          />

          <View className="px-1 py-4">
            <Select
              options={accountTypeOptions}
              value={selectedAccountType}
              onSelect={setSelectedAccountType}
              label={t('portfolio.accountTypeLabel')}
              placeholder={t('portfolio.selectAccountType')}
            />
          </View>

          <GoalsSection
            selectedAccountType={selectedAccountType}
            goalsLoading={goalsLoading}
            goalsError={goalsError}
            currentGoals={currentGoals}
            onGoalPress={handleGoalPress}
            onRetry={refetch}
            t={t}
          />
        </ScrollView>

        <PortfolioMovements
          onInvestPress={handleInvestPress}
          onWithdrawPress={handleWithdrawPress}
          t={t}
        />
      </View>
    </Container>
  );
}
