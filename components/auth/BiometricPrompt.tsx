import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import type { BiometricType } from '@/types/biometric';
import { getBiometricIcon } from './biometricUtils';

interface BiometricPromptProps {
  onBiometricAuth: () => void;
  biometricType: BiometricType;
  loading?: boolean;
  remainingLockoutTime?: number;
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  onBiometricAuth,
  biometricType,
  loading = false,
  remainingLockoutTime = 0,
}) => {
  const { t } = useTranslation();
  const isLockedOut = remainingLockoutTime > 0;
  const minutes = Math.floor(remainingLockoutTime / 60);
  const seconds = remainingLockoutTime % 60;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getBiometricIcon({ biometricType, size: 64, color: Colors.primary[500] })}
      </View>

      <Text style={styles.title}>{t('biometric.prompt.title')}</Text>
      <Text style={styles.subtitle}>
        {t('biometric.prompt.subtitle', { type: t('biometric.titleLowercase') })}
      </Text>

      <View style={styles.buttonsContainer}>
        {isLockedOut && (
          <View style={styles.lockoutContainer}>
            <Text style={styles.lockoutTitle}>
              {t('biometric.lockoutTitle', 'Demasiados intentos fallidos')}
            </Text>
            <Text style={styles.lockoutTimer}>
              {`${minutes}:${seconds.toString().padStart(2, '0')}`}
            </Text>
            <Text style={styles.lockoutSubtitle}>
              {t('biometric.lockoutSubtitle', 'Intenta nuevamente después')}
            </Text>
          </View>
        )}
        <Button
          title={isLockedOut ? t('biometric.prompt.authenticateWhenReady', 'Intentar cuando finalice el bloqueo') : t('biometric.prompt.authenticate')}
          onPress={onBiometricAuth}
          disabled={loading || isLockedOut}
          fullWidth
          size="large"
        />

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Medium',
    color: Colors.primary[500],
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.primary[500],
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 32,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  lockoutContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  lockoutTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#B91C1C',
    marginBottom: 4,
    textAlign: 'center',
  },
  lockoutTimer: {
    fontSize: 32,
    fontFamily: 'Poppins-SemiBold',
    color: '#B91C1C',
    marginBottom: 4,
  },
  lockoutSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#B91C1C',
    textAlign: 'center',
  },
  fallbackHint: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.gray[600],
    textAlign: 'center',
  },
});

