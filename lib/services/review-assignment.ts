import connectMongo from '@/libs/mongoose';
import Content from '@/lib/db/models/Content';
import Reviewer from '@/lib/db/models/Reviewer';
import Review from '@/lib/db/models/Review';
import { inngest } from '@/lib/tasks/inngest';
import { logger } from '@/libs/monitoring/logger';

export async function assignReviewers(contentId: string, numReviewers: number = 2) {
  await connectMongo();

  const content = await Content.findById(contentId);
  if (!content) {
    throw new Error('Content not found');
  }

  // Find suitable reviewers
  const reviewers = await Reviewer.find({
    verificationStatus: 'verified',
    availability: true,
    expertise: { $in: content.tags },
  })
    .limit(numReviewers * 2) // Get extra in case some are unavailable
    .lean();

  if (reviewers.length === 0) {
    logger.warn('No reviewers available', { contentId });
    return [];
  }

  // Check reviewer workload
  const currentMonth = new Date();
  currentMonth.setDate(1);

  const assignedReviewers = [];

  for (const reviewer of reviewers) {
    if (assignedReviewers.length >= numReviewers) break;

    // Check current month's review count
    const reviewCount = await Review.countDocuments({
      reviewerId: reviewer.userId,
      createdAt: { $gte: currentMonth },
    });

    if (reviewCount < reviewer.maxReviewsPerMonth) {
      // Create review assignment
      const review = await Review.create({
        contentId,
        reviewerId: reviewer.userId,
        status: 'pending',
      });

      assignedReviewers.push(review);

      // Send notification
      await inngest.send({
        name: 'notification/review.assigned',
        data: {
          reviewId: review._id.toString(),
          reviewerId: reviewer.userId.toString(),
          contentId,
        },
      });
    }
  }

  // Update content status
  await Content.findByIdAndUpdate(contentId, {
    status: 'pending_review',
  });

  logger.info('Reviewers assigned', {
    contentId,
    reviewerCount: assignedReviewers.length,
  });

  return assignedReviewers;
}
