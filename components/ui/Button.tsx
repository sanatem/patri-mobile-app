import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '@/lib/utils';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'disabled';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center h-12 rounded-2xl px-4 font-semibold';
  const variants: Record<typeof variant, string> = {
    primary: 'bg-primary-500 text-white',
    outline: 'border border-primary-500 text-primary-500 bg-white',
    ghost: 'bg-transparent text-primary-500 border border-primary-500',
    disabled: 'bg-gray-300 text-gray-500',
  };

  const textColor = variant === 'primary' ? 'text-white' : 'text-primary-500';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variants[variant],
        disabled && 'opacity-50',
        fullWidth && 'w-full',
        loading && 'opacity-80'
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#FF6501'} />
      ) : (
        <View className="flex-row items-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className={cn('text-base font-semibold', textColor)}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
