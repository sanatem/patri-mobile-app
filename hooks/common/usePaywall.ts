import { useState } from 'react';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

export interface PaywallResult {
  success: boolean;
  cancelled: boolean;
  error?: string;
}

export function usePaywall() {
  const [isLoading, setIsLoading] = useState(false);

  const presentPaywall = async (): Promise<PaywallResult> => {
    try {
      setIsLoading(true);
      
      // Present paywall for current offering
      const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall();

      switch (paywallResult) {
        case PAYWALL_RESULT.NOT_PRESENTED:
        case PAYWALL_RESULT.ERROR:
          return { success: false, cancelled: false, error: 'Error presenting paywall' };
        case PAYWALL_RESULT.CANCELLED:
          return { success: false, cancelled: true };
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          return { success: true, cancelled: false };
        default:
          return { success: false, cancelled: false, error: 'Unknown result' };
      }
    } catch (error) {
      console.error('Error presenting paywall:', error);
      return { 
        success: false, 
        cancelled: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const presentPaywallIfNeeded = async (): Promise<PaywallResult> => {
    try {
      setIsLoading(true);
      
      // Present paywall for current offering if needed
      const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: "premium"
      });

      switch (paywallResult) {
        case PAYWALL_RESULT.NOT_PRESENTED:
          // User already has premium access
          return { success: true, cancelled: false };
        case PAYWALL_RESULT.ERROR:
          return { success: false, cancelled: false, error: 'Error presenting paywall' };
        case PAYWALL_RESULT.CANCELLED:
          return { success: false, cancelled: true };
        case PAYWALL_RESULT.PURCHASED:
        case PAYWALL_RESULT.RESTORED:
          return { success: true, cancelled: false };
        default:
          return { success: false, cancelled: false, error: 'Unknown result' };
      }
    } catch (error) {
      console.error('Error presenting paywall if needed:', error);
      return { 
        success: false, 
        cancelled: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumAccess = async (): Promise<boolean> => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active["premium"] !== undefined;
    } catch (error) {
      console.error('Error checking premium access:', error);
      return false;
    }
  };

  return {
    presentPaywall,
    presentPaywallIfNeeded,
    checkPremiumAccess,
    isLoading
  };
}
