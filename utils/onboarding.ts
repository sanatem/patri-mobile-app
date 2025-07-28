import AsyncStorage from '@react-native-async-storage/async-storage';

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