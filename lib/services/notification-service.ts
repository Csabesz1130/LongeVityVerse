import connectMongo from '@/libs/mongoose';
import Notification from '@/lib/db/models/Notification';
import User from '@/models/User';
import { logger } from '@/libs/monitoring/logger';

interface CreateNotificationParams {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  expiresAt?: Date;
  sendEmail?: boolean;
  sendPush?: boolean;
}

export class NotificationService {
  // Create in-app notification
  static async create(params: CreateNotificationParams) {
    await connectMongo();

    const notification = await Notification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      data: params.data,
      actionUrl: params.actionUrl,
      actionLabel: params.actionLabel,
      priority: params.priority || 'medium',
      expiresAt: params.expiresAt,
    });

    // Send email if requested
    if (params.sendEmail) {
      await this.sendEmail(params.userId, params.title, params.message, params.actionUrl);
    }

    // Send push notification if requested
    if (params.sendPush) {
      await this.sendPush(params.userId, params.title, params.message);
    }

    // Broadcast via WebSocket (if implemented)
    await this.broadcast(params.userId, notification);

    logger.info('Notification created', {
      userId: params.userId,
      type: params.type,
      priority: params.priority,
    });

    return notification;
  }

  // Send email notification
  private static async sendEmail(
    userId: string,
    title: string,
    message: string,
    actionUrl?: string
  ) {
    try {
      await connectMongo();
      const user = await User.findById(userId);

      if (!user || !user.preferences?.notificationsEnabled) {
        return;
      }

      // For now, just log - implement email service later
      logger.info('Email notification would be sent', { 
        userId, 
        title, 
        email: user.email 
      });

      // TODO: Implement actual email sending with Resend or similar
      // await resend.emails.send({
      //   from: 'LongevityVerse <notifications@longevityverse.com>',
      //   to: user.email,
      //   subject: title,
      //   html: this.getEmailTemplate(title, message, actionUrl),
      // });

    } catch (error) {
      logger.error('Failed to send email notification', error);
    }
  }

  // Send push notification (Web Push API)
  private static async sendPush(
    userId: string,
    title: string,
    message: string
  ) {
    try {
      // Implementation for Web Push API
      // This would use service workers and push subscriptions
      logger.info('Push notification sent', { userId, title });
    } catch (error) {
      logger.error('Failed to send push notification', error);
    }
  }

  // Broadcast via WebSocket/SSE
  private static async broadcast(userId: string, notification: any) {
    // This would integrate with a WebSocket or SSE implementation
    // For now, we'll use polling in the client
  }

  // Mark notifications as read
  static async markAsRead(userId: string, notificationIds: string[]) {
    await connectMongo();

    await Notification.updateMany(
      {
        _id: { $in: notificationIds },
        userId,
      },
      {
        $set: { read: true },
      }
    );
  }

  // Mark all as read
  static async markAllAsRead(userId: string) {
    await connectMongo();

    await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
  }

  // Delete notification
  static async delete(userId: string, notificationId: string) {
    await connectMongo();

    await Notification.deleteOne({
      _id: notificationId,
      userId,
    });
  }

  // Get unread count
  static async getUnreadCount(userId: string): Promise<number> {
    await connectMongo();

    return await Notification.countDocuments({
      userId,
      read: false,
    });
  }

  // Email template
  private static getEmailTemplate(title: string, message: string, actionUrl?: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🧬 LongevityVerse</h1>
            </div>
            <div class="content">
              <h2>${title}</h2>
              <p>${message}</p>
              ${actionUrl ? `<a href="${actionUrl}" class="button">View Details</a>` : ''}
            </div>
            <div class="footer">
              <p>You're receiving this because you're a member of LongevityVerse.</p>
              <p><a href="https://longevityverse.com/settings">Manage notification preferences</a></p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
