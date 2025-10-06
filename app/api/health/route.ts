import { NextResponse } from 'next/server';
import { performHealthCheck } from '@/libs/monitoring/health-check';

export async function GET() {
  try {
    const health = await performHealthCheck();
    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'unhealthy', error: error?.message, timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}


