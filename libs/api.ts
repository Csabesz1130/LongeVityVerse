// File: libs/api.ts

import axios from "axios";
import { toast } from "react-hot-toast";
import { signIn } from "next-auth/react";
import config from "@/config";
import { DashboardData } from "@/types/dashboard"; // Make sure to create this type

// use this to interact with our own API (/app/api folder) from the front-end side
const apiClient = axios.create({
  baseURL: "/api",
});

apiClient.interceptors.response.use(
  function (response) {
    return response.data;
  },
  function (error) {
    let message = "";

    if (error.response?.status === 401) {
      // User not auth, ask to re login
      toast.error("Please login");
      // automatically redirect to /dashboard page after login
      return signIn(undefined, { callbackUrl: config.auth.callbackUrl });
    } else if (error.response?.status === 403) {
      // User not authorized, must subscribe/purchase/pick a plan
      message = "Pick a plan to use this feature";
    } else {
      message =
        error?.response?.data?.error || error.message || error.toString();
    }

    error.message =
      typeof message === "string" ? message : JSON.stringify(message);

    console.error(error.message);

    // Automatically display errors to the user
    if (error.message) {
      toast.error(error.message);
    } else {
      toast.error("something went wrong...");
    }
    return Promise.reject(error);
  }
);

// Dashboard API utility functions

export async function fetchDashboardData(): Promise<DashboardData> {
  try {
    const response = await apiClient.get('/dashboard');
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

export async function fetchBiologicalAge(): Promise<{ biological: number; chronological: number }> {
  try {
    const response = await apiClient.get('/dashboard/biological-age');
    return response.data;
  } catch (error) {
    console.error("Error fetching biological age:", error);
    throw error;
  }
}

export async function fetchHealthMetrics(): Promise<any> {
  try {
    const response = await apiClient.get('/dashboard/health-metrics');
    return response.data;
  } catch (error) {
    console.error("Error fetching health metrics:", error);
    throw error;
  }
}

// Enhanced health data interface
export interface HealthDataUpdate {
  steps?: number;
  heartRate?: number;
  sleepHours?: number;
  weight?: number;
  height?: number;
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  bloodGlucose?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  hydrationLevel?: number;
  stressLevel?: number;
  mood?: 'excellent' | 'good' | 'fair' | 'poor';
  energyLevel?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  bmi?: number;
  bodyComposition?: {
    fatMass: number;
    leanMass: number;
    boneMass: number;
  };
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
  nutritionData?: {
    caloriesConsumed: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    waterIntake: number;
  };
  sleepQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  sleepData?: {
    deepSleepHours: number;
    lightSleepHours: number;
    remSleepHours: number;
    awakeTime: number;
    sleepEfficiency: number;
  };
}

// Validation function for health data
function validateHealthData(data: HealthDataUpdate): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate numeric ranges
  if (data.steps !== undefined && (data.steps < 0 || data.steps > 100000)) {
    errors.push("Steps must be between 0 and 100,000");
  }

  if (data.heartRate !== undefined && (data.heartRate < 30 || data.heartRate > 220)) {
    errors.push("Heart rate must be between 30 and 220 bpm");
  }

  if (data.sleepHours !== undefined && (data.sleepHours < 0 || data.sleepHours > 24)) {
    errors.push("Sleep hours must be between 0 and 24");
  }

  if (data.weight !== undefined && (data.weight < 20 || data.weight > 500)) {
    errors.push("Weight must be between 20 and 500 kg");
  }

  if (data.height !== undefined && (data.height < 50 || data.height > 300)) {
    errors.push("Height must be between 50 and 300 cm");
  }

  if (data.bloodPressure !== undefined) {
    if (data.bloodPressure.systolic < 70 || data.bloodPressure.systolic > 200) {
      errors.push("Systolic blood pressure must be between 70 and 200 mmHg");
    }
    if (data.bloodPressure.diastolic < 40 || data.bloodPressure.diastolic > 130) {
      errors.push("Diastolic blood pressure must be between 40 and 130 mmHg");
    }
  }

  if (data.bloodGlucose !== undefined && (data.bloodGlucose < 20 || data.bloodGlucose > 600)) {
    errors.push("Blood glucose must be between 20 and 600 mg/dL");
  }

  if (data.bodyFatPercentage !== undefined && (data.bodyFatPercentage < 2 || data.bodyFatPercentage > 50)) {
    errors.push("Body fat percentage must be between 2% and 50%");
  }

  if (data.hydrationLevel !== undefined && (data.hydrationLevel < 0 || data.hydrationLevel > 100)) {
    errors.push("Hydration level must be between 0% and 100%");
  }

  if (data.stressLevel !== undefined && (data.stressLevel < 0 || data.stressLevel > 10)) {
    errors.push("Stress level must be between 0 and 10");
  }

  if (data.energyLevel !== undefined && (data.energyLevel < 0 || data.energyLevel > 10)) {
    errors.push("Energy level must be between 0 and 10");
  }

  if (data.temperature !== undefined && (data.temperature < 35 || data.temperature > 42)) {
    errors.push("Temperature must be between 35°C and 42°C");
  }

  if (data.oxygenSaturation !== undefined && (data.oxygenSaturation < 70 || data.oxygenSaturation > 100)) {
    errors.push("Oxygen saturation must be between 70% and 100%");
  }

  if (data.respiratoryRate !== undefined && (data.respiratoryRate < 8 || data.respiratoryRate > 40)) {
    errors.push("Respiratory rate must be between 8 and 40 breaths per minute");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export async function updateHealthData(data: HealthDataUpdate): Promise<void> {
  try {
    // Validate the data before sending
    const validation = validateHealthData(data);
    if (!validation.isValid) {
      const errorMessage = `Invalid health data: ${validation.errors.join(', ')}`;
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Check if we have any data to update
    if (Object.keys(data).length === 0) {
      toast.error("No health data provided for update");
      throw new Error("No health data provided");
    }

    await apiClient.post('/dashboard/healthdata', data);
    toast.success("Health data updated successfully");
  } catch (error: any) {
    console.error("Error updating health data:", error);

    // Handle specific error types
    if (error.response?.status === 400) {
      toast.error("Invalid health data format. Please check your input.");
    } else if (error.response?.status === 413) {
      toast.error("Health data too large. Please reduce the amount of data.");
    } else if (error.response?.status === 429) {
      toast.error("Too many requests. Please wait a moment before trying again.");
    } else if (error.response?.status >= 500) {
      toast.error("Server error. Please try again later or contact support.");
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error("Network error. Please check your internet connection.");
    } else if (error.code === 'ECONNABORTED') {
      toast.error("Request timeout. Please try again.");
    } else {
      // Use the error message from the validation or a generic one
      const message = error.message || "Failed to update health data. Please try again.";
      toast.error(message);
    }

    throw error;
  }
}

export async function setUserGoal(goal: any): Promise<void> {
  try {
    await apiClient.post('/dashboard/goals', goal);
    toast.success("Goal set successfully");
  } catch (error) {
    console.error("Error setting goal:", error);
    throw error;
  }
}

// New function to fetch comprehensive health data
export async function fetchComprehensiveHealthData(): Promise<any> {
  try {
    const response = await apiClient.get('/dashboard/healthdata');
    return response.data;
  } catch (error) {
    console.error("Error fetching comprehensive health data:", error);
    throw error;
  }
}

// New function to get health insights and recommendations
export async function getHealthInsights(): Promise<any> {
  try {
    const response = await apiClient.get('/dashboard/health-insights');
    return response.data;
  } catch (error) {
    console.error("Error fetching health insights:", error);
    throw error;
  }
}

// You can add more dashboard-related API functions here as needed

export default apiClient;