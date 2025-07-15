let environmentConfig: any = {};

try {
  const envModule = require('./environment');
  environmentConfig = envModule.environment || {};
} catch (error) {
  environmentConfig = {};
}

export const envConfig = {
  apiBaseUrl: environmentConfig.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || '',
  
  auth0Domain: environmentConfig.auth0Domain || process.env.EXPO_PUBLIC_AUTH0_DOMAIN || '',
  auth0ClientId: environmentConfig.auth0ClientId || process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID || '',
  auth0Audience: environmentConfig.auth0Audience || process.env.EXPO_PUBLIC_STAGING_AUDIENCE_API || '',
  stagingAudience: environmentConfig.stagingAudience || process.env.EXPO_PUBLIC_STAGING_AUDIENCE || '',
  
  openaiApiKey: environmentConfig.openaiApiKey || process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  
  isDevelopment: __DEV__,
  useMockData: __DEV__ && !environmentConfig.apiBaseUrl && !process.env.EXPO_PUBLIC_API_BASE_URL,
};