import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ContentAnalysis {
  qualityScore: number;
  flags: string[];
  suggestions: string[];
  factChecks: {
    claim: string;
    verification: 'verified' | 'unverified' | 'questionable';
    source?: string;
  }[];
  readabilityScore: number;
  citationQuality: number;
}

export async function analyzeContentWithAI(
  title: string,
  body: string,
  citations: string[]
): Promise<ContentAnalysis> {
  const prompt = `Analyze this longevity-related content for scientific accuracy and quality:

Title: ${title}

Content: ${body.substring(0, 3000)}

Citations: ${citations.join(', ')}

Evaluate:
1. Scientific accuracy (0-100)
2. Quality of evidence cited (0-100)
3. Readability for general audience (0-100)
4. Potential red flags or misleading claims
5. Suggestions for improvement

Return as JSON: {
  "qualityScore": number,
  "flags": string[],
  "suggestions": string[],
  "factChecks": [{"claim": string, "verification": "verified"|"unverified"|"questionable", "source"?: string}],
  "readabilityScore": number,
  "citationQuality": number
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a scientific content reviewer specializing in longevity research. Provide objective, evidence-based analysis.',
      },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  return JSON.parse(response.choices[0].message.content!);
}
