// File: components/dashboard/LifestyleRecommendationsWidget.tsx

import React from 'react';
import { Recommendation } from '@/types/dashboard';

interface LifestyleRecommendationsWidgetProps {
  recommendations: Recommendation[];
}

const LifestyleRecommendationsWidget: React.FC<LifestyleRecommendationsWidgetProps> = ({ recommendations }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Lifestyle Recommendations</h2>
      <ul className="space-y-4">
        {recommendations.map((rec, index) => (
          <li key={index} className="bg-gray-50 p-3 rounded">
            <span className="font-semibold text-primary">{rec.category}:</span> {rec.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LifestyleRecommendationsWidget;