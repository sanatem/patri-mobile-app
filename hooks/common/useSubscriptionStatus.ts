import { useState, useEffect, useCallback } from 'react';
import Purchases from 'react-native-purchases';
import { useUserData } from '@/hooks/user/useUserData';
import { useAuth } from '@/providers/AuthProvider';

export const checkPremiumEntitlement = async (): Promise<boolean> => {
  try {
    const isConfigured = await Purchases.isConfigured();
    if (!isConfigured) {
      return false;
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo.entitlements.active['premium'] !== undefined;
  } catch (error) {
    console.error('Error checking premium entitlement:', error);
    return false;
  }
};

export interface SubscriptionStatus {
  isSubscribed: boolean;
  isPremium: boolean;
  isFreePlan: boolean;
  isPaidPlan: boolean;
  isStagingEnvironment: boolean;
  shouldBlockTabs: boolean;
  shouldBlockTab: (tabName: string) => boolean;
  loading: boolean;
  error: string | null;
  refreshSubscriptionStatus: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

export function useSubscriptionStatus(): SubscriptionStatus {
  const { userData, loading: userLoading } = useUserData();
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSubscriptionStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const isConfigured = await Purchases.isConfigured();
      if (!isConfigured) {
        console.warn('RevenueCat not configured yet');
        setIsSubscribed(false);
        setIsPremium(false);
        return;
      }

      const customerInfo = await Purchases.getCustomerInfo();

      const hasActiveEntitlements = Object.values(customerInfo.entitlements.active).length > 0;

      const hasPremiumEntitlement = customerInfo.entitlements.active['premium'] !== undefined;

      const hasAnyPremiumAccess = hasPremiumEntitlement;


      setIsSubscribed(hasAnyPremiumAccess || hasActiveEntitlements);
      setIsPremium(hasAnyPremiumAccess);

    } catch (err) {
      console.error('Error checking subscription status:', err);
      setError(err instanceof Error ? err.message : 'Error checking subscription');
      setIsSubscribed(false);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSubscriptionStatus = async () => {

    await checkSubscriptionStatus();
  };

  const forceRefresh = async () => {
    setIsSubscribed(false);
    setIsPremium(false);
    setError(null);

    await checkSubscriptionStatus();
  };

  useEffect(() => {
    if (user?.backendUserId) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [user?.backendUserId, checkSubscriptionStatus]);

  useEffect(() => {
    const purchaseListener = (customerInfo: any) => {
      checkSubscriptionStatus();
    };

    const setupListener = async () => {
      try {
        const isConfigured = await Purchases.isConfigured();
        if (!isConfigured) {
          console.log('⚠️ RevenueCat not configured, skipping listener setup');
          return;
        }
        
        Purchases.addCustomerInfoUpdateListener(purchaseListener);
      } catch (error) {
        console.error('Error adding RevenueCat listener:', error);
      }
    };

    setupListener();

  
    return () => {
    };
  }, [checkSubscriptionStatus]);

  const userPlan = userData?.user?.plan;
  const isFreePlan = Boolean(userPlan === 'Gratis' || userPlan === 'gratis' || userPlan === 'FREE' || userPlan === 'free');
  const isPaidPlan = Boolean(!isFreePlan && userPlan && userPlan !== '');

  const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
  const isStagingEnvironment = Boolean(apiUrl.includes('staging') || apiUrl.includes('dev'));

  const shouldBlockTabs = isFreePlan && !isSubscribed && !isPremium && !isPaidPlan;

  const shouldBlockTab = (tabName: string): boolean => {
    if (tabName.toLowerCase() === 'patrimonio' || tabName.toLowerCase() === 'patrimony') {
      return false;
    }
    
    return shouldBlockTabs;
  };

  return {
    isSubscribed,
    isPremium,
    isFreePlan,
    isPaidPlan,
    isStagingEnvironment,
    shouldBlockTabs,
    shouldBlockTab,
    loading: loading || userLoading,
    error,
    refreshSubscriptionStatus,
    forceRefresh
  };
} 