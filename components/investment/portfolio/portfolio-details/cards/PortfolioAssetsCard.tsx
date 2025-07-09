import React from 'react';
import { View, Text } from 'react-native';
import ModalCard from './base/ModalCard';

interface Asset {
  name: string;
  percentage: number;
  value: string;
  allocation: string;
}

interface PortfolioAssetsCardProps {
  title: string;
  assets: Asset[];
}

export default function PortfolioAssetsCard({ title, assets }: PortfolioAssetsCardProps) {
  return (
    <ModalCard title={title}>
      {assets.map((asset, index) => (
        <View key={index} style={{ 
          paddingVertical: 12, 
          borderBottomWidth: index !== assets.length - 1 ? 1 : 0, 
          borderColor: '#F3F4F6' 
        }}>
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-regular text-gray-700 flex-1">
              {asset.name}
            </Text>
            <Text className="text-base font-regular text-gray-700 ml-4">
              {asset.value}
            </Text>
          </View>
          
          <Text className="text-sm text-gray-600">
            {asset.allocation}
          </Text>
        </View>
      ))}
    </ModalCard>
  );
} 