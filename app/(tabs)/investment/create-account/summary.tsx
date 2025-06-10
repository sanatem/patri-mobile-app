import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Container } from '@/components/ui/Container';
import { Header } from '@/components/ui/Header';
import { Button } from '@/components/ui';
import { Check, Clock } from 'lucide-react-native';

export default function SummaryStep() {
  return (
    <Container variant="secondaryPage" style={{ padding: 20 }}>
      <Header title="Tu perfil está casi listo" />
      <ScrollView className="flex-1 bg-white px-6" showsVerticalScrollIndicator={false}>
        <Text className="text-lg text-gray-600 text-center mb-6">
          Estamos validando tu información. Una vez listo, podrás comenzar a invertir 🚀
        </Text>
        <View className="bg-primary-500 p-4 rounded-xl mb-4 flex-row justify-between items-center" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
          <View>
            <Text className="text-white font-semibold text-base">Verificación de identidad</Text>
            <Text className="text-white mt-1 font-regular">Documento validado correctamente</Text>
          </View>
          <Check size={24} color="white" className="mr-2" />
        </View>
        <View className="bg-primary-500 p-4 rounded-xl mb-4 flex-row justify-between items-center" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
          <View>
            <Text className="text-white font-semibold text-base">Información básica</Text>
            <Text className="text-white mt-1 font-regular">Perfil completado exitosamente</Text>
          </View>
          <Check size={24} color="white" className="mr-2" />
        </View>
        <View className="bg-gray-100 p-4 rounded-xl mb-4 flex-row justify-between items-center" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
          <View>
            <Text className="text-gray-400 font-semibold text-base">Contrato y validación correo</Text>
            <Text className="text-gray-400 mt-1 font-regular">En proceso de validación...</Text>
          </View>
          <Clock size={24} color="#9CA3AF" className="mr-2" />
        </View>
        <View className="bg-gray-100 p-4 rounded-xl mb-4 flex-row justify-between items-center" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 10, paddingBottom: 10 }}>
          <View>
            <Text className="text-gray-400 font-semibold text-base">Comenzar a invertir</Text>
            <Text className="text-gray-400 mt-1 font-regular">Elige qué quieres hacer con tu plata</Text>
          </View>
          <Clock size={24} color="#9CA3AF" className="mr-2" />
        </View>
        
        <Button
          title="Volver al inicio"
          onPress={() => router.push('/(tabs)/investment')}
          variant="primary"
          fullWidth
        />
      </ScrollView>
    </Container>
  );
}
