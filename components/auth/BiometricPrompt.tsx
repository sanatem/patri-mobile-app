import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import type { BiometricType } from '@/types/biometric';
import { getBiometricIcon } from './biometricUtils';

interface BiometricPromptProps {
  onBiometricAuth: () => void;
  onPasswordAuth: () => void;
  biometricType: BiometricType;
  loading?: boolean;
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  onBiometricAuth,
  onPasswordAuth,
  biometricType,
  loading = false,
}) => {
  const { t } = useTranslation();

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
        <Button
          title={t('biometric.prompt.authenticate')}
          onPress={onBiometricAuth}
          disabled={loading}
          fullWidth
          size="large"
        />

        <Button
          title={t('auth.usePassword')}
          onPress={onPasswordAuth}
          variant="ghost"
          disabled={loading}
          fullWidth
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
});

