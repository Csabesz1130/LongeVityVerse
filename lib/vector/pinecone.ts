import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || "longevityverse-content";

export async function getPineconeIndex() {
  return pinecone.index(INDEX_NAME);
}

// ============================================================
// Upsert vectors
export async function upsertVector(data: {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}) {
  const index = await getPineconeIndex();
  await index.upsert([
    { id: data.id, values: data.values, metadata: data.metadata || {} },
  ]);
  return data.id;
}

// Batch upsert
export async function upsertVectors(
  vectors: Array<{ id: string; values: number[]; metadata?: Record<string, any> }>
) {
  const index = await getPineconeIndex();
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
  }
  return vectors.length;
}

// ============================================================
// Query similar vectors
export async function findSimilarVectors(
  vectorId: string,
  topK: number = 10,
  filter?: Record<string, any>
) {
  const index = await getPineconeIndex();
  const fetchResponse = await index.fetch([vectorId]);
  const vector = (fetchResponse as any).records?.[vectorId];
  if (!vector) {
    throw new Error(`Vector ${vectorId} not found`);
  }
  const queryResponse = await index.query({
    vector: vector.values,
    topK,
    includeMetadata: true,
    filter,
  });
  return (queryResponse as any).matches;
}

// Query by embedding
export async function queryByEmbedding(
  embedding: number[],
  topK: number = 10,
  filter?: Record<string, any>
) {
  const index = await getPineconeIndex();
  const queryResponse = await index.query({
    vector: embedding,
    topK,
    includeMetadata: true,
    filter,
  });
  return (queryResponse as any).matches;
}

// ============================================================
// Delete vectors
export async function deleteVector(id: string) {
  const index = await getPineconeIndex();
  await index.deleteOne(id);
}

export async function deleteVectors(ids: string[]) {
  const index = await getPineconeIndex();
  const batchSize = 1000;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    await index.deleteMany(batch as any);
  }
}
type UpsertArgs = { id: string; values: number[]; metadata?: Record<string, any> };

export async function upsertVector(args: UpsertArgs): Promise<string> {
  // Placeholder for Pinecone upsert; return id for now
  return args.id;
}

export async function findSimilarVectors(vectorId: string, topK: number) {
  // Placeholder similar vectors
  return [{ id: vectorId, score: 1 }];
}


