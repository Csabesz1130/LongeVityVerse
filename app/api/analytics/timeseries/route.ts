import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { analyticsEngine } from '@/lib/services/analytics-engine';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    const startDate = new Date(searchParams.get('startDate') || Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = new Date(searchParams.get('endDate') || Date.now());
    const granularity = (searchParams.get('granularity') || 'day') as 'hour' | 'day' | 'week' | 'month';
    const userId = searchParams.get('userId');
    const dataType = searchParams.get('dataType');
    const source = searchParams.get('source');

    const data = await analyticsEngine.getTimeSeries({
      startDate,
      endDate,
      granularity,
      metrics: ['value'],
      filters: {
        ...(userId && { userId }),
        ...(dataType && { dataType }),
        ...(source && { source }),
      },
    });

    return NextResponse.json({ data });
  } catch (error: any) {
    console.error('Timeseries analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
