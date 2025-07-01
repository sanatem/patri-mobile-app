import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

interface ContainerProps extends ViewProps {
  variant?: 'page' | 'section' | 'content' | 'secondaryPage';
  children: React.ReactNode;
  className?: string;
  useSafeArea?: boolean;
}

export function Container({
  variant = 'content',
  children,
  className,
  useSafeArea = false,
  ...props
}: ContainerProps) {
  const insets = useSafeAreaInsets();
  
  const variants = {
    page: 'flex-1 bg-gray-50',
    secondaryPage: 'flex-1 bg-white', 
    section: 'px-4 py-4',
    content: 'px-4',
  };

  const safeAreaStyle = useSafeArea ? {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: Math.max(insets.left, 0),
    paddingRight: Math.max(insets.right, 0),
  } : {};

  return (
    <View
      className={cn(variants[variant], className)}
      style={[safeAreaStyle, props.style]}
      {...props}
    >
      {children}
    </View>
  );
} 