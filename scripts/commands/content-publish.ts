import Content from '@/lib/db/models/Content';

export async function publishContent(id: string) {
  await Content.findByIdAndUpdate(id, { status: 'published', publishedAt: new Date() });
}


