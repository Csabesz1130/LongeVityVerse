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

    // 4. Build summary using real user data where possible.
    // Biological age – rudimentary estimation based on resting heart rate.
    // Falls back to 40 if data missing.
    const biologicalAge = typeof healthKit?.heartRate === 'number'
      ? Math.max(20, Math.min(90, 80 - Math.round((healthKit.heartRate - 60) / 2)))
      : 40;

    // Chronological age – cannot be calculated without DOB, so we default for now.
    // You can extend the User schema with a dateOfBirth field to improve this.
    const chronologicalAge = 40;

    // Longevity score – use the virtual healthScore if available, otherwise fallback.
    // healthScore is calculated in the User schema using various metrics.
    const longevityScore = (user as any).healthScore ?? 80;

    // Pull the latest recommendations from stored insights.
    const recommendationsRaw = (user as any).healthData?.insights ?? [];
    const topRecommendations = recommendationsRaw
      .filter((insight: any) => insight.type === 'recommendation')
      .sort((a: any, b: any) => (b.createdAt as any) - (a.createdAt as any))
      .slice(0, 5)
      .map((rec: any) => rec.title || rec.description || 'Stay healthy');

    const summary: DashboardData['summary'] = {
      biologicalAge,
      chronologicalAge,
      healthspanPrediction: 85, // TODO: derive from longitudinal data
      longevityScore,
      recentTrends: {
        biologicalAge: 'stable', // TODO: implement trend calculation
        healthspanPrediction: 'stable',
        longevityScore: 'stable',
      },
      topRecommendations: topRecommendations.length > 0 ? topRecommendations : [
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