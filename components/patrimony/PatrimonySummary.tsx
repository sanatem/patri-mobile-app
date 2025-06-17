import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { patrimonySummaryStyles } from '@/styles/patrimony/PatrimonySummary.styles';

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
    <LinearGradient
      colors={['#FF6503', '#E55A02', '#CC5200']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={patrimonySummaryStyles.gradient}
    >
      <Text className="text-center text-lg font-medium mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
        Patrimonio Neto
      </Text>
      <View className="flex-row items-center justify-center mb-1">
        <Text className="text-4xl font-bold text-white">
          ${netWorth.toLocaleString('es-CL')}
        </Text>
        <TouchableOpacity className="ml-2 pb-1" onPress={onToggleTooltip}>
          <ChevronDown
            size={24}
            color="#fff"
            style={showTooltip ? { transform: [{ rotate: '180deg' }] } : {}}
          />
        </TouchableOpacity>
      </View>
      {showTooltip && (
        <View className="mt-3 mb-4 self-center">
          <View className="flex-row justify-between items-center px-3 mb-1">
            <View className="flex-row items-center space-x-1">
              <ArrowUp size={16} color="#fff" />
              <Text className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Activos</Text>
            </View>
            <Text className="text-sm font-semibold text-white">
              +${totalAssets.toLocaleString('es-CL')}
            </Text>
          </View>
          <View className="flex-row justify-between items-center px-3">
            <View className="flex-row items-center space-x-1">
              <ArrowDown size={16} color="#fff" />
              <Text className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>Pasivos</Text>
            </View>
            <Text className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.8)' }}>
              -${totalLiabilities.toLocaleString('es-CL')}
            </Text>
          </View>
        </View>
      )}
      <Text className="text-center text-base font-regular mt-2" style={{ color: 'rgba(255,255,255,0.8)' }}>
        <Text className="font-semibold text-white">{changeAmount} ({changePercentage})</Text> · vs último mes
      </Text>
    </LinearGradient>
  );
} 