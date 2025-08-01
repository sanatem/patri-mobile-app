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
  icon?: React.ReactElement | null | undefined;
  className?: string;
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
  disabledOutlineText: {
    color: Colors.gray[300],
  },
  disabledOutline: {
    borderColor: Colors.gray[300],
    backgroundColor: 'white',
  },
});

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon = null,
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center h-12 rounded-full px-4 font-semibold';
  
  const getVariantStyles = () => {
    if (disabled) {
      if (variant === 'primary') {
        return 'bg-gray-200 text-gray-300 rounded-full border border-gray-200';
      }
      return 'border border-gray-200 text-gray-300 bg-gray-100 rounded-full';
    }
    if (disabled) {
      if (variant === 'outline') {
        return 'border border-gray-200 text-gray-300 rounded-full';
      }
      return 'text-gray-500 rounded-full border border-gray-300';
    }
    
    const variants: Record<typeof variant, string> = {
      primary: 'bg-primary-500 text-white rounded-full',
      outline: 'border border-primary-500 text-primary-500 bg-white rounded-full',
      ghost: 'bg-transparent text-primary-500 underline',
      disabled: 'border border-gray-300 text-gray-400 bg-white rounded-full'
    };
    return variants[variant];
  };

  const getTextColor = () => {
    if (disabled) {
      if (variant === 'primary') {
        return 'text-gray-500';
      }
      if (variant === 'outline') {
        return 'text-gray-300';
      }
    }
    return variant === 'primary' ? 'text-white' : 'text-primary-500';
  };

  const getDisabledStyle = () => {
    if (!disabled) return {};
    
    if (variant === 'primary') {
      return buttonStyles.disabledPrimary;
    }
    if (variant === 'outline') {
      return buttonStyles.disabledOutline;
    }
    return buttonStyles.disabled;

  };

  const getDisabledTextStyle = () => {
    if (!disabled) return {};
    
    if (variant === 'primary') {
      return buttonStyles.disabledPrimaryText;
    }
    if (variant === 'outline') {
      return buttonStyles.disabledOutlineText;
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
        <ActivityIndicator color={variant === 'primary' ? '#fff' : Colors.secondary[500]} />
      ) : (
        <View className="flex-row items-center">
          {icon && (
            <View className="mr-2">
              {React.isValidElement(icon) && (icon as any).props && 'color' in (icon as any).props
                ? React.cloneElement(icon as React.ReactElement<any>, {
                    color: disabled
                      ? Colors.gray[300]
                      : variant === 'primary'
                      ? '#fff'
                      : Colors.secondary[500],
                  })
                : icon}
            </View>
          )}
          <Text 
            className={cn('text-sm font-medium', getTextColor())}
            style={getDisabledTextStyle()}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
