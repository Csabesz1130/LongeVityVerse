// File: libs/wearableIntegration.ts

import axios from 'axios';

interface FitbitData {
  steps: number;
  heartRate: number;
  sleepHours: number;
}

export async function fetchFitbitData(accessToken: string): Promise<FitbitData> {
  try {
    const [stepsResponse, heartRateResponse, sleepResponse] = await Promise.all([
      axios.get('https://api.fitbit.com/1/user/-/activities/steps/date/today/1d.json', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      axios.get('https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      axios.get('https://api.fitbit.com/1.2/user/-/sleep/date/today.json', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ]);

    return {
      steps: parseInt(stepsResponse.data['activities-steps'][0].value),
      heartRate: heartRateResponse.data['activities-heart'][0].value.restingHeartRate,
      sleepHours: sleepResponse.data.summary.totalTimeInBed / 60 / 60
    };
  } catch (error) {
    console.error('Error fetching Fitbit data:', error);
    throw error;
  }
}