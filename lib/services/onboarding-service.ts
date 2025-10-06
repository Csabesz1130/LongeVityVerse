import connectMongo from '@/libs/mongoose';
import OnboardingProgress from '@/lib/db/models/OnboardingProgress';
import { recommendationEngine } from './recommendation-engine';

export async function getPersonalizedOnboarding(userId: string) {
  await connectMongo();
  
  let progress = await OnboardingProgress.findOne({ userId });
  
  if (!progress) {
    progress = await OnboardingProgress.create({ userId });
  }

  // Generate personalized content based on their answers
  const nextSteps = [];

  if (!progress.steps.healthGoals) {
    nextSteps.push({
      step: 'healthGoals',
      title: 'Set Your Health Goals',
      description: 'Tell us what you want to achieve',
      action: '/onboarding/goals',
    });
  }

  if (!progress.steps.integrations && progress.steps.healthGoals) {
    nextSteps.push({
      step: 'integrations',
      title: 'Connect Your Health Data',
      description: 'Sync with Apple Health, Google Fit, or Fitbit',
      action: '/onboarding/integrations',
    });
  }

  if (!progress.steps.firstContent && progress.steps.healthGoals) {
    // Recommend content based on their goals
    const recommended = await recommendationEngine.getPersonalizedRecommendations(
      userId,
      3
    );

    nextSteps.push({
      step: 'firstContent',
      title: 'Explore Recommended Content',
      description: 'Based on your interests',
      content: recommended,
    });
  }

  return {
    progress,
    nextSteps,
    completionPercentage: calculateCompletion(progress),
  };
}

function calculateCompletion(progress: any): number {
  const steps = Object.values(progress.steps);
  const completed = steps.filter(Boolean).length;
  return Math.round((completed / steps.length) * 100);
}
