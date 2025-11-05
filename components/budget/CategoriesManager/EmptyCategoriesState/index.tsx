import React from 'react';
import { View, Text } from 'react-native';
import { FolderPlus } from 'lucide-react-native';
import Colors from '@/constants/Colors';

interface EmptyCategoriesStateProps {
  onAddCategory: () => void;
}

export function EmptyCategoriesState({ onAddCategory }: EmptyCategoriesStateProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 32,
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FolderPlus size={32} color={Colors.gray[400]} />
      </View>

      <Text
        className="font-medium text-sm"
        style={{
          color: Colors.gray[400],
          textAlign: 'center',
        }}
      >
        Aún no tienes categorías definidas.
      </Text>
    </View>
  );
}
