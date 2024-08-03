import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import OpenAI from 'openai';
import { rateLimit } from '@/libs/rateLimit';
import { getCachedPlan, cachePlan } from '@/libs/planCache';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await limiter.check(10, 'CACHE_TOKEN');
  } catch {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { emailContent, healthMetrics } = await req.json();

  const cacheKey = `${emailContent}-${JSON.stringify(healthMetrics)}`;

  const cachedPlan = await getCachedPlan(cacheKey);
  if (cachedPlan) {
    return NextResponse.json({ plan: cachedPlan });
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a knowledgeable assistant that generates personalized longevity plans based on email content and health metrics. Include various sport techniques and movements that promote longevity and overall health." },
        { role: "user", content: `Based on the following email content and health metrics, generate a personalized longevity plan that includes specific sport techniques and movements:

Email content: ${emailContent}

Health metrics:
${Object.entries(healthMetrics).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

Please provide a comprehensive longevity plan that includes:
1. Diet recommendations
2. Exercise routine with specific sport techniques and movements (e.g., HIIT, yoga, strength training, mobility exercises)
3. Stress management techniques
4. Sleep optimization strategies
5. Cognitive health exercises
6. Recommended health screenings and check-ups

Personalized longevity plan:` }
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    const plan = response.choices[0].message.content?.trim();

    if (plan) {
      await cachePlan(cacheKey, plan);
    }

    return NextResponse.json({ plan });
  } catch (error) {
    console.error('Error generating plan:', error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}