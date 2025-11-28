import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface QuickAccessButtonProps {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  style?: object;
}

export function QuickAccessButton({
  label,
  icon,
  onPress,
  style,
}: QuickAccessButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
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
        },
        style,
      ]}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {icon}
        <Text className="text-base font-medium" style={{ color: Colors.primary[600], marginLeft: 12 }}>
          {label}
        </Text>
      </View>
      <ChevronRight size={20} color={Colors.primary[500]} />
    </TouchableOpacity>
  );
}
