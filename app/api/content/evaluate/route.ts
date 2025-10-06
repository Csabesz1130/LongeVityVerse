import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/vector/embeddings";
import { connectDB } from "@/lib/db/mongodb";
import Content from "@/lib/db/models/Content";

export async function POST(request: Request) {
  try {
    const { contentId } = await request.json();
    if (!contentId) return NextResponse.json({ ok: false, error: "Missing contentId" }, { status: 400 });

    await connectDB();
    const content = await Content.findById(contentId);
    if (!content) return NextResponse.json({ ok: false, error: "Content not found" }, { status: 404 });

    const embedding = await generateEmbedding(`${content.title}\n${content.description}\n${content.body}`);
    await Content.findByIdAndUpdate(contentId, { embedding });

    return NextResponse.json({ ok: true, embeddingDimensions: embedding.length });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}


