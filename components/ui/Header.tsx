import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  backButtonColor?: string;
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
  backButtonColor,
}: HeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <View
        style={[
          headerStyles.gradient,
          { 
            paddingTop: insets.top + 16,
            paddingLeft: Math.max(insets.left, 16), 
            paddingRight: Math.max(insets.right, 16), 
          }
        ]}
      >
        <View style={[headerStyles.container, headerStyles.content]}>
          <View className="flex-row items-center" style={{ minWidth: 40 }}>
            {showBackButton && (
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-1 mr-3"
              >
                <ChevronLeft size={24} color={backButtonColor || Colors.primary[600]} />
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
                <Text style={{ color: Colors.primary[600] }}>
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

          <View className="flex-row items-center" style={{ minWidth: 40 }}>
            {rightAction && rightAction}
          </View>
        </View>
      </View>
    </>
  );
} 