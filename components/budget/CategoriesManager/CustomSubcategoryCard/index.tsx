import React, { forwardRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Input, Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { Plus, X } from 'lucide-react-native';

interface CustomSubcategoryCardProps {
  subcategoryName: string;
  subcategoryEmoji: string;
  onNameChange: (text: string) => void;
  onEmojiChange: (text: string) => void;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  canAdd?: boolean;
}

export const CustomSubcategoryCard = forwardRef<View, CustomSubcategoryCardProps>(({
  subcategoryName,
  subcategoryEmoji,
  onNameChange,
  onEmojiChange,
  showAddButton = false,
  showRemoveButton = false,
  onAdd,
  onRemove,
  canAdd = true,
}, ref) => {
  return (
    <View
      ref={ref}
      style={{
        marginTop: 8,
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primary[300],
        borderStyle: 'dashed',
        padding: 10,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ width: 80 }}>
          <Input
            value={subcategoryEmoji}
            onChangeText={onEmojiChange}
            placeholder="😀"
            maxLength={2}
            style={{ fontSize: 24, textAlign: 'center' }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Input
            value={subcategoryName}
            onChangeText={onNameChange}
            placeholder="Ej: Netflix, Spotify, etc."
          />
        </View>

        {showRemoveButton && (
          <TouchableOpacity
            onPress={onRemove}
            style={{
              padding: 4,
              marginTop: 10,
            }}
          >
            <X size={16} color={Colors.gray[500]} />
          </TouchableOpacity>
        )}
      </View>

      {showAddButton && onAdd && (
        <>
          <View style={{
            height: 0.5,
            backgroundColor: Colors.gray[100],
            marginVertical: 2,
          }} />
          <View style={{ transform: [{ scale: 0.9 }] }}>
            <Button
              title="Subcategoría"
              variant="ghost"
              fullWidth
              icon={<Plus size={16} color={canAdd ? Colors.primary[500] : Colors.gray[300]} />}
              onPress={onAdd}
              disabled={!canAdd}
            />
          </View>
        </>
      )}
    </View>
  );
});
