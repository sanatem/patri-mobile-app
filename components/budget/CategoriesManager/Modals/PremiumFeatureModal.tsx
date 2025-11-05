import React from 'react';
import { View, Text, Modal, TouchableOpacity, Alert } from 'react-native';
import { X, Crown } from 'lucide-react-native';
import { Button } from '@/components/ui';
import Colors from '@/constants/Colors';
import { usePaywall } from '@/hooks/common/usePaywall';
import { useSubscriptionStatus } from '@/hooks/common/useSubscriptionStatus';
import { useTranslation } from 'react-i18next';

interface PremiumFeatureModalProps {
  visible: boolean;
  onClose: () => void;
  featureName?: string;
}

export function PremiumFeatureModal({
  visible,
  onClose,
  featureName = 'Esta funcionalidad'
}: PremiumFeatureModalProps) {
  const { presentPaywall } = usePaywall();
  const { forceRefresh } = useSubscriptionStatus();
  const { t } = useTranslation();

  const handleUpgrade = async () => {
    try {
      const result = await presentPaywall();

      if (result.success) {
        await forceRefresh();
        onClose();
        Alert.alert(
          t('planning.success.title', '¡Suscripción exitosa!'),
          t('planning.success.message', 'Ahora tienes acceso a todas las funcionalidades premium.'),
          [{ text: 'OK' }]
        );
      } else if (!result.cancelled) {
        Alert.alert(
          t('planning.error.title', 'Error'),
          result.error || t('planning.error.subscription', 'No se pudo completar la suscripción.'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        t('planning.error.title', 'Error'),
        t('planning.error.unexpected', 'Ocurrió un error inesperado.'),
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}>
        <View style={{
          backgroundColor: 'white',
          borderRadius: 16,
          width: '100%',
          maxWidth: 400,
          overflow: 'hidden',
        }}>
          <View style={{
            padding: 20,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}>
            <View style={{
              width: 60,
              height: 60,
              backgroundColor: Colors.secondary[50],
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Crown size={28} color={Colors.secondary[500]} />
            </View>
            <TouchableOpacity 
              onPress={onClose} 
              style={{ 
                position: 'absolute',
                top: 20,
                right: 20,
                padding: 4 
              }}
            >
              <X size={24} color={Colors.gray[500]} />
            </TouchableOpacity>
          </View>
          <View style={{ padding: 10 }}>
            <Text className="text-base font-regular text-center" style={{
              color: Colors.primary[500],
              lineHeight: 24,
              marginBottom: 10,
            }}>
               Ésta es una funcionalidad exclusiva de{' '}
              <Text className="font-medium" style={{ color: Colors.primary[700] }}>
                Suscripción Premium
              </Text>
            </Text>

            <View style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              marginBottom: 20,
            }}>
              <Text className="text-sm font-medium text-center" style={{
                color: Colors.primary[700],
                marginBottom: 8,
              }}>
                Con Premium obtienes:
              </Text>
              <View style={{ marginLeft: 8 }}>
                <Text className="text-sm font-regular text-center" style={{ color: Colors.primary[600], marginBottom: 4 }}>
                  • Edición de categorías
                </Text>
                <Text className="text-sm font-regular text-center" style={{ color: Colors.primary[600], marginBottom: 4 }}>
                  • Categorías personalizadas
                </Text>
                <Text className="text-sm font-regular text-center" style={{ color: Colors.primary[600], marginBottom: 4 }}>
                  • Sincronización ilimitada
                </Text>
                <Text className="text-sm font-regular text-center" style={{ color: Colors.primary[600] }}>
                  • Y mucho más!
                </Text>
              </View>
            </View>
          </View>

          <View style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            gap: 12,
          }}>
            <Button
              variant="primary"
              onPress={handleUpgrade}
              title="Suscribirme"
            />
            <Button
              variant="ghost"
              onPress={onClose}
              title="Ahora no"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
