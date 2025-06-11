import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';

interface InvestmentCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  amount: string;
  onPress?: () => void;
}

export function InvestmentCard({
  icon,
  title,
  subtitle,
  amount,
  onPress,
}: InvestmentCardProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-xl flex-row items-center border border-gray-200 mb-2" style={{ padding: 15}}
      onPress={onPress}
    >
      <View className="w-8 h-8 mr-3 justify-center items-center">{icon}</View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900">{title}</Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 font-regular">{subtitle}</Text>
        )}
      </View>
      <Text className="text-sm font-semibold text-gray-900 mr-1">{amount}</Text>
      <Text className="text-lg text-gray-300">›</Text>
    </TouchableOpacity>
  );
}