import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  LineChart,
  PiggyBank,
  Home,
  ShieldCheck,
  DollarSign,
  BarChart,
  TrendingUp,
  Plus,
  Settings,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';

export default function InvestmentPortfolioScreen() {
  const router = useRouter();

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title="Portfolio" />
      <ScrollView className="flex-1 bg-gray -50 px-5 pb-10 mt-16">
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          className="w-10 h-10 rounded-full justify-center items-center"
          onPress={() => router.push('/settings')}
        >
          <Settings size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Header de patrimonio */}
      <View className="items-center mb-8">
        <Text className="text-xl text-gray-500 mb-1">
          Tu patrimonio <Text className="text-gray-400 text-xl">ⓘ</Text>
        </Text>
        <Text className="text-3xl font-bold text-gray-900 mb-4">$59.809</Text>

        <View className="flex-row space-x-4">
          <TouchableOpacity
            className="w-20 h-20 rounded-full justify-center items-center bg-[#FF5603]"
            onPress={() => router.push('/investment/portfolio/movements/investment/goal-selection')}
          >
            <TrendingUp size={24} color="white" />
            <Text className="text-white font-semibold text-xs mt-1 bg-primary-500">Invertir</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="w-20 h-20 rounded-full justify-center items-center bg-[#FF5603]"
            onPress={() => router.push('/investment/portfolio/goals/create-goals')}
          >
            <Plus size={24} color="white" />
            <Text className="text-white font-semibold bg-primary-500 text-xs mt-1">Crear</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Inversiones */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xl font-bold text-gray-900">Inversiones</Text>
        <TouchableOpacity>
          <Text className="text-[#ff5630] font-semibold text-sm">Ver resumen <Text className="font-bold">•</Text></Text>
        </TouchableOpacity>
      </View>

      <View className="mb-6 space-y-3">
        {[{
          title: 'Reserva',
          subtitle: '',
          amount: '$0',
          icon: <PiggyBank size={24} color="#ff5630" />,
        }, {
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
        }, {
          title: 'Casa',
          subtitle: 'Largo plazo',
          amount: '$0',
          icon: <Home size={24} color="#ff5630" />,
        }, {
          title: 'Mejorar mi jubilación',
          subtitle: 'Jubilación con APV-B',
          amount: '$0',
          icon: <ShieldCheck size={24} color="#ff5630" />,
        }].map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white p-4 rounded-xl shadow-sm flex-row items-center"
            onPress={item.onPress}
          >
            <View className="w-8 h-8 mr-3 justify-center items-center">{item.icon}</View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
              {item.subtitle !== '' && (
                <Text className="text-sm text-gray-500">{item.subtitle}</Text>
              )}
            </View>
            <Text className="text-sm font-semibold text-gray-900 mr-1">{item.amount}</Text>
            <Text className="text-lg text-gray-300">›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Acciones */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xl font-bold text-gray-900">Acciones</Text>
        <TouchableOpacity>
          <Text className="text-[#ff5630] font-semibold text-sm">Ver portafolio</Text>
        </TouchableOpacity>
      </View>

      <View className="mb-6 space-y-3">
        {[{
          title: 'Dólares',
          subtitle: 'Compra para invertir o ahorrar',
          icon: <DollarSign size={24} color="#ff5630" />,
        }, {
          title: 'Acciones',
          subtitle: 'Invierte desde US $1',
          icon: <BarChart size={24} color="#ff5630" />,
        }].map((item, index) => (
          <TouchableOpacity key={index} className="bg-white p-4 rounded-xl shadow-sm flex-row items-center">
            <View className="w-8 h-8 mr-3 justify-center items-center">{item.icon}</View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-900">{item.title}</Text>
              <Text className="text-sm text-gray-500">{item.subtitle}</Text>
            </View>
            <Text className="text-lg text-gray-300">›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
    </Container>
  );
}
