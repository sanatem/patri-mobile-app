import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import {
  MONTHS,
  LABELS,
  BUDGET_CATEGORIES,
  TAB_CONFIG,
} from '@/constants/AppConstants';
import {
  Header,
  SearchBar,
  Container,
  Tabs,
  Select,
  InfiniteCarousel,
  KeyboardAwareContainer,
} from '@/components/ui';
import BudgetChart from '@/components/budget/BudgetChart';
import ForYouCarousel from '@/components/common/ForYouCarousel';
import TransactionsList from '@/components/budget/TransactionsList';
import { budgetService } from '@/services/budget/get-budget';
import Colors from '@/constants/Colors';
import { listItemStyles } from '@/styles/ui/ListItem.styles';

type MonthType = typeof MONTHS[number];

const monthOptions = MONTHS.map(month => ({
  label: month,
  value: month
}));


const calculateTotalsByMonth = (selectedMonth: MonthType) => {
  const budget = budgetService.getBudget();
  const monthlyIncome = budgetService.getMonthlyIncome();
  const monthlyExpenses = budgetService.getMonthlyExpenses();
  
  const incomeCount = budget.monthlyIncome.length;
  const expenseCount = budget.monthlyExpenses.length;

  return { 
    totalIncome: monthlyIncome, 
    totalExpenses: monthlyExpenses, 
    incomeCount, 
    expenseCount 
  };
};

export default function BudgetScreen() {
  const [selectedMonth, setSelectedMonth] = useState<MonthType>('Enero');
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const router = useRouter();

  const { totalIncome, totalExpenses, incomeCount, expenseCount } = 
    calculateTotalsByMonth(selectedMonth);

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month as MonthType);
  };

  const tabs = TAB_CONFIG.BUDGET.map(tab => ({
    ...tab,
    badge: (tab.key === 'income' ? incomeCount : expenseCount).toString()
  }));

  const categoryOptions = [
    { label: 'Todas', value: 'all' },
    ...BUDGET_CATEGORIES.map(category => ({
      label: category.label,
      value: category.label.toLowerCase()
    }))
  ];

  return (
    <Container variant="secondaryPage">
      <Header
        title={LABELS.BUDGET.TITLE}
        rightAction={
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Settings size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        }
      />
      <KeyboardAwareContainer>
      <Container variant="content" className="mt-4 mb-4">
            <InfiniteCarousel
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
            />
          </Container>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Container variant="content" className="py-4">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-1 items-center text-center">
                <Select
                  options={monthOptions}
                  value={selectedMonth}
                  onSelect={handleMonthSelect}
                />
              </View>
            </View>
            <BudgetChart selectedMonth={selectedMonth} />
          </Container>
          <Container variant="content" className="mt-4 mb-4">
            <SearchBar
                placeholder={activeTab === 'income' ? LABELS.BUDGET.SEARCH_INCOME_PLACEHOLDER : LABELS.BUDGET.SEARCH_EXPENSES_PLACEHOLDER}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
          </Container>
          <Container variant="content" className="mb-4">
            <View style={listItemStyles.cardContainer}>
              <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={(key) => setActiveTab(key as 'income' | 'expenses')}
              />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray[200] }}>
                <Text style={{ color: Colors.gray[700], fontSize: 16, fontFamily: 'Poppins-Regular' }}>
                  {activeTab === 'income' ? LABELS.BUDGET.TOTAL_INCOME : LABELS.BUDGET.TOTAL_EXPENSES}
                </Text>
                <Text style={{ color: Colors.gray[700], fontSize: 18, fontFamily: 'Poppins-medium' }}>
                  {activeTab === 'income' ? '+' : '-'}${(activeTab === 'income' ? totalIncome : totalExpenses).toLocaleString('es-CL')}
                </Text>
              </View>
              <TransactionsList type={activeTab} selectedMonth={selectedMonth} showContainer={false} />
            </View>
          </Container>
          <Container variant="content">
          <ForYouCarousel />
          </Container>
          <View className="h-24" />
        </ScrollView>
      </KeyboardAwareContainer>
    </Container>
  );
}
