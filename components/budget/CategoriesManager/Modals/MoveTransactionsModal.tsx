import React from 'react';
import { View } from 'react-native';
import { ConfirmModal, Select } from '@/components/ui';

interface MoveTransactionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedTransactionsCount: number;
  categoryOptions: { label: string; value: string }[];
  subcategoryOptions: { label: string; value: string }[];
  selectedDestinationCategory: string | null;
  selectedDestinationSubcategory: string | null;
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
  t: (key: string, fallback: string) => string;
}

export function MoveTransactionsModal({
  visible,
  onClose,
  onConfirm,
  selectedTransactionsCount,
  categoryOptions,
  subcategoryOptions,
  selectedDestinationCategory,
  selectedDestinationSubcategory,
  onCategoryChange,
  onSubcategoryChange,
  t,
}: MoveTransactionsModalProps) {
  return (
    <ConfirmModal
      visible={visible}
      title={`Mover ${selectedTransactionsCount} transacción${selectedTransactionsCount > 1 ? 'es' : ''}`}
      onConfirm={onConfirm}
      onClose={onClose}
      confirmButtonText="Mover"
      cancelButtonText="Cancelar"
      confirmDisabled={!selectedDestinationCategory}
    >
      <View style={{ marginTop: 8 }}>
        <Select
          options={categoryOptions}
          value={selectedDestinationCategory || ''}
          onSelect={onCategoryChange}
          placeholder="Selecciona una categoría"
        />

        {selectedDestinationCategory && subcategoryOptions.length > 0 && (
          <Select
            options={subcategoryOptions}
            value={selectedDestinationSubcategory || ''}
            onSelect={onSubcategoryChange}
            placeholder="Selecciona una subcategoría (opcional)"
          />
        )}
      </View>
    </ConfirmModal>
  );
}
