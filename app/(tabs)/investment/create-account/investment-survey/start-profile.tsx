import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';

export default function StartProfile() {
  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-xl font-bold text-center mb-3">
        Veamos qué tipo de inversionista eres
      </Text>

      <Text className="text-base text-center text-gray-500 mb-6">
        Te haremos algunas preguntas para determinar tu perfil de inversionista. Puedes cambiarlo más adelante si lo necesitas.
      </Text>

      <TouchableOpacity
        className="bg-primary-500 py-3 px-4 rounded-lg items-center"
        onPress={() => router.push('/investment/create-account/investment-survey/profile-question' as any)}
      >
        <Text className="text-white font-semibold text-base">Empecemos</Text>
      </TouchableOpacity>

      <Text className="text-center text-gray-500 mt-3">⏱ aprox. 4 minutos</Text>
    </View>
    </Container>
  );
}
