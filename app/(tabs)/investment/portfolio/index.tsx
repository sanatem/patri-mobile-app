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
import { InvestmentCard } from '@/components/investment/portfolio/InvestmentCard';

export default function InvestmentPortfolioScreen() {
  const router = useRouter();

  const investmentData = [
    {
      title: 'Reserva',
      subtitle: '',
      amount: '$0',
      icon: <PiggyBank size={24} color="#ff5630" />,
    },
    {
      title: 'Emergencias',
      subtitle: 'Corto plazo',
      amount: '$59.809',
      icon: <LineChart size={24} color="#ff5630" />,
      onPress: () => router.push({
        pathname: '/investment/portfolio/portfolio-details',
        params: {
          title: 'Emergencias',
          subtitle: 'Corto plazo',
          amount: '$59.809',
        },
      }),
    },
    {
      title: 'Casa',
      subtitle: 'Largo plazo',
      amount: '$0',
      icon: <Home size={24} color="#ff5630" />,
    },
    {
      title: 'Mejorar mi jubilación',
      subtitle: 'Jubilación con APV-B',
      amount: '$0',
      icon: <ShieldCheck size={24} color="#ff5630" />,
    },
  ];

  const actionsData = [
    {
      title: 'Dólares',
      subtitle: 'Compra para invertir o ahorrar',
      amount: '',
      icon: <DollarSign size={24} color="#ff5630" />,
      onPress: undefined,
    },
    {
      title: 'Acciones',
      subtitle: 'Invierte desde US $1',
      amount: '',
      icon: <BarChart size={24} color="#ff5630" />,
      onPress: undefined,
    },
  ];

  return (
    <Container variant="secondaryPage" className="bg-white" style={{ padding: 20 }}>
      <Header 
        title="Portfolio" 
        rightAction={
          <TouchableOpacity
            className="w-10 h-10 rounded-full justify-center items-center"
            onPress={() => router.push('/settings')}
          >
            <Settings size={24} color="#374151" />
          </TouchableOpacity>
        }
      />
      <ScrollView className="flex-1 px-5 pb-10 mt-16" showsVerticalScrollIndicator={false}>
        <PortfolioHeader
          patrimony="$59.809"
          onInvestPress={() => router.push('/investment/portfolio/movements/investment/goal-step')}
          onCreatePress={() => router.push('/investment/portfolio/goals/create-goals')}
        />
        <View className="flex-row justify-between items-center mt-10" style={{ marginBottom: 10 }}>
          <Text className="text-xl font-bold text-gray-900">Inversiones</Text>
          <TouchableOpacity>
            <Text className="text-[#ff5630] font-semibold text-sm">Ver resumen <Text className="font-bold">•</Text></Text>
          </TouchableOpacity>
        </View>

        <View className="mb-6" style={{ gap: 5 }}>
          {investmentData.map((item, index) => (
            <InvestmentCard
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              amount={item.amount}
              icon={item.icon}
              onPress={item.onPress}
            />
          ))}
        </View>
        <View className="flex-row justify-between items-center" style={{ marginBottom: 10 }}>
          <Text className="text-xl font-bold text-gray-900">Acciones</Text>
          <TouchableOpacity>
            <Text className="text-[#ff5630] font-semibold text-sm">Ver portafolio</Text>
          </TouchableOpacity>
        </View>
        <View className="mb-5" style={{ gap: 10 }}>
          {actionsData.map((item, index) => (
            <InvestmentCard
              key={index}
              title={item.title}
              subtitle={item.subtitle}
              amount={item.amount}
              icon={item.icon}
              onPress={item.onPress}
            />
          ))}
        </View>
      </ScrollView>
    </Container>
  );
}
