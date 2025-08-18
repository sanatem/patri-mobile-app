const isDevBuild = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

const audience = isDevBuild
  ? (process.env.EXPO_PUBLIC_STAGING_AUDIENCE_API || process.env.EXPO_PUBLIC_STAGING_AUDIENCE || 'https://staging.patrimore.com')
  : (process.env.EXPO_PUBLIC_PRODUCTION_AUDIENCE_API || process.env.EXPO_PUBLIC_PRODUCTION_AUDIENCE || 'https://app.patrimore.com');

const clientId = isDevBuild
  ? process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID
  : (process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID_PRODUCTION || process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID);

export const auth0Config = {
  domain: process.env.EXPO_PUBLIC_AUTH0_DOMAIN,
  clientId,
  audience,
}; 