import React from 'react';
import { ConfirmModal } from '@/components/ui';

interface DeleteTransactionsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedTransactionsCount: number;
  isDeleting?: boolean;
  t: (key: string, fallback: string) => string;
}

export function DeleteTransactionsModal({
  visible,
  onClose,
  onConfirm,
  selectedTransactionsCount,
  isDeleting = false,
  t,
}: DeleteTransactionsModalProps) {
  return (
    <ConfirmModal
      visible={visible}
      title={t('budget.delete_transactions', 'Eliminar transacciones')}
      message={`¿Estás seguro que deseas eliminar ${selectedTransactionsCount} transacción${selectedTransactionsCount > 1 ? 'es' : ''}?`}
      onConfirm={onConfirm}
      onClose={onClose}
      confirmButtonText={t('common.delete', 'Eliminar')}
      cancelButtonText={t('common.cancel', 'Cancelar')}
      isDeleting={isDeleting}
    />
  );
}
