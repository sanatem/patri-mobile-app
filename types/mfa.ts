/**
 * MFA (Multi-Factor Authentication) Type Definitions
 *
 * These types support Auth0 TOTP and Recovery Codes implementation.
 */

/**
 * MFA factors supported by the app
 */
export type MFAFactorType = 'otp' | 'recovery-code';

/**
 * MFA enrollment status for a user
 */
export interface MFAEnrollment {
  id: string;
  type: MFAFactorType;
  enrolledAt?: string;
}

/**
 * Response from GET /api/v2/auth/mfa/status
 */
export interface MFAStatus {
  /** Whether user has opted into MFA in settings */
  mfa_enabled: boolean;
  /** Whether user has completed MFA enrollment */
  enrolled: boolean;
  /** List of enrolled factor types */
  factors: MFAFactorType[];
  /** Number of unused recovery codes remaining (null if not enrolled) */
  recovery_codes_remaining: number | null;
}

/**
 * Response from POST /api/v2/auth/mfa/enable
 */
export interface MFAEnableResponse {
  success: boolean;
  message: string;
}

/**
 * Response from DELETE /api/v2/auth/mfa/disable
 */
export interface MFADisableResponse {
  success: boolean;
  message: string;
}

/**
 * Response from POST /api/v2/auth/mfa/recovery-codes/regenerate
 */
export interface MFARecoveryCodesResponse {
  recovery_codes: string[];
}

/**
 * State for useMFA hook
 */
export interface MFAState {
  /** Current MFA status */
  status: MFAStatus | null;
  /** Whether status is being loaded */
  isLoading: boolean;
  /** Whether an action is in progress (enable/disable/regenerate) */
  isProcessing: boolean;
  /** Error message if any */
  error: string | null;
  /** Newly generated recovery codes (shown after regeneration) */
  newRecoveryCodes: string[] | null;
  /** Whether the user needs to generate recovery codes (first-time after TOTP enrollment) */
  needsRecoveryCodesSetup: boolean;
}

/**
 * Actions for useMFA hook
 */
export interface MFAActions {
  /** Fetch current MFA status */
  fetchStatus: () => Promise<void>;
  /** Enable MFA for the user */
  enableMFA: () => Promise<boolean>;
  /** Disable MFA for the user */
  disableMFA: () => Promise<boolean>;
  /** Regenerate recovery codes */
  regenerateRecoveryCodes: () => Promise<string[] | null>;
  /** Clear error state */
  clearError: () => void;
  /** Clear new recovery codes after user has seen them */
  clearNewRecoveryCodes: () => void;
  /** Dismiss the first-time recovery codes prompt */
  dismissRecoveryCodesPrompt: () => Promise<void>;
  /** Reset the recovery codes prompt (call when MFA is re-enabled) */
  resetRecoveryCodesPrompt: () => Promise<void>;
}

/**
 * Complete return type for useMFA hook
 */
export type UseMFAReturn = MFAState & MFAActions;
