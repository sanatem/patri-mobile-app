export interface Device {
  id: number;
  platform: 'ios' | 'android' | 'web';
  display_name: string;
  first_sign_in_at: string;
  last_active_at: string;
  last_location: string;
  active: boolean; // true = has active session, false = signed out
  is_current_device: boolean;
}

export interface SignOutDeviceRequest {
  deviceId: number;
}

export interface SignOutDeviceResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface DevicesResponse {
  devices: Device[];
  current_device_id: number;
}
