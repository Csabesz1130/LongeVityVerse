import { inngest } from "../inngest";
import { findSimilarVectors } from "@/lib/vector/pinecone";
import { connectDB } from "@/lib/db/mongodb";
import Content from "@/lib/db/models/Content";

export const relatedContentFunction = inngest.createFunction(
  { id: "related-content-compute", name: "Compute Related Content" },
  { event: "content/related.compute" },
  async ({ event, step }) => {
    const { contentId } = event.data;

    const content = await step.run("fetch-content", async () => {
      await connectDB();
      return await Content.findById(contentId);
    });

    if (!content || !(content as any).vectorId) {
      throw new Error("Content or vector not found");
    }

    const similarContent = await step.run("find-similar", async () => {
      return await findSimilarVectors((content as any).vectorId!, 10);
    });

    await step.run("update-related", async () => {
      await connectDB();
      const relatedIds = (similarContent as any[])
        .filter((item) => item.id !== contentId)
        .slice(0, 5)
        .map((item) => item.id);
      await Content.findByIdAndUpdate(contentId, { relatedContent: relatedIds });
    });

    return { relatedCount: (similarContent as any[]).length - 1 };
  }
);


