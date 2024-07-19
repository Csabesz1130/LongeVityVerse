// File: components/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import DashboardApi from '@/libs/dashboardApi';
import PersonalizedSummary from './PersonalizedSummary';
import DataVisualization from './DataVisualization';
import PredictiveInsights from './PredictiveInsights';
import GoalTracker from './GoalTracker';
import Integrations from './Integrations';
import EducationalResources from './EducationalResources';
import CommunityInteraction from './CommunityInteraction';
import GamificationFeatures from './GamificationFeatures';

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await DashboardApi.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div>Loading your personalized dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your LongevityOne AI Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <PersonalizedSummary data={dashboardData.summary} />
        <DataVisualization data={dashboardData.healthMetrics} />
        <PredictiveInsights insights={dashboardData.predictiveInsights} />
        <GoalTracker goals={dashboardData.goals} />
        <Integrations integrations={dashboardData.integrations} />
        <EducationalResources resources={dashboardData.educationalResources} />
        <CommunityInteraction communityData={dashboardData.communityData} />
        <GamificationFeatures gamificationData={dashboardData.gamificationData} />
      </div>
    </div>
  );
};

export default Dashboard;