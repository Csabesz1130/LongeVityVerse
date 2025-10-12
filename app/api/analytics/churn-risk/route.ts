import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import { analyticsEngine } from '@/lib/services/analytics-engine';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const atRiskUsers = await analyticsEngine.churnPrediction();

    const summary = {
      total: atRiskUsers.length,
      critical: atRiskUsers.filter(u => u.churnRisk === 'critical').length,
      high: atRiskUsers.filter(u => u.churnRisk === 'high').length,
      medium: atRiskUsers.filter(u => u.churnRisk === 'medium').length,
    };

    return NextResponse.json({
      atRiskUsers,
      summary,
    });
  } catch (error: any) {
    console.error('Churn risk analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
