import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  LineChart,
  PiggyBank,
  Home,
  ShieldCheck,
  DollarSign,
  BarChart,
  Settings,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { PortfolioHeader } from '@/components/investment/portfolio/PortfolioHeader';
import { ListItem } from '@/components/ui/ListItem';
import { 
  INVESTMENT_PORTFOLIO_DATA, 
  INVESTMENT_ACTIONS_DATA, 
  INVESTMENT_SAMPLE_DATA 
} from '@/constants/AppConstants';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';

export default function InvestmentPortfolioScreen() {
  const router = useRouter();

  const iconMap = {
    PiggyBank: <PiggyBank size={24} color="#ff5630" />,
    LineChart: <LineChart size={24} color="#ff5630" />,
    Home: <Home size={24} color="#ff5630" />,
    ShieldCheck: <ShieldCheck size={24} color="#ff5630" />,
    DollarSign: <DollarSign size={24} color="#ff5630" />,
    BarChart: <BarChart size={24} color="#ff5630" />,
  };

  const investmentData = INVESTMENT_PORTFOLIO_DATA.map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    value: item.amount,
    icon: {
      component: iconMap[item.icon as keyof typeof iconMap],
      backgroundColor: '#ff5630',
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

  const actionsData = INVESTMENT_ACTIONS_DATA.map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    value: '',
    icon: {
      component: iconMap[item.icon as keyof typeof iconMap],
      backgroundColor: '#ff5630',
      text: item.title.charAt(0)
    },
    onPress: undefined,
  }));

  const handleInvestPress = () => router.push('/investment/portfolio/movements/investment');
  const handleCreatePress = () => router.push('/investment/portfolio/goals/create-goals');

  return (
    <Container variant="secondaryPage">
      <Header 
        title="Portafolio" 
        rightAction={
          <TouchableOpacity
            className="w-10 h-10 rounded-full justify-center items-center"
            onPress={() => router.push('/settings')}
          >
            <Settings size={24} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        }
      />
      <ScrollView className="flex-1 pb-32 mt-16" showsVerticalScrollIndicator={false}>
        <PortfolioHeader
          patrimony={INVESTMENT_SAMPLE_DATA.PATRIMONY_AMOUNT}
        />
        <View className="flex-row justify-between items-center mt-10 px-4" style={{ marginBottom: 10 }}>
          <Text className="text-xl font-bold text-gray-900">Inversiones</Text>
          <TouchableOpacity>
            <Text className="text-[#ff5630] font-semibold text-sm">Ver resumen <Text className="font-bold">•</Text></Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6 px-4">
          <ListItem
            data={investmentData}
            showLoadMore={false}
            className="px-0"
          />
        </View>
        
        <View className="flex-row justify-between items-center px-4" style={{ marginBottom: 10 }}>
          <Text className="text-xl font-bold text-gray-900">Acciones</Text>
          <TouchableOpacity>
            <Text className="text-[#ff5630] font-semibold text-sm">Ver portafolio</Text>
          </TouchableOpacity>
        </View>
        
        <View className="mb-5 px-4">
          <ListItem
            data={actionsData}
            showLoadMore={false}
            className="px-0"
          />
        </View>
      </ScrollView>
      <PortfolioActionsBar
        onInvestPress={handleInvestPress}
        onCreatePress={handleCreatePress}
      />
    </Container>
  );
}
