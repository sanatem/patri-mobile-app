import React, { forwardRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Select, Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { Plus, X } from 'lucide-react-native';

interface NewCategoryCardProps {
  currentLang: string;
  availableCategories: Array<{
    id: string;
    name: { es: string; en: string; pt: string; 'es-CL': string };
    emoji: string;
  }>;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  canAdd?: boolean;
}

export const NewCategoryCard = forwardRef<View, NewCategoryCardProps>(({
  currentLang,
  availableCategories,
  selectedCategoryId,
  onSelectCategory,
  showAddButton = false,
  showRemoveButton = false,
  onAdd,
  onRemove,
  canAdd = true,
}, ref) => {
  const categoryOptions = availableCategories.map(cat => ({
    label: `${cat.emoji} ${cat.name[currentLang as keyof typeof cat.name] || cat.name.es}`,
    value: cat.id
  }));

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
        <View style={{ flex: 1 }}>
          <Select
            options={categoryOptions}
            value={selectedCategoryId || undefined}
            onSelect={onSelectCategory}
            placeholder="Selecciona una categoría..."
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
