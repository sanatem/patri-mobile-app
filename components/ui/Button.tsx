import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';
import Colors from '@/constants/Colors';

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

const buttonStyles = StyleSheet.create({
  disabled: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.gray[50],
  },
  disabledText: {
    color: Colors.gray[300],
  },
  disabledPrimary: {
    backgroundColor: Colors.gray[300],
  },
  disabledPrimaryText: {
    color: Colors.gray[500],
  },
});

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
  
  const getVariantStyles = () => {
    if (disabled) {
      if (variant === 'primary') {
        return 'bg-gray-300 text-gray-500';
      }
      return 'border border-gray-300 text-gray-400 bg-white';
    }
    
    const variants: Record<typeof variant, string> = {
      primary: 'bg-primary-500 text-white',
      outline: 'border border-primary-500 text-primary-500 bg-white',
      ghost: 'bg-transparent text-primary-500 border border-primary-500',
      disabled: 'border border-gray-300 text-gray-400 bg-white'
    };
    return variants[variant];
  };

  const getTextColor = () => {
    if (disabled) {
      if (variant === 'primary') {
        return 'text-gray-500';
      }
      return 'text-gray-300';
    }
    return variant === 'primary' ? 'text-white' : 'text-primary-500';
  };

  const getDisabledStyle = () => {
    if (!disabled) return {};
    
    if (variant === 'primary') {
      return buttonStyles.disabledPrimary;
    }
    return buttonStyles.disabled;
  };

  const getDisabledTextStyle = () => {
    if (!disabled) return {};
    
    if (variant === 'primary') {
      return buttonStyles.disabledPrimaryText;
    }
    return buttonStyles.disabledText;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={getDisabledStyle()}
      className={cn(
        baseStyles,
        getVariantStyles(),
        fullWidth && 'w-full',
        loading && 'opacity-80'
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#FF6501'} />
      ) : (
        <View className="flex-row items-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text 
            className={cn('text-base font-medium', getTextColor())}
            style={getDisabledTextStyle()}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
