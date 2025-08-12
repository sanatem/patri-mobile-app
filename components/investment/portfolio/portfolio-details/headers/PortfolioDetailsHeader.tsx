import React from 'react';
import { View, Text } from 'react-native';
import colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

export default function PortfolioDetailsHeader({ meta }: { meta: any }) {
  const { t } = useTranslation();
  return (
    <View className="pt-6 pb-2">
      <Text className="text-xl font-medium mb-3" style={{ color: colors.primary[600] }}>
        {meta.name}
      </Text>
      <Text className="text-sm font-medium mt-2" style={{ color: colors.gray[500] }}>{t('goals.created_on')} <Text className="font-semibold">{meta.createdAt}</Text></Text>
      <Text className="text-sm font-medium mb-2" style={{ color: colors.gray[500] }}>{t('goals.reach_target')} <Text className="font-semibold">{meta.yearsRange}</Text></Text>
    </View>
  );
} 