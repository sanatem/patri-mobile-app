import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Header, Container } from '@/components/ui';
import { useConsultingHours } from '@/hooks/consulting/useConsultingHours';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ConsultingSessions() {
  const { t } = useTranslation();
  const { 
    availableHours, 
    totalPurchased, 
    totalUsed, 
    purchaseHistory,
    useHour 
  } = useConsultingHours();

  const handleUseHour = async () => {
    if (availableHours === 0) {
      Alert.alert(
        'Sin horas disponibles',
        'No tienes horas de asesoría disponibles para usar.'
      );
      return;
    }

    Alert.alert(
      'Confirmar uso de hora',
      '¿Has completado una sesión de asesoría?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, marcar como usada',
          onPress: async () => {
            try {
              await useHour();
              Alert.alert(
                '✓ Hora marcada como usada',
                `Te quedan ${availableHours - 1} hora(s) disponible(s)`
              );
            } catch (error) {
              Alert.alert('Error', 'No se pudo marcar la hora como usada');
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Header title="Mis Sesiones de Asesoría" showBackButton />
      
      <Container>
        <ScrollView className="flex-1 px-4 pt-6">
          {/* Resumen */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <Text className="text-lg font-semibold mb-3">Resumen</Text>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Total compradas:</Text>
              <Text className="font-semibold">{totalPurchased}</Text>
            </View>
            
            <View className="flex-row justify-between mb-2">
              <Text className="text-gray-600">Sesiones realizadas:</Text>
              <Text className="font-semibold">{totalUsed}</Text>
            </View>
            
            <View className="flex-row justify-between">
              <Text className="text-gray-600">Horas disponibles:</Text>
              <Text className="font-semibold text-green-600 text-lg">
                {availableHours}
              </Text>
            </View>
          </View>

          {/* Botón para marcar como usada (TEMPORAL - Manual) */}
          {availableHours > 0 && (
            <TouchableOpacity
              onPress={handleUseHour}
              className="bg-orange-500 rounded-lg p-4 mb-6"
            >
              <Text className="text-white text-center font-semibold">
                Marcar sesión como completada
              </Text>
            </TouchableOpacity>
          )}

          {/* Historial de compras */}
          <Text className="text-lg font-semibold mb-3">
            Historial de compras
          </Text>
          
          {purchaseHistory.length === 0 ? (
            <Text className="text-gray-500 text-center py-8">
              No has comprado horas de asesoría aún
            </Text>
          ) : (
            purchaseHistory.map((purchase, index) => (
              <View
                key={index}
                className="bg-white border border-gray-200 rounded-lg p-4 mb-3"
              >
                <View className="flex-row justify-between">
                  <Text className="font-medium">Hora de Asesoría</Text>
                  <Text className="text-gray-600">$120.000</Text>
                </View>
                <Text className="text-gray-500 text-sm mt-1">
                  {format(new Date(purchase.date), "d 'de' MMMM 'de' yyyy", {
                    locale: es
                  })}
                </Text>
                {purchase.transactionId && (
                  <Text className="text-gray-400 text-xs mt-1">
                    ID: {purchase.transactionId}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </Container>
    </View>
  );
}

