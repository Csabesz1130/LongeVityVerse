// Create a new file: libs/planCache.ts

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const CACHE_TTL = 60 * 60 * 24; // 24 hours

export async function getCachedPlan(key: string): Promise<string | null> {
  return redis.get(key);
}

export async function cachePlan(key: string, plan: string): Promise<void> {
  await redis.set(key, plan, { ex: CACHE_TTL });
}