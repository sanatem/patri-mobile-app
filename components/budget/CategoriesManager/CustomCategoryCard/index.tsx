import React, { forwardRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Input, Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { Plus, X } from 'lucide-react-native';

interface CustomCategoryCardProps {
  categoryName: string;
  categoryEmoji: string;
  onNameChange: (text: string) => void;
  onEmojiChange: (text: string) => void;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  canAdd?: boolean;
}

export const CustomCategoryCard = forwardRef<View, CustomCategoryCardProps>(({
  categoryName,
  categoryEmoji,
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
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: 'white',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.primary[400],
        borderStyle: 'dashed',
        padding: 10,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ width: 80 }}>
          <Input
            value={categoryEmoji}
            onChangeText={onEmojiChange}
            placeholder="😀"
            maxLength={2}
            style={{ fontSize: 24, textAlign: 'center' }}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Input
            value={categoryName}
            onChangeText={onNameChange}
            placeholder="Ej: Transporte, Comida, etc."
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
              title="Categoría"
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
