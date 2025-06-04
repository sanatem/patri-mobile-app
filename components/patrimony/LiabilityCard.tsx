import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Liability } from '@/types';

interface LiabilityCardProps {
  liability: Liability;
}

const LiabilityCard: React.FC<LiabilityCardProps> = ({ liability }) => {
  const isPositive = liability.change < 0;

  return (
    <TouchableOpacity className="flex-row justify-between items-center py-4 px-4 border-b border-gray-200">
      <View className="flex-row items-center">
        <View
          className="rounded-lg justify-center items-center"
          style={{ backgroundColor: liability.color, width: 40, height: 40 }}
        >
          <Text className="text-white text-base font-bold">
            {liability.name.charAt(0)}
          </Text>
        </View>

        <View className="ml-3">
          <Text className="text-[16px] font-semibold text-gray-800 mb-[2px]">
            {liability.name}
          </Text>
          <Text className="text-[14px] text-gray-500 font-regular">
            {liability.type}
          </Text>
        </View>
      </View>

      {/* Derecha: valor + badge */}
      <View className="items-end">
        <Text className="text-[16px] font-semibold text-red-500 mb-[2px]">
          -${liability.value.toLocaleString('es-CL')}
        </Text>
        <View
          className={`rounded-full px-2 py-1 min-w-[50px] items-center mt-1 ${
            isPositive ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          <Text
            className={`text-[12px] font-medium ${
              isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {liability.change >= 0 ? '+' : ''}
            {liability.change}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LiabilityCard;
