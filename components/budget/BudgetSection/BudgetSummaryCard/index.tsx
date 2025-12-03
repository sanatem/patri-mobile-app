import React from 'react';
import { View, Text } from 'react-native';
import { Card } from '@/components/ui';
import Colors from '@/constants/Colors';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react-native';
import type { BudgetSummary } from '@/services/budget/budget-templates/types';

interface BudgetSummaryCardProps {
  summary: BudgetSummary;
}

export function BudgetSummaryCard({ summary }: BudgetSummaryCardProps) {
  return (
    <Card variant="outlined" size="md" className="mb-4">
      <View className="flex-row justify-around">
        {/* OK / Healthy */}
        <View className="items-center">
          <Text className="text-xl font-bold mb-1" style={{ color: Colors.primary[500] }}>
            {summary.healthy_count}
          </Text>
          <CheckCircle size={20} color={Colors.success[500]} />
        </View>

        {/* Alerta / Warning */}
        <View className="items-center">
          <Text className="text-xl font-bold mb-1" style={{ color: Colors.primary[500] }}>
            {summary.warning_count}
          </Text>
          <AlertTriangle size={20} color={Colors.warning[500]} />
        </View>

        {/* Excedido / Over budget */}
        <View className="items-center">
          <Text className="text-xl font-bold mb-1" style={{ color: Colors.primary[500] }}>
            {summary.over_budget_count}
          </Text>
          <XCircle size={20} color={Colors.error[500]} />
        </View>
      </View>
    </Card>
  );
}
