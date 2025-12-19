import config from '@/config/constants';
import { getDeviceFingerprint } from '@/utils/device-info';
import type { DevicesResponse, SignOutDeviceResponse } from '@/types/device';

/**
 * Fetches all devices associated with the user's account
 * Backend endpoint: GET /api/v2/notification_devices
 *
 * Headers:
 * - Authorization: Bearer {token}
 * - X-Device-Fingerprint: {fingerprint} - to identify current device
 *
 * Notes:
 * - Shows devices from last 3 months only
 * - Sorted: active devices first, then by most recent
 * - active: true = has active session
 * - active: false = signed out
 * - is_current_device: true when X-Device-Fingerprint matches
 */
export const getUserDevices = async (token: string): Promise<DevicesResponse> => {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/notification_devices`;

    // Get device fingerprint to identify current device
    const deviceFingerprint = await getDeviceFingerprint();

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    if (deviceFingerprint) {
      headers['X-Device-Fingerprint'] = deviceFingerprint;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: DevicesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error fetching user devices:', error);
    throw error;
  }
};

/**
 * Signs out a specific device
 * Backend endpoint: POST /api/v2/notification_devices/:id/sign_out
 *
 * @throws {Error} 404 - Device not found
 * @throws {Error} 422 - Cannot sign out current device
 */
export const signOutDevice = async (token: string, deviceId: number): Promise<SignOutDeviceResponse> => {
  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/notification_devices/${deviceId}/sign_out`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      }
      if (response.status === 404) {
        throw new Error('DEVICE_NOT_FOUND');
      }
      if (response.status === 422) {
        throw new Error('CANNOT_SIGNOUT_CURRENT_DEVICE');
      }

      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data: SignOutDeviceResponse = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error signing out device:', error);
    throw error;
  }
};
