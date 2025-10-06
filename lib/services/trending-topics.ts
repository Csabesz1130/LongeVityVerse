import connectMongo from '@/libs/mongoose';
import Content from '@/lib/db/models/Content';

interface TrendingTopic {
  tag: string;
  count: number;
  growth: number; // Percentage growth from last period
  sentiment: number;
  topContent: any[];
}

// Simple in-memory cache for now
const cache = new Map<string, { data: any; expires: number }>();

export async function getTrendingTopics(
  period: '24h' | '7d' | '30d' = '7d'
): Promise<TrendingTopic[]> {
  const cacheKey = `trending:topics:${period}`;
  const cached = cache.get(cacheKey);
  
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  await connectMongo();

  const now = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24);
      break;
    case '7d':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(startDate.getDate() - 30);
      break;
  }

  // Get tag statistics
  const tagStats = await Content.aggregate([
    {
      $match: {
        status: 'published',
        publishedAt: { $gte: startDate },
      },
    },
    { $unwind: '$tags' },
    {
      $group: {
        _id: '$tags',
        count: { $sum: 1 },
        avgViews: { $avg: '$views' },
        avgSentiment: { $avg: '$sentiment.score' },
        contentIds: { $push: '$_id' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  // Calculate growth rates
  const previousPeriodStart = new Date(startDate);
  previousPeriodStart.setTime(
    previousPeriodStart.getTime() - (now.getTime() - startDate.getTime())
  );

  const trending: TrendingTopic[] = [];

  for (const stat of tagStats) {
    // Get previous period count
    const prevCount = await Content.countDocuments({
      status: 'published',
      tags: stat._id,
      publishedAt: {
        $gte: previousPeriodStart,
        $lt: startDate,
      },
    });

    const growth = prevCount > 0 
      ? ((stat.count - prevCount) / prevCount) * 100 
      : 100;

    // Get top content
    const topContent = await Content.find({
      _id: { $in: stat.contentIds.slice(0, 3) },
    })
      .select('title views publishedAt')
      .sort({ views: -1 })
      .limit(3);

    trending.push({
      tag: stat._id,
      count: stat.count,
      growth: Math.round(growth),
      sentiment: stat.avgSentiment || 0,
      topContent,
    });
  }

  const result = trending.sort((a, b) => b.growth - a.growth);
  
  // Cache for 1 hour
  cache.set(cacheKey, {
    data: result,
    expires: Date.now() + 3600000,
  });

  return result;
}
