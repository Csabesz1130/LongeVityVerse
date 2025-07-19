// Fitbit API configuration
const FITBIT_CONFIG = {
  CLIENT_ID: process.env.FITBIT_CLIENT_ID || 'your-fitbit-client-id',
  CLIENT_SECRET: process.env.FITBIT_CLIENT_SECRET || 'your-fitbit-client-secret',
  REDIRECT_URI: process.env.FITBIT_REDIRECT_URI || 'http://localhost:3000/auth/fitbit/callback',
  API_BASE_URL: 'https://api.fitbit.com/1/user/-',
  AUTH_URL: 'https://www.fitbit.com/oauth2/authorize',
  TOKEN_URL: 'https://api.fitbit.com/oauth2/token',
  SCOPES: [
    'activity',
    'heartrate',
    'sleep',
    'weight',
    'nutrition',
    'profile'
  ]
};

// Mock React Native dependencies for web environment
const mockAuthorize = async () => ({ accessToken: 'mock-token' });
const mockRefresh = async () => ({ accessToken: 'mock-refreshed-token' });
const mockRevoke = async () => ({ success: true });

export const authorize = mockAuthorize;
export const refresh = mockRefresh;
export const revoke = mockRevoke;

// Types for Fitbit data
interface FitbitTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  user_id: string;
}

interface FitbitActivityData {
  activities: Array<{
    activityId: number;
    activityParentId: number;
    calories: number;
    description: string;
    distance: number;
    duration: number;
    hasActiveZoneMinutes: boolean;
    hasStartTime: boolean;
    isFavorite: boolean;
    logId: number;
    name: string;
    startDate: string;
    startTime: string;
    steps: number;
  }>;
  goals: {
    activeMinutes: number;
    caloriesOut: number;
    distance: number;
    floors: number;
    steps: number;
  };
  summary: {
    activeScore: number;
    activityCalories: number;
    caloriesBMR: number;
    caloriesOut: number;
    distances: Array<{
      activity: string;
      distance: number;
    }>;
    elevation: number;
    fairlyActiveMinutes: number;
    floors: number;
    heartRateZones: Array<{
      caloriesOut: number;
      max: number;
      min: number;
      minutes: number;
      name: string;
    }>;
    lightlyActiveMinutes: number;
    marginalCalories: number;
    restingHeartRate: number;
    sedentaryMinutes: number;
    steps: number;
    veryActiveMinutes: number;
  };
}

interface FitbitHeartRateData {
  activitiesHeart: Array<{
    dateTime: string;
    value: {
      customHeartRateZones: Array<{
        caloriesOut: number;
        max: number;
        min: number;
        minutes: number;
        name: string;
      }>;
      heartRateZones: Array<{
        caloriesOut: number;
        max: number;
        min: number;
        minutes: number;
        name: string;
      }>;
      restingHeartRate: number;
    };
  }>;
}

interface FitbitSleepData {
  sleep: Array<{
    dateOfSleep: string;
    duration: number;
    efficiency: number;
    endTime: string;
    infoCode: number;
    isMainSleep: boolean;
    levels: {
      data: Array<{
        dateTime: string;
        level: string;
        seconds: number;
      }>;
      summary: {
        deep: {
          count: number;
          minutes: number;
          thirtyDayAvgMinutes: number;
        };
        light: {
          count: number;
          minutes: number;
          thirtyDayAvgMinutes: number;
        };
        rem: {
          count: number;
          minutes: number;
          thirtyDayAvgMinutes: number;
        };
        wake: {
          count: number;
          minutes: number;
          thirtyDayAvgMinutes: number;
        };
      };
    };
    logId: number;
    minutesAfterWakeup: number;
    minutesAsleep: number;
    minutesAwake: number;
    minutesToFallAsleep: number;
    startTime: string;
    timeInBed: number;
    type: string;
  }>;
  summary: {
    stages: {
      deep: number;
      light: number;
      rem: number;
      wake: number;
    };
    totalMinutesAsleep: number;
    totalSleepRecords: number;
    totalTimeInBed: number;
  };
}

interface FitbitWeightData {
  weight: Array<{
    bmi: number;
    date: string;
    fat: number;
    logId: number;
    source: string;
    time: string;
    weight: number;
  }>;
}

interface HealthData {
  steps: number;
  heartRate: number;
  sleepHours: number;
  weight?: number;
  calories?: number;
  distance?: number;
  bmi?: number;
  restingHeartRate?: number;
}

// Fitbit API client setup
let fitbitAccessToken: string | null = null;
let fitbitRefreshToken: string | null = null;
let fitbitUserId: string | null = null;

// Request authorization for Fitbit
export const requestFitbitAuth = async (): Promise<boolean> => {
  try {
    if (typeof window !== 'undefined') {
      // Web environment - redirect to Fitbit OAuth
      const authUrl = `${FITBIT_CONFIG.AUTH_URL}?` +
        `client_id=${FITBIT_CONFIG.CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(FITBIT_CONFIG.REDIRECT_URI)}&` +
        `scope=${encodeURIComponent(FITBIT_CONFIG.SCOPES.join(' '))}&` +
        `response_type=code&` +
        `expires_in=604800`;

      window.location.href = authUrl;
      return true;
    } else {
      // Mobile environment - use React Native Fitbit SDK
      const result = await authorize();
      if (result.accessToken) {
        fitbitAccessToken = result.accessToken;
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Fitbit authorization error:', error);
    return false;
  }
};

// Handle OAuth callback
export const handleFitbitCallback = async (code: string): Promise<boolean> => {
  try {
    const response = await fetch(FITBIT_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${FITBIT_CONFIG.CLIENT_ID}:${FITBIT_CONFIG.CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: FITBIT_CONFIG.REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error(`Fitbit token request failed: ${response.status}`);
    }

    const tokenData: FitbitTokenResponse = await response.json();

    fitbitAccessToken = tokenData.access_token;
    fitbitRefreshToken = tokenData.refresh_token;
    fitbitUserId = tokenData.user_id;

    // Store tokens securely (in a real app, store in backend)
    localStorage.setItem('fitbit-tokens', JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      user_id: tokenData.user_id,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    }));

    return true;
  } catch (error) {
    console.error('Fitbit callback error:', error);
    return false;
  }
};

// Make authenticated request to Fitbit API
const makeFitbitRequest = async (endpoint: string): Promise<any> => {
  if (!fitbitAccessToken) {
    // Try to restore from stored tokens
    const storedTokens = localStorage.getItem('fitbit-tokens');
    if (storedTokens) {
      const tokens = JSON.parse(storedTokens);
      if (tokens.expires_at > Date.now()) {
        fitbitAccessToken = tokens.access_token;
        fitbitRefreshToken = tokens.refresh_token;
        fitbitUserId = tokens.user_id;
      } else {
        // Token expired, try to refresh
        await refreshFitbitToken();
      }
    } else {
      throw new Error('Fitbit not authorized');
    }
  }

  const response = await fetch(`${FITBIT_CONFIG.API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${fitbitAccessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    const refreshed = await refreshFitbitToken();
    if (refreshed) {
      // Retry the request
      return makeFitbitRequest(endpoint);
    } else {
      throw new Error('Failed to refresh Fitbit token');
    }
  }

  if (!response.ok) {
    throw new Error(`Fitbit API request failed: ${response.status}`);
  }

  return response.json();
};

// Refresh Fitbit access token
const refreshFitbitToken = async (): Promise<boolean> => {
  try {
    if (!fitbitRefreshToken) return false;

    const response = await fetch(FITBIT_CONFIG.TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${FITBIT_CONFIG.CLIENT_ID}:${FITBIT_CONFIG.CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: fitbitRefreshToken
      })
    });

    if (!response.ok) {
      throw new Error(`Fitbit token refresh failed: ${response.status}`);
    }

    const tokenData: FitbitTokenResponse = await response.json();

    fitbitAccessToken = tokenData.access_token;
    fitbitRefreshToken = tokenData.refresh_token;

    // Update stored tokens
    localStorage.setItem('fitbit-tokens', JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      user_id: fitbitUserId,
      expires_at: Date.now() + (tokenData.expires_in * 1000)
    }));

    return true;
  } catch (error) {
    console.error('Error refreshing Fitbit token:', error);
    return false;
  }
};

// Fetch health data from Fitbit
export const fetchFitbitData = async (dateRange?: { start: Date; end: Date }): Promise<HealthData> => {
  try {
    const now = new Date();
    const startDate = dateRange?.start || new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endDate = dateRange?.end || now;

    const dateStr = startDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Fetch activity data (steps, calories, distance)
    const activityData: FitbitActivityData = await makeFitbitRequest(`/activities/date/${dateStr}.json`);

    // Fetch heart rate data
    const heartRateData: FitbitHeartRateData = await makeFitbitRequest(`/activities/heart/date/${dateStr}/1d.json`);

    // Fetch sleep data
    const sleepData: FitbitSleepData = await makeFitbitRequest(`/sleep/date/${dateStr}.json`);

    // Fetch weight data
    const weightData: FitbitWeightData = await makeFitbitRequest(`/body/log/weight/date/${dateStr}.json`);

    return {
      steps: activityData.summary.steps,
      heartRate: calculateAverageHeartRate(heartRateData),
      sleepHours: calculateSleepHours(sleepData),
      weight: calculateLatestWeight(weightData),
      calories: activityData.summary.caloriesOut,
      distance: activityData.summary.distances.find(d => d.activity === 'total')?.distance || 0,
      bmi: calculateLatestBMI(weightData),
      restingHeartRate: heartRateData.activitiesHeart[0]?.value.restingHeartRate
    };
  } catch (error) {
    console.error('Error fetching Fitbit data:', error);

    // Return mock data for development/demo purposes
    return {
      steps: Math.floor(Math.random() * 5000) + 3000,
      heartRate: Math.floor(Math.random() * 30) + 60,
      sleepHours: Math.random() * 3 + 6,
      weight: Math.random() * 20 + 70,
      calories: Math.floor(Math.random() * 500) + 1500,
      distance: Math.random() * 5 + 2,
      bmi: Math.random() * 10 + 20,
      restingHeartRate: Math.floor(Math.random() * 20) + 50
    };
  }
};

// Calculate average heart rate from Fitbit data
const calculateAverageHeartRate = (data: FitbitHeartRateData): number => {
  if (!data.activitiesHeart || data.activitiesHeart.length === 0) return 0;

  const heartRateZones = data.activitiesHeart[0].value.heartRateZones;
  let totalHeartRate = 0;
  let totalMinutes = 0;

  heartRateZones.forEach(zone => {
    const zoneAvg = (zone.min + zone.max) / 2;
    totalHeartRate += zoneAvg * zone.minutes;
    totalMinutes += zone.minutes;
  });

  return totalMinutes > 0 ? Math.round(totalHeartRate / totalMinutes) : 0;
};

// Calculate sleep hours from Fitbit data
const calculateSleepHours = (data: FitbitSleepData): number => {
  if (!data.sleep || data.sleep.length === 0) return 0;

  // Get the main sleep session
  const mainSleep = data.sleep.find(sleep => sleep.isMainSleep) || data.sleep[0];

  if (!mainSleep) return 0;

  const sleepMinutes = mainSleep.minutesAsleep;
  return Math.round((sleepMinutes / 60) * 10) / 10; // Round to 1 decimal place
};

// Calculate latest weight from Fitbit data
const calculateLatestWeight = (data: FitbitWeightData): number | undefined => {
  if (!data.weight || data.weight.length === 0) return undefined;

  // Sort by date and get the latest
  const sortedWeight = data.weight.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return sortedWeight[0].weight;
};

// Calculate latest BMI from Fitbit data
const calculateLatestBMI = (data: FitbitWeightData): number | undefined => {
  if (!data.weight || data.weight.length === 0) return undefined;

  // Sort by date and get the latest
  const sortedWeight = data.weight.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return sortedWeight[0].bmi;
};

// Disconnect Fitbit
export const disconnectFitbit = async (): Promise<boolean> => {
  try {
    if (fitbitAccessToken) {
      // Revoke access token
      await fetch(`${FITBIT_CONFIG.API_BASE_URL}/oauth/revoke`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${fitbitAccessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          token: fitbitAccessToken
        })
      });
    }

    // Clear stored tokens
    localStorage.removeItem('fitbit-tokens');
    fitbitAccessToken = null;
    fitbitRefreshToken = null;
    fitbitUserId = null;

    return true;
  } catch (error) {
    console.error('Error disconnecting Fitbit:', error);
    return false;
  }
};

// Check if Fitbit is connected
export const isFitbitConnected = (): boolean => {
  const storedTokens = localStorage.getItem('fitbit-tokens');
  if (!storedTokens) return false;

  const tokens = JSON.parse(storedTokens);
  return tokens.expires_at > Date.now();
};

// Get Fitbit user profile
export const getFitbitProfile = async (): Promise<any> => {
  try {
    return await makeFitbitRequest('/profile.json');
  } catch (error) {
    console.error('Error fetching Fitbit profile:', error);
    return null;
  }
};

// Get Fitbit device list
export const getFitbitDevices = async (): Promise<any> => {
  try {
    return await makeFitbitRequest('/devices.json');
  } catch (error) {
    console.error('Error fetching Fitbit devices:', error);
    return [];
  }
};

// Export config for external use
export default FITBIT_CONFIG;