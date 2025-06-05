import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Asset } from '@/types';
import { twMerge } from 'tailwind-merge';
import Colors from '@/constants/Colors';
interface AssetCardProps {
  asset: Asset;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const isPositive = asset.change >= 0;

  return (
    <TouchableOpacity className="flex-row justify-between items-center py-4 px-4 border-b border-gray-200"
    style={{ borderBottomWidth: 1, borderBottomColor: Colors.gray[200] }}
    >
      <View className="flex-row items-center flex-1">
        <View
          className="rounded-xl justify-center items-center"
          style={{ backgroundColor: asset.color, width: 40, height: 40 }}
        >
          <Text className="text-white text-base font-semibold">
            {asset.name.charAt(0)}
          </Text>
        </View>

        <View className="ml-4">
          <Text className="text-[15px] font-semibold text-gray-900">
            {asset.name}
          </Text>
          <Text className="text-sm text-gray-500 font-regular">
            {asset.type}
          </Text>
        </View>
      </View>

      <View className="items-end">
        <Text className="text-[15px] font-semibold text-error-500">
          -${Math.abs(asset.value).toLocaleString('es-CL')}
        </Text>

        <View
          className={twMerge(
            'px-2 py-[2px] rounded-full mt-1',
            isPositive ? 'bg-success-500' : 'bg-error-100'
          )}
        >
          <Text
            className={twMerge(
              'text-xs font-medium',
              isPositive ? 'text-success-500' : 'text-error-500'
            )}
          >
            {isPositive ? '+' : ''}
            {asset.change}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default AssetCard;
