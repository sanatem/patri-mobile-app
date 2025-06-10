import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';

export default function ProfileResult() {
  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
    <View className="flex-1 justify-center bg-white p-6">
      <Text className="text-[64px] text-center mb-5">🕵️‍♀️</Text>
      <Text className="text-xl font-bold text-center mb-3">
        Tu perfil es conservador
      </Text>
      <Text className="text-base text-gray-500 text-center mb-2">
        Valorás principalmente la estabilidad, pero tolerás un poco de riesgo en tus inversiones.
      </Text>
      <Text className="text-base text-gray-500 text-center mb-2">
        Puedes cambiarlo más adelante si lo deseas.
      </Text>

      <TouchableOpacity
        className="bg-primary-500 py-3 px-4 rounded-lg items-center"
        onPress={() => router.push('/investment/create-account/complete-profile' as any)}
      >
        <Text className="text-white font-semibold text-base">Entendido, continuemos</Text>
      </TouchableOpacity>
    </View>
    </Container>
  );
}
