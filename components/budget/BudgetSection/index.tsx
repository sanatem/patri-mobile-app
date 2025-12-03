import React from 'react';
import { View, ScrollView, Text } from 'react-native';
import { Container, KeyboardAwareContainer, LoadingSpinner, FloatingActionButton, QuickAccessButton, Card, Button, type FloatingAction } from '@/components/ui';
import { BudgetHeader } from './Header';
import { BudgetInstanceCard } from './BudgetInstanceCard';
import { BudgetSummaryCard } from './BudgetSummaryCard';
import BudgetChart from './Chart/BudgetChart';
import { useBudgetSection } from '@/hooks/budget/useBudgetSection';
import { Plus, Receipt, ListTodo, Tag, Settings } from 'lucide-react-native';
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
    currentPeriod,

    // Data
    budgetInstances,
    summary,
    hasBudgets,

    // Loading states
    subscriptionLoading,
    loading,

    // Handlers
    handleNavigateToTransactions,
    handleNavigateToCreateBudget,
    handleNavigateToBudgetDetail,
    handleNavigateToCategories,
    handleNavigateToBudgetSettings,

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
        subtitle={currentPeriod}
      />

      <KeyboardAwareContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Container variant="content" className="pt-4 pb-2">
            {hasBudgets ? (
              <>
                {/* Resumen General */}
                <BudgetSummaryCard summary={summary} />

                {/* Chart de progreso */}
                {summary.total_budget > 0 && (
                  <BudgetChart
                    selectedMonth={currentPeriod}
                    totalIncome={0}
                    totalExpenses={summary.total_spent}
                    balance={summary.total_remaining}
                    remainingBudget={summary.total_budget}
                    isLoading={loading}
                    hasRealData={true}
                  />
                )}

                {/* Lista de presupuestos (instances) */}
                <Text className="text-base font-semibold mb-3" style={{ color: Colors.gray[800] }}>
                  {t('budget.my_budgets', 'Mis Presupuestos')}
                </Text>

                {budgetInstances.map((instance) => (
                  <BudgetInstanceCard
                    key={instance.id}
                    instance={instance}
                    onPress={() => handleNavigateToBudgetDetail(instance.id)}
                  />
                ))}
              </>
            ) : (
              <Card variant="default" size="md" className="mb-4">
                <View className="flex-1 justify-center items-center py-4">
                  <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mb-4">
                    <ListTodo size={32} color={Colors.gray[400]} />
                  </View>
                  <Text className="text-center font-medium mb-2" style={{ color: Colors.gray[400] }}>
                    {t('budget.no_budgets_title', 'Sin presupuestos')}
                  </Text>
                  <Text className="text-center text-sm font-regular px-4 mb-4" style={{ color: Colors.gray[400] }}>
                    {t('budget.no_budgets_message', 'Crea tu primer presupuesto para controlar tus gastos por categoría')}
                  </Text>
                  <Button
                    className="mt-4"
                    variant="primary"
                    onPress={handleNavigateToCreateBudget}
                    title={t('budget.create_budget', 'Crear Presupuesto')}
                    icon={<Plus size={20} color="white" />}
                  />
                </View>
              </Card>
            )}

            {/* Quick Access Buttons */}
            <View className="mb-2 mt-4">
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
                style={{ marginBottom: 10 }}
              />
              <QuickAccessButton
                label={t('budget.budget_settings', 'Configurar Presupuestos')}
                icon={<Settings size={20} color={Colors.primary[500]} />}
                onPress={handleNavigateToBudgetSettings}
              />
            </View>
          </Container>

          <View className="h-32" />
        </ScrollView>
      </KeyboardAwareContainer>

      {hasBudgets && <FloatingActionButton actions={floatingActions} />}
    </Container>
  );
}
