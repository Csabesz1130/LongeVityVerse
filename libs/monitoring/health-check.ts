import connectMongo from '@/libs/mongoose';
import { Redis } from '@upstash/redis';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    [key: string]: {
      status: 'pass' | 'fail';
      responseTime?: number;
      message?: string;
    };
  };
  timestamp: string;
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function performHealthCheck(): Promise<HealthStatus> {
  const checks: HealthStatus['checks'] = {};

  // MongoDB
  const mongoStart = Date.now();
  try {
    await connectMongo();
    checks.mongodb = { status: 'pass', responseTime: Date.now() - mongoStart };
  } catch (error: any) {
    checks.mongodb = { status: 'fail', message: error?.message };
  }

  // Redis
  const kvStart = Date.now();
  try {
    const key = 'health:check';
    await redis.set(key, Date.now(), { ex: 60 });
    await redis.get(key);
    checks.redis = { status: 'pass', responseTime: Date.now() - kvStart };
  } catch (error: any) {
    checks.redis = { status: 'fail', message: error?.message };
  }

  // OpenAI
  const openaiStart = Date.now();
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      cache: 'no-store',
    });
    checks.openai = {
      status: response.ok ? 'pass' : 'fail',
      responseTime: Date.now() - openaiStart,
    };
  } catch (error: any) {
    checks.openai = { status: 'fail', message: error?.message };
  }

  // Inngest configured
  checks.inngest = {
    status: process.env.INNGEST_EVENT_KEY ? 'pass' : 'fail',
    message: process.env.INNGEST_EVENT_KEY ? undefined : 'Not configured',
  };

  const failedChecks = Object.values(checks).filter((c) => c.status === 'fail');
  let status: HealthStatus['status'] = 'healthy';
  if (failedChecks.length > 0) {
    status = failedChecks.length >= 2 ? 'unhealthy' : 'degraded';
  }

  return { status, checks, timestamp: new Date().toISOString() };
}

export type { HealthStatus };


