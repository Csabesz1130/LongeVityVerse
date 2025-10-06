import Content from '@/lib/db/models/Content';
import { generateEmbedding } from '@/lib/vector/embeddings';
import { upsertVector } from '@/lib/vector/pinecone';

const contentTemplates = [
  { title: 'The Science of Healthspan: Beyond Lifespan', category: 'research', tags: ['healthspan', 'aging', 'science'], body: 'Understanding healthspan - the period of life spent in good health - is crucial for longevity research...' },
  { title: 'Intermittent Fasting and Longevity: What the Research Says', category: 'guide', tags: ['fasting', 'nutrition', 'autophagy'], body: 'Intermittent fasting has gained attention for its potential longevity benefits...' },
  { title: 'Exercise Protocols for Optimal Longevity', category: 'guide', tags: ['exercise', 'fitness', 'training'], body: 'The right exercise protocol can significantly impact both lifespan and healthspan...' },
  { title: 'NAD+ Supplementation: Current Evidence', category: 'research', tags: ['supplements', 'NAD+', 'cellular health'], body: 'NAD+ (Nicotinamide Adenine Dinucleotide) plays a crucial role in cellular energy production...' },
  { title: 'Sleep Quality and Longevity: The Connection', category: 'blog', tags: ['sleep', 'recovery', 'health'], body: 'Quality sleep is one of the most important factors in longevity...' },
  { title: 'Longevity Biomarkers: What to Track', category: 'guide', tags: ['biomarkers', 'testing', 'metrics'], body: 'Tracking the right biomarkers can help optimize your longevity strategy...' },
  { title: 'The Role of Stress Management in Aging', category: 'blog', tags: ['stress', 'mental health', 'cortisol'], body: 'Chronic stress accelerates aging through multiple biological pathways...' },
  { title: 'Caloric Restriction Mimetics: A Deep Dive', category: 'research', tags: ['CR mimetics', 'metformin', 'rapamycin'], body: 'Caloric restriction mimetics offer potential benefits without severe dietary restriction...' },
  { title: 'Building a Longevity-Focused Diet Plan', category: 'guide', tags: ['nutrition', 'diet', 'meal planning'], body: 'A longevity-focused diet emphasizes nutrient density and metabolic health...' },
  { title: 'The Emerging Science of Senolytics', category: 'research', tags: ['senolytics', 'cellular aging', 'therapeutics'], body: 'Senolytic drugs target senescent cells to potentially reverse aspects of aging...' },
];

function generateLorem(words: number): string {
  const lorem = 'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat'.split(' ');
  let result = '';
  for (let i = 0; i < words; i++) { result += lorem[Math.floor(Math.random() * lorem.length)] + ' '; }
  return result.trim();
}

interface SeedOptions { clean?: boolean; minimal?: boolean; production?: boolean }

export async function seedContent(options: SeedOptions, users: any[]) {
  const contents: any[] = [];
  const contentCount = options.minimal ? 5 : options.production ? 10 : contentTemplates.length;
  for (let i = 0; i < contentCount; i++) {
    const template = contentTemplates[i];
    const author = users[Math.floor(Math.random() * users.length)];
    const fullBody = template.body + '\n\n' + generateLorem(500);
    const content = await Content.create({
      title: template.title,
      description: template.body,
      body: fullBody,
      author: author._id,
      organization: author.organization,
      category: template.category,
      tags: template.tags,
      status: ['draft', 'pending_review', 'published'][Math.floor(Math.random() * 3)],
      views: Math.floor(Math.random() * 1000),
      publishedAt: Math.random() > 0.5 ? new Date() : undefined,
    });
    if (content.status === 'published' && !options.production) {
      try {
        const text = `${content.title}\n\n${content.description}\n\n${content.body}`;
        const embedding = await generateEmbedding(text);
        const vectorId = await upsertVector({ id: content._id.toString(), values: embedding, metadata: { contentId: content._id.toString(), category: content.category, tags: content.tags } });
        content.vectorId = vectorId;
        await content.save();
      } catch (error) {
        console.warn('Failed to generate embedding:', error);
      }
    }
    contents.push(content);
  }
  return contents;
}


