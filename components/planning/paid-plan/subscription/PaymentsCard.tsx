import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { Card } from '@/components/ui';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import { Pagination } from '@/components/ui/Pagination';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { Payment, PaymentsPaginationMeta } from '@/services/planning/subscription/get-subscription';

type PaymentState = 'approved' | 'pending' | 'rejected' | 'authorized' | 'cancelled' | 'refund';

interface PaymentsCardProps {
  payments: Payment[];
  paymentsMeta: PaymentsPaginationMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
}

const PaymentsCard: React.FC<PaymentsCardProps> = ({ 
  payments, 
  paymentsMeta, 
  loading, 
  onPageChange 
}) => {
  const { t } = useTranslation();

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

  const getPaymentStateLabel = (state: PaymentState) => {
    return t(`planning.subscription.paymentStates.${state}`);
  };

  const getStateConfig = (state: PaymentState) => {
    switch (state) {
      case 'approved':
      case 'authorized':
        return {
          icon: <CheckCircle size={16} color="#FFFFFF" />,
          badgeBgColor: Colors.success[500],
          badgeTextColor: '#FFFFFF',
        };
      case 'rejected':
      case 'cancelled':
        return {
          icon: <XCircle size={16} color="#FFFFFF" />,
          badgeBgColor: Colors.error[500],
          badgeTextColor: '#FFFFFF',
        };
      case 'pending':
        return {
          icon: <Clock size={16} color="#FFFFFF" />,
          badgeBgColor: Colors.gray[300],
          badgeTextColor: '#FFFFFF',
        };
      case 'refund':
        return {
          icon: <CheckCircle size={16} color="#FFFFFF" />,
          badgeBgColor: Colors.warning[600],
          badgeTextColor: '#FFFFFF',
        };
      default:
        return {
          icon: <Clock size={16} color="#FFFFFF" />,
          badgeBgColor: Colors.gray[500],
          badgeTextColor: '#FFFFFF',
        };
    }
  };

  const formattedPayments = (payments || []).map(payment => ({
    amount: formatAmount(payment.amount),
    date: formatPaymentDate(payment.created_at),
    state: payment.state,
    stateLabel: getPaymentStateLabel(payment.state),
  }));

  const handlePageChange = (page: number) => {
    onPageChange(page);
  };

  if (loading) {
    return (
      <Card variant="elevated" className="mb-2">
        <View className="py-4 px-4">
          <View className="flex-row items-center mb-4">
            <SkeletonBase
              width={40}
              height={40}
              x={0}
              y={0}
              rows={1}
              rowHeight={40}
              rowWidth={40}
              borderRadius={20}
              style={{ marginRight: 12 }}
            />
            <SkeletonBase
              width={120}
              height={20}
              x={0}
              y={0}
              rows={1}
              rowHeight={20}
              rowWidth={120}
              borderRadius={4}
            />
          </View>

          <View className="w-full mb-4" style={{ backgroundColor: Colors.gray[100], height: 0.5 }} />

          <View>
            {[1, 2, 3].map((item, index) => (
              <View key={item}>
                <View className="flex-row items-center justify-between py-3">
                  <View className="flex-1">
                    <SkeletonBase
                      width={100}
                      height={18}
                      x={0}
                      y={0}
                      rows={1}
                      rowHeight={18}
                      rowWidth={100}
                      borderRadius={4}
                      style={{ marginBottom: 8 }}
                    />
                    <SkeletonBase
                      width={140}
                      height={16}
                      x={0}
                      y={0}
                      rows={1}
                      rowHeight={16}
                      rowWidth={140}
                      borderRadius={4}
                    />
                  </View>

                  <SkeletonBase
                    width={80}
                    height={28}
                    x={0}
                    y={0}
                    rows={1}
                    rowHeight={28}
                    rowWidth={80}
                    borderRadius={14}
                  />
                </View>
                
                {index < 2 && (
                  <View className="w-full my-2" style={{ backgroundColor: Colors.gray[100], height: 1 }} />
                )}
              </View>
            ))}
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="mb-2">
      <View className="py-4 px-4">
        <View className="flex-row items-center mb-4">
          <View className="flex-1">
            <Text className="text-lg font-medium" style={{ color: Colors.primary[600] }}>
              {t('planning.subscription.paymentsTitle')}
            </Text>
          </View>
        </View>

        <View className="w-full mb-4" style={{ backgroundColor: Colors.gray[200], height: 0.5 }} />

        {formattedPayments.length === 0 ? (
          <View className="py-6">
            <Text className="text-sm text-center font-regular" style={{ color: Colors.gray[500] }}>
              {t('planning.subscription.noPayments')}
            </Text>
          </View>
        ) : (
          <View>
            {formattedPayments.map((payment, index) => {
              const config = getStateConfig(payment.state);
              const isLast = index === formattedPayments.length - 1;

              return (
                <View key={index}>
                  <View className="flex-row items-center justify-between py-3">
                    <View className="flex-1">
                      <Text className="text-base font-medium mb-1" style={{ color: Colors.primary[600] }}>
                        {payment.amount}
                      </Text>
                      <Text className="text-sm font-regular" style={{ color: Colors.gray[600] }}>
                        {payment.date}
                      </Text>
                    </View>

                    <View 
                      className="px-3 py-1.5 rounded-full flex-row items-center"
                      style={{ backgroundColor: config.badgeBgColor }}
                    >
                      <View className="mr-1">
                        {config.icon}
                      </View>
                      <Text 
                        className="text-xs font-medium"
                        style={{ color: config.badgeTextColor }}
                      >
                        {payment.stateLabel}
                      </Text>
                    </View>
                  </View>
                  
                  {!isLast && (
                    <View className="w-full my-2" style={{ backgroundColor: Colors.gray[100], height: 1 }} />
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {!loading && paymentsMeta && paymentsMeta.total_pages > 1 && (
        <View className="mt-2">
          <Pagination
            currentPage={paymentsMeta.current_page}
            totalPages={paymentsMeta.total_pages}
            onPageChange={handlePageChange}
          />
        </View>
      )}
    </Card>
  );
};

export default PaymentsCard;

