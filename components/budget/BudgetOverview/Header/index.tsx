import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { Header as UIHeader } from '@/components/ui';
import Colors from '@/constants/Colors';

interface BudgetHeaderProps {
  title: string;
  onSyncPress: () => void;
}

export function BudgetHeader({ title, onSyncPress }: BudgetHeaderProps) {
  return (
    <UIHeader
      title={title}
      rightAction={
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onSyncPress}
            className="mr-3"
          >
            <RefreshCw size={24} color={Colors.primary[500]} />
          </TouchableOpacity>
        </View>
      }
    />
  );
}
