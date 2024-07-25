// File: components/AchievementsDisplay.tsx

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Achievement } from '@/types';

interface AchievementsDisplayProps {
  achievements: Achievement[];
}

const AchievementsDisplay: React.FC<AchievementsDisplayProps> = ({ achievements }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
      </CardHeader>
      <CardContent>
        {achievements.map((achievement) => (
          <div key={achievement.id} className="mb-2">
            <h3>{achievement.title}</h3>
            <p>{achievement.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default AchievementsDisplay;