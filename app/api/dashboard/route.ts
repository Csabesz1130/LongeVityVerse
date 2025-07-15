import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import connectToDatabase from '@/libs/mongoose';
import User from '@/models/User';
import { DashboardData, HealthMetric } from '@/types/dashboard';

// GET /api/dashboard
// Returns personalised dashboard data for the logged-in user.
export async function GET() {
  // 1. Validate session
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Connect to DB & fetch user
    await connectToDatabase();

    const user = await User.findOne({ email: session.user?.email }).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 3. Build health metrics from stored healthKit data (if any)
    const healthMetrics: HealthMetric[] = [];
    const { healthKit } = user as any;

    if (healthKit) {
      const nowIso = new Date().toISOString();

      if (typeof healthKit.steps === 'number') {
        healthMetrics.push({
          name: 'Steps',
          value: healthKit.steps,
          unit: 'steps',
          data: [{ date: nowIso, value: healthKit.steps }],
        });
      }

      if (typeof healthKit.heartRate === 'number') {
        healthMetrics.push({
          name: 'Resting Heart Rate',
          value: healthKit.heartRate,
          unit: 'bpm',
          data: [{ date: nowIso, value: healthKit.heartRate }],
        });
      }

      if (typeof healthKit.sleepHours === 'number') {
        healthMetrics.push({
          name: 'Sleep',
          value: healthKit.sleepHours,
          unit: 'hours',
          data: [{ date: nowIso, value: healthKit.sleepHours }],
        });
      }
    }

    // 4. Create a summary with sensible default values (simple heuristics).
    const summary: DashboardData['summary'] = {
      biologicalAge: healthKit?.heartRate ? Math.max(20, Math.min(90, 80 - Math.round((healthKit.heartRate - 60) / 2))) : 40,
      chronologicalAge: 40, // Could be calculated from DOB when available
      healthspanPrediction: 85,
      longevityScore: 80,
      recentTrends: {
        biologicalAge: 'stable',
        healthspanPrediction: 'stable',
        longevityScore: 'stable',
      },
      topRecommendations: [
        'Stay active every day',
        'Prioritise quality sleep',
      ],
    };

    const dashboardData: Partial<DashboardData> = {
      summary,
      healthMetrics,
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}