import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { updateUserCategory } from '@/services/budget/categories-manager';
import type { UserCategory } from '@/services/budget/categories-manager';
import type { PendingEdit, CategoryData } from './types';
import { filterEmojisFromText, extractEmojisFromText, isOnlyEmojis, containsEmojis } from '@/services/budget/utils/category-utils';

interface UseCategoryEditingProps {
  activeTab: 'income' | 'expenses';
  apiIncomeCategories: UserCategory[];
  apiExpenseCategories: UserCategory[];
  categories: CategoryData[]; // Transformed categories with translations
  currentLang: string;
  expandedCategories: Set<string>;
  toggleCategory: (categoryId: string) => void;
  reloadCategories: () => Promise<void>;
}

export function useCategoryEditing({
  activeTab,
  apiIncomeCategories,
  apiExpenseCategories,
  categories,
  currentLang,
  expandedCategories,
  toggleCategory,
  reloadCategories,
}: UseCategoryEditingProps) {
  const { accessToken } = useAuth();

  const [editingParentCategoryId, setEditingParentCategoryId] = useState<string | null>(null);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [pendingEdits, setPendingEdits] = useState<Map<string, PendingEdit>>(new Map());
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Start editing a category
  const handleStartEdit = (categoryId: string) => {
    // Find the transformed category (with translations)
    const transformedCategory = categories.find(cat => cat.id === categoryId);
    if (!transformedCategory) return;

    const newPendingEdits = new Map<string, PendingEdit>();

    // Get the translated name for the current language
    const categoryName = transformedCategory.name[currentLang as keyof typeof transformedCategory.name] ||
                         transformedCategory.name.es;

    // Add parent category with translated name
    newPendingEdits.set(categoryId, {
      name: categoryName,
      emoji: transformedCategory.emoji
    });

    // Add all subcategories with translated names
    if (transformedCategory.subcategories) {
      transformedCategory.subcategories.forEach(subcat => {
        const subcatName = subcat.name[currentLang as keyof typeof subcat.name] || subcat.name.es;
        newPendingEdits.set(subcat.id, {
          name: subcatName,
          emoji: subcat.emoji
        });
      });
    }

    setPendingEdits(newPendingEdits);
    setEditingParentCategoryId(categoryId);

    // Expand category if not expanded
    if (!expandedCategories.has(categoryId)) {
      toggleCategory(categoryId);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setPendingEdits(new Map());
    setEditingParentCategoryId(null);
  };

  // Handle name change during editing
  const handleEditNameChange = (categoryId: string, text: string) => {
    const filteredText = filterEmojisFromText(text);

    setPendingEdits(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(categoryId);
      if (current) {
        newMap.set(categoryId, { ...current, name: filteredText });
      }
      return newMap;
    });
  };

  // Handle emoji change during editing
  const handleEditEmojiChange = (categoryId: string, text: string) => {
    const filteredText = extractEmojisFromText(text);

    setPendingEdits(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(categoryId);
      if (current) {
        newMap.set(categoryId, { ...current, emoji: filteredText });
      }
      return newMap;
    });
  };

  // Save edits
  const handleSaveEdit = async () => {
    if (!accessToken || !editingParentCategoryId || pendingEdits.size === 0) return;

    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const findCategoryById = (id: string): UserCategory | undefined => {
      for (const cat of apiCategories) {
        if (cat.id.toString() === id) return cat;
        if (cat.children) {
          const found = cat.children.find(sub => sub.id.toString() === id);
          if (found) return found;
        }
      }
      return undefined;
    };

    // Validate all pending edits
    for (const [categoryId, edits] of pendingEdits.entries()) {
      // Validate name: should not contain emojis
      if (containsEmojis(edits.name)) {
        Alert.alert('Error', 'Los nombres no pueden contener emojis. Solo letras, números y símbolos.');
        return;
      }

      // Validate name: should not be empty
      if (edits.name.trim().length === 0) {
        Alert.alert('Error', 'Los nombres no pueden estar vacíos.');
        return;
      }

      // Validate emoji: should contain only emojis
      if (!isOnlyEmojis(edits.emoji)) {
        Alert.alert('Error', 'Los emojis solo pueden contener emojis válidos. No se permiten letras, números o símbolos.');
        return;
      }

      // Validate emoji: should not be empty
      if (edits.emoji.trim().length === 0) {
        Alert.alert('Error', 'Los emojis no pueden estar vacíos.');
        return;
      }
    }

    // Collect changes that are actually different
    const updates: Array<{ id: number; params: { name?: string; emoji_code?: string } }> = [];

    for (const [categoryId, edits] of pendingEdits.entries()) {
      const originalCategory = findCategoryById(categoryId);
      if (!originalCategory) continue;

      const hasNameChanged = edits.name !== originalCategory.name;
      const hasEmojiChanged = edits.emoji !== originalCategory.emoji_code;

      if (hasNameChanged || hasEmojiChanged) {
        const updateParams: { name?: string; emoji_code?: string } = {};
        if (hasNameChanged) updateParams.name = edits.name;
        if (hasEmojiChanged) updateParams.emoji_code = edits.emoji;

        updates.push({
          id: parseInt(categoryId),
          params: updateParams
        });
      }
    }

    // If no real changes, just cancel
    if (updates.length === 0) {
      handleCancelEdit();
      return;
    }

    try {
      setUpdatingCategory(true);

      // Update all categories/subcategories in parallel
      await Promise.all(
        updates.map(update => updateUserCategory(update.id, update.params, accessToken))
      );

      // Reload categories
      await reloadCategories();

      handleCancelEdit();

      // Show success message instead of Alert
      setSuccessMessage(`${updates.length} ${updates.length === 1 ? 'categoría actualizada' : 'categorías actualizadas'} correctamente`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

    } catch (error) {
      console.error('Error updating categories:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar las categorías');
    } finally {
      setUpdatingCategory(false);
    }
  };

  return {
    // State
    editingParentCategoryId,
    updatingCategory,
    pendingEdits,
    showSuccessMessage,
    successMessage,

    // Functions
    handleStartEdit,
    handleCancelEdit,
    handleEditNameChange,
    handleEditEmojiChange,
    handleSaveEdit,
  };
}
