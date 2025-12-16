import React from 'react';
import { View, Text, Modal } from 'react-native';
import { Button } from './Button';
import Colors from '@/constants/Colors';

interface ConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName?: string;
  message?: string;
  isDeleting?: boolean;
  loadingText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmDisabled?: boolean;
  children?: React.ReactNode;
}

export function ConfirmModal({
  visible,
  onClose,
  onConfirm,
  title,
  itemName,
  message,
  isDeleting = false,
  loadingText = "Eliminando...",
  confirmButtonText = "Eliminar",
  cancelButtonText = "Cancelar",
  confirmDisabled = false,
  children
}: ConfirmModalProps) {
  const defaultMessage = itemName
    ? `¿Estás seguro de que deseas eliminar "${itemName}"? Esta acción no se puede deshacer.`
    : '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          padding: 24,
          marginHorizontal: 20,
          width: '90%',
          maxWidth: 400,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8,
        }}>
          <View style={{ alignItems: 'center', marginBottom: 24, width: '100%' }}>
            <Text className="text-md font-medium" style={{
              marginBottom: 8,
              textAlign: 'center',
              color: Colors.primary[700],
            }}>
              {title}
            </Text>
            {message && (
              <Text className="text-sm font-regular" style={{
                lineHeight: 22,
                color: Colors.primary[500],
                textAlign: 'center',
              }}>
                {message || defaultMessage}
              </Text>
            )}
            <View style={{ width: '100%' }}>
              {children}
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Button
                title={cancelButtonText}
                variant="outline"
                fullWidth
                onPress={onClose}
                disabled={isDeleting}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Button
                title={isDeleting ? loadingText : confirmButtonText}
                variant="primary"
                fullWidth
                onPress={onConfirm}
                disabled={isDeleting || confirmDisabled}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}