import { useState, useEffect, useRef } from 'react';
import { Animated, Platform } from 'react-native';
import { useChartRangeStore, RangeSize } from '@/store/chartRangeStore';
import { useUserData } from '@/hooks/user/useUserData';
import { useAuth } from '@/providers/AuthProvider';
import Purchases from 'react-native-purchases';
import { useTranslation } from 'react-i18next';

export function usePatrimonyUI() {
  const { user } = useAuth();
  const { userData } = useUserData();
  const { rangeSize, setRangeSize } = useChartRangeStore();
  const { t } = useTranslation();

  // State
  const [activeTab, setActiveTab] = useState<'assets' | 'liabilities'>('assets');
  const [ownerView, setOwnerView] = useState<'mine' | 'partner' | 'both'>('mine');
  const [showSelector, setShowSelector] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSkeletons, setShowSkeletons] = useState(true);

  // Animation
  const skeletonFadeAnim = useRef(new Animated.Value(1)).current;

  // Skeleton fade animation
  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.timing(skeletonFadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowSkeletons(false);
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // RevenueCat setup
  useEffect(() => {
    const setupRevenueCat = async () => {
      try {
        if (!user?.backendUserId) {
          return;
        }

        const isConfigured = await Purchases.isConfigured();
        if (isConfigured) {
          await Purchases.logIn(user.backendUserId.toString());
          if (user.email) {
            await Purchases.setEmail(user.email);
          }
          return;
        }

        const apiKey = Platform.OS === 'android'
          ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
          : Platform.OS === 'ios'
            ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
            : null;

        if (!apiKey) {
          throw new Error(`RevenueCat API key not found for platform: ${Platform.OS}`);
        }

        await Purchases.configure({
          apiKey,
          appUserID: user.backendUserId.toString(),
        });

        if (user.email) {
          await Purchases.setEmail(user.email);
        }

      } catch (error) {
        console.error('Error inicializando RevenueCat:', error);
      }
    };

    if (user) {
      setupRevenueCat();
    }
  }, [user?.backendUserId, user?.email]);

  // Extract user initials
  const extractInitialsFromPersonalInfo = (): string => {
    try {
      if (userData?.user?.personal_information) {
        const { first_name, last_name } = userData.user.personal_information;

        if (first_name && last_name) {
          const firstInitial = first_name.charAt(0).toUpperCase();
          const lastInitial = last_name.charAt(0).toUpperCase();
          return firstInitial + lastInitial;
        }
      }
      if (user) {
        const auth0User = user as any;
        const userMetadata = auth0User['https://app.patrimore.com/user_metadata'];
        if (userMetadata?.first_name && userMetadata?.last_name) {
          const firstInitial = userMetadata.first_name.charAt(0).toUpperCase();
          const lastInitial = userMetadata.last_name.charAt(0).toUpperCase();
          return firstInitial + lastInitial;
        }

        if (auth0User.nickname) {
          const parts = auth0User.nickname.split('.');
          if (parts.length >= 2) {
            return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
          }
        }

        if (auth0User.email) {
          const username = auth0User.email.split('@')[0];
          const parts = username.split(/[._-]+/);
          if (parts.length >= 2) {
            return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
          }
          return username.slice(0, 2).toUpperCase();
        }
      }

      return 'U';
    } catch (error) {
      return 'U';
    }
  };

  // Handlers
  const handleUserViewChange = (view: 'mine' | 'partner' | 'both') => {
    setOwnerView(view);
    setShowSelector(false);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as 'assets' | 'liabilities');
  };

  // Computed values
  const userInitials = extractInitialsFromPersonalInfo();

  const tabs = [
    {
      key: 'assets',
      label: t('tabConfig.patrimony.assets'),
    },
    {
      key: 'liabilities',
      label: t('tabConfig.patrimony.liabilities'),
    }
  ];

  const TIME_RANGE_KEYS = ['1m', '6m', '1y', 'all'];
  const timeRangeOptions = TIME_RANGE_KEYS.map(key => ({
    label: t(`timeRanges.options.${key}`),
    value: key,
  }));

  return {
    // State
    activeTab,
    ownerView,
    showSelector,
    showTooltip,
    showSkeletons,
    rangeSize,

    // Animation
    skeletonFadeAnim,

    // Computed
    userInitials,
    tabs,
    timeRangeOptions,

    // Handlers
    setActiveTab,
    setOwnerView,
    setShowSelector,
    setShowTooltip,
    handleUserViewChange,
    handleTabChange,
    setRangeSize,

    // Translation
    t,
  };
}
