import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { DashboardData, HealthMetric } from '@/types/dashboard';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // TODO: Fetch real data from your database
  const mockHealthMetrics: HealthMetric[] = [
    { name: "BMI", value: 22.5, unit: "kg/m²", data: [] },
    { name: "Resting Heart Rate", value: 65, unit: "bpm", data: [] },
    { name: "Sleep", value: 7.5, unit: "hours", data: [] },
  ];

  const mockDashboardData: Partial<DashboardData> = {
    summary: {
      biologicalAge: 35,
      chronologicalAge: 40,
      healthspanPrediction: 85,
      longevityScore: 85,
      recentTrends: {
        biologicalAge: 'decreasing',
        healthspanPrediction: 'increasing',
        longevityScore: 'stable',
      },
      topRecommendations: [
        "Increase daily steps to 10,000",
        "Add more leafy greens to your diet",
      ],
    },
    healthMetrics: mockHealthMetrics,
  };
  
  return NextResponse.json(mockDashboardData);
}