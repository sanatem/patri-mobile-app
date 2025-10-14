import React from 'react';
import { View, ScrollView, Linking, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Header, Container } from '@/components/ui';
import { SectionPlan, TopTitle } from '@/components/planning/free-plan';
import { usePaywall } from '@/hooks/common/usePaywall';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useConsultingHours } from '@/hooks/consulting/useConsultingHours';
import { useTranslation } from 'react-i18next';
import Purchases from 'react-native-purchases';

interface FreePlanProps {
  onPurchase?: () => void;
  isSubscribed?: boolean;
}

export default function FreePlan({ onPurchase, isSubscribed = false }: FreePlanProps) {
  const router = useRouter();
  const { presentPaywall, presentPaywallForOffering } = usePaywall();
  const { forceRefresh } = useSubscriptionStatus();
  const { availableHours, addPurchase, refresh: refreshHours } = useConsultingHours();
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

  const handleConsultingPurchase = async () => {
    try {
      console.log('Presenting consulting paywall...');
      const result = await presentPaywallForOffering('consulting_offering');

      if (result.success) {
        await addPurchase();

        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const latestTransaction = customerInfo.nonSubscriptionTransactions[0];
          
          if (latestTransaction) {
            console.log('Consuming purchase to allow future purchases...');
            
            // TODO: Enviar notificación al backend
            // await fetch('https://api.patrimore.com/api/consulting-sessions', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({
            //     userId: customerInfo.originalAppUserId,
            //     productId: 'consulting_hour_120',
            //     transactionId: latestTransaction.transactionIdentifier,
            //     purchaseDate: latestTransaction.purchaseDate
            //   })
            // });
          }
        } catch (consumeError) {
          console.error('Error consuming purchase:', consumeError);
        }
        
        await forceRefresh();
        
        Alert.alert(
          t('planning.consulting.success.title'),
          t('planning.consulting.success.message'),
          [{ text: 'OK' }]
        );
      } else if (result.cancelled) {
        console.log('Consulting purchase cancelled by user');
      } else {
        Alert.alert(
          t('planning.error.title'),
          result.error || t('planning.consulting.error.purchase'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error in handleConsultingPurchase:', error);
      Alert.alert(
        t('planning.error.title'),
        t('planning.consulting.error.unexpected'),
        [{ text: 'OK' }]
      );
    }
  };

  const handleCardPress = async (card: any) => {
    console.log('Card pressed:', card.title);
    
    if (card.title === t('planning.cardTitles.premiumMobile')) {
      await handlePurchase();
    } else if (card.id === 'consulting') {
      await handleConsultingPurchase();
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
          <SectionPlan 
            onCardPress={handleCardPress} 
            isSubscribed={isSubscribed}
            consultingHoursAvailable={availableHours}
          />
        </ScrollView>
      </Container>
    </View>
  );
}