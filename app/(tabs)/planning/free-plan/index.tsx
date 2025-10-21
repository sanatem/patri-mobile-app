import React from 'react';
import { View, ScrollView, Linking, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Header, Container } from '@/components/ui';
import { SectionPlan, TopTitle } from '@/components/planning/free-plan';
import { usePaywall } from '@/hooks/common/usePaywall';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useConsultingHours } from '@/hooks/consulting/useConsultingHours';
import { canScheduleSession } from '@/services/consulting/validate-purchase';
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
  const {
    availableHours,
    addPurchase,
    lastScheduledDate,
    canPurchaseThisYear,
    canScheduleThisYear,
    lastPurchaseDate,
    refresh
  } = useConsultingHours();
  const { t } = useTranslation();

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );


  const handlePurchase = async () => {
    try {
      const result = await presentPaywall();

      if (result.success) {
        await forceRefresh();
        Alert.alert(
          t('planning.success.title'),
          t('planning.success.message'),
          [{ text: 'OK' }]
        );
        onPurchase?.();
      } else if (!result.cancelled) {
        Alert.alert(
          t('planning.error.title'),
          result.error || t('planning.error.subscription'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        t('planning.error.title'),
        t('planning.error.unexpected'),
        [{ text: 'OK' }]
      );
    }
  };

  const handleConsultingPurchase = async () => {
    try {
      if (!canPurchaseThisYear) {
        const lastPurchase = new Date(lastPurchaseDate!);
        const nextAvailableDate = new Date(lastPurchase);
        nextAvailableDate.setFullYear(nextAvailableDate.getFullYear() + 1);

        Alert.alert(
          t('planning.consulting.error.purchase'),
          `Ya compraste una hora este año. Podrás comprar nuevamente el ${nextAvailableDate.toLocaleDateString()}`
        );
        return;
      }

      const result = await presentPaywallForOffering('consulting_offering');

      if (result.success) {
        await addPurchase();

        try {
          const customerInfo = await Purchases.getCustomerInfo();
          const latestTransaction = customerInfo.nonSubscriptionTransactions[0];

          if (latestTransaction) {
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
        }

        await forceRefresh();
        
        Alert.alert(
          t('planning.consulting.success.title'),
          t('planning.consulting.success.message'),
          [{ text: 'OK' }]
        );
      } else if (!result.cancelled) {
        Alert.alert(
          t('planning.error.title'),
          result.error || t('planning.consulting.error.purchase'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        t('planning.error.title'),
        t('planning.consulting.error.unexpected'),
        [{ text: 'OK' }]
      );
    }
  };

  const handleSchedulePress = async () => {
    try {
      if (__DEV__ && availableHours > 0) {
        if (!canScheduleThisYear) {
          Alert.alert(
            t('planning.consulting.schedule.error.title'),
            t('planning.consulting.schedule.error.alreadyScheduled')
          );
          return;
        }
        router.push('/planning/schedule-meeting');
        return;
      }

      const validation = await canScheduleSession(lastScheduledDate);

      if (!validation.canSchedule) {
        Alert.alert(
          t('planning.consulting.schedule.error.title'),
          validation.reason || t('planning.consulting.schedule.error.unknown')
        );
        return;
      }

      router.push('/planning/schedule-meeting');
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('planning.consulting.schedule.error.validation')
      );
    }
  };


  const handleCardPress = async (card: any) => {
    if (card.title === t('planning.cardTitles.premiumMobile')) {
      await handlePurchase();
    } else if (card.id === 'consulting') {
      await handleConsultingPurchase();
    } else if (card.id === 'schedule_consulting') {
      await handleSchedulePress();
    } else if (card.title === t('planning.cardTitles.plans')) {
      Linking.openURL('https://patrimore.com/planes');
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
            canScheduleThisYear={canScheduleThisYear}
          />
        </ScrollView>
      </Container>
    </View>
  );
}