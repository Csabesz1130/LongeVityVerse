// libs/sampleHealthData.ts

import { addDays, format } from 'date-fns';

export interface HealthData {
  date: string;
  steps: number;
  activeMinutes: number;
  heartRate: {
    average: number;
    min: number;
    max: number;
  };
  sleepHours: number;
  caloriesBurned: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  bloodGlucose?: number;
  weight?: number;
}

const generateRandomNumber = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateRandomDecimal = (min: number, max: number, decimalPlaces: number = 1): number => {
  const randomDecimal = Math.random() * (max - min) + min;
  return Number(randomDecimal.toFixed(decimalPlaces));
};

const generateDailySteps = (baseSteps: number): number => {
  const variation = generateRandomNumber(-2000, 2000);
  return Math.max(0, baseSteps + variation);
};

const generateDailyActiveMinutes = (steps: number): number => {
  return Math.floor(steps / 100);
};

const generateHeartRate = (baseAverage: number): { average: number; min: number; max: number } => {
  const minHR = baseAverage - generateRandomNumber(10, 20);
  const maxHR = baseAverage + generateRandomNumber(20, 40);
  return {
    average: baseAverage,
    min: Math.max(40, minHR),
    max: Math.min(200, maxHR),
  };
};

const generateSleepHours = (baseSleep: number): number => {
  const variation = generateRandomDecimal(-1.5, 1.5, 2);
  return Math.max(0, Math.min(12, baseSleep + variation));
};

const generateCaloriesBurned = (steps: number, activeMinutes: number): number => {
  return Math.floor((steps * 0.04) + (activeMinutes * 7));
};

const generateBloodPressure = (): { systolic: number; diastolic: number } => {
  return {
    systolic: generateRandomNumber(90, 140),
    diastolic: generateRandomNumber(60, 90),
  };
};

const generateBloodGlucose = (): number => {
  return generateRandomNumber(70, 140);
};

const generateWeight = (baseWeight: number): number => {
  const variation = generateRandomDecimal(-1, 1, 1);
  return baseWeight + variation;
};

export const generateSampleDailyData = (date: Date, baseData: Partial<HealthData> = {}): HealthData => {
  const steps = generateDailySteps(baseData.steps || 8000);
  const activeMinutes = generateDailyActiveMinutes(steps);
  const heartRate = generateHeartRate(baseData.heartRate?.average || 70);
  const sleepHours = generateSleepHours(baseData.sleepHours || 7);
  const caloriesBurned = generateCaloriesBurned(steps, activeMinutes);

  return {
    date: format(date, 'yyyy-MM-dd'),
    steps,
    activeMinutes,
    heartRate,
    sleepHours,
    caloriesBurned,
    bloodPressure: generateBloodPressure(),
    bloodGlucose: generateBloodGlucose(),
    weight: generateWeight(baseData.weight || 70),
  };
};

export const generateSampleHistoricalData = (days: number, baseData: Partial<HealthData> = {}): HealthData[] => {
  const endDate = new Date();
  const startDate = addDays(endDate, -days + 1);

  return Array.from({ length: days }, (_, index) => {
    const currentDate = addDays(startDate, index);
    return generateSampleDailyData(currentDate, baseData);
  });
};

export const generateSampleHealthData = (platform: string): HealthData => {
  const baseData: Partial<HealthData> = {
    steps: 8000,
    heartRate: { average: 70, min: 50, max: 100 },
    sleepHours: 7,
    weight: 70,
  };

  // Add some variation based on the platform
  switch (platform) {
    case 'appleHealth':
      baseData.steps = 8500;
      baseData.heartRate = { average: 68, min: 48, max: 95 };
      break;
    case 'googleFit':
      baseData.steps = 7800;
      baseData.heartRate = { average: 72, min: 52, max: 105 };
      break;
    case 'fitbit':
      baseData.steps = 8200;
      baseData.heartRate = { average: 71, min: 51, max: 102 };
      break;
  }

  return generateSampleDailyData(new Date(), baseData);
};

// Utility function to simulate trends over time
export const generateTrendingHistoricalData = (days: number, trend: 'improving' | 'declining' | 'stable'): HealthData[] => {
  const baseData: Partial<HealthData> = {
    steps: 8000,
    heartRate: { average: 70, min: 50, max: 100 },
    sleepHours: 7,
    weight: 70,
  };

  const trendFactor = trend === 'improving' ? 1 : trend === 'declining' ? -1 : 0;

  return Array.from({ length: days }, (_, index) => {
    const currentDate = addDays(new Date(), -days + index + 1);
    const trendAdjustment = (index / days) * trendFactor;

    const adjustedBaseData = {
      ...baseData,
      steps: Math.round(baseData.steps! * (1 + 0.1 * trendAdjustment)),
      heartRate: { 
        average: Math.round(baseData.heartRate!.average * (1 - 0.05 * trendAdjustment)),
        min: Math.round(baseData.heartRate!.min * (1 - 0.05 * trendAdjustment)),
        max: Math.round(baseData.heartRate!.max * (1 - 0.05 * trendAdjustment)),
      },
      sleepHours: baseData.sleepHours! * (1 + 0.05 * trendAdjustment),
      weight: baseData.weight! * (1 - 0.02 * trendAdjustment),
    };

    return generateSampleDailyData(currentDate, adjustedBaseData);
  });
};