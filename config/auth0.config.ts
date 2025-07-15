import { envConfig } from './env.config';

export const auth0Config = {
  domain: envConfig.auth0Domain,
  clientId: envConfig.auth0ClientId,
  audience: envConfig.auth0Audience,
}; 