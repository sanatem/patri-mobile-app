import { Smartphone, Globe } from 'lucide-react-native';
import type { Device } from '@/types/device';

/**
 * Get the appropriate icon for a device platform
 */
export const getDeviceIcon = (platform: Device['platform']) => {
  switch (platform) {
    case 'ios':
    case 'android':
      return Smartphone;
    case 'web':
      return Globe;
    default:
      return Smartphone;
  }
};

/**
 * Get display name for a device
 * The backend always provides display_name, so we just return it
 */
export const getDeviceName = (device: Device) => {
  return device.display_name;
};

/**
 * Format last active timestamp to human-readable format
 */
export const formatLastActive = (lastActiveAt: string, t: any) => {
  const date = new Date(lastActiveAt);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('preferences.devices.now');
  if (diffMins < 60) return t('preferences.devices.minutesAgo', { count: diffMins });
  if (diffHours < 24) return t('preferences.devices.hoursAgo', { count: diffHours });
  if (diffDays < 7) return t('preferences.devices.daysAgo', { count: diffDays });
  
  return date.toLocaleDateString();
};

/**
 * Show success toast (platform-specific)
 */
export const showSuccessToast = (message: string, Platform: any, ToastAndroid: any, Alert: any) => {
  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    // iOS doesn't have Toast, use Alert with minimal UI
    Alert.alert('', message, [{ text: 'OK' }], { cancelable: true });
  }
};

