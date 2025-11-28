import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, Animated } from 'react-native';
import { ListItem } from '@/components/ui/ListItem';
import { Select, Button } from '@/components/ui';
import { budgetService } from '@/services/budget/transactions/get-budget';
import { FloidTransaction } from '@/services/budget/transactions/get-floid-transactions';
import Colors from '@/constants/Colors';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { useTranslation } from 'react-i18next';
import { CategorizationStatus } from '../CategorizationStatus';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';
import { patchFloidTransaction } from '@/services/budget/transactions/patch-floid-transaction';
import { useAuth } from '@/providers/AuthProvider';
import { getUserCategories } from '@/services/budget/categories-manager';
import type { UserCategory } from '@/services/budget/categories-manager';
import { getTranslatedNames } from '@/utils/categoryTranslations';

interface TransactionsListProps {
  type: 'income' | 'expenses';
  selectedMonth: string;
  showContainer?: boolean;
  floidTransactions?: FloidTransaction[];
  searchQuery?: string;
  loading?: boolean;
  hasRealData?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  onCollapse?: () => void;
  onItemPress?: (item: any) => void;
  onItemDelete?: (item: any) => void;
}

// Helper function to get category icon
const getCategoryIcon = (transaction: FloidTransaction) => {
  // Si no tiene categoría, mostrar + para indicar que se puede agregar
  if (!transaction.category || !transaction.category.id) {
    return '+';
  }

  // Si tiene emoji_code personalizado, usarlo
  if (transaction.category.emoji_code) {
    return transaction.category.emoji_code;
  }

  // Fallback: emoji genérico según el tipo
  return transaction.category.kind === 'income' ? '💰' : '💳';
};

export default function TransactionsList({
  type,
  selectedMonth,
  showContainer = true,
  floidTransactions,
  searchQuery = '',
  loading = false,
  hasRealData = false,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  onCollapse,
  onItemPress,
  onItemDelete
}: TransactionsListProps) {

  const { t } = useTranslation();
  const { accessToken } = useAuth();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<FloidTransaction | null>(null);
  const [selectedParentCategoryId, setSelectedParentCategoryId] = useState('');
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState('');
  const [apiCategories, setApiCategories] = useState<UserCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Cargar categorías del API (user categories)
  useEffect(() => {
    const fetchCategories = async () => {
      if (!accessToken || !selectedTransaction) return;

      try {
        setCategoriesLoading(true);
        const kind = selectedTransaction.transaction_type === 'income' ? 'income' : 'expense';
        const response = await getUserCategories({ kind, per_page: 100 }, accessToken);

        if (response?.success && response.data) {
          // Filtrar solo categorías padre (parent_id === null)
          const parentCategories = response.data.filter(cat => cat.parent_id === null);
          setApiCategories(parentCategories);
        }
      } catch (error) {
        console.error('Error fetching user categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    if (showCategoryModal && selectedTransaction) {
      fetchCategories();
    }
  }, [accessToken, selectedTransaction, showCategoryModal]);

  const handleIconPress = (transaction: FloidTransaction) => {
    setSelectedTransaction(transaction);

    if (transaction.category?.id) {
      setSelectedParentCategoryId(transaction.category.id.toString());
      setSelectedSubcategoryId('');
    } else {
      setSelectedParentCategoryId('');
      setSelectedSubcategoryId('');
    }

    setShowCategoryModal(true);
  };

  useEffect(() => {
    if (!selectedTransaction?.category?.id || apiCategories.length === 0) return;

    const categoryId = selectedTransaction.category.id.toString();

    const parentCategory = apiCategories.find(cat => cat.id.toString() === categoryId);
    if (parentCategory) {
      setSelectedParentCategoryId(categoryId);
      setSelectedSubcategoryId('');
    } else {
      for (const cat of apiCategories) {
        const subcategory = cat.children?.find(sub => sub.id.toString() === categoryId);
        if (subcategory) {
          setSelectedParentCategoryId(cat.id.toString());
          setSelectedSubcategoryId(categoryId);
          break;
        }
      }
    }
  }, [apiCategories, selectedTransaction]);

  const handleSaveCategory = async () => {
    if (!selectedTransaction || !accessToken) return;

    try {
      setIsSaving(true);

      const transactionData: any = {};

      if (selectedSubcategoryId) {
        transactionData.user_category_id = parseInt(selectedSubcategoryId);
        transactionData.auto_category = false;
      } else if (selectedParentCategoryId) {
        transactionData.user_category_id = parseInt(selectedParentCategoryId);
        transactionData.auto_category = false;
      } else {
        transactionData.user_category_id = null;
        transactionData.auto_category = false;
      }

      await patchFloidTransaction({
        transactionId: selectedTransaction.id.toString(),
        transaction: transactionData
      }, accessToken);

      setShowCategoryModal(false);
      if (onCollapse) {
        onCollapse();
      }
    } catch (error) {
      console.error('Error updating transaction category:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedParentCategoryId(value);
    setSelectedSubcategoryId('');
  };

  const handleSubcategoryChange = (value: string) => {
    setSelectedSubcategoryId(value);
  };

  const transactionsData = useMemo(() => {
    const hasFloidData = hasRealData &&
                        floidTransactions &&
                        Array.isArray(floidTransactions) &&
                        floidTransactions.length > 0;

    if (hasFloidData) {
      const filteredBySearch = searchQuery
        ? floidTransactions!.filter(transaction =>
            transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.bank.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.account_number.includes(searchQuery)
          )
        : floidTransactions;

      return filteredBySearch.map(transaction => {
        const isIncome = transaction.transaction_type === 'income';
        const isUncategorized = !transaction.category || !transaction.category.id;
        const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount;
        const categoryIcon = getCategoryIcon(transaction);

        return {
          id: transaction.id.toString(),
          title: transaction.description.charAt(0).toUpperCase() + transaction.description.slice(1).toLowerCase(),
          subtitle: `${transaction.bank} - ${transaction.account_number}`,
          value: `${isIncome ? '+' : '-'}$${Math.round(amount).toLocaleString('es-CL')}`,
          icon: {
            backgroundColor: 'white',
            text: categoryIcon,
            borderColor: Colors.gray[100],
            borderWidth: 1,
            color: isUncategorized ? Colors.gray[100] : undefined,
            onPress: () => handleIconPress(transaction),
          },
          badge: {
            text: new Date(transaction.date).toLocaleDateString('es-CL'),
            variant: 'neutral' as const
          },
          additionalContent: (
            <CategorizationStatus
              categorized={transaction.categorized}
              autoCategory={transaction.auto_category}
            />
          ),
          rawData: transaction
        };
      });

    } else {
      return [];
    }
  }, [floidTransactions, type, searchQuery, hasRealData]);

  const categoryOptions = useMemo(() => {
    if (apiCategories.length === 0) return [];
    const isIncome = type === 'income';
    const currentLang = t('common.language_code', 'es');

    return [
      { label: t('budget.no_category', 'Sin categoría'), value: '' },
      ...apiCategories
        .filter(category => category && category.id !== undefined && category.id !== null)
        .map(category => {
          const translatedNames = getTranslatedNames(category.display_name, isIncome);
          return {
            label: translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || category.display_name || '',
            value: category.id.toString()
          };
        })
    ];
  }, [apiCategories, t, type]);

  const subcategoryOptions = useMemo(() => {
    if (!selectedParentCategoryId || apiCategories.length === 0) return [];

    const selectedCategory = apiCategories.find(cat => cat && cat.id && cat.id.toString() === selectedParentCategoryId);
    if (!selectedCategory || !selectedCategory.children || selectedCategory.children.length === 0) return [];
    const isIncome = type === 'income';
    const currentLang = t('common.language_code', 'es');

    return [
      { label: t('budget.no_subcategory', 'Sin subcategoría'), value: '' },
      ...selectedCategory.children
        .filter(subcat => subcat && subcat.id !== undefined && subcat.id !== null)
        .map(subcat => {
          const translatedNames = getTranslatedNames(subcat.display_name, isIncome);
          return {
            label: translatedNames[currentLang as 'en' | 'es' | 'es-CL'] || subcat.display_name || '',
            value: subcat.id.toString()
          };
        })
    ];
  }, [selectedParentCategoryId, apiCategories, t, type]);

  if (loading) {
    return (
      <View style={{ padding: 20 }}>
        {Array.from({ length: 5 }).map((_, index) => (
          <View key={index} style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: '#f3f4f6'
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <SkeletonBase
                width={40}
                height={40}
                x={0}
                y={0}
                rows={1}
                rowHeight={40}
                rowWidth={40}
                borderRadius={20}
                style={{ marginRight: 12 }}
              />
              <View style={{ flex: 1 }}>
                <SkeletonBase
                  width={200}
                  height={40}
                  x={0}
                  y={0}
                  rows={2}
                  rowHeight={16}
                  rowWidth={180}
                  rowSpacing={4}
                  borderRadius={4}
                />
              </View>
            </View>
            <SkeletonBase
              width={80}
              height={20}
              x={0}
              y={0}
              rows={1}
              rowHeight={20}
              rowWidth={80}
              borderRadius={4}
            />
          </View>
        ))}
      </View>
    );
  }

  if (transactionsData.length === 0) {
    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Text className="text-base font-medium" style={{ 
          color: Colors.gray[600],
          textAlign: 'center',
          marginBottom: 8,
        }}>
          {!hasRealData && !searchQuery
            ? t(`transactions_list.no_${type}_title_with_month`, { month: selectedMonth })
            : searchQuery 
              ? t('transactions_list.no_results_title')
              : t(`transactions_list.no_${type}_title`)
          }
        </Text>
        <Text className="text-sm font-regular" style={{ 
          color: Colors.gray[500],
          textAlign: 'center',
          lineHeight: 20,
        }}>
          {!hasRealData && !searchQuery
            ? t(`transactions_list.no_${type}_desc_with_month`)
            : searchQuery 
              ? t(`transactions_list.no_${type}_desc_with_search`, { query: searchQuery })
              : t(`transactions_list.no_${type}_desc`)
          }
        </Text>
      </View>
    );
  }

  return (
    <>
      <ListItem
        data={transactionsData}
        showLoadMore={hasMore}
        onLoadMore={onLoadMore}
        loadingMore={loadingMore}
        showContainer={showContainer}
        useExternalPagination={true}
        hasMore={hasMore}
        onCollapse={onCollapse}
        onItemPress={onItemPress}
        onItemDelete={onItemDelete}
      />

      {showCategoryModal && selectedTransaction && (
        <Modal
          visible={showCategoryModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowCategoryModal(false)}
        >
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 16,
              padding: 24,
              marginHorizontal: 20,
              width: '90%',
              maxWidth: 400,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <View style={{ alignItems: 'center', marginBottom: 24 }}>
                <Text className="text-md font-medium" style={{
                  marginBottom: 16,
                  textAlign: 'center',
                  color: Colors.primary[700],
                }}>
                  {t('budget.categorize_transaction', 'Categorizar transacción')}
                </Text>
              </View>

              {categoriesLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: Colors.gray[500] }}>
                    {t('common.loading', 'Cargando...')}
                  </Text>
                </View>
              ) : (
                <>
                  <Select
                    label={t('budget.category', 'Categoría')}
                    options={categoryOptions}
                    value={selectedParentCategoryId}
                    onSelect={handleCategoryChange}
                    placeholder={t('budget.no_category', 'Sin categoría')}
                    emptyMessage={t('budget.add_categories_first', 'Debes añadir categorías para poder asignar transacciones.')}
                  />

                  {selectedParentCategoryId && subcategoryOptions.length > 0 && (
                    <Select
                      label={t('budget.subcategory', 'Subcategoría')}
                      options={subcategoryOptions}
                      value={selectedSubcategoryId}
                      onSelect={handleSubcategoryChange}
                      placeholder={t('budget.no_subcategory', 'Sin subcategoría')}
                    />
                  )}
                </>
              )}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title={t('common.cancel', 'Cancelar')}
                    variant="outline"
                    fullWidth
                    onPress={() => setShowCategoryModal(false)}
                    disabled={isSaving}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Button
                    title={isSaving ? t('common.saving', 'Guardando...') : t('common.save', 'Guardar')}
                    variant="primary"
                    fullWidth
                    onPress={handleSaveCategory}
                    disabled={categoriesLoading || isSaving}
                    loading={isSaving}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}