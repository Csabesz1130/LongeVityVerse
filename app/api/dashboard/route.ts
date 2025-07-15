import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/libs/next-auth';
import connectToDatabase from '@/libs/mongoose';
import User from '@/models/User';
import { DashboardData, HealthMetric } from '@/types';

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
      if (typeof healthKit.steps === 'number') {
        healthMetrics.push({
          name: 'Steps',
          value: healthKit.steps,
          unit: 'steps',
          date: new Date().toISOString(),
        });
      }
      if (typeof healthKit.heartRate === 'number') {
        healthMetrics.push({
          name: 'Resting Heart Rate',
          value: healthKit.heartRate,
          unit: 'bpm',
          date: new Date().toISOString(),
        });
      }
      if (typeof healthKit.sleepHours === 'number') {
        healthMetrics.push({
          name: 'Sleep',
          value: healthKit.sleepHours,
          unit: 'hours',
          date: new Date().toISOString(),
        });
      }
    }

    // 4. Very simple placeholder calculations for summary fields.
    //    These can be replaced with more sophisticated algorithms later.
    const summary: DashboardData['summary'] = {
      biologicalAge: 0,
      chronologicalAge: 0,
      healthspanPrediction: 0,
      longevityScore: 0,
      recentTrends: ['stable', 'stable', 'stable'],
      topRecommendations: [],
    } as any; // casting because we use simplified values for now

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