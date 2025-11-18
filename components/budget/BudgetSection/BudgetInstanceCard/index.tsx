import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface BudgetInstance {
  id: number;
  budget_template_id: number;
  start_date: string;
  end_date: string;
  amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage: number;
  over_budget: boolean;
  category: {
    id: number;
    name: string;
    kind: string;
    emoji_code: string;
  };
  recurrence: string;
}

interface BudgetInstanceCardProps {
  instance: BudgetInstance;
  onPress?: () => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
};

const getBudgetStatus = (percentage: number, overBudget: boolean) => {
  if (overBudget || percentage >= 100) {
    return {
      color: Colors.error[500],
      bgColor: Colors.error[100],
      label: 'Excedido',
    };
  }
  if (percentage >= 80) {
    return {
      color: Colors.warning[500],
      bgColor: Colors.warning[100],
      label: 'Alerta',
    };
  }
  if (percentage >= 50) {
    return {
      color: Colors.warning[600],
      bgColor: Colors.warning[50],
      label: 'Precaución',
    };
  }
  return {
    color: Colors.success[500],
    bgColor: Colors.success[100],
    label: 'OK',
  };
};

export function BudgetInstanceCard({ instance, onPress }: BudgetInstanceCardProps) {
  const status = getBudgetStatus(instance.percentage, instance.over_budget);
  const progressWidth = Math.min(instance.percentage, 100);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" size="md" className="mb-3">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-2">{instance.category.emoji_code}</Text>
            <Text className="text-base font-medium text-gray-800" numberOfLines={1}>
              {instance.category.name}
            </Text>
          </View>
          <ChevronRight size={20} color={Colors.gray[400]} />
        </View>

        <View className="mb-3">
          <View className="flex-row justify-between mb-1">
            <Text className="text-sm text-gray-600">
              {formatCurrency(instance.spent_amount)} / {formatCurrency(instance.amount)}
            </Text>
            <Text className="text-sm font-medium" style={{ color: status.color }}>
              {instance.percentage.toFixed(0)}%
            </Text>
          </View>

          {/* Progress Bar */}
          <View
            style={{
              height: 8,
              backgroundColor: Colors.gray[100],
              borderRadius: 4,
              overflow: 'hidden'
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${progressWidth}%`,
                backgroundColor: status.color,
                borderRadius: 4,
              }}
            />
          </View>
        </View>

        <View className="flex-row justify-between items-center">
          {instance.over_budget ? (
            <Text className="text-sm" style={{ color: Colors.error[500] }}>
              Excedido: {formatCurrency(Math.abs(instance.remaining_amount))}
            </Text>
          ) : (
            <Text className="text-sm text-gray-600">
              Restante: {formatCurrency(instance.remaining_amount)}
            </Text>
          )}

          <View
            style={{
              backgroundColor: status.bgColor,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 4
            }}
          >
            <Text className="text-xs font-medium" style={{ color: status.color }}>
              {status.label}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}
