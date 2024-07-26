import AppleHealthKit, { HealthKitPermissions, HealthValue } from 'react-native-health';

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
    ],
    write: [],
  },
};

export const requestAuthorization = (): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.log('[ERROR] Cannot grant permissions');
        reject(false);
      }
      resolve(true);
    });
  });
};

export const fetchHealthData = async (): Promise<{
  steps: number;
  heartRate: number;
  sleepHours: number;
}> => {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const stepsData: HealthValue = await new Promise((resolve, reject) => {
    AppleHealthKit.getStepCount(
      { startDate: startDate.toISOString() },
      (error: string, results: HealthValue) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      }
    );
  });

  const heartRateData: HealthValue = await new Promise((resolve, reject) => {
    AppleHealthKit.getHeartRateSamples(
      { startDate: startDate.toISOString() },
      (error: string, results: HealthValue) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      }
    );
  });

  const sleepData: HealthValue = await new Promise((resolve, reject) => {
    AppleHealthKit.getSleepSamples(
      { startDate: startDate.toISOString() },
      (error: string, results: HealthValue) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      }
    );
  });

  return {
    steps: stepsData.value || 0,
    heartRate: heartRateData.value || 0,
    sleepHours: calculateSleepHours(sleepData),
  };
};

const calculateSleepHours = (sleepData: HealthValue): number => {
  // Implement sleep calculation logic based on the sleepData
  // This is a placeholder implementation
  return sleepData.value || 0;
};