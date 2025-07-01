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
  ArrowDown,
  ArrowUp,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { PortfolioHeader } from '@/components/investment/portfolio/PortfolioHeader';
import { ListItem } from '@/components/ui/ListItem';
import { 
  INVESTMENT_PORTFOLIO_DATA, 
  INVESTMENT_SAMPLE_DATA 
} from '@/constants/AppConstants';
import Colors from '@/constants/Colors';
import { listItemStyles } from '@/styles/ui/ListItem.styles';
import { PortfolioActionsBar } from '@/components/investment/portfolio/PortfolioActionsBar';
import { Button } from '@/components/ui/Button';

export default function InvestmentPortfolioScreen() {
  const router = useRouter();

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



  const handleInvestPress = () => router.push('/investment/portfolio/movements/investment');
  const handleWithdrawPress = () => router.push('/investment/portfolio/movements/sales');

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
        <View className="px-6 py-2">
          <Text className="text-lg font-medium text-gray-800">Metas</Text>
        </View>
        <View style={listItemStyles.cardContainer}>
          <ListItem
            data={investmentData}
            showLoadMore={false}
            showContainer={false}
          />
        </View>
      </ScrollView>
    </Container>
  );
}
