import React from 'react';
import { View, ScrollView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Container } from '@/components/ui';
import { SectionPlan, TopTitle } from '@/components/planning/free-plan';
import { usePaywall } from '@/hooks/common/usePaywall';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useTranslation } from 'react-i18next';

interface FreePlanProps {
  onPurchase?: () => void;
  isSubscribed?: boolean;
}

export default function FreePlan({ onPurchase, isSubscribed = false }: FreePlanProps) {
  const router = useRouter();
  const { presentPaywall } = usePaywall();
  const { forceRefresh } = useSubscriptionStatus();
  const { t } = useTranslation();

  const handlePurchase = async () => {
    try {
      console.log('Presenting paywall...');
      const result = await presentPaywall();

      if (result.success) {
        await forceRefresh();
        Alert.alert(
          t('planning.success.title'),
          t('planning.success.message'),
          [{ text: 'OK' }]
        );
        onPurchase?.();
      } else if (result.cancelled) {
        console.log('Purchase cancelled by user');
      } else {
        Alert.alert(
          t('planning.error.title'),
          result.error || t('planning.error.subscription'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error in handlePurchase:', error);
      Alert.alert(
        t('planning.error.title'),
        t('planning.error.unexpected'),
        [{ text: 'OK' }]
      );
    }
  };

  const handleCardPress = async (card: any) => {
    console.log('Card pressed:', card.title);
    
    if (card.title === t('planning.cardTitles.premiumMobile')) {
      await handlePurchase();
    } else if (card.id === 'consulting') {
      // TODO: Integrar con RevenueCat para compra de hora de asesoría
      Alert.alert(
        'Asesoría Personalizada',
        'La funcionalidad de compra de asesoría estará disponible próximamente.',
        [{ text: 'OK' }]
      );
    } else if (card.title === t('planning.cardTitles.plans')) {
      Linking.openURL('https://patrimore.com/planes').catch(err =>
        console.error('Error al abrir la URL:', err)
      );
    }
  };
  return (
    <View className="flex-1 bg-white">
      <Header
        title={t('planning.title')}
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