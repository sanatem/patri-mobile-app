import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui';
import { ChevronRight, Edit3, Circle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import type { BudgetInstance } from '@/services/budget/budget-templates/types';
import { getTranslatedNames } from '@/services/budget/utils/category-utils';

interface BudgetInstanceCardProps {
  instance: BudgetInstance;
  onPress?: () => void;
  onEdit?: (instance: BudgetInstance) => void;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
};

const getRecurrenceLabel = (recurrence: string): string => {
  switch (recurrence) {
    case 'monthly': return 'Mensual';
    case 'weekly': return 'Semanal';
    case 'yearly': return 'Anual';
    default: return recurrence;
  }
};

const getBudgetStatus = (percentage: number, overBudget: boolean) => {
  if (overBudget || percentage > 100) {
    return { color: Colors.red[500], bgColor: Colors.red[100], label: 'Excedido' };
  }
  if (percentage > 80) {
    return { color: Colors.orange[600], bgColor: Colors.orange[100], label: 'Alerta' };
  }
  if (percentage > 60) {
    return { color: Colors.orange[500], bgColor: Colors.orange[100], label: 'Alerta' };
  }
  if (percentage > 40) {
    return { color: Colors.yellow[500], bgColor: Colors.yellow[100], label: 'Precaución' };
  }
  if (percentage > 20) {
    return { color: Colors.lime[500], bgColor: Colors.lime[100], label: 'OK' };
  }
  return { color: Colors.success[500], bgColor: Colors.success[100], label: 'OK' };
};

export function BudgetInstanceCard({ instance, onPress, onEdit }: BudgetInstanceCardProps) {
  const { t, i18n } = useTranslation();
  const percentageNum = typeof instance.percentage === 'string'
    ? parseFloat(instance.percentage)
    : instance.percentage;
  const status = getBudgetStatus(percentageNum, instance.over_budget);
  const progressWidth = Math.min(percentageNum, 100);

  const categoryEmoji = instance.category?.emoji_code || '📊';
  const isIncome = instance.category?.kind === 'income';
  const translatedNames = instance.category?.name
    ? getTranslatedNames(instance.category.name, isIncome)
    : null;
  const currentLang = i18n.language as 'en' | 'es' | 'es-CL';
  const categoryName = translatedNames?.[currentLang] || translatedNames?.es || instance.category?.name || t('budget.uncategorized', 'Sin categoría');

  // Check if template is inactive
  const isDisabled = instance.template_active === false;

  const handleEditPress = (e: any) => {
    e.stopPropagation();
    onEdit?.(instance);
  };

  return (
    <TouchableOpacity onPress={isDisabled ? undefined : onPress} activeOpacity={isDisabled ? 1 : 0.7} disabled={isDisabled}>
      <Card variant="default" size="md" className="mb-2">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <Text className="text-2xl mr-2" style={{ opacity: isDisabled ? 0.5 : 1 }}>{categoryEmoji}</Text>
            <View className="flex-1">
              <View className="flex-row items-center">
                <Text className="text-base font-medium" style={{ color: isDisabled ? Colors.gray[400] : Colors.primary[500] }} numberOfLines={1}>
                  {categoryName}
                </Text>
                {!isDisabled && (
                  <Circle size={10} color={status.color} fill={status.color} style={{ marginLeft: 8 }} />
                )}
              </View>
              <Text className="text-xs font-regular" style={{ color: isDisabled ? Colors.gray[400] : Colors.gray[500] }}>
                {getRecurrenceLabel(instance.recurrence)}
              </Text>
            </View>
          </View>
          {!isDisabled && (
            <View className="flex-row items-center">
              {onEdit && (
                <TouchableOpacity
                  onPress={handleEditPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  className="mr-2"
                >
                  <Edit3 size={18} color={Colors.primary[500]} />
                </TouchableOpacity>
              )}
              <ChevronRight size={20} color={Colors.primary[500]} />
            </View>
          )}
        </View>

        <View
          style={{
            height: 8,
            backgroundColor: Colors.gray[100],
            borderRadius: 4,
            overflow: 'hidden',
            marginBottom: 4,
          }}
        >
          <View
            style={{
              height: '100%',
              width: `${progressWidth}%`,
              backgroundColor: isDisabled ? Colors.gray[300] : status.color,
              borderRadius: 4,
            }}
          />
        </View>

        <View className="flex-row justify-between">
          <Text className="text-sm font-regular" style={{ color: Colors.gray[isDisabled ? 400 : 500] }}>
            {formatCurrency(instance.spent)} / {formatCurrency(instance.amount)}
          </Text>
          <Text className="text-sm font-regular" style={{ color: isDisabled ? Colors.gray[400] : status.color }}>
            {percentageNum.toFixed(0)}%
          </Text>
        </View>

      </Card>
    </TouchableOpacity>
  );
}
