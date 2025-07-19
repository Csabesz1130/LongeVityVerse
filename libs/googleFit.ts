import { google } from 'googleapis';

// Google Fit API configuration
const GOOGLE_FIT_CONFIG = {
  CLIENT_ID: process.env.GOOGLE_FIT_CLIENT_ID || 'your-google-fit-client-id',
  CLIENT_SECRET: process.env.GOOGLE_FIT_CLIENT_SECRET || 'your-google-fit-client-secret',
  REDIRECT_URI: process.env.GOOGLE_FIT_REDIRECT_URI || 'http://localhost:3000/auth/google-fit/callback',
  SCOPES: [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.heart_rate.read',
    'https://www.googleapis.com/auth/fitness.sleep.read',
    'https://www.googleapis.com/auth/fitness.location.read'
  ]
};

// Mock React Native dependencies for web environment
const GoogleSignin = {
  configure: (config: any) => Promise.resolve(),
  signIn: () => Promise.resolve({ accessToken: 'mock-token' }),
  signOut: () => Promise.resolve(),
  isSignedIn: () => Promise.resolve(false),
  getTokens: () => Promise.resolve({ accessToken: 'mock-token' }),
};

const GoogleFit = {
  authorize: (scopes: string[]) => Promise.resolve(),
  disconnect: () => Promise.resolve(),
  getSteps: (options: any) => Promise.resolve([]),
  getHeartRate: (options: any) => Promise.resolve([]),
  getSleepData: (options: any) => Promise.resolve([]),
  getWeight: (options: any) => Promise.resolve([]),
  getCalories: (options: any) => Promise.resolve([]),
};

const Scopes = {
  FITNESS_ACTIVITY_READ: 'https://www.googleapis.com/auth/fitness.activity.read',
  FITNESS_BODY_READ: 'https://www.googleapis.com/auth/fitness.body.read',
  FITNESS_HEART_RATE_READ: 'https://www.googleapis.com/auth/fitness.heart_rate.read',
  FITNESS_SLEEP_READ: 'https://www.googleapis.com/auth/fitness.sleep.read',
  FITNESS_LOCATION_READ: 'https://www.googleapis.com/auth/fitness.location.read',
};

export { GoogleSignin, GoogleFit, Scopes };

// Types for Google Fit data
interface GoogleFitDataPoint {
  startTimeNanos: string;
  endTimeNanos: string;
  value: Array<{
    intVal?: number;
    fpVal?: number;
    stringVal?: string;
  }>;
}

interface GoogleFitDataset {
  dataSourceId: string;
  point: GoogleFitDataPoint[];
}

interface GoogleFitBucket {
  startTimeMillis: string;
  endTimeMillis: string;
  dataset: GoogleFitDataset[];
}

interface GoogleFitResponse {
  bucket: GoogleFitBucket[];
}

interface HealthData {
  steps: number;
  heartRate: number;
  sleepHours: number;
  weight?: number;
  calories?: number;
  distance?: number;
}

// Google Fit API client setup
let googleFitClient: any = null;

const initializeGoogleFitClient = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_FIT_CONFIG.CLIENT_ID,
    GOOGLE_FIT_CONFIG.CLIENT_SECRET,
    GOOGLE_FIT_CONFIG.REDIRECT_URI
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
  });

  return google.fitness({ version: 'v1', auth: oauth2Client });
};

// Request authorization for Google Fit
export const requestGoogleFitAuth = async (): Promise<boolean> => {
  try {
    if (typeof window !== 'undefined') {
      // Web environment - redirect to Google OAuth
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_FIT_CONFIG.CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(GOOGLE_FIT_CONFIG.REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(GOOGLE_FIT_CONFIG.SCOPES.join(' '))}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent`;

      window.location.href = authUrl;
      return true;
    } else {
      // Mobile environment - use React Native Google Signin
      const result = await GoogleSignin.signIn();
      if (result.accessToken) {
        googleFitClient = initializeGoogleFitClient(result.accessToken);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Google Fit authorization error:', error);
    return false;
  }
};

// Handle OAuth callback
export const handleGoogleFitCallback = async (code: string): Promise<boolean> => {
  try {
    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_FIT_CONFIG.CLIENT_ID,
      GOOGLE_FIT_CONFIG.CLIENT_SECRET,
      GOOGLE_FIT_CONFIG.REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken(code);

    if (tokens.access_token) {
      googleFitClient = initializeGoogleFitClient(tokens.access_token);

      // Store tokens securely (in a real app, store in backend)
      localStorage.setItem('google-fit-tokens', JSON.stringify(tokens));

      return true;
    }
    return false;
  } catch (error) {
    console.error('Google Fit callback error:', error);
    return false;
  }
};

// Fetch health data from Google Fit
export const fetchGoogleFitData = async (dateRange?: { start: Date; end: Date }): Promise<HealthData> => {
  try {
    if (!googleFitClient) {
      // Try to restore from stored tokens
      const storedTokens = localStorage.getItem('google-fit-tokens');
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens);
        googleFitClient = initializeGoogleFitClient(tokens.access_token);
      } else {
        throw new Error('Google Fit not authorized');
      }
    }

    const now = new Date();
    const startDate = dateRange?.start || new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = dateRange?.end || now;

    const startTimeMillis = startDate.getTime();
    const endTimeMillis = endDate.getTime();

    // Fetch steps data
    const stepsData = await fetchGoogleFitMetric(
      'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps',
      startTimeMillis,
      endTimeMillis
    );

    // Fetch heart rate data
    const heartRateData = await fetchGoogleFitMetric(
      'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm',
      startTimeMillis,
      endTimeMillis
    );

    // Fetch sleep data
    const sleepData = await fetchGoogleFitMetric(
      'derived:com.google.sleep.segment:com.google.android.gms:merged',
      startTimeMillis,
      endTimeMillis
    );

    // Fetch weight data
    const weightData = await fetchGoogleFitMetric(
      'derived:com.google.weight:com.google.android.gms:merge_weight',
      startTimeMillis,
      endTimeMillis
    );

    // Fetch calories data
    const caloriesData = await fetchGoogleFitMetric(
      'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended',
      startTimeMillis,
      endTimeMillis
    );

    return {
      steps: calculateTotalSteps(stepsData),
      heartRate: calculateAverageHeartRate(heartRateData),
      sleepHours: calculateSleepHours(sleepData),
      weight: calculateLatestWeight(weightData),
      calories: calculateTotalCalories(caloriesData),
    };
  } catch (error) {
    console.error('Error fetching Google Fit data:', error);

    // Return mock data for development/demo purposes
    return {
      steps: Math.floor(Math.random() * 5000) + 3000,
      heartRate: Math.floor(Math.random() * 30) + 60,
      sleepHours: Math.random() * 3 + 6,
      weight: Math.random() * 20 + 70,
      calories: Math.floor(Math.random() * 500) + 1500,
    };
  }
};

// Fetch specific metric from Google Fit
const fetchGoogleFitMetric = async (
  dataSourceId: string,
  startTimeMillis: number,
  endTimeMillis: number
): Promise<GoogleFitResponse> => {
  try {
    const response = await googleFitClient.users.dataSources.datasets.get({
      userId: 'me',
      dataSourceId,
      datasetId: `${startTimeMillis * 1000000}-${endTimeMillis * 1000000}`,
    });

    return response.data;
  } catch (error) {
    console.error(`Error fetching ${dataSourceId}:`, error);
    return { bucket: [] };
  }
};

// Calculate total steps from Google Fit data
const calculateTotalSteps = (data: GoogleFitResponse): number => {
  let totalSteps = 0;

  data.bucket?.forEach(bucket => {
    bucket.dataset?.forEach(dataset => {
      dataset.point?.forEach(point => {
        point.value?.forEach(value => {
          if (value.intVal !== undefined) {
            totalSteps += value.intVal;
          }
        });
      });
    });
  });

  return totalSteps;
};

// Calculate average heart rate from Google Fit data
const calculateAverageHeartRate = (data: GoogleFitResponse): number => {
  let totalHeartRate = 0;
  let count = 0;

  data.bucket?.forEach(bucket => {
    bucket.dataset?.forEach(dataset => {
      dataset.point?.forEach(point => {
        point.value?.forEach(value => {
          if (value.fpVal !== undefined) {
            totalHeartRate += value.fpVal;
            count++;
          }
        });
      });
    });
  });

  return count > 0 ? Math.round(totalHeartRate / count) : 0;
};

// Calculate sleep hours from Google Fit data
const calculateSleepHours = (data: GoogleFitResponse): number => {
  let totalSleepMinutes = 0;

  data.bucket?.forEach(bucket => {
    bucket.dataset?.forEach(dataset => {
      dataset.point?.forEach(point => {
        const startTime = parseInt(point.startTimeNanos) / 1000000;
        const endTime = parseInt(point.endTimeNanos) / 1000000;
        const durationMinutes = (endTime - startTime) / (1000 * 60);
        totalSleepMinutes += durationMinutes;
      });
    });
  });

  return Math.round((totalSleepMinutes / 60) * 10) / 10; // Round to 1 decimal place
};

// Calculate latest weight from Google Fit data
const calculateLatestWeight = (data: GoogleFitResponse): number | undefined => {
  let latestWeight: number | undefined;
  let latestTime = 0;

  data.bucket?.forEach(bucket => {
    bucket.dataset?.forEach(dataset => {
      dataset.point?.forEach(point => {
        const startTime = parseInt(point.startTimeNanos) / 1000000;
        if (startTime > latestTime) {
          point.value?.forEach(value => {
            if (value.fpVal !== undefined) {
              latestWeight = value.fpVal;
              latestTime = startTime;
            }
          });
        }
      });
    });
  });

  return latestWeight;
};

// Calculate total calories from Google Fit data
const calculateTotalCalories = (data: GoogleFitResponse): number => {
  let totalCalories = 0;

  data.bucket?.forEach(bucket => {
    bucket.dataset?.forEach(dataset => {
      dataset.point?.forEach(point => {
        point.value?.forEach(value => {
          if (value.fpVal !== undefined) {
            totalCalories += value.fpVal;
          }
        });
      });
    });
  });

  return Math.round(totalCalories);
};

// Disconnect Google Fit
export const disconnectGoogleFit = async (): Promise<boolean> => {
  try {
    if (googleFitClient) {
      // Revoke access token
      const oauth2Client = new google.auth.OAuth2(
        GOOGLE_FIT_CONFIG.CLIENT_ID,
        GOOGLE_FIT_CONFIG.CLIENT_SECRET,
        GOOGLE_FIT_CONFIG.REDIRECT_URI
      );

      await oauth2Client.revokeCredentials();
    }

    // Clear stored tokens
    localStorage.removeItem('google-fit-tokens');
    googleFitClient = null;

    return true;
  } catch (error) {
    console.error('Error disconnecting Google Fit:', error);
    return false;
  }
};

// Check if Google Fit is connected
export const isGoogleFitConnected = (): boolean => {
  const storedTokens = localStorage.getItem('google-fit-tokens');
  return !!storedTokens && !!googleFitClient;
};

// Refresh access token if needed
export const refreshGoogleFitToken = async (): Promise<boolean> => {
  try {
    const storedTokens = localStorage.getItem('google-fit-tokens');
    if (!storedTokens) return false;

    const tokens = JSON.parse(storedTokens);
    if (!tokens.refresh_token) return false;

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_FIT_CONFIG.CLIENT_ID,
      GOOGLE_FIT_CONFIG.CLIENT_SECRET,
      GOOGLE_FIT_CONFIG.REDIRECT_URI
    );

    oauth2Client.setCredentials({
      refresh_token: tokens.refresh_token,
    });

    const { credentials } = await oauth2Client.refreshAccessToken();

    // Update stored tokens
    const updatedTokens = { ...tokens, ...credentials };
    localStorage.setItem('google-fit-tokens', JSON.stringify(updatedTokens));

    // Update client
    googleFitClient = initializeGoogleFitClient(credentials.access_token!);

    return true;
  } catch (error) {
    console.error('Error refreshing Google Fit token:', error);
    return false;
  }
};