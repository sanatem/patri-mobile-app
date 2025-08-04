import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserResponse } from '@/services/user/get-user';

export const clearOnboardingData = async () => {
  try {
    await AsyncStorage.removeItem('onboarding_completed');
    await AsyncStorage.removeItem('has_seen_onboarding');
    return true;
  } catch (error) {
    return false;
  }
};

export const getOnboardingStatus = async () => {
  try {
    const onboardingCompleted = await AsyncStorage.getItem('onboarding_completed');
    const hasSeenOnboarding = await AsyncStorage.getItem('has_seen_onboarding');
    
    return {
      isCompleted: onboardingCompleted === 'true',
      hasSeen: hasSeenOnboarding === 'true',
      onboardingCompleted,
      hasSeenOnboarding
    };
  } catch (error) {
    return {
      isCompleted: false,
      hasSeen: false,
      onboardingCompleted: null,
      hasSeenOnboarding: null
    };
  }
};

export const markOnboardingCompleted = async () => {
  try {
    await AsyncStorage.setItem('onboarding_completed', 'true');
    return true;
  } catch (error) {
    return false;
  }
};

export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem('onboarding_completed');
    await AsyncStorage.removeItem('has_seen_onboarding');
    return true;
  } catch (error) {
    return false;
  }
}; 

export interface OnboardingValidationResult {
  isComplete: boolean;
  missingFields: string[];
  hasAllRequiredData: boolean;
}

export function validateOnboardingCompleteness(userData: UserResponse | null): OnboardingValidationResult {
  if (!userData || !userData.user) {
    return {
      isComplete: false,
      missingFields: ['Datos de usuario no disponibles'],
      hasAllRequiredData: false
    };
  }

  const { personal_information } = userData.user;
  const missingFields: string[] = [];

  if (!personal_information.rut || personal_information.rut.trim() === '') {
    missingFields.push('RUT');
  }

  if (!personal_information.birth_date || personal_information.birth_date.trim() === '') {
    missingFields.push('Fecha de nacimiento');
  }

  if (!personal_information.monthly_incomes || personal_information.monthly_incomes === 0) {
    missingFields.push('Ingresos mensuales');
  }

  if (!personal_information.residence_country_name || personal_information.residence_country_name.trim() === '') {
    missingFields.push('País de residencia');
  }

  const hasAllRequiredData = missingFields.length === 0;

  return {
    isComplete: hasAllRequiredData,
    missingFields,
    hasAllRequiredData
  };
}

export function shouldShowOnboarding(userData: UserResponse | null): boolean {
  const validation = validateOnboardingCompleteness(userData);
  return !validation.isComplete;
} 