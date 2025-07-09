import React from 'react';
import { View, Text } from 'react-native';
import ModalCard from './base/ModalCard';
import Colors from '@/constants/Colors';

interface SummaryItem {
  title: string;
  value: string;
  description?: string;
}

interface PortfolioSummaryCardProps {
  title: string;
  summary: SummaryItem[];
}

export default function PortfolioSummaryCard({ title, summary }: PortfolioSummaryCardProps) {
  return (
    <ModalCard title={title}>
      {summary.map((item, index) => (
        <View key={index} style={{ 
          paddingVertical: 12, 
          borderBottomWidth: index !== summary.length - 1 ? 1 : 0, 
          borderColor: Colors.primary[100] 
        }}>
          <View className="flex-row justify-between items-start">
            <Text className="text-base font-regular flex-1" style={{ color: Colors.primary[500] }}>
              {item.title}
            </Text>
            <Text className="text-base font-regular ml-4" style={{ color: Colors.primary[500] }}>
              {item.value}
            </Text>
          </View>
          {item.description && (
            <Text className="text-sm mt-1" style={{ color: Colors.gray[600] }}>
              {item.description}
            </Text>
          )}
        </View>
      ))}
    </ModalCard>
  );
} 