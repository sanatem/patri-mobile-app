import { useState, useMemo, useRef, useEffect } from 'react';
import { Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';
import { useFloidTransactions } from '@/hooks/budget/useFloidTransactions';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { useAuth } from '@/providers/AuthProvider';
import { getExpenseCategories } from '@/services/budget/categories-manager/system-categories/get-expense-categories';
import { getIncomeCategories } from '@/services/budget/categories-manager/system-categories/get-income-categories';
import type { TransactionCategory } from '@/services/budget/categories-manager/system-categories/get-expense-categories';
import { UserCategoriesState } from './useUserCategories';
import { assignTransactionCategory } from '@/services/budget/transactions/assign-transaction-category';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface UseCategoriesManagerProps {
  userCategories: UserCategoriesState;
}

export function useCategoriesManager({ userCategories }: UseCategoriesManagerProps) {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const categoryRotations = useRef<Map<string, Animated.Value>>(new Map()).current;
  const subcategoryRotations = useRef<Map<string, Animated.Value>>(new Map()).current;

  // Estados para categorías del API
  const [apiIncomeCategories, setApiIncomeCategories] = useState<TransactionCategory[]>([]);
  const [apiExpenseCategories, setApiExpenseCategories] = useState<TransactionCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Estados para modo de selección múltiple de categorías/subcategorías
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalTransactionsToUncategorize, setTotalTransactionsToUncategorize] = useState(0);

  // Estados para modo de selección de transacciones
  const [transactionSelectionMode, setTransactionSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteTransactionsModal, setShowDeleteTransactionsModal] = useState(false);
  const [selectedDestinationCategory, setSelectedDestinationCategory] = useState<string | null>(null);
  const [selectedDestinationSubcategory, setSelectedDestinationSubcategory] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [assigningCategories, setAssigningCategories] = useState(false);

  // Animaciones para selección de categorías/subcategorías
  const selectionAnimations = useRef<Map<string, Animated.Value>>(new Map()).current;
  const transactionAnimations = useRef<Map<number, Animated.Value>>(new Map()).current;

  // Obtener cuentas
  const { accounts } = useFloidAccounts();
  const selectedAccountIds = useMemo(
    () => accounts?.floid_accounts.map(acc => acc.id.toString()) || [],
    [accounts?.floid_accounts]
  );

  // Obtener transacciones de ingresos
  const {
    transactions: incomeTransactionsData,
    loading: incomeLoading,
    refetch: refetchIncomeTransactions,
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: selectedAccountIds.length > 0,
    transaction_type: 'income'
  });

  // Obtener transacciones de gastos
  const {
    transactions: expenseTransactionsData,
    loading: expenseLoading,
    refetch: refetchExpenseTransactions,
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: selectedAccountIds.length > 0,
    transaction_type: 'outcome'
  });

  const loading = incomeLoading || expenseLoading || categoriesLoading;

  // Cargar categorías del API
  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;

      try {
        setCategoriesLoading(true);

        // Cargar categorías de ingresos y gastos en paralelo
        const [incomeResponse, expenseResponse] = await Promise.all([
          getIncomeCategories({ per_page: 100 }, accessToken),
          getExpenseCategories({ per_page: 100 }, accessToken)
        ]);

        if (incomeResponse?.success && incomeResponse.data) {
          setApiIncomeCategories(incomeResponse.data);
        }

        if (expenseResponse?.success && expenseResponse.data) {
          setApiExpenseCategories(expenseResponse.data);
        }

      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [accessToken]);

  // Obtener las transacciones según el tab activo
  const allTransactionsData = activeTab === 'income' ? incomeTransactionsData : expenseTransactionsData;
  const allTransactions = allTransactionsData?.transactions || [];

  // Helper: Obtener emoji basado en el nombre de la categoría
  const getEmojiForCategory = (name: string, isIncome: boolean): string => {
    const staticCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    // Buscar coincidencia por nombre (case-insensitive)
    const normalizedName = name.toLowerCase().trim();

    const found = staticCategories.find(cat => {
      const catNameEs = cat.name.es.toLowerCase();
      const catNameEsCl = cat.name['es-CL'].toLowerCase();
      const catNameEn = cat.name.en.toLowerCase();

      return catNameEs === normalizedName ||
             catNameEsCl === normalizedName ||
             catNameEn === normalizedName ||
             catNameEs.includes(normalizedName) ||
             normalizedName.includes(catNameEs);
    });

    // Si encontramos coincidencia en categorías, retornar su emoji
    if (found) return found.emoji;

    // Buscar en subcategorías
    for (const cat of staticCategories) {
      if (cat.subcategories) {
        const subFound = cat.subcategories.find(sub => {
          const subNameEs = sub.name.es.toLowerCase();
          const subNameEsCl = sub.name['es-CL'].toLowerCase();
          const subNameEn = sub.name.en.toLowerCase();

          return subNameEs === normalizedName ||
                 subNameEsCl === normalizedName ||
                 subNameEn === normalizedName ||
                 subNameEs.includes(normalizedName) ||
                 normalizedName.includes(subNameEs);
        });

        if (subFound) return subFound.emoji;
      }
    }

    // Emoji por defecto si no se encuentra coincidencia
    return isIncome ? '💰' : '💸';
  };

  // Transformar categorías del API al formato esperado por el componente
  const categories = useMemo(() => {
    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const isIncome = activeTab === 'income';
    const selectedCategoryIds = activeTab === 'income' ? userCategories.income : userCategories.expenses;

    // Obtener categorías base (del API o estáticas)
    let baseCategories;
    if (apiCategories.length > 0) {
      // Las categorías padre son las que tienen parent_id === null
      // Sus subcategorías vienen en el campo "children"
      baseCategories = apiCategories.map(category => {
        return {
          id: category.id.toString(),
          name: {
            en: category.name,
            es: category.translated_name,
            'es-CL': category.translated_name
          },
          emoji: getEmojiForCategory(category.translated_name, isIncome),
          subcategories: category.children.map(subcat => ({
            id: subcat.id.toString(),
            name: {
              en: subcat.name,
              es: subcat.translated_name,
              'es-CL': subcat.translated_name
            },
            emoji: getEmojiForCategory(subcat.translated_name, isIncome)
          }))
        };
      });
    } else {
      // Fallback a categorías estáticas si no hay datos del API
      baseCategories = activeTab === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    }

    // Filtrar solo las categorías seleccionadas por el usuario
    if (selectedCategoryIds.length > 0) {
      return baseCategories.filter(cat => selectedCategoryIds.includes(cat.id));
    }

    // Si no hay selección, mostrar todas (fallback)
    return baseCategories;
  }, [activeTab, apiIncomeCategories, apiExpenseCategories, userCategories]);

  const currentLang = t('common.language_code', 'es');

  // Función auxiliar para obtener o crear rotación
  const getOrCreateRotation = (id: string, isCategory: boolean) => {
    const rotations = isCategory ? categoryRotations : subcategoryRotations;
    if (!rotations.has(id)) {
      rotations.set(id, new Animated.Value(0));
    }
    return rotations.get(id)!;
  };

  // Agrupar transacciones por categoría y subcategoría
  const groupedData = useMemo(() => {
    const uncategorized = allTransactions.filter(t => !t.category || !t.category.id);

    const categorized = categories.map(category => {
      const categoryTransactions = allTransactions.filter(t => t.category?.id === category.id);

      const subcategoriesData = category.subcategories?.map(subcat => {
        const subcatTransactions = categoryTransactions.filter(t => t.category?.id === subcat.id);
        return {
          ...subcat,
          transactions: subcatTransactions,
          total: subcatTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
        };
      }) || [];

      const uncategorizedInCategory = categoryTransactions.filter(t => !t.subcategory);

      return {
        ...category,
        subcategories: subcategoriesData,
        uncategorizedTransactions: uncategorizedInCategory,
        total: categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0),
        transactionCount: categoryTransactions.length
      };
    });

    return { categorized, uncategorized };
  }, [allTransactions, activeTab, categories]);

  // Opciones para los selects del modal de mover transacciones (desde API)
  const categoryOptions = useMemo(() => {
    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    if (apiCategories.length === 0) return [];

    return apiCategories
      .filter(category => category && category.id !== undefined && category.id !== null)
      .map(category => ({
        label: category.translated_name || '',
        value: category.id.toString()
      }));
  }, [activeTab, apiIncomeCategories, apiExpenseCategories]);

  const subcategoryOptions = useMemo(() => {
    if (!selectedDestinationCategory) return [];

    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const category = apiCategories.find(cat => cat && cat.id && cat.id.toString() === selectedDestinationCategory);

    if (!category || !category.children || category.children.length === 0) return [];

    return category.children
      .filter(subcat => subcat && subcat.id !== undefined && subcat.id !== null)
      .map(subcat => ({
        label: subcat.translated_name || '',
        value: subcat.id.toString()
      }));
  }, [selectedDestinationCategory, activeTab, apiIncomeCategories, apiExpenseCategories]);

  const toggleCategory = (categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newExpanded = new Set(expandedCategories);
    const isExpanding = !newExpanded.has(categoryId);
    const rotation = getOrCreateRotation(categoryId, true);

    Animated.timing(rotation, {
      toValue: isExpanding ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (isExpanding) {
      newExpanded.add(categoryId);
    } else {
      newExpanded.delete(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newExpanded = new Set(expandedSubcategories);
    const isExpanding = !newExpanded.has(subcategoryId);
    const rotation = getOrCreateRotation(subcategoryId, false);

    Animated.timing(rotation, {
      toValue: isExpanding ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();

    if (isExpanding) {
      newExpanded.add(subcategoryId);
    } else {
      newExpanded.delete(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  const getRotateStyle = (id: string, isCategory: boolean) => {
    const rotation = getOrCreateRotation(id, isCategory);
    return {
      transform: [
        {
          rotate: rotation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '180deg'],
          }),
        },
      ],
    };
  };

  const getSelectionAnimation = (id: string) => {
    if (!selectionAnimations.has(id)) {
      selectionAnimations.set(id, new Animated.Value(0));
    }
    return selectionAnimations.get(id)!;
  };

  const handleLongPress = (subcategoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionMode(true);
    const newSelected = new Set(selectedSubcategories);
    newSelected.add(subcategoryId);
    setSelectedSubcategories(newSelected);

    const animation = getSelectionAnimation(subcategoryId);
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();
  };

  const handleCategoryLongPress = (categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionMode(true);
    const newSelected = new Set(selectedCategories);
    newSelected.add(categoryId);
    setSelectedCategories(newSelected);

    const category = categories.find(cat => cat.id === categoryId);
    if (category?.subcategories) {
      const newSelectedSubs = new Set(selectedSubcategories);
      category.subcategories.forEach(subcat => {
        newSelectedSubs.add(subcat.id);
        const subAnimation = getSelectionAnimation(subcat.id);
        Animated.spring(subAnimation, {
          toValue: 1,
          useNativeDriver: false,
          friction: 8,
          tension: 40
        }).start();
      });
      setSelectedSubcategories(newSelectedSubs);
    }

    const animation = getSelectionAnimation(categoryId);
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();
  };

  const handleCategoryPress = (categoryId: string) => {
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
        category.subcategories.forEach(subcat => {
          if (isCurrentlySelected) {
            newSelectedSubs.delete(subcat.id);
          } else {
            newSelectedSubs.add(subcat.id);
          }
          const subAnimation = getSelectionAnimation(subcat.id);
          Animated.spring(subAnimation, {
            toValue: isCurrentlySelected ? 0 : 1,
            useNativeDriver: false,
            friction: 8,
            tension: 40
          }).start();
        });
        setSelectedSubcategories(newSelectedSubs);
      }

      const animation = getSelectionAnimation(categoryId);
      Animated.spring(animation, {
        toValue: isCurrentlySelected ? 0 : 1,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();

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
      toggleCategory(categoryId);
    }
  };

  const handleSubcategoryPress = (subcategoryId: string) => {
    if (selectionMode) {
      const newSelected = new Set(selectedSubcategories);
      const isCurrentlySelected = newSelected.has(subcategoryId);

      if (isCurrentlySelected) {
        newSelected.delete(subcategoryId);
      } else {
        newSelected.add(subcategoryId);
      }
      setSelectedSubcategories(newSelected);

      const animation = getSelectionAnimation(subcategoryId);
      Animated.spring(animation, {
        toValue: isCurrentlySelected ? 0 : 1,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();

      if (newSelected.size === 0 && selectedCategories.size === 0) {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectionMode(false);
      }
    } else {
      toggleSubcategory(subcategoryId);
    }
  };

  const handleCancelSelection = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    selectedSubcategories.forEach(id => {
      const animation = getSelectionAnimation(id);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();
    });

    selectedCategories.forEach(id => {
      const animation = getSelectionAnimation(id);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();
    });

    setSelectionMode(false);
    setSelectedSubcategories(new Set());
    setSelectedCategories(new Set());
  };

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

  const confirmDelete = () => {

    selectedSubcategories.forEach(id => {
      const animation = getSelectionAnimation(id);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();
    });

    selectedCategories.forEach(id => {
      const animation = getSelectionAnimation(id);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();
    });

    setShowDeleteModal(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionMode(false);
    setSelectedSubcategories(new Set());
    setSelectedCategories(new Set());
  };

  const getTransactionAnimation = (id: number) => {
    if (!transactionAnimations.has(id)) {
      transactionAnimations.set(id, new Animated.Value(0));
    }
    return transactionAnimations.get(id)!;
  };

  const handleTransactionPress = (transactionId: number) => {
    const newSelected = new Set(selectedTransactions);
    const isCurrentlySelected = newSelected.has(transactionId);

    if (isCurrentlySelected) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);

    const animation = getTransactionAnimation(transactionId);
    Animated.spring(animation, {
      toValue: isCurrentlySelected ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();

    if (newSelected.size > 0 && !transactionSelectionMode) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(true);
    } else if (newSelected.size === 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(false);
    }
  };

  const handleCancelTransactionSelection = () => {
    selectedTransactions.forEach(id => {
      const animation = getTransactionAnimation(id);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();
    });

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTransactionSelectionMode(false);
    setSelectedTransactions(new Set());
  };

  const handleDeleteTransactions = () => {
    setShowDeleteTransactionsModal(true);
  };

  const confirmDeleteTransactions = () => {
    selectedTransactions.forEach(id => {
      const animation = getTransactionAnimation(id);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();
    });

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTransactionSelectionMode(false);
    setSelectedTransactions(new Set());
    setShowDeleteTransactionsModal(false);
  };

  const handleMoveTransactions = () => {
    setShowMoveModal(true);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedDestinationCategory(categoryId);
    setSelectedDestinationSubcategory(null);
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedDestinationSubcategory(subcategoryId);
  };

  const confirmMoveTransactions = async () => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    if (!selectedDestinationCategory) {
      console.error('No destination category selected');
      return;
    }

    try {
      setAssigningCategories(true);

      const categoryId = selectedDestinationSubcategory
        ? parseInt(selectedDestinationSubcategory)
        : parseInt(selectedDestinationCategory);

      const transactionIds = Array.from(selectedTransactions);

      const response = await assignTransactionCategory(
        {
          transaction_ids: transactionIds,
          transaction_category_id: categoryId,
          auto_category: false
        },
        accessToken
      );

      await Promise.all([
        refetchIncomeTransactions(),
        refetchExpenseTransactions()
      ]);

      selectedTransactions.forEach(id => {
        const animation = getTransactionAnimation(id);
        Animated.spring(animation, {
          toValue: 0,
          useNativeDriver: false,
          friction: 8,
          tension: 40
        }).start();
      });

      setShowMoveModal(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);

      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(false);
      setSelectedTransactions(new Set());
      setSelectedDestinationCategory(null);
      setSelectedDestinationSubcategory(null);

    } catch (error) {
      console.error('Error assigning categories to transactions:', error);
    } finally {
      setAssigningCategories(false);
    }
  };

  const handleCloseMoveModal = () => {
    setShowMoveModal(false);
    setSelectedDestinationCategory(null);
    setSelectedDestinationSubcategory(null);
  };

  const handleNewCategory = () => {
    console.log('Crear nueva categoría');
  };

  return {
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
    loading,
    categoriesLoading,
    assigningCategories,

    apiIncomeCategories,
    apiExpenseCategories,

    groupedData,
    categoryOptions,
    subcategoryOptions,
    categories,
    currentLang,

    setActiveTab,
    toggleCategory,
    toggleSubcategory,
    getRotateStyle,
    handleLongPress,
    handleCategoryLongPress,
    handleCategoryPress,
    handleSubcategoryPress,
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
    handleNewCategory,

    t,
  };
}
