import User from '@/lib/db/models/User';

export async function makeAdmin(email: string) {
  await User.findOneAndUpdate({ email }, { role: 'admin' });
}


