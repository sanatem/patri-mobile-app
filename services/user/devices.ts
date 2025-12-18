import config from '@/config/constants';
import type { Device, DevicesResponse, SignOutDeviceRequest, SignOutDeviceResponse } from '@/types/device';

// Feature flag: set to false when backend is ready
const USE_MOCK_DATA = false;

// Mock data matching the backend response structure
const MOCK_DEVICES_RESPONSE: DevicesResponse = {
  devices: [
    {
      id: 1,
      platform: 'ios',
      display_name: 'iPhone 14 Pro',
      first_sign_in_at: '2025-10-01T08:00:00.000Z',
      last_active_at: new Date().toISOString(), // Now
      last_location: 'Santiago, Chile',
      active: true,
      is_current_device: true,
    },
    {
      id: 2,
      platform: 'web',
      display_name: 'Chrome on Windows 11',
      first_sign_in_at: '2025-12-10T15:40:00.000Z',
      last_active_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      last_location: 'Moscow, Russia',
      active: false,
      is_current_device: false,
    },
    {
      id: 3,
      platform: 'ios',
      display_name: 'iPad Pro',
      first_sign_in_at: '2025-11-15T10:00:00.000Z',
      last_active_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      last_location: 'Santiago, Chile',
      active: true,
      is_current_device: false,
    },
    {
      id: 4,
      platform: 'android',
      display_name: 'Samsung Galaxy S23',
      first_sign_in_at: '2025-09-20T14:30:00.000Z',
      last_active_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      last_location: 'Valparaíso, Chile',
      active: true,
      is_current_device: false,
    },
  ],
  current_device_id: 1,
};

/**
 * Mock delay to simulate API call
 */
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches all devices associated with the user's account
 * Backend endpoint: GET /api/v2/notification_devices
 * 
 * Headers:
 * - Authorization: Bearer {token}
 * - X-Device-Fingerprint: {fingerprint} (optional - to identify current device)
 * 
 * Notes:
 * - Shows devices from last 3 months only
 * - Sorted: active devices first, then by most recent
 * - active: true = has active session
 * - active: false = signed out
 */
export const getUserDevices = async (token: string, deviceFingerprint?: string): Promise<DevicesResponse> => {
  if (USE_MOCK_DATA) {
    console.log('📱 Using mock devices data');
    await mockDelay(800);
    return MOCK_DEVICES_RESPONSE;
  }

  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/notification_devices`;

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    if (deviceFingerprint) {
      headers['X-Device-Fingerprint'] = deviceFingerprint;
    }

    console.log('📱 Fetching user devices...');
    console.log('   URL:', url);
    console.log('   Headers:', { ...headers, Authorization: 'Bearer [REDACTED]' });

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
    
    console.log('✅ Devices fetched successfully:', data);
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
  if (USE_MOCK_DATA) {
    console.log('🚪 Mock signing out device:', deviceId);
    await mockDelay(500);
    
    // Mock error: trying to sign out current device
    const device = MOCK_DEVICES_RESPONSE.devices.find(d => d.id === deviceId);
    if (device?.is_current_device) {
      throw new Error('CANNOT_SIGNOUT_CURRENT_DEVICE');
    }
    
    // Mock error: device not found
    if (!device) {
      throw new Error('DEVICE_NOT_FOUND');
    }
    
    // Set device as inactive (signed out)
    const deviceIndex = MOCK_DEVICES_RESPONSE.devices.findIndex(d => d.id === deviceId);
    if (deviceIndex !== -1) {
      MOCK_DEVICES_RESPONSE.devices[deviceIndex].active = false;
    }
    
    return {
      success: true,
      message: 'Sesión cerrada exitosamente',
    };
  }

  try {
    if (!token) {
      throw new Error('No hay token de autenticación disponible');
    }

    const url = `${config.apiBaseUrl}/api/v2/notification_devices/${deviceId}/sign_out`;

    console.log('🚪 Signing out device...');
    console.log('   URL:', url);
    console.log('   Device ID:', deviceId);

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
    
    console.log('📋 Response received:', data);
    console.log('✅ Device signed out successfully');
    return data;
  } catch (error) {
    console.error('❌ Error signing out device:', error);
    throw error;
  }
};

