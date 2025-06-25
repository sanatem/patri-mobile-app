import React from 'react';
import { View, Text } from 'react-native';

export default function PortfolioProgress({ meta }: { meta: any }) {
  return (
    <View className="pb-4">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-3xl font-bold text-gray-900">${meta.current.toLocaleString('es-CL')} <Text className="text-xs font-normal text-gray-400">{meta.currency}</Text></Text>
      </View>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-xs text-gray-500">{(meta.progress * 100).toFixed(2)}% de ${meta.goal.toLocaleString('es-CL')} al {meta.goalDate}</Text>
      </View>
      <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <View style={{ width: `${meta.progress * 100}%` }} className="h-2 bg-primary-500 rounded-full" />
      </View>
    </View>
  );
} 