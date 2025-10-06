import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { logger } from '@/libs/monitoring/logger';
import { metrics } from '@/libs/monitoring/metrics';

export async function middleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  logger.setContext({ requestId });

  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  const duration = Date.now() - start;
  metrics.timing('http.request.duration', duration, {
    method: request.method,
    path: request.nextUrl.pathname,
  });

  logger.info('HTTP Request', {
    method: request.method,
    path: request.nextUrl.pathname,
    duration,
    status: response.status,
  });

  return response;
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*', '/integrations/:path*'],
};


