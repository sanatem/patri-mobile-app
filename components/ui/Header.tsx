import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import Colors from '@/constants/Colors';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  variant?: 'default' | 'transparent';
  className?: string;
}

export function Header({
  title,
  subtitle,
  showBackButton = false,
  leftAction,
  rightAction,
  variant = 'default',
  className,
}: HeaderProps) {
  const router = useRouter();

  const variants = {
    default: 'bg-white border-b border-gray-100',
    transparent: 'bg-transparent',
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <View
        className={cn(
          'pt-16 px-4 pb-4 flex-row items-center justify-between',
          variants[variant],
          className
        )}
        style={{ paddingTop: 64 }}
      >
        <View className="flex-row items-center flex-1">
          {showBackButton && (
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 p-1"
            >
              <ChevronLeft size={24} color={Colors.gray[600]} />
            </TouchableOpacity>
          )}
          
          {leftAction && (
            <View className="mr-3">
              {leftAction}
            </View>
          )}
          
          <View className="flex-1">
            {title && (
              <Text className="text-xl font-bold text-gray-800 text-center">
                {title}
              </Text>
            )}
            {subtitle && (
              <Text className="text-sm text-gray-600 mt-1 text-center">
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {rightAction && (
          <View className="ml-3">
            {rightAction}
          </View>
        )}
      </View>
    </>
  );
} 