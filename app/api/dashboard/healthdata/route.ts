import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectToDatabase from "@/libs/mongoose";
import User from '@/models/User';

// Validation function for health data
function validateHealthData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate numeric ranges
  if (data.steps !== undefined && (data.steps < 0 || data.steps > 100000)) {
    errors.push("Steps must be between 0 and 100,000");
  }

  if (data.heartRate !== undefined && (data.heartRate < 30 || data.heartRate > 220)) {
    errors.push("Heart rate must be between 30 and 220 bpm");
  }

  if (data.sleepHours !== undefined && (data.sleepHours < 0 || data.sleepHours > 24)) {
    errors.push("Sleep hours must be between 0 and 24");
  }

  if (data.weight !== undefined && (data.weight < 20 || data.weight > 500)) {
    errors.push("Weight must be between 20 and 500 kg");
  }

  if (data.height !== undefined && (data.height < 50 || data.height > 300)) {
    errors.push("Height must be between 50 and 300 cm");
  }

  if (data.bloodPressure !== undefined) {
    if (data.bloodPressure.systolic < 70 || data.bloodPressure.systolic > 200) {
      errors.push("Systolic blood pressure must be between 70 and 200 mmHg");
    }
    if (data.bloodPressure.diastolic < 40 || data.bloodPressure.diastolic > 130) {
      errors.push("Diastolic blood pressure must be between 40 and 130 mmHg");
    }
  }

  if (data.bloodGlucose !== undefined && (data.bloodGlucose < 20 || data.bloodGlucose > 600)) {
    errors.push("Blood glucose must be between 20 and 600 mg/dL");
  }

  if (data.bodyFatPercentage !== undefined && (data.bodyFatPercentage < 2 || data.bodyFatPercentage > 50)) {
    errors.push("Body fat percentage must be between 2% and 50%");
  }

  if (data.hydrationLevel !== undefined && (data.hydrationLevel < 0 || data.hydrationLevel > 100)) {
    errors.push("Hydration level must be between 0% and 100%");
  }

  if (data.stressLevel !== undefined && (data.stressLevel < 0 || data.stressLevel > 10)) {
    errors.push("Stress level must be between 0 and 10");
  }

  if (data.energyLevel !== undefined && (data.energyLevel < 0 || data.energyLevel > 10)) {
    errors.push("Energy level must be between 0 and 10");
  }

  if (data.temperature !== undefined && (data.temperature < 35 || data.temperature > 42)) {
    errors.push("Temperature must be between 35°C and 42°C");
  }

  if (data.oxygenSaturation !== undefined && (data.oxygenSaturation < 70 || data.oxygenSaturation > 100)) {
    errors.push("Oxygen saturation must be between 70% and 100%");
  }

  if (data.respiratoryRate !== undefined && (data.respiratoryRate < 8 || data.respiratoryRate > 40)) {
    errors.push("Respiratory rate must be between 8 and 40 breaths per minute");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Function to generate health insights based on data
function generateHealthInsights(healthData: any, healthKit: any): any[] {
  const insights = [];

  // BMI insights
  if (healthData.bmi) {
    if (healthData.bmi < 18.5) {
      insights.push({
        type: 'recommendation',
        title: 'Low BMI Alert',
        description: 'Your BMI is below the healthy range. Consider consulting with a nutritionist.',
        severity: 'medium'
      });
    } else if (healthData.bmi > 25) {
      insights.push({
        type: 'recommendation',
        title: 'BMI Management',
        description: 'Your BMI is above the healthy range. Focus on balanced nutrition and regular exercise.',
        severity: 'medium'
      });
    }
  }

  // Blood pressure insights
  if (healthData.bloodPressure) {
    const { systolic, diastolic } = healthData.bloodPressure;
    if (systolic >= 140 || diastolic >= 90) {
      insights.push({
        type: 'alert',
        title: 'High Blood Pressure',
        description: 'Your blood pressure is elevated. Consider lifestyle changes and consult your doctor.',
        severity: 'high'
      });
    }
  }

  // Heart rate insights
  if (healthKit?.heartRate) {
    if (healthKit.heartRate > 100) {
      insights.push({
        type: 'recommendation',
        title: 'Elevated Heart Rate',
        description: 'Your resting heart rate is above normal. Consider stress management and cardiovascular exercise.',
        severity: 'medium'
      });
    }
  }

  // Sleep insights
  if (healthKit?.sleepHours) {
    if (healthKit.sleepHours < 7) {
      insights.push({
        type: 'recommendation',
        title: 'Insufficient Sleep',
        description: 'You\'re getting less than the recommended 7-9 hours of sleep. Prioritize sleep hygiene.',
        severity: 'medium'
      });
    }
  }

  // Activity insights
  if (healthKit?.steps) {
    if (healthKit.steps < 5000) {
      insights.push({
        type: 'recommendation',
        title: 'Low Activity Level',
        description: 'Try to increase your daily steps to at least 7,500 for better health.',
        severity: 'low'
      });
    } else if (healthKit.steps >= 10000) {
      insights.push({
        type: 'achievement',
        title: 'Step Goal Achieved!',
        description: 'Great job reaching 10,000 steps today!',
        severity: 'low'
      });
    }
  }

  // Hydration insights
  if (healthData.hydrationLevel !== undefined) {
    if (healthData.hydrationLevel < 60) {
      insights.push({
        type: 'recommendation',
        title: 'Hydration Reminder',
        description: 'Your hydration level is low. Aim to drink 8-10 glasses of water daily.',
        severity: 'low'
      });
    }
  }

  return insights;
}

export async function POST(req: Request) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const healthData = await req.json();

    // Validate the health data
    const validation = validateHealthData(healthData);
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Invalid health data',
        details: validation.errors
      }, { status: 400 });
    }

    // Check if we have any data to update
    if (Object.keys(healthData).length === 0) {
      return NextResponse.json({ error: 'No health data provided' }, { status: 400 });
    }

    // Calculate BMI if weight and height are provided
    if (healthData.weight && healthData.height) {
      const heightInMeters = healthData.height / 100;
      healthData.bmi = parseFloat((healthData.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    // Prepare update object
    const updateData: any = {};

    // Update healthKit data (basic metrics)
    if (healthData.steps !== undefined) updateData['healthKit.steps'] = healthData.steps;
    if (healthData.heartRate !== undefined) updateData['healthKit.heartRate'] = healthData.heartRate;
    if (healthData.sleepHours !== undefined) updateData['healthKit.sleepHours'] = healthData.sleepHours;

    // Update comprehensive health data
    Object.keys(healthData).forEach(key => {
      if (key !== 'steps' && key !== 'heartRate' && key !== 'sleepHours') {
        updateData[`healthData.${key}`] = healthData[key];
      }
    });

    // Add historical data entry
    const historicalEntry = {
      date: new Date(),
      metrics: {
        steps: healthData.steps,
        heartRate: healthData.heartRate,
        sleepHours: healthData.sleepHours,
        weight: healthData.weight,
        bmi: healthData.bmi,
        bloodPressure: healthData.bloodPressure,
        bloodGlucose: healthData.bloodGlucose,
        bodyFatPercentage: healthData.bodyFatPercentage,
        hydrationLevel: healthData.hydrationLevel,
        stressLevel: healthData.stressLevel,
        energyLevel: healthData.energyLevel,
        mood: healthData.mood,
        temperature: healthData.temperature,
        oxygenSaturation: healthData.oxygenSaturation,
        respiratoryRate: healthData.respiratoryRate,
      }
    };

    // Remove undefined values from historical entry
    Object.keys(historicalEntry.metrics).forEach(key => {
      if (historicalEntry.metrics[key] === undefined) {
        delete historicalEntry.metrics[key];
      }
    });

    // Only add historical entry if we have meaningful data
    if (Object.keys(historicalEntry.metrics).length > 0) {
      updateData['$push'] = { 'healthData.historicalData': historicalEntry };
    }

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate insights based on the updated data
    const insights = generateHealthInsights(healthData, user.healthKit);

    // Add new insights to the user's insights array
    if (insights.length > 0) {
      await User.updateOne(
        { email: session.user.email },
        { $push: { 'healthData.insights': { $each: insights } } }
      );
    }

    return NextResponse.json({
      message: 'Health data updated successfully',
      insights: insights.length > 0 ? insights : undefined
    });
  } catch (error: any) {
    console.error('Error updating health data:', error);

    if (error.name === 'ValidationError') {
      return NextResponse.json({
        error: 'Validation error',
        details: Object.values(error.errors).map((e: any) => e.message)
      }, { status: 400 });
    }

    if (error.code === 11000) {
      return NextResponse.json({ error: 'Duplicate data entry' }, { status: 409 });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

    // Return comprehensive health data
    const healthData = {
      healthKit: user.healthKit || {},
      healthData: user.healthData || {},
      calculatedBMI: user.calculatedBMI,
      healthScore: user.healthScore,
      lastUpdated: user.updatedAt
    };

    return NextResponse.json(healthData);
  } catch (error) {
    console.error('Error fetching health data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}