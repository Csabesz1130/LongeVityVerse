import { inngest } from '../inngest';
import { NotificationService } from '@/lib/services/notification-service';

// Health sync completion notification
export const healthSyncNotification = inngest.createFunction(
  {
    id: 'notification-health-sync',
    name: 'Notify Health Sync Complete',
  },
  { event: 'health/sync.completed' },
  async ({ event }) => {
    const { userId, source, recordsProcessed } = event.data;

    await NotificationService.create({
      userId,
      type: 'health_sync',
      title: 'Health Data Synced',
      message: `Successfully synced ${recordsProcessed} records from ${source}`,
      priority: 'low',
      sendPush: true,
    });
  }
);

// Insights ready notification
export const insightsReadyNotification = inngest.createFunction(
  {
    id: 'notification-insights-ready',
    name: 'Notify Insights Ready',
  },
  { event: 'health/insights.ready' },
  async ({ event }) => {
    const { userId, period } = event.data;

    await NotificationService.create({
      userId,
      type: 'insight_ready',
      title: 'New Health Insights Available',
      message: `Your ${period} health insights are ready to view`,
      actionUrl: '/dashboard/insights',
      actionLabel: 'View Insights',
      priority: 'medium',
      sendEmail: true,
      sendPush: true,
    });
  }
);

// Review assigned notification
export const reviewAssignedNotification = inngest.createFunction(
  {
    id: 'notification-review-assigned',
    name: 'Notify Review Assigned',
  },
  { event: 'notification/review.assigned' },
  async ({ event }) => {
    const { reviewerId, contentId } = event.data;

    await NotificationService.create({
      userId: reviewerId,
      type: 'review_assigned',
      title: 'New Review Assignment',
      message: 'You have been assigned to review a new content submission',
      actionUrl: `/review/${contentId}`,
      actionLabel: 'Start Review',
      priority: 'high',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      sendEmail: true,
    });
  }
);

// Review complete notification
export const reviewCompleteNotification = inngest.createFunction(
  {
    id: 'notification-review-complete',
    name: 'Notify Review Complete',
  },
  { event: 'notification/review.complete' },
  async ({ event }) => {
    const { authorId, contentId, finalStatus, avgScore } = event.data;

    const statusMessages = {
      published: 'approved and published',
      archived: 'not approved for publication',
      draft: 'requires revisions',
    };

    await NotificationService.create({
      userId: authorId,
      type: 'review_complete',
      title: 'Review Complete',
      message: `Your content has been ${statusMessages[finalStatus as keyof typeof statusMessages]} (Score: ${avgScore}/100)`,
      actionUrl: `/content/${contentId}`,
      actionLabel: 'View Feedback',
      priority: 'high',
      sendEmail: true,
      sendPush: true,
    });
  }
);
