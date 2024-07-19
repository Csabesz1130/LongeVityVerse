// File: components/PredictiveInsights.tsx

import React from 'react';

interface Insight {
  title: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface PredictiveInsightsProps {
  insights: Insight[];
}

const PredictiveInsights: React.FC<PredictiveInsightsProps> = ({ insights }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Predictive Insights</h2>
      {insights.map((insight, index) => (
        <div key={index} className="mb-4 p-4 border rounded">
          <h3 className="text-lg font-semibold">{insight.title}</h3>
          <p className="mb-2">{insight.description}</p>
          <span className={`px-2 py-1 rounded text-sm ${
            insight.riskLevel === 'low' ? 'bg-green-200 text-green-800' :
            insight.riskLevel === 'medium' ? 'bg-yellow-200 text-yellow-800' :
            'bg-red-200 text-red-800'
          }`}>
            {insight.riskLevel.charAt(0).toUpperCase() + insight.riskLevel.slice(1)} Risk
          </span>
        </div>
      ))}
    </div>
  );
};

export default PredictiveInsights;