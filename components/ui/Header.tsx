import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { cn } from '@/lib/utils';
import { headerStyles } from '@/styles/ui/Header.styles';
import Colors from '@/constants/Colors';

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

  return (
    <>
      <View
        style={headerStyles.gradient}
      >
        <View style={[headerStyles.container, headerStyles.content]}>
          <View className="flex-row items-center">
            {showBackButton && (
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-1 mr-3"
              >
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
            )}
            {leftAction && leftAction}
          </View>

          <View className="flex-1 items-center justify-center">
            {title && (
              <Text className={cn(
                'text-xl font-semibold',
                titleClassName
              )}>
                <Text style={{ color: Colors.primary[500] }}>
                  {title}
                </Text>
              </Text>
            )}
            {subtitle && (
              <Text className={cn('text-sm font-regular mt-1', subtitleClassName)} style={{ color: Colors.primary[500] }}>
                {subtitle}
              </Text>
            )}
          </View>

          <View className="flex-row items-center">
            {rightAction && rightAction}
          </View>
        </View>
      </View>
    </>
  );
} 