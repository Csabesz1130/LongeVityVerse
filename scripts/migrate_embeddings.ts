import { connectDB } from "../lib/db/mongodb";
import Content from "../lib/db/models/Content";
import { generateEmbedding } from "../lib/vector/embeddings";
import { upsertVector } from "../lib/vector/pinecone";

export async function migrateContentEmbeddings() {
  await connectDB();
  const contents = await Content.find({ status: "published", vectorId: { $exists: false } }).limit(100);
  console.log(`Processing ${contents.length} contents...`);
  for (const content of contents) {
    try {
      const text = `${content.title}\n\n${content.description}\n\n${content.body}`;
      const embedding = await generateEmbedding(text);
      const vectorId = await upsertVector({
        id: content._id.toString(),
        values: embedding,
        metadata: {
          contentId: content._id.toString(),
          category: content.category,
          status: content.status,
          organizationId: content.organization?.toString(),
        },
      });
      await Content.findByIdAndUpdate(content._id, { vectorId, embedding: embedding.slice(0, 128) });
      console.log(`✓ Processed: ${content.title}`);
    } catch (error) {
      console.error(`✗ Failed: ${content.title}`, error);
    }
  }
  console.log("Migration complete!");
}

if (require.main === module) {
  migrateContentEmbeddings().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}


