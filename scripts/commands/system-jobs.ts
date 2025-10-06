import SyncJob from '@/lib/db/models/SyncJob';

export async function showJobs(status?: string) {
  const query: any = {};
  if (status) query.status = status;
  const jobs = await SyncJob.find(query).sort({ scheduledAt: -1 }).limit(20).lean();
  console.log('\n📋 Background Jobs:');
  console.log('-'.repeat(100));
  console.log('Type'.padEnd(25) + 'Status'.padEnd(15) + 'Progress'.padEnd(15) + 'Scheduled'.padEnd(20) + 'Completed');
  console.log('-'.repeat(100));
  for (const job of jobs) {
    console.log(
      String(job.jobType).padEnd(25) +
      String(job.status).padEnd(15) +
      `${job.progress}%`.padEnd(15) +
      new Date(job.scheduledAt).toLocaleString().padEnd(20) +
      (job.completedAt ? new Date(job.completedAt).toLocaleString() : '-')
    );
  }
  console.log('-'.repeat(100));
  console.log(`Total: ${jobs.length} jobs\n`);
}


