// File: components/PersonalizedSummary.tsx

import React from 'react';

interface SummaryData {
  biologicalAge: number;
  healthspanPrediction: number;
  longevityScore: number;
  recentTrends: string[];
  recommendations: string[];
}

interface PersonalizedSummaryProps {
  data: SummaryData;
}

const PersonalizedSummary: React.FC<PersonalizedSummaryProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Your Longevity Summary</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Biological Age</p>
          <p className="text-2xl font-bold">{data.biologicalAge}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Healthspan Prediction</p>
          <p className="text-2xl font-bold">{data.healthspanPrediction}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Longevity Score</p>
          <p className="text-2xl font-bold">{data.longevityScore}</p>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Recent Trends</h3>
        <ul className="list-disc list-inside">
          {data.recentTrends.map((trend, index) => (
            <li key={index}>{trend}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
        <ul className="list-disc list-inside">
          {data.recommendations.map((recommendation, index) => (
            <li key={index}>{recommendation}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PersonalizedSummary;