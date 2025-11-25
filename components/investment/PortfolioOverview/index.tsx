import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Select } from '@/components/ui/Select';
import { FloatingActionButton, type FloatingAction } from '@/components/ui/FloatingActionButton';
import { Target, ArrowDown, ArrowUp } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { usePortfolioOverview } from '@/hooks/investment/usePortfolioOverview';
import { PortfolioHeader } from './Header';
import { GoalsSection } from './Goals';

export function PortfolioOverview() {
  const router = useRouter();
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

  const handleNewGoalPress = () => {
    router.push('/(tabs)/investment/portfolio/goals/create-goals' as any);
  };

  const floatingActions: FloatingAction[] = [
    {
      label: 'Nueva Meta',
      icon: <Target size={20} color={Colors.primary[500]} />,
      onPress: handleNewGoalPress,
    },
    {
      label: 'Nuevo Depósito',
      icon: <ArrowDown size={20} color={Colors.primary[500]} />,
      onPress: handleInvestPress,
    },
    {
      label: 'Nuevo Retiro',
      icon: <ArrowUp size={20} color={Colors.secondary[500]} />,
      onPress: handleWithdrawPress,
    },
  ];

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

        <FloatingActionButton actions={floatingActions} />
      </View>
    </Container>
  );
}
