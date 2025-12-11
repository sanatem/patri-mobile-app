import React from 'react';
import { ConfirmModal } from '@/components/ui';

interface DeleteTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
}

export function DeleteTransactionModal({
  visible,
  onClose,
  onConfirm,
  isDeleting,
  title,
  message,
  confirmButtonText,
  cancelButtonText
}: DeleteTransactionModalProps) {
  return (
    <ConfirmModal
      visible={visible}
      title={title}
      message={message}
      onConfirm={onConfirm}
      onClose={onClose}
      confirmButtonText={confirmButtonText}
      cancelButtonText={cancelButtonText}
      isDeleting={isDeleting}
    />
  );
}
