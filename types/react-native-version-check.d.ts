declare module 'react-native-version-check' {
  interface NeedUpdateOptions {
    currentVersion?: string;
    latestVersion?: string;
    depth?: number;
    forceUpdate?: boolean;
    ignoreErrors?: boolean;
  }

  interface NeedUpdateResult {
    isNeeded: boolean;
    currentVersion: string;
    latestVersion: string;
    storeUrl?: string;
  }

  interface GetStoreUrlOptions {
    appID?: string;
    packageName?: string;
    ignoreErrors?: boolean;
  }

  const VersionCheck: {
    getCurrentVersion(): string;
    needUpdate(options?: NeedUpdateOptions): Promise<NeedUpdateResult | null>;
    getStoreUrl(options?: GetStoreUrlOptions): Promise<string>;
  };

  export default VersionCheck;
}
