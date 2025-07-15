import { envConfig } from './env.config';

export default {
  apiBaseUrl: envConfig.apiBaseUrl,
  auth0Domain: envConfig.auth0Domain,
  auth0ClientId: envConfig.auth0ClientId
};