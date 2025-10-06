import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Return available integrations
    const integrations = [
      {
        id: 'google-fit',
        name: 'Google Fit',
        description: 'Sync your fitness data from Google Fit',
        connected: false,
        icon: '🏃‍♂️',
      },
      {
        id: 'apple-health',
        name: 'Apple Health',
        description: 'Connect your Apple Health data',
        connected: false,
        icon: '🍎',
      },
      {
        id: 'fitbit',
        name: 'Fitbit',
        description: 'Sync data from your Fitbit device',
        connected: false,
        icon: '⌚',
      },
    ];

    return NextResponse.json({ integrations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { integrationId, action } = body;

    // Handle integration actions
    switch (action) {
      case 'connect': {
        // Generate OAuth URL for the integration
        const oauthUrl = generateOAuthUrl(integrationId);
        return NextResponse.json({ oauthUrl });
      }
      
      case 'disconnect': {
        // Disconnect the integration
        return NextResponse.json({ success: true });
      }
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function generateOAuthUrl(integrationId: string): string {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  
  switch (integrationId) {
    case 'google-fit':
      return `${baseUrl}/auth/google-fit`;
    case 'apple-health':
      return `${baseUrl}/auth/apple-health`;
    case 'fitbit':
      return `${baseUrl}/auth/fitbit`;
    default:
      throw new Error('Unknown integration');
  }
}
