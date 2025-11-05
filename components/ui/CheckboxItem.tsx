import React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface CheckboxItemProps {
  selected: boolean;
  size?: number;
}

export function CheckboxItem({ selected, size = 20 }: CheckboxItemProps) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: selected ? Colors.primary[500] : Colors.gray[300],
        backgroundColor: selected ? Colors.primary[500] : 'white',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {selected && (
        <Check size={size * 0.6} color="white" strokeWidth={3} />
      )}
    </View>
  );
}
