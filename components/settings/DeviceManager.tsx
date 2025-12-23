import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, Platform, ToastAndroid } from 'react-native';
import { Smartphone } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { getUserDevices, signOutDevice } from '@/services/user/devices';
import { getSecurityAlertStatus, updateSecuritySettings } from '@/services/user/security-settings';
import { useAuthToken } from '@/hooks/common/useAuthToken';
import type { Device } from '@/types/device';
import Colors from '@/constants/Colors';
import { SecurityNotificationToggle } from './device/SecurityNotificationToggle';
import { DeviceListItem } from './device/DeviceListItem';
import { getDeviceName, showSuccessToast } from './device/utils';

interface DeviceManagerProps {
  className?: string;
}

export const DeviceManager: React.FC<DeviceManagerProps> = () => {
  const { t } = useTranslation();
  const { getToken } = useAuthToken();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState<number | null>(null);
  const [notifyNewDevice, setNotifyNewDevice] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Refs to store stable references
  const getTokenRef = useRef(getToken);
  const tRef = useRef(t);

  // Keep refs updated
  useEffect(() => {
    getTokenRef.current = getToken;
    tRef.current = t;
  }, [getToken, t]);

  useEffect(() => {
    let isMounted = true;

    const loadDevices = async () => {
      try {
        setLoading(true);
        const token = await getTokenRef.current();
        if (!token) {
          throw new Error('No authentication token available');
        }
        const response = await getUserDevices(token);

        if (isMounted) {
          setDevices(response.devices ?? []);
        }
      } catch (error) {
        console.error('Error loading devices:', error);
        if (isMounted) {
          Alert.alert(
            tRef.current('preferences.devices.error'),
            tRef.current('preferences.devices.loadError')
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const loadSecuritySettings = async () => {
      try {
        setLoadingSettings(true);
        const token = await getTokenRef.current();
        if (!token) {
          throw new Error('No authentication token available');
        }
        const securityAlertsEnabled = await getSecurityAlertStatus(token);

        if (isMounted) {
          setNotifyNewDevice(securityAlertsEnabled);
        }
      } catch (error) {
        console.error('Error loading security alert status:', error);
      } finally {
        if (isMounted) {
          setLoadingSettings(false);
        }
      }
    };

    loadDevices();
    loadSecuritySettings();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  // Function to refresh devices (used after sign out)
  const refreshDevices = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      const response = await getUserDevices(token);
      setDevices(response.devices ?? []);
    } catch (error) {
      console.error('Error refreshing devices:', error);
      Alert.alert(
        t('preferences.devices.error'),
        t('preferences.devices.loadError')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotification = async (value: boolean) => {
    setNotifyNewDevice(value);

    try {
      setUpdatingSettings(true);
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      await updateSecuritySettings(token, value);

      const successMessage = value
        ? t('preferences.security.enabledSuccess')
        : t('preferences.security.disabledSuccess');
      showSuccessToast(successMessage, Platform, ToastAndroid, Alert);
    } catch (error) {
      setNotifyNewDevice(!value);
      Alert.alert(
        t('preferences.devices.error'),
        t('preferences.security.updateError')
      );
    } finally {
      setUpdatingSettings(false);
    }
  };

  const handleSignOutDevice = async (device: Device) => {
    const deviceName = getDeviceName(device);

    Alert.alert(
      t('preferences.devices.signOutConfirm.title'),
      t('preferences.devices.signOutConfirm.message', { device: deviceName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('preferences.devices.signOutConfirm.action'),
          style: 'destructive',
          onPress: async () => {
            try {
              setSigningOut(device.id);
              const token = await getToken();
              if (!token) {
                throw new Error('No authentication token available');
              }
              await signOutDevice(token, device.id);
              await refreshDevices();
              Alert.alert(
                t('preferences.devices.signedOut.title'),
                t('preferences.devices.signedOut.message')
              );
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';

              if (errorMessage === 'DEVICE_NOT_FOUND') {
                Alert.alert(t('preferences.devices.error'), t('preferences.devices.errors.deviceNotFound'));
              } else if (errorMessage === 'CANNOT_SIGNOUT_CURRENT_DEVICE') {
                Alert.alert(t('preferences.devices.error'), t('preferences.devices.errors.cannotSignOutCurrent'));
              } else {
                Alert.alert(t('preferences.devices.error'), t('preferences.devices.signOutError'));
              }
            } finally {
              setSigningOut(null);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>{t('preferences.devices.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Smartphone size={22} color={Colors.primary[500]} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>{t('preferences.devices.title')}</Text>
            <Text style={styles.headerSubtitle}>{t('preferences.devices.subtitle')}</Text>
          </View>
        </View>
      </View>

      {/* Security Toggle */}
      <SecurityNotificationToggle
        enabled={notifyNewDevice}
        onToggle={handleToggleNotification}
        loading={loadingSettings}
        updating={updatingSettings}
        activeDevicesCount={(devices ?? []).filter(d => d.active).length}
        untrustedDevicesCount={(devices ?? []).filter(d => !d.active).length}
      />

      {/* Device List */}
      <View style={styles.deviceList}>
        {(devices ?? []).map((device, index) => (
          <DeviceListItem
            key={device.id}
            device={device}
            isSigningOut={signingOut === device.id}
            onSignOut={handleSignOutDevice}
            isLastItem={index === (devices ?? []).length - 1}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 360,
    maxWidth: '95%',
    alignSelf: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    paddingVertical: 8,
    marginBottom: 24,
    shadowColor: Colors.dark.background,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary[700],
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.semantic.neutral,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.semantic.neutral,
  },
  deviceList: {
    paddingHorizontal: 20,
  },
});
