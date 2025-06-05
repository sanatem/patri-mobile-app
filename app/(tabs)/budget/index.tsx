import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList } from 'react-native';
import { ChevronLeft, ChevronRight, Search, X, Settings } from 'lucide-react-native';
import BudgetChart from '@/components/budget/BudgetChart';
import TransactionsList from '@/components/budget/TransactionsList';
import transactionsData from '@/transacciones_simplificadas.json';
import { useRouter } from 'expo-router';

const months = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

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
  const [isMonthModalVisible, setIsMonthModalVisible] = useState(false);
  const router = useRouter();

  const { totalIncome, totalExpenses, incomeCount, expenseCount } = calculateTotalsByMonth(selectedMonth);

  const handlePreviousMonth = () => {
    const currentIndex = months.indexOf(selectedMonth);
    setSelectedMonth(currentIndex > 0 ? months[currentIndex - 1] : months[months.length - 1]);
  };

  const handleNextMonth = () => {
    const currentIndex = months.indexOf(selectedMonth);
    setSelectedMonth(currentIndex < months.length - 1 ? months[currentIndex + 1] : months[0]);
  };

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month);
    setIsMonthModalVisible(false);
  };

  const renderMonthItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      className={`px-4 py-4 rounded-lg my-0.5 ${selectedMonth === item ? 'bg-primary-500' : ''}`}
      onPress={() => handleMonthSelect(item)}
    >
      <Text className={`text-base font-medium text-center ${selectedMonth === item ? 'text-white' : 'text-gray-800'}`}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pb-4 bg-white border-b border-gray-100 flex-row justify-between items-center" style={{ marginTop: 15 }}>
        <Text className="text-lg font-semibold text-gray-800">Presupuestos</Text>
        <TouchableOpacity className="p-2" onPress={() => router.push('/settings')}>
          <Settings size={24} color="#525252" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4">
          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity onPress={handlePreviousMonth}>
              <ChevronLeft size={24} color="#374151" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full" onPress={() => setIsMonthModalVisible(true)}>
              <Text className="text-base font-medium text-gray-800 mr-1">{selectedMonth}</Text>
              <ChevronRight size={16} color="#9CA3AF" style={{ transform: [{ rotate: '90deg' }] }} />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleNextMonth}>
              <ChevronRight size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <BudgetChart selectedMonth={selectedMonth} />

          <View className="flex-row flex-wrap justify-center mt-5 mb-2 px-2 " >
            {[
              { label: 'Vivienda', color: 'bg-secondary-500' },
              { label: 'Transporte', color: 'bg-blue-500' },
              { label: 'Ocio', color: 'bg-pink-500' },
              { label: 'Salud', color: 'bg-cyan-500' },
              { label: 'Servicios', color: 'bg-green-500' },
            ].map((item, idx) => (
              <View key={idx} className="flex-row items-center mx-2 mb-2">
                <View className={`w-[10px] h-[10px] rounded-full mr-1.5 ${item.color}`} />
                <Text className="text-sm font-medium text-gray-700 leading-4 ">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="flex-row border-b border-gray-200 mt-4">
          {[
            { key: 'income', label: 'Ingresos', count: incomeCount },
            { key: 'expenses', label: 'Gastos', count: expenseCount },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              className={`flex-1 py-4 items-center ${activeTab === tab.key ? 'border-b-2 border-primary-500' : ''}`}
              onPress={() => setActiveTab(tab.key as 'income' | 'expenses')}
            >
              <Text className={`text-base font-medium ${activeTab === tab.key ? 'text-primary-500' : 'text-gray-500'}`}>
                {tab.label} <Text className="bg-gray-100 rounded-xl px-2 py-0.5 text-xs text-gray-600 min-w-[20px] text-center">{tab.count}</Text>
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row items-center bg-gray-50 rounded-lg px-3 mt-4 mx-4 mb-4">
          <Search size={20} color="#9CA3AF" className="mr-2" />
          <Text className="flex-1 h-12 text-base font-regular text-gray-400 py-3">Buscar en {activeTab === 'income' ? 'ingresos' : 'gastos'}</Text>
        </View>

        <TransactionsList type={activeTab} selectedMonth={selectedMonth} />

        <View className="h-24" />
      </ScrollView>

      <Modal
        visible={isMonthModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsMonthModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-5 rounded-2xl w-4/5 items-center">
            <View className="flex-row items-center justify-between w-full mb-4">
              <Text className="text-lg font-semibold text-gray-800">Seleccionar mes</Text>
              <TouchableOpacity onPress={() => setIsMonthModalVisible(false)} className="p-2">
                <X size={24} color="#525252" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={months}
              renderItem={renderMonthItem}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              className="w-full"
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}
