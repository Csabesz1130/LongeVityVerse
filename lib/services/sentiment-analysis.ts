import OpenAI from 'openai';
import Content from '@/lib/db/models/Content';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface SentimentResult {
  score: number; // -1 (negative) to 1 (positive)
  magnitude: number; // 0 to 1 (intensity)
  emotions: {
    optimism: number;
    concern: number;
    excitement: number;
    skepticism: number;
  };
  keyPhrases: string[];
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'Analyze the sentiment of longevity-related content. Return JSON only.',
      },
      {
        role: 'user',
        content: `Analyze sentiment: ${text.substring(0, 2000)}
        
Return JSON:
{
  "score": number (-1 to 1),
  "magnitude": number (0 to 1),
  "emotions": {
    "optimism": 0-100,
    "concern": 0-100,
    "excitement": 0-100,
    "skepticism": 0-100
  },
  "keyPhrases": ["phrase1", "phrase2"]
}`,
      },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content!);
}
