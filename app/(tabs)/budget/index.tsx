import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import {
  Header,
  SearchBar,
  Container,
  Tabs,
  Dropdown,
} from '@/components/ui';
import BudgetChart from '@/components/budget/BudgetChart';
import ForYouCarousel from '@/components/common/ForYouCarousel';
import TransactionsList from '@/components/budget/TransactionsList';
import transactionsData from '@/transacciones_simplificadas.json';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const monthOptions = months.map(month => ({
  label: month,
  value: month
}));

const getMonthNumber = (monthName: string): number => {
  return months.indexOf(monthName) + 1;
};

const calculateTotalsByMonth = (selectedMonth: string) => {
  const data = transactionsData[0];
  const transactions = data.transactions.accounts[0].transactions;
  const monthNumber = getMonthNumber(selectedMonth);

  let totalIncome = 0;
  let totalExpenses = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  transactions.forEach((transaction: any) => {
    const transactionDate = new Date(transaction.date);
    const transactionMonth = transactionDate.getMonth() + 1;

    if (transactionMonth === monthNumber) {
      if (transaction.in > 0) {
        totalIncome += transaction.in;
        incomeCount++;
      }
      if (transaction.out > 0) {
        totalExpenses += transaction.out;
        expenseCount++;
      }
    }
  });

  return { totalIncome, totalExpenses, incomeCount, expenseCount };
};

export default function BudgetScreen() {
  const [selectedMonth, setSelectedMonth] = useState('Enero');
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const { totalIncome, totalExpenses, incomeCount, expenseCount } = 
    calculateTotalsByMonth(selectedMonth);

  const handlePreviousMonth = () => {
    const currentIndex = months.indexOf(selectedMonth);
    setSelectedMonth(currentIndex > 0 ? months[currentIndex - 1] : months[months.length - 1]);
  };

  const handleNextMonth = () => {
    const currentIndex = months.indexOf(selectedMonth);
    setSelectedMonth(currentIndex < months.length - 1 ? months[currentIndex + 1] : months[0]);
  };

  const tabs = [
    { 
      key: 'income', 
      label: 'Ingresos', 
      badge: incomeCount.toString() 
    },
    { 
      key: 'expenses', 
      label: 'Gastos', 
      badge: expenseCount.toString() 
    },
  ];

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header
        title="Presupuestos"
        rightAction={
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <Settings size={24} color="#525252" />
          </TouchableOpacity>
        }
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Container variant="content" className="py-4">
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={handlePreviousMonth} className="p-2">
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1 items-center">
              <Dropdown
                options={monthOptions}
                selectedValue={selectedMonth}
                onSelect={setSelectedMonth}
              />
            </View>
            <TouchableOpacity onPress={handleNextMonth} className="p-2">
              <ChevronRight size={24} color="#374151" />
            </TouchableOpacity>
          </View>
          <BudgetChart selectedMonth={selectedMonth} />
          <View className="flex-row flex-wrap justify-center mt-5 mb-2 px-2">
            {[
              { label: 'Vivienda', color: '#8e24aa' },
              { label: 'Transporte', color: '#3b82f6' },
              { label: 'Ocio', color: '#ec4899' },
              { label: 'Salud', color: '#06b6d4' },
              { label: 'Servicios', color: '#10b981' },
            ].map((item, idx) => (
              <View key={idx} className="flex-row items-center mx-2 mb-2">
                <View 
                  className="w-[10px] h-[10px] rounded-full mr-1.5"
                  style={{ backgroundColor: item.color }}
                />
                <Text className="text-sm font-medium text-gray-700 leading-4">
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </Container>
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(key) => setActiveTab(key as 'income' | 'expenses')}
          className="mt-4"
        />
        <View className="flex-row justify-between px-4 py-4 border-b border-gray-200">
          <Text className="text-base font-regular text-gray-700">
            Total en {activeTab === 'income' ? 'ingresos' : 'gastos'}
          </Text>
          <Text 
            className={`text-base font-semibold ${
              activeTab === 'income' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {activeTab === 'income' ? '+' : '-'}${(activeTab === 'income' ? totalIncome : totalExpenses).toLocaleString('es-CL')}
          </Text>
        </View>

        <Container variant="content" className="mt-4 mb-4">
          <SearchBar
            placeholder={`Buscar en ${activeTab === 'income' ? 'ingresos' : 'gastos'}`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </Container>

        <TransactionsList type={activeTab} selectedMonth={selectedMonth} />
        <ForYouCarousel />

        <View className="h-24" />
      </ScrollView>
    </Container>
  );
}
