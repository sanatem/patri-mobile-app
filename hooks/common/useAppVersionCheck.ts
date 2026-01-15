import { useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import VersionCheck from 'react-native-version-check';
import { STORE_URLS } from '@/constants/AppConstants';

export interface UseAppVersionCheckReturn {
  isUpdateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
  storeUrl: string;
  isChecking: boolean;
  dismissUpdate: () => void;
}

interface UseAppVersionCheckOptions {
  /** Only check for updates when this is true (e.g., after login) */
  enabled?: boolean;
}

/**
 * Custom hook to check if a new app version is available in the store.
 * Queries App Store (iOS) or Play Store (Android) directly.
 * Checks once per app launch and fails silently on errors.
 * 
 * @param options.enabled - Only check when true (default: true)
 */
export function useAppVersionCheck(options: UseAppVersionCheckOptions = {}): UseAppVersionCheckReturn {
  const { enabled = true } = options;
  
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');
  const [latestVersion, setLatestVersion] = useState('');
  const [storeUrl, setStoreUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const hasChecked = useRef(false);

  const dismissUpdate = () => {
    setIsUpdateAvailable(false);
  };

  useEffect(() => {
    // Don't check if not enabled (e.g., user not logged in yet)
    if (!enabled) {
      setIsChecking(false);
      return;
    }

    // Only check once per app launch
    if (hasChecked.current) {
      return;
    }

    const checkVersion = async () => {
      // Mark as checked at the start of the async operation to prevent race conditions
      hasChecked.current = true;
      setIsChecking(true);
      try {
        // Only check on native platforms
        if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
          setIsChecking(false);
          return;
        }

        // Get current app version
        const appVersion =
          Application.nativeApplicationVersion || VersionCheck.getCurrentVersion();
        
        if (!appVersion) {
          console.warn('Could not get current app version');
          setIsChecking(false);
          return;
        }
        
        setCurrentVersion(appVersion);

        // Fetch latest store version (queries App Store / Play Store directly)
        const updateInfo = await VersionCheck.needUpdate({
          currentVersion: appVersion,
          depth: Infinity,
          ignoreErrors: true,
        });

        // Get store URL
        const platformStoreUrl =
          updateInfo?.storeUrl ||
          (await VersionCheck.getStoreUrl({
            appID: STORE_URLS.IOS_APP_ID,
            packageName: STORE_URLS.ANDROID_PACKAGE,
            ignoreErrors: true,
          })) ||
          (Platform.OS === 'ios' ? STORE_URLS.IOS : STORE_URLS.ANDROID);

        setLatestVersion(updateInfo?.latestVersion || '');
        setStoreUrl(platformStoreUrl);

        if (updateInfo?.isNeeded) {
          setIsUpdateAvailable(true);
        }
      } catch (error) {
        // Fail silently - don't block app usage
        console.warn('Version check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkVersion();
  }, [enabled]);

  return {
    isUpdateAvailable,
    currentVersion,
    latestVersion,
    storeUrl,
    isChecking,
    dismissUpdate,
  };
}
