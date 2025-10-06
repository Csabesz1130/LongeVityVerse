import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/libs/next-auth';
import connectMongo from '@/libs/mongoose';
import Content from '@/lib/db/models/Content';
import Review from '@/lib/db/models/Review';
import Reviewer from '@/lib/db/models/Reviewer';
import { inngest } from '@/lib/tasks/inngest';
import { logger } from '@/libs/monitoring/logger';

export async function POST(
  request: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      criteria,
      comments,
      suggestions,
      status,
      requiresRevision,
    } = body;

    await connectMongo();

    // Verify reviewer
    const reviewer = await Reviewer.findOne({
      userId: session.user.id,
      verificationStatus: 'verified',
    });

    if (!reviewer) {
      return NextResponse.json(
        { error: 'Not authorized as reviewer' },
        { status: 403 }
      );
    }

    // Find existing review
    const review = await Review.findOne({
      contentId: params.contentId,
      reviewerId: session.user.id,
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review assignment not found' },
        { status: 404 }
      );
    }

    // Update review
    review.criteria = criteria;
    review.comments = comments;
    review.suggestions = suggestions;
    review.status = status;
    review.requiresRevision = requiresRevision;
    review.decisionDate = new Date();

    await review.save();

    // Check if all reviews are complete
    const allReviews = await Review.find({
      contentId: params.contentId,
    });

    const completedReviews = allReviews.filter(
      r => r.status !== 'pending'
    );

    // If all reviews complete, make final decision
    if (completedReviews.length === allReviews.length) {
      await processFinalDecision(params.contentId, allReviews);
    }

    // Update reviewer stats
    await updateReviewerStats(reviewer._id);

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error: any) {
    logger.error('Review submission error', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

async function processFinalDecision(contentId: string, reviews: any[]) {
  const avgScore = reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length;
  
  const approvedCount = reviews.filter(r => r.status === 'approved').length;
  const rejectedCount = reviews.filter(r => r.status === 'rejected').length;
  const revisionCount = reviews.filter(r => r.status === 'revision_requested').length;

  let finalStatus: string;
  
  if (approvedCount >= reviews.length / 2) {
    finalStatus = 'published';
  } else if (rejectedCount >= reviews.length / 2) {
    finalStatus = 'archived';
  } else {
    finalStatus = 'draft'; // Needs revision
  }

  await Content.findByIdAndUpdate(contentId, {
    status: finalStatus,
    'evaluation.score': avgScore,
    'evaluation.reviewedAt': new Date(),
    publishedAt: finalStatus === 'published' ? new Date() : undefined,
  });

  // Notify author
  const content = await Content.findById(contentId);
  await inngest.send({
    name: 'notification/review.complete',
    data: {
      contentId,
      authorId: content.author.toString(),
      finalStatus,
      avgScore,
    },
  });

  // If published, generate embeddings
  if (finalStatus === 'published') {
    await inngest.send({
      name: 'content/embedding.generate',
      data: {
        contentId,
        text: `${content.title}\n\n${content.description}\n\n${content.body}`,
      },
    });
  }
}

async function updateReviewerStats(reviewerId: string) {
  const reviews = await Review.find({ reviewerId });
  
  const stats = {
    totalReviews: reviews.length,
    approvedCount: reviews.filter(r => r.status === 'approved').length,
    rejectedCount: reviews.filter(r => r.status === 'rejected').length,
    averageScore: reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length,
  };

  await Reviewer.findByIdAndUpdate(reviewerId, {
    reviewStats: stats,
  });
}
