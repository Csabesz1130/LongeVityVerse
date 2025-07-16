import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectToDatabase from "@/libs/mongoose";
import User from '@/models/User';

// Function to generate comprehensive health insights
function generateComprehensiveInsights(user: any): any {
    const insights = {
        recommendations: [],
        alerts: [],
        achievements: [],
        trends: {},
        healthScore: user.healthScore || 0,
        nextSteps: []
    };

    const { healthKit, healthData } = user;

    // BMI Analysis
    if (healthData?.bmi) {
        if (healthData.bmi < 18.5) {
            insights.recommendations.push({
                title: 'Weight Management',
                description: 'Your BMI indicates you may be underweight. Consider consulting with a nutritionist for a balanced diet plan.',
                priority: 'medium',
                category: 'nutrition'
            });
        } else if (healthData.bmi > 25) {
            insights.recommendations.push({
                title: 'Healthy Weight Goals',
                description: 'Focus on balanced nutrition and regular exercise to achieve a healthy BMI range.',
                priority: 'medium',
                category: 'fitness'
            });
        }
    }

    // Blood Pressure Analysis
    if (healthData?.bloodPressure) {
        const { systolic, diastolic } = healthData.bloodPressure;
        if (systolic >= 140 || diastolic >= 90) {
            insights.alerts.push({
                title: 'Blood Pressure Alert',
                description: 'Your blood pressure is elevated. Consider lifestyle changes and consult your healthcare provider.',
                severity: 'high',
                category: 'cardiovascular'
            });
        } else if (systolic >= 130 || diastolic >= 85) {
            insights.recommendations.push({
                title: 'Blood Pressure Monitoring',
                description: 'Your blood pressure is in the elevated range. Monitor regularly and consider stress management.',
                priority: 'medium',
                category: 'wellness'
            });
        }
    }

    // Heart Rate Analysis
    if (healthKit?.heartRate) {
        if (healthKit.heartRate > 100) {
            insights.recommendations.push({
                title: 'Heart Rate Management',
                description: 'Your resting heart rate is elevated. Consider cardiovascular exercise and stress reduction.',
                priority: 'medium',
                category: 'cardiovascular'
            });
        } else if (healthKit.heartRate < 60) {
            insights.recommendations.push({
                title: 'Low Heart Rate',
                description: 'Your heart rate is below normal. This could be normal for athletes, but consult a doctor if concerned.',
                priority: 'low',
                category: 'cardiovascular'
            });
        }
    }

    // Sleep Analysis
    if (healthKit?.sleepHours) {
        if (healthKit.sleepHours < 7) {
            insights.recommendations.push({
                title: 'Sleep Optimization',
                description: 'Aim for 7-9 hours of quality sleep. Establish a consistent sleep schedule and bedtime routine.',
                priority: 'high',
                category: 'wellness'
            });
        } else if (healthKit.sleepHours >= 7 && healthKit.sleepHours <= 9) {
            insights.achievements.push({
                title: 'Optimal Sleep',
                description: 'Great job maintaining healthy sleep habits!',
                category: 'wellness'
            });
        }
    }

    // Activity Analysis
    if (healthKit?.steps) {
        if (healthKit.steps < 5000) {
            insights.recommendations.push({
                title: 'Increase Physical Activity',
                description: 'Try to reach at least 7,500 steps daily for better health outcomes.',
                priority: 'medium',
                category: 'fitness'
            });
        } else if (healthKit.steps >= 10000) {
            insights.achievements.push({
                title: 'Step Goal Achieved',
                description: 'Excellent! You\'ve reached the recommended daily step count.',
                category: 'fitness'
            });
        }
    }

    // Hydration Analysis
    if (healthData?.hydrationLevel !== undefined) {
        if (healthData.hydrationLevel < 60) {
            insights.recommendations.push({
                title: 'Hydration Boost',
                description: 'Increase your water intake to maintain proper hydration levels.',
                priority: 'low',
                category: 'nutrition'
            });
        }
    }

    // Stress Level Analysis
    if (healthData?.stressLevel !== undefined) {
        if (healthData.stressLevel > 7) {
            insights.recommendations.push({
                title: 'Stress Management',
                description: 'Your stress levels are high. Consider meditation, exercise, or professional support.',
                priority: 'high',
                category: 'wellness'
            });
        }
    }

    // Energy Level Analysis
    if (healthData?.energyLevel !== undefined) {
        if (healthData.energyLevel < 5) {
            insights.recommendations.push({
                title: 'Energy Boost',
                description: 'Low energy levels may indicate poor sleep, stress, or nutritional needs.',
                priority: 'medium',
                category: 'wellness'
            });
        }
    }

    // Blood Glucose Analysis
    if (healthData?.bloodGlucose) {
        if (healthData.bloodGlucose > 140) {
            insights.alerts.push({
                title: 'Blood Glucose Alert',
                description: 'Your blood glucose is elevated. Monitor your diet and consult a healthcare provider.',
                severity: 'medium',
                category: 'metabolic'
            });
        }
    }

    // Body Composition Analysis
    if (healthData?.bodyFatPercentage) {
        if (healthData.bodyFatPercentage > 25) {
            insights.recommendations.push({
                title: 'Body Composition Goals',
                description: 'Consider strength training and balanced nutrition to improve body composition.',
                priority: 'medium',
                category: 'fitness'
            });
        }
    }

    // Generate next steps based on current health status
    if (insights.alerts.length > 0) {
        insights.nextSteps.push('Address health alerts first');
    }
    if (insights.recommendations.filter(r => r.priority === 'high').length > 0) {
        insights.nextSteps.push('Focus on high-priority recommendations');
    }
    insights.nextSteps.push('Continue monitoring your health metrics');
    insights.nextSteps.push('Set specific, achievable health goals');

    // Calculate trend analysis (simplified for now)
    if (healthData?.historicalData && healthData.historicalData.length > 1) {
        const recent = healthData.historicalData.slice(-7); // Last 7 entries
        // const previous = healthData.historicalData.slice(-14, -7); // 7 entries before that - TODO: implement trend comparison

        insights.trends = {
            steps: recent.length > 0 ? 'stable' : 'insufficient_data',
            heartRate: recent.length > 0 ? 'stable' : 'insufficient_data',
            sleepHours: recent.length > 0 ? 'stable' : 'insufficient_data',
            weight: recent.length > 0 ? 'stable' : 'insufficient_data'
        };
    }

    return insights;
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

        // Generate comprehensive insights
        const insights = generateComprehensiveInsights(user);

        // Get unread insights from the database
        const unreadInsights = user.healthData?.insights?.filter((insight: any) => !insight.isRead) || [];

        return NextResponse.json({
            insights,
            unreadInsights,
            lastUpdated: user.updatedAt
        });
    } catch (error) {
        console.error('Error generating health insights:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await connectToDatabase();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { insightId, action } = await req.json();

        if (action === 'mark_read') {
            await User.updateOne(
                {
                    email: session.user.email,
                    'healthData.insights._id': insightId
                },
                {
                    $set: { 'healthData.insights.$.isRead': true }
                }
            );

            return NextResponse.json({ message: 'Insight marked as read' });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating insight:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 