import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '@/providers/AuthProvider';
import { createUserCategory } from '@/services/budget/categories-manager';
import type { UserCategory, TransactionCategory } from '@/services/budget/categories-manager';
import type { NewCategoryCard, NewSubcategoryCard, CustomCategoryCard } from './types';
import { filterEmojisFromText, extractEmojisFromText, getEmojiFromBudgetCategories, getTranslatedNames } from '@/services/budget/utils/category-utils';

interface UseCategoryCreationProps {
  activeTab: 'income' | 'expenses';
  apiIncomeCategories: UserCategory[];
  apiExpenseCategories: UserCategory[];
  systemIncomeCategories: TransactionCategory[];
  systemExpenseCategories: TransactionCategory[];
  reloadCategories: () => Promise<void>;
  refetchTransactions: () => Promise<void>;
  scrollViewRef: React.RefObject<any>;
}

export function useCategoryCreation({
  activeTab,
  apiIncomeCategories,
  apiExpenseCategories,
  systemIncomeCategories,
  systemExpenseCategories,
  reloadCategories,
  refetchTransactions,
  scrollViewRef,
}: UseCategoryCreationProps) {
  const { accessToken } = useAuth();

  // Category creation state
  const [creatingNewCategory, setCreatingNewCategory] = useState(false);
  const [creatingCustomCategory, setCreatingCustomCategory] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [multipleNewCategories, setMultipleNewCategories] = useState<NewCategoryCard[]>([]);
  const [multipleCustomCategories, setMultipleCustomCategories] = useState<CustomCategoryCard[]>([]);

  // Subcategory creation state
  const [addingSubcategoryForCategoryId, setAddingSubcategoryForCategoryId] = useState<string | null>(null);
  const [multipleNewSubcategories, setMultipleNewSubcategories] = useState<NewSubcategoryCard[]>([]);
  const [multipleCustomSubcategories, setMultipleCustomSubcategories] = useState<CustomCategoryCard[]>([]);

  // Helper to scroll to a card
  const scrollToCard = (cardId: string, isSubcategory: boolean = false) => {
    const attemptScroll = (attempt: number = 0) => {
      if (attempt > 3) return;

      const delay = 150 * (attempt + 1);

      setTimeout(() => {
        const scrollRef = scrollViewRef.current;

        if (scrollRef) {
          try {
            scrollRef.scrollToEnd({ animated: true });
          } catch (error) {
            console.log('Error in scrollToCard, attempt', attempt + 1, error);
            if (attempt < 3) {
              attemptScroll(attempt + 1);
            }
          }
        }
      }, delay);
    };

    attemptScroll();
  };

  // ===== CATEGORY CREATION =====

  // Start creating new category from system
  const handleNewCategory = () => {
    const currentCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;

    if (currentCategories.length >= systemCategories.length) {
      Alert.alert(
        'Límite alcanzado',
        'Ya has agregado todas las categorías disponibles del sistema. No hay más categorías para agregar.'
      );
      return;
    }

    setCreatingNewCategory(true);
    setCreatingCustomCategory(false);
    const newCardId = Date.now().toString();
    setMultipleNewCategories([{ id: newCardId, systemCategoryId: null }]);

    scrollToCard(newCardId);
  };

  // Start creating custom category
  const handleNewCustomCategory = () => {
    setCreatingCustomCategory(true);
    setCreatingNewCategory(false);
    const newCardId = Date.now().toString();
    setMultipleCustomCategories([{ id: newCardId, name: '', emoji: '' }]);

    scrollToCard(newCardId);
  };

  // Cancel category creation
  const handleCancelNewCategory = () => {
    setCreatingNewCategory(false);
    setCreatingCustomCategory(false);
    setMultipleNewCategories([]);
    setMultipleCustomCategories([]);
  };

  // Select system category for a card
  const handleSelectSystemCategory = (cardId: string, categoryId: string) => {
    setMultipleNewCategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, systemCategoryId: categoryId } : card)
    );
  };

  // Handle custom category name change
  const handleCustomCategoryNameChange = (cardId: string, text: string) => {
    const filteredText = filterEmojisFromText(text);
    setMultipleCustomCategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, name: filteredText } : card)
    );
  };

  // Handle custom category emoji change
  const handleCustomCategoryEmojiChange = (cardId: string, text: string) => {
    const filteredEmoji = extractEmojisFromText(text);
    setMultipleCustomCategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, emoji: filteredEmoji } : card)
    );
  };

  // Add new category card
  const handleAddNewCategoryCard = () => {
    const currentCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;

    if (creatingNewCategory) {
      const currentCards = multipleNewCategories.length;
      const totalCategories = currentCategories.length + currentCards;

      if (totalCategories >= systemCategories.length) {
        Alert.alert(
          'Límite alcanzado',
          'Ya has alcanzado el límite de categorías disponibles del sistema.'
        );
        return;
      }

      const newCardId = Date.now().toString();
      setMultipleNewCategories(prev => [...prev, { id: newCardId, systemCategoryId: null }]);
      scrollToCard(newCardId);
    } else if (creatingCustomCategory) {
      const newCardId = Date.now().toString();
      setMultipleCustomCategories(prev => [...prev, { id: newCardId, name: '', emoji: '' }]);
      scrollToCard(newCardId);
    }
  };

  // Remove category card
  const handleRemoveNewCategoryCard = (cardId: string) => {
    if (creatingNewCategory) {
      setMultipleNewCategories(prev => {
        const newList = prev.filter(card => card.id !== cardId);
        if (newList.length === 0) {
          setCreatingNewCategory(false);
        }
        return newList;
      });
    } else if (creatingCustomCategory) {
      setMultipleCustomCategories(prev => {
        const newList = prev.filter(card => card.id !== cardId);
        if (newList.length === 0) {
          setCreatingCustomCategory(false);
        }
        return newList;
      });
    }
  };

  // Confirm new categories from system
  const handleConfirmNewCategory = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      return;
    }

    const invalidCards = multipleNewCategories.filter(card => !card.systemCategoryId);
    if (invalidCards.length > 0) {
      Alert.alert('Error', 'Por favor selecciona una categoría en todas las tarjetas');
      return;
    }

    try {
      setCreatingCategory(true);

      const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;

      const createPromises = multipleNewCategories.map(card => {
        const selectedCategory = systemCategories.find(cat => cat.id.toString() === card.systemCategoryId);
        if (!selectedCategory) return Promise.reject(new Error('Categoría no encontrada'));

        const emoji = getEmojiFromBudgetCategories(selectedCategory.name, activeTab === 'income');

        return createUserCategory(
          {
            name: selectedCategory.name,
            kind: activeTab === 'income' ? 'income' : 'expense',
            emoji_code: emoji,
            transaction_category_id: selectedCategory.id
          },
          accessToken
        );
      });

      await Promise.all(createPromises);

      await reloadCategories();
      await refetchTransactions();

      setCreatingNewCategory(false);
      setMultipleNewCategories([]);

      const count = createPromises.length;
      Alert.alert('Éxito', `${count} ${count === 1 ? 'categoría creada' : 'categorías creadas'} correctamente`);

    } catch (error) {
      console.error('Error creating categories:', error);
      Alert.alert('Error', 'Hubo un problema al crear las categorías');
    } finally {
      setCreatingCategory(false);
    }
  };

  // Confirm custom categories
  const handleConfirmCustomCategory = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      return;
    }

    const invalidCards = multipleCustomCategories.filter(card => !card.name.trim() || !card.emoji.trim());
    if (invalidCards.length > 0) {
      Alert.alert('Error', 'Por favor completa el nombre y emoji en todas las tarjetas');
      return;
    }

    try {
      setCreatingCategory(true);

      const createPromises = multipleCustomCategories.map(card =>
        createUserCategory(
          {
            name: card.name.trim(),
            kind: activeTab === 'income' ? 'income' : 'expense',
            emoji_code: card.emoji,
          },
          accessToken
        )
      );

      await Promise.all(createPromises);

      await reloadCategories();
      await refetchTransactions();

      setCreatingCustomCategory(false);
      setMultipleCustomCategories([]);

      const count = createPromises.length;
      Alert.alert('Éxito', `${count} ${count === 1 ? 'categoría personalizada creada' : 'categorías personalizadas creadas'} correctamente`);

    } catch (error) {
      console.error('Error creating custom categories:', error);
      Alert.alert('Error', 'Hubo un problema al crear las categorías personalizadas');
    } finally {
      setCreatingCategory(false);
    }
  };

  // ===== SUBCATEGORY CREATION =====

  // Start adding subcategory
  const handleAddSubcategory = (categoryId: string) => {
    if (!canAddMoreSubcategories(categoryId)) {
      Alert.alert(
        'Límite alcanzado',
        'Ya has agregado todas las subcategorías disponibles para esta categoría.'
      );
      return;
    }

    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const userCategory = userCategories.find(cat => cat.id.toString() === categoryId);
    const isCustomCategory = userCategory && !userCategory.transaction_category_id;

    setAddingSubcategoryForCategoryId(categoryId);
    const newCardId = Date.now().toString();

    if (isCustomCategory) {
      setMultipleCustomSubcategories([{ id: newCardId, name: '', emoji: '' }]);
      setMultipleNewSubcategories([]);
    } else {
      setMultipleNewSubcategories([{ id: newCardId, systemSubcategoryId: null }]);
      setMultipleCustomSubcategories([]);
    }

    scrollToCard(newCardId, true);
  };

  // Cancel adding subcategory
  const handleCancelAddSubcategory = () => {
    setAddingSubcategoryForCategoryId(null);
    setMultipleNewSubcategories([]);
    setMultipleCustomSubcategories([]);
  };

  // Select system subcategory
  const handleSelectSystemSubcategory = (cardId: string, subcategoryId: string) => {
    setMultipleNewSubcategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, systemSubcategoryId: subcategoryId } : card)
    );
  };

  // Handle custom subcategory name change
  const handleCustomSubcategoryNameChange = (cardId: string, text: string) => {
    const filteredText = filterEmojisFromText(text);
    setMultipleCustomSubcategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, name: filteredText } : card)
    );
  };

  // Handle custom subcategory emoji change
  const handleCustomSubcategoryEmojiChange = (cardId: string, text: string) => {
    const filteredEmoji = extractEmojisFromText(text);
    setMultipleCustomSubcategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, emoji: filteredEmoji } : card)
    );
  };

  // Add new subcategory card
  const handleAddNewSubcategoryCard = (categoryId: string) => {
    const availableSubcategories = getAvailableSubcategoriesForCategory(categoryId);
    const currentCards = multipleNewSubcategories.length;

    if (currentCards >= availableSubcategories.length) {
      Alert.alert(
        'Límite alcanzado',
        'Ya has alcanzado el límite de subcategorías disponibles.'
      );
      return;
    }

    const newCardId = Date.now().toString();
    setMultipleNewSubcategories(prev => [...prev, { id: newCardId, systemSubcategoryId: null }]);
    scrollToCard(newCardId, true);
  };

  // Add new custom subcategory card
  const handleAddNewCustomSubcategoryCard = () => {
    if (!addingSubcategoryForCategoryId) return;

    const newCardId = Date.now().toString();
    setMultipleCustomSubcategories(prev => [...prev, { id: newCardId, name: '', emoji: '' }]);
    scrollToCard(newCardId, true);
  };

  // Remove subcategory card
  const handleRemoveNewSubcategoryCard = (cardId: string) => {
    setMultipleNewSubcategories(prev => {
      const newList = prev.filter(card => card.id !== cardId);
      if (newList.length === 0) {
        setAddingSubcategoryForCategoryId(null);
      }
      return newList;
    });
  };

  // Remove custom subcategory card
  const handleRemoveCustomSubcategoryCard = (cardId: string) => {
    setMultipleCustomSubcategories(prev => {
      const newList = prev.filter(card => card.id !== cardId);
      if (newList.length === 0) {
        setAddingSubcategoryForCategoryId(null);
      }
      return newList;
    });
  };

  // Confirm new subcategories
  const handleConfirmNewSubcategories = async () => {
    if (!accessToken || !addingSubcategoryForCategoryId) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      return;
    }

    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const parentCategory = userCategories.find(cat => cat.id.toString() === addingSubcategoryForCategoryId);

    if (!parentCategory) {
      Alert.alert('Error', 'No se encontró la categoría padre');
      return;
    }

    const isCustomCategory = !parentCategory.transaction_category_id;

    if (isCustomCategory) {
      const invalidCards = multipleCustomSubcategories.filter(card => !card.name.trim() || !card.emoji.trim());
      if (invalidCards.length > 0) {
        Alert.alert('Error', 'Por favor completa el nombre y emoji en todas las subcategorías');
        return;
      }
    } else {
      const invalidCards = multipleNewSubcategories.filter(card => !card.systemSubcategoryId);
      if (invalidCards.length > 0) {
        Alert.alert('Error', 'Por favor selecciona una subcategoría en todas las tarjetas');
        return;
      }
    }

    try {
      setCreatingCategory(true);

      let createPromises;

      if (isCustomCategory) {
        createPromises = multipleCustomSubcategories.map(card => {
          return createUserCategory(
            {
              name: card.name.trim(),
              kind: activeTab === 'income' ? 'income' : 'expense',
              emoji_code: card.emoji,
              parent_id: parentCategory.id
            },
            accessToken
          );
        });
      } else {
        const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;
        const systemCategory = systemCategories.find(cat => cat.id === parentCategory.transaction_category_id);

        if (!systemCategory) {
          Alert.alert('Error', 'No se encontró la categoría del sistema');
          return;
        }

        createPromises = multipleNewSubcategories.map(card => {
          const selectedSubcategory = systemCategory.children?.find(subcat => subcat.id.toString() === card.systemSubcategoryId);
          if (!selectedSubcategory) return Promise.reject(new Error('Subcategoría no encontrada'));

          const emoji = getEmojiFromBudgetCategories(selectedSubcategory.name, activeTab === 'income');

          return createUserCategory(
            {
              name: selectedSubcategory.name,
              kind: activeTab === 'income' ? 'income' : 'expense',
              emoji_code: emoji,
              transaction_category_id: selectedSubcategory.id,
              parent_id: parentCategory.id
            },
            accessToken
          );
        });
      }

      await Promise.all(createPromises);

      await reloadCategories();
      await refetchTransactions();

      setAddingSubcategoryForCategoryId(null);
      setMultipleNewSubcategories([]);
      setMultipleCustomSubcategories([]);

      const count = createPromises.length;
      Alert.alert('Éxito', `${count} ${count === 1 ? 'subcategoría creada' : 'subcategorías creadas'} correctamente`);

    } catch (error) {
      console.error('Error creating subcategories:', error);
      Alert.alert('Error', 'Hubo un problema al crear las subcategorías');
    } finally {
      setCreatingCategory(false);
    }
  };

  // ===== HELPER FUNCTIONS =====

  const getMaxCategoriesAllowed = () => {
    const currentCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;
    return systemCategories.length - currentCategories.length;
  };

  const canAddMoreSystemCategories = () => {
    const currentCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;
    return currentCategories.length < systemCategories.length;
  };

  const getAvailableCategoriesForCard = (currentCardId: string) => {
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;
    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const isIncome = activeTab === 'income';

    const userCategoryIds = new Set(
      userCategories
        .filter(cat => cat.transaction_category_id !== undefined && cat.transaction_category_id !== null)
        .map(cat => cat.transaction_category_id)
    );

    const selectedInOtherCards = multipleNewCategories
      .filter(card => card.id !== currentCardId && card.systemCategoryId !== null)
      .map(card => card.systemCategoryId);

    return systemCategories
      .filter(cat => !userCategoryIds.has(cat.id) && !selectedInOtherCards.includes(cat.id.toString()))
      .map(cat => ({
        id: cat.id.toString(),
        name: {
          es: cat.translated_name || cat.name,
          en: cat.name,
          pt: cat.translated_name || cat.name,
          'es-CL': cat.translated_name || cat.name
        },
        emoji: getEmojiFromBudgetCategories(cat.name, isIncome),
        transactionCategoryId: cat.id
      }));
  };

  const getAvailableSubcategoriesForCategory = (categoryId: string, currentCardId?: string) => {
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;
    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const isIncome = activeTab === 'income';

    const userCategory = userCategories.find(cat => cat.id.toString() === categoryId);
    if (!userCategory) return [];

    if (!userCategory.transaction_category_id) {
      const allSystemSubcategories = systemCategories.flatMap(cat =>
        cat.children ? cat.children.map(subcat => ({
          id: subcat.id.toString(),
          name: {
            es: subcat.translated_name || subcat.name,
            en: subcat.name,
            pt: subcat.translated_name || subcat.name,
            'es-CL': subcat.translated_name || subcat.name
          },
          emoji: getEmojiFromBudgetCategories(subcat.name, isIncome)
        })) : []
      );

      const existingSubcategoryIds = new Set(
        (userCategory.children || [])
          .filter(sub => sub.transaction_category_id !== undefined && sub.transaction_category_id !== null)
          .map(sub => sub.transaction_category_id)
      );

      let selectedInOtherCards: (string | null)[] = [];
      if (currentCardId) {
        selectedInOtherCards = multipleNewSubcategories
          .filter(card => card.id !== currentCardId && card.systemSubcategoryId !== null)
          .map(card => card.systemSubcategoryId);
      }

      return allSystemSubcategories
        .filter(subcat =>
          !existingSubcategoryIds.has(parseInt(subcat.id)) &&
          !selectedInOtherCards.includes(subcat.id)
        );
    }

    const systemCategory = systemCategories.find(cat => cat.id === userCategory.transaction_category_id);
    if (!systemCategory || !systemCategory.children) return [];

    const existingSubcategoryIds = new Set(
      (userCategory.children || [])
        .filter(sub => sub.transaction_category_id !== undefined && sub.transaction_category_id !== null)
        .map(sub => sub.transaction_category_id)
    );

    let selectedInOtherCards: (string | null)[] = [];
    if (currentCardId) {
      selectedInOtherCards = multipleNewSubcategories
        .filter(card => card.id !== currentCardId && card.systemSubcategoryId !== null)
        .map(card => card.systemSubcategoryId);
    }

    return systemCategory.children
      .filter(subcat =>
        !existingSubcategoryIds.has(subcat.id) &&
        !selectedInOtherCards.includes(subcat.id.toString())
      )
      .map(subcat => ({
        id: subcat.id.toString(),
        name: {
          es: subcat.translated_name || subcat.name,
          en: subcat.name,
          pt: subcat.translated_name || subcat.name,
          'es-CL': subcat.translated_name || subcat.name
        },
        emoji: getEmojiFromBudgetCategories(subcat.name, isIncome)
      }));
  };

  const canAddMoreSubcategories = (categoryId: string) => {
    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const userCategory = userCategories.find(cat => cat.id.toString() === categoryId);

    if (!userCategory) return false;

    if (!userCategory.transaction_category_id) {
      const currentSubcategoryCount = (userCategory.children || []).length;
      return currentSubcategoryCount < 20;
    }

    const availableSubcategories = getAvailableSubcategoriesForCategory(categoryId);
    return availableSubcategories.length > 0;
  };

  const getMaxSubcategoriesAllowed = (categoryId: string) => {
    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const userCategory = userCategories.find(cat => cat.id.toString() === categoryId);

    if (!userCategory) return 0;

    if (!userCategory.transaction_category_id) {
      const currentSubcategoryCount = (userCategory.children || []).length;
      return Math.max(0, 20 - currentSubcategoryCount);
    }

    const availableSubcategories = getAvailableSubcategoriesForCategory(categoryId);
    return availableSubcategories.length;
  };

  return {
    // Category creation state
    creatingNewCategory,
    creatingCustomCategory,
    creatingCategory,
    multipleNewCategories,
    multipleCustomCategories,

    // Subcategory creation state
    addingSubcategoryForCategoryId,
    multipleNewSubcategories,
    multipleCustomSubcategories,

    // Category creation functions
    handleNewCategory,
    handleNewCustomCategory,
    handleCancelNewCategory,
    handleSelectSystemCategory,
    handleCustomCategoryNameChange,
    handleCustomCategoryEmojiChange,
    handleAddNewCategoryCard,
    handleRemoveNewCategoryCard,
    handleConfirmNewCategory,
    handleConfirmCustomCategory,

    // Subcategory creation functions
    handleAddSubcategory,
    handleCancelAddSubcategory,
    handleSelectSystemSubcategory,
    handleCustomSubcategoryNameChange,
    handleCustomSubcategoryEmojiChange,
    handleAddNewSubcategoryCard,
    handleAddNewCustomSubcategoryCard,
    handleRemoveNewSubcategoryCard,
    handleRemoveCustomSubcategoryCard,
    handleConfirmNewSubcategories,

    // Helper functions
    getMaxCategoriesAllowed,
    canAddMoreSystemCategories,
    getAvailableCategoriesForCard,
    getAvailableSubcategoriesForCategory,
    canAddMoreSubcategories,
    getMaxSubcategoriesAllowed,
  };
}
