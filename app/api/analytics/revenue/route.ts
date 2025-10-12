import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { analyticsEngine } from '@/lib/services/analytics-engine';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = new Date(searchParams.get('startDate') || Date.now() - 365 * 24 * 60 * 60 * 1000);
    const endDate = new Date(searchParams.get('endDate') || Date.now());

    const data = await analyticsEngine.revenueAnalytics(startDate, endDate);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Revenue analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
