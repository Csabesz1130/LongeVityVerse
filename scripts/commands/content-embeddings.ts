import Content from '@/lib/db/models/Content';
import { generateEmbedding } from '@/lib/vector/embeddings';
import { upsertVector } from '@/lib/vector/pinecone';

export async function generateAllEmbeddings(batchSize: number = 10) {
  let processed = 0;
  const cursor = Content.find({ status: 'published' }).cursor();
  const batch: any[] = [];
  for await (const content of cursor) {
    batch.push(content);
    if (batch.length >= batchSize) {
      await processBatch(batch);
      processed += batch.length;
      batch.length = 0;
    }
  }
  if (batch.length) {
    await processBatch(batch);
    processed += batch.length;
  }
  return processed;
}

async function processBatch(items: any[]) {
  for (const content of items) {
    const text = `${content.title}\n\n${content.description}\n\n${content.body}`;
    const embedding = await generateEmbedding(text);
    const vectorId = await upsertVector({ id: content._id.toString(), values: embedding, metadata: { contentId: content._id.toString(), category: content.category, status: content.status } });
    await Content.findByIdAndUpdate(content._id, { vectorId, embedding: embedding.slice(0, 128) });
  }
}


