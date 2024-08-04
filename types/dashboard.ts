// File: types/dashboard.ts

export interface HealthMetric {
  name: string;
  data: { date: string; value: number }[];
  value: number;
}

export interface HealthMetricTrend extends HealthMetric {
  trend: 'increasing' | 'decreasing' | 'stable';
  changePercentage: number;
}

export interface PredictiveInsight {
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface Goal {
  id: string;
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  deadline?: string;
  category: 'health' | 'fitness' | 'nutrition' | 'mental' | 'other';
}

export interface Integration {
  id: string;
  name: string;
  isConnected: boolean;
  lastSynced?: string;
  icon: string;
}

export interface EducationalResource {
  id: string;
  title: string;
  description: string;
  type: 'article' | 'video' | 'podcast';
  url: string;
  category: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  author: string;
  publishedDate: string;
  isSaved: boolean;
  rating: number;
}

export interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked: boolean;
}

export interface EnhancedHealthMetric extends HealthMetric {
  min: number;
  max: number;
  unit: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'monthly';
  progress: number;
  reward: {
    type: 'points' | 'badge' | 'achievement';
    value: number | string;
  };
  startDate: string;
  endDate: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface WearableData {
  steps: number;
  caloriesBurned: number;
  activeMinutes: number;
  heartRate: {
    average: number;
    max: number;
    min: number;
  };
  sleep: {
    duration: number;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
  };
}

export interface EducationalResource {


}

export interface DashboardData {
  summary: {
    biologicalAge: number;
    chronologicalAge: number;
    healthspanPrediction: number;
    longevityScore: number;
    recentTrends: {
      biologicalAge: 'increasing' | 'decreasing' | 'stable';
      healthspanPrediction: 'increasing' | 'decreasing' | 'stable';
      longevityScore: 'increasing' | 'decreasing' | 'stable';
    };
    topRecommendations: string[];
  };
  healthMetrics: HealthMetric[];
  enhancedHealthMetrics: EnhancedHealthMetric[];
  healthMetricTrends: HealthMetricTrend[];
  predictiveInsights: PredictiveInsight[];
  goals: Goal[];
  integrations: Integration[];
  educationalResources: EducationalResource[];
  communityData: {
    posts: CommunityPost[];
    trendingTopics: string[];
  };
  gamificationData: {
    challenges: Challenge[];
    achievements: Achievement[];
    currentPoints: number;
    level: number;
  };
  wearableData: WearableData;
}