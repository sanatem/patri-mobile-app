import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import Colors from '@/constants/Colors';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ListItem({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  showChevron = false,
  onPress,
  className,
  disabled = false,
}: ListItemProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress}
      disabled={disabled}
      className={cn(
        'flex-row items-center py-4 px-4',
        disabled && 'opacity-50',
        className
      )}
    >
      {leftIcon && (
        <View className="mr-3">
          {leftIcon}
        </View>
      )}

      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800 mb-1">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-500">
            {subtitle}
          </Text>
        )}
      </View>

      {rightIcon && (
        <View className="ml-3">
          {rightIcon}
        </View>
      )}

      {showChevron && !rightIcon && (
        <ChevronRight size={20} color={Colors.gray[400]} className="ml-3" />
      )}
    </Component>
  );
} 