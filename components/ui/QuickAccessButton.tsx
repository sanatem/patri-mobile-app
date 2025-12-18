import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface QuickAccessButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  style?: object;
  disabled?: boolean;
}

export function QuickAccessButton({
  label,
  icon,
  onPress,
  style,
  disabled = false,
}: QuickAccessButtonProps) {
  const iconColor = disabled ? Colors.gray[300] : Colors.primary[500];
  const textColor = disabled ? Colors.gray[400] : Colors.primary[500];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: 'white',
          borderRadius: 12,
          borderWidth: 1,
          borderColor: Colors.gray[100],
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ color?: string }>, { color: iconColor }) : icon}
        <Text className="text-base font-medium" style={{ color: textColor, marginLeft: 12 }}>
          {label}
        </Text>
      </View>
      <ChevronRight size={20} color={iconColor} />
    </TouchableOpacity>
  );
}
