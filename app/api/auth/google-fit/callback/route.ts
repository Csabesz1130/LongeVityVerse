import { NextRequest, NextResponse } from 'next/server';
import { handleGoogleFitCallback } from '@/libs/googleFit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/integrations?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/integrations?error=no_code', request.url)
      );
    }

    const success = await handleGoogleFitCallback(code);

    if (success) {
      return NextResponse.redirect(
        new URL('/integrations?success=google_fit_connected', request.url)
      );
    } else {
      return NextResponse.redirect(
        new URL('/integrations?error=connection_failed', request.url)
      );
    }
  } catch (error) {
    console.error('Google Fit callback error:', error);
    return NextResponse.redirect(
      new URL('/integrations?error=server_error', request.url)
    );
  }
}