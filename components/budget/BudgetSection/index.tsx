import React, { useState } from 'react';
import { View, ScrollView, Text, Modal, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { Container, KeyboardAwareContainer, LoadingSpinner, FloatingActionButton, QuickAccessButton, Card, Button, CheckboxItem, type FloatingAction } from '@/components/ui';
import { BudgetHeader } from './Header';
import { BudgetInstanceCard } from './BudgetInstanceCard';
import { BudgetSummaryCard } from './BudgetSummaryCard';
import BudgetChart from './Chart/BudgetChart';
import { useBudgetSection } from '@/hooks/budget/useBudgetSection';
import { Plus, Receipt, ListTodo, Tag, Settings, X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { patchBudgetInstance } from '@/services/budget/budget-instances';
import { useAuth } from '@/providers/AuthProvider';
import type { BudgetInstance } from '@/services/budget/budget-templates/types';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function BudgetSectionOverview() {
  const { accessToken } = useAuth();
  const {
    // State
    currentPeriod,
    isCurrentMonth,

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
    handlePreviousMonth,
    handleNextMonth,

    // Refetch
    refetch,

    // Translation
    t,
  } = useBudgetSection();

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<BudgetInstance | null>(null);
  const [newAmount, setNewAmount] = useState('');
  const [updateTemplate, setUpdateTemplate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditInstance = (instance: BudgetInstance) => {
    setSelectedInstance(instance);
    setNewAmount(instance.amount.toString());
    setUpdateTemplate(false);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedInstance(null);
    setNewAmount('');
    setUpdateTemplate(false);
  };

  const handleSaveAmount = async () => {
    if (!selectedInstance || !accessToken) return;

    const amount = parseInt(newAmount.replace(/\D/g, ''), 10);
    if (amount <= 0) return;

    try {
      setIsUpdating(true);
      await patchBudgetInstance(
        selectedInstance.id,
        { amount, update_template: updateTemplate },
        accessToken
      );

      handleCloseEditModal();
      refetch();
    } catch (error) {
      console.error('Error updating instance:', error);
    } finally {
      setIsUpdating(false);
    }
  };

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
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        isCurrentMonth={isCurrentMonth}
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
                    onEdit={handleEditInstance}
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

      {/* Edit Instance Amount Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseEditModal}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleCloseEditModal}
          className="flex-1 justify-center items-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 mx-6"
            style={{ width: '85%' }}
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-semibold text-gray-800">
                {t('budget.edit_amount', 'Editar monto')}
              </Text>
              <TouchableOpacity onPress={handleCloseEditModal}>
                <X size={24} color={Colors.gray[500]} />
              </TouchableOpacity>
            </View>

            {selectedInstance && (
              <Text className="text-sm text-gray-500 mb-4">
                {selectedInstance.category?.emoji_code} {selectedInstance.category?.name}
              </Text>
            )}

            <Text className="text-sm font-medium text-gray-700 mb-2">
              {t('budget.new_amount', 'Nuevo monto')}
            </Text>

            <TextInput
              value={newAmount ? `$${parseInt(newAmount).toLocaleString('es-CL')}` : ''}
              onChangeText={(text) => setNewAmount(text.replace(/\D/g, ''))}
              placeholder="$0"
              keyboardType="numeric"
              className="border border-gray-200 rounded-xl px-4 py-3 text-lg mb-4"
              style={{
                backgroundColor: Colors.gray[50],
                color: Colors.gray[800],
              }}
            />

            <TouchableOpacity
              onPress={() => setUpdateTemplate(!updateTemplate)}
              className="flex-row items-center mb-6"
            >
              <CheckboxItem selected={updateTemplate} size={20} />
              <Text className="ml-3 text-sm" style={{ color: Colors.gray[700], flex: 1 }}>
                {t('budget.update_for_next_periods', 'Aplicar también para los siguientes períodos')}
              </Text>
            </TouchableOpacity>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={handleCloseEditModal}
                className="flex-1 py-3 rounded-xl items-center"
                style={{ backgroundColor: Colors.gray[100] }}
              >
                <Text className="font-medium" style={{ color: Colors.gray[600] }}>
                  {t('common.cancel', 'Cancelar')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveAmount}
                disabled={isUpdating || !newAmount || parseInt(newAmount) <= 0}
                className="flex-1 py-3 rounded-xl items-center"
                style={{
                  backgroundColor: Colors.primary[500],
                  opacity: isUpdating || !newAmount || parseInt(newAmount) <= 0 ? 0.5 : 1,
                }}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="font-medium text-white">{t('common.save', 'Guardar')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Container>
  );
}
