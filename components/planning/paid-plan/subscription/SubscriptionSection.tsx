import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Payment, PaymentsPaginationMeta } from '@/services/planning/subscription/get-subscription';
import PlanSubscriptionCard from './PlanSubscriptionCard';
import PaymentsCard from './PaymentsCard';

interface SubscriptionSectionProps {
  planName: string;
  totalAmount: number;
  annualPayment: boolean;
  nextPaymentOn: string | null;
  loading?: boolean;
  paymentsData: Payment[];
  allPaymentsData: Payment[];
  paymentsMeta: PaymentsPaginationMeta | null;
  paymentsLoading: boolean;
  onPaymentsPageChange: (page: number) => void;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  planName,
  totalAmount,
  annualPayment,
  nextPaymentOn,
  loading = false,
  paymentsData,
  allPaymentsData,
  paymentsMeta,
  paymentsLoading,
  onPaymentsPageChange
}) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('planning.subscription.unlimited');

    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const formattedNextPaymentDate = nextPaymentOn ? formatDate(nextPaymentOn) : null;

  const completedPayments = allPaymentsData.filter(
    payment => payment && (payment.state === 'approved' || payment.state === 'authorized')
  ).length;

    const getMaxPaymentsByPlan = (plan: string, isAnnual: boolean): number => {
      if (isAnnual) {
        return 1;
      }

      const normalizedPlan = plan.toLowerCase().trim();

      if (normalizedPlan.includes('consolidación extendido') ||
          normalizedPlan.includes('consolidacion extendido')) {
        return 12;
      }
      if (normalizedPlan.includes('consolidación') || normalizedPlan.includes('consolidacion')) {
        return 6;
      }
      if (normalizedPlan.includes('crecimiento')) {
        return 3;
      }
      if (normalizedPlan.includes('inversionista')) {
        return 12;
      }
      if (normalizedPlan.includes('seguimiento inversiones') || 
          normalizedPlan.includes('seguimiento de inversiones')) {
        return 12;
      }

      return paymentsMeta?.total_count || allPaymentsData.length;
    };

    const isRecurringPlan = (plan: string): boolean => {
      const normalizedPlan = plan.toLowerCase().trim();
      return normalizedPlan.includes('inversionista') || 
             normalizedPlan.includes('consolidación extendido') ||
             normalizedPlan.includes('consolidacion extendido');
    };

  const maxPayments = getMaxPaymentsByPlan(planName, annualPayment);
  
  const displayCompletedPayments = isRecurringPlan(planName) && completedPayments > maxPayments
    ? completedPayments % maxPayments || maxPayments
    : Math.min(completedPayments, maxPayments);

  return (
    <View style={{ padding: 10 }}>
      <PlanSubscriptionCard
        planName={`Plan ${planName}`}
        totalAmount={totalAmount}
        annualPayment={annualPayment}
        nextPaymentDate={formattedNextPaymentDate}
        completedPayments={displayCompletedPayments}
        totalPayments={maxPayments}
        loading={loading}
      />

      <PaymentsCard 
        payments={paymentsData}
        paymentsMeta={paymentsMeta}
        loading={paymentsLoading}
        onPageChange={onPaymentsPageChange}
      />
    </View>
  );
};

export default SubscriptionSection;
