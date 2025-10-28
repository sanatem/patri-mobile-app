import React, { useState, useMemo, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Container, Header, Tabs, Button } from '@/components/ui';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';
import { useFloidTransactions } from '@/hooks/budget/useFloidTransactions';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { useAuth } from '@/providers/AuthProvider';
import Colors from '@/constants/Colors';
import { ChevronDown, Edit2, AlertTriangle, Plus, MinusCircle } from 'lucide-react-native';

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

  const tabs = [
    { key: 'income', label: t('budget.income', 'Ingresos') },
    { key: 'expenses', label: t('budget.expenses', 'Gastos') }
  ];

  return (
    <Container variant="secondaryPage">
      <Header
        title={t('budget.categories_manager', 'Categorías')}
        showBackButton
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
                {groupedData.uncategorized.map((transaction) => (
                  <View
                    key={transaction.id}
                    style={{
                      backgroundColor: 'white',
                      padding: 12,
                      borderRadius: 8,
                      marginBottom: 8,
                      borderWidth: 1,
                      borderColor: Colors.gray[100],
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text className="text-sm font-medium" style={{ color: Colors.primary[600] }}>
                        {activeTab === 'income' ? '+' : '-'}${Math.round(transaction.amount).toLocaleString('es-CL')}
                      </Text>
                      <Text className="text-sm font-regular" style={{ color: Colors.primary[500], marginTop: 2 }}>
                        {transaction.description}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 18, color: Colors.gray[400] }}>≡</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {groupedData.categorized.map((category) => (
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
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
              }}
              onPress={() => toggleCategory(category.id)}
              activeOpacity={0.7}
            >
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
            </TouchableOpacity>

            {expandedCategories.has(category.id) && (
              <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
                {category.subcategories && category.subcategories.map((subcat) => (
                  <View key={subcat.id} style={{ marginBottom: 12 }}>
                    <TouchableOpacity
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: Colors.gray[100],
                      }}
                      onPress={() => toggleSubcategory(subcat.id)}
                      activeOpacity={0.7}
                    >
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
                      <TouchableOpacity
                        style={{ padding: 4, marginRight: 8 }}
                        onPress={(e) => {
                          e.stopPropagation();
                          // TODO: Implementar eliminación de subcategoría
                        }}
                      >
                        <MinusCircle size={16} color={Colors.error[500]} />
                      </TouchableOpacity>
                      <Animated.View style={getRotateStyle(subcat.id, false)}>
                        <ChevronDown size={16} color={Colors.primary[500]} />
                      </Animated.View>
                    </TouchableOpacity>

                    {expandedSubcategories.has(subcat.id) && subcat.transactions.length > 0 && (
                      <View style={{ marginTop: 8, marginLeft: 12 }}>
                        {subcat.transactions.map((transaction) => (
                          <View
                            key={transaction.id}
                            style={{
                              backgroundColor: 'white',
                              padding: 12,
                              borderRadius: 8,
                              marginBottom: 8,
                              borderWidth: 1,
                              borderColor: Colors.gray[100],
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between'
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text className="text-sm font-medium" style={{ color: Colors.primary[600] }}>
                                {activeTab === 'income' ? '+' : '-'}${Math.round(transaction.amount).toLocaleString('es-CL')}
                              </Text>
                              <Text className="text-sm font-regular" style={{ color: Colors.primary[500], marginTop: 2 }}>
                                {transaction.description}
                              </Text>
                            </View>
                            <Text style={{ fontSize: 18, color: Colors.gray[400] }}>≡</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}

                {category.uncategorizedTransactions.length > 0 && (
                  <View style={{ marginTop: 8 }}>
                    {category.uncategorizedTransactions.map((transaction) => (
                      <View
                        key={transaction.id}
                        style={{
                          backgroundColor: 'white',
                          padding: 12,
                          borderRadius: 8,
                          marginBottom: 8,
                          borderWidth: 1,
                          borderColor: Colors.gray[100],
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text className="text-sm font-medium" style={{ color: Colors.primary[600] }}>
                            {activeTab === 'income' ? '+' : '-'}${Math.round(transaction.amount).toLocaleString('es-CL')}
                          </Text>
                          <Text className="text-sm font-regular" style={{ color: Colors.primary[500], marginTop: 2 }}>
                            {transaction.description}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 18, color: Colors.gray[400] }}>≡</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        </ScrollView>

        {/* Footer con botón fijo */}
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
    </Container>
  );
}
