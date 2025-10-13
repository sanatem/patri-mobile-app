import React from 'react';
import { View, Text } from 'react-native';
import ModalCard from './base/ModalCard';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return (
    <ModalCard title={title}>
      {assets.length === 0 ? (
        <View style={{ paddingVertical: 24, alignItems: 'center' }}>
          <Text className="text-base font-regular text-center" style={{ color: Colors.gray[500] }}>
            {t('portfolioDetails.noAssets')}
          </Text>
        </View>
      ) : (
        <>
          {assets.map((asset, index) => (
            <View key={index} style={{
              paddingVertical: 12,
              borderBottomWidth: index !== assets.length - 1 ? 1 : 0,
              borderColor: Colors.primary[100]
            }}>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-base font-regular flex-1" style={{ color: Colors.primary[500] }}>
                  {asset.name}
                </Text>
                <Text className="text-base font-regular ml-4" style={{ color: Colors.primary[500] }}>
                  {asset.value}
                </Text>
              </View>

              <Text className="text-sm" style={{ color: Colors.gray[600] }}>
                {asset.allocation}
              </Text>
            </View>
          ))}
        </>
      )}
    </ModalCard>
  );
} 