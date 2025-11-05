import React from 'react';
import { Animated } from 'react-native';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { CategoryTranslation } from '@/hooks/budget/useCategoriesManager/types';
import { CategoryItem } from './CategoryItem';

interface CategoriesListProps {
  categorizedData: Array<{
    id: string;
    name: CategoryTranslation;
    emoji: string;
    subcategories?: Array<{
      id: string;
      name: CategoryTranslation;
      emoji: string;
      transactions: FloidTransaction[];
      total: number;
    }>;
    uncategorizedTransactions: FloidTransaction[];
    total: number;
    transactionCount: number;
  }>;
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
  addingSubcategoryForCategoryId: string | null;
  multipleNewSubcategories: Array<{ id: string; systemSubcategoryId: string | null }>;
  multipleCustomSubcategories: Array<{ id: string; name: string; emoji: string }>;
  creatingCategory: boolean;
  subcategoryCardRefs: Map<string, any>;
  scrollViewRef?: any;
  isPremium: boolean;
  onCategoryPress: (categoryId: string) => void;
  onCategoryLongPress: (categoryId: string) => void;
  onSubcategoryPress: (subcategoryId: string) => void;
  onSubcategoryLongPress: (subcategoryId: string) => void;
  onTransactionPress: (transactionId: number) => void;
  onStartEdit: (categoryId: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onEditNameChange: (categoryId: string, name: string) => void;
  onEditEmojiChange: (categoryId: string, emoji: string) => void;
  onAddSubcategory: (categoryId: string) => void;
  onCancelAddSubcategory: () => void;
  onSelectSystemSubcategory: (cardId: string, subcategoryId: string) => void;
  onAddNewSubcategoryCard: (categoryId: string) => void;
  onRemoveNewSubcategoryCard: (cardId: string) => void;
  onCustomSubcategoryNameChange: (cardId: string, text: string) => void;
  onCustomSubcategoryEmojiChange: (cardId: string, text: string) => void;
  onAddNewCustomSubcategoryCard: () => void;
  onRemoveCustomSubcategoryCard: (cardId: string) => void;
  onConfirmNewSubcategories: () => void;
  onPremiumFeaturePress: (featureName: string) => void;
  getAvailableSubcategoriesForCategory: (categoryId: string, currentCardId?: string) => Array<{
    id: string;
    name: CategoryTranslation;
    emoji: string;
  }>;
  canAddMoreSubcategories: (categoryId: string) => boolean;
  getMaxSubcategoriesAllowed: (categoryId: string) => number;
  getRotateStyle: (id: string, isCategory: boolean, isExpanded?: boolean) => any;
  getExpansionStyle: (id: string, isCategory: boolean, isExpanded?: boolean) => any;
  categoryRotations: Map<string, Animated.Value>;
  categoryExpansions: Map<string, Animated.Value>;
  subcategoryRotations: Map<string, Animated.Value>;
  subcategoryExpansions: Map<string, Animated.Value>;
  activeCategoryId?: string | null;
}

export function CategoriesList({
  categorizedData,
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
  addingSubcategoryForCategoryId,
  multipleNewSubcategories,
  multipleCustomSubcategories,
  creatingCategory,
  subcategoryCardRefs,
  scrollViewRef,
  isPremium,
  activeCategoryId,
  onCategoryPress,
  onCategoryLongPress,
  onSubcategoryPress,
  onSubcategoryLongPress,
  onTransactionPress,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onEditNameChange,
  onEditEmojiChange,
  onAddSubcategory,
  onCancelAddSubcategory,
  onSelectSystemSubcategory,
  onAddNewSubcategoryCard,
  onRemoveNewSubcategoryCard,
  onCustomSubcategoryNameChange,
  onCustomSubcategoryEmojiChange,
  onAddNewCustomSubcategoryCard,
  onRemoveCustomSubcategoryCard,
  onConfirmNewSubcategories,
  onPremiumFeaturePress,
  getAvailableSubcategoriesForCategory,
  canAddMoreSubcategories,
  getMaxSubcategoriesAllowed,
  getRotateStyle,
  getExpansionStyle,
  categoryRotations,
  categoryExpansions,
  subcategoryRotations,
  subcategoryExpansions,
}: CategoriesListProps) {
  return (
    <>
      {categorizedData.map((category, index) => {
        const isCategorySelected = selectedCategories.has(category.id);
        const categoryAnimation = selectionAnimations.get(category.id) || new Animated.Value(0);
        const isExpanded = expandedCategories.has(category.id);
        const categoryRotateStyle = getRotateStyle(category.id, true, isExpanded);
        // Todas las categorías están siempre activas para permitir múltiples expansiones
        const isActive = true;

        return (
          <CategoryItem
            key={category.id}
            category={category}
            currentLang={currentLang}
            selectionMode={selectionMode}
            isCategorySelected={isCategorySelected}
            isExpanded={isExpanded}
            isActive={isActive}
            categoryAnimation={categoryAnimation}
            categoryRotateStyle={categoryRotateStyle}
            categoryRotations={categoryRotations}
            categoryExpansions={categoryExpansions}
            subcategoryRotations={subcategoryRotations}
            subcategoryExpansions={subcategoryExpansions}
            expandedSubcategories={expandedSubcategories}
            selectedSubcategories={selectedSubcategories}
            selectedTransactions={selectedTransactions}
            selectionAnimations={selectionAnimations}
            transactionAnimations={transactionAnimations}
            transactionType={transactionType}
            updatingCategory={updatingCategory}
            editingParentCategoryId={editingParentCategoryId}
            pendingEdits={pendingEdits}
            addingSubcategoryForCategoryId={addingSubcategoryForCategoryId}
            multipleNewSubcategories={multipleNewSubcategories}
            multipleCustomSubcategories={multipleCustomSubcategories}
            creatingCategory={creatingCategory}
            subcategoryCardRefs={subcategoryCardRefs}
            scrollViewRef={scrollViewRef}
            isPremium={isPremium}
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
            onAddSubcategory={onAddSubcategory}
            onCancelAddSubcategory={onCancelAddSubcategory}
            onSelectSystemSubcategory={onSelectSystemSubcategory}
            onAddNewSubcategoryCard={onAddNewSubcategoryCard}
            onRemoveNewSubcategoryCard={onRemoveNewSubcategoryCard}
            onCustomSubcategoryNameChange={onCustomSubcategoryNameChange}
            onCustomSubcategoryEmojiChange={onCustomSubcategoryEmojiChange}
            onAddNewCustomSubcategoryCard={onAddNewCustomSubcategoryCard}
            onRemoveCustomSubcategoryCard={onRemoveCustomSubcategoryCard}
            onConfirmNewSubcategories={onConfirmNewSubcategories}
            onPremiumFeaturePress={onPremiumFeaturePress}
            getAvailableSubcategoriesForCategory={getAvailableSubcategoriesForCategory}
            canAddMoreSubcategories={canAddMoreSubcategories}
            getMaxSubcategoriesAllowed={getMaxSubcategoriesAllowed}
            getRotateStyle={getRotateStyle}
            getExpansionStyle={getExpansionStyle}
          />
        );
      })}
    </>
  );
}
