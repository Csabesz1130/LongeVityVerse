import User from '@/lib/db/models/User';

export async function listUsers({ role, limit = 20 }: { role?: string; limit?: number }) {
  const filter: any = {};
  if (role) filter.role = role;
  const users = await User.find(filter).limit(limit).lean();
  for (const u of users) {
    console.log(`${u.email}\t${u.name}\t${u.role}`);
  }
}


