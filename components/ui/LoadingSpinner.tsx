import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { cn } from '@/lib/utils';
import Colors from '@/constants/Colors';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  className?: string;
  overlay?: boolean;
}

export function LoadingSpinner({
  size = 'large',
  color = Colors.secondary[500],
  className,
  overlay = false,
}: LoadingSpinnerProps) {
  if (overlay) {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#fff',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}
      >
        <ActivityIndicator size={size} color={color} />
      </View>
    );
  }

  return (
    <View className={cn('items-center justify-center', className)}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
} 