import React, { useState } from 'react';
import { View, ScrollView, Text, Modal, TouchableOpacity } from 'react-native';
import { Container, KeyboardAwareContainer, LoadingSpinner, FloatingActionButton, QuickAccessButton, Card, Button, CheckboxItem, Input, type FloatingAction } from '@/components/ui';
import { BudgetHeader } from './Header';
import { BudgetInstanceCard } from './BudgetInstanceCard';
import { BudgetSummaryCard } from './BudgetSummaryCard';
import BudgetChart from './Chart/BudgetChart';
import { useBudgetSection } from '@/hooks/budget/useBudgetSection';
import { Plus, Receipt, ListTodo, Tag, Settings } from 'lucide-react-native';
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
                {(() => {
                  // Filtrar solo instancias activas para el cálculo del gráfico
                  const activeInstances = budgetInstances.filter(inst => inst.template_active !== false);
                  
                  // Calcular totales solo desde las instancias activas
                  const totalBudget = activeInstances.reduce((acc, inst) => acc + inst.amount, 0);
                  const totalSpent = activeInstances.reduce((acc, inst) => acc + inst.spent, 0);
                  const totalRemaining = totalBudget - totalSpent;

                  return (
                    <BudgetChart
                      selectedMonth={currentPeriod}
                      totalIncome={totalBudget}
                      totalExpenses={totalSpent}
                      balance={totalRemaining}
                      remainingBudget={totalBudget}
                      isLoading={loading}
                      hasRealData={activeInstances.length > 0}
                    />
                  );
                })()}

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
                disabled={!hasBudgets}
              />
            </View>
          </Container>

          <View className="h-32" />
        </ScrollView>
      </KeyboardAwareContainer>

      {hasBudgets && <FloatingActionButton actions={floatingActions} />}

      <Modal
        visible={showEditModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseEditModal}
      >
        <View style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 24,
            marginHorizontal: 20,
            width: '90%',
            maxWidth: 400,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 8,
          }}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Text className="text-md font-medium" style={{
                textAlign: 'center',
                color: Colors.primary[700],
              }}>
                {t('budget.edit_amount', 'Editar monto')}
              </Text>
            </View>

            <Input
              label={t('budget.new_amount', 'Nuevo monto')}
              value={newAmount ? `$${parseInt(newAmount).toLocaleString('es-CL')}` : ''}
              onChangeText={(text) => setNewAmount(text.replace(/\D/g, ''))}
              placeholder="$0"
              keyboardType="numeric"
            />

            <TouchableOpacity
              onPress={() => setUpdateTemplate(!updateTemplate)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <CheckboxItem selected={updateTemplate} size={20} />
              <Text className="ml-3 text-sm font-regular" style={{ color: Colors.gray[700], flex: 1 }}>
                {t('budget.update_for_next_periods', 'Aplicar también para los siguientes períodos')}
              </Text>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
              <View style={{ flex: 1 }}>
                <Button
                  title={t('common.cancel', 'Cancelar')}
                  variant="outline"
                  fullWidth
                  onPress={handleCloseEditModal}
                  disabled={isUpdating}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  title={isUpdating ? t('common.saving', 'Guardando...') : t('common.save', 'Guardar')}
                  variant="primary"
                  fullWidth
                  onPress={handleSaveAmount}
                  disabled={isUpdating || !newAmount || parseInt(newAmount) <= 0}
                  loading={isUpdating}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Container>
  );
}
