// File: components/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { DashboardData } from '@/types';
import PersonalizedSummary from './PersonalizedSummary';
import HealthMetrics from './HealthMetrics';
import GoalTracker from './GoalTracker';
import WearableDataDisplay from './WearableDataDisplay';
import IntegrationsPanel from './IntegrationsPanel';
import EducationalResources from './EducationalResources';
import CommunityFeed from './CommunityFeed';
import AchievementsDisplay from './AchievementsDisplay';
import DashboardApi from '@/libs/dashboardApi';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await DashboardApi.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleToggleIntegration = async (integrationId: string) => {
    if (dashboardData) {
      const updatedIntegrations = dashboardData.integrations.map(integration =>
        integration.id === integrationId
          ? { ...integration, isConnected: !integration.isConnected }
          : integration
      );
      setDashboardData({ ...dashboardData, integrations: updatedIntegrations });
      // You should also call your API to update the integration status
      await DashboardApi.toggleIntegration(integrationId);
    }
  };

  if (!dashboardData) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PersonalizedSummary {...dashboardData.summary} />
      <HealthMetrics 
        metrics={dashboardData.healthMetrics} 
        trends={dashboardData.healthMetricTrends} 
      />
      <GoalTracker goals={dashboardData.goals} />
      <WearableDataDisplay data={dashboardData.wearableData} />
      <IntegrationsPanel 
        integrations={dashboardData.integrations}
        onToggleIntegration={handleToggleIntegration}
      />
      <EducationalResources resources={dashboardData.educationalResources} />
      <CommunityFeed posts={dashboardData.communityData.recentPosts} />
      <AchievementsDisplay achievements={dashboardData.gamificationData.achievements} />
    </div>
  );
};

export default Dashboard;