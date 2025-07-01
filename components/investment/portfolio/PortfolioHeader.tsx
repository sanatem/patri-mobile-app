import React from 'react';
import { View, Text } from 'react-native';
import Colors from '@/constants/Colors';

interface PortfolioHeaderProps {
  patrimony: string;
}

export function PortfolioHeader({ patrimony }: PortfolioHeaderProps) {
  return (
    <View className="bg-gray-100 rounded-lg p-4">
      <Text className="text-center text-base font-medium mb-2" style={{ color: Colors.gray[500] }}>
        Patrimonio Neto
      </Text>
      <Text className="text-center text-4xl font-semibold mb-6" style={{ color: Colors.gray[700], letterSpacing: 1 }}>
        {patrimony}
      </Text>
    </View>
  );
}