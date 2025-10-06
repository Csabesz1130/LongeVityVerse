import { connectDB } from '@/lib/db/mongodb';
import { seedUsers } from './seeders/users';
import { seedOrganizations } from './seeders/organizations';
import { seedContent } from './seeders/content';
import { seedHealthData } from './seeders/health-data';
import { seedMarketplace } from './seeders/marketplace';
import { seedReviewers } from './seeders/reviewers';
import { seedNotifications } from './seeders/notifications';
import { logger } from '@/lib/monitoring/logger';
import mongoose from 'mongoose';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[0;31m',
  green: '\x1b[0;32m',
  yellow: '\x1b[0;33m',
  blue: '\x1b[0;34m',
  cyan: '\x1b[0;36m',
  magenta: '\x1b[0;35m',
};

function echo(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

interface SeedOptions {
  clean?: boolean;
  minimal?: boolean;
  production?: boolean;
}

export async function seedDatabase(options: SeedOptions = {}) {
  try {
    echo(colors.cyan, '\n🌱 LongevityVerse Data Seeding');
    echo(colors.cyan, '='.repeat(60));

    // Connect to database
    echo(colors.blue, '\n📡 Connecting to MongoDB...');
    await connectDB();
    echo(colors.green, '✓ Connected to MongoDB');

    // Clean database if requested
    if (options.clean) {
      echo(colors.yellow, '\n⚠️  Cleaning database...');
      await cleanDatabase();
      echo(colors.green, '✓ Database cleaned');
    }

    // Seed data based on environment
    const seedCount = options.production ? 'production' :
                     options.minimal ? 'minimal' : 'development';
    
    echo(colors.magenta, `\n🎯 Seeding with ${seedCount} dataset\n`);

    // 1. Seed Organizations
    echo(colors.blue, '1️⃣  Seeding organizations...');
    const organizations = await seedOrganizations(options);
    echo(colors.green, `✓ Created ${organizations.length} organizations`);

    // 2. Seed Users
    echo(colors.blue, '2️⃣  Seeding users...');
    const users = await seedUsers(options, organizations);
    echo(colors.green, `✓ Created ${users.length} users`);

    // 3. Seed Reviewers
    echo(colors.blue, '3️⃣  Seeding reviewers...');
    const reviewers = await seedReviewers(options, users);
    echo(colors.green, `✓ Created ${reviewers.length} reviewers`);

    // 4. Seed Content
    echo(colors.blue, '4️⃣  Seeding content...');
    const content = await seedContent(options, users);
    echo(colors.green, `✓ Created ${content.length} content items`);

    // 5. Seed Health Data
    echo(colors.blue, '5️⃣  Seeding health data...');
    const healthData = await seedHealthData(options, users);
    echo(colors.green, `✓ Created ${healthData.length} health records`);

    // 6. Seed Marketplace
    echo(colors.blue, '6️⃣  Seeding marketplace...');
    const marketplace = await seedMarketplace(options, users);
    echo(colors.green, `✓ Created ${marketplace.length} marketplace items`);

    // 7. Seed Notifications
    echo(colors.blue, '7️⃣  Seeding notifications...');
    const notifications = await seedNotifications(options, users);
    echo(colors.green, `✓ Created ${notifications.length} notifications`);

    // Summary
    echo(colors.green, '\n' + '='.repeat(60));
    echo(colors.green, '✅ Database seeded successfully!');
    echo(colors.green, '='.repeat(60));
    
    echo(colors.cyan, '\n📊 Summary:');
    echo(colors.cyan, `   Organizations: ${organizations.length}`);
    echo(colors.cyan, `   Users: ${users.length}`);
    echo(colors.cyan, `   Reviewers: ${reviewers.length}`);
    echo(colors.cyan, `   Content: ${content.length}`);
    echo(colors.cyan, `   Health Records: ${healthData.length}`);
    echo(colors.cyan, `   Marketplace Items: ${marketplace.length}`);
    echo(colors.cyan, `   Notifications: ${notifications.length}`);

    echo(colors.yellow, '\n💡 Test accounts created:');
    echo(colors.yellow, '   Admin: admin@longevityverse.com / admin123');
    echo(colors.yellow, '   User: user@longevityverse.com / user123');
    echo(colors.yellow, '   Reviewer: reviewer@longevityverse.com / reviewer123');

  } catch (error: any) {
    echo(colors.red, `\n❌ Seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

async function cleanDatabase() {
  const collections = await mongoose.connection.db.listCollections().toArray();
  
  for (const collection of collections) {
    await mongoose.connection.db.dropCollection(collection.name);
  }
}

// CLI Entry Point
if (require.main === module) {
  const args = process.argv.slice(2);
  const options: SeedOptions = {
    clean: args.includes('--clean'),
    minimal: args.includes('--minimal'),
    production: args.includes('--production'),
  };
  seedDatabase(options);
}


