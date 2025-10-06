import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';

interface SeedOptions { clean?: boolean; minimal?: boolean; production?: boolean }

interface UserSeed {
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'reviewer' | 'user';
  organization?: string;
}

export async function seedUsers(options: SeedOptions, organizations: any[]) {
  const baseUsers: UserSeed[] = [
    { email: 'admin@longevityverse.com', name: 'Admin User', password: 'admin123', role: 'admin' },
    { email: 'reviewer@longevityverse.com', name: 'Expert Reviewer', password: 'reviewer123', role: 'reviewer' },
    { email: 'user@longevityverse.com', name: 'Regular User', password: 'user123', role: 'user' },
  ];

  if (!options.minimal && !options.production) {
    const additionalUsers: UserSeed[] = [
      { email: 'doctor@longevityverse.com', name: 'Dr. Sarah Johnson', password: 'doctor123', role: 'reviewer' },
      { email: 'researcher@longevityverse.com', name: 'Dr. Michael Chen', password: 'researcher123', role: 'reviewer' },
      { email: 'trainer@longevityverse.com', name: 'Alex Martinez', password: 'trainer123', role: 'user' },
      { email: 'nutritionist@longevityverse.com', name: 'Emma Wilson', password: 'nutritionist123', role: 'user' },
    ];
    for (let i = 1; i <= 20; i++) {
      additionalUsers.push({ email: `user${i}@longevityverse.com`, name: `User ${i}`, password: 'user123', role: 'user' });
    }
    baseUsers.push(...additionalUsers);
  }

  const users: any[] = [];
  for (const userData of baseUsers) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      role: userData.role,
      organization: organizations[Math.floor(Math.random() * organizations.length)]?._id,
      healthIntegrations: {
        googleFit: { connected: Math.random() > 0.5, accessToken: '', refreshToken: '' },
        fitbit: { connected: Math.random() > 0.7, accessToken: '', refreshToken: '' },
        appleHealthKit: { enabled: Math.random() > 0.6 },
      },
      preferences: {
        syncFrequency: ['realtime', 'hourly', 'daily'][Math.floor(Math.random() * 3)] as any,
        enableAIInsights: true,
        notificationsEnabled: true,
      },
    });
    users.push(user);
  }
  return users;
}


