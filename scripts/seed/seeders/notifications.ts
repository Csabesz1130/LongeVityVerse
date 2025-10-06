import Notification from '@/lib/db/models/Notification';

interface SeedOptions { clean?: boolean; minimal?: boolean; production?: boolean }

export async function seedNotifications(options: SeedOptions, users: any[]) {
  const notifications: any[] = [];
  if (options.production) return [];
  const notificationCount = options.minimal ? 5 : 20;
  for (let i = 0; i < notificationCount; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const types = ['health_sync', 'insight_ready', 'review_assigned', 'system'] as const;
    const type = types[Math.floor(Math.random() * types.length)];
    const notification = await Notification.create({
      userId: user._id,
      type,
      title: `${String(type).replace('_', ' ')} notification`,
      message: 'This is a test notification',
      read: Math.random() > 0.5,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
    notifications.push(notification);
  }
  return notifications;
}


