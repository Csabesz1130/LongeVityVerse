import bcrypt from 'bcryptjs';
import User from '@/lib/db/models/User';

export async function createUser({ email, name, password, role }: { email: string; name: string; password: string; role: 'admin' | 'reviewer' | 'user' }) {
  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ email, name, password: hashed, role });
  return user.toObject();
}


