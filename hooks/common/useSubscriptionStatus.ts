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

      console.log('🔍 RevenueCat Debug Info:', {
        hasActiveEntitlements,
        hasPremiumEntitlement,
        hasAnyPremiumAccess,
        activeEntitlements: Object.keys(customerInfo.entitlements.active),
        allEntitlements: Object.keys(customerInfo.entitlements.all),
        customerInfoRaw: customerInfo
      });

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
    console.log('🔄 Refreshing subscription status...');
    await checkSubscriptionStatus();
  };

  const forceRefresh = async () => {
    console.log('🚀 Force refreshing subscription status...');
    // Reset states first
    setIsSubscribed(false);
    setIsPremium(false);
    setError(null);
    // Then check again
    await checkSubscriptionStatus();
  };

  useEffect(() => {
    if (user?.backendUserId) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [user?.backendUserId, checkSubscriptionStatus]);

  // Listen for RevenueCat purchase events
  useEffect(() => {
    const purchaseListener = (customerInfo: any) => {
      console.log('📦 RevenueCat purchase event received:', customerInfo);
      // Force refresh when a purchase is completed
      checkSubscriptionStatus();
    };

    try {
      // Add listener
      Purchases.addCustomerInfoUpdateListener(purchaseListener);
      console.log('🎧 RevenueCat listener added successfully');
    } catch (error) {
      console.error('Error adding RevenueCat listener:', error);
    }

    // Note: RevenueCat listeners are automatically cleaned up when the component unmounts
    return () => {
      console.log('🧹 Cleaning up RevenueCat listeners');
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