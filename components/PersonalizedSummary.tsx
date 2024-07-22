import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
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
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Your Longevity Summary
            <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Tooltip>
              <TooltipTrigger className="text-center">
                <Activity className="inline-block mr-2" />
                <p className="text-3xl font-bold">{biologicalAge}</p>
                <p className="text-sm text-gray-500">Biological Age</p>
                {getTrendIcon(recentTrends.biologicalAge)}
              </TooltipTrigger>
              <TooltipContent>
                <p>Your body's functional age based on various biomarkers.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger className="text-center">
                <Brain className="inline-block mr-2" />
                <p className="text-3xl font-bold">{healthspanPrediction}</p>
                <p className="text-sm text-gray-500">Healthspan Prediction</p>
                {getTrendIcon(recentTrends.healthspanPrediction)}
              </TooltipTrigger>
              <TooltipContent>
                <p>Estimated years of healthy, disease-free life.</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger className="text-center">
                <Heart className="inline-block mr-2" />
                <p className="text-3xl font-bold">{longevityScore}</p>
                <p className="text-sm text-gray-500">Longevity Score</p>
                {getTrendIcon(recentTrends.longevityScore)}
              </TooltipTrigger>
              <TooltipContent>
                <p>Overall score based on various health and lifestyle factors.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {showDetails && (
            <>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Age Comparison</h4>
                <div className="flex items-center">
                  <span className="w-1/4">Chronological Age: {chronologicalAge}</span>
                  <Progress value={(chronologicalAge / 100) * 100} className="w-3/4" />
                </div>
                <div className="flex items-center mt-2">
                  <span className="w-1/4">Biological Age: {biologicalAge}</span>
                  <Progress value={(biologicalAge / 100) * 100} className="w-3/4" />
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
            <Button variant="link" className="text-sm">
              View Detailed Report <Info className="inline-block ml-1" size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default PersonalizedSummary;