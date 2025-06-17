import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import Colors from '@/constants/Colors';
import { headerStyles } from '@/styles/ui/Header.styles';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'transparent';
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

export function Header({
  title,
  subtitle,
  showBackButton = false,
  leftAction,
  rightAction,
  variant = 'default',
  className,
  titleClassName,
  subtitleClassName,
}: HeaderProps) {
  const router = useRouter();

  const variants = {
    default: 'bg-white border-b border-gray-100',
    transparent: 'bg-transparent',
  };

  const defaultTitleStyles = variant === 'transparent' 
    ? 'text-white' 
    : 'text-gray-800';
    
  const defaultSubtitleStyles = variant === 'transparent' 
    ? 'text-white/80' 
    : 'text-gray-600';

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View
        className={cn(
          'pt-16 px-4 pb-4 flex-row items-center justify-between',
          variants[variant],
          className
        )}
        style={headerStyles.container}
      >
        <View className="flex-row items-center">
          {showBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-1 mr-3"
            >
              <ChevronLeft size={24} color={Colors.gray[600]} />
            </TouchableOpacity>
          )}
          {leftAction && leftAction}
        </View>

        <View className="flex-1 items-center justify-center">
          {title && (
            <Text className={cn(
              'text-xl font-bold',
              defaultTitleStyles,
              titleClassName
            )}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text className={cn(
              'text-sm font-regular mt-1',
              defaultSubtitleStyles,
              subtitleClassName
            )}>
              {subtitle}
            </Text>
          )}
        </View>

        <View className="flex-row items-center">
          {rightAction && rightAction}
        </View>
      </View>
    </>
  );
} 