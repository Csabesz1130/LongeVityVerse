// File: components/HealthMetrics.tsx

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { HealthMetric, HealthMetricTrend } from '@/types';

interface HealthMetricsProps {
  metrics: HealthMetric[];
  trends: HealthMetricTrend[];
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ metrics, trends }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Health Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        {metrics.map((metric) => (
          <div key={metric.name}>
            <h3>{metric.name}</h3>
            <p>{metric.value} {metric.unit}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default HealthMetrics;