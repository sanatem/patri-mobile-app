import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui/Button';
import { router } from 'expo-router';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function InvestmentGuest() {
  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
    <View className="flex-1 items-center justify-center pb-10">
      <Header title="Invierte en Acciones o ETF" />
      <Text className="text-base text-gray-500 text-center mb-8">
        La forma más fácil de invertir en la bolsa de Estados Unidos
      </Text>    
      <Container variant="section" style={{ padding: 20 }}>
        <View className="rounded-xl w-full border border-gray-200" style={{ backgroundColor: '#F9FAFB', padding: 20 }}>
          <Text className="text-base text-black mb-3">💸 <Text className="font-bold">Más de 2000 ETFs y acciones</Text> disponibles para comprar</Text>
          <Text className="text-base text-black mb-3">🕒 <Text className="font-bold">Al instante:</Text> invierte en segundos cuando el mercado está abierto</Text>
          <Text className="text-base text-black">🧾 <Text className="font-bold">Te ayudamos con tu declaración</Text> de tus acciones en el SII</Text>
        </View>
      </Container>
        <Button
          title="Comenzar"
          onPress={() => router.push('/(tabs)/investment/portfolio' as any)}
          variant="primary"
          fullWidth
        />
    </View>
    </Container>
  );
}
