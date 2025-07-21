import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import {
  Settings,
  PiggyBank,
  LineChart,
  Home,
  ShieldCheck,
  DollarSign,
  BarChart,
  ArrowDown,
  ArrowUp,
  TrendingUp,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { PortfolioHeader } from '@/components/investment/portfolio';
import { ListItem } from '@/components/ui/ListItem';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { 
  INVESTMENT_PORTFOLIO_DATA, 
  INVESTMENT_SAMPLE_DATA 
} from '@/constants/AppConstants';
import Colors from '@/constants/Colors';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';
import { Button } from '@/components/ui/Button';
import { useGoals } from '@/hooks/investment/useGoals';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useFormatValue } from '@/hooks/common/useFormatValue';
import { useTotalWalletValue } from '@/hooks/investment/useTotalWalletValue';

export default function InvestmentPortfolioScreen() {
  const router = useRouter();
  const { goals, loading: goalsLoading, error: goalsError, refetch } = useGoals();
  const { formatValue } = useFormatValue();
  const { totalWalletValue, loading: walletLoading, error: walletError } = useTotalWalletValue();

  const iconMap = {
    PiggyBank: <PiggyBank size={24} color={Colors.gray[500]} />,
    LineChart: <LineChart size={24} color={Colors.gray[500]} />,
    Home: <Home size={24} color={Colors.gray[500]} />,
    ShieldCheck: <ShieldCheck size={24} color={Colors.gray[500]} />,
    DollarSign: <DollarSign size={24} color={Colors.gray[500]} />,
    BarChart: <BarChart size={24} color={Colors.gray[500]} />,
  };

  const investmentData = INVESTMENT_PORTFOLIO_DATA.map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    value: item.amount,
    icon: {
      component: iconMap[item.icon as keyof typeof iconMap],
      backgroundColor: Colors.gray[50],
      color: Colors.secondary[500],
      text: item.title.charAt(0)
    },
    onPress: item.hasDetails ? () => router.push({
      pathname: '/investment/portfolio/portfolio-details',
      params: {
        title: item.title,
        subtitle: item.subtitle,
        amount: item.amount,
      },
    }) : undefined,
  }));

  const getFallbackPatrimonyValue = () => {
    if (walletLoading || goalsLoading) {
      return '';
    }
    
    if (walletError) {
      return '$0';
    }
  
    if (totalWalletValue && totalWalletValue > 0) {
      return `${Math.floor(totalWalletValue).toLocaleString('es-CL')}`;
    }
    
    const allGoals = [...goals.shortTerm, ...goals.mediumTerm, ...goals.longTerm];
    if (allGoals.length > 0) {
      const manualTotal = allGoals.reduce((sum, goal) => {
        return sum + (goal.currentAmount || 0);
      }, 0);
      
      if (manualTotal > 0) {
        return `${Math.floor(manualTotal).toLocaleString('es-CL')}`;
      }
    }
    
    return '$0';
  };

  const handleInvestPress = () => router.push('/investment/portfolio/movements/investment');
  const handleWithdrawPress = () => router.push('/investment/portfolio/movements/sales');

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
          <Text className="text-red-500 mb-4">Error al cargar metas</Text>
          <Button title="Reintentar" onPress={refetch} />
        </View>
      );
    }

    // Solo calcular allGoals y goalsData cuando no está cargando
    const allGoals = [...goals.shortTerm, ...goals.mediumTerm, ...goals.longTerm];
    
    if (allGoals.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-8">
          <View className="w-16 h-16 rounded-full bg-gray-100 justify-center items-center mb-4">
            <TrendingUp size={32} color={Colors.gray[400]} />
          </View>
          <Text className="text-center font-medium" style={{ color: Colors.gray[400] }}>
            Aún no tienes metas definidas.
          </Text>
        </View>
      );
    }

    const goalsData = allGoals.map(goal => ({
      id: goal.id,
      title: goal.name,
      subtitle: `Meta ${formatValue(goal.targetAmount.toString())}`,
      value: formatValue(goal.currentAmount.toString()),
      icon: {
        component: <PiggyBank size={24} color={Colors.secondary[500]} />,
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

  return (
    <Container variant="secondaryPage">
      <Header 
        title="Portafolio" 
        rightAction={
          <TouchableOpacity
            className="w-10 h-10 rounded-full justify-center items-center"
            onPress={() => router.push('/settings')}
          >
            <Settings size={24} color={Colors.gray[700]} />
          </TouchableOpacity>
        }
      />
      <ScrollView className="flex-1 px-5 pb-[120px] mt-16" showsVerticalScrollIndicator={false}>
        {/* ✅ MANTENER PATRIMONIO NETO + AGREGAR SALDO EN CAJA */}
        <PortfolioHeader
          patrimony={getFallbackPatrimonyValue()}
          isLoading={walletLoading}
        />
        {false && (
        <PortfolioActionsBar
          actions={[
            {
              title: 'Invertir',
              onPress: handleInvestPress,
              icon: <ArrowDown size={20} color="#fff" />,
              variant: 'primary'
            },
            {
              title: 'Retirar',
              onPress: handleWithdrawPress,
              icon: <ArrowUp size={20} color="#FF5603" />,
              variant: 'outline'
            }
          ]}
        />
        )}
        <View className="px-6 py-2">
          <Text className="text-lg font-medium text-gray-800">Metas</Text>
        </View>
        
        <View style={listItemStyles.cardContainer}>
          {renderGoalsSection()}
        </View>
      </ScrollView>
    </Container>
  );
}