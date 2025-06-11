import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { TrendingUp, Plus } from 'lucide-react-native';

interface PortfolioHeaderProps {
  patrimony: string;
  onInvestPress: () => void;
  onCreatePress: () => void;
}

export function PortfolioHeader({ 
  patrimony, 
  onInvestPress, 
  onCreatePress 
}: PortfolioHeaderProps) {
  return (
    <View className="items-center mb-8">
      <Text className="text-xl text-gray-500 mb-1">
        Tu patrimonio <Text className="text-gray-400 text-xl">ⓘ</Text>
      </Text>
      <Text className="text-xl font-bold text-gray-900 mb-4">{patrimony}</Text>

      <View className="flex-row" style={{ gap: 30 }}>
        <View className="items-center">
          <TouchableOpacity
            className="rounded-full justify-center items-center mb-2"
            style={{ backgroundColor: '#FF5603', width: 35, height: 35 }}
            onPress={onInvestPress}
          >
            <TrendingUp size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-primary-500 font-semibold text-sm">Invertir</Text>
        </View>

        <View className="items-center">
          <TouchableOpacity
            className="rounded-full justify-center items-center mb-2"
            style={{ backgroundColor: '#FF5603', width: 35, height: 35 }}
            onPress={onCreatePress}
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
          <Text className="text-primary-500 font-semibold text-sm">Crear</Text>
        </View>
      </View>
    </View>
  );
}