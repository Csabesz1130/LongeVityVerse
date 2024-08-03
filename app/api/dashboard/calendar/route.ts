import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { google } from 'googleapis';
import { Session } from 'next-auth';

// Extend the Session type to include accessToken
interface ExtendedSession extends Session {
  accessToken?: string;
}

// Helper function to get access token
const getAccessToken = (session: ExtendedSession | null): string | null => {
  return session?.accessToken ?? null;
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions) as ExtendedSession | null;

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = getAccessToken(session);
  if (!accessToken) {
    return NextResponse.json({ error: 'Access token not found' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const { searchParams } = new URL(req.url);
  const pageToken = searchParams.get('pageToken');
  const maxResults = searchParams.get('maxResults') || '10';

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: (new Date()).toISOString(),
      maxResults: parseInt(maxResults, 10),
      singleEvents: true,
      orderBy: 'startTime',
      pageToken: pageToken || undefined,
    });

    return NextResponse.json({
      items: response.data.items,
      nextPageToken: response.data.nextPageToken,
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar events' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as ExtendedSession | null;

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accessToken = getAccessToken(session);
  if (!accessToken) {
    return NextResponse.json({ error: 'Access token not found' }, { status: 401 });
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  try {
    const { summary, description, start, end } = await req.json();

    const event = {
      summary,
      description,
      start: { dateTime: start },
      end: { dateTime: end },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return NextResponse.json({ error: 'Failed to create calendar event' }, { status: 500 });
  }
}