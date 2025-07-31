import React from 'react';
import { View, ScrollView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Container } from '@/components/ui';
import { SectionPlan, TopTitle } from '@/components/planning/free-plan';
import { usePaywall } from '@/hooks/common/usePaywall';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';

interface FreePlanProps {
  onPurchase?: () => void;
  isSubscribed?: boolean;
}

export default function FreePlan({ onPurchase, isSubscribed = false }: FreePlanProps) {
  const router = useRouter();
  const { presentPaywall } = usePaywall();
  const { forceRefresh } = useSubscriptionStatus();

  const handlePurchase = async () => {
    try {
      console.log('Presenting paywall...');
      const result = await presentPaywall();

      if (result.success) {
        await forceRefresh();
        Alert.alert(
          '¡Suscripción exitosa!',
          'Ahora tienes acceso a todas las funciones premium.',
          [{ text: 'OK' }]
        );
        onPurchase?.();
      } else if (result.cancelled) {
        console.log('Purchase cancelled by user');
      } else {
        Alert.alert(
          'Error',
          result.error || 'Hubo un problema con la suscripción. Intenta nuevamente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error in handlePurchase:', error);
      Alert.alert(
        'Error',
        'Hubo un problema inesperado. Intenta nuevamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleCardPress = async (card: any) => {
    console.log('Card pressed:', card.title);
    
    if (card.title === 'Plan Premium (móvil)') {
      await handlePurchase();
    } else if (card.title === 'Planes') {
      Linking.openURL('https://patrimore.com/planes').catch(err =>
        console.error('Error al abrir la URL:', err)
      );
    }
  };
  return (
    <View className="flex-1 bg-white">
      <Header
        title="Planificación"
      />

      <Container variant="secondaryPage">
        <ScrollView 
          className="flex-1 mt-5" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <TopTitle onPurchase={handlePurchase} />
          <SectionPlan onCardPress={handleCardPress} isSubscribed={isSubscribed} />
        </ScrollView>
      </Container>
    </View>
  );
}