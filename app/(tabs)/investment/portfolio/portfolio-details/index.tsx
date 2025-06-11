import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { TipBox } from '@/components/ui/TipBox';
import { ChartSection } from '@/components/investment/portfolio/portfolio-details/ChartSection';
import { InvestmentDetailsSection } from '@/components/investment/portfolio/portfolio-details/InvestmentDetailsSection';
import { ActivitySection } from '@/components/investment/portfolio/portfolio-details/ActivitySection';

export default function PortfolioDetailsScreen() {
  const router = useRouter();
  const { title = '', subtitle = '', amount = '' } = useLocalSearchParams();

  const investmentDetails = [
    {
      label: 'Nivel de riesgo',
      value: 'Muy conservador',
    },
    {
      label: 'Plazo de inversión',
      value: '6 meses',
      subtitle: 'Llevas 28 meses',
    },
    {
      label: 'Very Conservative Streep A',
      value: amount as string,
      subtitle: '100,00%',
    },
  ];

  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
    <View className="flex-1 bg-white">
      <Header 
        title={title as string} 
        leftAction={
          <TouchableOpacity
            onPress={() => router.push('/investment/portfolio')}
            className="p-1 mr-3"
          >
            <ChevronLeft size={24} color="#FF5603" />
          </TouchableOpacity>
        }
      />
      
      <ScrollView 
        className="flex-1 px-5" 
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <TipBox>
          En 28 meses tu inversión ha rentado un 19,55%
        </TipBox>
        <View className="mb-4">
          <Text className="text-sm text-gray-500 mb-1">Balance</Text>
          <Text className="text-3xl font-bold text-gray-900 mb-3">{amount}</Text>
          
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-gray-500">Depositaste</Text>
            <Text className="text-sm text-gray-500">Variación</Text>
          </View>
          
          <View className="flex-row justify-between">
            <Text className="text-base font-semibold text-gray-900">$50.017</Text>
            <Text className="text-base font-semibold text-gray-900">$9.792</Text>
          </View>
        </View>

        <ChartSection 
          updatedDate="Actualizado al cierre del martes 27 de mayo"
        />

        <InvestmentDetailsSection 
          details={investmentDetails}
        />

        <ActivitySection 
          onMovePress={() => console.log('Mover pressed')}
        />
      </ScrollView>

      <View className="bg-white border-t border-gray-200 p-5 flex-col" style={{ gap: 12 }}>
        <Button
          title="Retirar"
          variant="outline"
          onPress={() => console.log('Retirar')}
          fullWidth
        />
        <Button
          title="Invertir"
          variant="primary"
          onPress={() => router.push({
            pathname: '/investment/portfolio/movements/investment' as any,
            params: { from: title },
          })}
          fullWidth
        />
      </View>
    </View>
    </Container>
  );
}
