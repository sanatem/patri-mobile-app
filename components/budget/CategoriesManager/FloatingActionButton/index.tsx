import React from 'react';
import { View } from 'react-native';
import { Button } from '@/components/ui';
import { Plus } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface FloatingActionButtonProps {
  onPress: () => void;
  label: string;
}

export function FloatingActionButton({ onPress, label }: FloatingActionButtonProps) {
  return (
    <View style={{
      backgroundColor: '#fff',
      paddingHorizontal: 24,
      paddingVertical: 16,
      paddingBottom: 32,
      borderTopWidth: 1,
      borderTopColor: Colors.gray[100],
    }}>
      <Button
        title={label}
        onPress={onPress}
        variant="primary"
        fullWidth
        icon={<Plus size={20} color="#fff" />}
      />
    </View>
  );
}
