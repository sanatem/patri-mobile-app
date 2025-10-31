import { ScrollView, View, Text } from 'react-native';
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
  const { 
    subscriptionData, 
    loading: subscriptionLoading, 
    error: subscriptionError,
    payments,
    allPayments,
    paymentsMeta,
    paymentsLoading,
    setPaymentsPage
  } = useSubscription();

  const handleSchedulePress = () => {
  };

  const handleChatPress = () => {
  };

  const handleCarouselCardPress = (card: any) => {
  };

  const handleAIPress = (card: any) => {
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

        {subscriptionError ? (
          <View className="py-4 px-4 mb-4 rounded-lg" style={{ backgroundColor: Colors.error[50] }}>
            <Text className="text-sm text-center" style={{ color: Colors.error[700] }}>
              {subscriptionError}
            </Text>
          </View>
        ) : (
          <SubscriptionSection
            planName={subscriptionData?.data?.plan_name || ''}
            totalAmount={subscriptionData?.data?.total_amount || 0}
            annualPayment={subscriptionData?.data?.annual_payment || false}
            nextPaymentOn={subscriptionData?.data?.next_payment_on || null}
            loading={subscriptionLoading}
            paymentsData={payments}
            allPaymentsData={allPayments}
            paymentsMeta={paymentsMeta}
            paymentsLoading={paymentsLoading}
            onPaymentsPageChange={setPaymentsPage}
          />
        )}

        {false && <PlanningCarousel onCardPress={handleCarouselCardPress} onAIPress={handleAIPress} />}
      </ScrollView>
    </Container>
  );
}