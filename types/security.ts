export interface NotificationPreferences {
  security_alerts: boolean;
  marketing_emails: boolean;
  product_updates: boolean;
}

export interface UserResponse {
  user: {
    notification_preferences: NotificationPreferences;
  };
}

export interface SecuritySettings {
  security_notifications_enabled: boolean;
  mfa_enabled: boolean;
  active_devices_count: number;
  untrusted_devices_count: number;
}

export interface SecuritySettingsResponse {
  security_settings: SecuritySettings;
}

export interface UpdateSecuritySettingsRequest {
  notification_preferences: {
    security_alerts: boolean;
  };
}

export interface UpdateSecuritySettingsResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string[];
  user?: {
    notification_preferences: NotificationPreferences;
  };
}
