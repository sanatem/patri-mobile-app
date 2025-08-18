const isDevBuild = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const explicitBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  (isDevBuild ? process.env.EXPO_PUBLIC_STAGING_AUDIENCE : process.env.EXPO_PUBLIC_PRODUCTION_AUDIENCE);

const defaultBaseUrl = isDevBuild ? 'https://staging.patrimore.com' : 'https://app.patrimore.com';

export default {
  apiBaseUrl: explicitBaseUrl || defaultBaseUrl,
  auth0Domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN,
  auth0ClientId: process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID
};