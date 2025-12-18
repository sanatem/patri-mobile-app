import React from 'react';
import { View } from 'react-native';
import { Container } from '@/components/ui';
import { TransactionsList } from '@/components/budget';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import { SearchSection } from './SearchSection';
import { BudgetTab } from './BudgetTab';
import { TransactionsSkeleton } from '../Skeletons/TransactionsSkeleton';

interface TransactionsSectionProps {
  // Search
  searchQuery: string;
  onSearchChange: (text: string) => void;
  searchPlaceholder: string;
  onCategoriesPress: () => void;
  categoriesLabel: string;

  // Tabs
  tabs: Array<{ key: string; label: string; badge: string }>;
  activeTab: 'income' | 'expenses';
  onTabChange: (key: string) => void;

  // Totals
  totalLabel: string;
  totalIncome: number;
  totalExpenses: number;

  // Transactions
  selectedMonth: string;
  incomeTransactions: any;
  expenseTransactions: any;
  incomeLoading: boolean;
  expenseLoading: boolean;
  hasRealData: boolean;
  onLoadMoreIncome: () => void;
  onLoadMoreExpenses: () => void;
  hasMoreIncome: boolean;
  hasMoreExpenses: boolean;
  onCollapseIncome: () => void;
  onCollapseExpenses: () => void;
  onItemPress: (item: any) => void;
  onItemDelete: (item: any) => void;
  shouldShowSkeletons: boolean;
  contentWidth: number;
}

export function TransactionsSection({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  onCategoriesPress,
  categoriesLabel,
  tabs,
  activeTab,
  onTabChange,
  totalLabel,
  totalIncome,
  totalExpenses,
  selectedMonth,
  incomeTransactions,
  expenseTransactions,
  incomeLoading,
  expenseLoading,
  hasRealData,
  onLoadMoreIncome,
  onLoadMoreExpenses,
  hasMoreIncome,
  hasMoreExpenses,
  onCollapseIncome,
  onCollapseExpenses,
  onItemPress,
  onItemDelete,
  shouldShowSkeletons,
  contentWidth
}: TransactionsSectionProps) {
  return (
    <>
      <Container variant="content" className="mt-0 mb-4">
        <SearchSection
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          onCategoriesPress={onCategoriesPress}
          categoriesLabel={categoriesLabel}
          isLoading={shouldShowSkeletons}
        />
      </Container>

      <Container variant="content" className="mb-4">
        {shouldShowSkeletons ? (
          <TransactionsSkeleton contentWidth={contentWidth} />
        ) : (
          <View style={listItemStyles.cardContainer}>
            <BudgetTab
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={onTabChange}
              totalLabel={totalLabel}
              totalAmount={activeTab === 'income' ? totalIncome : totalExpenses}
              amountPrefix={activeTab === 'income' ? '+' : '-'}
            />

            <TransactionsList
              type={activeTab}
              selectedMonth={selectedMonth}
              showContainer={false}
              floidTransactions={activeTab === 'income'
                ? incomeTransactions?.transactions
                : expenseTransactions?.transactions
              }
              searchQuery={searchQuery}
              loading={activeTab === 'income' ? incomeLoading : expenseLoading}
              hasRealData={hasRealData}
              onLoadMore={activeTab === 'income' ? onLoadMoreIncome : onLoadMoreExpenses}
              hasMore={activeTab === 'income' ? hasMoreIncome : hasMoreExpenses}
              loadingMore={activeTab === 'income' ? incomeLoading : expenseLoading}
              onCollapse={activeTab === 'income' ? onCollapseIncome : onCollapseExpenses}
              onItemPress={onItemPress}
              onItemDelete={onItemDelete}
            />
          </View>
        )}
      </Container>
    </>
  );
}
