import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Container, KeyboardAwareContainer, LoadingSpinner, Card, FloatingActionButton, SyncModal, QuickAccessButton, type FloatingAction } from '@/components/ui';
import { BudgetHeader } from '../BudgetOverview/Header';
import { BudgetInstanceCard } from './BudgetInstanceCard';
import { DateSelector } from '../BudgetOverview/Filters/DateSelector';
import BudgetChart from '../BudgetOverview/Chart/BudgetChart';
import { useBudgetSection } from '@/hooks/budget/useBudgetSection';
import { Plus, Receipt, PiggyBank, Tag } from 'lucide-react-native';
import Colors from '@/constants/Colors';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function BudgetSectionOverview() {
  const {
    // State
    selectedMonth,
    selectedYear,

    // Data
    budgetInstances,
    summary,
    hasBudgets,

    // Options
    monthOptions,
    yearOptions,

    // Loading states
    subscriptionLoading,
    loading,
    isSyncing,

    // Computed values
    chartSize,

    // Handlers
    handleNavigateToTransactions,
    handleNavigateToCreateBudget,
    handleNavigateToBudgetHistory,
    handleNavigateToCategories,
    handleIntegrarDatos,
    handleMonthSelect,
    handleYearSelect,
    stopSync,
    handleSyncComplete,

    // Translation
    t,
  } = useBudgetSection();

  const floatingActions: FloatingAction[] = [
    {
      label: t('budget.new_budget', 'Nuevo Presupuesto'),
      icon: <Plus size={20} color={Colors.primary[500]} />,
      onPress: handleNavigateToCreateBudget,
    },
  ];

  if (subscriptionLoading || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <Container variant="secondaryPage">
      <BudgetHeader
        title={t('budget.title', 'Presupuesto')}
        onSyncPress={handleIntegrarDatos}
      />

      <KeyboardAwareContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Container variant="content" className="pt-4 pb-2">
            <DateSelector
              monthOptions={monthOptions}
              yearOptions={yearOptions}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthSelect={handleMonthSelect}
              onYearSelect={handleYearSelect}
              isLoading={loading}
              chartSize={chartSize}
            />
            {hasBudgets && (
              <BudgetChart
                selectedMonth={selectedMonth}
                totalIncome={0}
                totalExpenses={summary.total_spent}
                balance={summary.total_remaining}
                remainingBudget={summary.total_budgeted}
                isLoading={loading}
                hasRealData={hasBudgets}
              />
            )}

            {hasBudgets ? (
              <View className="mb-2">
                {budgetInstances.map((instance) => (
                  <BudgetInstanceCard
                    key={instance.id}
                    instance={instance}
                    onPress={() => handleNavigateToBudgetHistory(instance.id, instance.category.name)}
                  />
                ))}
              </View>
            ) : (
              <Card variant="outlined" size="lg" className="mb-4">
                <View className="items-center py-6">
                  <View
                    style={{
                      backgroundColor: Colors.gray[100],
                      padding: 16,
                      borderRadius: 50,
                      marginBottom: 16
                    }}
                  >
                    <PiggyBank size={40} color={Colors.gray[400]} />
                  </View>
                  <Text className="text-base font-semibold text-gray-800 mb-2 text-center">
                    {t('budget.no_budgets_title', 'Sin presupuestos')}
                  </Text>
                  <Text className="text-sm text-gray-500 text-center mb-4 px-4">
                    {t('budget.no_budgets_message', 'Crea tu primer presupuesto para controlar tus gastos por categoría')}
                  </Text>
                  <TouchableOpacity
                    onPress={handleNavigateToCreateBudget}
                    className="bg-primary-500 rounded-lg py-3 px-6 flex-row items-center"
                    activeOpacity={0.8}
                  >
                    <Plus size={18} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-medium">
                      {t('budget.create_first_budget', 'Crear Presupuesto')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </Card>
            )}

            <View className="mb-2">
              <QuickAccessButton
                label={t('budget.view_transactions', 'Ver Transacciones')}
                icon={<Receipt size={20} color={Colors.primary[500]} />}
                onPress={handleNavigateToTransactions}
                style={{ marginBottom: 10 }}
              />
              <QuickAccessButton
                label={t('budget.categories_manager', 'Categorías')}
                icon={<Tag size={20} color={Colors.primary[500]} />}
                onPress={handleNavigateToCategories}
              />
            </View>
          </Container>

          <View className="h-32" />
        </ScrollView>
      </KeyboardAwareContainer>

      {hasBudgets && <FloatingActionButton actions={floatingActions} />}

      <SyncModal
        visible={isSyncing}
        onClose={() => {
          stopSync();
        }}
        onSyncComplete={handleSyncComplete}
      />
    </Container>
  );
}
