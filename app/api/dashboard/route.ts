// File: app/api/dashboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { DashboardData } from '@/types/dashboard';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // TODO: Fetch real data from your database
  const mockDashboardData: DashboardData = {
    biologicalAge: 35,
    chronologicalAge: 40,
    longevityScore: 85,
    healthMetrics: [
      { name: "BMI", value: 22.5, unit: "kg/m²" },
      { name: "Resting Heart Rate", value: 65, unit: "bpm" },
      { name: "Sleep", value: 7.5, unit: "hours" },
    ],
    recommendations: [
      { category: "Exercise", text: "Increase daily steps to 10,000" },
      { category: "Nutrition", text: "Add more leafy greens to your diet" },
    ],
  };
  
  return NextResponse.json(mockDashboardData);
}