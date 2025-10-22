import React from 'react';
import { View, ScrollView, Linking, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Header, Container } from '@/components/ui';
import { SectionPlan, TopTitle } from '@/components/planning/free-plan';
import { usePaywall } from '@/hooks/common/usePaywall';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useConsultingHours } from '@/hooks/consulting/useConsultingHours';
import { canScheduleSession, canPurchaseConsultingHour } from '@/services/consulting/validate-purchase';
import { useTranslation } from 'react-i18next';

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
    canScheduleThisYear,
    hasActivePurchase,
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

      const purchaseCheck = await canPurchaseConsultingHour();

      if (!purchaseCheck.canPurchase) {
        Alert.alert(
          t('planning.consulting.error.purchase'),
          purchaseCheck.reason || 'No puedes comprar otra hora en este momento'
        );
        return;
      }

      const result = await presentPaywallForOffering('consulting_offering');

      if (result.success) {
        // Refrescar datos después de la compra
        await refresh();

        // Abrir directamente el widget de agendar
        // El consumo se hará DESPUÉS de que el usuario agende
        router.push('/planning/schedule-meeting');
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
            canScheduleThisYear={canScheduleThisYear}
            hasActivePurchase={hasActivePurchase}
          />
        </ScrollView>
      </Container>
    </View>
  );
}