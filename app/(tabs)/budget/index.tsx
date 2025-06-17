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
} from '@/components/ui';
import BudgetChart from '@/components/budget/BudgetChart';
import ForYouCarousel from '@/components/common/ForYouCarousel';
import TransactionsList from '@/components/budget/TransactionsList';
import { budgetService } from '@/services/budget/get-budget';
import { LinearGradient } from 'expo-linear-gradient';

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
            <Settings size={24} color="white" />
          </TouchableOpacity>
        }
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#FF6503', '#E55A02', '#CC5200']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ marginTop: -10, marginBottom: 10, paddingHorizontal: 8, paddingVertical: 18, borderBottomLeftRadius: 25, borderBottomRightRadius: 25 }}
        >
          <View style={{ width: '100%' }}>
            <SegmentedControl
              options={categoryOptions}
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
            />
          </View>
        </LinearGradient>
        <Container variant="content" className="py-4">
          <View className="flex-row justify-between items-center mb-6">
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
        <Container variant="content" className="py-4">
        <SearchBar
            placeholder={activeTab === 'income' ? LABELS.BUDGET.SEARCH_INCOME_PLACEHOLDER : LABELS.BUDGET.SEARCH_EXPENSES_PLACEHOLDER}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as 'income' | 'expenses')}
          className="mt-4"
        />
        </Container>
        <View className="flex-row justify-between px-4 py-4 border-b border-gray-200 mx-6">
          <Text className="text-base font-regular text-gray-500">
            {activeTab === 'income' ? LABELS.BUDGET.TOTAL_INCOME : LABELS.BUDGET.TOTAL_EXPENSES}
          </Text>
          <Text 
            className={`text-base font-semibold ${
              activeTab === 'income' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {activeTab === 'income' ? '+' : '-'}${(activeTab === 'income' ? totalIncome : totalExpenses).toLocaleString('es-CL')}
          </Text>
        </View>
        <TransactionsList type={activeTab} selectedMonth={selectedMonth} />
        <Container variant="content">
        <ForYouCarousel />
        </Container>
        <View className="h-24" />
      </ScrollView>
    </Container>
  );
}
