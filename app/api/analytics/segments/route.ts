import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { analyticsEngine } from '@/lib/services/analytics-engine';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const segments = await analyticsEngine.rfmSegmentation();

    // Group by segment
    const groupedSegments = segments.reduce((acc: any, user) => {
      if (!acc[user.segment]) {
        acc[user.segment] = [];
      }
      acc[user.segment].push(user);
      return acc;
    }, {});

    const summary = Object.entries(groupedSegments).map(([segment, users]: [string, any]) => ({
      segment,
      count: users.length,
      avgRecency: Math.round(users.reduce((sum: number, u: any) => sum + u.recency, 0) / users.length),
      avgFrequency: Math.round(users.reduce((sum: number, u: any) => sum + u.frequency, 0) / users.length),
      totalRevenue: users.reduce((sum: number, u: any) => sum + u.monetary, 0),
    }));

    return NextResponse.json({
      segments: groupedSegments,
      summary,
    });
  } catch (error: any) {
    console.error('Segments analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
