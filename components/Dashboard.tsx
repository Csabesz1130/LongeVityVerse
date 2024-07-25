// File: @/components/Dashboard.tsx
import React from 'react';
import { DashboardData } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import PersonalizedSummary from './PersonalizedSummary';
import HealthMetrics from './HealthMetrics';
import GoalTracker from './GoalTracker';
import WearableDataDisplay from './WearableDataDisplay';
import IntegrationsPanel from './IntegrationsPanel';
import EducationalResources from './EducationalResources';
import CommunityFeed from './CommunityFeed';
import AchievementsDisplay from './AchievementsDisplay';

interface DashboardProps {
  data: DashboardData;
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <PersonalizedSummary summary={data.summary} />
      <HealthMetrics metrics={data.healthMetrics} trends={data.healthMetricTrends} />
      <GoalTracker goals={data.goals} />
      <WearableDataDisplay data={data.wearableData} />
      <IntegrationsPanel integrations={data.integrations} />
      <EducationalResources resources={data.educationalResources} />
      <CommunityFeed communityData={data.communityData} />
      <AchievementsDisplay gamificationData={data.gamificationData} />
    </div>
  );
};

export default Dashboard;