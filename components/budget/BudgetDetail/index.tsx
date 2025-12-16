import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Animated } from 'react-native';
import { Container, KeyboardAwareContainer, LoadingSpinner, Card, Header, ConfirmModal, SearchBar, SuccessMessage, Button } from '@/components/ui';
import { ChevronLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useBudgetDetail } from '@/hooks/budget/useBudgetDetail';
import { useBudgetDetailUncategorized } from '@/hooks/budget/useBudgetDetailUncategorized';
import { TransactionListItem } from './TransactionListItem';
import { UncategorizedList } from '../CategoriesManager/UncategorizedList';
import type { BudgetInstanceTransaction } from '@/services/budget/budget-instances';
import { getTranslatedNames } from '@/services/budget/utils/category-utils';
import { useTranslation } from 'react-i18next';

interface BudgetDetailProps {
  instanceId: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
};

const getBudgetStatus = (percentage: number, overBudget: boolean) => {
  if (overBudget || percentage > 80) {
    return { color: Colors.red[500], bgColor: Colors.red[100], label: 'Excedido' };
  }
  if (percentage > 60) {
    return { color: Colors.orange[500], bgColor: Colors.orange[100], label: 'En alerta' };
  }
  if (percentage > 40) {
    return { color: Colors.yellow[500], bgColor: Colors.yellow[100], label: 'En alerta' };
  }
  if (percentage > 20) {
    return { color: Colors.lime[500], bgColor: Colors.lime[100], label: 'En control' };
  }
  return { color: Colors.success[500], bgColor: Colors.success[100], label: 'En control' };
};

export function BudgetDetail({ instanceId }: BudgetDetailProps) {
  const {
    budgetInstance,
    transactions,
    transactionsCount,
    loading,
    showDeleteModal,
    setShowDeleteModal,
    isDeleting,
    handleDeactivate,
    handleEdit,
    handleGoBack,
    t,
  } = useBudgetDetail({ instanceId });

  const { i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const uncategorized = useBudgetDetailUncategorized({
    budgetCategoryId: budgetInstance?.category?.id || null,
    budgetCategoryKind: budgetInstance?.category?.kind || null,
  });

  const currentLang = i18n.language as 'en' | 'es' | 'es-CL';
  const isIncome = budgetInstance?.category?.kind === 'income';
  const translatedNames = budgetInstance?.category?.name
    ? getTranslatedNames(budgetInstance.category.name, isIncome)
    : null;
  const categoryName = translatedNames?.[currentLang] || translatedNames?.es || budgetInstance?.category?.name || 'Presupuesto';

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <LoadingSpinner />
      </View>
    );
  }

  if (!budgetInstance) {
    return (
      <Container variant="secondaryPage">
        <Header
          title={t('budget.detail', 'Detalle')}
          leftAction={
            <TouchableOpacity
              onPress={handleGoBack}
              className="w-10 h-10 rounded-full justify-center items-center"
            >
              <ChevronLeft size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          }
        />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: Colors.gray[500], textAlign: 'center' }}>
            {t('budget.not_found', 'Presupuesto no encontrado')}
          </Text>
        </View>
      </Container>
    );
  }

  const percentageNum = typeof budgetInstance.percentage === 'string'
    ? parseFloat(budgetInstance.percentage)
    : budgetInstance.percentage;
  const status = getBudgetStatus(percentageNum, budgetInstance.over_budget);
  const progressWidth = Math.min(percentageNum, 100);

  const filteredTransactions = searchQuery.trim()
    ? transactions.filter((t: BudgetInstanceTransaction) =>
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.bank.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions;

  return (
    <Container variant="secondaryPage">
      <Header
        title={categoryName}
        leftAction={
          <TouchableOpacity
            onPress={handleGoBack}
            className="w-10 h-10 rounded-full justify-center items-center"
          >
            <ChevronLeft size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
      />

      <KeyboardAwareContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Container variant="content" className="py-4">
            <Card variant="default" size="md" className="mb-4">
              <View className="flex-row items-center mb-4">
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: Colors.gray[50],
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{budgetInstance.category.emoji_code}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text className="text-lg font-medium" style={{ color: Colors.primary[500] }}>
                    {categoryName}
                  </Text>
                  <Text className="text-sm font-regular" style={{ color: Colors.gray[500] }}>
                    {budgetInstance.period}
                  </Text>
                </View>
                <View
                  style={{
                    backgroundColor: status.bgColor,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 6,
                  }}
                >
                  <Text className="text-xs font-medium" style={{ color: status.color }}>
                    {status.label}
                  </Text>
                </View>
              </View>

              <View className="mb-3">
                <View className="flex-row justify-end mb-2">
                  <Text className="text-sm font-medium" style={{ color: status.color }}>
                    {percentageNum.toFixed(0)}%
                  </Text>
                </View>

                <View
                  style={{
                    height: 10,
                    backgroundColor: Colors.gray[100],
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}
                >
                  <View
                    style={{
                      height: '100%',
                      width: `${progressWidth}%`,
                      backgroundColor: status.color,
                      borderRadius: 5,
                    }}
                  />
                </View>
              </View>

              <View className="flex-row justify-between pt-3" style={{ borderTopWidth: 1, borderTopColor: Colors.gray[100] }}>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text className="text-xs font-regular" style={{ color: Colors.gray[500] }}>
                    {t('budget.budget', 'Presupuesto')}
                  </Text>
                  <Text className="text-sm font-medium" style={{ color: Colors.primary[500] }}>
                    {formatCurrency(budgetInstance.amount)}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text className="text-xs font-regular" style={{ color: Colors.gray[500] }}>
                    {t('budget.spent', 'Gastado')}
                  </Text>
                  <Text className="text-sm font-medium" style={{ color: status.color }}>
                    {formatCurrency(budgetInstance.spent)}
                  </Text>
                </View>
                <View style={{ alignItems: 'center', flex: 1 }}>
                  <Text className="text-xs font-regular" style={{ color: Colors.gray[500] }}>
                    {budgetInstance.over_budget
                      ? t('budget.exceeded', 'Excedido')
                      : t('budget.remaining', 'Restante')}
                  </Text>
                  <Text
                    className="text-sm font-medium"
                    style={{ color: budgetInstance.over_budget ? Colors.error[500] : Colors.success[500] }}
                  >
                    {formatCurrency(budgetInstance.remaining)}
                  </Text>
                </View>
              </View>
            </Card>

            {uncategorized.uncategorizedTransactions.length > 0 && (
              <View className="mb-4">
                <UncategorizedList
                  uncategorizedTransactions={uncategorized.uncategorizedTransactions}
                  isExpanded={uncategorized.isExpanded}
                  isActive={true}
                  shouldShowContent={uncategorized.isExpanded}
                  rotateStyle={uncategorized.getRotateStyle('uncategorized')}
                  expansionStyle={uncategorized.getExpansionStyle('uncategorized')}
                  categoryRotations={uncategorized.categoryRotations}
                  categoryExpansions={uncategorized.categoryExpansions}
                  selectedTransactions={uncategorized.selectedTransactions}
                  transactionAnimations={uncategorized.transactionAnimations}
                  transactionType={budgetInstance?.category?.kind === 'income' ? 'income' : 'outcome'}
                  onToggle={uncategorized.toggleUncategorizedList}
                  onTransactionPress={uncategorized.handleTransactionPress}
                  onSelectAll={uncategorized.handleSelectAllTransactions}
                  onDeselectAll={uncategorized.handleDeselectAllTransactions}
                />
              </View>
            )}

            {/* Transactions Section */}
            <View className="mb-4">
              <Text className="text-base font-medium mb-2" style={{ color: Colors.primary[500] }}>
                {t('budget.transactions', 'Transacciones')} ({transactionsCount})
              </Text>

              {/* Search Bar */}
              {transactions.length > 0 && (
                <View className="mb-1">
                  <SearchBar
                    placeholder={t('budget.search_transactions', 'Buscar transacciones...')}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    fontSize={14}
                  />
                </View>
              )}

              <View className="mt-2">
                {filteredTransactions.length > 0 ? (
                  <>
                    {filteredTransactions.map((transaction: BudgetInstanceTransaction) => (
                      <TransactionListItem
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </>
                ) : (
                  <View style={{ padding: 40, alignItems: 'center' }}>
                    <Text className="text-sm font-regular" style={{ color: Colors.gray[500], textAlign: 'center' }}>
                      {searchQuery
                        ? t('budget.no_transactions_found', 'No se encontraron transacciones')
                        : t('budget.no_transactions', 'No hay transacciones en este período')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </Container>

          <View className="h-24" />
        </ScrollView>
      </KeyboardAwareContainer>

      {/* Categorize Button */}
      {uncategorized.transactionSelectionMode && (
        <View
          style={{
            backgroundColor: '#fff',
            paddingHorizontal: 24,
            paddingVertical: 16,
            paddingBottom: 32,
            borderTopWidth: 1,
            borderTopColor: Colors.gray[100],
          }}
        >
          <Button
            title={t('budget.categorize', 'Categorizar')}
            onPress={uncategorized.handleCategorize}
            variant="primary"
            fullWidth
          />
        </View>
      )}

      <ConfirmModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeactivate}
        title={t('budget.deactivate_budget', 'Desactivar Presupuesto')}
        message={t('budget.deactivate_budget_message', '¿Estás seguro que deseas desactivar este presupuesto? Ya no se generarán nuevas instancias.')}
        confirmButtonText={t('common.deactivate', 'Desactivar')}
        cancelButtonText={t('common.cancel', 'Cancelar')}
        isDeleting={isDeleting}
      />

      {/* Categorization Confirmation Modal */}
      <ConfirmModal
        visible={uncategorized.showMoveModal}
        onClose={uncategorized.handleCloseMoveModal}
        onConfirm={uncategorized.confirmCategorization}
        title={`${t('budget.categorize', 'Categorizar')} ${uncategorized.selectedTransactions.size} ${uncategorized.selectedTransactions.size === 1 ? 'transacción' : 'transacciones'}`}
        message={`¿Deseas categorizar las transacciones seleccionadas en "${categoryName}"?`}
        confirmButtonText={t('budget.categorize', 'Categorizar')}
        loadingText="Categorizando..."
        cancelButtonText={t('common.cancel', 'Cancelar')}
        isDeleting={uncategorized.assigningCategories}
      />

      <SuccessMessage
        visible={uncategorized.showSuccessMessage}
        message={uncategorized.successMessage}
      />
    </Container>
  );
}
