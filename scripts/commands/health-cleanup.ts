import HealthData from '@/lib/db/models/HealthData';

export async function cleanupHealthData(days: number, dryRun: boolean = false) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  if (dryRun) {
    const count = await HealthData.countDocuments({ timestamp: { $lt: cutoffDate } });
    return count;
  }

  const result = await HealthData.deleteMany({ timestamp: { $lt: cutoffDate } });
  return result.deletedCount ?? 0;
}


