import { useState, useEffect } from 'react';
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
  loading: boolean;
  error: string | null;
}

export function useSubscriptionStatus(): SubscriptionStatus {
  const { userData, loading: userLoading } = useUserData();
  const { user } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        const isConfigured = await Purchases.isConfigured();
        if (!isConfigured) {
          console.warn('RevenueCat not configured yet');
          setIsSubscribed(false);
          return;
        }

        const customerInfo = await Purchases.getCustomerInfo();
        
        const hasActiveEntitlements = Object.values(customerInfo.entitlements.active).length > 0;
        
        const hasPremiumEntitlement = customerInfo.entitlements.active['premium'] !== undefined;
        
        setIsSubscribed(hasPremiumEntitlement || hasActiveEntitlements);
        setIsPremium(hasPremiumEntitlement);

        

      } catch (err) {
        console.error('Error checking subscription status:', err);
        setError(err instanceof Error ? err.message : 'Error checking subscription');
        setIsSubscribed(false);
      } finally {
        setLoading(false);
      }
    };

    if (user?.backendUserId) {
      checkSubscriptionStatus();
    } else {
      setLoading(false);
    }
  }, [user?.backendUserId]);

  const userPlan = userData?.user?.plan;
  const isFreePlan = Boolean(userPlan === 'Gratis' || userPlan === 'gratis' || userPlan === 'FREE' || userPlan === 'free');
  const isPaidPlan = Boolean(!isFreePlan && userPlan && userPlan !== '');

  const apiUrl = process.env.EXPO_PUBLIC_API_URL || '';
  const isStagingEnvironment = Boolean(apiUrl.includes('staging') || apiUrl.includes('dev'));

  const shouldBlockTabs = isFreePlan && !isSubscribed && !isPremium && !isPaidPlan;



  return {
    isSubscribed,
    isPremium,
    isFreePlan,
    isPaidPlan,
    isStagingEnvironment,
    shouldBlockTabs,
    loading: loading || userLoading,
    error
  };
} 