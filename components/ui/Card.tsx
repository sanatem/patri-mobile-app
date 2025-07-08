import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';
import Colors from '@/constants/Colors';

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
  const baseStyles = 'rounded-3xl font-regular';
  
  const variants = {
    default: `border`,
    elevated: `border`,
    outlined: `border`,
  };

  const sizes = {
    sm: { padding: 12 },
    md: { padding: 16 },
    lg: { padding: 24 },
  };

  const getVariantStyle = (variant: string) => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: Colors.light.background,
          borderColor: Colors.gray[100],
          borderWidth: 1,
        };
      case 'outlined':
        return {
          backgroundColor: Colors.light.background,
          borderColor: Colors.gray[200],
          borderWidth: 1,
        };
      default:
        return {
          backgroundColor: Colors.light.background,
          borderColor: Colors.gray[200],
          borderWidth: 1,
        };
    }
  };

  return (
    <View
      className={cn(
        baseStyles,
        variants[variant],
        className
      )}
      style={[
        getVariantStyle(variant),
        {
          shadowColor: variant === 'elevated' ? Colors.primary[900] : undefined,
          shadowOffset: variant === 'elevated' ? { width: 0, height: 2 } : undefined,
          shadowOpacity: variant === 'elevated' ? 0.08 : undefined,
          shadowRadius: variant === 'elevated' ? 8 : undefined,
          elevation: variant === 'elevated' ? 8 : undefined,
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