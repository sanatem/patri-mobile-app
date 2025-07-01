import React from 'react';
import { View, Text } from 'react-native';
import colors from '@/constants/Colors';

export default function PortfolioDetailsHeader({ meta }: { meta: any }) {
  return (
    <View className="pt-6 pb-2">
      <Text className="text-xl font-medium mb-3" style={{ color: colors.primary[700] }}>
        {meta.name}
      </Text>
      <Text className="text-sm font-medium mt-2" style={{ color: colors.gray[500] }}>Creaste tu meta el <Text className="font-semibold">{meta.createdAt}</Text></Text>
      <Text className="text-sm font-medium mb-2" style={{ color: colors.gray[500] }}>Quieres alcanzar tu meta <Text className="font-semibold">{meta.yearsRange}</Text></Text>
    </View>
  );
} 