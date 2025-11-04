import { useState, useMemo, useRef, useEffect } from 'react';
import { Animated, LayoutAnimation, Platform, UIManager, Alert, findNodeHandle } from 'react-native';
import { useTranslation } from 'react-i18next';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';
import { useFloidTransactions } from '@/hooks/budget/useFloidTransactions';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCategories, deleteUserCategory, updateUserCategory, createUserCategory, getIncomeCategories, getExpenseCategories } from '@/services/budget/categories-manager';
import type { UserCategory, TransactionCategory } from '@/services/budget/categories-manager';
import { UserCategoriesState } from './useUserCategories';
import { assignTransactionCategory } from '@/services/budget/transactions/assign-transaction-category';
import { deleteFloidTransaction } from '@/services/budget/transactions/delete-floid-transaction';

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
  const [apiIncomeCategories, setApiIncomeCategories] = useState<UserCategory[]>([]);
  const [apiExpenseCategories, setApiExpenseCategories] = useState<UserCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Estados para categorías del sistema (transaction_categories)
  const [systemIncomeCategories, setSystemIncomeCategories] = useState<TransactionCategory[]>([]);
  const [systemExpenseCategories, setSystemExpenseCategories] = useState<TransactionCategory[]>([]);

  // Estados para modo de selección múltiple de categorías/subcategorías
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedSubcategories, setSelectedSubcategories] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [totalTransactionsToUncategorize, setTotalTransactionsToUncategorize] = useState(0);
  const [deletingCategories, setDeletingCategories] = useState(false);

  // Estados para modo de selección de transacciones
  const [transactionSelectionMode, setTransactionSelectionMode] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<Set<number>>(new Set());
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showDeleteTransactionsModal, setShowDeleteTransactionsModal] = useState(false);
  const [selectedDestinationCategory, setSelectedDestinationCategory] = useState<string | null>(null);
  const [selectedDestinationSubcategory, setSelectedDestinationSubcategory] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [assigningCategories, setAssigningCategories] = useState(false);
  const [deletingTransactions, setDeletingTransactions] = useState(false);

  // Estados para modo de edición
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [updatingCategory, setUpdatingCategory] = useState(false);
  const [editingParentCategoryId, setEditingParentCategoryId] = useState<string | null>(null);

  // Mapa de cambios pendientes: { categoryId: { name: string, emoji: string } }
  const [pendingEdits, setPendingEdits] = useState<Map<string, { name: string; emoji: string }>>(new Map());

  // Estados para crear nueva categoría
  const [creatingNewCategory, setCreatingNewCategory] = useState(false);
  const [creatingCustomCategory, setCreatingCustomCategory] = useState(false);
  const [selectedSystemCategoryId, setSelectedSystemCategoryId] = useState<string | null>(null);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryEmoji, setCustomCategoryEmoji] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Estados para múltiples categorías simultáneas
  const [multipleNewCategories, setMultipleNewCategories] = useState<Array<{ id: string; systemCategoryId: string | null }>>([]);
  const [multipleCustomCategories, setMultipleCustomCategories] = useState<Array<{ id: string; name: string; emoji: string }>>([]);

  // Estados para agregar subcategorías
  const [addingSubcategoryForCategoryId, setAddingSubcategoryForCategoryId] = useState<string | null>(null);
  const [multipleNewSubcategories, setMultipleNewSubcategories] = useState<Array<{ id: string; systemSubcategoryId: string | null }>>([]);
  const [multipleCustomSubcategories, setMultipleCustomSubcategories] = useState<Array<{ id: string; name: string; emoji: string }>>([]);

  // Animaciones para selección de categorías/subcategorías
  const selectionAnimations = useRef<Map<string, Animated.Value>>(new Map()).current;
  const transactionAnimations = useRef<Map<number, Animated.Value>>(new Map()).current;

  // Refs para scroll automático
  const categoryCardRefs = useRef<Map<string, any>>(new Map()).current;
  const subcategoryCardRefs = useRef<Map<string, any>>(new Map()).current;
  const scrollViewRef = useRef<any>(null);
  const cardPositions = useRef<Map<string, number>>(new Map()).current;

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

  // Cargar categorías del API (user categories y system categories)
  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken) return;

      try {
        setCategoriesLoading(true);

        // Cargar categorías de usuario y del sistema en paralelo
        const [incomeResponse, expenseResponse, systemIncomeResponse, systemExpenseResponse] = await Promise.all([
          getUserCategories({ kind: 'income', per_page: 100 }, accessToken),
          getUserCategories({ kind: 'expense', per_page: 100 }, accessToken),
          getIncomeCategories({ per_page: 100 }, accessToken),
          getExpenseCategories({ per_page: 100 }, accessToken)
        ]);

        if (incomeResponse?.success && incomeResponse.data) {
          // Filtrar solo las categorías padre (parent_id === null)
          const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
          setApiIncomeCategories(parentCategories);
        }

        if (expenseResponse?.success && expenseResponse.data) {
          // Filtrar solo las categorías padre (parent_id === null)
          const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
          setApiExpenseCategories(parentCategories);
        }

        // Guardar categorías del sistema
        if (systemIncomeResponse?.success && systemIncomeResponse.data) {
          const parentCategories = systemIncomeResponse.data.filter(cat => cat.parent_id === null);
          setSystemIncomeCategories(parentCategories);
        }

        if (systemExpenseResponse?.success && systemExpenseResponse.data) {
          const parentCategories = systemExpenseResponse.data.filter(cat => cat.parent_id === null);
          setSystemExpenseCategories(parentCategories);
        }

      } catch (error) {
        console.error('Error fetching user categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, [accessToken]);

  // Obtener las transacciones según el tab activo
  const allTransactionsData = activeTab === 'income' ? incomeTransactionsData : expenseTransactionsData;
  const allTransactions = allTransactionsData?.transactions || [];

  // Helper: Encontrar categoría estática por nombre
  const findStaticCategory = (name: string, isIncome: boolean) => {
    const staticCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const normalizedName = name.toLowerCase().trim();

    // Buscar en categorías principales
    const found = staticCategories.find(cat => {
      const catNameEn = cat.name.en.toLowerCase();
      return catNameEn === normalizedName;
    });

    if (found) return found;

    // Buscar en subcategorías
    for (const cat of staticCategories) {
      if (cat.subcategories) {
        const subFound = cat.subcategories.find(sub => {
          const subNameEn = sub.name.en.toLowerCase();
          return subNameEn === normalizedName;
        });
        if (subFound) return subFound;
      }
    }

    return null;
  };

  // Helper: Obtener emoji basado en el nombre de la categoría
  const getEmojiForCategory = (name: string, isIncome: boolean): string => {
    const found = findStaticCategory(name, isIncome);
    return found?.emoji || (isIncome ? '💰' : '💸');
  };

  // Helper: Obtener nombres traducidos basado en el display_name (en inglés)
  const getTranslatedNames = (displayName: string, isIncome: boolean) => {
    const found = findStaticCategory(displayName, isIncome);

    if (found) {
      return {
        en: found.name.en,
        es: found.name.es,
        'es-CL': found.name['es-CL']
      };
    }

    // Si no encontramos traducción, usar el display_name para todos los idiomas
    return {
      en: displayName,
      es: displayName,
      'es-CL': displayName
    };
  };

  // Transformar categorías del API al formato esperado por el componente
  const categories = useMemo(() => {
    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const isIncome = activeTab === 'income';

    // Solo mostrar categorías si hay user categories del API
    // NO mostrar categorías estáticas como fallback
    if (apiCategories.length > 0) {
      // Transformar user categories al formato del componente
      return apiCategories.map(category => {
        const translatedNames = getTranslatedNames(category.display_name, isIncome);
        return {
          id: category.id.toString(),
          name: translatedNames,
          emoji: category.emoji_code || getEmojiForCategory(category.display_name, isIncome),
          originalName: category.display_name, // Guardar nombre original del API
          originalEmoji: category.emoji_code || '', // Guardar emoji original del API
          subcategories: (category.children || []).map(subcat => {
            const subTranslatedNames = getTranslatedNames(subcat.display_name, isIncome);
            return {
              id: subcat.id.toString(),
              name: subTranslatedNames,
              emoji: subcat.emoji_code || getEmojiForCategory(subcat.display_name, isIncome),
              originalName: subcat.display_name, // Guardar nombre original del API
              originalEmoji: subcat.emoji_code || '' // Guardar emoji original del API
            };
          })
        };
      });
    }

    // Si no hay user categories, retornar array vacío
    // Esto hará que se muestre el EmptyCategoriesState
    return [];
  }, [activeTab, apiIncomeCategories, apiExpenseCategories]);

  const currentLang = t('common.language_code', 'es');

  // Función auxiliar para obtener o crear rotación
  const getOrCreateRotation = (id: string, isCategory: boolean) => {
    const rotations = isCategory ? categoryRotations : subcategoryRotations;
    if (!rotations.has(id)) {
      rotations.set(id, new Animated.Value(0));
    }
    return rotations.get(id)!;
  };

  // Agrupar transacciones por categoría y subcategoría usando category.id
  const groupedData = useMemo(() => {
    // Transacciones sin categoría (category es null o no tiene id)
    const uncategorized = allTransactions.filter(t => !t.category || !t.category.id);

    const categorized = categories.map(category => {
      const categoryId = parseInt(category.id);

      // Filtrar transacciones que tengan este category.id (categoría padre o subcategoría)
      const categoryTransactions = allTransactions.filter(t => t.category?.id === categoryId);

      // Procesar subcategorías
      const subcategoriesData = category.subcategories?.map(subcat => {
        const subcatId = parseInt(subcat.id);
        // Filtrar transacciones que tengan este category.id (subcategoría)
        const subcatTransactions = allTransactions.filter(t => t.category?.id === subcatId);

        return {
          ...subcat,
          transactions: subcatTransactions,
          total: subcatTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0)
        };
      }) || [];

      // Transacciones que pertenecen a la categoría padre pero no a ninguna subcategoría
      const subcategoryIds = category.subcategories?.map(s => parseInt(s.id)) || [];
      const uncategorizedInCategory = categoryTransactions.filter(t => {
        const tCategoryId = t.category?.id;
        return tCategoryId === categoryId && !subcategoryIds.includes(tCategoryId);
      });

      // Calcular total incluyendo subcategorías
      const subcategoriesTotal = subcategoriesData.reduce((sum, sub) => sum + sub.total, 0);
      const categoryTotal = categoryTransactions.reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
      const total = categoryTotal + subcategoriesTotal;

      return {
        ...category,
        subcategories: subcategoriesData,
        uncategorizedTransactions: uncategorizedInCategory,
        total,
        transactionCount: categoryTransactions.length + subcategoriesData.reduce((sum, sub) => sum + sub.transactions.length, 0)
      };
    });

    return { categorized, uncategorized };
  }, [allTransactions, activeTab, categories]);

  // Opciones para los selects del modal de mover transacciones (desde API)
  const categoryOptions = useMemo(() => {
    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    if (apiCategories.length === 0) return [];
    const isIncome = activeTab === 'income';

    return apiCategories
      .filter(category => category && category.id !== undefined && category.id !== null)
      .map(category => {
        const translatedNames = getTranslatedNames(category.display_name, isIncome);
        return {
          label: translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || category.display_name || '',
          value: category.id.toString()
        };
      });
  }, [activeTab, apiIncomeCategories, apiExpenseCategories, currentLang]);

  const subcategoryOptions = useMemo(() => {
    if (!selectedDestinationCategory) return [];

    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const category = apiCategories.find(cat => cat && cat.id && cat.id.toString() === selectedDestinationCategory);

    if (!category || !category.children || category.children.length === 0) return [];
    const isIncome = activeTab === 'income';

    return category.children
      .filter(subcat => subcat && subcat.id !== undefined && subcat.id !== null)
      .map(subcat => {
        const translatedNames = getTranslatedNames(subcat.display_name, isIncome);
        return {
          label: translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || subcat.display_name || '',
          value: subcat.id.toString()
        };
      });
  }, [selectedDestinationCategory, activeTab, apiIncomeCategories, apiExpenseCategories, currentLang]);

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

  const confirmDelete = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      setShowDeleteModal(false);
      return;
    }

    try {
      setDeletingCategories(true);

      // Recolectar IDs de subcategorías y categorías padre por separado
      const subcategoryIdsToDelete: number[] = [];
      const parentCategoryIdsToDelete: number[] = [];

      // Agregar categorías padre seleccionadas
      selectedCategories.forEach(id => {
        parentCategoryIdsToDelete.push(parseInt(id));
      });

      // Agregar TODAS las subcategorías seleccionadas (incluyendo las de categorías padre seleccionadas)
      selectedSubcategories.forEach(subcatId => {
        subcategoryIdsToDelete.push(parseInt(subcatId));
      });

      // También agregar las subcategorías de las categorías padre seleccionadas
      // (por si no estaban explícitamente seleccionadas)
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

      // PASO 1: Eliminar todas las subcategorías PRIMERO
      if (subcategoryIdsToDelete.length > 0) {
        const deleteSubcategoryPromises = subcategoryIdsToDelete.map(id =>
          deleteUserCategory(id, accessToken)
        );
        await Promise.all(deleteSubcategoryPromises);
      }

      // PASO 2: Luego eliminar las categorías padre
      if (parentCategoryIdsToDelete.length > 0) {
        const deleteParentPromises = parentCategoryIdsToDelete.map(id =>
          deleteUserCategory(id, accessToken)
        );
        await Promise.all(deleteParentPromises);
      }

      // Resetear animaciones primero (antes de actualizar el estado)
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

      // Resetear selecciones antes de recargar datos
      setSelectionMode(false);
      setSelectedSubcategories(new Set());
      setSelectedCategories(new Set());

      // Esperar un momento para que las animaciones comiencen y el backend procese
      await new Promise(resolve => setTimeout(resolve, 400));

      // Recargar las categorías desde el API y system categories
      const [incomeResponse, expenseResponse, systemIncomeResponse, systemExpenseResponse] = await Promise.all([
        getUserCategories({ kind: 'income', per_page: 100 }, accessToken),
        getUserCategories({ kind: 'expense', per_page: 100 }, accessToken),
        getIncomeCategories({ per_page: 100 }, accessToken),
        getExpenseCategories({ per_page: 100 }, accessToken)
      ]);

      // Actualizar user categories
      if (incomeResponse?.success && incomeResponse.data) {
        const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
        setApiIncomeCategories(parentCategories);
      }

      if (expenseResponse?.success && expenseResponse.data) {
        const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
        setApiExpenseCategories(parentCategories);
      }

      // Actualizar system categories
      if (systemIncomeResponse?.success && systemIncomeResponse.data) {
        const parentCategories = systemIncomeResponse.data.filter(cat => cat.parent_id === null);
        setSystemIncomeCategories(parentCategories);
      }

      if (systemExpenseResponse?.success && systemExpenseResponse.data) {
        const parentCategories = systemExpenseResponse.data.filter(cat => cat.parent_id === null);
        setSystemExpenseCategories(parentCategories);
      }

      // Refrescar transacciones para actualizar contadores
      await Promise.all([
        refetchIncomeTransactions(),
        refetchExpenseTransactions()
      ]);

      // Forzar layout animation después de que todo esté actualizado
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

      // Cerrar modal y resetear loading
      setShowDeleteModal(false);
      setDeletingCategories(false);

      // Mostrar mensaje de éxito
      Alert.alert('Éxito', 'Categorías eliminadas correctamente');

    } catch (error) {
      console.error('Error deleting categories:', error);
      setShowDeleteModal(false);
      setDeletingCategories(false);
      Alert.alert('Error', 'Hubo un problema al eliminar las categorías. Por favor intenta nuevamente.');
    }
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

  const confirmDeleteTransactions = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      setShowDeleteTransactionsModal(false);
      return;
    }

    try {
      setDeletingTransactions(true);

      // Convertir Set a Array para poder mapearlo
      const transactionIds = Array.from(selectedTransactions);

      // Eliminar todas las transacciones en paralelo
      const deletePromises = transactionIds.map(id =>
        deleteFloidTransaction({ transactionId: id.toString() }, accessToken)
      );

      await Promise.all(deletePromises);

      // Refrescar transacciones para actualizar la vista
      await Promise.all([
        refetchIncomeTransactions(),
        refetchExpenseTransactions()
      ]);

      // Resetear animaciones
      selectedTransactions.forEach(id => {
        const animation = getTransactionAnimation(id);
        Animated.spring(animation, {
          toValue: 0,
          useNativeDriver: false,
          friction: 8,
          tension: 40
        }).start();
      });

      // Resetear selecciones
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(false);
      setSelectedTransactions(new Set());

      // Cerrar modal y resetear loading ANTES del Alert
      setShowDeleteTransactionsModal(false);
      setDeletingTransactions(false);

      // Mostrar mensaje de éxito
      const count = transactionIds.length;
      Alert.alert('Éxito', `${count} ${count === 1 ? 'transacción eliminada' : 'transacciones eliminadas'} correctamente`);

    } catch (error) {
      console.error('Error deleting transactions:', error);
      setShowDeleteTransactionsModal(false);
      setDeletingTransactions(false);
      Alert.alert('Error', 'Hubo un problema al eliminar las transacciones. Por favor intenta nuevamente.');
    }
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
          user_category_id: categoryId,
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

  // Helper para hacer scroll a un elemento
  const scrollToCard = (cardId: string, isSubcategory: boolean = false) => {
    // Usar múltiples intentos con delays incrementales para asegurar el renderizado
    const attemptScroll = (attempt: number = 0) => {
      if (attempt > 3) return; // Máximo 3 intentos

      const delay = 150 * (attempt + 1); // 150ms, 300ms, 450ms, 600ms

      setTimeout(() => {
        const scrollRef = scrollViewRef.current;

        if (scrollRef) {
          // Para nuevas cards siempre están al final, usar scrollToEnd es más confiable
          try {
            scrollRef.scrollToEnd({ animated: true });
          } catch (error) {
            console.log('Error en scrollToCard, intento', attempt + 1, error);
            if (attempt < 3) {
              attemptScroll(attempt + 1);
            }
          }
        }
      }, delay);
    };

    attemptScroll();
  };

  const handleNewCategory = () => {
    const currentCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;

    // Verificar que no se exceda el total de categorías disponibles del sistema
    if (currentCategories.length >= systemCategories.length) {
      Alert.alert(
        'Límite alcanzado',
        'Ya has agregado todas las categorías disponibles del sistema. No hay más categorías para agregar.'
      );
      return;
    }

    // Activar modo de creación de nueva categoría del sistema
    setCreatingNewCategory(true);
    setCreatingCustomCategory(false);
    // Inicializar con una tarjeta vacía
    const newCardId = Date.now().toString();
    setMultipleNewCategories([{ id: newCardId, systemCategoryId: null }]);

    // Hacer scroll a la nueva tarjeta
    scrollToCard(newCardId);
  };

  const handleNewCustomCategory = () => {
    // Las categorías personalizadas no tienen límite, ya que no dependen del sistema
    // El usuario puede crear tantas como necesite

    // Activar modo de creación de categoría personalizada
    setCreatingCustomCategory(true);
    setCreatingNewCategory(false);
    // Inicializar con una tarjeta vacía
    const newCardId = Date.now().toString();
    setMultipleCustomCategories([{ id: newCardId, name: '', emoji: '' }]);

    // Hacer scroll a la nueva tarjeta
    scrollToCard(newCardId);
  };

  const handleCancelNewCategory = () => {
    setCreatingNewCategory(false);
    setCreatingCustomCategory(false);
    setMultipleNewCategories([]);
    setMultipleCustomCategories([]);
  };

  const handleSelectSystemCategory = (cardId: string, categoryId: string) => {
    setMultipleNewCategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, systemCategoryId: categoryId } : card)
    );
  };

  const handleCustomCategoryNameChange = (cardId: string, text: string) => {
    // Filtrar emojis del nombre
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const filteredText = text.replace(emojiRegex, '');
    setMultipleCustomCategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, name: filteredText } : card)
    );
  };

  const handleCustomCategoryEmojiChange = (cardId: string, text: string) => {
    // Solo permitir emojis
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const emojis = text.match(emojiRegex);
    const filteredEmoji = emojis ? emojis[0] : '';
    setMultipleCustomCategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, emoji: filteredEmoji } : card)
    );
  };

  const handleAddNewCategoryCard = () => {
    const currentCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;

    if (creatingNewCategory) {
      // Para categorías del sistema, verificar que no se exceda el límite de categorías disponibles
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
      // Hacer scroll a la nueva tarjeta
      scrollToCard(newCardId);
    } else if (creatingCustomCategory) {
      // Para categorías personalizadas, no hay límite
      const newCardId = Date.now().toString();
      setMultipleCustomCategories(prev => [...prev, { id: newCardId, name: '', emoji: '' }]);
      // Hacer scroll a la nueva tarjeta
      scrollToCard(newCardId);
    }
  };

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

  const getMaxCategoriesAllowed = () => {
    const currentCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;

    // El máximo permitido es la cantidad de categorías del sistema menos las ya creadas
    return systemCategories.length - currentCategories.length;
  };

  const canAddMoreSystemCategories = () => {
    const currentCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;

    // Retorna true si aún hay categorías del sistema disponibles para agregar
    return currentCategories.length < systemCategories.length;
  };

  // Obtener categorías disponibles para una tarjeta específica (excluyendo las ya seleccionadas en otras tarjetas)
  const getAvailableCategoriesForCard = (currentCardId: string) => {
    // Obtener los IDs de categorías seleccionadas en otras tarjetas
    const selectedInOtherCards = multipleNewCategories
      .filter(card => card.id !== currentCardId && card.systemCategoryId !== null)
      .map(card => card.systemCategoryId);

    // Filtrar las categorías disponibles excluyendo las ya seleccionadas en otras tarjetas
    return availableSystemCategories.filter(
      cat => !selectedInOtherCards.includes(cat.id)
    );
  };

  // Obtener las subcategorías disponibles del sistema para una categoría específica
  const getAvailableSubcategoriesForCategory = (categoryId: string, currentCardId?: string) => {
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;
    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const isIncome = activeTab === 'income';

    // Encontrar la categoría de usuario
    const userCategory = userCategories.find(cat => cat.id.toString() === categoryId);
    if (!userCategory) return [];

    // Si es una categoría personalizada (sin transaction_category_id)
    if (!userCategory.transaction_category_id) {
      // Las categorías personalizadas permiten hasta 20 subcategorías del sistema
      // Combinar todas las subcategorías del sistema disponibles
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

      // Obtener los IDs de subcategorías ya creadas por el usuario
      const existingSubcategoryIds = new Set(
        (userCategory.children || [])
          .filter(sub => sub.transaction_category_id !== undefined && sub.transaction_category_id !== null)
          .map(sub => sub.transaction_category_id)
      );

      // Si estamos filtrando para una tarjeta específica, excluir las ya seleccionadas en otras tarjetas
      let selectedInOtherCards: (string | null)[] = [];
      if (currentCardId) {
        selectedInOtherCards = multipleNewSubcategories
          .filter(card => card.id !== currentCardId && card.systemSubcategoryId !== null)
          .map(card => card.systemSubcategoryId);
      }

      // Filtrar subcategorías que NO están ya creadas y NO están seleccionadas
      return allSystemSubcategories
        .filter(subcat =>
          !existingSubcategoryIds.has(parseInt(subcat.id)) &&
          !selectedInOtherCards.includes(subcat.id)
        );
    }

    // Para categorías del sistema, mantener la lógica original
    // Encontrar la categoría del sistema correspondiente
    const systemCategory = systemCategories.find(cat => cat.id === userCategory.transaction_category_id);
    if (!systemCategory || !systemCategory.children) return [];

    // Obtener los IDs de subcategorías ya creadas por el usuario
    const existingSubcategoryIds = new Set(
      (userCategory.children || [])
        .filter(sub => sub.transaction_category_id !== undefined && sub.transaction_category_id !== null)
        .map(sub => sub.transaction_category_id)
    );

    // Si estamos filtrando para una tarjeta específica, excluir las ya seleccionadas en otras tarjetas
    let selectedInOtherCards: (string | null)[] = [];
    if (currentCardId) {
      selectedInOtherCards = multipleNewSubcategories
        .filter(card => card.id !== currentCardId && card.systemSubcategoryId !== null)
        .map(card => card.systemSubcategoryId);
    }

    // Filtrar subcategorías del sistema que NO están en user subcategories y NO están seleccionadas
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

  // Verificar si se pueden agregar más subcategorías a una categoría
  const canAddMoreSubcategories = (categoryId: string) => {
    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const userCategory = userCategories.find(cat => cat.id.toString() === categoryId);

    if (!userCategory) return false;

    // Para categorías personalizadas, verificar límite de 20
    if (!userCategory.transaction_category_id) {
      const currentSubcategoryCount = (userCategory.children || []).length;
      return currentSubcategoryCount < 20;
    }

    // Para categorías del sistema, verificar disponibilidad
    const availableSubcategories = getAvailableSubcategoriesForCategory(categoryId);
    return availableSubcategories.length > 0;
  };

  // Obtener el máximo de subcategorías permitidas para una categoría
  const getMaxSubcategoriesAllowed = (categoryId: string) => {
    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const userCategory = userCategories.find(cat => cat.id.toString() === categoryId);

    if (!userCategory) return 0;

    // Para categorías personalizadas, el límite es 20
    if (!userCategory.transaction_category_id) {
      const currentSubcategoryCount = (userCategory.children || []).length;
      return Math.max(0, 20 - currentSubcategoryCount);
    }

    // Para categorías del sistema, retornar la cantidad disponible
    const availableSubcategories = getAvailableSubcategoriesForCategory(categoryId);
    return availableSubcategories.length;
  };

  const handleConfirmNewCategory = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      return;
    }

    // Validar que todas las categorías tengan una selección
    const invalidCards = multipleNewCategories.filter(card => !card.systemCategoryId);
    if (invalidCards.length > 0) {
      Alert.alert('Error', 'Por favor selecciona una categoría en todas las tarjetas');
      return;
    }

    try {
      setCreatingCategory(true);

      const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;

      // Crear todas las categorías en paralelo
      const createPromises = multipleNewCategories.map(card => {
        // Buscar la categoría del sistema usando el ID que guardamos
        const selectedCategory = systemCategories.find(cat => cat.id.toString() === card.systemCategoryId);
        if (!selectedCategory) return Promise.reject(new Error('Categoría no encontrada'));

        // Obtener el emoji desde BudgetCategories
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

      // Recargar las categorías
      const [incomeResponse, expenseResponse] = await Promise.all([
        getUserCategories({ kind: 'income', per_page: 100 }, accessToken),
        getUserCategories({ kind: 'expense', per_page: 100 }, accessToken)
      ]);

      if (incomeResponse?.success && incomeResponse.data) {
        const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
        setApiIncomeCategories(parentCategories);
      }

      if (expenseResponse?.success && expenseResponse.data) {
        const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
        setApiExpenseCategories(parentCategories);
      }

      // Refrescar transacciones
      await Promise.all([
        refetchIncomeTransactions(),
        refetchExpenseTransactions()
      ]);

      // Resetear estado de creación
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

  const handleConfirmCustomCategory = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'No hay token de autenticación disponible');
      return;
    }

    // Validar que todas las categorías tengan nombre y emoji
    const invalidCards = multipleCustomCategories.filter(card => !card.name.trim() || !card.emoji.trim());
    if (invalidCards.length > 0) {
      Alert.alert('Error', 'Por favor completa el nombre y emoji en todas las tarjetas');
      return;
    }

    try {
      setCreatingCategory(true);

      // Crear todas las categorías personalizadas en paralelo
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

      // Recargar las categorías
      const [incomeResponse, expenseResponse] = await Promise.all([
        getUserCategories({ kind: 'income', per_page: 100 }, accessToken),
        getUserCategories({ kind: 'expense', per_page: 100 }, accessToken)
      ]);

      if (incomeResponse?.success && incomeResponse.data) {
        const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
        setApiIncomeCategories(parentCategories);
      }

      if (expenseResponse?.success && expenseResponse.data) {
        const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
        setApiExpenseCategories(parentCategories);
      }

      // Refrescar transacciones
      await Promise.all([
        refetchIncomeTransactions(),
        refetchExpenseTransactions()
      ]);

      // Resetear estado de creación
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

  // ===== FUNCIONES PARA MANEJAR SUBCATEGORÍAS =====

  const handleAddSubcategory = (categoryId: string) => {
    // Verificar si hay subcategorías disponibles
    if (!canAddMoreSubcategories(categoryId)) {
      Alert.alert(
        'Límite alcanzado',
        'Ya has agregado todas las subcategorías disponibles para esta categoría.'
      );
      return;
    }

    // Determinar si es una categoría personalizada
    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const userCategory = userCategories.find(cat => cat.id.toString() === categoryId);
    const isCustomCategory = userCategory && !userCategory.transaction_category_id;

    // Activar modo de agregar subcategoría para esta categoría
    setAddingSubcategoryForCategoryId(categoryId);
    // Inicializar con una tarjeta vacía
    const newCardId = Date.now().toString();

    if (isCustomCategory) {
      // Para categorías personalizadas, usar inputs personalizados
      setMultipleCustomSubcategories([{ id: newCardId, name: '', emoji: '' }]);
      setMultipleNewSubcategories([]);
    } else {
      // Para categorías del sistema, usar select
      setMultipleNewSubcategories([{ id: newCardId, systemSubcategoryId: null }]);
      setMultipleCustomSubcategories([]);
    }

    // Hacer scroll a la nueva tarjeta de subcategoría
    scrollToCard(newCardId, true);
  };

  const handleCancelAddSubcategory = () => {
    setAddingSubcategoryForCategoryId(null);
    setMultipleNewSubcategories([]);
    setMultipleCustomSubcategories([]);
  };

  const handleSelectSystemSubcategory = (cardId: string, subcategoryId: string) => {
    setMultipleNewSubcategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, systemSubcategoryId: subcategoryId } : card)
    );
  };

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

    // Hacer scroll a la nueva tarjeta de subcategoría
    scrollToCard(newCardId, true);
  };

  const handleRemoveNewSubcategoryCard = (cardId: string) => {
    setMultipleNewSubcategories(prev => {
      const newList = prev.filter(card => card.id !== cardId);
      if (newList.length === 0) {
        setAddingSubcategoryForCategoryId(null);
      }
      return newList;
    });
  };

  // Funciones para manejar subcategorías personalizadas
  const handleCustomSubcategoryNameChange = (cardId: string, text: string) => {
    // Filtrar emojis del nombre
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const filteredText = text.replace(emojiRegex, '');
    setMultipleCustomSubcategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, name: filteredText } : card)
    );
  };

  const handleCustomSubcategoryEmojiChange = (cardId: string, text: string) => {
    // Solo permitir emojis
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const emojis = text.match(emojiRegex);
    const filteredEmoji = emojis ? emojis[0] : '';
    setMultipleCustomSubcategories(prev =>
      prev.map(card => card.id === cardId ? { ...card, emoji: filteredEmoji } : card)
    );
  };

  const handleAddNewCustomSubcategoryCard = () => {
    if (!addingSubcategoryForCategoryId) return;

    const newCardId = Date.now().toString();
    setMultipleCustomSubcategories(prev => [...prev, { id: newCardId, name: '', emoji: '' }]);

    // Hacer scroll a la nueva tarjeta
    scrollToCard(newCardId, true);
  };

  const handleRemoveCustomSubcategoryCard = (cardId: string) => {
    setMultipleCustomSubcategories(prev => {
      const newList = prev.filter(card => card.id !== cardId);
      if (newList.length === 0) {
        setAddingSubcategoryForCategoryId(null);
      }
      return newList;
    });
  };

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

    // Validaciones según el tipo de categoría
    if (isCustomCategory) {
      // Validar subcategorías personalizadas
      const invalidCards = multipleCustomSubcategories.filter(card => !card.name.trim() || !card.emoji.trim());
      if (invalidCards.length > 0) {
        Alert.alert('Error', 'Por favor completa el nombre y emoji en todas las subcategorías');
        return;
      }
    } else {
      // Validar subcategorías del sistema
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
        // Crear subcategorías personalizadas
        createPromises = multipleCustomSubcategories.map(card => {
          return createUserCategory(
            {
              name: card.name.trim(),
              kind: activeTab === 'income' ? 'income' : 'expense',
              emoji_code: card.emoji,
              parent_id: parentCategory.id
              // NO enviar transaction_category_id para subcategorías personalizadas
            },
            accessToken
          );
        });
      } else {
        // Crear subcategorías del sistema
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

      // Recargar las categorías
      const [incomeResponse, expenseResponse] = await Promise.all([
        getUserCategories({ kind: 'income', per_page: 100 }, accessToken),
        getUserCategories({ kind: 'expense', per_page: 100 }, accessToken)
      ]);

      if (incomeResponse?.success && incomeResponse.data) {
        const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
        setApiIncomeCategories(parentCategories);
      }

      if (expenseResponse?.success && expenseResponse.data) {
        const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
        setApiExpenseCategories(parentCategories);
      }

      // Refrescar transacciones
      await Promise.all([
        refetchIncomeTransactions(),
        refetchExpenseTransactions()
      ]);

      // Resetear estado de creación
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

  const handleSelectAllTransactions = () => {
    const allTransactionIds = new Set<number>(groupedData.uncategorized.map(t => t.id));

    allTransactionIds.forEach(id => {
      const animation = getTransactionAnimation(id);
      Animated.spring(animation, {
        toValue: 1,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();
    });

    setSelectedTransactions(allTransactionIds);

    if (!transactionSelectionMode && allTransactionIds.size > 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(true);
    }
  };

  const handleDeselectAllTransactions = () => {
    selectedTransactions.forEach(id => {
      const animation = getTransactionAnimation(id);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();
    });

    setSelectedTransactions(new Set());
  };

  const totalVisibleTransactions = groupedData.uncategorized.length;

  // Helper para obtener el emoji desde BudgetCategories basándose en el nombre
  const getEmojiFromBudgetCategories = (categoryName: string, isIncome: boolean): string => {
    const staticCategories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const normalizedName = categoryName.toLowerCase().trim();

    // Buscar en categorías principales
    const found = staticCategories.find(cat => {
      const catNameEn = cat.name.en.toLowerCase();
      const catNameEs = cat.name.es.toLowerCase();
      return catNameEn === normalizedName || catNameEs === normalizedName;
    });

    if (found) return found.emoji;

    // Buscar en subcategorías
    for (const category of staticCategories) {
      if (category.subcategories) {
        const subcatFound = category.subcategories.find(subcat => {
          const subcatNameEn = subcat.name.en.toLowerCase();
          const subcatNameEs = subcat.name.es.toLowerCase();
          return subcatNameEn === normalizedName || subcatNameEs === normalizedName;
        });
        if (subcatFound) return subcatFound.emoji;
      }
    }

    return '📁'; // Emoji por defecto si no se encuentra
  };

  // Categorías del sistema disponibles (que no han sido seleccionadas)
  const availableSystemCategories = useMemo(() => {
    const systemCategories = activeTab === 'income' ? systemIncomeCategories : systemExpenseCategories;
    const userCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const isIncome = activeTab === 'income';

    // Obtener los transaction_category_id de las categorías ya creadas por el usuario
    const userCategoryIds = new Set(
      userCategories
        .filter(cat => cat.transaction_category_id !== undefined && cat.transaction_category_id !== null)
        .map(cat => cat.transaction_category_id)
    );

    // Filtrar las categorías del sistema que NO están en user categories
    // y transformar al formato esperado por el componente
    return systemCategories
      .filter(cat => !userCategoryIds.has(cat.id))
      .map(cat => ({
        id: cat.id.toString(),
        name: {
          es: cat.translated_name || cat.name,
          en: cat.name,
          pt: cat.translated_name || cat.name,
          'es-CL': cat.translated_name || cat.name
        },
        emoji: getEmojiFromBudgetCategories(cat.name, isIncome),
        transactionCategoryId: cat.id // Guardamos el ID real para usarlo al crear
      }));
  }, [activeTab, apiIncomeCategories, apiExpenseCategories, systemIncomeCategories, systemExpenseCategories]);

  const handleStartEdit = (categoryId: string) => {
    // Encontrar la categoría
    const apiCategories = activeTab === 'income' ? apiIncomeCategories : apiExpenseCategories;
    const category = apiCategories.find(cat => cat.id.toString() === categoryId);

    if (!category) return;

    // Inicializar el mapa de ediciones pendientes con los valores actuales
    const newPendingEdits = new Map<string, { name: string; emoji: string }>();

    // Agregar categoría padre
    newPendingEdits.set(categoryId, {
      name: category.display_name,
      emoji: category.emoji_code || ''
    });

    // Agregar todas las subcategorías
    if (category.children) {
      category.children.forEach(subcat => {
        newPendingEdits.set(subcat.id.toString(), {
          name: subcat.display_name,
          emoji: subcat.emoji_code || ''
        });
      });
    }

    setPendingEdits(newPendingEdits);
    setEditingParentCategoryId(categoryId);

    // Expandir la categoría si no está expandida
    if (!expandedCategories.has(categoryId)) {
      toggleCategory(categoryId);
    }
  };

  const handleCancelEdit = () => {
    setPendingEdits(new Map());
    setEditingParentCategoryId(null);
  };

  // Función para validar y filtrar entrada de nombre (sin emojis)
  const handleEditNameChange = (categoryId: string, text: string) => {
    // Regex para detectar emojis
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    // Filtrar emojis del texto
    const filteredText = text.replace(emojiRegex, '');

    // Actualizar el mapa de ediciones pendientes
    setPendingEdits(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(categoryId);
      if (current) {
        newMap.set(categoryId, { ...current, name: filteredText });
      }
      return newMap;
    });
  };

  // Función para validar y filtrar entrada de emoji (solo emojis)
  const handleEditEmojiChange = (categoryId: string, text: string) => {
    // Regex para detectar solo emojis y caracteres relacionados (ZWJ, variation selectors)
    const onlyEmojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\ufe0f]/gu;
    // Extraer solo los emojis del texto
    const emojis = text.match(onlyEmojiRegex);
    const filteredText = emojis ? emojis.join('') : '';

    // Actualizar el mapa de ediciones pendientes
    setPendingEdits(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(categoryId);
      if (current) {
        newMap.set(categoryId, { ...current, emoji: filteredText });
      }
      return newMap;
    });
  };

  const handleSaveEdit = async () => {
    if (!accessToken || !editingParentCategoryId || pendingEdits.size === 0) return;

    // Encontrar la categoría original
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

    // Validar todos los cambios pendientes
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;
    const onlyEmojiRegex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\ufe0f]+$/gu;

    for (const [categoryId, edits] of pendingEdits.entries()) {
      // Validar nombre: no debe contener emojis
      if (emojiRegex.test(edits.name)) {
        Alert.alert('Error', 'Los nombres no pueden contener emojis. Solo letras, números y símbolos.');
        return;
      }

      // Validar nombre: no debe estar vacío
      if (edits.name.trim().length === 0) {
        Alert.alert('Error', 'Los nombres no pueden estar vacíos.');
        return;
      }

      // Validar emoji: debe contener al menos un emoji y no otros caracteres
      if (!onlyEmojiRegex.test(edits.emoji)) {
        Alert.alert('Error', 'Los emojis solo pueden contener emojis válidos. No se permiten letras, números o símbolos.');
        return;
      }

      // Validar emoji: no debe estar vacío
      if (edits.emoji.trim().length === 0) {
        Alert.alert('Error', 'Los emojis no pueden estar vacíos.');
        return;
      }
    }

    // Recopilar los cambios que realmente son diferentes
    const updates: Array<{ id: number; params: { name?: string; emoji_code?: string } }> = [];

    for (const [categoryId, edits] of pendingEdits.entries()) {
      const originalCategory = findCategoryById(categoryId);
      if (!originalCategory) continue;

      const hasNameChanged = edits.name !== originalCategory.display_name;
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

    // Si no hay cambios reales, solo cancelar
    if (updates.length === 0) {
      handleCancelEdit();
      return;
    }

    try {
      setUpdatingCategory(true);

      // Actualizar todas las categorías/subcategorías en paralelo
      await Promise.all(
        updates.map(update => updateUserCategory(update.id, update.params, accessToken))
      );

      // Recargar categorías
      const [incomeResponse, expenseResponse] = await Promise.all([
        getUserCategories({ kind: 'income', per_page: 100 }, accessToken),
        getUserCategories({ kind: 'expense', per_page: 100 }, accessToken)
      ]);

      if (incomeResponse?.success && incomeResponse.data) {
        const parentCategories = incomeResponse.data.filter(cat => cat.parent_id === null);
        setApiIncomeCategories(parentCategories);
      }

      if (expenseResponse?.success && expenseResponse.data) {
        const parentCategories = expenseResponse.data.filter(cat => cat.parent_id === null);
        setApiExpenseCategories(parentCategories);
      }

      handleCancelEdit();
      Alert.alert('Éxito', `${updates.length} ${updates.length === 1 ? 'categoría actualizada' : 'categorías actualizadas'} correctamente`);

    } catch (error) {
      console.error('Error updating categories:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar las categorías');
    } finally {
      setUpdatingCategory(false);
    }
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
    deletingCategories,
    deletingTransactions,
    updatingCategory,
    editingParentCategoryId,
    pendingEdits,
    creatingNewCategory,
    creatingCustomCategory,
    creatingCategory,
    multipleNewCategories,
    multipleCustomCategories,
    addingSubcategoryForCategoryId,
    multipleNewSubcategories,
    multipleCustomSubcategories,

    apiIncomeCategories,
    apiExpenseCategories,

    groupedData,
    categoryOptions,
    subcategoryOptions,
    categories,
    currentLang,
    totalVisibleTransactions,
    availableSystemCategories,

    // Refs para scroll automático
    scrollViewRef,
    categoryCardRefs,
    subcategoryCardRefs,

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
    canAddMoreSystemCategories,
    getAvailableCategoriesForCard,
    handleAddSubcategory,
    handleCancelAddSubcategory,
    handleSelectSystemSubcategory,
    handleAddNewSubcategoryCard,
    handleRemoveNewSubcategoryCard,
    handleCustomSubcategoryNameChange,
    handleCustomSubcategoryEmojiChange,
    handleAddNewCustomSubcategoryCard,
    handleRemoveCustomSubcategoryCard,
    handleConfirmNewSubcategories,
    getAvailableSubcategoriesForCategory,
    canAddMoreSubcategories,
    getMaxSubcategoriesAllowed,

    t,
  };
}
