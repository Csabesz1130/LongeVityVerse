import { connectDB } from '@/lib/db/mongodb';
import HealthData from '@/lib/db/models/HealthData';
import User from '@/lib/db/models/User';
import Content from '@/lib/db/models/Content';
import UserEvent from '@/lib/db/models/UserEvent';
import { cache } from '@/lib/cache/cache-manager';
import mongoose from 'mongoose';

interface AnalyticsQuery {
  startDate: Date;
  endDate: Date;
  granularity: 'hour' | 'day' | 'week' | 'month';
  metrics: string[];
  filters?: {
    userId?: string;
    organizationId?: string;
    dataType?: string;
    source?: string;
  };
}

interface TimeSeriesData {
  timestamp: Date;
  value: number;
  metadata?: any;
}

export class AnalyticsEngine {
  /**
   * Get time series data with intelligent aggregation
   */
  async getTimeSeries(query: AnalyticsQuery): Promise<TimeSeriesData[]> {
    const cacheKey = `analytics:timeseries:${JSON.stringify(query)}`;
    
    return await cache.get(
      cacheKey,
      async () => {
        await connectDB();

        // Build aggregation pipeline based on granularity
        const dateFormat = this.getDateFormat(query.granularity);
        
        const pipeline: any[] = [
          {
            $match: {
              timestamp: {
                $gte: query.startDate,
                $lte: query.endDate,
              },
              ...query.filters,
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: dateFormat,
                  date: '$timestamp',
                },
              },
              value: { $avg: '$value' },
              count: { $sum: 1 },
              min: { $min: '$value' },
              max: { $max: '$value' },
              stdDev: { $stdDevPop: '$value' },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ];

        const results = await HealthData.aggregate(pipeline);

        return results.map(r => ({
          timestamp: new Date(r._id),
          value: r.value,
          metadata: {
            count: r.count,
            min: r.min,
            max: r.max,
            stdDev: r.stdDev,
          },
        }));
      },
      { ttl: 3600, tags: ['analytics'] }
    );
  }

  /**
   * Cohort Analysis - Track user behavior over time
   */
  async cohortAnalysis(
    cohortDate: Date,
    periods: number = 12
  ): Promise<any[]> {
    await connectDB();

    const cohortStart = new Date(cohortDate);
    cohortStart.setHours(0, 0, 0, 0);
    
    const cohortEnd = new Date(cohortDate);
    cohortEnd.setHours(23, 59, 59, 999);

    // Get users who signed up in cohort period
    const cohortUsers = await User.find({
      createdAt: {
        $gte: cohortStart,
        $lte: cohortEnd,
      },
    }).select('_id');

    const cohortUserIds = cohortUsers.map(u => u._id);
    const cohortSize = cohortUserIds.length;

    if (cohortSize === 0) return [];

    // Track retention for each period
    const retention: any[] = [];

    for (let period = 0; period < periods; period++) {
      const periodStart = new Date(cohortDate);
      periodStart.setDate(periodStart.getDate() + period * 7); // Weekly cohorts
      
      const periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 7);

      // Count active users in this period
      const activeUsers = await HealthData.distinct('userId', {
        userId: { $in: cohortUserIds },
        timestamp: {
          $gte: periodStart,
          $lte: periodEnd,
        },
      });

      const retentionRate = (activeUsers.length / cohortSize) * 100;

      retention.push({
        period,
        weekLabel: `Week ${period}`,
        activeUsers: activeUsers.length,
        retentionRate: Math.round(retentionRate * 100) / 100,
        cohortSize,
      });
    }

    return retention;
  }

  /**
   * Funnel Analysis - Track user progression
   */
  async funnelAnalysis(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    await connectDB();

    // Define funnel steps
    const steps = [
      { name: 'Signup', collection: 'users', field: 'createdAt' },
      { name: 'Connected Integration', field: 'healthIntegrations' },
      { name: 'First Data Sync', collection: 'health_data' },
      { name: 'Viewed Score', collection: 'user_events', event: 'score_viewed' },
      { name: 'Read Article', collection: 'user_events', event: 'article_read' },
      { name: 'Became Paid', field: 'subscription.status', value: 'active' },
    ];

    const funnel: any[] = [];
    let previousCount = 0;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      let count = 0;

      // Different counting logic based on step type
      if (step.collection === 'users') {
        count = await User.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
        });
      } else if (step.collection === 'health_data') {
        const users = await HealthData.distinct('userId', {
          timestamp: { $gte: startDate, $lte: endDate },
        });
        count = users.length;
      } else if (step.field === 'healthIntegrations') {
        count = await User.countDocuments({
          createdAt: { $gte: startDate, $lte: endDate },
          $or: [
            { 'healthIntegrations.googleFit.connected': true },
            { 'healthIntegrations.fitbit.connected': true },
          ],
        });
      } else if (step.collection === 'user_events') {
        const users = await UserEvent.distinct('userId', {
          eventType: step.event,
          timestamp: { $gte: startDate, $lte: endDate },
        });
        count = users.length;
      } else if (step.field === 'subscription.status') {
        count = await User.countDocuments({
          'subscription.status': step.value,
          'subscription.startDate': { $gte: startDate, $lte: endDate },
        });
      }

      const conversionRate = i === 0 ? 100 : (count / previousCount) * 100;
      const dropoffRate = i === 0 ? 0 : 100 - conversionRate;

      funnel.push({
        step: i + 1,
        name: step.name,
        users: count,
        conversionRate: Math.round(conversionRate * 100) / 100,
        dropoffRate: Math.round(dropoffRate * 100) / 100,
      });

      previousCount = count;
    }

    return {
      steps: funnel,
      overallConversion: funnel.length > 0 
        ? (funnel[funnel.length - 1].users / funnel[0].users) * 100 
        : 0,
    };
  }

  /**
   * User Segmentation - RFM Analysis
   */
  async rfmSegmentation(): Promise<any[]> {
    await connectDB();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Calculate RFM scores for each user
    const pipeline = [
      {
        $match: {
          createdAt: { $lte: thirtyDaysAgo },
        },
      },
      {
        $lookup: {
          from: 'health_data',
          localField: '_id',
          foreignField: 'userId',
          as: 'healthData',
        },
      },
      {
        $addFields: {
          recency: {
            $cond: [
              { $gt: [{ $size: '$healthData' }, 0] },
              {
                $divide: [
                  {
                    $subtract: [
                      now,
                      { $max: '$healthData.timestamp' },
                    ],
                  },
                  86400000, // Convert to days
                ],
              },
              999, // No data = maximum recency
            ],
          },
          frequency: { $size: '$healthData' },
          monetary: {
            $cond: [
              { $eq: ['$subscription.status', 'active'] },
              '$subscription.amount',
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          recency: 1,
          frequency: 1,
          monetary: 1,
        },
      },
    ];

    const users = await User.aggregate(pipeline);

    // Calculate quintiles for scoring
    const recencies = users.map(u => u.recency).sort((a, b) => a - b);
    const frequencies = users.map(u => u.frequency).sort((a, b) => b - a);
    const monetaries = users.map(u => u.monetary).sort((a, b) => b - a);

    // Assign RFM scores (1-5)
    const segments = users.map(user => {
      const rScore = this.getQuintileScore(user.recency, recencies, true);
      const fScore = this.getQuintileScore(user.frequency, frequencies);
      const mScore = this.getQuintileScore(user.monetary, monetaries);

      const segment = this.getSegmentName(rScore, fScore, mScore);

      return {
        userId: user._id,
        name: user.name,
        email: user.email,
        recency: Math.round(user.recency),
        frequency: user.frequency,
        monetary: user.monetary,
        rScore,
        fScore,
        mScore,
        rfmScore: `${rScore}${fScore}${mScore}`,
        segment,
      };
    });

    return segments;
  }

  /**
   * Predictive Churn Analysis
   */
  async churnPrediction(): Promise<any[]> {
    await connectDB();

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Find users at risk of churning
    const atRiskUsers = await User.aggregate([
      {
        $match: {
          'subscription.status': 'active',
        },
      },
      {
        $lookup: {
          from: 'health_data',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$userId', '$$userId'] },
                timestamp: { $gte: fourteenDaysAgo },
              },
            },
          ],
          as: 'recentActivity',
        },
      },
      {
        $addFields: {
          activityCount: { $size: '$recentActivity' },
          lastActivityDate: { $max: '$recentActivity.timestamp' },
          daysSinceActivity: {
            $divide: [
              { $subtract: [now, { $max: '$recentActivity.timestamp' }] },
              86400000,
            ],
          },
        },
      },
      {
        $match: {
          $or: [
            { activityCount: { $lt: 5 } },
            { daysSinceActivity: { $gt: 7 } },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          activityCount: 1,
          daysSinceActivity: 1,
          churnRisk: {
            $switch: {
              branches: [
                {
                  case: { $gt: ['$daysSinceActivity', 14] },
                  then: 'critical',
                },
                {
                  case: { $gt: ['$daysSinceActivity', 7] },
                  then: 'high',
                },
                {
                  case: { $lt: ['$activityCount', 3] },
                  then: 'medium',
                },
              ],
              default: 'low',
            },
          },
        },
      },
      {
        $sort: { daysSinceActivity: -1 },
      },
    ]);

    return atRiskUsers;
  }

  /**
   * Revenue Analytics
   */
  async revenueAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    await connectDB();

    const revenueData = await User.aggregate([
      {
        $match: {
          'subscription.status': 'active',
          'subscription.startDate': {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$subscription.startDate',
            },
          },
          mrr: { $sum: '$subscription.amount' },
          newCustomers: { $sum: 1 },
          avgRevenuePerUser: { $avg: '$subscription.amount' },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Calculate key metrics
    const totalMRR = revenueData.reduce((sum, d) => sum + d.mrr, 0);
    const totalCustomers = revenueData.reduce((sum, d) => sum + d.newCustomers, 0);
    const avgARPU = totalCustomers > 0 ? totalMRR / totalCustomers : 0;

    // Calculate growth rate
    const growthRates = [];
    for (let i = 1; i < revenueData.length; i++) {
      const current = revenueData[i].mrr;
      const previous = revenueData[i - 1].mrr;
      const growthRate = previous > 0 ? ((current - previous) / previous) * 100 : 0;
      
      growthRates.push({
        month: revenueData[i]._id,
        growthRate: Math.round(growthRate * 100) / 100,
      });
    }

    return {
      totalMRR: Math.round(totalMRR * 100) / 100,
      totalCustomers,
      avgARPU: Math.round(avgARPU * 100) / 100,
      arr: Math.round(totalMRR * 12 * 100) / 100,
      monthlyData: revenueData,
      growthRates,
    };
  }

  /**
   * Content Performance Analytics
   */
  async contentPerformance(
    startDate: Date,
    endDate: Date
  ): Promise<any[]> {
    await connectDB();

    const performance = await Content.aggregate([
      {
        $match: {
          status: 'published',
          publishedAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          category: 1,
          tags: 1,
          views: 1,
          publishedAt: 1,
          'evaluation.score': 1,
          age: {
            $divide: [
              { $subtract: [new Date(), '$publishedAt'] },
              86400000, // Days
            ],
          },
          viewsPerDay: {
            $divide: [
              '$views',
              {
                $divide: [
                  { $subtract: [new Date(), '$publishedAt'] },
                  86400000,
                ],
              },
            ],
          },
        },
      },
      {
        $sort: { viewsPerDay: -1 },
      },
      {
        $limit: 50,
      },
    ]);

    // Calculate category performance
    const categoryStats = await Content.aggregate([
      {
        $match: {
          status: 'published',
          publishedAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          avgViews: { $avg: '$views' },
          avgScore: { $avg: '$evaluation.score' },
        },
      },
      {
        $sort: { totalViews: -1 },
      },
    ]);

    return {
      topContent: performance,
      categoryStats,
    };
  }

  /**
   * User Journey Analysis
   */
  async userJourney(userId: string): Promise<any> {
    await connectDB();

    const user = await User.findById(userId);
    if (!user) return null;

    // Get all user events chronologically
    const events = [];

    // Signup event
    events.push({
      type: 'signup',
      timestamp: user.createdAt,
      metadata: { email: user.email },
    });

    // Integration connections
    if (user.healthIntegrations?.googleFit?.connected) {
      events.push({
        type: 'integration_connected',
        timestamp: user.healthIntegrations.googleFit.connectedAt || user.createdAt,
        metadata: { provider: 'google_fit' },
      });
    }

    if (user.healthIntegrations?.fitbit?.connected) {
      events.push({
        type: 'integration_connected',
        timestamp: user.healthIntegrations.fitbit.connectedAt || user.createdAt,
        metadata: { provider: 'fitbit' },
      });
    }

    // Health data syncs
    const healthSyncs = await HealthData.find({ userId })
      .select('timestamp dataType')
      .sort({ timestamp: 1 })
      .limit(100);

    healthSyncs.forEach(sync => {
      events.push({
        type: 'data_sync',
        timestamp: sync.timestamp,
        metadata: { dataType: sync.dataType },
      });
    });

    // User events from UserEvent collection
    const userEvents = await UserEvent.find({ userId })
      .select('eventType timestamp metadata')
      .sort({ timestamp: 1 });

    userEvents.forEach(event => {
      events.push({
        type: event.eventType,
        timestamp: event.timestamp,
        metadata: event.metadata,
      });
    });

    // Sort all events by timestamp
    events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return {
      userId,
      userName: user.name,
      signupDate: user.createdAt,
      events,
      totalEvents: events.length,
      daysSinceSignup: Math.floor(
        (Date.now() - user.createdAt.getTime()) / 86400000
      ),
    };
  }

  // Helper methods
  private getDateFormat(granularity: string): string {
    switch (granularity) {
      case 'hour':
        return '%Y-%m-%dT%H:00:00Z';
      case 'day':
        return '%Y-%m-%d';
      case 'week':
        return '%Y-W%V';
      case 'month':
        return '%Y-%m';
      default:
        return '%Y-%m-%d';
    }
  }

  private getQuintileScore(
    value: number,
    sortedValues: number[],
    inverse: boolean = false
  ): number {
    const quintileSize = Math.floor(sortedValues.length / 5);
    const index = sortedValues.indexOf(value);
    const score = Math.min(5, Math.floor(index / quintileSize) + 1);
    
    return inverse ? 6 - score : score;
  }

  private getSegmentName(r: number, f: number, m: number): string {
    if (r >= 4 && f >= 4 && m >= 4) return 'Champions';
    if (r >= 3 && f >= 3 && m >= 3) return 'Loyal Customers';
    if (r >= 4 && f <= 2) return 'Promising';
    if (r <= 2 && f >= 4) return 'At Risk';
    if (r <= 2 && f <= 2 && m <= 2) return 'Lost';
    if (m >= 4) return 'Big Spenders';
    return 'Regular';
  }
}

export const analyticsEngine = new AnalyticsEngine();
