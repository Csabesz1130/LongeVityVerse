import { authorize, refresh, revoke } from 'react-native-app-auth';
import Config from 'react-native-config';

const fitbitAuthConfig = {
  issuer: 'https://api.fitbit.com',
  clientId: Config.FITBIT_CLIENT_ID,
  clientSecret: Config.FITBIT_CLIENT_SECRET,
  redirectUrl: Config.FITBIT_REDIRECT_URI,
  scopes: ['activity', 'heartrate', 'sleep'],
};

let accessToken: string | null = null;

export const requestAuthorization = async (): Promise<boolean> => {
  try {
    const result = await authorize(fitbitAuthConfig);
    accessToken = result.accessToken;
    return true;
  } catch (error) {
    console.error('Error requesting Fitbit authorization:', error);
    return false;
  }
};

export const fetchHealthData = async (): Promise<{
  steps: number;
  heartRate: number;
  sleepHours: number;
}> => {
  if (!accessToken) {
    throw new Error('Not authorized. Please connect to Fitbit first.');
  }

  const today = new Date().toISOString().split('T')[0];

  try {
    const [stepsResponse, heartRateResponse, sleepResponse] = await Promise.all([
      fetch(`https://api.fitbit.com/1/user/-/activities/date/${today}.json`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
      fetch(`https://api.fitbit.com/1.2/user/-/sleep/date/${today}.json`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    ]);

    const stepsData = await stepsResponse.json();
    const heartRateData = await heartRateResponse.json();
    const sleepData = await sleepResponse.json();

    return {
      steps: stepsData.summary.steps,
      heartRate: calculateAverageHeartRate(heartRateData),
      sleepHours: calculateSleepHours(sleepData),
    };
  } catch (error) {
    console.error('Error fetching Fitbit data:', error);
    throw error;
  }
};

const calculateAverageHeartRate = (heartRateData: any): number => {
  const heartRateValues = heartRateData['activities-heart-intraday'].dataset;
  if (heartRateValues.length === 0) return 0;
  const sum = heartRateValues.reduce((total: number, data: any) => total + data.value, 0);
  return sum / heartRateValues.length;
};

const calculateSleepHours = (sleepData: any): number => {
  if (!sleepData.summary.totalTimeInBed) return 0;
  return sleepData.summary.totalTimeInBed / 60; // Convert minutes to hours
};