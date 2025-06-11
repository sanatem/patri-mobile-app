import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}

export function Card({
  variant = 'default',
  size = 'md',
  children,
  className,
  style,
  ...props
}: CardProps) {
  const baseStyles = 'bg-white rounded-xl font-regular';
  
  const variants = {
    default: 'border border-gray-200',
    elevated: 'shadow-sm shadow-gray-200',
    outlined: 'border-2 border-gray-200',
  };

  const sizes = {
    sm: { padding: 12 },
    md: { padding: 16 },
    lg: { padding: 24 },
  };

  return (
    <View
      className={cn(
        baseStyles,
        variants[variant],
        className
      )}
      style={[
        {
          shadowColor: variant === 'elevated' ? '#000' : undefined,
          shadowOffset: variant === 'elevated' ? { width: 0, height: 2 } : undefined,
          shadowOpacity: variant === 'elevated' ? 0.1 : undefined,
          shadowRadius: variant === 'elevated' ? 8 : undefined,
          elevation: variant === 'elevated' ? 4 : undefined,
          ...sizes[size],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
} 