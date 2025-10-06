import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Minus, Info, Activity, Brain, Heart } from 'lucide-react';

interface PersonalizedSummaryProps {
  biologicalAge: number;
  chronologicalAge: number;
  healthspanPrediction: number;
  longevityScore: number;
  recentTrends: {
    biologicalAge: 'improving' | 'declining' | 'stable';
    healthspanPrediction: 'improving' | 'declining' | 'stable';
    longevityScore: 'improving' | 'declining' | 'stable';
  };
  topRecommendations: string[];
}

const PersonalizedSummary: React.FC<PersonalizedSummaryProps> = ({
  biologicalAge,
  chronologicalAge,
  healthspanPrediction,
  longevityScore,
  recentTrends,
  topRecommendations,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <ArrowUp className="text-green-500" />;
      case 'declining':
        return <ArrowDown className="text-red-500" />;
      case 'stable':
        return <Minus className="text-yellow-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Your Longevity Summary</h2>
        <button 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <Activity className="inline-block mr-2" />
          <p className="text-3xl font-bold">{biologicalAge}</p>
          <p className="text-sm text-gray-500">Biological Age</p>
          {getTrendIcon(recentTrends.biologicalAge)}
          <div className="text-xs mt-2">Your body&apos;s functional age based on various biomarkers.</div>
        </div>
        <div className="text-center">
          <Brain className="inline-block mr-2" />
          <p className="text-3xl font-bold">{healthspanPrediction}</p>
          <p className="text-sm text-gray-500">Healthspan Prediction</p>
          {getTrendIcon(recentTrends.healthspanPrediction)}
          <div className="text-xs mt-2">Estimated years of healthy, disease-free life.</div>
        </div>
        <div className="text-center">
          <Heart className="inline-block mr-2" />
          <p className="text-3xl font-bold">{longevityScore}</p>
          <p className="text-sm text-gray-500">Longevity Score</p>
          {getTrendIcon(recentTrends.longevityScore)}
          <div className="text-xs mt-2">Overall score based on various health and lifestyle factors.</div>
        </div>
      </div>

      {showDetails && (
        <>
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Age Comparison</h4>
            <div className="flex items-center mb-2">
              <span className="w-1/4">Chronological Age: {chronologicalAge}</span>
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${(chronologicalAge / 100) * 100}%`}}></div>
              </div>
            </div>
            <div className="flex items-center">
              <span className="w-1/4">Biological Age: {biologicalAge}</span>
              <div className="w-3/4 bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${(biologicalAge / 100) * 100}%`}}></div>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="font-semibold mb-2">Top Recommendations</h4>
            <ul className="list-disc pl-5">
              {topRecommendations.map((recommendation, index) => (
                <li key={index}>{recommendation}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      <div className="mt-4 text-center">
        <button className="text-blue-500 underline">
          View Detailed Report <Info className="inline-block ml-1" size={16} />
        </button>
      </div>
    </div>
  );
};

export default PersonalizedSummary;