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
  loading?: boolean;
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
  loading = false,
  t,
}: MoveTransactionsModalProps) {
  return (
    <ConfirmModal
      visible={visible}
      title={`Categorizar ${selectedTransactionsCount} transacción${selectedTransactionsCount > 1 ? 'es' : ''}`}
      onConfirm={onConfirm}
      onClose={onClose}
      confirmButtonText={loading ? "Categorizando..." : "Categorizar"}
      cancelButtonText="Cancelar"
      confirmDisabled={!selectedDestinationCategory || loading}
    >
      <View style={{ marginTop: 8 }}>
        <Select
          options={categoryOptions}
          value={selectedDestinationCategory || ''}
          onSelect={onCategoryChange}
          placeholder="Selecciona una categoría"
          label={t('budget.category', 'Categoría')}
        />

        {selectedDestinationCategory && subcategoryOptions.length > 0 && (
          <Select
            options={subcategoryOptions}
            value={selectedDestinationSubcategory || ''}
            onSelect={onSubcategoryChange}
            placeholder="Selecciona una subcategoría (opcional)"
            label={t('budget.subcategory', 'Subcategoría')}
          />
        )}
      </View>
    </ConfirmModal>
  );
}
