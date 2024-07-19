// File: libs/recommendations.ts

import { HealthMetric } from '@/types/dashboard';

export function generatePersonalizedRecommendations(healthMetrics: HealthMetric[]): string[] {
  const recommendations: string[] = [];

  healthMetrics.forEach(metric => {
    const latestValue = metric.data[metric.data.length - 1].value;
    const averageValue = metric.data.reduce((sum: number, point: { value: number }) => sum + point.value, 0) / metric.data.length;

    switch (metric.name) {
      case 'Weight':
        if (latestValue > averageValue) {
          recommendations.push('Consider increasing physical activity and reviewing your diet.');
        }
        break;
      case 'Sleep Hours':
        if (latestValue < 7) {
          recommendations.push('Aim for 7-9 hours of sleep per night for optimal health.');
        }
        break;
      case 'Resting Heart Rate':
        if (latestValue > 80) {
          recommendations.push('Consider incorporating more cardiovascular exercise into your routine.');
        }
        break;
      // Add more cases for other metrics
    }
  });

  return recommendations;
}