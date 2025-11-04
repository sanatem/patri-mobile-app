import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { cn } from '@/lib/utils';
import Colors from '@/constants/Colors';
import { CheckCircle } from 'lucide-react-native';

type ButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'disabled' | 'success';
  loading?: boolean;
  saved?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactElement | null | undefined;
  className?: string;
};

const buttonStyles = StyleSheet.create({
  base: {
    borderRadius: 16,
  },
  disabled: {
    borderWidth: 1,
    borderColor: Colors.gray[300],
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
  },
  disabledText: {
    color: Colors.gray[300],
  },
  disabledPrimary: {
    backgroundColor: Colors.gray[300],
    borderRadius: 16,
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
    borderRadius: 16,
  },
  saved: {
    backgroundColor: Colors.success[500],
    borderRadius: 16,
  },
});

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  saved = false,
  disabled = false,
  fullWidth = false,
  icon = null,
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center h-12 px-4 font-semibold';
  
  const getVariantStyles = () => {
    if (disabled) {
      if (variant === 'primary') {
        return 'bg-gray-200 text-gray-300 border border-gray-200';
      }
      if (variant === 'ghost') {
        return 'bg-transparent';
      }
      if (variant === 'outline') {
        return 'border border-gray-200 text-gray-300';
      }
      return 'border border-gray-200 text-gray-300 bg-gray-100';
    }
    
    if (saved) {
      return 'text-white';
    }

    const variants: Record<typeof variant, string> = {
      primary: 'bg-primary-500 text-white',
      outline: 'border border-primary-500 text-primary-500 bg-white',
      ghost: 'bg-transparent text-primary-500',
      disabled: 'border border-gray-300 text-gray-400 bg-white',
      success: 'text-white'
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
      if (variant === 'ghost') {
        return '';
      }
    }
    return variant === 'primary' ? 'text-white' : 'text-primary-500';
  };

  const getDisabledStyle = () => {
    if (saved) {
      return buttonStyles.saved;
    }

    if (!disabled) return {};

    if (variant === 'ghost') {
      return {};
    }

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
    
    if (variant === 'ghost') {
      return { color: Colors.gray[300] };
    }
    
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
      disabled={disabled || loading || saved}
      style={[buttonStyles.base, getDisabledStyle()]}
      className={cn(
        baseStyles,
        getVariantStyles(),
        fullWidth && 'w-full',
        loading && 'opacity-80'
      )}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : Colors.secondary[500]} />
      ) : saved ? (
        <View className="flex-row items-center">
          <CheckCircle size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text className={cn('text-sm font-medium text-white')}>
            {title}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center">
          {icon && (
            <View className="mr-2">
              {React.isValidElement(icon) && (icon as any).props && 'color' in (icon as any).props
                ? React.cloneElement(icon as React.ReactElement<any>, {
                    color: disabled
                      ? variant === 'ghost'
                        ? Colors.gray[300]
                        : Colors.gray[300]
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
