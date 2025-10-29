import React from 'react';
import { ScrollView, Animated } from 'react-native';
import { FloidTransaction } from '@/services/budget/get-floid-transactions';
import { UncategorizedList } from '../UncategorizedList';
import { CategoriesList } from '../CategoriesList';

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
  onCategoryPress: (categoryId: string) => void;
  onCategoryLongPress: (categoryId: string) => void;
  onSubcategoryPress: (subcategoryId: string) => void;
  onSubcategoryLongPress: (subcategoryId: string) => void;
  onTransactionPress: (transactionId: number) => void;
  onToggleUncategorized: () => void;
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
  onCategoryPress,
  onCategoryLongPress,
  onSubcategoryPress,
  onSubcategoryLongPress,
  onTransactionPress,
  onToggleUncategorized,
  getRotateStyle,
}: BudgetTabProps) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <UncategorizedList
        uncategorizedTransactions={groupedData.uncategorized}
        isExpanded={expandedCategories.has('uncategorized')}
        rotateStyle={getRotateStyle('uncategorized', true)}
        selectedTransactions={selectedTransactions}
        transactionAnimations={transactionAnimations}
        transactionType={transactionType}
        onToggle={onToggleUncategorized}
        onTransactionPress={onTransactionPress}
      />

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
        onCategoryPress={onCategoryPress}
        onCategoryLongPress={onCategoryLongPress}
        onSubcategoryPress={onSubcategoryPress}
        onSubcategoryLongPress={onSubcategoryLongPress}
        onTransactionPress={onTransactionPress}
        getRotateStyle={getRotateStyle}
      />
    </ScrollView>
  );
}
