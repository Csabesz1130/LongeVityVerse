import HealthData from '@/lib/db/models/HealthData';

const dataTypes = ['steps', 'heart_rate', 'sleep', 'activity', 'weight'] as const;
const sources = ['google_fit', 'fitbit', 'manual'] as const;

interface SeedOptions { clean?: boolean; minimal?: boolean; production?: boolean }

export async function seedHealthData(options: SeedOptions, users: any[]) {
  const healthRecords: any[] = [];
  const recordCount = options.minimal ? 100 : options.production ? 0 : 1000;
  if (recordCount === 0) return [];

  const activeUsers = users.filter((u: any) => u.healthIntegrations?.googleFit?.connected || u.healthIntegrations?.fitbit?.connected);

  for (let i = 0; i < recordCount; i++) {
    const user = activeUsers[Math.floor(Math.random() * activeUsers.length)];
    const dataType = dataTypes[Math.floor(Math.random() * dataTypes.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];

    let value = 0; let unit = '';
    switch (dataType) {
      case 'steps': value = Math.floor(Math.random() * 15000) + 2000; unit = 'steps'; break;
      case 'heart_rate': value = Math.floor(Math.random() * 40) + 60; unit = 'bpm'; break;
      case 'sleep': value = Math.floor(Math.random() * 120) + 360; unit = 'minutes'; break;
      case 'activity': value = Math.floor(Math.random() * 60) + 15; unit = 'minutes'; break;
      case 'weight': value = Math.floor(Math.random() * 50) + 60; unit = 'kg'; break;
    }

    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);

    const record = await HealthData.create({
      userId: user._id,
      organization: user.organization,
      source,
      dataType,
      value,
      unit,
      metadata: {},
      timestamp,
      syncedAt: new Date(),
    });
    healthRecords.push(record);
  }
  return healthRecords;
}


