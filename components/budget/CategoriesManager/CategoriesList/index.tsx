import React from 'react';
import { Animated } from 'react-native';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import { CategoryItem } from './CategoryItem';

interface CategoriesListProps {
  categorizedData: Array<{
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
  getRotateStyle: (id: string, isCategory: boolean) => any;
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
  getRotateStyle,
}: CategoriesListProps) {
  return (
    <>
      {categorizedData.map((category) => {
        const isCategorySelected = selectedCategories.has(category.id);
        const categoryAnimation = selectionAnimations.get(category.id) || new Animated.Value(0);
        const isExpanded = expandedCategories.has(category.id);
        const categoryRotateStyle = getRotateStyle(category.id, true);

        return (
          <CategoryItem
            key={category.id}
            category={category}
            currentLang={currentLang}
            selectionMode={selectionMode}
            isCategorySelected={isCategorySelected}
            isExpanded={isExpanded}
            categoryAnimation={categoryAnimation}
            categoryRotateStyle={categoryRotateStyle}
            expandedSubcategories={expandedSubcategories}
            selectedSubcategories={selectedSubcategories}
            selectedTransactions={selectedTransactions}
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
        );
      })}
    </>
  );
}
