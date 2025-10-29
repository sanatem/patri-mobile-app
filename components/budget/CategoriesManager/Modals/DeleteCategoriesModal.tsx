import React from 'react';
import { ConfirmModal } from '@/components/ui';

interface DeleteCategoriesModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedCategories: Set<string>;
  selectedSubcategories: Set<string>;
  totalTransactionsToUncategorize: number;
  t: (key: string, fallback: string) => string;
}

export function DeleteCategoriesModal({
  visible,
  onClose,
  onConfirm,
  selectedCategories,
  selectedSubcategories,
  totalTransactionsToUncategorize,
  t,
}: DeleteCategoriesModalProps) {
  const getMessage = () => {
    const totalItems = selectedCategories.size + selectedSubcategories.size;
    let itemsText = '';

    if (selectedCategories.size > 0 && selectedSubcategories.size > 0) {
      itemsText = `${selectedCategories.size} categoría${selectedCategories.size > 1 ? 's' : ''} y ${selectedSubcategories.size} subcategoría${selectedSubcategories.size > 1 ? 's' : ''}`;
    } else if (selectedCategories.size > 0) {
      itemsText = `${selectedCategories.size} categoría${selectedCategories.size > 1 ? 's' : ''}`;
    } else {
      itemsText = `${selectedSubcategories.size} subcategoría${selectedSubcategories.size > 1 ? 's' : ''}`;
    }

    if (totalTransactionsToUncategorize > 0) {
      return `¿Estás seguro que deseas eliminar ${itemsText}?\n\n${totalTransactionsToUncategorize} transacción${totalTransactionsToUncategorize > 1 ? 'es' : ''} quedarán sin categorizar automáticamente.`;
    }
    return `¿Estás seguro que deseas eliminar ${itemsText}?`;
  };

  return (
    <ConfirmModal
      visible={visible}
      title={t('budget.delete_categories', 'Eliminar categorías')}
      message={getMessage()}
      onConfirm={onConfirm}
      onClose={onClose}
      confirmButtonText={t('common.delete', 'Eliminar')}
      cancelButtonText={t('common.cancel', 'Cancelar')}
    />
  );
}
