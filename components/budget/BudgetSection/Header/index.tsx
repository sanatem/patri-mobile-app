import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Header as UIHeader } from '@/components/ui';
import Colors from '@/constants/Colors';

interface BudgetHeaderProps {
  title: string;
  subtitle?: string;
  onPlusPress?: () => void;
  onPreviousMonth?: () => void;
  onNextMonth?: () => void;
  isCurrentMonth?: boolean;
}

export function BudgetHeader({
  title,
  subtitle,
  onPlusPress,
  onPreviousMonth,
  onNextMonth,
  isCurrentMonth = false,
}: BudgetHeaderProps) {
  const showMonthNavigation = onPreviousMonth && onNextMonth;

  const monthNavigator = showMonthNavigation ? (
    <View className="flex-row items-center justify-center">
      <TouchableOpacity
        onPress={onPreviousMonth}
        className="p-1"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <ChevronLeft className="mt-5" size={24} color={Colors.primary[500]} />
      </TouchableOpacity>
      <Text
        className="text-lg font-medium mx-2 mt-5"
        style={{ color: Colors.primary[500], minWidth: 130, textAlign: 'center' }}
      >
        {subtitle}
      </Text>
      <TouchableOpacity
        onPress={onNextMonth}
        className="p-1"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        disabled={isCurrentMonth}
        style={{ opacity: isCurrentMonth ? 0.3 : 1 }}
      >
        <ChevronRight className="mt-5" size={24} color={Colors.primary[500]} />
      </TouchableOpacity>
    </View>
  ) : null;

  return (
    <View>
      <UIHeader
        title={title}
        subtitle={showMonthNavigation ? undefined : subtitle}
        rightAction={
          onPlusPress ? (
            <View className="flex-row items-center">
              <TouchableOpacity onPress={onPlusPress} className="mr-3">
                <Plus size={24} color={Colors.primary[500]} />
              </TouchableOpacity>
            </View>
          ) : undefined
        }
      />
      {monthNavigator && (
        <View className="items-center pb-2" style={{ marginTop: -8 }}>
          {monthNavigator}
        </View>
      )}
    </View>
  );
}
