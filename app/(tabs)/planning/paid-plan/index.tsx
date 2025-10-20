import { ScrollView, View, Text, ActivityIndicator } from 'react-native';
import {
  Header,
  Container,
} from '@/components/ui';
import { PlanningCarousel } from '@/components/planning/paid-plan';
import AdvisorSection from '@/components/planning/paid-plan/AdvisorSection';
import SubscriptionSection from '@/components/planning/paid-plan/subscription/SubscriptionSection';
import { useSubscription } from '@/hooks/planning/subscription/useSubscription';
import { useTranslation } from 'react-i18next';
import Colors from '@/constants/Colors';


export default function PaidPlan() {
  const { t } = useTranslation();
  const { subscriptionData, loading: subscriptionLoading, error: subscriptionError } = useSubscription();

  const handleSchedulePress = () => {
    console.log('Programar reunión');
  };

  const handleChatPress = () => {
    console.log('Iniciar chat');
  };

  const handleCarouselCardPress = (card: any) => {
    console.log('Plan seleccionado:', card.title, card.price);
  };

  const handleAIPress = (card: any) => {
    console.log('IA solicitada para:', card.title);
  };

  return (
    <Container variant="secondaryPage">
      <Header
        title={t('labels.planning.title')}
        subtitle={t('labels.planning.subtitle')}
        variant="transparent"
        titleClassName="text-white font-bold"
        subtitleClassName="text-white"
      />
      <ScrollView className="flex-1 mx-2" showsVerticalScrollIndicator={false} style={{ marginTop: 10 }}>
        <AdvisorSection onSchedule={handleSchedulePress} onChat={handleChatPress} />

        {subscriptionLoading ? (
          <View className="py-8 items-center">
            <ActivityIndicator size="large" color={Colors.secondary[500]} />
          </View>
        ) : subscriptionError ? (
          <View className="py-4 px-4 mb-4 rounded-lg" style={{ backgroundColor: Colors.error[50] }}>
            <Text className="text-sm text-center" style={{ color: Colors.error[700] }}>
              {subscriptionError}
            </Text>
          </View>
        ) : subscriptionData?.success && subscriptionData.data ? (
          <SubscriptionSection
            planName={subscriptionData.data.plan_name}
            totalAmount={subscriptionData.data.total_amount}
            annualPayment={subscriptionData.data.annual_payment}
            endDate={subscriptionData.data.end_date}
            payments={subscriptionData.data.payments || []}
          />
        ) : null}

        {false && <PlanningCarousel onCardPress={handleCarouselCardPress} onAIPress={handleAIPress} />}
      </ScrollView>
    </Container>
  );
}