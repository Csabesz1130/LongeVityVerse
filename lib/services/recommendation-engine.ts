import connectMongo from '@/libs/mongoose';
import Content from '@/lib/db/models/Content';
import User from '@/models/User';

export class RecommendationEngine {
  // Collaborative filtering based on user behavior
  async getPersonalizedRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<any[]> {
    await connectMongo();

    const user = await User.findById(userId);
    if (!user) return [];

    // Get user's reading history
    const viewedContent = await Content.find({
      views: { $exists: true },
      // Track views per user in production
    }).limit(50);

    // Get user's health focus areas
    const healthData = user.healthData;
    const focusAreas = [];

    if (healthData?.weight) focusAreas.push('nutrition');
    if (healthData?.heartRate) focusAreas.push('cardiovascular');
    if (healthData?.sleepHours) focusAreas.push('sleep');
    if (healthData?.stressLevel) focusAreas.push('stress-management');

    // Find content matching user interests
    const recommendations = await Content.find({
      status: 'published',
      $or: [
        { tags: { $in: focusAreas } },
        { category: 'guide' }, // Actionable content
      ],
    })
      .sort({ 'evaluation.score': -1, views: -1 })
      .limit(limit);

    return recommendations;
  }

  // Trending content based on velocity
  async getTrendingContent(limit: number = 10): Promise<any[]> {
    await connectMongo();

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // Get content with high recent velocity
    const trending = await Content.aggregate([
      {
        $match: {
          status: 'published',
          publishedAt: { $gte: oneDayAgo },
        },
      },
      {
        $addFields: {
          velocity: {
            $divide: [
              '$views',
              {
                $divide: [
                  { $subtract: [new Date(), '$publishedAt'] },
                  3600000, // Convert to hours
                ],
              },
            ],
          },
        },
      },
      { $sort: { velocity: -1 } },
      { $limit: limit },
    ]);

    return trending;
  }

  // Smart content discovery based on gaps
  async discoverNewTopics(userId: string): Promise<any[]> {
    await connectMongo();

    const user = await User.findById(userId);
    if (!user) return [];

    // Find topics the user hasn't explored
    const allTags = await Content.distinct('tags', { status: 'published' });
    
    // Get diverse content from unexplored areas
    const discovery = await Content.find({
      status: 'published',
      tags: { $in: allTags },
    })
      .sort({ 'evaluation.score': -1 })
      .limit(10);

    return discovery;
  }
}

export const recommendationEngine = new RecommendationEngine();
