import { performHealthCheck } from '@/lib/monitoring/health-check';

export async function runSystemCheck() {
  console.log('\n🔍 System Health Check');
  console.log('='.repeat(60));
  const health = await performHealthCheck();
  console.log(`\nOverall Status: ${health.status.toUpperCase()}`);
  console.log('\nComponents:');
  console.log('-'.repeat(60));
  for (const [name, check] of Object.entries(health.checks)) {
    const status = (check as any).status === 'pass' ? '✓' : '✗';
    const color = (check as any).status === 'pass' ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}${status}\x1b[0m ${name.padEnd(20)} ${(check as any).responseTime ? `${(check as any).responseTime}ms` : (check as any).message || ''}`);
  }
  console.log('='.repeat(60) + '\n');
}


