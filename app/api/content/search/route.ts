import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/vector/embeddings";
import { findSimilarVectors } from "@/lib/vector/pinecone";
import { connectDB } from "@/lib/db/mongodb";
import Content from "@/lib/db/models/Content";

export async function POST(request: Request) {
  try {
    const { query, topK = 5 } = await request.json();
    if (!query || typeof query !== "string") {
      return NextResponse.json({ ok: false, error: "Missing query" }, { status: 400 });
    }

    const embedding = await generateEmbedding(query);
    // In a real impl, we'd query Pinecone with the vector. Here, use stub.
    const similar = await findSimilarVectors("query", topK);

    await connectDB();
    // As a placeholder, return most recent published content
    const results = await Content.find({ status: "published" })
      .sort({ publishedAt: -1 })
      .limit(topK)
      .lean();

    return NextResponse.json({ ok: true, embeddingDimensions: embedding.length, results, similar });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}


