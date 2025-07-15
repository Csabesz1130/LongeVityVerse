// File: components/dashboard/DashboardContent.tsx

'use client';

import { useState, useEffect } from "react";
import BiologicalAgeWidget from "./BiologicalAgeWidget";
import HealthMetricsWidget from "./HealthMetricsWidget";
import LifestyleRecommendationsWidget from "./LifestyleRecommendationsWidget";
import LongevityScoreWidget from "./LongevityScoreWidget";
import HealthDataUpdateModal from "./HealthDataUpdateModal";
import { fetchDashboardData } from "@/libs/api";
import { DashboardData } from "@/types/dashboard";
import ButtonGradient from "@/components/ButtonGradient";

export default function DashboardContent() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleUpdateHealthData = () => {
    setIsModalOpen(true);
  };

  const handleDataUpdated = () => {
    // Újratöltjük a dashboard adatokat a frissítés után
    loadDashboardData();
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
              biologicalAge={dashboardData.summary.biologicalAge}
              chronologicalAge={dashboardData.summary.chronologicalAge}
            />
            <LongevityScoreWidget score={dashboardData.summary.longevityScore} />
            <HealthMetricsWidget metrics={dashboardData.healthMetrics} />
            <LifestyleRecommendationsWidget recommendations={dashboardData.summary.topRecommendations} />
          </div>
          <ButtonGradient
            title="Update Health Data"
            onClick={handleUpdateHealthData}
          />

          <HealthDataUpdateModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            onDataUpdated={handleDataUpdated}
          />
        </>
      ) : (
        <p>Failed to load dashboard data. Please try again later.</p>
      )}
    </div>
  );
}