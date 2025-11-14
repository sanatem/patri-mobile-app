import React, { useState } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useBiometricAuth } from '@/providers/BiometricAuthProvider';
import { useTranslation } from 'react-i18next';
import { getBiometricIcon } from './biometricUtils';

export const BiometricSetup: React.FC = () => {
  const { t } = useTranslation();
  const { biometricState, enableBiometric, disableBiometric } = useBiometricAuth();
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async (value: boolean) => {
    if (isToggling) return;

    setIsToggling(true);

    try {
      if (value) {
        const success = await enableBiometric();
        if (!success) {
          Alert.alert(
            t('common.error'),
            t('biometric.errors.failed')
          );
        }
      } else {
        Alert.alert(
          t('biometric.title'),
          t('biometric.setup.confirm', { type: t('biometric.titleLowercase') }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            {
              text: t('biometric.disable', { type: '' }),
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
        t('common.error'),
        error instanceof Error ? error.message : t('biometric.errors.failed')
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
          {t('biometric.errors.notSupported')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getBiometricIcon({
          biometricType: biometricState.biometricType,
          size: 24,
          color: Colors.primary[500]
        })}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t('biometric.title')}</Text>
        <Text style={styles.subtitle}>
          {t('biometric.subtitle')}
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


