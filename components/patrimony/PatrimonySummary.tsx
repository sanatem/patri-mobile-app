import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface PatrimonySummaryProps {
  netWorth: number;
  totalAssets: number;
  totalLiabilities: number;
  showTooltip: boolean;
  onToggleTooltip: () => void;
  changeAmount?: string;
  changePercentage?: string;
}

export function PatrimonySummary({
  netWorth,
  totalAssets,
  totalLiabilities,
  showTooltip,
  onToggleTooltip,
  changeAmount = '$7,151,936',
  changePercentage = '71.52%',
}: PatrimonySummaryProps) {
  return (
    <View className="items-center mb-6">
      <Text className="text-center text-gray-600 text-lg font-medium mb-2">
        Patrimonio Neto
      </Text>
      
      <View className="flex-row items-center justify-center mb-1">
        <Text className="text-3xl font-bold text-green-600">
          ${netWorth.toLocaleString('es-CL')}
        </Text>
        <TouchableOpacity className="ml-2 pb-1" onPress={onToggleTooltip}>
          <ChevronDown
            size={20}
            color={Colors.gray[500]}
            style={showTooltip ? { transform: [{ rotate: '180deg' }] } : {}}
          />
        </TouchableOpacity>
      </View>

      {showTooltip && (
        <View className="mt-3 mb-4 self-center">
          <View className="flex-row justify-between items-center px-3 mb-1">
            <View className="flex-row items-center space-x-1">
              <ArrowUp size={16} color={Colors.success[500]} />
              <Text className="text-sm font-medium text-gray-600">Activos</Text>
            </View>
            <Text className="text-sm font-semibold text-green-600">
              +${totalAssets.toLocaleString('es-CL')}
            </Text>
          </View>
          <View className="flex-row justify-between items-center px-3">
            <View className="flex-row items-center space-x-1">
              <ArrowDown size={16} color={Colors.error[500]} />
              <Text className="text-sm font-medium text-gray-600">Pasivos</Text>
            </View>
            <Text className="text-sm font-semibold text-red-600">
              -${totalLiabilities.toLocaleString('es-CL')}
            </Text>
          </View>
        </View>
      )}

      <Text className="text-center text-sm text-gray-500 font-regular">
        <Text className="font-medium">{changeAmount} ({changePercentage})</Text> · vs último mes
      </Text>
    </View>
  );
} 