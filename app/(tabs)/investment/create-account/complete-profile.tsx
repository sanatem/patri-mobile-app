import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';

export default function CompleteProfile() {
  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title="Completa tu perfil" />
      <ScrollView className="flex-1 bg-white px-6" showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          className="bg-primary-500 p-4 rounded-xl mb-4"
          onPress={() => router.push("/investment/create-account/identity-step/identity-method" as any)}
        >
          <View className="flex-row items-center">
            <View className="bg-primary-500 p-4 rounded-xl mb-4" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
              <Text className="text-white font-semibold text-base">Verificación de identidad</Text>
              <Text className="text-white mt-1 font-regular">Sube un documento de identidad</Text>
            </View>
          </View>
        </TouchableOpacity>

        <View className="flex-row">
          <View className="bg-gray-100 p-4 rounded-xl mb-4" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
            <Text className="text-gray-400 font-semibold text-base">Información básica</Text>
            <Text className="text-gray-400 mt-1 font-regular">Compártenos un poco sobre ti</Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="bg-gray-100 p-4 rounded-xl mb-4" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
            <Text className="text-gray-400 font-semibold text-base">Contrato y validación correo</Text>
            <Text className="text-gray-400 mt-1 font-regular">Firma tu contrato y verifica tu cuenta</Text>
          </View>
        </View>

        <View className="flex-row">
          <View className="bg-gray-100 p-4 rounded-xl mb-4" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
            <Text className="text-gray-400 font-semibold text-base">Comenzar a invertir</Text>
            <Text className="text-gray-400 mt-1 font-regular">Elige qué quieres hacer con tu plata</Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}
