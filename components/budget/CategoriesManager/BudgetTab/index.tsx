import React from 'react';
import { ScrollView, Animated, View } from 'react-native';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { UncategorizedList } from '../UncategorizedList';
import { CategoriesList } from '../CategoriesList';
import { NewCategoryCard } from '../NewCategoryCard';
import { CustomCategoryCard } from '../CustomCategoryCard';
import { EmptyCategoriesState } from '../EmptyCategoriesState';

interface BudgetTabProps {
  groupedData: {
    categorized: Array<{
      id: string;
      name: { es: string; en: string; pt: string };
      emoji: string;
      subcategories?: Array<{
        id: string;
        name: { es: string; en: string; pt: string };
        emoji: string;
        transactions: FloidTransaction[];
        total: number;
      }>;
      uncategorizedTransactions: FloidTransaction[];
      total: number;
      transactionCount: number;
    }>;
    uncategorized: FloidTransaction[];
  };
  currentLang: string;
  selectionMode: boolean;
  selectedCategories: Set<string>;
  selectedSubcategories: Set<string>;
  selectedTransactions: Set<number>;
  expandedCategories: Set<string>;
  expandedSubcategories: Set<string>;
  selectionAnimations: Map<string, Animated.Value>;
  transactionAnimations: Map<number, Animated.Value>;
  transactionType: 'income' | 'outcome';
  updatingCategory: boolean;
  editingParentCategoryId: string | null;
  pendingEdits: Map<string, { name: string; emoji: string }>;
  creatingNewCategory: boolean;
  creatingCustomCategory: boolean;
  multipleNewCategories: Array<{ id: string; systemCategoryId: string | null }>;
  multipleCustomCategories: Array<{ id: string; name: string; emoji: string }>;
  availableSystemCategories: Array<{
    id: string;
    name: { es: string; en: string; pt: string; 'es-CL': string };
    emoji: string;
  }>;
  onCategoryPress: (categoryId: string) => void;
  onCategoryLongPress: (categoryId: string) => void;
  onSubcategoryPress: (subcategoryId: string) => void;
  onSubcategoryLongPress: (subcategoryId: string) => void;
  onTransactionPress: (transactionId: number) => void;
  onToggleUncategorized: () => void;
  onSelectAllTransactions?: () => void;
  onDeselectAllTransactions?: () => void;
  onStartEdit: (categoryId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditNameChange: (categoryId: string, name: string) => void;
  onEditEmojiChange: (categoryId: string, emoji: string) => void;
  onSelectSystemCategory: (cardId: string, categoryId: string) => void;
  onCustomCategoryNameChange: (cardId: string, name: string) => void;
  onCustomCategoryEmojiChange: (cardId: string, emoji: string) => void;
  onAddCategory: () => void;
  onAddNewCategoryCard: () => void;
  onRemoveNewCategoryCard: (cardId: string) => void;
  maxCategoriesAllowed: number;
  getRotateStyle: (id: string, isCategory: boolean) => any;
}

export function BudgetTab({
  groupedData,
  currentLang,
  selectionMode,
  selectedCategories,
  selectedSubcategories,
  selectedTransactions,
  expandedCategories,
  expandedSubcategories,
  selectionAnimations,
  transactionAnimations,
  transactionType,
  updatingCategory,
  editingParentCategoryId,
  pendingEdits,
  creatingNewCategory,
  creatingCustomCategory,
  multipleNewCategories,
  multipleCustomCategories,
  availableSystemCategories,
  onCategoryPress,
  onCategoryLongPress,
  onSubcategoryPress,
  onSubcategoryLongPress,
  onTransactionPress,
  onToggleUncategorized,
  onSelectAllTransactions,
  onDeselectAllTransactions,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onEditEmojiChange,
  onSelectSystemCategory,
  onCustomCategoryNameChange,
  onCustomCategoryEmojiChange,
  onAddCategory,
  onAddNewCategoryCard,
  onRemoveNewCategoryCard,
  maxCategoriesAllowed,
  getRotateStyle,
}: BudgetTabProps) {
  // Verificar si hay categorías creadas
  const hasCategories = groupedData.categorized.length > 0;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Mostrar lista de transacciones sin categorizar solo si hay categorías */}
      {hasCategories && (
        <UncategorizedList
          uncategorizedTransactions={groupedData.uncategorized}
          isExpanded={expandedCategories.has('uncategorized')}
          rotateStyle={getRotateStyle('uncategorized', true)}
          selectedTransactions={selectedTransactions}
          transactionAnimations={transactionAnimations}
          transactionType={transactionType}
          onToggle={onToggleUncategorized}
          onTransactionPress={onTransactionPress}
          onSelectAll={onSelectAllTransactions}
          onDeselectAll={onDeselectAllTransactions}
        />
      )}

      {/* Mostrar estado vacío o lista de categorías */}
      {!hasCategories && !creatingNewCategory && !creatingCustomCategory ? (
        <EmptyCategoriesState onAddCategory={onAddCategory} />
      ) : (
        <CategoriesList
        categorizedData={groupedData.categorized}
        currentLang={currentLang}
        selectionMode={selectionMode}
        selectedCategories={selectedCategories}
        selectedSubcategories={selectedSubcategories}
        selectedTransactions={selectedTransactions}
        expandedCategories={expandedCategories}
        expandedSubcategories={expandedSubcategories}
        selectionAnimations={selectionAnimations}
        transactionAnimations={transactionAnimations}
        transactionType={transactionType}
        updatingCategory={updatingCategory}
        editingParentCategoryId={editingParentCategoryId}
        pendingEdits={pendingEdits}
        onCategoryPress={onCategoryPress}
        onCategoryLongPress={onCategoryLongPress}
        onSubcategoryPress={onSubcategoryPress}
        onSubcategoryLongPress={onSubcategoryLongPress}
        onTransactionPress={onTransactionPress}
        onStartEdit={onStartEdit}
        onCancelEdit={onCancelEdit}
        onSaveEdit={onSaveEdit}
        onEditNameChange={onEditNameChange}
        onEditEmojiChange={onEditEmojiChange}
        getRotateStyle={getRotateStyle}
      />
      )}

      {creatingNewCategory && multipleNewCategories.map((card, index) => (
        <NewCategoryCard
          key={card.id}
          currentLang={currentLang}
          availableCategories={availableSystemCategories}
          selectedCategoryId={card.systemCategoryId}
          onSelectCategory={(categoryId) => onSelectSystemCategory(card.id, categoryId)}
          showAddButton={index === multipleNewCategories.length - 1}
          showRemoveButton={multipleNewCategories.length > 1}
          onAdd={onAddNewCategoryCard}
          onRemove={() => onRemoveNewCategoryCard(card.id)}
          canAdd={maxCategoriesAllowed > multipleNewCategories.length}
        />
      ))}

      {creatingCustomCategory && multipleCustomCategories.map((card, index) => (
        <CustomCategoryCard
          key={card.id}
          categoryName={card.name}
          categoryEmoji={card.emoji}
          onNameChange={(text) => onCustomCategoryNameChange(card.id, text)}
          onEmojiChange={(text) => onCustomCategoryEmojiChange(card.id, text)}
          showAddButton={index === multipleCustomCategories.length - 1}
          showRemoveButton={multipleCustomCategories.length > 1}
          onAdd={onAddNewCategoryCard}
          onRemove={() => onRemoveNewCategoryCard(card.id)}
          canAdd={maxCategoriesAllowed > multipleCustomCategories.length}
        />
      ))}
    </ScrollView>
  );
}
