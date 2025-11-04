import type { UserCategory, TransactionCategory } from '@/services/budget/categories-manager';
import type { Animated } from 'react-native';

export interface CategoryTranslation {
  en: string;
  es: string;
  'es-CL': string;
}

export interface SubcategoryData {
  id: string;
  name: CategoryTranslation;
  emoji: string;
  originalName?: string;
  originalEmoji?: string;
  transactions: any[];
  total: number;
}

export interface CategoryData {
  id: string;
  name: CategoryTranslation;
  emoji: string;
  originalName?: string;
  originalEmoji?: string;
  subcategories?: SubcategoryData[];
  uncategorizedTransactions?: any[];
  total: number;
  transactionCount: number;
}

export interface GroupedData {
  categorized: CategoryData[];
  uncategorized: any[];
  categorizedTransactions: any[];
}

export interface NewCategoryCard {
  id: string;
  systemCategoryId: string | null;
}

export interface NewSubcategoryCard {
  id: string;
  systemSubcategoryId: string | null;
}

export interface CustomCategoryCard {
  id: string;
  name: string;
  emoji: string;
}

export interface PendingEdit {
  name: string;
  emoji: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface AnimationRefs {
  categoryRotations: Map<string, Animated.Value>;
  subcategoryRotations: Map<string, Animated.Value>;
  selectionAnimations: Map<string, Animated.Value>;
  transactionAnimations: Map<number, Animated.Value>;
}

export interface ScrollRefs {
  scrollViewRef: React.RefObject<any>;
  categoryCardRefs: Map<string, any>;
  subcategoryCardRefs: Map<string, any>;
  cardPositions: Map<string, number>;
}
