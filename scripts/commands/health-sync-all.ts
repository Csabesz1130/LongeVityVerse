import User from '@/lib/db/models/User';
import { inngest } from '@/lib/tasks/inngest';

export async function syncAllUsers(source?: string) {
  const query: any = {};
  if (source) {
    const mapped = source;
    query[`healthIntegrations.${mapped}.connected`] = true;
  } else {
    query.$or = [
      { 'healthIntegrations.googleFit.connected': true },
      { 'healthIntegrations.fitbit.connected': true },
    ];
  }

  const users = await User.find(query).select('_id healthIntegrations').lean();
  let eventsQueued = 0;

  for (const u of users) {
    const toQueue: Array<'google_fit' | 'fitbit'> = [];
    if (!source || source === 'google_fit') {
      if ((u as any).healthIntegrations?.googleFit?.connected) toQueue.push('google_fit');
    }
    if (!source || source === 'fitbit') {
      if (u as any).healthIntegrations?.fitbit?.connected) toQueue.push('fitbit');
    }
    for (const s of toQueue) {
      await inngest.send({ name: 'health/sync.requested', data: { userId: String((u as any)._id), source: s, forceRefresh: false } });
      eventsQueued++;
    }
  }

  return users.length;
}


