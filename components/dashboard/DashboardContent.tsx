// File: components/dashboard/DashboardContent.tsx

'use client';

import { useState, useEffect } from "react";
import BiologicalAgeWidget from "./BiologicalAgeWidget";
import HealthMetricsWidget from "./HealthMetricsWidget";
import LifestyleRecommendationsWidget from "./LifestyleRecommendationsWidget";
import LongevityScoreWidget from "./LongevityScoreWidget";
import { fetchDashboardData } from "@/libs/api";
import { DashboardData } from "@/types/dashboard";
import ButtonGradient from "@/components/ButtonGradient";

export default function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // TODO: Implement proper error handling and user feedback
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-8">Your Longevity Dashboard</h1>
      {dashboardData ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <BiologicalAgeWidget 
              biologicalAge={dashboardData.biologicalAge} 
              chronologicalAge={dashboardData.chronologicalAge} 
            />
            <LongevityScoreWidget score={dashboardData.longevityScore} />
            <HealthMetricsWidget metrics={dashboardData.healthMetrics} />
            <LifestyleRecommendationsWidget recommendations={dashboardData.recommendations} />
          </div>
          <ButtonGradient title="Update Health Data" onClick={() => {/* TODO: Implement update health data flow */}} />
        </>
      ) : (
        <p>Failed to load dashboard data. Please try again later.</p>
      )}
    </div>
  );
}