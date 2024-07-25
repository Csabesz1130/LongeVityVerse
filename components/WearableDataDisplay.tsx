// File: components/WearableDataDisplay.tsx

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { WearableData } from '@/types';

interface WearableDataDisplayProps {
  data: WearableData;
}

const WearableDataDisplay: React.FC<WearableDataDisplayProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wearable Data</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Steps: {data.steps}</p>
        <p>Calories Burned: {data.caloriesBurned}</p>
        <p>Active Minutes: {data.activeMinutes}</p>
      </CardContent>
    </Card>
  );
};

export default WearableDataDisplay;