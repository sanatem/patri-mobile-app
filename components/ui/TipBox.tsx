import React from 'react';
import { View, Text } from 'react-native';
import { ArrowRight } from 'lucide-react-native';

interface TipBoxProps {
  children: React.ReactNode;
  showArrow?: boolean;
}

export function TipBox({ children, showArrow = true }: TipBoxProps) {
  return (
    <View className=" p-3 rounded-lg mb-5 mt-5" style={{ backgroundColor: 'rgba(255, 86, 3, 0.1)', borderColor: 'rgba(255, 86, 3, 0.1)', borderWidth: 1 }}>
      <View className="flex-row items-center">
        {showArrow && <ArrowRight size={13} color="#FF5603" />}
        <Text className="text-sm text-gray-700 ml-1 font-regular">{children}</Text>
      </View>
    </View>
  );
}