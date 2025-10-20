import React from 'react';
import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { Card } from '@/components/ui';
import { SkeletonBase } from '@/components/ui/SkeletonBase';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface PlanSubscriptionCardProps {
  planName: string;
  totalAmount: string;
  annualPayment: boolean;
  nextPaymentDate: string | null;
  completedPayments: number;
  totalPayments: number;
  loading?: boolean;
}

const PlanSubscriptionCard: React.FC<PlanSubscriptionCardProps> = ({
  planName,
  totalAmount,
  annualPayment,
  nextPaymentDate,
  completedPayments,
  totalPayments,
  loading = false,
}) => {
  const { t } = useTranslation();
  const progressPercentage = totalPayments > 0 ? (completedPayments / totalPayments) * 100 : 0;

  if (loading) {
    return (
      <Card variant="elevated" className="mb-6">
        <View className="py-4 px-4">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
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
            <SkeletonBase
              width={80}
              height={20}
              x={0}
              y={0}
              rows={1}
              rowHeight={20}
              rowWidth={80}
              borderRadius={4}
            />
          </View>
          <View className="w-full mb-4" style={{ backgroundColor: Colors.gray[100], height: 0.5 }} />

          <SkeletonBase
            width={280}
            height={16}
            x={0}
            y={0}
            rows={2}
            rowHeight={16}
            rowWidth={i => (i === 0 ? 280 : 240)}
            borderRadius={4}
            style={{ marginBottom: 16 }}
          />

          <SkeletonBase
            width={100}
            height={16}
            x={0}
            y={0}
            rows={1}
            rowHeight={16}
            rowWidth={100}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />
          <SkeletonBase
            width={280}
            height={8}
            x={0}
            y={0}
            rows={1}
            rowHeight={8}
            rowWidth={280}
            borderRadius={4}
          />
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" className="mb-6">
      <View className="py-4 px-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center flex-1">
            <View 
              className="rounded-full mr-3 justify-center items-center"
              style={{ 
                backgroundColor: Colors.primary[50],
                width: 40,
                height: 40
              }}
            >
              <Star size={20} color={Colors.primary[600]} />
            </View>
            <Text className="text-lg font-medium" style={{ color: Colors.primary[600] }}>
              {planName}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-lg font-medium" style={{ color: Colors.primary[600] }}>
              {totalAmount}
            </Text>
            <Text className="text-xs font-medium ml-1.5" style={{ color: Colors.gray[500], marginTop: 2 }}>
              {annualPayment ? '/año' : t('common.per_month')}
            </Text>
          </View>
        </View>
        <View className="w-full mb-4" style={{ backgroundColor: Colors.gray[200], height: 0.5 }} />

        {nextPaymentDate ? (
          <Text className="text-sm font-regular leading-6 mb-4" style={{ color: Colors.gray[600] }}>
            {t('planning.subscription.nextPayment')}{' '}
            <Text className="font-medium" style={{ color: Colors.primary[600] }}>
              {nextPaymentDate}
            </Text>
          </Text>
        ) : (
          <Text className="text-sm font-regular leading-6 mb-4" style={{ color: Colors.gray[600] }}>
            {t('planning.subscription.noNextPayment')}
          </Text>
        )}

        <View>
          <Text className="text-sm font-medium mb-2" style={{ color: Colors.primary[600] }}>
            {completedPayments} {t('planning.subscription.of')} {totalPayments} {t('planning.subscription.payments')}
          </Text>
          <View 
            style={{
              width: '100%',
              height: 8,
              backgroundColor: Colors.gray[200],
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            <View 
              style={{
                width: `${progressPercentage}%`,
                height: '100%',
                backgroundColor: Colors.secondary[500],
                borderRadius: 4,
              }}
            />
          </View>
        </View>
      </View>
    </Card>
  );
};

export default PlanSubscriptionCard;

