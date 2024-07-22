import axios from 'axios';
import { DashboardData, HealthMetricTrend, Goal, WearableData } from '@/types';

const api = axios.create({
  baseURL: '/api/dashboard',
});

export const DashboardApi = {
  // Existing functionalities
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardData>('/');
    return response.data;
  },

  updateHealthMetrics: async (metrics: Partial<{
    weight: number;
    height: number;
    restingHeartRate: number;
    sleepHours: number;
  }>): Promise<void> => {
    await api.post('/health-metrics', metrics);
  },

  getHealthMetricTrends: async (): Promise<HealthMetricTrend[]> => {
    const response = await api.get<HealthMetricTrend[]>('/health-metric-trends');
    return response.data;
  },

  setGoal: async (goal: Omit<Goal, 'id'>): Promise<Goal> => {
    const response = await api.post<Goal>('/goals', goal);
    return response.data;
  },

  getGoals: async (): Promise<Goal[]> => {
    const response = await api.get<Goal[]>('/goals');
    return response.data;
  },

  updateGoalProgress: async (goalId: string, progress: number): Promise<Goal> => {
    const response = await api.put<Goal>(`/goals/${goalId}/progress`, { progress });
    return response.data;
  },

  deleteGoal: async (goalId: string): Promise<void> => {
    await api.delete(`/goals/${goalId}`);
  },

  syncWearableData: async (deviceType: string, accessToken: string): Promise<WearableData> => {
    const response = await api.post<WearableData>('/wearable-sync', { deviceType, accessToken });
    return response.data;
  },

  getRecommendations: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/recommendations');
    return response.data;
  },

  getHistoricalData: async (metricName: string, startDate: string, endDate: string): Promise<HealthMetricTrend> => {
    const response = await api.get<HealthMetricTrend>(`/historical-data/${metricName}`, {
      params: { startDate, endDate },
    });
    return response.data;
  },

  // New functionalities
  getEducationalResources: async () => {
    const response = await api.get('/educational-resources');
    return response.data;
  },

  saveResource: async (id: string) => {
    const response = await api.post(`/educational-resources/${id}/save`);
    return response.data;
  },

  rateResource: async (id: string, rating: number) => {
    const response = await api.post(`/educational-resources/${id}/rate`, { rating });
    return response.data;
  },

  getCommunityPosts: async () => {
    const response = await api.get('/community/posts');
    return response.data;
  },

  createCommunityPost: async (content: string) => {
    const response = await api.post('/community/posts', { content });
    return response.data;
  },

  likePost: async (postId: string) => {
    const response = await api.post(`/community/posts/${postId}/like`);
    return response.data;
  },

  addComment: async (postId: string, comment: string) => {
    const response = await api.post(`/community/posts/${postId}/comments`, { comment });
    return response.data;
  },

  getChallenges: async () => {
    const response = await api.get('/gamification/challenges');
    return response.data;
  },

  getAchievements: async () => {
    const response = await api.get('/gamification/achievements');
    return response.data;
  },

  connectIntegration: async (integrationId: string) => {
    const response = await api.post(`/integrations/connect/${integrationId}`);
    return response.data;
  },

  disconnectIntegration: async (integrationId: string) => {
    const response = await api.post(`/integrations/disconnect/${integrationId}`);
    return response.data;
  },

  getIntegrationStatus: async (integrationId: string) => {
    const response = await api.get(`/integrations/status/${integrationId}`);
    return response.data;
  },
};

export default DashboardApi;