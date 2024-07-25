// File: components/PredictiveInsights.tsx

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

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
    <Card>
      <CardHeader>
        <CardTitle>Predictive Insights</CardTitle>
      </CardHeader>
      <CardContent>
        {insights.map((insight, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <h3 className="text-lg font-semibold">{insight.title}</h3>
            <p className="mb-2">{insight.description}</p>
            <Badge 
              variant={
                insight.riskLevel === 'low' ? 'success' :
                insight.riskLevel === 'medium' ? 'warning' : 'danger'
              }
            >
              {insight.riskLevel.charAt(0).toUpperCase() + insight.riskLevel.slice(1)} Risk
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PredictiveInsights;