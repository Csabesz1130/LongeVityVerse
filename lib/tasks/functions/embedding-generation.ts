import { inngest } from "../inngest";
import { generateEmbedding } from "@/lib/vector/embeddings";
import { upsertVector } from "@/lib/vector/pinecone";
import { connectDB } from "@/lib/db/mongodb";
import Content from "@/lib/db/models/Content";

export const embeddingGenerationFunction = inngest.createFunction(
  { id: "embedding-generation", name: "Generate Content Embeddings", retries: 2 },
  { event: "content/embedding.generate" },
  async ({ event, step }) => {
    const { contentId, text } = event.data;

    const embedding = await step.run("generate-embedding", async () => {
      return await generateEmbedding(text);
    });

    const vectorId = await step.run("store-in-pinecone", async () => {
      return await upsertVector({ id: contentId, values: embedding, metadata: { contentId, text: text.substring(0, 500) } });
    });

    await step.run("update-content-record", async () => {
      await connectDB();
      await Content.findByIdAndUpdate(contentId, { vectorId, embedding });
    });

    await step.sendEvent("trigger-related-content", { name: "content/related.compute", data: { contentId } });

    return { vectorId, dimensions: embedding.length };
  }
);


