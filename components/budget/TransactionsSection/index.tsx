import React from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { Container, KeyboardAwareContainer, SyncModal, LoadingSpinner, Header, FloatingActionButton, type FloatingAction } from '@/components/ui';
import { Filters } from './Filters';
import { TransactionsSection } from './Transactions';
import { DeleteTransactionModal } from './Modals/DeleteTransactionModal';
import { useTransactionsOverview } from '@/hooks/budget/useTransactionsOverview';
import { ChevronLeft, RefreshCw, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

export function TransactionsOverview() {
  const router = useRouter();

  const {
    // State
    selectedMonth,
    selectedYear,
    activeTab,
    searchQuery,
    showDeleteModal,
    isDeleting,
    selectedAccountId,

    // Data
    accountOptions,
    monthOptions,
    yearOptions,
    incomeTransactions,
    expenseTransactions,
    totalIncome,
    totalExpenses,
    tabs,

    // Loading states
    subscriptionLoading,
    accountsLoading,
    shouldShowTransactionSkeletons,
    incomeLoading,
    expenseLoading,
    isSyncing,

    // Pagination
    hasMoreIncome,
    hasMoreExpenses,
    loadMoreIncome,
    loadMoreExpenses,

    // Computed values
    chartSize,
    contentWidth,

    // Handlers
    setActiveTab,
    setSearchQuery,
    setSelectedAccountId,
    handleMonthSelect,
    handleIntegrarDatos,
    handleAddTransaction,
    handleCategoriesManager,
    handleTransactionPress,
    handleTransactionDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleCollapseIncome,
    handleCollapseExpenses,
    stopSync,
    handleSyncComplete,
    hasRealData,

    // Translation
    t,
  } = useTransactionsOverview();

  const floatingActions: FloatingAction[] = [
    {
      label: t('budget.new_income_expense', 'Nuevo Ingreso/Gasto'),
      icon: <Plus size={20} color={Colors.primary[500]} />,
      onPress: handleAddTransaction,
    },
  ];

  if (subscriptionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <Container variant="secondaryPage">
      <Header
        title={t('budget.transactions_title', 'Transacciones')}
        leftAction={
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full justify-center items-center"
          >
            <ChevronLeft size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
        rightAction={
          <TouchableOpacity
            onPress={handleIntegrarDatos}
            className="mr-3"
          >
            <RefreshCw size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
      />

      <KeyboardAwareContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Container variant="content" className="pt-4 pb-0">
            <Filters
              accountOptions={accountOptions}
              selectedAccountId={selectedAccountId}
              onAccountSelect={setSelectedAccountId}
              monthOptions={monthOptions}
              yearOptions={yearOptions}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthSelect={handleMonthSelect}
              onYearSelect={(year) => {}}
              isLoading={accountsLoading}
              chartSize={chartSize}
              accountPlaceholder={t('budget.select_account', 'Seleccionar cuenta')}
              noAccountsLabel={t('budget.no_accounts', 'No hay cuentas sincronizadas')}
            />
          </Container>

          <TransactionsSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder={activeTab === 'income' ? t('labels.budget.search_income_placeholder') : t('labels.budget.search_expenses_placeholder')}
            onCategoriesPress={handleCategoriesManager}
            categoriesLabel={t('budget.categories_manager', 'Categorías')}
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as 'income' | 'expenses')}
            totalLabel={activeTab === 'income' ? t('budget.total_income') : t('budget.total_expenses')}
            totalIncome={totalIncome}
            totalExpenses={totalExpenses}
            selectedMonth={selectedMonth}
            incomeTransactions={incomeTransactions}
            expenseTransactions={expenseTransactions}
            incomeLoading={incomeLoading}
            expenseLoading={expenseLoading}
            hasRealData={hasRealData}
            onLoadMoreIncome={loadMoreIncome}
            onLoadMoreExpenses={loadMoreExpenses}
            hasMoreIncome={hasMoreIncome}
            hasMoreExpenses={hasMoreExpenses}
            onCollapseIncome={handleCollapseIncome}
            onCollapseExpenses={handleCollapseExpenses}
            onItemPress={handleTransactionPress}
            onItemDelete={handleTransactionDelete}
            shouldShowSkeletons={shouldShowTransactionSkeletons}
            contentWidth={contentWidth}
          />

          <View className="h-32" />
        </ScrollView>
      </KeyboardAwareContainer>

      <FloatingActionButton actions={floatingActions} />

      <SyncModal
        visible={isSyncing}
        onClose={() => {
          stopSync();
        }}
        onSyncComplete={handleSyncComplete}
      />

      <DeleteTransactionModal
        visible={showDeleteModal}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        title={t('budget.delete_transaction')}
        message={t('budget.delete_transaction_message')}
        confirmButtonText={t('common.delete', 'Eliminar')}
        cancelButtonText={t('common.cancel')}
      />
    </Container>
  );
}
