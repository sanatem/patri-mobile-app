import React, { forwardRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Select, Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { Plus, X, Check } from 'lucide-react-native';

interface NewSubcategoryCardProps {
  currentLang: string;
  availableSubcategories: Array<{
    id: string;
    name: { es: string; en: string; pt: string; 'es-CL': string };
    emoji: string;
  }>;
  selectedSubcategoryId: string | null;
  onSelectSubcategory: (subcategoryId: string) => void;
  showAddButton?: boolean;
  showRemoveButton?: boolean;
  onAdd?: () => void;
  onRemove?: () => void;
  canAdd?: boolean;
}

export const NewSubcategoryCard = forwardRef<View, NewSubcategoryCardProps>(({
  currentLang,
  availableSubcategories,
  selectedSubcategoryId,
  onSelectSubcategory,
  showAddButton = false,
  showRemoveButton = false,
  onAdd,
  onRemove,
  canAdd = true,
}, ref) => {
  const subcategoryOptions = availableSubcategories.map(subcat => ({
    label: `${subcat.emoji} ${subcat.name[currentLang as keyof typeof subcat.name] || subcat.name.es}`,
    value: subcat.id
  }));

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
        <View style={{ flex: 1 }}>
          <Select
            options={subcategoryOptions}
            value={selectedSubcategoryId || undefined}
            onSelect={onSelectSubcategory}
            placeholder="Selecciona una subcategoría..."
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
