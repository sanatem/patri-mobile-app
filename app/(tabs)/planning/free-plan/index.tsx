import React from 'react';
import { View, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Container } from '@/components/ui';
import { SectionPlan, TopTitle } from '@/components/planning/free-plan';

interface FreePlanProps {
  onPurchase?: () => void;
}

export default function FreePlan({ onPurchase }: FreePlanProps) {
  const router = useRouter();

  const handlePurchase = () => {
    console.log('Navigate to purchase');
    onPurchase?.();
  };

  const handleCardPress = (card: any) => {
    console.log('Card pressed:', card.title);
    
    if (card.title === 'Planes') {
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
          <SectionPlan onCardPress={handleCardPress} />
        </ScrollView>
      </Container>
    </View>
  );
}
