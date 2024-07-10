// File: types/dashboard.ts

export interface HealthMetric {
    name: string;
    value: number;
    unit: string;
  }
  
  export interface Recommendation {
    category: string;
    text: string;
  }
  
  export interface DashboardData {
    biologicalAge: number;
    chronologicalAge: number;
    longevityScore: number;
    healthMetrics: HealthMetric[];
    recommendations: Recommendation[];
  }