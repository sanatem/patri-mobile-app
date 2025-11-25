import config from '@/config/constants';

export interface IdentityCardData {
  id: number;
  user_id: number;
  verified: boolean;
  front_url: string;
  back_url: string;
  created_at: string;
  updated_at: string;
}

export interface ExtractedData {
  first_name: string;
  last_name: string;
  full_name: string;
  document_number: string;
  date_of_birth: string;
  expiry_date: string | null;
  issue_date: string | null;
  issuer_org: string | null;
  nationality: string | null;
  sex: string | null;
}

export interface ValidationDetails {
  is_confident: boolean;
  is_not_expired: boolean;
  is_from_chile: boolean;
  api_verification_passed: boolean;
}

export interface VerificationData {
  verified: boolean;
  extracted_data: ExtractedData;
  validation_details: ValidationDetails;
  errors: Record<string, string>;
  confidence_scores: Record<string, number>;
}

export interface VerifyIdentityCardResponse {
  success: boolean;
  message?: string;
  data?: {
    identity_card: IdentityCardData;
    verification: VerificationData;
  };
  error?: string;
}

export interface ExtractedPersonalData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  birthdate: string;
  nationality: string;
  documentNumber: string;
  sex: string;
}

export async function verifyIdentityCard(token: string): Promise<VerifyIdentityCardResponse> {
  try {
    const url = `${config.apiBaseUrl}/api/v2/user/identity_card/verify`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return {
        success: true,
        message: data.message || 'Identity card verified successfully',
        data: data.data,
      };
    }

    return {
      success: false,
      message: data.message || 'Error verifying identity card',
      error: data.error,
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error verifying identity card',
    };
  }
}

export function extractPersonalDataFromResponse(response: VerifyIdentityCardResponse): ExtractedPersonalData | null {
  if (!response.success || !response.data?.verification?.extracted_data) {
    return null;
  }

  const { extracted_data } = response.data.verification;

  // Convertir fecha de formato "1995/07/22" a "1995-07-22"
  const formatDate = (date: string | null): string => {
    if (!date) return '';
    return date.replace(/\//g, '-');
  };

  return {
    firstName: extracted_data.first_name || '',
    lastName: extracted_data.last_name || '',
    dateOfBirth: formatDate(extracted_data.date_of_birth),
    birthdate: formatDate(extracted_data.date_of_birth),
    nationality: extracted_data.nationality || '',
    documentNumber: extracted_data.document_number || '',
    sex: extracted_data.sex || '',
  };
}
