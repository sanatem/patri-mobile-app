import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Header } from '@/components/ui/Header';
import { Container } from '@/components/ui/Container';

export default function IdentityMethod() {
  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title="Verificación de identidad" />
    <View className="flex-1 bg-white pt-20 px-6"> 
      <Text className="text-xl font-bold mb-3">
        ¿Con qué documento te verificarás?
      </Text>
      <Text className="text-base text-gray-500 mb-6">
        Necesitamos un documento emitido en Chile, vigente y que pertenezca a un mayor de edad
      </Text>

      <TouchableOpacity
        className="bg-white py-3 px-4 rounded-lg items-center mb-3 border border-primary-500"
        onPress={() => router.push('/investment/create-account/identity-step/identity-upload' as any)}
      >
        <Text className="text-primary-500 font-semibold text-base">Cédula de identidad</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-white py-3 px-4 rounded-lg items-center mb-3 mt-3 border border-primary-500"
        onPress={() => router.push('/investment/create-account/identity-step/identity-upload' as any)}
      >
        <Text className="text-primary-500 font-semibold text-base">Con pasaporte chileno</Text>
      </TouchableOpacity>

      <Text className="mt-5 text-sm text-center text-primary-500">
        ¿Por qué necesitan un documento?
      </Text>
    </View>
    </Container>
  );
}
