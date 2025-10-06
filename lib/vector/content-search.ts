import { generateEmbedding } from "./embeddings";
import { queryByEmbedding, findSimilarVectors } from "./pinecone";
import { connectDB } from "@/lib/db/mongodb";
import Content from "@/lib/db/models/Content";

export async function semanticContentSearch(
  query: string,
  options: { limit?: number; category?: string; status?: string; organizationId?: string } = {}
) {
  const { limit = 10, category, status, organizationId } = options;
  const queryEmbedding = await generateEmbedding(query);
  const filter: Record<string, any> = {};
  if (category) filter.category = category;
  if (status) filter.status = status;
  if (organizationId) filter.organizationId = organizationId;
  const matches = await queryByEmbedding(queryEmbedding, limit, filter);
  await connectDB();
  const contentIds = matches.map((m: any) => m.id);
  const contents = await Content.find({ _id: { $in: contentIds } }).populate("author", "name email").lean();
  return matches.map((m: any) => ({ ...contents.find((c: any) => c._id.toString() === m.id), score: m.score }));
}

export async function findRelatedContent(
  contentId: string,
  options: { limit?: number; category?: string } = {}
) {
  const { limit = 5, category } = options;
  const filter: Record<string, any> = {};
  if (category) filter.category = category;
  const matches = await findSimilarVectors(contentId, limit + 1, filter);
  await connectDB();
  const ids = matches.map((m: any) => m.id).filter((id: string) => id !== contentId);
  const contents = await Content.find({ _id: { $in: ids } }).populate("author", "name email").limit(limit).lean();
  return matches.filter((m: any) => m.id !== contentId).slice(0, limit).map((m: any) => ({ ...contents.find((c: any) => c._id.toString() === m.id), score: m.score }));
}

export async function hybridContentSearch(
  query: string,
  options: { limit?: number; category?: string; status?: string; organizationId?: string; semanticWeight?: number } = {}
) {
  const { limit = 10, category, status, organizationId, semanticWeight = 0.7 } = options;
  const semanticResults: any[] = await semanticContentSearch(query, { limit: limit * 2, category, status, organizationId });
  await connectDB();
  const keywordFilter: any = { $text: { $search: query } };
  if (category) keywordFilter.category = category;
  if (status) keywordFilter.status = status;
  if (organizationId) keywordFilter.organization = organizationId;
  const keywordResults: any[] = await Content.find(keywordFilter, { score: { $meta: "textScore" } })
    .sort({ score: { $meta: "textScore" } })
    .limit(limit * 2)
    .populate("author", "name email")
    .lean();
  const combinedMap = new Map<string, any>();
  semanticResults.forEach((r: any) => combinedMap.set(r._id.toString(), { ...r, semanticScore: r.score || 0, keywordScore: 0 }));
  keywordResults.forEach((r: any) => {
    const id = r._id.toString();
    if (combinedMap.has(id)) combinedMap.get(id).keywordScore = r.score || 0;
    else combinedMap.set(id, { ...r, semanticScore: 0, keywordScore: r.score || 0 });
  });
  const maxSemantic = Math.max(0, ...semanticResults.map((r: any) => r.score || 0));
  const maxKeyword = Math.max(0, ...keywordResults.map((r: any) => r.score || 0));
  const combined = Array.from(combinedMap.values()).map((item: any) => {
    const normalizedSemantic = item.semanticScore / (maxSemantic || 1);
    const normalizedKeyword = item.keywordScore / (maxKeyword || 1);
    return { ...item, combinedScore: semanticWeight * normalizedSemantic + (1 - semanticWeight) * normalizedKeyword };
  });
  combined.sort((a: any, b: any) => b.combinedScore - a.combinedScore);
  return combined.slice(0, limit);
}


