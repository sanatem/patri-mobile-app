import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/utils';
import Colors from '@/constants/Colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'large',
  color = Colors.primary[500],
  className,
}: LoadingSpinnerProps) {
  return (
    <View className={cn('items-center justify-center p-4', className)}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
} 