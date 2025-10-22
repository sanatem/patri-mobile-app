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
  payments: Payment[];
  loading?: boolean;
  paymentsData: Payment[];
  paymentsMeta: PaymentsPaginationMeta | null;
  paymentsLoading: boolean;
  onPaymentsPageChange: (page: number) => void;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  planName,
  totalAmount,
  annualPayment,
  nextPaymentOn,
  payments,
  loading = false,
  paymentsData,
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formattedNextPaymentDate = nextPaymentOn ? formatDate(nextPaymentOn) : null;

  const completedPayments = payments.filter(
    payment => payment && (payment.state === 'approved' || payment.state === 'authorized')
  ).length;

  return (
    <View style={{ padding: 10 }}>
      <PlanSubscriptionCard
        planName={`Plan ${planName}`}
        totalAmount={formatAmount(totalAmount)}
        annualPayment={annualPayment}
        nextPaymentDate={formattedNextPaymentDate}
        completedPayments={completedPayments}
        totalPayments={payments.length}
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
