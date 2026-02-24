import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectToDatabase from "@/libs/mongoose";
import User from '@/models/User';

interface AnalysisCategory {
  title: string;
  score: number;
  status: 'optimal' | 'good' | 'needs_attention' | 'critical';
  summary: string;
  recommendations: string[];
}

function calculateLongevityAnalysis(user: any) {
  const { healthKit, healthData } = user;
  const categories: AnalysisCategory[] = [];
  let overallScore = 0;
  let categoryCount = 0;

  // Cardiovascular Health
  const cardioScore = analyzeCardiovascular(healthKit, healthData);
  categories.push(cardioScore);
  overallScore += cardioScore.score;
  categoryCount++;

  // Sleep Quality
  const sleepScore = analyzeSleep(healthKit, healthData);
  categories.push(sleepScore);
  overallScore += sleepScore.score;
  categoryCount++;

  // Physical Activity
  const activityScore = analyzeActivity(healthKit, healthData);
  categories.push(activityScore);
  overallScore += activityScore.score;
  categoryCount++;

  // Body Composition
  const bodyScore = analyzeBodyComposition(healthData);
  categories.push(bodyScore);
  overallScore += bodyScore.score;
  categoryCount++;

  // Metabolic Health
  const metabolicScore = analyzeMetabolicHealth(healthData);
  categories.push(metabolicScore);
  overallScore += metabolicScore.score;
  categoryCount++;

  // Mental Wellness
  const mentalScore = analyzeMentalWellness(healthData);
  categories.push(mentalScore);
  overallScore += mentalScore.score;
  categoryCount++;

  const finalScore = categoryCount > 0 ? Math.round(overallScore / categoryCount) : 50;

  const projectedLifespan = calculateProjectedLifespan(finalScore);
  const biologicalAgeOffset = calculateBioAgeOffset(finalScore);

  const riskFactors = identifyRiskFactors(healthKit, healthData);
  const longevityBoosters = identifyLongevityBoosters(healthKit, healthData);

  return {
    overallScore: finalScore,
    categories,
    projectedLifespan,
    biologicalAgeOffset,
    riskFactors,
    longevityBoosters,
    analysisDate: new Date().toISOString(),
    keyInsight: generateKeyInsight(finalScore, categories),
  };
}

function analyzeCardiovascular(healthKit: any, healthData: any): AnalysisCategory {
  let score = 70;
  const recommendations: string[] = [];

  if (healthKit?.heartRate) {
    if (healthKit.heartRate >= 60 && healthKit.heartRate <= 80) {
      score += 15;
    } else if (healthKit.heartRate < 60) {
      score += 10;
      recommendations.push('Your low resting heart rate suggests good cardiovascular fitness.');
    } else {
      score -= 10;
      recommendations.push('Consider regular cardio exercise to lower your resting heart rate.');
    }
  } else {
    recommendations.push('Track your heart rate regularly for better cardiovascular insights.');
  }

  if (healthData?.bloodPressure) {
    const { systolic, diastolic } = healthData.bloodPressure;
    if (systolic < 120 && diastolic < 80) {
      score += 15;
    } else if (systolic < 140 && diastolic < 90) {
      score += 5;
      recommendations.push('Monitor blood pressure — slightly elevated readings detected.');
    } else {
      score -= 15;
      recommendations.push('Consult a healthcare provider about your blood pressure levels.');
    }
  } else {
    recommendations.push('Regular blood pressure monitoring is recommended.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain your current cardiovascular health routine.');
  }

  score = Math.max(0, Math.min(100, score));
  return {
    title: 'Cardiovascular Health',
    score,
    status: score >= 80 ? 'optimal' : score >= 60 ? 'good' : score >= 40 ? 'needs_attention' : 'critical',
    summary: score >= 70
      ? 'Your cardiovascular markers are looking healthy.'
      : 'There are opportunities to improve your heart health.',
    recommendations,
  };
}

function analyzeSleep(healthKit: any, healthData: any): AnalysisCategory {
  let score = 60;
  const recommendations: string[] = [];

  if (healthKit?.sleepHours) {
    if (healthKit.sleepHours >= 7 && healthKit.sleepHours <= 9) {
      score += 30;
    } else if (healthKit.sleepHours >= 6 && healthKit.sleepHours < 7) {
      score += 15;
      recommendations.push('Try to get at least 7 hours of sleep for optimal recovery.');
    } else if (healthKit.sleepHours > 9) {
      score += 10;
      recommendations.push('Excessive sleep may indicate underlying health issues.');
    } else {
      score -= 10;
      recommendations.push('Sleep deprivation significantly impacts longevity — prioritize rest.');
    }
  } else {
    recommendations.push('Start tracking your sleep to unlock personalized insights.');
  }

  if (healthData?.sleepQuality) {
    if (healthData.sleepQuality > 80) score += 10;
    else if (healthData.sleepQuality < 50) {
      score -= 5;
      recommendations.push('Focus on sleep hygiene: dark room, cool temperature, consistent schedule.');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Your sleep patterns support healthy longevity.');
  }

  score = Math.max(0, Math.min(100, score));
  return {
    title: 'Sleep Quality',
    score,
    status: score >= 80 ? 'optimal' : score >= 60 ? 'good' : score >= 40 ? 'needs_attention' : 'critical',
    summary: score >= 70
      ? 'Your sleep habits are supporting your longevity goals.'
      : 'Improving sleep quality could significantly impact your healthspan.',
    recommendations,
  };
}

function analyzeActivity(healthKit: any, _healthData: any): AnalysisCategory {
  let score = 50;
  const recommendations: string[] = [];

  if (healthKit?.steps) {
    if (healthKit.steps >= 10000) {
      score += 35;
    } else if (healthKit.steps >= 7500) {
      score += 25;
      recommendations.push('You\'re close to the optimal 10,000 steps daily target.');
    } else if (healthKit.steps >= 5000) {
      score += 15;
      recommendations.push('Gradually increase daily steps — aim for 7,500+ for longevity benefits.');
    } else {
      recommendations.push('Sedentary behavior is a major risk factor. Aim for at least 5,000 steps daily.');
    }
  } else {
    recommendations.push('Start tracking daily steps to monitor your activity level.');
  }

  recommendations.push('Include both aerobic exercise and strength training for optimal longevity.');

  score = Math.max(0, Math.min(100, score));
  return {
    title: 'Physical Activity',
    score,
    status: score >= 80 ? 'optimal' : score >= 60 ? 'good' : score >= 40 ? 'needs_attention' : 'critical',
    summary: score >= 70
      ? 'Your activity level supports a long, healthy life.'
      : 'Increasing physical activity is one of the most impactful longevity interventions.',
    recommendations,
  };
}

function analyzeBodyComposition(healthData: any): AnalysisCategory {
  let score = 65;
  const recommendations: string[] = [];

  if (healthData?.bmi) {
    if (healthData.bmi >= 18.5 && healthData.bmi <= 24.9) {
      score += 25;
    } else if (healthData.bmi >= 25 && healthData.bmi <= 29.9) {
      score += 5;
      recommendations.push('A BMI in the overweight range may increase health risks over time.');
    } else if (healthData.bmi < 18.5) {
      score += 5;
      recommendations.push('Being underweight may impact immune function and bone health.');
    } else {
      score -= 10;
      recommendations.push('Work with a healthcare provider on a sustainable weight management plan.');
    }
  } else {
    recommendations.push('Track your weight and height to calculate BMI for body composition insights.');
  }

  if (healthData?.bodyFatPercentage) {
    if (healthData.bodyFatPercentage >= 10 && healthData.bodyFatPercentage <= 20) {
      score += 10;
    } else if (healthData.bodyFatPercentage > 25) {
      score -= 5;
      recommendations.push('Reducing body fat through exercise and nutrition can improve longevity markers.');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Your body composition is within a healthy range.');
  }

  score = Math.max(0, Math.min(100, score));
  return {
    title: 'Body Composition',
    score,
    status: score >= 80 ? 'optimal' : score >= 60 ? 'good' : score >= 40 ? 'needs_attention' : 'critical',
    summary: score >= 70
      ? 'Your body composition supports healthy aging.'
      : 'Optimizing body composition can reduce disease risk and extend healthspan.',
    recommendations,
  };
}

function analyzeMetabolicHealth(healthData: any): AnalysisCategory {
  let score = 65;
  const recommendations: string[] = [];

  if (healthData?.bloodGlucose) {
    if (healthData.bloodGlucose < 100) {
      score += 20;
    } else if (healthData.bloodGlucose < 126) {
      score += 5;
      recommendations.push('Pre-diabetic glucose levels detected. Focus on diet and exercise.');
    } else {
      score -= 15;
      recommendations.push('Elevated blood glucose requires medical attention.');
    }
  } else {
    recommendations.push('Regular blood glucose testing helps detect metabolic issues early.');
  }

  if (healthData?.hydrationLevel !== undefined) {
    if (healthData.hydrationLevel >= 70) {
      score += 10;
    } else {
      recommendations.push('Proper hydration supports metabolic function and cellular health.');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Your metabolic markers are within healthy ranges.');
  }

  score = Math.max(0, Math.min(100, score));
  return {
    title: 'Metabolic Health',
    score,
    status: score >= 80 ? 'optimal' : score >= 60 ? 'good' : score >= 40 ? 'needs_attention' : 'critical',
    summary: score >= 70
      ? 'Your metabolic health indicators are encouraging.'
      : 'Metabolic health is foundational to longevity — address the recommendations below.',
    recommendations,
  };
}

function analyzeMentalWellness(healthData: any): AnalysisCategory {
  let score = 65;
  const recommendations: string[] = [];

  if (healthData?.stressLevel !== undefined) {
    if (healthData.stressLevel <= 3) {
      score += 25;
    } else if (healthData.stressLevel <= 6) {
      score += 10;
      recommendations.push('Moderate stress — consider mindfulness or meditation practices.');
    } else {
      score -= 10;
      recommendations.push('High chronic stress accelerates aging. Prioritize stress management.');
    }
  } else {
    recommendations.push('Track your stress levels to understand their impact on your health.');
  }

  if (healthData?.energyLevel !== undefined) {
    if (healthData.energyLevel >= 7) {
      score += 10;
    } else if (healthData.energyLevel < 4) {
      score -= 5;
      recommendations.push('Low energy may signal sleep issues, nutritional deficiencies, or stress.');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Continue practices that support your mental well-being.');
  }

  score = Math.max(0, Math.min(100, score));
  return {
    title: 'Mental Wellness',
    score,
    status: score >= 80 ? 'optimal' : score >= 60 ? 'good' : score >= 40 ? 'needs_attention' : 'critical',
    summary: score >= 70
      ? 'Your mental wellness supports healthy longevity.'
      : 'Mental health is a key pillar of longevity — consider the recommendations below.',
    recommendations,
  };
}

function calculateProjectedLifespan(score: number): { years: number; comparison: string } {
  const baseLifespan = 78;
  const bonus = Math.round((score - 50) * 0.2);
  const projected = baseLifespan + bonus;
  return {
    years: projected,
    comparison: bonus >= 0
      ? `+${bonus} years above average`
      : `${bonus} years below average`,
  };
}

function calculateBioAgeOffset(score: number): number {
  return Math.round((50 - score) * 0.15);
}

function identifyRiskFactors(healthKit: any, healthData: any): string[] {
  const risks: string[] = [];
  if (healthKit?.sleepHours && healthKit.sleepHours < 6) risks.push('Chronic sleep deprivation');
  if (healthKit?.heartRate && healthKit.heartRate > 100) risks.push('Elevated resting heart rate');
  if (healthKit?.steps && healthKit.steps < 3000) risks.push('Sedentary lifestyle');
  if (healthData?.bmi && healthData.bmi > 30) risks.push('Obesity');
  if (healthData?.bloodGlucose && healthData.bloodGlucose > 126) risks.push('Elevated blood glucose');
  if (healthData?.stressLevel && healthData.stressLevel > 7) risks.push('Chronic high stress');
  if (healthData?.bloodPressure?.systolic >= 140) risks.push('Hypertension');
  if (risks.length === 0) risks.push('No major risk factors identified');
  return risks;
}

function identifyLongevityBoosters(healthKit: any, healthData: any): string[] {
  const boosters: string[] = [];
  if (healthKit?.sleepHours && healthKit.sleepHours >= 7 && healthKit.sleepHours <= 9) boosters.push('Optimal sleep duration');
  if (healthKit?.heartRate && healthKit.heartRate >= 50 && healthKit.heartRate <= 70) boosters.push('Strong cardiovascular fitness');
  if (healthKit?.steps && healthKit.steps >= 10000) boosters.push('Active lifestyle');
  if (healthData?.bmi && healthData.bmi >= 18.5 && healthData.bmi <= 24.9) boosters.push('Healthy BMI');
  if (healthData?.stressLevel && healthData.stressLevel <= 3) boosters.push('Low stress levels');
  if (healthData?.hydrationLevel && healthData.hydrationLevel >= 80) boosters.push('Good hydration');
  if (boosters.length === 0) boosters.push('Start tracking health metrics to identify your strengths');
  return boosters;
}

function generateKeyInsight(score: number, categories: AnalysisCategory[]): string {
  const weakest = categories.reduce((min, cat) => cat.score < min.score ? cat : min, categories[0]);

  if (score >= 80) {
    return `Excellent health profile! Your strongest area is ${categories.reduce((max, cat) => cat.score > max.score ? cat : max, categories[0]).title.toLowerCase()}. Keep up the great work.`;
  } else if (score >= 60) {
    return `Good overall health. Focusing on ${weakest.title.toLowerCase()} could have the biggest impact on your longevity score.`;
  } else {
    return `There are significant opportunities to improve your healthspan. Prioritize ${weakest.title.toLowerCase()} for the greatest impact.`;
  }
}

export async function GET() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const analysis = calculateLongevityAnalysis(user);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('Error generating AI longevity analysis:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
