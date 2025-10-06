import User from '@/lib/db/models/User';
import HealthData from '@/lib/db/models/HealthData';
import Content from '@/lib/db/models/Content';
import SyncJob from '@/lib/db/models/SyncJob';
import Reviewer from '@/lib/db/models/Reviewer';
import Notification from '@/lib/db/models/Notification';

export async function runMigrations() {
  // For MongoDB, treat migrations as ensuring indexes are created
  await Promise.all([
    User.syncIndexes(),
    HealthData.syncIndexes(),
    Content.syncIndexes(),
    SyncJob.syncIndexes(),
    Reviewer.syncIndexes(),
    Notification.syncIndexes(),
  ]);
}


