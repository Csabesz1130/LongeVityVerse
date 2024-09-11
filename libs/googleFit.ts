import { GoogleSignin } from '@react-native-google-signin/google-signin';
import GoogleFit, { Scopes } from 'react-native-google-fit';

const GOOGLE_FIT_SCOPES = [
  Scopes.FITNESS_ACTIVITY_READ,
  Scopes.FITNESS_BODY_READ,
  Scopes.FITNESS_HEART_RATE_READ,
  Scopes.FITNESS_SLEEP_READ,
];

export const requestAuthorization = async (): Promise<boolean> => {
  try {
    await GoogleSignin.hasPlayServices();
    await GoogleSignin.configure({
      scopes: GOOGLE_FIT_SCOPES,
    });
    await GoogleSignin.signIn();
    const options = {
      scopes: GOOGLE_FIT_SCOPES,
    };
    const authorized = await GoogleFit.authorize(options);
    return authorized.success;
  } catch (error) {
    console.error('Error requesting Google Fit authorization:', error);
    return false;
  }
};

export const fetchHealthData = async (): Promise<{
  steps: number;
  heartRate: number;
  sleepHours: number;
}> => {
  const today = new Date();
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endDate = new Date(today.getTime());

  try {
    const steps = await GoogleFit.getDailyStepCountSamples({ startDate, endDate });
    const heartRate = await GoogleFit.getHeartRateSamples({ startDate, endDate });
    const sleep = await GoogleFit.getSleepSamples({ startDate, endDate });

    return {
      steps: steps.reduce((sum, dataset) => sum + dataset.steps, 0),
      heartRate: calculateAverageHeartRate(heartRate),
      sleepHours: calculateSleepHours(sleep),
    };
  } catch (error) {
    console.error('Error fetching Google Fit data:', error);
    throw error;
  }
};

const calculateAverageHeartRate = (heartRateData: any[]): number => {
  if (heartRateData.length === 0) return 0;
  const sum = heartRateData.reduce((total, data) => total + data.value, 0);
  return sum / heartRateData.length;
};

const calculateSleepHours = (sleepData: any[]): number => {
  if (sleepData.length === 0) return 0;
  const totalMilliseconds = sleepData.reduce((total, data) => {
    return total + (data.endDate - data.startDate);
  }, 0);
  return totalMilliseconds / (1000 * 60 * 60); // Convert milliseconds to hours
};