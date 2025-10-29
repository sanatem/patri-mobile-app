import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Container, Header, Tabs, Button, ConfirmModal, CheckboxItem, Select } from '@/components/ui';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';
import { useFloidTransactions } from '@/hooks/budget/useFloidTransactions';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { useAuth } from '@/providers/AuthProvider';
import Colors from '@/constants/Colors';
import { ChevronDown, Edit2, AlertTriangle, Plus, Trash2, ArrowRight, CheckCircle } from 'lucide-react-native';
import { TransactionItem } from '@/components/budget/CategoriesManager/UncategorizedList/TransactionItem';

// Habilitar LayoutAnimation en Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CategoriesManagerScreen() {
  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  const categoryRotations = useRef<Map<string, Animated.Value>>(new Map()).current;
  const subcategoryRotations = useRef<Map<string, Animated.Value>>(new Map()).current;

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
  } = useFloidTransactions({
    floidIds: selectedAccountIds,
    per_page: 1000,
    enabled: selectedAccountIds.length > 0,
    transaction_type: 'outcome'
  });

  const loading = incomeLoading || expenseLoading;

  // Obtener las transacciones según el tab activo
  const allTransactionsData = activeTab === 'income' ? incomeTransactionsData : expenseTransactionsData;
  const allTransactions = allTransactionsData?.transactions || [];

  const categories = activeTab === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
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
    const uncategorized = allTransactions.filter(t => !t.category || t.category === '' || t.category === null);

    const categorized = categories.map(category => {
      const categoryTransactions = allTransactions.filter(t => t.category === category.id);

      const subcategoriesData = category.subcategories?.map(subcat => {
        const subcatTransactions = categoryTransactions.filter(t => t.subcategory === subcat.id);
        return {
          ...subcat,
          transactions: subcatTransactions,
          total: subcatTransactions.reduce((sum, t) => sum + t.amount, 0)
        };
      }) || [];

      const uncategorizedInCategory = categoryTransactions.filter(t => !t.subcategory);

      return {
        ...category,
        subcategories: subcategoriesData,
        uncategorizedTransactions: uncategorizedInCategory,
        total: categoryTransactions.reduce((sum, t) => sum + t.amount, 0),
        transactionCount: categoryTransactions.length
      };
    });

    return { categorized, uncategorized };
  }, [allTransactions, activeTab, categories]);

  // Opciones para los selects del modal de mover transacciones
  const categoryOptions = useMemo(() => {
    return categories.map(cat => ({
      label: `${cat.emoji} ${cat.name[currentLang as keyof typeof cat.name] || cat.name.es}`,
      value: cat.id
    }));
  }, [categories, currentLang]);

  const subcategoryOptions = useMemo(() => {
    if (!selectedDestinationCategory) return [];

    const category = categories.find(cat => cat.id === selectedDestinationCategory);
    if (!category?.subcategories) return [];

    return category.subcategories.map(subcat => ({
      label: `${subcat.emoji} ${subcat.name[currentLang as keyof typeof subcat.name] || subcat.name.es}`,
      value: subcat.id
    }));
  }, [selectedDestinationCategory, categories, currentLang]);

  const toggleCategory = (categoryId: string) => {
    // Configurar animación de layout
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newExpanded = new Set(expandedCategories);
    const isExpanding = !newExpanded.has(categoryId);
    const rotation = getOrCreateRotation(categoryId, true);

    // Animar rotación del chevron
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
    // Configurar animación de layout
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    const newExpanded = new Set(expandedSubcategories);
    const isExpanding = !newExpanded.has(subcategoryId);
    const rotation = getOrCreateRotation(subcategoryId, false);

    // Animar rotación del chevron
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

  // Función para obtener o crear animación de selección
  const getSelectionAnimation = (id: string) => {
    if (!selectionAnimations.has(id)) {
      selectionAnimations.set(id, new Animated.Value(0));
    }
    return selectionAnimations.get(id)!;
  };

  // Funciones para manejo de selección múltiple de subcategorías
  const handleLongPress = (subcategoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionMode(true);
    const newSelected = new Set(selectedSubcategories);
    newSelected.add(subcategoryId);
    setSelectedSubcategories(newSelected);

    // Animar selección
    const animation = getSelectionAnimation(subcategoryId);
    Animated.spring(animation, {
      toValue: 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();
  };

  // Funciones para manejo de selección múltiple de categorías
  const handleCategoryLongPress = (categoryId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionMode(true);
    const newSelected = new Set(selectedCategories);
    newSelected.add(categoryId);
    setSelectedCategories(newSelected);

    // Seleccionar también todas las subcategorías de esta categoría
    const category = categories.find(cat => cat.id === categoryId);
    if (category?.subcategories) {
      const newSelectedSubs = new Set(selectedSubcategories);
      category.subcategories.forEach(subcat => {
        newSelectedSubs.add(subcat.id);
        // Animar subcategoría
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

    // Animar selección de categoría
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

      // Seleccionar/Deseleccionar también todas las subcategorías de esta categoría
      const category = categories.find(cat => cat.id === categoryId);
      if (category?.subcategories) {
        const newSelectedSubs = new Set(selectedSubcategories);
        category.subcategories.forEach(subcat => {
          if (isCurrentlySelected) {
            // Deseleccionar subcategoría
            newSelectedSubs.delete(subcat.id);
          } else {
            // Seleccionar subcategoría
            newSelectedSubs.add(subcat.id);
          }
          // Animar subcategoría
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

      // Animar selección/deselección de categoría
      const animation = getSelectionAnimation(categoryId);
      Animated.spring(animation, {
        toValue: isCurrentlySelected ? 0 : 1,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();

      // Si no hay selecciones, salir del modo selección
      // Necesitamos calcular el nuevo tamaño después de actualizar subcategorías
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

      // Animar selección/deselección
      const animation = getSelectionAnimation(subcategoryId);
      Animated.spring(animation, {
        toValue: isCurrentlySelected ? 0 : 1,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();

      // Si no hay selecciones, salir del modo selección
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

    // Animar deselección de todos los items (subcategorías y categorías)
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
    // Calcular total de transacciones que se descategorizarán
    let totalTransactions = 0;

    // Contar transacciones de categorías completas seleccionadas
    groupedData.categorized.forEach(category => {
      if (selectedCategories.has(category.id)) {
        totalTransactions += category.transactionCount;
      }

      // Contar transacciones de subcategorías seleccionadas
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
    // TODO: Implementar la lógica de eliminación real
    console.log('Eliminando categorías:', Array.from(selectedCategories));
    console.log('Eliminando subcategorías:', Array.from(selectedSubcategories));
    console.log('Total de transacciones a descategorizar:', totalTransactionsToUncategorize);

    // Animar deselección de todos los items antes de eliminar
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

    // Cerrar modal y resetear selección
    setShowDeleteModal(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectionMode(false);
    setSelectedSubcategories(new Set());
    setSelectedCategories(new Set());
  };

  // Funciones para obtener animación de transacción
  const getTransactionAnimation = (id: number) => {
    if (!transactionAnimations.has(id)) {
      transactionAnimations.set(id, new Animated.Value(0));
    }
    return transactionAnimations.get(id)!;
  };

  // Funciones para manejo de selección de transacciones
  const handleTransactionPress = (transactionId: number) => {
    const newSelected = new Set(selectedTransactions);
    const isCurrentlySelected = newSelected.has(transactionId);

    if (isCurrentlySelected) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);

    // Animar checkbox
    const animation = getTransactionAnimation(transactionId);
    Animated.spring(animation, {
      toValue: isCurrentlySelected ? 0 : 1,
      useNativeDriver: false,
      friction: 8,
      tension: 40
    }).start();

    // Activar modo selección si hay al menos 1 item seleccionado
    if (newSelected.size > 0 && !transactionSelectionMode) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(true);
    } else if (newSelected.size === 0) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setTransactionSelectionMode(false);
    }
  };

  const handleCancelTransactionSelection = () => {
    // Desanimar todos los checkboxes seleccionados
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
    // TODO: Implementar eliminación de transacciones
    console.log('Eliminando transacciones:', Array.from(selectedTransactions));

    // Desanimar todos los checkboxes
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
    // Reset subcategory when category changes
    setSelectedDestinationSubcategory(null);
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedDestinationSubcategory(subcategoryId);
  };

  const confirmMoveTransactions = () => {
    // TODO: Implementar movimiento de transacciones a la categoría seleccionada
    console.log('Moviendo transacciones:', Array.from(selectedTransactions));
    console.log('A categoría:', selectedDestinationCategory);
    console.log('A subcategoría:', selectedDestinationSubcategory);

    // Desanimar todos los checkboxes
    selectedTransactions.forEach(id => {
      const animation = getTransactionAnimation(id);
      Animated.spring(animation, {
        toValue: 0,
        useNativeDriver: false,
        friction: 8,
        tension: 40
      }).start();
    });

    // Mostrar mensaje de éxito
    setShowMoveModal(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);

    // Reset
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTransactionSelectionMode(false);
    setSelectedTransactions(new Set());
    setSelectedDestinationCategory(null);
    setSelectedDestinationSubcategory(null);
  };

  const tabs = [
    { key: 'income', label: t('budget.income', 'Ingresos') },
    { key: 'expenses', label: t('budget.expenses', 'Gastos') }
  ];

  return (
    <Container variant="secondaryPage">
      <Header
        title={
          transactionSelectionMode
            ? `${selectedTransactions.size} seleccionadas`
            : selectionMode
            ? `${selectedCategories.size + selectedSubcategories.size} seleccionadas`
            : t('budget.categories_manager', 'Categorías')
        }
        showBackButton={!selectionMode && !transactionSelectionMode}
        leftAction={
          transactionSelectionMode ? (
            <TouchableOpacity onPress={handleCancelTransactionSelection} style={{ padding: 8 }}>
              <Text className="text-base font-medium" style={{ color: Colors.primary[500] }}>Cancelar</Text>
            </TouchableOpacity>
          ) : selectionMode ? (
            <TouchableOpacity onPress={handleCancelSelection} style={{ padding: 8 }}>
              <Text className="text-base font-medium" style={{ color: Colors.primary[500] }}>Cancelar</Text>
            </TouchableOpacity>
          ) : undefined
        }
        rightAction={
          transactionSelectionMode ? (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={handleDeleteTransactions}
                style={{ padding: 8 }}
                disabled={selectedTransactions.size === 0}
              >
                <Trash2 size={20} color={selectedTransactions.size > 0 ? Colors.error[500] : Colors.gray[400]} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleMoveTransactions}
                style={{ padding: 8 }}
                disabled={selectedTransactions.size === 0}
              >
                <ArrowRight size={20} color={selectedTransactions.size > 0 ? Colors.primary[500] : Colors.gray[400]} />
              </TouchableOpacity>
            </View>
          ) : selectionMode ? (
            <TouchableOpacity
              onPress={handleDeleteSelected}
              style={{ padding: 8 }}
              disabled={selectedSubcategories.size === 0 && selectedCategories.size === 0}
            >
              <Trash2 size={20} color={(selectedSubcategories.size > 0 || selectedCategories.size > 0) ? Colors.error[500] : Colors.gray[400]} />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <View style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tab) => setActiveTab(tab as 'income' | 'expenses')}
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
        {groupedData.uncategorized.length > 0 && (
          <View style={{
            marginHorizontal: 20,
            marginTop: 20,
            backgroundColor: 'white',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors.warning[500],
            overflow: 'hidden'
          }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
              }}
              onPress={() => toggleCategory('uncategorized')}
              activeOpacity={0.7}
            >
              <AlertTriangle size={24} color={Colors.warning[500]} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text className="text-base font-medium" style={{ color: Colors.warning[600] }}>
                  {t('budget.uncategorized', 'Sin Categorizar')} ({groupedData.uncategorized.length})
                </Text>
              </View>
              <Animated.View style={getRotateStyle('uncategorized', true)}>
                <ChevronDown size={20} color={Colors.warning[500]} />
              </Animated.View>
            </TouchableOpacity>

            {expandedCategories.has('uncategorized') && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                {groupedData.uncategorized.map((transaction) => {
                  const isSelected = selectedTransactions.has(transaction.id);
                  const animation = getTransactionAnimation(transaction.id);

                  return (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      transactionType={activeTab === 'income' ? 'income' : 'outcome'}
                      isSelected={isSelected}
                      animation={animation}
                      onPress={handleTransactionPress}
                    />
                  );
                })}
              </View>
            )}
          </View>
        )}

        {groupedData.categorized.map((category) => {
          const isCategorySelected = selectedCategories.has(category.id);
          const categoryAnimation = getSelectionAnimation(category.id);

          const categoryCheckboxOpacity = categoryAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.6, 1]
          });

          const categoryCheckboxScale = categoryAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1]
          });

          return (
          <View
            key={category.id}
            style={{
              marginHorizontal: 20,
              marginTop: 20,
              backgroundColor: 'white',
              borderRadius: 12,
              borderWidth: 1,
              borderColor: Colors.gray[100],
              overflow: 'hidden'
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
              }}
            >
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                onPress={() => handleCategoryPress(category.id)}
                onLongPress={() => handleCategoryLongPress(category.id)}
                activeOpacity={0.7}
              >
                {selectionMode && (
                  <Animated.View style={{
                    marginRight: 12,
                    opacity: categoryCheckboxOpacity,
                    transform: [{ scale: categoryCheckboxScale }]
                  }}>
                    <CheckboxItem selected={isCategorySelected} size={18} />
                  </Animated.View>
                )}
                <Text style={{ fontSize: 24, marginRight: 12 }}>{category.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text className="text-base font-medium" style={{ color: Colors.primary[600] }}>
                    {category.name[currentLang as keyof typeof category.name] || category.name.es}
                  </Text>
                  {category.transactionCount > 0 && (
                    <Text className="text-sm font-regular" style={{ color: Colors.primary[500], marginTop: 2 }}>
                      ${Math.round(category.total).toLocaleString('es-CL')}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              {!selectionMode && (
                <>
                  <TouchableOpacity
                    style={{ padding: 4, marginRight: 8 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      // TODO: Implementar creación de subcategoría
                    }}
                  >
                    <Plus size={16} color={Colors.primary[500]} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ padding: 4, marginRight: 8 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      // TODO: Implementar edición
                    }}
                  >
                    <Edit2 size={16} color={Colors.primary[500]} />
                  </TouchableOpacity>
                  <Animated.View style={getRotateStyle(category.id, true)}>
                    <ChevronDown size={20} color={Colors.primary[500]} />
                  </Animated.View>
                </>
              )}
            </View>

            {expandedCategories.has(category.id) && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                {category.subcategories && category.subcategories.map((subcat) => {
                  const isSelected = selectedSubcategories.has(subcat.id);
                  const animation = getSelectionAnimation(subcat.id);

                  // Interpolaciones de animación
                  const checkboxOpacity = animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1]
                  });

                  const checkboxScale = animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1]
                  });

                  return (
                  <View key={subcat.id} style={{ marginBottom: 12 }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors.gray[100],
                        backgroundColor: 'white',
                      }}
                    >
                      <TouchableOpacity
                        style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                        onPress={() => handleSubcategoryPress(subcat.id)}
                        onLongPress={() => handleLongPress(subcat.id)}
                        activeOpacity={0.7}
                      >
                        {selectionMode && (
                          <Animated.View style={{
                            marginRight: 12,
                            opacity: checkboxOpacity,
                            transform: [{ scale: checkboxScale }]
                          }}>
                            <CheckboxItem selected={isSelected} size={18} />
                          </Animated.View>
                        )}
                      <Text style={{ fontSize: 20, marginRight: 8 }}>{subcat.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text className="text-sm font-medium" style={{ color: Colors.primary[600] }}>
                          {subcat.name[currentLang as keyof typeof subcat.name] || subcat.name.es}
                        </Text>
                        {subcat.transactions.length > 0 && (
                          <Text className="text-xs font-regular" style={{ color: Colors.primary[500], marginTop: 2 }}>
                            ${Math.round(subcat.total).toLocaleString('es-CL')}
                          </Text>
                        )}
                      </View>
                      </TouchableOpacity>
                      {!selectionMode && (
                        <Animated.View style={getRotateStyle(subcat.id, false)}>
                          <ChevronDown size={16} color={Colors.primary[500]} />
                        </Animated.View>
                      )}
                    </View>

                    {expandedSubcategories.has(subcat.id) && subcat.transactions.length > 0 && (
                      <View style={{ marginTop: 8, marginLeft: 12 }}>
                        {subcat.transactions.map((transaction) => {
                          const isSelected = selectedTransactions.has(transaction.id);
                          const animation = getTransactionAnimation(transaction.id);

                          return (
                            <TransactionItem
                              key={transaction.id}
                              transaction={transaction}
                              transactionType={activeTab === 'income' ? 'income' : 'outcome'}
                              isSelected={isSelected}
                              animation={animation}
                              onPress={handleTransactionPress}
                            />
                          );
                        })}
                      </View>
                    )}
                  </View>
                  );
                })}

                {category.uncategorizedTransactions.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    {category.uncategorizedTransactions.map((transaction) => {
                      const isSelected = selectedTransactions.has(transaction.id);
                      const animation = getTransactionAnimation(transaction.id);

                      return (
                        <TransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          transactionType={activeTab === 'income' ? 'income' : 'outcome'}
                          isSelected={isSelected}
                          animation={animation}
                          onPress={handleTransactionPress}
                        />
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </View>
          );
        })}

        </ScrollView>

  
        <View style={{
          backgroundColor: '#fff',
          paddingHorizontal: 24,
          paddingVertical: 16,
          paddingBottom: 32,
          borderTopWidth: 1,
          borderTopColor: Colors.gray[100],
        }}>
          <Button
            title={t('budget.new_category', 'Nueva Categoría')}
            onPress={() => {
              // TODO: Implementar creación de categoría
              console.log('Crear nueva categoría');
            }}
            variant="primary"
            fullWidth
            icon={<Plus size={20} color="#fff" />}
          />
        </View>
      </View>

      <ConfirmModal
        visible={showDeleteModal}
        title={t('budget.delete_categories', 'Eliminar categorías')}
        message={
          (() => {
            const totalItems = selectedCategories.size + selectedSubcategories.size;
            let itemsText = '';

            if (selectedCategories.size > 0 && selectedSubcategories.size > 0) {
              itemsText = `${selectedCategories.size} categoría${selectedCategories.size > 1 ? 's' : ''} y ${selectedSubcategories.size} subcategoría${selectedSubcategories.size > 1 ? 's' : ''}`;
            } else if (selectedCategories.size > 0) {
              itemsText = `${selectedCategories.size} categoría${selectedCategories.size > 1 ? 's' : ''}`;
            } else {
              itemsText = `${selectedSubcategories.size} subcategoría${selectedSubcategories.size > 1 ? 's' : ''}`;
            }

            if (totalTransactionsToUncategorize > 0) {
              return `¿Estás seguro que deseas eliminar ${itemsText}?\n\n${totalTransactionsToUncategorize} transacción${totalTransactionsToUncategorize > 1 ? 'es' : ''} quedarán sin categorizar automáticamente.`;
            }
            return `¿Estás seguro que deseas eliminar ${itemsText}?`;
          })()
        }
        onConfirm={confirmDelete}
        onClose={() => setShowDeleteModal(false)}
        confirmButtonText={t('common.delete', 'Eliminar')}
        cancelButtonText={t('common.cancel', 'Cancelar')}
      />

      {/* Modal para confirmar eliminación de transacciones */}
      <ConfirmModal
        visible={showDeleteTransactionsModal}
        title={t('budget.delete_transactions', 'Eliminar transacciones')}
        message={`¿Estás seguro que deseas eliminar ${selectedTransactions.size} transacción${selectedTransactions.size > 1 ? 'es' : ''}?`}
        onConfirm={confirmDeleteTransactions}
        onClose={() => setShowDeleteTransactionsModal(false)}
        confirmButtonText={t('common.delete', 'Eliminar')}
        cancelButtonText={t('common.cancel', 'Cancelar')}
      />

      {/* Modal para seleccionar categoría destino */}
      <ConfirmModal
        visible={showMoveModal}
        title={`Mover ${selectedTransactions.size} transacción${selectedTransactions.size > 1 ? 'es' : ''}`}
        onConfirm={confirmMoveTransactions}
        onClose={() => {
          setShowMoveModal(false);
          setSelectedDestinationCategory(null);
          setSelectedDestinationSubcategory(null);
        }}
        confirmButtonText="Mover"
        cancelButtonText="Cancelar"
        confirmDisabled={!selectedDestinationCategory}
      >
        <View style={{ marginTop: 8 }}>
          <Select
            options={categoryOptions}
            value={selectedDestinationCategory || ''}
            onSelect={handleCategoryChange}
            placeholder="Selecciona una categoría"
          />

          {selectedDestinationCategory && subcategoryOptions.length > 0 && (
            <Select
              options={subcategoryOptions}
              value={selectedDestinationSubcategory || ''}
              onSelect={handleSubcategoryChange}
              placeholder="Selecciona una subcategoría (opcional)"
            />
          )}
        </View>
      </ConfirmModal>

      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 20,
          right: 20,
          backgroundColor: Colors.success[500],
          borderRadius: 12,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}>
          <CheckCircle size={24} color="white" style={{ flexShrink: 0 }} />
          <Text style={{
            color: 'white',
            fontSize: 16,
            fontWeight: '600',
            marginLeft: 12,
            flex: 1,
            flexWrap: 'wrap'
          }}>
            Transacciones categorizadas correctamente
          </Text>
        </View>
      )}
    </Container>
  );
}
