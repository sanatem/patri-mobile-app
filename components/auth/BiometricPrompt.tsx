import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Fingerprint, Scan } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import type { BiometricType } from '@/types/biometric';

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

  const getBiometricIcon = () => {
    // Show face icon for facial recognition on iOS, fingerprint for everything else
    if (biometricType === 'facial' && Platform.OS === 'ios') {
      return <Scan size={64} color={Colors.primary[500]} />;
    }
    return <Fingerprint size={64} color={Colors.primary[500]} />;
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getBiometricIcon()}
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
        />

        <TouchableOpacity
          onPress={onPasswordAuth}
          disabled={loading}
          style={styles.passwordButton}
        >
          <Text style={styles.passwordButtonText}>{t('auth.usePassword')}</Text>
        </TouchableOpacity>
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
    fontWeight: 'bold',
    color: Colors.gray[900],
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: 'center',
    marginBottom: 48,
    paddingHorizontal: 32,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  passwordButton: {
    padding: 16,
    alignItems: 'center',
  },
  passwordButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[500],
  },
});

