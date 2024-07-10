// File: components/dashboard/HealthMetricsWidget.tsx

import React from 'react';
import { HealthMetric } from '@/types/dashboard';

interface HealthMetricsWidgetProps {
  metrics: HealthMetric[];
}

const HealthMetricsWidget: React.FC<HealthMetricsWidgetProps> = ({ metrics }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Health Metrics</h2>
      <ul className="space-y-2">
        {metrics.map((metric, index) => (
          <li key={index} className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">{metric.name}</span>
            <span className="font-semibold">
              {metric.value} {metric.unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HealthMetricsWidget;