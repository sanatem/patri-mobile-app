import React, { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Payment } from '@/services/planning/subscription/get-subscription';
import PlanSubscriptionCard from './PlanSubscriptionCard';
import PaymentsCard from './PaymentsCard';
import { Pagination } from '@/components/ui/Pagination';

interface SubscriptionSectionProps {
  planName: string;
  totalAmount: number;
  annualPayment: boolean;
  nextPaymentOn: string | null;
  payments: Payment[];
  loading?: boolean;
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  planName,
  totalAmount,
  annualPayment,
  nextPaymentOn,
  payments,
  loading = false
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const PAYMENTS_PER_PAGE = 3;

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

  const formatPaymentDate = (dateString: string) => {
    const [year, month, day] = dateString.split('T')[0].split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPaymentStateLabel = (state: Payment['state']) => {
    return t(`planning.subscription.paymentStates.${state}`);
  };

  const formattedNextPaymentDate = nextPaymentOn ? formatDate(nextPaymentOn) : null;

  const paymentsData = payments
    .filter(payment => payment != null)
    .map(payment => ({
      amount: formatAmount(payment.amount),
      date: formatPaymentDate(payment.approved_at),
      state: payment.state,
      stateLabel: getPaymentStateLabel(payment.state),
    }));

  const completedPayments = payments.filter(
    payment => payment && (payment.state === 'approved' || payment.state === 'authorized')
  ).length;

  const totalPages = Math.ceil(paymentsData.length / PAYMENTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PAYMENTS_PER_PAGE;
  const endIndex = startIndex + PAYMENTS_PER_PAGE;
  const paginatedPayments = paymentsData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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

      <PaymentsCard payments={paginatedPayments} loading={loading} />
      
      {!loading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </View>
  );
};

export default SubscriptionSection;
