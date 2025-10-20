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
  endDate: string | null;
  payments: Payment[];
}

const SubscriptionSection: React.FC<SubscriptionSectionProps> = ({
  planName,
  totalAmount,
  annualPayment,
  endDate,
  payments
}) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const PAYMENTS_PER_PAGE = 3;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return t('planning.subscription.unlimited');

    const date = new Date(dateString);
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
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPaymentStateLabel = (state: Payment['state']) => {
    return t(`planning.subscription.paymentStates.${state}`);
  };

  const planDescription = endDate
    ? t('planning.subscription.benefitsUntil', { date: formatDate(endDate) })
    : t('planning.subscription.unlimitedBenefits');

  const paymentsData = payments
    .filter(payment => payment != null)
    .map(payment => ({
      amount: formatAmount(payment.amount),
      date: formatPaymentDate(payment.approved_at),
      state: payment.state,
      stateLabel: getPaymentStateLabel(payment.state),
    }));

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
        description={planDescription}
      />

      <PaymentsCard payments={paginatedPayments} />
      
      {totalPages > 1 && (
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
