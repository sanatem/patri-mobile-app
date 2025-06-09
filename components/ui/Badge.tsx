import React from 'react';
import { View, Text } from 'react-native';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  const baseStyles = 'rounded-full items-center justify-center';
  
  const variants = {
    default: 'bg-gray-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
    info: 'bg-blue-100',
  };

  const textVariants = {
    default: 'text-gray-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
    info: 'text-blue-700',
  };

  const sizes = {
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
    lg: 'px-4 py-2',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <View
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
    >
      <Text
        className={cn(
          'font-medium',
          textVariants[variant],
          textSizes[size]
        )}
      >
        {children}
      </Text>
    </View>
  );
} 