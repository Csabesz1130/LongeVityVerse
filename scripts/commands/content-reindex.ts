import Content from '@/lib/db/models/Content';
import { generateEmbedding } from '@/lib/vector/embeddings';
import { upsertVector } from '@/lib/vector/pinecone';

export async function reindexContent() {
  const items = await Content.find({ status: 'published' }).lean();
  for (const c of items) {
    const text = `${c.title}\n\n${c.description}\n\n${c.body}`;
    const embedding = await generateEmbedding(text);
    await upsertVector({ id: c._id.toString(), values: embedding, metadata: { contentId: c._id.toString(), category: c.category, status: c.status } });
  }
  return items.length;
}


