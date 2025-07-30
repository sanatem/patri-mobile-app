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

  const handlePresentPaywall = () => {
    Alert.alert('Funcionalidad en desarrollo', 'Esta función estará disponible próximamente');
  };

  const handlePurchaseCancelled = () => {
    Alert.alert('Compra cancelada', 'La compra fue cancelada por el usuario');
  };

  const handleCardPress = (card: PlanningCard) => {
    Alert.alert('Funcionalidad en desarrollo', 'Esta función estará disponible próximamente');
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
