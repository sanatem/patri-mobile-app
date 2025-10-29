import React from 'react';
import { ConfirmModal } from '@/components/ui';

interface DeleteItemModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  activeTab: 'assets' | 'liabilities';
  itemToDelete: any;
  isDeleting: boolean;
}

export function DeleteItemModal({
  visible,
  onClose,
  onConfirm,
  activeTab,
  itemToDelete,
  isDeleting
}: DeleteItemModalProps) {
  return (
    <ConfirmModal
      visible={visible}
      onClose={onClose}
      onConfirm={onConfirm}
      title={activeTab === 'assets' ? 'Eliminar activo' : 'Eliminar pasivo'}
      itemName={itemToDelete?.title}
      isDeleting={isDeleting}
    />
  );
}
