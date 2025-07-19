// Mock React Native Health for web environment
const AppleHealthKit = {
  Constants: {
    Permissions: {
      Steps: 'Steps',
      HeartRate: 'HeartRate',
      SleepAnalysis: 'SleepAnalysis',
      Weight: 'Weight',
      BloodPressure: 'BloodPressure',
      BodyMass: 'BodyMass',
      BodyFatPercentage: 'BodyFatPercentage',
      ActiveEnergyBurned: 'ActiveEnergyBurned',
      DistanceWalkingRunning: 'DistanceWalkingRunning',
      FlightsClimbed: 'FlightsClimbed',
      RespiratoryRate: 'RespiratoryRate',
      OxygenSaturation: 'OxygenSaturation',
      BodyTemperature: 'BodyTemperature',
    },
    SleepValue: {
      InBed: 'INBED',
      Asleep: 'ASLEEP',
      Awake: 'AWAKE',
      DeepSleep: 'DEEPSLEEP',
      LightSleep: 'LIGHTSLEEP',
      REMSleep: 'REMSLEEP',
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
    // Mock sleep data with detailed sleep stages
    callback(null, {
      value: [
        {
          startDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          sleepValue: 'ASLEEP',
          sleepStage: 'DEEPSLEEP'
        },
        {
          startDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          sleepValue: 'ASLEEP',
          sleepStage: 'LIGHTSLEEP'
        },
        {
          startDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          sleepValue: 'ASLEEP',
          sleepStage: 'REMSLEEP'
        },
        {
          startDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
          sleepValue: 'AWAKE',
          sleepStage: 'AWAKE'
        }
      ]
    });
  },
  getWeight: (options: any, callback: (error: string | null, results: any) => void) => {
    // Mock weight data
    callback(null, { value: 70.5 });
  },
  getBloodPressure: (options: any, callback: (error: string | null, results: any) => void) => {
    // Mock blood pressure data
    callback(null, { systolicValue: 120, diastolicValue: 80 });
  },
  getActiveEnergyBurned: (options: any, callback: (error: string | null, results: any) => void) => {
    // Mock active energy burned data
    callback(null, { value: 450 });
  },
  getDistanceWalkingRunning: (options: any, callback: (error: string | null, results: any) => void) => {
    // Mock distance data
    callback(null, { value: 6.2 });
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

interface SleepSample {
  startDate: string;
  endDate: string;
  sleepValue: string;
  sleepStage?: string;
}

interface SleepData {
  value: SleepSample[];
}

interface BloodPressureData {
  systolicValue: number;
  diastolicValue: number;
}

interface HealthData {
  steps: number;
  heartRate: number;
  sleepHours: number;
  weight?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  activeEnergyBurned?: number;
  distance?: number;
  sleepStages?: {
    deep: number;
    light: number;
    rem: number;
    awake: number;
  };
}

const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.Weight,
      AppleHealthKit.Constants.Permissions.BloodPressure,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
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

export const fetchHealthData = async (): Promise<HealthData> => {
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

  const sleepData: SleepData = await new Promise((resolve, reject) => {
    AppleHealthKit.getSleepSamples(
      { startDate: startDate.toISOString() },
      (error: string | null, results: SleepData) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      }
    );
  });

  const weightData: HealthValue = await new Promise((resolve, reject) => {
    AppleHealthKit.getWeight(
      { startDate: startDate.toISOString() },
      (error: string | null, results: HealthValue) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      }
    );
  });

  const bloodPressureData: BloodPressureData = await new Promise((resolve, reject) => {
    AppleHealthKit.getBloodPressure(
      { startDate: startDate.toISOString() },
      (error: string | null, results: BloodPressureData) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      }
    );
  });

  const activeEnergyData: HealthValue = await new Promise((resolve, reject) => {
    AppleHealthKit.getActiveEnergyBurned(
      { startDate: startDate.toISOString() },
      (error: string | null, results: HealthValue) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      }
    );
  });

  const distanceData: HealthValue = await new Promise((resolve, reject) => {
    AppleHealthKit.getDistanceWalkingRunning(
      { startDate: startDate.toISOString() },
      (error: string | null, results: HealthValue) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      }
    );
  });

  const sleepAnalysis = calculateSleepHours(sleepData);

  return {
    steps: stepsData.value || 0,
    heartRate: heartRateData.value || 0,
    sleepHours: sleepAnalysis.totalHours,
    weight: weightData.value,
    bloodPressure: bloodPressureData ? {
      systolic: bloodPressureData.systolicValue,
      diastolic: bloodPressureData.diastolicValue
    } : undefined,
    activeEnergyBurned: activeEnergyData.value,
    distance: distanceData.value,
    sleepStages: sleepAnalysis.stages,
  };
};

const calculateSleepHours = (sleepData: SleepData): { totalHours: number; stages: any } => {
  if (!sleepData.value || sleepData.value.length === 0) {
    return { totalHours: 0, stages: { deep: 0, light: 0, rem: 0, awake: 0 } };
  }

  let totalSleepMinutes = 0;
  let deepSleepMinutes = 0;
  let lightSleepMinutes = 0;
  let remSleepMinutes = 0;
  let awakeMinutes = 0;

  // Sort sleep samples by start date
  const sortedSamples = sleepData.value.sort((a, b) =>
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  // Process each sleep sample
  sortedSamples.forEach(sample => {
    const startTime = new Date(sample.startDate).getTime();
    const endTime = new Date(sample.endDate).getTime();
    const durationMinutes = (endTime - startTime) / (1000 * 60);

    // Categorize sleep stages
    switch (sample.sleepValue) {
      case AppleHealthKit.Constants.SleepValue.Asleep:
        switch (sample.sleepStage) {
          case AppleHealthKit.Constants.SleepValue.DeepSleep:
            deepSleepMinutes += durationMinutes;
            totalSleepMinutes += durationMinutes;
            break;
          case AppleHealthKit.Constants.SleepValue.LightSleep:
            lightSleepMinutes += durationMinutes;
            totalSleepMinutes += durationMinutes;
            break;
          case AppleHealthKit.Constants.SleepValue.REMSleep:
            remSleepMinutes += durationMinutes;
            totalSleepMinutes += durationMinutes;
            break;
          default:
            // If no specific stage is provided, assume light sleep
            lightSleepMinutes += durationMinutes;
            totalSleepMinutes += durationMinutes;
            break;
        }
        break;

      case AppleHealthKit.Constants.SleepValue.Awake:
        awakeMinutes += durationMinutes;
        break;

      case AppleHealthKit.Constants.SleepValue.InBed:
        // In bed time is not counted as sleep time
        break;

      default:
        // Unknown sleep value, count as awake
        awakeMinutes += durationMinutes;
        break;
    }
  });

  const totalHours = Math.round((totalSleepMinutes / 60) * 10) / 10; // Round to 1 decimal place

  return {
    totalHours,
    stages: {
      deep: Math.round(deepSleepMinutes / 60 * 10) / 10,
      light: Math.round(lightSleepMinutes / 60 * 10) / 10,
      rem: Math.round(remSleepMinutes / 60 * 10) / 10,
      awake: Math.round(awakeMinutes / 60 * 10) / 10,
    }
  };
};

// Additional helper functions for specific health metrics
export const fetchStepsData = async (startDate: Date, endDate: Date): Promise<number> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getStepCount(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      (error: string | null, results: HealthValue) => {
        if (error) {
          reject(error);
        }
        resolve(results.value || 0);
      }
    );
  });
};

export const fetchHeartRateData = async (startDate: Date, endDate: Date): Promise<number[]> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getHeartRateSamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      (error: string | null, results: any) => {
        if (error) {
          reject(error);
        }
        // In a real implementation, this would return an array of heart rate readings
        resolve([results.value || 0]);
      }
    );
  });
};

export const fetchSleepData = async (startDate: Date, endDate: Date): Promise<SleepData> => {
  return new Promise((resolve, reject) => {
    AppleHealthKit.getSleepSamples(
      {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      },
      (error: string | null, results: SleepData) => {
        if (error) {
          reject(error);
        }
        resolve(results);
      }
    );
  });
};

// Calculate sleep quality score based on sleep stages
export const calculateSleepQuality = (sleepStages: any): number => {
  if (!sleepStages) return 0;

  const { deep, light, rem, awake } = sleepStages;
  const totalSleep = deep + light + rem;

  if (totalSleep === 0) return 0;

  // Weight different sleep stages (based on research)
  const deepWeight = 0.4; // Deep sleep is most important
  const remWeight = 0.3;  // REM sleep is second most important
  const lightWeight = 0.2; // Light sleep is less important
  const awakePenalty = 0.1; // Awake time reduces quality

  const deepScore = (deep / totalSleep) * deepWeight;
  const remScore = (rem / totalSleep) * remWeight;
  const lightScore = (light / totalSleep) * lightWeight;
  const awakePenaltyScore = (awake / totalSleep) * awakePenalty;

  const qualityScore = (deepScore + remScore + lightScore - awakePenaltyScore) * 100;

  return Math.max(0, Math.min(100, Math.round(qualityScore)));
};

// Get sleep insights based on sleep data
export const getSleepInsights = (sleepHours: number, sleepStages: any): string[] => {
  const insights: string[] = [];

  if (sleepHours < 7) {
    insights.push("You're getting less than the recommended 7-9 hours of sleep. Consider going to bed earlier.");
  } else if (sleepHours > 9) {
    insights.push("You're getting more than 9 hours of sleep. This might be excessive for some people.");
  } else {
    insights.push("Great! You're getting the recommended amount of sleep.");
  }

  if (sleepStages) {
    const { deep, rem } = sleepStages;
    const totalSleep = deep + rem + (sleepStages.light || 0);

    if (totalSleep > 0) {
      const deepPercentage = (deep / totalSleep) * 100;
      const remPercentage = (rem / totalSleep) * 100;

      if (deepPercentage < 15) {
        insights.push("Your deep sleep percentage is lower than ideal. Try to reduce stress and avoid screens before bed.");
      }

      if (remPercentage < 20) {
        insights.push("Your REM sleep percentage is lower than ideal. Consider improving your sleep environment.");
      }
    }
  }

  return insights;
};