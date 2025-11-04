import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Button } from '@/components/ui';
import Colors from '@/constants/Colors';

interface CategorizeButtonProps {
  onPress: () => void;
  label: string;
  visible: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  style?: StyleProp<ViewStyle>;
}

export function CategorizeButton({
  onPress,
  label,
  visible,
  loading = false,
  variant = 'primary',
  style,
}: CategorizeButtonProps) {
  if (!visible) return null;

  return (
    <View
      style={[
        {
          backgroundColor: '#fff',
          paddingHorizontal: 24,
          paddingVertical: 16,
          paddingBottom: 32,
          borderTopWidth: 1,
          borderTopColor: Colors.gray[100],
        },
        style,
      ]}
    >
      <Button title={label} onPress={onPress} variant={variant} fullWidth loading={loading} />
    </View>
  );
}
