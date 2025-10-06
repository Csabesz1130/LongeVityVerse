import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Returns aggregated metrics for the last hour
export async function GET() {
  try {
    const now = Date.now();
    const keys = [] as string[];
    // Walk back over the last ~60 minutes keys by approximate minute buckets
    for (let i = 0; i < 60; i++) {
      const ts = now - i * 60_000;
      keys.push(`metrics:${ts}`);
    }

    const existing = await redis.mget<string[]>(...keys);
    const raw: any[] = [];
      for (const entry of existing) {
        if (!entry) continue;
        if (Array.isArray(entry)) {
          for (const s of entry) {
            try { raw.push(JSON.parse(s as any)); } catch (e) {
              // Ignore parsing errors
            }
          }
        } else if (typeof entry === 'string') {
          try { raw.push(JSON.parse(entry)); } catch (e) {
            // Ignore parsing errors
          }
        }
      }

    // Aggregate by minute
    const byMinute = new Map<string, { count: number; durations: number[] }>();
    for (const m of raw) {
      const minute = new Date(m.timestamp).toISOString().slice(0, 16) + ':00';
      const bucket = byMinute.get(minute) || { count: 0, durations: [] };
      bucket.count += 1;
      if (m.name === 'http.request.duration') {
        bucket.durations.push(Number(m.value) || 0);
      }
      byMinute.set(minute, bucket);
    }

    const points = Array.from(byMinute.entries())
      .sort(([a], [b]) => (a < b ? -1 : 1))
      .map(([timestamp, b]) => {
        const sorted = [...b.durations].sort((x, y) => x - y);
        const p95 = sorted.length ? sorted[Math.floor(sorted.length * 0.95)] : 0;
        const avg = sorted.length ? sorted.reduce((s, v) => s + v, 0) / sorted.length : 0;
        return {
          timestamp,
          requestCount: b.count,
          avgResponseTime: Math.round(avg),
          p95ResponseTime: Math.round(p95),
        };
      });

    return NextResponse.json(points, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}


