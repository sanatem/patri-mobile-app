import React from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Container, KeyboardAwareContainer, LoadingSpinner, Card, FloatingActionButton, type FloatingAction } from '@/components/ui';
import { BudgetHeader } from '../BudgetOverview/Header';
import { BudgetInstanceCard } from './BudgetInstanceCard';
import { useBudgetSection } from '@/hooks/budget/useBudgetSection';
import { Plus, Receipt, PiggyBank } from 'lucide-react-native';
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
    handleNavigateToBudgetHistory,

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
        onPlusPress={handleNavigateToCreateBudget}
      />

      <KeyboardAwareContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Container variant="content" className="py-4">
            {/* Period Header */}
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              {currentPeriod}
            </Text>

            {/* Summary Card */}
            {hasBudgets && (
              <Card variant="elevated" size="md" className="mb-4">
                <View className="flex-row justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      {t('budget.total_budgeted', 'Presupuestado')}
                    </Text>
                    <Text className="text-base font-semibold text-gray-800">
                      {formatCurrency(summary.total_budgeted)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      {t('budget.total_spent', 'Gastado')}
                    </Text>
                    <Text className="text-base font-semibold text-gray-800">
                      {formatCurrency(summary.total_spent)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      {t('budget.remaining', 'Restante')}
                    </Text>
                    <Text
                      className="text-base font-semibold"
                      style={{ color: summary.total_remaining >= 0 ? Colors.success[500] : Colors.error[500] }}
                    >
                      {formatCurrency(summary.total_remaining)}
                    </Text>
                  </View>
                </View>

                {/* Status indicators */}
                <View className="flex-row pt-3 border-t border-gray-100">
                  {summary.over_budget_count > 0 && (
                    <View className="flex-row items-center mr-4">
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: Colors.error[500],
                          marginRight: 6
                        }}
                      />
                      <Text className="text-xs text-gray-600">
                        {summary.over_budget_count} {t('budget.exceeded', 'excedido')}
                      </Text>
                    </View>
                  )}
                  {summary.warning_count > 0 && (
                    <View className="flex-row items-center mr-4">
                      <View
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: Colors.warning[500],
                          marginRight: 6
                        }}
                      />
                      <Text className="text-xs text-gray-600">
                        {summary.warning_count} {t('budget.warning', 'alerta')}
                      </Text>
                    </View>
                  )}
                  <View className="flex-row items-center">
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: Colors.success[500],
                        marginRight: 6
                      }}
                    />
                    <Text className="text-xs text-gray-600">
                      {summary.healthy_count} OK
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Budget Instances List */}
            {hasBudgets ? (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-600 mb-3">
                  {t('budget.my_budgets', 'Mis Presupuestos')}
                </Text>
                {budgetInstances.map((instance) => (
                  <BudgetInstanceCard
                    key={instance.id}
                    instance={instance}
                    onPress={() => handleNavigateToBudgetHistory(instance.id, instance.category.name)}
                  />
                ))}
              </View>
            ) : (
              /* Empty State */
              <Card variant="elevated" size="lg" className="mb-4">
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

            {/* Transactions Navigation Button */}
            <TouchableOpacity
              onPress={handleNavigateToTransactions}
              className="bg-secondary-500 rounded-xl py-4 px-6 flex-row items-center justify-center"
              style={{
                shadowColor: Colors.secondary[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 4,
              }}
              activeOpacity={0.8}
            >
              <Receipt size={24} color="white" style={{ marginRight: 12 }} />
              <Text className="text-white font-semibold text-base">
                {t('budget.view_transactions', 'Ver Transacciones')}
              </Text>
            </TouchableOpacity>
          </Container>

          <View className="h-32" />
        </ScrollView>
      </KeyboardAwareContainer>

      {hasBudgets && <FloatingActionButton actions={floatingActions} />}
    </Container>
  );
}
