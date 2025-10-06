import { serve } from "inngest/next";
import { inngest } from "@/lib/tasks/inngest";
import {
  healthSyncFunction,
  insightsGenerationFunction,
  embeddingGenerationFunction,
  relatedContentFunction,
} from "@/lib/tasks/functions";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    healthSyncFunction,
    insightsGenerationFunction,
    embeddingGenerationFunction,
    relatedContentFunction,
  ],
});


