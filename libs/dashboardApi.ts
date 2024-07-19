// File: libs/dashboardApi.ts

import axios from 'axios';
import { DashboardData, HealthMetricTrend, Goal, WearableData } from '@/types';

const api = axios.create({
  baseURL: '/api/dashboard',
});

export const DashboardApi = {
  // Fetch all dashboard data
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/');
    return response.data;
  },

  // Update user's health metrics
  updateHealthMetrics: async (metrics: Partial<{
    weight: number;
    height: number;
    restingHeartRate: number;
    sleepHours: number;
  }>): Promise<void> => {
    await api.post('/health-metrics', metrics);
  },

  // Fetch health metric trends
  getHealthMetricTrends: async (): Promise<HealthMetricTrend[]> => {
    const response = await api.get<HealthMetricTrend[]>('/health-metric-trends');
    return response.data;
  },

  // Set a new goal
  setGoal: async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
    const response = await api.post<Goal>('/goals', goal);
    return response.data;
  },

  // Get all user goals
  getGoals: async (): Promise<Goal[]> => {
    const response = await api.get<Goal[]>('/goals');
    return response.data;
  },

  // Update goal progress
  updateGoalProgress: async (goalId: string, progress: number): Promise<Goal> => {
    const response = await api.put<Goal>(`/goals/${goalId}/progress`, { progress });
    return response.data;
  },

  // Delete a goal
  deleteGoal: async (goalId: string): Promise<void> => {
    await api.delete(`/goals/${goalId}`);
  },

  // Sync data from wearable device
  syncWearableData: async (deviceType: string, accessToken: string): Promise<WearableData> => {
    const response = await api.post<WearableData>('/wearable-sync', { deviceType, accessToken });
    return response.data;
  },

  // Get personalized recommendations
  getRecommendations: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/recommendations');
    return response.data;
  },

  // Get historical data for a specific metric
  getHistoricalData: async (metricName: string, startDate: string, endDate: string): Promise<HealthMetricTrend> => {
    const response = await api.get<HealthMetricTrend>(`/historical-data/${metricName}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};

export default DashboardApi;