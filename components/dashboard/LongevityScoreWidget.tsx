// File: components/dashboard/LongevityScoreWidget.tsx

import React from 'react';

interface LongevityScoreWidgetProps {
  score: number;
}

const LongevityScoreWidget: React.FC<LongevityScoreWidgetProps> = ({ score }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Longevity Score</h2>
      <div className="flex items-center">
        <div className="w-24 h-24 rounded-full border-8 border-primary flex items-center justify-center">
          <span className="text-3xl font-bold">{score}</span>
        </div>
        <p className="ml-4 text-gray-600">
          Your longevity score indicates your overall health and potential for a long, healthy life.
        </p>
      </div>
    </div>
  );
};

export default LongevityScoreWidget;