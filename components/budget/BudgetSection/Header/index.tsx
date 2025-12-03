import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Header as UIHeader } from '@/components/ui';
import Colors from '@/constants/Colors';

interface BudgetHeaderProps {
  title: string;
  subtitle?: string;
  onPlusPress?: () => void;
}

export function BudgetHeader({ title, subtitle, onPlusPress }: BudgetHeaderProps) {
  return (
    <UIHeader
      title={title}
      subtitle={subtitle}
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
  );
}
