'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface HealthCheckResult {
  status: string;
  checks: Record<string, any>;
  timestamp: string;
}

export default function MetricsDashboard() {
  const [health, setHealth] = useState<HealthCheckResult | null>(null);
  const [metrics, setMetrics] = useState<any[]>([]);

  useEffect(() => {
    const fetchHealth = async () => {
      const res = await fetch('/api/health', { cache: 'no-store' });
      const data = await res.json();
      setHealth(data);
    };

    const fetchMetrics = async () => {
      const res = await fetch('/api/admin/metrics', { cache: 'no-store' });
      const data = await res.json();
      setMetrics(data);
    };

    fetchHealth();
    fetchMetrics();
    const interval = setInterval(() => {
      fetchHealth();
      fetchMetrics();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">System Metrics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Overall Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                health?.status === 'healthy'
                  ? 'text-green-500'
                  : health?.status === 'degraded'
                  ? 'text-yellow-500'
                  : 'text-red-500'
              }`}
            >
              {health?.status?.toUpperCase() || 'Loading...'}
            </div>
          </CardContent>
        </Card>

        {health?.checks &&
          Object.entries(health.checks).map(([name, check]) => (
            <Card key={name}>
              <CardHeader>
                <CardTitle className="capitalize">{name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-xl font-semibold ${
                    check.status === 'pass' ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {check.status === 'pass' ? '✓ Operational' : '✗ Down'}
                </div>
                {check.responseTime && (
                  <div className="text-sm text-gray-500 mt-2">
                    {check.responseTime}ms
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Response Times (Last Hour)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Minimal, render as plain list to avoid adding recharts dependency */}
          <div className="space-y-1 text-sm">
            {metrics.map((m) => (
              <div key={m.timestamp} className="flex items-center justify-between">
                <span className="text-gray-600">{m.timestamp}</span>
                <span>avg: {m.avgResponseTime}ms</span>
                <span>p95: {m.p95ResponseTime}ms</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Request Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1 text-sm">
            {metrics.map((m) => (
              <div key={m.timestamp} className="flex items-center justify-between">
                <span className="text-gray-600">{m.timestamp}</span>
                <span>{m.requestCount}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


