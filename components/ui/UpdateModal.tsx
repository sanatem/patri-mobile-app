import React from 'react';
import { View, Text, Modal, Platform } from 'react-native';
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

  const handleUpdate = async () => {
    try {
      // Get platform-specific URLs
      const directUrl = Platform.OS === 'ios' 
        ? STORE_URLS.IOS_DIRECT 
        : STORE_URLS.ANDROID_DIRECT;
      
      const fallbackUrl = Platform.OS === 'ios'
        ? STORE_URLS.IOS
        : STORE_URLS.ANDROID;
      
      // Use backend-provided URL or fallback to constants
      const webUrl = storeUrl || fallbackUrl;

      // Try direct store app URL first (market:// or itms-apps://)
      const canOpenDirect = await Linking.canOpenURL(directUrl);
      if (canOpenDirect) {
        await Linking.openURL(directUrl);
        return;
      }

      // Fallback to web URL
      const canOpenWeb = await Linking.canOpenURL(webUrl);
      if (canOpenWeb) {
        await Linking.openURL(webUrl);
        return;
      }

      // Last resort: try the constant fallback URL
      await Linking.openURL(fallbackUrl);
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
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
      >
        <View
          style={{
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
          }}
        >
          {/* Icon */}
          <View
            style={{
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 32,
                backgroundColor: Colors.primary[100],
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 28 }}>🚀</Text>
            </View>
          </View>

          {/* Title */}
          <Text
            className="text-lg font-semibold"
            style={{
              textAlign: 'center',
              marginBottom: 8,
              color: Colors.primary[700],
            }}
          >
            {t('appUpdate.title')}
          </Text>

          {/* Message */}
          <Text
            className="text-sm font-regular"
            style={{
              textAlign: 'center',
              marginBottom: 8,
              color: Colors.primary[500],
              lineHeight: 20,
            }}
          >
            {t('appUpdate.optionalUpdateMessage')}
          </Text>

          {/* Version info */}
          <View
            style={{
              backgroundColor: Colors.primary[50],
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text
                className="text-sm font-regular"
                style={{ color: Colors.primary[500] }}
              >
                {t('appUpdate.currentVersion')}
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: Colors.primary[600] }}
              >
                {currentVersion || '-'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text
                className="text-sm font-regular"
                style={{ color: Colors.primary[500] }}
              >
                {t('appUpdate.latestVersion')}
              </Text>
              <Text
                className="text-sm font-medium"
                style={{ color: Colors.secondary[500] }}
              >
                {latestVersion || '-'}
              </Text>
            </View>
          </View>

          {/* Buttons */}
          <View style={{ gap: 12 }}>
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
