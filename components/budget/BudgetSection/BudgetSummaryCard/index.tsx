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
      <View className="flex-row items-center" style={{ justifyContent: 'space-evenly' }}>
        <View className="items-center flex-1">
          <Text className="text-2xl font-medium mb-2" style={{ color: Colors.primary[500] }}>
            {summary.healthy_count}
          </Text>
          <CheckCircle size={24} color={Colors.success[500]} />
        </View>

        <View style={{ width: 1, height: 50, backgroundColor: Colors.gray[200] }} />

        <View className="items-center flex-1">
          <Text className="text-2xl font-medium mb-2" style={{ color: Colors.primary[500] }}>
            {summary.warning_count}
          </Text>
          <AlertTriangle size={24} color={Colors.warning[500]} />
        </View>

        <View style={{ width: 1, height: 50, backgroundColor: Colors.gray[200] }} />

        <View className="items-center flex-1">
          <Text className="text-2xl font-medium mb-2" style={{ color: Colors.primary[500] }}>
            {summary.over_budget_count}
          </Text>
          <XCircle size={24} color={Colors.error[500]} />
        </View>
      </View>
    </Card>
  );
}
