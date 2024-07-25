export * from "./config";


// File: @/types/index.ts

export interface HealthMetric {
    name: string;
    value: number;
    unit: string;
    date: string;
  }
  
  export interface HealthMetricTrend extends HealthMetric {
    trend: 'increasing' | 'decreasing' | 'stable';
  }
  
  export interface Goal {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    dueDate: string;
  }
  
  export interface WearableData {
    steps: number;
    heartRate: number;
    sleepHours: number;
    caloriesBurned: number;
    activeMinutes: number;
  }
  
  export interface Integration {
    id: string;
    name: string;
    description: string;
    icon: string;
    isConnected: boolean;
    lastSynced: string | null;
    authType: 'oauth' | 'apiKey';
    authUrl?: string;
    apiKey?: string;
  }
  
  export interface IntegrationData {
    fitbit?: {
      steps: number;
      calories: number;
      activeMinutes: number;
    };
    myFitnessPal?: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    };
    googleFit?: {
      steps: number;
      calories: number;
      activeMinutes: number;
    };
  }
  
  export interface EducationalResource {
    id: string;
    title: string;
    description: string;
    type: 'article' | 'video' | 'podcast';
    url: string;
    isSaved: boolean;
    rating: number;
  }
  
  export interface CommunityPost {
    id: string;
    author: {
      id: string;
      name: string;
      avatarUrl: string;
    };
    content: string;
    likes: number;
    comments: number;
    createdAt: string;
  }
  
  export interface Achievement {
    id: string;
    title: string;
    description: string;
    isUnlocked: boolean;
    unlockedAt?: string;
  }

  export interface DashboardSummary {
    biologicalAge: number;
    healthspanPrediction: number;
    longevityScore: number;
  }

  export interface User {
    email: string;
    firstName?: string;
    lastName?: string;
    isNewsletterSubscribed: boolean;
    // Add other user properties as needed
  }
  
  export interface DashboardData {
    user: {
      id: string;
      name: string;
      avatarUrl: string;
    };
    summary: {
      biologicalAge: number;
      healthspanPrediction: number;
      longevityScore: number;
    };
    healthMetrics: HealthMetric[];
    healthMetricTrends: HealthMetricTrend[];
    goals: Goal[];
    wearableData: WearableData;
    integrations: Integration[];
    integrationData: IntegrationData;
    educationalResources: EducationalResource[];
    communityData: {
      recentPosts: CommunityPost[];
      trendingTopics: string[];
    };
    gamificationData: {
      level: number;
      experience: number;
      nextLevelExperience: number;
      achievements: Achievement[];
    };
  }