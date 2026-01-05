/**
 * MFA Service
 *
 * Handles API calls for Multi-Factor Authentication (TOTP + Recovery Codes).
 * These endpoints communicate with the backend, which in turn calls Auth0 Management API.
 */

import config from '@/config/constants';
import type {
  MFAStatus,
  MFAEnableResponse,
  MFADisableResponse,
  MFARecoveryCodesResponse,
} from '@/types/mfa';

const getBaseUrl = () => config.apiBaseUrl;

/**
 * Get current MFA status for the authenticated user
 */
export async function getMFAStatus(accessToken: string): Promise<MFAStatus> {
  const response = await fetch(`${getBaseUrl()}/api/v2/auth/mfa/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get MFA status: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Enable MFA for the authenticated user
 * This sets user_metadata.mfa_enabled = true in Auth0
 * User will be prompted to enroll on next login
 */
export async function enableMFA(accessToken: string): Promise<MFAEnableResponse> {
  const response = await fetch(`${getBaseUrl()}/api/v2/auth/mfa/enable`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to enable MFA: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Disable MFA for the authenticated user
 * This removes MFA enrollment and sets user_metadata.mfa_enabled = false
 */
export async function disableMFA(accessToken: string): Promise<MFADisableResponse> {
  const response = await fetch(`${getBaseUrl()}/api/v2/auth/mfa/disable`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to disable MFA: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Regenerate recovery code for the authenticated user
 *
 * Backend returns: { recovery_code: "CODE", success: true }
 * We normalize to: { recovery_codes: ["CODE"] }
 */
export async function regenerateRecoveryCodes(accessToken: string): Promise<MFARecoveryCodesResponse> {
  const url = `${getBaseUrl()}/api/v2/auth/mfa/recovery-codes/regenerate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to regenerate recovery codes: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Normalize the response - backend returns single code
  // { recovery_code: "CODE", success: true } -> { recovery_codes: ["CODE"] }
  let codes: string[] = [];

  if (Array.isArray(data.recovery_codes)) {
    codes = data.recovery_codes;
  } else if (typeof data.recovery_code === 'string') {
    codes = [data.recovery_code];
  }

  return { recovery_codes: codes };
}
