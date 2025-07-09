import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight, Settings, Plus, RefreshCw } from 'lucide-react-native';
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

const SCREEN_HEIGHT = Dimensions.get('window').height;

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    if (showAddModal) {
      setModalVisible(true);
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (modalVisible) {
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setModalVisible(false);
      });
    }
  }, [showAddModal]);

  const closeModal = () => {
    setShowAddModal(false);
  };

  const { totalIncome, totalExpenses, incomeCount, expenseCount } = 
    calculateTotalsByMonth(selectedMonth);

  const handleMonthSelect = (month: string) => {
    setSelectedMonth(month as MonthType);
  };

  const handleIntegrarDatos = () => {
    router.push('/budget/floid-screen' as any);
  };

  const handleAddIngreso = () => {
    console.log('Agregar ingreso');
  };

  const handleAddGasto = () => {
    console.log('Agregar gasto');
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
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => setShowAddModal(true)}
              className="mr-3"
            >
              <Plus size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/settings')}>
              <Settings size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
        }
      />
      <KeyboardAwareContainer>
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
                <Text style={{ color: Colors.gray[700], fontSize: 18, fontFamily: 'Poppins-medium' }}>
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
      {modalVisible && (
        <View 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'flex-end',
            zIndex: 1000
          }}
        >
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.45)'],
              }),
            }}
          >
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={closeModal}
              activeOpacity={1}
            />
          </Animated.View>
          <Animated.View 
            style={{
              backgroundColor: '#fff',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 32,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [SCREEN_HEIGHT, 0],
                  }),
                },
              ],
            }}
          >
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <View style={{ width: 40, height: 4, backgroundColor: '#D1D5DB', borderRadius: 2 }} />
            </View>
            {[
              { label: 'Integrar datos bancarios', value: 'integrar', icon: <RefreshCw size={20} color={Colors.gray[700]} /> },
              { label: 'Añadir ingreso', value: 'ingreso' },
              { label: 'Añadir gasto', value: 'gasto' }
            ].map((option, index) => (
              <TouchableOpacity
                key={option.value}
                style={{
                  paddingVertical: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderBottomWidth: index !== 2 ? 1 : 0,
                  borderColor: '#F3F4F6',
                }}
                onPress={() => {
                  closeModal();
                  switch(option.value) {
                    case 'integrar': handleIntegrarDatos(); break;
                    case 'ingreso': handleAddIngreso(); break;
                    case 'gasto': handleAddGasto(); break;
                  }
                }}
                activeOpacity={0.7}
              >
                {option.icon && (
                  <View style={{ marginRight: 12 }}>{option.icon}</View>
                )}
                <Text className="text-base font-regular" style={{ color: Colors.gray[700] }}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      )}
    </Container>
  );
}
