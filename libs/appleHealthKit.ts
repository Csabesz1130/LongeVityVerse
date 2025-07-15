// Mock React Native Health for web environment
const AppleHealthKit = {
  Constants: {
    Permissions: {
      Steps: 'Steps',
      HeartRate: 'HeartRate',
      SleepAnalysis: 'SleepAnalysis',
    },
  },
  initHealthKit: (permissions: any, callback: (error: string | null) => void) => {
    // Mock successful authorization
    callback(null);
  },
  getStepCount: (options: any, callback: (error: string | null, results: any) => void) => {
    // Mock step count data
    callback(null, { value: 8500 });
  },
  getHeartRateSamples: (options: any, callback: (error: string | null, results: any) => void) => {
    // Mock heart rate data
    callback(null, { value: 72 });
  },
  getSleepSamples: (options: any, callback: (error: string | null, results: any) => void) => {
    // Mock sleep data
    callback(null, { value: 7.5 });
  },
};

interface HealthKitPermissions {
  permissions: {
    read: string[];
    write: string[];
  };
}

interface HealthValue {
  value: number;
  startDate?: string;
  endDate?: string;
}

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
    AppleHealthKit.initHealthKit(permissions, (error: string | null) => {
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
      (error: string | null, results: HealthValue) => {
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
      (error: string | null, results: HealthValue) => {
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
      (error: string | null, results: HealthValue) => {
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