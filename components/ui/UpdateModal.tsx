import React from 'react';
import { View, Text, Modal, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';
import Colors from '@/constants/Colors';
import * as Linking from 'expo-linking';
import { useTranslation } from 'react-i18next';
import { STORE_URLS } from '@/constants/AppConstants';

interface UpdateModalProps {
  visible: boolean;
  onClose: () => void;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
}

export function UpdateModal({
  visible,
  onClose,
  currentVersion,
  latestVersion,
  storeUrl,
}: UpdateModalProps) {
  const { t } = useTranslation();

  /**
   * Opens the appropriate store URL for the current platform.
   * Priority order:
   * 1. Direct store app URL (market:// or itms-apps://) - opens store app directly
   * 2. Backend-provided storeUrl (if available)
   * 3. Constant web URL fallback
   */
  const handleUpdate = async () => {
    try {
      const isIOS = Platform.OS === 'ios';
      const directUrl = isIOS ? STORE_URLS.IOS_DIRECT : STORE_URLS.ANDROID_DIRECT;
      const webUrl = storeUrl || (isIOS ? STORE_URLS.IOS : STORE_URLS.ANDROID);

      // Try direct store app URL first (opens store app directly)
      const canOpenDirect = await Linking.canOpenURL(directUrl);
      if (canOpenDirect) {
        await Linking.openURL(directUrl);
        return;
      }

      // Fallback to web URL (backend-provided or constant)
      await Linking.openURL(webUrl);
    } catch (error) {
      console.error('Error opening store URL:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconBackground}>
              <Ionicons
                name="rocket-outline"
                size={32}
                color={Colors.primary[600]}
              />
            </View>
          </View>

          {/* Title */}
          <Text className="text-lg font-semibold" style={styles.title}>
            {t('appUpdate.title')}
          </Text>

          {/* Message */}
          <Text className="text-sm font-regular" style={styles.message}>
            {t('appUpdate.optionalUpdateMessage')}
          </Text>

          {/* Version info */}
          <View style={styles.versionContainer}>
            <View style={styles.versionRow}>
              <Text className="text-sm font-regular" style={styles.versionLabel}>
                {t('appUpdate.currentVersion')}
              </Text>
              <Text className="text-sm font-medium" style={styles.currentVersionValue}>
                {currentVersion || '-'}
              </Text>
            </View>
            <View style={styles.versionRowLast}>
              <Text className="text-sm font-regular" style={styles.versionLabel}>
                {t('appUpdate.latestVersion')}
              </Text>
              <Text className="text-sm font-medium" style={styles.latestVersionValue}>
                {latestVersion || '-'}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              title={t('appUpdate.updateButton')}
              variant="primary"
              fullWidth
              onPress={handleUpdate}
            />

            <Button
              title={t('appUpdate.laterButton')}
              variant="outline"
              fullWidth
              onPress={onClose}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
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
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBackground: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.primary[700],
  },
  message: {
    textAlign: 'center',
    marginBottom: 8,
    color: Colors.primary[500],
    lineHeight: 20,
  },
  versionContainer: {
    backgroundColor: Colors.primary[50],
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  versionRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  versionLabel: {
    color: Colors.primary[500],
  },
  currentVersionValue: {
    color: Colors.primary[600],
  },
  latestVersionValue: {
    color: Colors.secondary[500],
  },
  buttonContainer: {
    gap: 12,
  },
});
