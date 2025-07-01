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
  Dropdown,
  SegmentedControl,
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

const getMonthNumber = (monthName: MonthType): number => {
  return MONTHS.indexOf(monthName) + 1;
};

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

  const handlePreviousMonth = () => {
    const currentIndex = MONTHS.indexOf(selectedMonth);
    setSelectedMonth(currentIndex > 0 ? MONTHS[currentIndex - 1] : MONTHS[MONTHS.length - 1]);
  };

  const handleNextMonth = () => {
    const currentIndex = MONTHS.indexOf(selectedMonth);
    setSelectedMonth(currentIndex < MONTHS.length - 1 ? MONTHS[currentIndex + 1] : MONTHS[0]);
  };

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
        <View style={{ flex: 1 }}>
          <View style={{ position: 'absolute', top: 20, left: 0, right: 0, zIndex: 10, paddingHorizontal: 16 }}>
            <SegmentedControl
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
            />
          </View>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} style={{ marginTop: 90 }}>
            <Container variant="content" className="py-4">
              <View className="flex-row justify-between items-center mb-2">
                <TouchableOpacity onPress={handlePreviousMonth} className="p-2">
                  <ChevronLeft size={24} color="#374151" />
                </TouchableOpacity>
                <View className="flex-1 items-center">
                  <Dropdown
                    options={monthOptions}
                    selectedValue={selectedMonth}
                    onSelect={handleMonthSelect}
                  />
                </View>
                <TouchableOpacity onPress={handleNextMonth} className="p-2">
                  <ChevronRight size={24} color="#374151" />
                </TouchableOpacity>
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
        </View>
      </KeyboardAwareContainer>
    </Container>
  );
}
