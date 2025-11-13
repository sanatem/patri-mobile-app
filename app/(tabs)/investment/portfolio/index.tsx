import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Animated, Dimensions } from 'react-native';
import {
  PiggyBank,
  LineChart,
  Home,
  ShieldCheck,
  DollarSign,
  BarChart,
  ArrowDown,
  ArrowUp,
  TrendingUp,
  Wallet,
  Plus,
  Target,
  CreditCard,
  TrendingUpIcon,
  Building2,
  Umbrella,
  Banknote,
  GraduationCap,
  Plane,
  Car,
  Star,
  Sparkles,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { Select } from '@/components/ui/Select';
import { PortfolioHeader } from '@/components/investment/portfolio';
import { ListItem } from '@/components/ui/ListItem';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import Colors from '@/constants/Colors';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';
import { Button } from '@/components/ui/Button';
import { useGoals } from '@/hooks/investment/useGoals';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { useTotalWalletValue } from '@/hooks/investment/useTotalWalletValue';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/providers/AuthProvider';
import { getCash } from '@/services/investment/cash/get-cash';
import type { Goal } from '@/types/api';

export default function InvestmentPortfolioScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { goals, loading: goalsLoading, error: goalsError, refetch } = useGoals();
  const { formatValue } = useFormatValue();
  const { totalWalletValue, investmentWalletValue, savingsWalletValue, loading: walletLoading, error: walletError } = useTotalWalletValue();
  const { accessToken } = useAuth();
  const [cashData, setCashData] = useState<any>(null);
  const [selectedAccountType, setSelectedAccountType] = useState<string>('investment');
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const loadCashData = async () => {
      if (!accessToken) return;
      
      try {
        const data = await getCash(accessToken);
        setCashData(data);
      } catch (error) {
        console.error('Portfolio: Error cargando cash:', error);
      }
    };
    
    loadCashData();
  }, [accessToken]);
  
  const accountTypeOptions = [
    {
      label: t('portfolio.accountTypes.investment'),
      value: 'investment'
    },
    {
      label: t('portfolio.accountTypes.savings'),
      value: 'savings'
    }
  ];

  const iconMap = {
    PiggyBank: <PiggyBank size={24} color={Colors.gray[500]} />,
    LineChart: <LineChart size={24} color={Colors.gray[500]} />,
    Home: <Home size={24} color={Colors.gray[500]} />,
    ShieldCheck: <ShieldCheck size={24} color={Colors.gray[500]} />,
    DollarSign: <DollarSign size={24} color={Colors.gray[500]} />,
    BarChart: <BarChart size={24} color={Colors.gray[500]} />,
  };


  const getCurrentGoals = () => {
    if (!goals || goalsLoading) {
      return [];
    }
    
    if (selectedAccountType === 'investment') {
      return [...(goals.investment?.shortTerm || []), ...(goals.investment?.mediumTerm || []), ...(goals.investment?.longTerm || [])];
    } else {
      return [...(goals.savings?.shortTerm || []), ...(goals.savings?.mediumTerm || []), ...(goals.savings?.longTerm || [])];
    }
  };

  const getFallbackPatrimonyValue = () => {
    if (walletLoading || goalsLoading) {
      return '';
    }
    
    if (walletError) {
      return '0';
    }

    const accountValue = selectedAccountType === 'investment' ? investmentWalletValue : savingsWalletValue;
    
    if (accountValue && accountValue > 0) {
      return `${Math.round(accountValue).toLocaleString('es-CL')}`;
    }
    
    const currentGoals = getCurrentGoals();
    if (currentGoals.length > 0) {
      const manualTotal = currentGoals.reduce((sum, goal) => {
        return sum + (goal.currentAmount || 0);
      }, 0);
      
      if (manualTotal > 0) {
        return `${Math.round(manualTotal).toLocaleString('es-CL')}`;
      }
    }
    
    return '0';
  };

  const getCurrentCashAmount = () => {
    if (!cashData?.cash) return 0;
    
    if (selectedAccountType === 'investment') {
      const userCash = cashData.cash.investment?.user_cash;
      return userCash ? (typeof userCash === 'string' ? parseFloat(userCash) : userCash) : 0;
    } else {
      const userCash = cashData.cash.savings?.user_cash;
      return userCash ? (typeof userCash === 'string' ? parseFloat(userCash) : userCash) : 0;
    }
  };

  const handleInvestPress = () => router.push('/(tabs)/investment/portfolio/movements/investment')
  const handleWithdrawPress = () => router.push('/(tabs)/investment/portfolio/movements/sales')

  const getGoalIcon = (kind: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      debt_payment: <CreditCard size={24} color={Colors.secondary[500]} />,
      investment_fund: <TrendingUp size={24} color={Colors.secondary[500]} />,
      real_estate: <Building2 size={24} color={Colors.secondary[500]} />,
      retirement: <Umbrella size={24} color={Colors.secondary[500]} />,
      savings_fund: <PiggyBank size={24} color={Colors.secondary[500]} />,
      study: <GraduationCap size={24} color={Colors.secondary[500]} />,
      travel: <Plane size={24} color={Colors.secondary[500]} />,
      vehicle: <Car size={24} color={Colors.secondary[500]} />,
      personalized: <Sparkles size={24} color={Colors.secondary[500]} />,
    };

    return iconMap[kind] || <Banknote size={24} color={Colors.secondary[500]} />;
  };

  const openPlusMenu = () => {
    setModalVisible(true);
    setShowPlusMenu(true);
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePlusMenu = () => {
    Animated.parallel([
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowPlusMenu(false);
      setModalVisible(false);
    });
  };

  const handleCreateGoal = () => {
    closePlusMenu();
    setTimeout(() => {
      router.push('/(tabs)/investment/portfolio/goals/create-goals');
    }, 300);
  };

  const renderGoalsSection = () => {
    if (goalsLoading) {
      return (
        <View style={{ padding: 20 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              paddingVertical: 18,
              paddingHorizontal: 20,
              backgroundColor: '#fff',
              borderBottomWidth: 1,
              borderBottomColor: '#f3f4f6'
            }}>
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
              <View style={{ flex: 1, marginRight: 12 }}>
                <SkeletonBase
                  width={180}
                  height={40}
                  x={0}
                  y={0}
                  rows={2}
                  rowHeight={20}
                  rowWidth={180}
                  rowSpacing={4}
                  borderRadius={4}
                />
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

    if (goalsError) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <Text className="text-red-500 mb-4">
            {selectedAccountType === 'investment' ? t('portfolio.goalsError') : t('portfolio.savingInstrumentsError')}
          </Text>
          <Button title={t('common.retry')} onPress={refetch} />
        </View>
      );
    }

    const currentGoals = getCurrentGoals();
    
    if (currentGoals.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mb-4">
            {selectedAccountType === 'investment' ? (
              <TrendingUp size={32} color={Colors.gray[400]} />
            ) : (
              <Wallet size={32} color={Colors.gray[400]} />
            )}
          </View>
          <Text className="text-center font-medium" style={{ color: Colors.gray[400] }}>
            {selectedAccountType === 'investment' ? t('portfolio.noGoals') : t('portfolio.noSavingInstruments')}
          </Text>
        </View>
      );
    }

    const goalsData = currentGoals.map(goal => ({
      id: goal.id,
      title: goal.name,
      subtitle: `${t('portfolio.goalPrefix')} ${formatValue(goal.targetAmount.toString())} - ${goal.targetDate}`,
      value: formatValue(goal.currentAmount.toString()),
      icon: {
        component: getGoalIcon(goal.kind || 'personalized'),
        backgroundColor: Colors.secondary[50],
        color: Colors.secondary[500],
        text: goal.name.charAt(0)
      },
      onPress: () => router.push({
        pathname: '/investment/portfolio/portfolio-details',
        params: {
          goalId: goal.id,
          goalName: goal.name,
        },
      }),
    }));

    return (
      <ListItem
        data={goalsData}
        showLoadMore={false}
        showContainer={false}
      />
    );
  };

  const SCREEN_HEIGHT = Dimensions.get('window').height;

  return (
    <Container variant="secondaryPage">
      <Header
        title={t('portfolio.title')}
        rightAction={
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={openPlusMenu}
              className="mr-3"
            >
              <Plus size={24} color={Colors.primary[500]} />
            </TouchableOpacity>
          </View>
        }
      />
      <View className="flex-1">
        <ScrollView className="flex-1 px-5 mt-16" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <PortfolioHeader
            patrimony={getFallbackPatrimonyValue()}
            isLoading={walletLoading}
            cashAmount={getCurrentCashAmount()}
            selectedAccountType={selectedAccountType}
          />
          
          <View className="px-1 py-4">
            <Select
              options={accountTypeOptions}
              value={selectedAccountType}
              onSelect={setSelectedAccountType}
              label={t('portfolio.accountTypeLabel')}
              placeholder={t('portfolio.selectAccountType')}
            />
          </View>
          
          <View className="px-6 py-2">
            <Text className="text-lg font-medium text-gray-800">
              {selectedAccountType === 'investment' ? t('portfolio.goalsTitle') : t('portfolio.savingsTitle')}
            </Text>
          </View>
          
          <View style={listItemStyles.cardContainer}>
            {renderGoalsSection()}
          </View>
        </ScrollView>
        <View className="px-5 pb-1 pt-1 bg-white">
          <PortfolioActionsBar
            actions={[
              {
                title: t('portfolio.actions.withdraw'),
                onPress: handleWithdrawPress,
                icon: <ArrowUp size={20} color={Colors.secondary[500]} />,
                variant: 'outline'
              },
              {
                title: t('portfolio.actions.invest'),
                onPress: handleInvestPress,
                icon: <ArrowDown size={20} color={Colors.primary[500]} />,
                variant: 'primary'
              }
            ]}
          />
        </View>
      </View>

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
              backgroundColor: 'black',
              opacity: overlayAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.45],
              }),
            }}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={closePlusMenu}
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
            <TouchableOpacity
              style={{
                paddingVertical: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={handleCreateGoal}
              activeOpacity={0.7}
            >
              <View style={{ marginRight: 12 }}>
                <Plus size={20} color={Colors.gray[700]} />
              </View>
              <Text className="text-base font-regular" style={{ color: Colors.gray[700] }}>
                Crear meta
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </Container>
  );
}