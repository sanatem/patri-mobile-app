import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Container, Header, Input, Button } from '@/components/ui';

export default function IdentityConfirm() {
  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title="Confirma tus datos" />
      <ScrollView className="flex-1 bg-white pt-20 px-6" showsVerticalScrollIndicator={false}>
      <Text className="text-gray-500 mb-4 text-center">
        Edítalos si encuentras un error o faltó alguno.
      </Text>

      <Input className="bg-gray-100 p-3 rounded-lg mb-3" placeholder="Nombres" value="Rommina Paz" />
      <Input className="bg-gray-100 p-3 rounded-lg mb-3" placeholder="Primer apellido" value="Cáceres" />
      <Input className="bg-gray-100 p-3 rounded-lg mb-3" placeholder="Segundo apellido" value="Pinilla" />
      <Input className="bg-gray-100 p-3 rounded-lg mb-3" placeholder="Sexo" value="Femenino" />
      <Input className="bg-gray-100 p-3 rounded-lg mb-3" placeholder="Fecha de nacimiento" value="18-01-1995" />
      <Input className="bg-gray-100 p-3 rounded-lg mb-4" placeholder="Fecha vencimiento carnet" value="18-01-2035" />

      <Button
        title="Continuar"
        onPress={() => router.push('/investment/create-account/personal-information/personal-information-question' as any)}
        variant="primary"
        fullWidth
      />
    </ScrollView>
    </Container>
  );
}
