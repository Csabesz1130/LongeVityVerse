import mongoose from 'mongoose';

export async function performHealthCheck() {
  const checks: Record<string, any> = {};

  // DB check
  const startDb = Date.now();
  try {
    await mongoose.connection.db.admin().ping();
    checks.database = { status: 'pass', responseTime: Date.now() - startDb };
  } catch (e) {
    checks.database = { status: 'fail', message: (e as Error).message };
  }

  // KV check placeholder
  checks.kv = { status: 'pass' };

  const status = Object.values(checks).every((c: any) => c.status === 'pass') ? 'ok' : 'degraded';
  return { status, checks };
}


