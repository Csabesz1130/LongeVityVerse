import { Redis } from '@upstash/redis';
import { logger } from '@/libs/monitoring/logger';

interface MetricData {
  name: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
  timestamp: number;
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

class MetricsCollector {
  private buffer: MetricData[] = [];
  private flushInterval = 60_000; // 1 minute

  constructor() {
    if (typeof window === 'undefined') {
      setInterval(() => {
        this.flush().catch((e) => logger.error('metrics.flush failed', e));
      }, this.flushInterval);
    }
  }

  record(name: string, value: number, unit: string = 'count', tags?: Record<string, string>) {
    const metric: MetricData = { name, value, unit, tags, timestamp: Date.now() };
    this.buffer.push(metric);
    if (this.buffer.length >= 100) {
      void this.flush();
    }
  }

  increment(name: string, value: number = 1, tags?: Record<string, string>) {
    this.record(name, value, 'count', tags);
  }

  timing(name: string, durationMs: number, tags?: Record<string, string>) {
    this.record(name, durationMs, 'milliseconds', tags);
  }

  gauge(name: string, value: number, tags?: Record<string, string>) {
    this.record(name, value, 'gauge', tags);
  }

  async measure<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      this.timing(name, Date.now() - start, { ...tags, status: 'success' });
      return result;
    } catch (error) {
      this.timing(name, Date.now() - start, { ...tags, status: 'error' });
      throw error;
    }
  }

  private async flush(): Promise<void> {
    if (this.buffer.length === 0) return;
    const metricsToFlush = [...this.buffer];
    this.buffer = [];

    try {
      const key = `metrics:${Date.now()}`;
      // Store as a list entry; expire after 7 days
      await redis.rpush(key, metricsToFlush.map((m) => JSON.stringify(m)));
      await redis.expire(key, 86400 * 7);
    } catch (error) {
      logger.error('Failed to flush metrics', error);
    }
  }
}

export const metrics = new MetricsCollector();
export type { MetricData };


