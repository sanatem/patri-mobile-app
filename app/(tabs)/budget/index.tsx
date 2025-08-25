import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight, Settings, Plus, RefreshCw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import {
  BUDGET_CATEGORY_KEYS,
} from '@/constants/AppConstants';
import {
  Header,
  SearchBar,
  Container,
  Tabs,
  Select,
  KeyboardAwareContainer,
  LockedTabOverlay,
  SyncModal,
} from '@/components/ui';
import { SkeletonBase } from '@/components/ui/SkeletonBase';

import { BudgetChart, TransactionsList } from '@/components/budget';
import ForYouCarousel from '@/components/common/ForYouCarousel';
import { budgetService } from '@/services/budget/get-budget';
import { useFloidAccounts } from '@/hooks/budget/useFloidAccounts';
import { useFloidTransactions } from '@/hooks/budget/useFloidTransactions';
import { calculateTransactionTotals } from '@/services/budget/get-floid-transactions';
import Colors from '@/constants/Colors';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useFloidSync } from '@/providers/FloidSyncProvider';
import { useTranslation } from 'react-i18next';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function BudgetScreen() {
  const { shouldBlockTab, loading: subscriptionLoading } = useSubscriptionStatus();
  const { isSyncing, stopSync } = useFloidSync();
  const router = useRouter();
  const { t } = useTranslation();

  const { width: screenWidth } = Dimensions.get('window');
  const chartSize = Math.min(screenWidth - 80, 280);
  const contentWidth = Math.min(screenWidth - 40, 320);
  const months = useMemo(() => {
    const translated = t('months', { returnObjects: true }) as string[] | undefined;
    return Array.isArray(translated) && translated.length === 12
      ? translated
      : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  }, [t]);

  const monthOptions = useMemo(() => months.map(month => ({
    label: month,
    value: month
  })), [months]);

  const getCurrentMonth = (): string => {
    const currentDate = new Date();
    const currentMonthIndex = currentDate.getMonth();
    return months[currentMonthIndex] || 'Enero';
  };

  const getCurrentYear = (): number => {
    return new Date().getFullYear();
  };

  const yearOptions = useMemo(() => [
    { label: '2024', value: '2024' },
    { label: '2025', value: '2025' }
  ], []);

  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [selectedYear, setSelectedYear] = useState<string>(getCurrentYear().toString());
  const [activeTab, setActiveTab] = useState<'income' | 'expenses'>('income');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showBudgetSkeletons, setShowBudgetSkeletons] = useState(false);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { accounts, loading: accountsLoading, refetch: refetchAccounts } = useFloidAccounts();

  const firstAccountId = useMemo(() => {
    if (accounts && accounts.floid_accounts.length > 0) {
      return accounts.floid_accounts[0].id.toString();
    }
    return '';
  }, [accounts]);

  const { transactions, loading: transactionsLoading, refetch: refetchTransactions } = useFloidTransactions({
    floidId: firstAccountId,
    per_page: 200,
    enabled: !!firstAccountId
  });

  const filterTransactionsByMonth = (transactions: any[], selectedMonth: string, selectedYear: number) => {
    if (!Array.isArray(transactions) || transactions.length === 0) return [];

    const monthsValid = Array.isArray(months) && months.length === 12;
    if (!monthsValid) {
      console.warn('[Budget] Months array is invalid. Expected 12 entries.');
    }

    if (typeof selectedMonth !== 'string') {
      console.warn('[Budget] Selected month is not a string:', selectedMonth);
      return [];
    }

    let monthIndex = months.indexOf(selectedMonth);
    if (monthIndex === -1) {
      console.warn(`[Budget] Unexpected month value "${selectedMonth}". Falling back to current month index.`);
      monthIndex = new Date().getMonth();
    }
    return transactions.filter((transaction) => {
      try {
        const rawDate = transaction?.date;
        if (!rawDate) {
          console.warn('[Budget] Transaction missing date field:', transaction);
          return false;
        }
        const transactionDate = new Date(rawDate);
        const time = transactionDate.getTime();
        if (Number.isNaN(time)) {
          console.warn('[Budget] Failed to parse transaction date:', rawDate, transaction);
          return false;
        }
        // Filtrar por mes Y año seleccionado
        return transactionDate.getMonth() === monthIndex && transactionDate.getFullYear() === selectedYear;
      } catch (err) {
        console.error('[Budget] Error while filtering transaction by month:', err, transaction);
        return false;
      }
    });
  };
  const calculateTotalsFromFloid = (transactions: any[] | undefined, selectedMonth: string, selectedYear: number) => {
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        incomeCount: 0,
        expenseCount: 0,
        filteredTransactions: [],
        hasRealData: false
      };
    }
    const filteredTransactions = filterTransactionsByMonth(transactions, selectedMonth, selectedYear);
    if (filteredTransactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        incomeCount: 0,
        expenseCount: 0,
        filteredTransactions: [],
        hasRealData: true
      };
    }
    const totals = calculateTransactionTotals(filteredTransactions);
    return {
      totalIncome: totals.totalIncome,
      totalExpenses: totals.totalOutcome,
      balance: totals.totalIncome - totals.totalOutcome,
      incomeCount: filteredTransactions.filter(t => t.transaction_type === 'income').length,
      expenseCount: filteredTransactions.filter(t => t.transaction_type === 'outcome').length,
      filteredTransactions,
      hasRealData: true
    };
  };

  const totalsData = useMemo(() => {
    return calculateTotalsFromFloid(transactions?.transactions, selectedMonth, parseInt(selectedYear));
  }, [transactions, selectedMonth, selectedYear]);

  const {
    totalIncome,
    totalExpenses,
    balance,
    incomeCount,
    expenseCount,
    filteredTransactions,
    hasRealData
  } = totalsData;

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

  if (subscriptionLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color={Colors.secondary[500]} />
      </View>
    );
  }

  if (shouldBlockTab("Presupuesto")) {
    return <LockedTabOverlay tabName={t('tabs.budget')} />;
  }

  const closeModal = () => setShowAddModal(false);
  const handleMonthSelect = (month: string) => setSelectedMonth(month);
  const handleIntegrarDatos = () => router.push('/budget/floid-screen' as any);

  const tabs = [
    { key: 'income', label: t('budget.income'), badge: incomeCount.toString() },
    { key: 'expenses', label: t('budget.expenses'), badge: expenseCount.toString() }
  ];

  const categoryOptions = [
    { label: t('budget.all_categories'), value: 'all' },
    ...BUDGET_CATEGORY_KEYS.map(category => ({
      label: t(`budget.categories.${category.key}.label`),
      value: category.key
    }))
  ];
  const hasDataForChart = hasRealData && (totalIncome > 0 || totalExpenses > 0);
  const budgetChartProps = {
    selectedMonth,
    totalIncome,
    totalExpenses,
    balance,
    remainingBudget: totalIncome,
    isLoading: accountsLoading || transactionsLoading,
    hasRealData: hasDataForChart
  };
  return (
    <Container variant="secondaryPage">
      <Header
        title={t('budget.title')}
          rightAction={
           <View className="flex-row items-center">
             <TouchableOpacity 
               onPress={() => setShowAddModal(true)}
               className="mr-3"
             >
               <Plus size={24} color={Colors.primary[500]} />
             </TouchableOpacity>
             <TouchableOpacity 
               onPress={() => router.push('/settings')}
               className="mr-3"
             >
               <Settings size={24} color={Colors.primary[500]} />
             </TouchableOpacity> 
           </View>
         }
        />
        <KeyboardAwareContainer>
         <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>   
           <Container variant="content" className="py-4">
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-1 mr-2">
                {accountsLoading ? (
                  <SkeletonBase
                    width={(chartSize / 2) - 8}
                    height={56}
                    x={0}
                    y={0}
                    rows={1}
                    rowHeight={56}
                    rowWidth={(chartSize / 2) - 8}
                    borderRadius={16}
                  />
                ) : (
                  <Select
                    options={monthOptions}
                    value={selectedMonth}
                    onSelect={handleMonthSelect}
                  />
                )}
              </View>
              <View className="flex-1 ml-2">
                {accountsLoading ? (
                  <SkeletonBase
                    width={(chartSize / 2) - 8}
                    height={56}
                    x={0}
                    y={0}
                    rows={1}
                    rowHeight={56}
                    rowWidth={(chartSize / 2) - 8}
                    borderRadius={16}
                  />
                ) : (
                  <Select
                    options={yearOptions}
                    value={selectedYear}
                    onSelect={setSelectedYear}
                  />
                )}
              </View>
            </View>
                           {(() => {
                const shouldShowSkeletons = (transactionsLoading || isSyncing || showBudgetSkeletons);
                return shouldShowSkeletons;
              })() ? (
                <View style={{ 
                  backgroundColor: 'white', 
                  borderRadius: 16, 
                  padding: 20,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                  alignItems: 'center'
                }}>
                  <SkeletonBase
                    width={chartSize}
                    height={chartSize}
                    x={0}
                    y={0}
                    rows={1}
                    rowHeight={chartSize}
                    rowWidth={chartSize}
                    borderRadius={chartSize / 2}
                    style={{ borderRadius: chartSize / 2 }}
                  />
                </View>
              ) : (
              <BudgetChart {...budgetChartProps} />
            )}
          </Container>
          <Container variant="content" className="mt-4 mb-4">
            {(transactionsLoading || isSyncing || showBudgetSkeletons) ? (
              <SkeletonBase
                width={380}
                height={56}
                x={0}
                y={0}
                rows={1}
                rowHeight={56}
                rowWidth={380}
                borderRadius={16}
              />
            ) : (
              <SearchBar
                placeholder={activeTab === 'income' ? t('labels.budget.search_income_placeholder') : t('labels.budget.search_expenses_placeholder')}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            )}
          </Container>
          <Container variant="content" className="mb-4">
            {(transactionsLoading || isSyncing || showBudgetSkeletons) ? (
              <View style={listItemStyles.cardContainer}>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingVertical: 20, 
                  paddingHorizontal: 20,
                  backgroundColor: 'white',
                  borderRadius: 16,
                  padding: 4,
                  marginHorizontal: 0,
                  marginBottom: 10
                }}>
                  <SkeletonBase
                    width={contentWidth * 0.4}
                    height={18}
                    x={0}
                    y={0}
                    rows={1}
                    rowHeight={18}
                    rowWidth={contentWidth * 0.4}
                    borderRadius={4}
                    style={{ marginRight: 20 }}
                  />
                  <SkeletonBase
                    width={contentWidth * 0.4}
                    height={18}
                    x={0}
                    y={0}
                    rows={1}
                    rowHeight={18}
                    rowWidth={contentWidth * 0.4}
                    borderRadius={4}
                  />
                </View>
                
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  paddingHorizontal: 20, 
                  paddingBottom: 20, 
                  paddingTop: 12, 
                  borderBottomWidth: 1, 
                  borderBottomColor: Colors.gray[200] 
                }}>
                  <SkeletonBase
                    width={contentWidth * 0.35}
                    height={18}
                    x={0}
                    y={0}
                    rows={1}
                    rowHeight={18}
                    rowWidth={contentWidth * 0.35}
                    borderRadius={4}
                  />
                  <SkeletonBase
                    width={contentWidth * 0.3}
                    height={18}
                    x={0}
                    y={0}
                    rows={1}
                    rowHeight={18}
                    rowWidth={contentWidth * 0.3}
                    borderRadius={4}
                  />
                </View>
                
                {Array.from({ length: 5 }).map((_, index) => (
                  <View key={index} style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    paddingVertical: 18,
                    paddingHorizontal: 20,
                    borderBottomWidth: index < 4 ? 1 : 0,
                    borderBottomColor: Colors.gray[200]
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <SkeletonBase
                        width={48}
                        height={48}
                        x={0}
                        y={0}
                        rows={1}
                        rowHeight={48}
                        rowWidth={48}
                        borderRadius={12}
                        style={{ marginRight: 18 }}
                      />
                      <View style={{ flex: 1 }}>
                        <SkeletonBase
                          width={contentWidth * 0.45}
                          height={16}
                          x={0}
                          y={0}
                          rows={1}
                          rowHeight={16}
                          rowWidth={contentWidth * 0.45}
                          borderRadius={4}
                          style={{ marginBottom: 4 }}
                        />
                        <SkeletonBase
                          width={contentWidth * 0.35}
                          height={13}
                          x={0}
                          y={0}
                          rows={1}
                          rowHeight={13}
                          rowWidth={contentWidth * 0.35}
                          borderRadius={4}
                        />
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', minWidth: 90 }}>
                      <SkeletonBase
                        width={contentWidth * 0.25}
                        height={16}
                        x={0}
                        y={0}
                        rows={1}
                        rowHeight={16}
                        rowWidth={contentWidth * 0.25}
                        borderRadius={4}
                        style={{ marginBottom: 4 }}
                      />
                      <SkeletonBase
                        width={contentWidth * 0.2}
                        height={14}
                        x={0}
                        y={0}
                        rows={1}
                        rowHeight={14}
                        rowWidth={contentWidth * 0.2}
                        borderRadius={4}
                      />
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={listItemStyles.cardContainer}>
                <Tabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onTabChange={(key) => setActiveTab(key as 'income' | 'expenses')}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 20, paddingTop: 12, borderBottomWidth: 1, borderBottomColor: Colors.gray[200] }}>
                  <Text style={{ color: Colors.gray[700], fontSize: 18, fontFamily: 'Poppins-medium' }}>
                    {activeTab === 'income' ? t('budget.total_income') : t('budget.total_expenses')}
                  </Text>
                  <Text style={{ color: Colors.gray[700], fontSize: 18, fontFamily: 'Poppins-medium' }}>
                    {activeTab === 'income' ? '+' : '-'}${Math.round(activeTab === 'income' ? totalIncome : totalExpenses).toLocaleString('es-CL')}
                  </Text>
                </View>
                
                <TransactionsList 
                  type={activeTab} 
                  selectedMonth={selectedMonth} 
                  showContainer={false}
                  floidTransactions={filteredTransactions.length > 0 ? filteredTransactions : undefined}
                  searchQuery={searchQuery}
                  loading={transactionsLoading}
                  hasRealData={hasRealData && filteredTransactions.length > 0}
                />
              </View>
            )}
          </Container>
          <Container variant="content">
          <ForYouCarousel totalExpenses={totalExpenses} />
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
              { label: t('budget.integrate_data'), value: 'integrar', icon: <RefreshCw size={20} color={Colors.gray[700]} /> },
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
      
             <SyncModal 
          visible={isSyncing} 
          onClose={() => {
            // Cerrar el modal manualmente
            stopSync();
          }}
          onSyncComplete={() => {
            setShowBudgetSkeletons(true);
            
            const skeletonTimer = setTimeout(async () => {
              setShowBudgetSkeletons(false);
              
              try {
                await Promise.all([
                  refetchAccounts(),
                  refetchTransactions()
                ]);
              } catch (error) {
                console.error('Error refreshing data after sync:', error);
              }
            }, 60000);
            
            return () => clearTimeout(skeletonTimer);
          }}
        />
    </Container>
  );
}