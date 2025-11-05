import React from 'react';
import { View, ScrollView, ActivityIndicator } from 'react-native';
import { Container, KeyboardAwareContainer, LockedTabOverlay, SyncModal } from '@/components/ui';
import { BudgetHeader } from './Header';
import { Filters } from './Filters';
import { BudgetChartSection } from './Chart';
import { TransactionsSection } from './Transactions';
import { AddActionsModal } from './Modals/AddActionsModal';
import { DeleteTransactionModal } from './Modals/DeleteTransactionModal';
import { InsightsCarouselSection } from './InsigthCarousel';
import { useBudgetOverview } from '@/hooks/budget/useBudgetOverview';
import Colors from '@/constants/Colors';

export function BudgetOverview() {
  const {
    // State
    selectedMonth,
    selectedYear,
    activeTab,
    searchQuery,
    showAddModal,
    modalVisible,
    showDeleteModal,
    isDeleting,
    selectedAccountId,

    // Animations
    overlayAnim,
    slideAnim,

    // Data
    accountOptions,
    monthOptions,
    yearOptions,
    incomeTransactions,
    expenseTransactions,
    totalIncome,
    totalExpenses,
    balance,
    hasDataForChart,
    tabs,

    // Loading states
    subscriptionLoading,
    accountsLoading,
    shouldShowSkeletons,
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
    shouldBlockTab,

    // Handlers
    setActiveTab,
    setSearchQuery,
    setShowAddModal,
    setSelectedAccountId,
    closeModal,
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
  } = useBudgetOverview();

  if (subscriptionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  // Budget tab is now free for all users - premium lock removed
  // if (shouldBlockTab("Presupuesto")) {
  //   return <LockedTabOverlay tabName={t('tabs.budget')} />;
  // }

  return (
    <Container variant="secondaryPage">
      <BudgetHeader
        title={t('budget.title')}
        onPlusPress={() => setShowAddModal(true)}
      />

      <KeyboardAwareContainer>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Container variant="content" className="py-4">
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

            <BudgetChartSection
              selectedMonth={selectedMonth}
              totalIncome={totalIncome}
              totalExpenses={totalExpenses}
              balance={balance}
              remainingBudget={totalIncome}
              isLoading={accountsLoading}
              hasRealData={hasDataForChart}
              chartSize={chartSize}
              shouldShowSkeletons={shouldShowSkeletons}
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

          <InsightsCarouselSection totalExpenses={totalExpenses} />

          <View className="h-24" />
        </ScrollView>
      </KeyboardAwareContainer>

      <AddActionsModal
        visible={showAddModal}
        modalVisible={modalVisible}
        overlayAnim={overlayAnim}
        slideAnim={slideAnim}
        onClose={closeModal}
        onAddTransaction={handleAddTransaction}
        onIntegrateDatos={handleIntegrarDatos}
        addTransactionLabel={t('budget.add_transaction')}
        integrateDatosLabel={t('budget.integrate_data')}
      />

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
