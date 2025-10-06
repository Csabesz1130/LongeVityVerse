import User from '@/lib/db/models/User';

export async function deleteUser(email: string, force?: boolean) {
  // Force is handled by caller; here we just delete
  await User.deleteOne({ email });
}


