import { inngest } from "../inngest";
import OpenAI from "openai";
import { connectDB } from "@/lib/db/mongodb";
import HealthData from "@/lib/db/models/HealthData";
import User from "@/lib/db/models/User";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const insightsGenerationFunction = inngest.createFunction(
  { id: "insights-generation", name: "Generate Health Insights" },
  { event: "health/insights.generate" },
  async ({ event, step }) => {
    const { userId, period } = event.data;

    const endDate = new Date();
    const startDate = new Date();
    switch (period) {
      case "daily":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "weekly":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }

    const healthData = await step.run("fetch-health-data", async () => {
      await connectDB();
      return await HealthData.find({
        userId,
        timestamp: { $gte: startDate, $lte: endDate },
      })
        .sort({ timestamp: 1 })
        .lean();
    });

    if ((healthData as any[]).length === 0) {
      return { insights: "No data available for this period" };
    }

    const insights = await step.run("generate-ai-insights", async () => {
      const dataByType = (healthData as any[]).reduce((acc: any, item: any) => {
        if (!acc[item.dataType]) acc[item.dataType] = [];
        acc[item.dataType].push({ value: item.value, unit: item.unit, timestamp: item.timestamp });
        return acc;
      }, {});

      const prompt = `Analyze this health data and provide actionable insights for longevity:\n\n${JSON.stringify(
        dataByType,
        null,
        2
      )}\n\nFocus on:\n1. Trends and patterns\n2. Areas of concern\n3. Positive achievements\n4. Recommendations for improvement\n5. Longevity implications\n\nKeep it concise and actionable.`;

      const response = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "You are a longevity health coach analyzing user health data." },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
      return response.choices[0].message.content;
    });

    await step.run("cache-insights", async () => {
      await connectDB();
      await User.findByIdAndUpdate(userId, {
        $set: {
          [`insights.${period}`]: { content: insights, generatedAt: new Date(), dataPoints: (healthData as any[]).length },
        },
      });
    });

    return { insights, dataPoints: (healthData as any[]).length };
  }
);


