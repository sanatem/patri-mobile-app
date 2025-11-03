import { View } from 'react-native';
import { Container, Tabs, FloatingActionButton, Button, type FloatingAction } from '@/components/ui';
import { FolderPlus, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { BudgetTab } from './BudgetTab';
import { CategoriesManagerHeader } from './Header';
import { DeleteCategoriesModal } from './Modals/DeleteCategoriesModal';
import { DeleteTransactionsModal } from './Modals/DeleteTransactionsModal';
import { MoveTransactionsModal } from './Modals/MoveTransactionsModal';
import { SuccessMessage } from './SuccessMessage';
import { CategorizeButton } from './CategorizeButton';
import { CustomCategoryCard } from './CustomCategoryCard';
import { useCategoriesManager } from '../../../hooks/budget/useCategoriesManager';
import { UserCategoriesState } from '@/hooks/budget/useUserCategories';

interface CategoriesManagerProps {
  userCategories: UserCategoriesState;
  onResetOnboarding?: () => void;
}

export function CategoriesManager({ userCategories, onResetOnboarding }: CategoriesManagerProps) {
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
    deletingCategories,
    updatingCategory,
    editingParentCategoryId,
    pendingEdits,
    creatingNewCategory,
    creatingCustomCategory,
    creatingCategory,
    multipleNewCategories,
    multipleCustomCategories,

    // Computed values
    groupedData,
    categoryOptions,
    subcategoryOptions,
    currentLang,
    totalVisibleTransactions,
    availableSystemCategories,

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
    handleNewCustomCategory,
    handleSelectAllTransactions,
    handleDeselectAllTransactions,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleEditNameChange,
    handleEditEmojiChange,
    handleCancelNewCategory,
    handleSelectSystemCategory,
    handleConfirmNewCategory,
    handleConfirmCustomCategory,
    handleCustomCategoryNameChange,
    handleCustomCategoryEmojiChange,
    handleAddNewCategoryCard,
    handleRemoveNewCategoryCard,
    getMaxCategoriesAllowed,

    // Translation
    t,
  } = useCategoriesManager({ userCategories });

  const tabs = [
    { key: 'income', label: t('budget.income', 'Ingresos') },
    { key: 'expenses', label: t('budget.expenses', 'Gastos') }
  ];

  const floatingActions: FloatingAction[] = [
    {
      label: t('budget.new_category', 'Nueva Categoría'),
      icon: <FolderPlus size={20} color={Colors.primary[500]} />,
      onPress: handleNewCategory,
    },
    {
      label: 'Nueva Categoría Personalizada',
      icon: <Sparkles size={20} color={Colors.primary[500]} />,
      onPress: handleNewCustomCategory,
    },
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
        totalVisibleTransactions={totalVisibleTransactions}
        onCancelSelection={handleCancelSelection}
        onCancelTransactionSelection={handleCancelTransactionSelection}
        onDeleteSelected={handleDeleteSelected}
        onDeleteTransactions={handleDeleteTransactions}
        onMoveTransactions={handleMoveTransactions}
        onSelectAllTransactions={handleSelectAllTransactions}
        onDeselectAllTransactions={handleDeselectAllTransactions}
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
          updatingCategory={updatingCategory}
          editingParentCategoryId={editingParentCategoryId}
          pendingEdits={pendingEdits}
          creatingNewCategory={creatingNewCategory}
          creatingCustomCategory={creatingCustomCategory}
          multipleNewCategories={multipleNewCategories}
          multipleCustomCategories={multipleCustomCategories}
          availableSystemCategories={availableSystemCategories}
          onCategoryPress={handleCategoryPress}
          onCategoryLongPress={handleCategoryLongPress}
          onSubcategoryPress={handleSubcategoryPress}
          onSubcategoryLongPress={handleLongPress}
          onTransactionPress={handleTransactionPress}
          onToggleUncategorized={() => toggleCategory('uncategorized')}
          onSelectAllTransactions={handleSelectAllTransactions}
          onDeselectAllTransactions={handleDeselectAllTransactions}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
          onEditNameChange={handleEditNameChange}
          onEditEmojiChange={handleEditEmojiChange}
          onSelectSystemCategory={handleSelectSystemCategory}
          onCustomCategoryNameChange={handleCustomCategoryNameChange}
          onCustomCategoryEmojiChange={handleCustomCategoryEmojiChange}
          onAddCategory={handleNewCategory}
          onAddNewCategoryCard={handleAddNewCategoryCard}
          onRemoveNewCategoryCard={handleRemoveNewCategoryCard}
          maxCategoriesAllowed={getMaxCategoriesAllowed()}
          getRotateStyle={getRotateStyle}
        />

        {transactionSelectionMode && (
          <CategorizeButton
            onPress={handleMoveTransactions}
            label={t('budget.categorize', 'Categorizar')}
            visible={selectedTransactions.size > 0}
          />
        )}

        {creatingNewCategory && (
          <View
            style={{
              backgroundColor: '#fff',
              paddingHorizontal: 24,
              paddingVertical: 16,
              gap: 10,
            }}
          >
            <Button
              title={`Añadir ${multipleNewCategories.length > 1 ? `${multipleNewCategories.length} Categorías` : 'Categoría'}`}
              onPress={handleConfirmNewCategory}
              variant="primary"
              fullWidth
              loading={creatingCategory}
              disabled={!multipleNewCategories.every(card => card.systemCategoryId !== null)}
            />
            <Button
              title="Cancelar"
              onPress={handleCancelNewCategory}
              variant="ghost"
              fullWidth
            />
          </View>
        )}

        {creatingCustomCategory && (
          <View
            style={{
              backgroundColor: '#fff',
              paddingHorizontal: 24,
              paddingVertical: 16,
              gap: 10,
            }}
          >
            <Button
              title={`Añadir ${multipleCustomCategories.length > 1 ? `${multipleCustomCategories.length} Categorías` : 'Categoría'} Personalizada${multipleCustomCategories.length > 1 ? 's' : ''}`}
              onPress={handleConfirmCustomCategory}
              variant="primary"
              fullWidth
              loading={creatingCategory}
              disabled={!multipleCustomCategories.every(card => card.name.trim() !== '' && card.emoji.trim() !== '')}
            />
            <Button
              title="Cancelar"
              onPress={handleCancelNewCategory}
              variant="ghost"
              fullWidth
            />
          </View>
        )}

        {!transactionSelectionMode && !creatingNewCategory && !creatingCustomCategory && <FloatingActionButton actions={floatingActions} />}
      </View>

      <DeleteCategoriesModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        selectedCategories={selectedCategories}
        selectedSubcategories={selectedSubcategories}
        totalTransactionsToUncategorize={totalTransactionsToUncategorize}
        loading={deletingCategories}
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
