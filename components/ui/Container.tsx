import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '@/lib/utils';

interface ContainerProps extends ViewProps {
  variant?: 'page' | 'section' | 'content' | 'secondaryPage';
  children: React.ReactNode;
  className?: string;
}

export function Container({
  variant = 'content',
  children,
  className,
  ...props
}: ContainerProps) {
  const variants = {
    page: 'flex-1 bg-gray-50',
    secondaryPage: 'flex-1 bg-gray-50', 
    section: 'px-4 py-4',
    content: 'px-4',
  };

  return (
    <View
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </View>
  );
} 