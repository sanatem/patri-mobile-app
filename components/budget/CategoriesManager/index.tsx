import { View } from 'react-native';
import { Container, Tabs } from '@/components/ui';
import { BudgetTab } from './BudgetTab';
import { CategoriesManagerHeader } from './Header';
import { DeleteCategoriesModal } from './Modals/DeleteCategoriesModal';
import { DeleteTransactionsModal } from './Modals/DeleteTransactionsModal';
import { MoveTransactionsModal } from './Modals/MoveTransactionsModal';
import { SuccessMessage } from './SuccessMessage';
import { FloatingActionButton } from './FloatingActionButton';
import { useCategoriesManager } from '../../../hooks/budget/useCategoriesManager';
import { UserCategoriesState } from '@/hooks/budget/useUserCategories';

interface CategoriesManagerProps {
  userCategories: UserCategoriesState;
}

export function CategoriesManager({ userCategories }: CategoriesManagerProps) {
  const {
    // State
    activeTab,
    expandedCategories,
    expandedSubcategories,
    selectionMode,
    selectedSubcategories,
    selectedCategories,
    showDeleteModal,
    totalTransactionsToUncategorize,
    transactionSelectionMode,
    selectedTransactions,
    showMoveModal,
    showDeleteTransactionsModal,
    selectedDestinationCategory,
    selectedDestinationSubcategory,
    showSuccessMessage,
    selectionAnimations,
    transactionAnimations,
    assigningCategories,

    // Computed values
    groupedData,
    categoryOptions,
    subcategoryOptions,
    currentLang,

    // Handlers
    setActiveTab,
    getRotateStyle,
    handleCategoryPress,
    handleCategoryLongPress,
    handleSubcategoryPress,
    handleLongPress,
    handleCancelSelection,
    handleDeleteSelected,
    confirmDelete,
    handleTransactionPress,
    handleCancelTransactionSelection,
    handleDeleteTransactions,
    confirmDeleteTransactions,
    handleMoveTransactions,
    handleCategoryChange,
    handleSubcategoryChange,
    confirmMoveTransactions,
    handleCloseMoveModal,
    setShowDeleteModal,
    setShowDeleteTransactionsModal,
    toggleCategory,
    handleNewCategory,

    // Translation
    t,
  } = useCategoriesManager({ userCategories });

  const tabs = [
    { key: 'income', label: t('budget.income', 'Ingresos') },
    { key: 'expenses', label: t('budget.expenses', 'Gastos') }
  ];

  return (
    <Container variant="secondaryPage">
      <CategoriesManagerHeader
        activeTab={activeTab}
        selectionMode={selectionMode}
        transactionSelectionMode={transactionSelectionMode}
        selectedCategories={selectedCategories}
        selectedSubcategories={selectedSubcategories}
        selectedTransactions={selectedTransactions}
        onCancelSelection={handleCancelSelection}
        onCancelTransactionSelection={handleCancelTransactionSelection}
        onDeleteSelected={handleDeleteSelected}
        onDeleteTransactions={handleDeleteTransactions}
        onMoveTransactions={handleMoveTransactions}
        t={t}
      />

      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as 'income' | 'expenses')}
          />
        </View>

        <BudgetTab
          groupedData={groupedData}
          currentLang={currentLang}
          selectionMode={selectionMode}
          selectedCategories={selectedCategories}
          selectedSubcategories={selectedSubcategories}
          selectedTransactions={selectedTransactions}
          expandedCategories={expandedCategories}
          expandedSubcategories={expandedSubcategories}
          selectionAnimations={selectionAnimations}
          transactionAnimations={transactionAnimations}
          transactionType={activeTab === 'income' ? 'income' : 'outcome'}
          onCategoryPress={handleCategoryPress}
          onCategoryLongPress={handleCategoryLongPress}
          onSubcategoryPress={handleSubcategoryPress}
          onSubcategoryLongPress={handleLongPress}
          onTransactionPress={handleTransactionPress}
          onToggleUncategorized={() => toggleCategory('uncategorized')}
          getRotateStyle={getRotateStyle}
        />

        <FloatingActionButton
          onPress={handleNewCategory}
          label={t('budget.new_category', 'Nueva Categoría')}
        />
      </View>

      <DeleteCategoriesModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        selectedCategories={selectedCategories}
        selectedSubcategories={selectedSubcategories}
        totalTransactionsToUncategorize={totalTransactionsToUncategorize}
        t={t}
      />

      <DeleteTransactionsModal
        visible={showDeleteTransactionsModal}
        onClose={() => setShowDeleteTransactionsModal(false)}
        onConfirm={confirmDeleteTransactions}
        selectedTransactionsCount={selectedTransactions.size}
        t={t}
      />

      <MoveTransactionsModal
        visible={showMoveModal}
        onClose={handleCloseMoveModal}
        onConfirm={confirmMoveTransactions}
        selectedTransactionsCount={selectedTransactions.size}
        categoryOptions={categoryOptions}
        subcategoryOptions={subcategoryOptions}
        selectedDestinationCategory={selectedDestinationCategory}
        selectedDestinationSubcategory={selectedDestinationSubcategory}
        onCategoryChange={handleCategoryChange}
        onSubcategoryChange={handleSubcategoryChange}
        loading={assigningCategories}
        t={t}
      />

      <SuccessMessage
        visible={showSuccessMessage}
        message="Transacciones categorizadas correctamente"
      />
    </Container>
  );
}
