import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { Fingerprint, AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useBiometricAuth } from '@/providers/BiometricAuthProvider';
import { useTranslation } from 'react-i18next';

export const BiometricSetup: React.FC = () => {
  const { t } = useTranslation();
  const { biometricState, enableBiometric, disableBiometric } = useBiometricAuth();
  const [isToggling, setIsToggling] = useState(false);

  const getBiometricName = () => {
    if (biometricState.biometricType === 'facial') {
      return Platform.OS === 'ios' ? 'Face ID' : 'reconocimiento facial';
    }
    return Platform.OS === 'ios' ? 'Touch ID' : 'huella digital';
  };

  const handleToggle = async (value: boolean) => {
    if (isToggling) return;

    setIsToggling(true);

    try {
      if (value) {
        const success = await enableBiometric();
        if (!success) {
          Alert.alert(
            'Error',
            'No se pudo habilitar la autenticación biométrica. Por favor, intenta nuevamente.'
          );
        }
      } else {
        Alert.alert(
          'Deshabilitar autenticación biométrica',
          `¿Estás seguro de que deseas deshabilitar ${getBiometricName()}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Deshabilitar',
              style: 'destructive',
              onPress: async () => {
                await disableBiometric();
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Error al procesar la solicitud'
      );
    } finally {
      setIsToggling(false);
    }
  };

  if (!biometricState.isSupported) {
    return (
      <View style={styles.unsupportedContainer}>
        <AlertCircle size={20} color={Colors.gray[400]} />
        <Text style={styles.unsupportedText}>
          Tu dispositivo no soporta autenticación biométrica
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Fingerprint size={24} color={Colors.primary[500]} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Acceso rápido con {getBiometricName()}</Text>
        <Text style={styles.subtitle}>
          Inicia sesión rápidamente usando tu {getBiometricName()} en lugar de tu contraseña
        </Text>
      </View>
      <Switch
        value={biometricState.isEnabled}
        onValueChange={handleToggle}
        disabled={isToggling || biometricState.isLoading}
        trackColor={{
          false: Colors.gray[300],
          true: Colors.primary[500],
        }}
        thumbColor="white"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[900],
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray[600],
    lineHeight: 20,
  },
  unsupportedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    marginBottom: 16,
  },
  unsupportedText: {
    fontSize: 14,
    color: Colors.gray[600],
    marginLeft: 12,
    flex: 1,
  },
});


