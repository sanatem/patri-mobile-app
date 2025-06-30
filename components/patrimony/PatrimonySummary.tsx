import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { patrimonySummaryStyles } from '@/styles/patrimony/PatrimonySummary.styles';
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
    <View style={{ marginTop: 2, marginBottom: 20, marginHorizontal: 10, padding: 2, }}>
      <Text className="text-center text-lg font-medium mb-2" style={{ color: Colors.gray[700] }}>
        Patrimonio Neto
      </Text>
      <View className="flex-row items-center justify-center mb-1">
        <Text className="text-4xl font-bold" style={{ color: Colors.gray[800] }}>
          ${netWorth.toLocaleString('es-CL')}
        </Text>
        <TouchableOpacity className="ml-2 pb-1" onPress={onToggleTooltip}>
          <ChevronDown
            size={24}
            color={Colors.primary[500]}
            style={showTooltip ? { transform: [{ rotate: '180deg' }] } : {}}
          />
        </TouchableOpacity>
      </View>
      {showTooltip && (
        <View className="mt-3 mb-4 self-center">
          <View className="flex-row justify-between items-center px-3 mb-1">
            <View className="flex-row items-center space-x-1">
              <ArrowUp size={16} color={Colors.primary[500]} />
              <Text className="text-sm font-medium" style={{ color: Colors.gray[500] }}>Activos</Text>
            </View>
            <Text className="text-sm font-medium" style={{ color: Colors.success[500] }}>
              +${totalAssets.toLocaleString('es-CL')}
            </Text>
          </View>
          <View className="flex-row justify-between items-center px-3">
            <View className="flex-row items-center space-x-1">
              <ArrowDown size={16} color={Colors.primary[500]} />
                <Text className="text-sm font-medium" style={{ color: Colors.gray[500] }}>Pasivos </Text>
            </View>
            <Text className="text-sm font-medium" style={{ color: Colors.error[500] }}>
               -${totalLiabilities.toLocaleString('es-CL')}
            </Text>
          </View>
        </View>
      )}
      <Text className="text-center text-base font-regular mt-2" style={{ color: Colors.gray[500] }}>
        <Text className="font-semibold" style={{ color: Colors.gray[500] }}>{changeAmount} ({changePercentage})</Text> · vs último mes
      </Text>
    </View>
  );
} 