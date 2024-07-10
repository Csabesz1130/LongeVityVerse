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

export async function updateHealthData(data: any): Promise<void> {
  try {
    await apiClient.post('/dashboard/update-health-data', data);
    toast.success("Health data updated successfully");
  } catch (error) {
    console.error("Error updating health data:", error);
    throw error;
  }
}

// You can add more dashboard-related API functions here as needed

export default apiClient;