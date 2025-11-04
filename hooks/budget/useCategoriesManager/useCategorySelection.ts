import { useState } from 'react';
import { LayoutAnimation, Alert } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { deleteUserCategory } from '@/services/budget/categories-manager';
import type { CategoryData } from './types';

interface UseCategorySelectionProps {
  categories: CategoryData[];
  groupedData: { categorized: CategoryData[]; uncategorized: any[] };
  animateSelection: (id: string, selected: boolean) => void;
  batchAnimateSelections: (ids: string[], selected: boolean) => void;
  reloadCategories: () => Promise<void>;
  refetchTransactions: () => Promise<void>;
}

export function useCategorySelection({
  categories,
  groupedData,
  animateSelection,
  batchAnimateSelections,
  reloadCategories,
  refetchTransactions,
}: UseCategorySelectionProps) {
  const { accessToken } = useAuth();

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalTransactionsToUncategorize, setTotalTransactionsToUncategorize] = useState(0);
  const [deletingCategories, setDeletingCategories] = useState(false);

  // Handle long press on subcategory
  const handleLongPress = (subcategoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionMode(true);
    const newSelected = new Set(selectedSubcategories);
    newSelected.add(subcategoryId);
    setSelectedSubcategories(newSelected);
    animateSelection(subcategoryId, true);
  };

  // Handle long press on category
  const handleCategoryLongPress = (categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionMode(true);
    const newSelected = new Set(selectedCategories);
    newSelected.add(categoryId);
    setSelectedCategories(newSelected);

    const category = categories.find(cat => cat.id === categoryId);
    if (category?.subcategories) {
      const newSelectedSubs = new Set(selectedSubcategories);
      const subcategoryIds: string[] = [];
      category.subcategories.forEach(subcat => {
        newSelectedSubs.add(subcat.id);
        subcategoryIds.push(subcat.id);
      });
      setSelectedSubcategories(newSelectedSubs);
      batchAnimateSelections(subcategoryIds, true);
    }

    animateSelection(categoryId, true);
  };

  // Handle category press (toggle selection or expand)
  const handleCategoryPress = (categoryId: string, toggleExpansion: () => void) => {
    if (selectionMode) {
      const newSelected = new Set(selectedCategories);
      const isCurrentlySelected = newSelected.has(categoryId);

      if (isCurrentlySelected) {
        newSelected.delete(categoryId);
      } else {
        newSelected.add(categoryId);
      }
      setSelectedCategories(newSelected);

      const category = categories.find(cat => cat.id === categoryId);
      if (category?.subcategories) {
        const newSelectedSubs = new Set(selectedSubcategories);
        const subcategoryIds: string[] = [];
        category.subcategories.forEach(subcat => {
          if (isCurrentlySelected) {
            newSelectedSubs.delete(subcat.id);
          } else {
            newSelectedSubs.add(subcat.id);
          }
          subcategoryIds.push(subcat.id);
        });
        setSelectedSubcategories(newSelectedSubs);
        batchAnimateSelections(subcategoryIds, !isCurrentlySelected);
      }

      animateSelection(categoryId, !isCurrentlySelected);

      const newSubsSize = category?.subcategories
        ? (isCurrentlySelected
            ? selectedSubcategories.size - category.subcategories.length
            : selectedSubcategories.size + category.subcategories.length)
        : selectedSubcategories.size;

      if (newSelected.size === 0 && newSubsSize === 0) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectionMode(false);
      }
    } else {
      toggleExpansion();
    }
  };

  // Handle subcategory press (toggle selection or expand)
  const handleSubcategoryPress = (subcategoryId: string, toggleExpansion: () => void) => {
    if (selectionMode) {
      const newSelected = new Set(selectedSubcategories);
      const isCurrentlySelected = newSelected.has(subcategoryId);

      if (isCurrentlySelected) {
        newSelected.delete(subcategoryId);
      } else {
        newSelected.add(subcategoryId);
      }
      setSelectedSubcategories(newSelected);

      animateSelection(subcategoryId, !isCurrentlySelected);

      if (newSelected.size === 0 && selectedCategories.size === 0) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectionMode(false);
      }
    } else {
      toggleExpansion();
    }
  };

  // Cancel selection
  const handleCancelSelection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const allSelectedIds = [...Array.from(selectedSubcategories), ...Array.from(selectedCategories)];
    batchAnimateSelections(allSelectedIds, false);

    setSelectionMode(false);
    setSelectedSubcategories(new Set());
    setSelectedCategories(new Set());
  };

  // Show delete confirmation modal
  const handleDeleteSelected = () => {
    let totalTransactions = 0;

    groupedData.categorized.forEach(category => {
      if (selectedCategories.has(category.id)) {
        totalTransactions += category.transactionCount;
      }

      category.subcategories?.forEach(subcat => {
        if (selectedSubcategories.has(subcat.id)) {
          totalTransactions += subcat.transactions.length;
        }
      });
    });

    setTotalTransactionsToUncategorize(totalTransactions);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      setShowDeleteModal(false);
      return;
    }

    try {
      setDeletingCategories(true);

      const subcategoryIdsToDelete: number[] = [];
      const parentCategoryIdsToDelete: number[] = [];

      selectedCategories.forEach(id => {
        parentCategoryIdsToDelete.push(parseInt(id));
      });

      selectedSubcategories.forEach(subcatId => {
        subcategoryIdsToDelete.push(parseInt(subcatId));
      });

      selectedCategories.forEach(catId => {
        const category = categories.find(cat => cat.id === catId);
        if (category?.subcategories) {
          category.subcategories.forEach(subcat => {
            const subcatIdNum = parseInt(subcat.id);
            if (!subcategoryIdsToDelete.includes(subcatIdNum)) {
              subcategoryIdsToDelete.push(subcatIdNum);
            }
          });
        }
      });

      // Delete subcategories first
      if (subcategoryIdsToDelete.length > 0) {
        const deleteSubcategoryPromises = subcategoryIdsToDelete.map(id =>
          deleteUserCategory(id, accessToken)
        );
        await Promise.all(deleteSubcategoryPromises);
      }

      // Then delete parent categories
      if (parentCategoryIdsToDelete.length > 0) {
        const deleteParentPromises = parentCategoryIdsToDelete.map(id =>
          deleteUserCategory(id, accessToken)
        );
        await Promise.all(deleteParentPromises);
      }

      // Reset animations
      const allSelectedIds = [...Array.from(selectedSubcategories), ...Array.from(selectedCategories)];
      batchAnimateSelections(allSelectedIds, false);

      // Reset selections
      setSelectionMode(false);
      setSelectedSubcategories(new Set());
      setSelectedCategories(new Set());

      // Wait for animations and backend processing
      await new Promise(resolve => setTimeout(resolve, 400));

      // Reload data
      await reloadCategories();
      await refetchTransactions();

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      setShowDeleteModal(false);
      setDeletingCategories(false);

      Alert.alert('Éxito', 'Categorías eliminadas correctamente');

    } catch (error) {
      console.error('Error deleting categories:', error);
      setShowDeleteModal(false);
      setDeletingCategories(false);
      Alert.alert('Error', 'Hubo un problema al eliminar las categorías. Por favor intenta nuevamente.');
    }
  };

  return {
    // State
    selectionMode,
    selectedCategories,
    selectedSubcategories,
    showDeleteModal,
    totalTransactionsToUncategorize,
    deletingCategories,

    // Functions
    handleLongPress,
    handleCategoryLongPress,
    handleCategoryPress,
    handleSubcategoryPress,
    handleCancelSelection,
    handleDeleteSelected,
    confirmDelete,

    // Setters
    setShowDeleteModal,
  };
}
