import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Liability } from '@/types';
import Colors from '@/constants/Colors';
import { SkeletonBase } from '@/components/ui/SkeletonBase';

interface LiabilityCardProps {
  liability: Liability;
  showSkeleton?: boolean;
}

const LiabilityCard: React.FC<LiabilityCardProps> = ({ liability, showSkeleton = false }) => {
  const isPositive = liability.change < 0;

  if (showSkeleton) {
    return (
      <View className="flex-row justify-between items-center py-4 px-4 border-b" style={{ borderBottomColor: Colors.primary[100] }}>
        <View className="flex-row items-center">
          {/* Skeleton para el icono */}
          <SkeletonBase
            rows={1}
            rowHeight={40}
            rowWidth={40}
            height={40}
            width={40}
            x={0}
            y={0}
            borderRadius={8}
          />

          <View className="ml-3">
            {/* Skeleton para el título */}
            <SkeletonBase
              rows={1}
              rowHeight={16}
              rowWidth={120}
              height={16}
              width={120}
              x={0}
              y={0}
              borderRadius={4}
            />
            {/* Skeleton para el subtítulo */}
            <SkeletonBase
              rows={1}
              rowHeight={14}
              rowWidth={80}
              height={14}
              width={80}
              x={0}
              y={20}
              borderRadius={4}
            />
          </View>
        </View>

        <View className="items-end">
          {/* Skeleton para el valor */}
          <SkeletonBase
            rows={1}
            rowHeight={16}
            rowWidth={80}
            height={16}
            width={80}
            x={0}
            y={0}
            borderRadius={4}
          />
          {/* Skeleton para el badge */}
          <SkeletonBase
            rows={1}
            rowHeight={20}
            rowWidth={50}
            height={20}
            width={50}
            x={0}
            y={20}
            borderRadius={10}
          />
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity className="flex-row justify-between items-center py-4 px-4 border-b" style={{ borderBottomColor: Colors.primary[100] }}>
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
