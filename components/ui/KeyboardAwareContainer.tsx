import React from 'react';
import { KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';

interface KeyboardAwareContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  className?: string;
  behavior?: 'height' | 'position' | 'padding';
  keyboardVerticalOffset?: number;
}

export function KeyboardAwareContainer({
  children,
  style,
  className,
  behavior = Platform.OS === 'ios' ? 'padding' : 'height',
  keyboardVerticalOffset = Platform.OS === 'ios' ? 90 : 0,
}: KeyboardAwareContainerProps) {
  return (
    <KeyboardAvoidingView
      behavior={behavior}
      style={[{ flex: 1 }, style]}
      className={className}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {children}
    </KeyboardAvoidingView>
  );
} 