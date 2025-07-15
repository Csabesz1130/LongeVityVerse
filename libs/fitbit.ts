// Mock React Native dependencies for web environment
const mockAuthorize = async () => ({ accessToken: 'mock-token' });
const mockRefresh = async () => ({ accessToken: 'mock-refreshed-token' });
const mockRevoke = async () => ({ success: true });

export const authorize = mockAuthorize;
export const refresh = mockRefresh;
export const revoke = mockRevoke;

// Mock config
const Config = {
  FITBIT_CLIENT_ID: process.env.FITBIT_CLIENT_ID || 'mock-client-id',
  FITBIT_CLIENT_SECRET: process.env.FITBIT_CLIENT_SECRET || 'mock-client-secret',
  FITBIT_REDIRECT_URI: process.env.FITBIT_REDIRECT_URI || 'http://localhost:3000/auth/fitbit/callback',
};

export default Config;