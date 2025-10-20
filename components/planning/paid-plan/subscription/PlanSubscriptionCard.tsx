import React from 'react';
import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { Card } from '@/components/ui';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

interface PlanSubscriptionCardProps {
  planName: string;
  totalAmount: string;
  annualPayment: boolean;
  description: string;
}

const PlanSubscriptionCard: React.FC<PlanSubscriptionCardProps> = ({
  planName,
  totalAmount,
  annualPayment,
  description,
}) => {
  const { t } = useTranslation();

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
        <View className="w-full mb-4" style={{ backgroundColor: Colors.gray[200], height: 1 }} />

        <Text className="text-sm font-regular leading-6" style={{ color: Colors.gray[600] }}>
          {description}
        </Text>
      </View>
    </Card>
  );
};

export default PlanSubscriptionCard;

