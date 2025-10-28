import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { ListItem } from '@/components/ui/ListItem';
import { budgetService } from '@/services/budget/get-budget';
import { FloidTransaction } from '@/services/budget/get-floid-transactions';
import Colors from '@/constants/Colors';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { useTranslation } from 'react-i18next';
import { CategorizationStatus } from './CategorizationStatus';

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

        return {
          id: transaction.id.toString(),
          title: transaction.description.charAt(0).toUpperCase() + transaction.description.slice(1).toLowerCase(),
          subtitle: `${transaction.bank} - ${transaction.account_number}`,
          value: `${isIncome ? '+' : '-'}$${Math.round(transaction.amount).toLocaleString('es-CL')}`,
          icon: {
            backgroundColor: isIncome ? Colors.success[100] : Colors.error[100],
            text: isIncome ? '+' : '-',
            color: isIncome ? Colors.success[600] : Colors.error[600],
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

  return (
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
  );
}