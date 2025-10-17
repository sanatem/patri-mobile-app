import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { OneSignal } from 'react-native-onesignal';

export interface DeviceInfo {
  platform: 'ios' | 'android';
  device_model: string;
  os_version: string;
  app_version: string;
  push_token?: string;
}

export const getDeviceInfo = async (): Promise<DeviceInfo> => {
  const platform = Platform.OS as 'ios' | 'android';

  // Get device model name from Constants
  let device_model = 'Unknown Device';
  if (Constants.deviceName) {
    device_model = Constants.deviceName;
  } else if (Platform.OS === 'ios') {
    // For iOS, we can use a more generic approach
    device_model = `iPhone ${Platform.Version}`;
  } else {
    // For Android
    device_model = 'Android Device';
  }

  // Get OS version
  const os_version = Platform.Version.toString();

  // Get app version from Constants
  const app_version = Constants.expoConfig?.version || '1.0.0';

  // Get OneSignal Player ID
  let push_token: string | undefined;
  try {
    const playerId = await OneSignal.User.pushSubscription.getIdAsync();
    push_token = playerId || undefined;
  } catch (error) {
    console.error('Error getting OneSignal player ID:', error);
  }

  return {
    platform,
    device_model,
    os_version,
    app_version,
    push_token
  };
};

export const requestPushPermissions = async (): Promise<boolean> => {
  try {
    // Check current permission status first
    const currentPermission = await OneSignal.Notifications.getPermissionAsync();
    console.log('Current OneSignal permission status:', currentPermission);

    // Request permission (will only show prompt if not determined)
    const granted = await OneSignal.Notifications.requestPermission(true);
    console.log('Permission request result:', granted);

    return granted;
  } catch (error) {
    console.error('Error requesting push permissions:', error);
    return false;
  }
};

export const setOneSignalExternalUserId = async (userId: string): Promise<void> => {
  try {
    await OneSignal.login(userId);
    console.log('OneSignal external user ID set successfully');
  } catch (error) {
    console.error('Error setting OneSignal external user ID:', error);
  }
};
