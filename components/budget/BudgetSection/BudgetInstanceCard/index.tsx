import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui';
import { ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import type { BudgetInstance } from '@/services/budget/budget-templates/types';

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
    return { color: Colors.error[500], bgColor: Colors.error[100], label: 'Excedido', emoji: '🔴' };
  }
  if (percentage >= 80) {
    return { color: Colors.warning[500], bgColor: Colors.warning[100], label: 'Alerta', emoji: '🟠' };
  }
  if (percentage >= 60) {
    return { color: Colors.yellow[500], bgColor: Colors.yellow[100], label: 'Precaucion', emoji: '🟡' };
  }
  return { color: Colors.success[500], bgColor: Colors.success[100], label: 'OK', emoji: '🟢' };
};

export function BudgetInstanceCard({ instance, onPress }: BudgetInstanceCardProps) {
  const { t } = useTranslation();
  const percentageNum = typeof instance.percentage === 'string'
    ? parseFloat(instance.percentage)
    : instance.percentage;
  const status = getBudgetStatus(percentageNum, instance.over_budget);
  const progressWidth = Math.min(percentageNum, 100);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="default" size="md" className="mb-3">
        {/* Header: Emoji + Nombre */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-2">{instance.category.emoji_code}</Text>
            <Text className="text-base font-medium text-gray-800" numberOfLines={1}>
              {instance.category.name}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="mr-1">{status.emoji}</Text>
            {instance.over_budget && <AlertTriangle size={16} color={Colors.error[500]} className="mr-1" />}
            <ChevronRight size={20} color={Colors.gray[400]} />
          </View>
        </View>

        {/* Monto gastado / presupuesto */}
        <View className="flex-row justify-between mb-1">
          <Text className="text-sm text-gray-600">
            {formatCurrency(instance.spent)} / {formatCurrency(instance.amount)}
          </Text>
          <Text className="text-sm font-semibold" style={{ color: status.color }}>
            {percentageNum.toFixed(0)}%
          </Text>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            height: 8,
            backgroundColor: Colors.gray[100],
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 8,
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

        {/* Estado: Restante o Excedido */}
        <View className="flex-row items-center">
          {instance.over_budget ? (
            <>
              <AlertTriangle size={14} color={Colors.error[500]} />
              <Text className="text-sm ml-1" style={{ color: Colors.error[500] }}>
                {t('budget.exceeded_by', 'Excedido por')} {formatCurrency(instance.remaining)}
              </Text>
            </>
          ) : (
            <>
              <CheckCircle size={14} color={Colors.success[500]} />
              <Text className="text-sm ml-1 text-gray-600">
                {t('budget.remaining_amount', 'Quedan')} {formatCurrency(instance.remaining)}
              </Text>
            </>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}
