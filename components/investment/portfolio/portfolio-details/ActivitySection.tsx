import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';

interface ActivitySectionProps {
  onMovePress?: () => void;
}

export function ActivitySection({ onMovePress }: ActivitySectionProps) {
  return (
    <View className="mb-6">
      <Text className="text-lg font-bold text-gray-900 mb-3">Actividad</Text>
      
      <TouchableOpacity 
        className="bg-primary-500/10 p-4 rounded-xl mb-3 items-center"
        onPress={onMovePress}
      >
        <Text className="text-primary-500 font-semibold">Mover</Text>
      </TouchableOpacity>
      
      <Card>
        <Text className="text-sm text-gray-500 font-regular">Movimientos</Text>
      </Card>
    </View>
  );
}