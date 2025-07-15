import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    image: {
      type: String,
    },
    // Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
    customerId: {
      type: String,
      validate(value: string) {
        return value.includes("cus_");
      },
    },
    // Used in the Stripe webhook. should match a plan in config.js file.
    priceId: {
      type: String,
      validate(value: string) {
        return value.includes("price_");
      },
    },
    // Used to determine if the user has access to the product—it's turn on/off by the Stripe webhook
    hasAccess: {
      type: Boolean,
      default: false,
    },
    // Basic health data from HealthKit
    healthKit: {
      steps: Number,
      heartRate: Number,
      sleepHours: Number,
    },
    // Comprehensive health data
    healthData: {
      // Basic metrics
      weight: { type: Number, min: 20, max: 500 },
      height: { type: Number, min: 50, max: 300 },
      bmi: { type: Number, min: 10, max: 60 },

      // Cardiovascular health
      bloodPressure: {
        systolic: { type: Number, min: 70, max: 200 },
        diastolic: { type: Number, min: 40, max: 130 },
      },
      bloodGlucose: { type: Number, min: 20, max: 600 },

      // Body composition
      bodyFatPercentage: { type: Number, min: 2, max: 50 },
      muscleMass: { type: Number, min: 10, max: 200 },
      bodyComposition: {
        fatMass: { type: Number, min: 0, max: 200 },
        leanMass: { type: Number, min: 0, max: 200 },
        boneMass: { type: Number, min: 0, max: 50 },
      },

      // Vital signs
      temperature: { type: Number, min: 35, max: 42 },
      oxygenSaturation: { type: Number, min: 70, max: 100 },
      respiratoryRate: { type: Number, min: 8, max: 40 },

      // Wellness metrics
      hydrationLevel: { type: Number, min: 0, max: 100 },
      stressLevel: { type: Number, min: 0, max: 10 },
      energyLevel: { type: Number, min: 0, max: 10 },
      mood: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor'],
      },

      // Activity and lifestyle
      activityLevel: {
        type: String,
        enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'],
      },

      // Nutrition data
      nutritionData: {
        caloriesConsumed: { type: Number, min: 0, max: 10000 },
        protein: { type: Number, min: 0, max: 500 },
        carbs: { type: Number, min: 0, max: 1000 },
        fat: { type: Number, min: 0, max: 300 },
        fiber: { type: Number, min: 0, max: 100 },
        waterIntake: { type: Number, min: 0, max: 10 }, // in liters
      },

      // Enhanced sleep data
      sleepQuality: {
        type: String,
        enum: ['poor', 'fair', 'good', 'excellent'],
      },
      sleepData: {
        deepSleepHours: { type: Number, min: 0, max: 8 },
        lightSleepHours: { type: Number, min: 0, max: 8 },
        remSleepHours: { type: Number, min: 0, max: 8 },
        awakeTime: { type: Number, min: 0, max: 4 },
        sleepEfficiency: { type: Number, min: 0, max: 100 },
      },

      // Historical data tracking
      historicalData: [{
        date: { type: Date, default: Date.now },
        metrics: {
          steps: Number,
          heartRate: Number,
          sleepHours: Number,
          weight: Number,
          bmi: Number,
          bloodPressure: {
            systolic: Number,
            diastolic: Number,
          },
          bloodGlucose: Number,
          bodyFatPercentage: Number,
          hydrationLevel: Number,
          stressLevel: Number,
          energyLevel: Number,
          mood: String,
          temperature: Number,
          oxygenSaturation: Number,
          respiratoryRate: Number,
        },
      }],

      // Goals and targets
      goals: [{
        metric: String,
        targetValue: Number,
        currentValue: Number,
        deadline: Date,
        isActive: { type: Boolean, default: true },
        createdAt: { type: Date, default: Date.now },
      }],

      // Health insights and recommendations
      insights: [{
        type: { type: String, enum: ['recommendation', 'alert', 'achievement'] },
        title: String,
        description: String,
        severity: { type: String, enum: ['low', 'medium', 'high'] },
        createdAt: { type: Date, default: Date.now },
        isRead: { type: Boolean, default: false },
      }],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Virtual for calculating BMI
userSchema.virtual('calculatedBMI').get(function () {
  if (this.healthData?.weight && this.healthData?.height) {
    const heightInMeters = this.healthData.height / 100;
    return (this.healthData.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

// Virtual for health score calculation
userSchema.virtual('healthScore').get(function () {
  let score = 0;
  let factors = 0;

  // Basic health factors
  if (this.healthData?.bmi) {
    const bmi = this.healthData.bmi;
    if (bmi >= 18.5 && bmi <= 24.9) score += 20;
    else if (bmi >= 17 && bmi <= 29.9) score += 15;
    else if (bmi >= 16 && bmi <= 34.9) score += 10;
    factors++;
  }

  if (this.healthData?.bloodPressure) {
    const { systolic, diastolic } = this.healthData.bloodPressure;
    if (systolic < 120 && diastolic < 80) score += 20;
    else if (systolic < 130 && diastolic < 85) score += 15;
    else if (systolic < 140 && diastolic < 90) score += 10;
    factors++;
  }

  if (this.healthKit?.heartRate) {
    const hr = this.healthKit.heartRate;
    if (hr >= 60 && hr <= 100) score += 15;
    else if (hr >= 50 && hr <= 110) score += 10;
    factors++;
  }

  if (this.healthKit?.sleepHours) {
    const sleep = this.healthKit.sleepHours;
    if (sleep >= 7 && sleep <= 9) score += 15;
    else if (sleep >= 6 && sleep <= 10) score += 10;
    factors++;
  }

  if (this.healthKit?.steps) {
    const steps = this.healthKit.steps;
    if (steps >= 10000) score += 15;
    else if (steps >= 7500) score += 10;
    else if (steps >= 5000) score += 5;
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 0;
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
