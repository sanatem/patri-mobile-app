import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';

interface DetailItem {
  label: string;
  value: string;
  subtitle?: string;
}

interface InvestmentDetailsSectionProps {
  details: DetailItem[];
}

export function InvestmentDetailsSection({ details }: InvestmentDetailsSectionProps) {
  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-3">Cómo está invertida</Text>
      
      {details.map((item, index) => (
        <Card key={index} className="mb-3 mt-3">
          <Text className="text-sm text-gray-500 mb-1 font-regular">{item.label}</Text>
          <Text className="text-base font-semibold text-gray-900">{item.value}</Text>
          {item.subtitle && (
            <Text className="text-xs text-gray-400 mt-1 font-regular">{item.subtitle}</Text>
          )}
        </Card>
      ))}
    </View>
  );
}