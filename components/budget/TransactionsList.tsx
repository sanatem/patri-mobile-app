import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, Pressable, Animated } from 'react-native';
import { ListItem } from '@/components/ui/ListItem';
import { Select, Button } from '@/components/ui';
import { budgetService } from '@/services/budget/get-budget';
import { FloidTransaction } from '@/services/budget/get-floid-transactions';
import Colors from '@/constants/Colors';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { useTranslation } from 'react-i18next';
import { CategorizationStatus } from './CategorizationStatus';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/BudgetCategories';
import { patchFloidTransaction } from '@/services/budget/patch-floid-transaction';
import { useAuth } from '@/providers/AuthProvider';

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

// Helper function to get category emoji
const getCategoryEmoji = (
  category: string | undefined,
  subcategory: string | undefined,
  transactionType: 'income' | 'outcome'
) => {
  if (!category) return '+'; // Default symbol for uncategorized transactions

  const categories = transactionType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const categoryData = categories.find(cat => cat.id === category);

  // If there's a subcategory, try to get its emoji
  if (subcategory && categoryData?.subcategories) {
    const subcategoryData = categoryData.subcategories.find(sub => sub.id === subcategory);
    if (subcategoryData?.emoji) {
      return subcategoryData.emoji;
    }
  }

  // Otherwise return the category emoji
  return categoryData?.emoji || '+';
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
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');

  const handleIconPress = (transaction: FloidTransaction) => {
    setSelectedTransaction(transaction);
    setCategory(transaction.category || '');
    setSubcategory(transaction.subcategory || '');
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!selectedTransaction || !accessToken) return;

    try {
      await patchFloidTransaction({
        transactionId: selectedTransaction.transaction_id,
        transaction: {
          category: category || undefined,
          subcategory: subcategory || undefined,
        }
      }, accessToken);

      setShowCategoryModal(false);
      // Refresh the transactions list after updating
      // This will be handled by the parent component's refetch
    } catch (error) {
      console.error('Error updating transaction category:', error);
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setSubcategory(''); // Reset subcategory when category changes
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
        const categorizationStatus = transaction.categorization_status || 'uncategorized';
        const categoryEmoji = getCategoryEmoji(
          transaction.category,
          transaction.subcategory,
          transaction.transaction_type
        );
        const isUncategorized = !transaction.category;

        return {
          id: transaction.id.toString(),
          title: transaction.description.charAt(0).toUpperCase() + transaction.description.slice(1).toLowerCase(),
          subtitle: `${transaction.bank} - ${transaction.account_number}`,
          value: `${isIncome ? '+' : '-'}$${Math.round(transaction.amount).toLocaleString('es-CL')}`,
          icon: {
            backgroundColor: 'white',
            text: categoryEmoji,
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
              status={categorizationStatus}
            />
          ),
          rawData: transaction
        };
      });
      
    } else {
      return [];
    }
  }, [floidTransactions, type, searchQuery, hasRealData]);

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

  const categories = selectedTransaction
    ? (selectedTransaction.transaction_type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES)
    : [];
  const currentLang = t('common.language_code', 'es');

  const categoryOptions = [
    { label: t('budget.no_category', 'Sin categoría'), value: '' },
    ...categories.map(cat => ({
      label: `${cat.emoji} ${cat.name[currentLang as keyof typeof cat.name] || cat.name.es}`,
      value: cat.id
    }))
  ];

  const selectedCategoryData = categories.find(cat => cat.id === category);
  const subcategoryOptions = selectedCategoryData?.subcategories
    ? [
        { label: t('budget.no_subcategory', 'Sin subcategoría'), value: '' },
        ...selectedCategoryData.subcategories.map(subcat => ({
          label: `${subcat.emoji} ${subcat.name[currentLang as keyof typeof subcat.name] || subcat.name.es}`,
          value: subcat.id
        }))
      ]
    : [];

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

              <Select
                label={t('budget.category', 'Categoría')}
                options={categoryOptions}
                value={category}
                onSelect={handleCategoryChange}
                placeholder={t('budget.no_category', 'Sin categoría')}
              />

              {category && subcategoryOptions.length > 0 && (
                <Select
                  label={t('budget.subcategory', 'Subcategoría')}
                  options={subcategoryOptions}
                  value={subcategory}
                  onSelect={setSubcategory}
                  placeholder={t('budget.no_subcategory', 'Sin subcategoría')}
                />
              )}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    title={t('common.cancel', 'Cancelar')}
                    variant="outline"
                    fullWidth
                    onPress={() => setShowCategoryModal(false)}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Button
                    title={t('common.save', 'Guardar')}
                    variant="primary"
                    fullWidth
                    onPress={handleSaveCategory}
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