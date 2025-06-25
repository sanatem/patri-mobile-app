import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui/Card';
import colors from '@/constants/Colors';

export default function PortfolioSummary({ summary }: { summary: any }) {
  return (
    <Card className="mb-4">
      <Text className="text-base font-semibold mb-2" style={{ color: colors.primary[500] }}>Resumen</Text>
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm font-medium" style={{ color: colors.gray[700] }}>Estrategia</Text>
        <Text className="text-sm font-medium" style={{ color: colors.gray[500] }}>{summary.estrategia}</Text>
      </View>
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm font-medium" style={{ color: colors.gray[700] }}>Riesgo</Text>
        <Text className="text-sm font-medium" style={{ color: colors.gray[500] }}>{summary.riesgo}</Text>
      </View>
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm font-medium" style={{ color: colors.gray[700] }}>Aportes</Text>
        <Text className="text-sm font-medium" style={{ color: colors.gray[500] }}>${summary.aportes.toLocaleString('es-CL')}</Text>
      </View>
      <View className="flex-row justify-between mb-1">
        <Text className="text-sm font-medium" style={{ color: colors.gray[700] }}>Rescates</Text>
        <Text className="text-sm font-medium" style={{ color: colors.gray[500] }}>${summary.rescates.toLocaleString('es-CL')}</Text>
      </View>
    </Card>
  );
} 