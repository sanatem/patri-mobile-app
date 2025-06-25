import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  LineChart,
  PiggyBank,
  Home,
  ShieldCheck,
  DollarSign,
  BarChart,
  Settings,
  ChevronLeft,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { PortfolioHeader } from '@/components/investment/portfolio/PortfolioHeader';
import { ListItem } from '@/components/ui/ListItem';
import { Tabs } from '@/components/ui/Tabs';
import { 
  INVESTMENT_PORTFOLIO_DATA, 
  INVESTMENT_ACTIONS_DATA, 
  INVESTMENT_SAMPLE_DATA 
} from '@/constants/AppConstants';
import Colors from '@/constants/Colors';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';

export default function InvestmentPortfolioScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'investments' | 'actions'>('investments');

  const iconMap = {
    PiggyBank: <PiggyBank size={24} color={Colors.secondary[500]} />,
    LineChart: <LineChart size={24} color={Colors.secondary[500]} />,
    Home: <Home size={24} color={Colors.secondary[500]} />,
    ShieldCheck: <ShieldCheck size={24} color={Colors.secondary[500]} />,
    DollarSign: <DollarSign size={24} color={Colors.secondary[500]} />,
    BarChart: <BarChart size={24} color={Colors.secondary[500]} />,
  };

  const investmentData = INVESTMENT_PORTFOLIO_DATA.map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    value: item.amount,
    icon: {
      component: iconMap[item.icon as keyof typeof iconMap],
      backgroundColor: Colors.secondary[50],
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

  const actionsData = INVESTMENT_ACTIONS_DATA.map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    value: '',
    icon: {
      component: iconMap[item.icon as keyof typeof iconMap],
      backgroundColor: Colors.secondary[50],
      color: Colors.secondary[500],
      text: item.title.charAt(0)
    },
    onPress: undefined,
  }));

  const tabs = [
    { key: 'investments', label: 'Inversiones', badge: investmentData.length },
    { key: 'actions', label: 'Acciones', badge: actionsData.length },
  ];

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
            <Settings size={24} color={Colors.gray[700]} />
          </TouchableOpacity>
        }
        leftAction={
          <TouchableOpacity
            className="w-10 h-10 rounded-full justify-center items-center"
            onPress={() => router.push('/investment')}
          >
            <ChevronLeft size={24} color={Colors.gray[700]} />
          </TouchableOpacity>
        }
      />
      <ScrollView className="flex-1 px-5 pb-[120px] mt-16" showsVerticalScrollIndicator={false}>
        <PortfolioHeader
          patrimony={INVESTMENT_SAMPLE_DATA.PATRIMONY_AMOUNT}
        />
        <PortfolioActionsBar
          onInvestPress={handleInvestPress}
          onCreatePress={handleCreatePress}
        />
        <View style={listItemStyles.cardContainer}>
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(key) => setActiveTab(key as 'investments' | 'actions')}
          />
          <ListItem
            data={activeTab === 'investments' ? investmentData : actionsData}
            showLoadMore={false}
            showContainer={false}
          />
        </View>
      </ScrollView>
    </Container>
  );
}
