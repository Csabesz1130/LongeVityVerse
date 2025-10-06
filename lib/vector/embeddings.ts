import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = parseInt(process.env.EMBEDDING_DIMENSIONS || "1536");

export async function generateEmbedding(text: string): Promise<number[]> {
  const cleanedText = text.replace(/\n/g, " ").replace(/\s+/g, " ").trim().substring(0, 8000);
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleanedText,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const cleaned = texts.map((t) => t.replace(/\n/g, " ").replace(/\s+/g, " ").trim().substring(0, 8000));
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: cleaned,
    dimensions: EMBEDDING_DIMENSIONS,
  });
  return response.data.map((d) => d.embedding);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error("Vectors must have the same length");
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}


