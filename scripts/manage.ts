import { program } from 'commander';
import { connectDB } from '@/lib/db/mongodb';
import mongoose from 'mongoose';

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[0;31m',
  green: '\x1b[0;32m',
  yellow: '\x1b[0;33m',
  blue: '\x1b[0;34m',
  cyan: '\x1b[0;36m',
};

function echo(color: string, message: string) {
  console.log(`${color}${message}${colors.reset}`);
}

// ============================================================
// Database Commands
// ============================================================

program
  .command('db:migrate')
  .description('Run database migrations')
  .action(async () => {
    try {
      echo(colors.blue, '🔄 Running migrations...');
      await connectDB();
      
      const { runMigrations } = await import('./commands/db-migrate');
      await runMigrations();
      
      echo(colors.green, '✓ Migrations completed');
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Migration failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('db:reset')
  .description('Reset database (DANGER: drops all collections)')
  .option('--force', 'Skip confirmation')
  .action(async (options) => {
    try {
      if (!options.force) {
        echo(colors.yellow, '⚠️  This will drop all collections!');
        echo(colors.yellow, '   Use --force to confirm');
        process.exit(1);
      }

      echo(colors.red, '🗑️  Resetting database...');
      await connectDB();
      
      const collections = await mongoose.connection.db.listCollections().toArray();
      for (const collection of collections) {
        await mongoose.connection.db.dropCollection(collection.name);
        echo(colors.yellow, `   Dropped: ${collection.name}`);
      }
      
      echo(colors.green, '✓ Database reset complete');
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Reset failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('db:backup')
  .description('Backup database to file')
  .option('--output <path>', 'Output file path', './backups')
  .action(async (options) => {
    try {
      echo(colors.blue, '💾 Creating backup...');
      await connectDB();
      
      const { createBackup } = await import('./commands/db-backup');
      const backupPath = await createBackup(options.output);
      
      echo(colors.green, `✓ Backup created: ${backupPath}`);
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Backup failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('db:restore')
  .description('Restore database from backup')
  .requiredOption('--file <path>', 'Backup file path')
  .action(async (options) => {
    try {
      echo(colors.blue, '📥 Restoring from backup...');
      await connectDB();
      
      const { restoreBackup } = await import('./commands/db-backup');
      await restoreBackup(options.file);
      
      echo(colors.green, '✓ Restore completed');
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Restore failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('db:indexes')
  .description('Rebuild all database indexes')
  .action(async () => {
    try {
      echo(colors.blue, '🔧 Rebuilding indexes...');
      await connectDB();
      
      const { rebuildIndexes } = await import('./commands/db-indexes');
      await rebuildIndexes();
      
      echo(colors.green, '✓ Indexes rebuilt');
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Index rebuild failed: ${error.message}`);
      process.exit(1);
    }
  });

// ============================================================
// User Management Commands
// ============================================================

program
  .command('user:create')
  .description('Create a new user')
  .requiredOption('--email <email>', 'User email')
  .requiredOption('--name <name>', 'User name')
  .option('--password <password>', 'User password', 'changeme123')
  .option('--role <role>', 'User role', 'user')
  .option('--admin', 'Make user admin')
  .action(async (options) => {
    try {
      await connectDB();
      
      const { createUser } = await import('./commands/user-create');
      const user = await createUser({
        email: options.email,
        name: options.name,
        password: options.password,
        role: options.admin ? 'admin' : options.role,
      });
      
      echo(colors.green, `✓ User created: ${user.email}`);
      echo(colors.cyan, `  ID: ${user._id}`);
      echo(colors.cyan, `  Role: ${user.role}`);
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ User creation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('user:delete')
  .description('Delete a user')
  .requiredOption('--email <email>', 'User email')
  .option('--force', 'Skip confirmation')
  .action(async (options) => {
    try {
      await connectDB();
      
      const { deleteUser } = await import('./commands/user-delete');
      await deleteUser(options.email, options.force);
      
      echo(colors.green, `✓ User deleted: ${options.email}`);
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Deletion failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('user:list')
  .description('List all users')
  .option('--role <role>', 'Filter by role')
  .option('--limit <number>', 'Limit results', '20')
  .action(async (options) => {
    try {
      await connectDB();
      
      const { listUsers } = await import('./commands/user-list');
      await listUsers({
        role: options.role,
        limit: parseInt(options.limit),
      });
      
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ List failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('user:make-admin')
  .description('Promote user to admin')
  .requiredOption('--email <email>', 'User email')
  .action(async (options) => {
    try {
      await connectDB();
      
      const { makeAdmin } = await import('./commands/user-admin');
      await makeAdmin(options.email);
      
      echo(colors.green, `✓ User promoted to admin: ${options.email}`);
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Promotion failed: ${error.message}`);
      process.exit(1);
    }
  });

// ============================================================
// Content Management Commands
// ============================================================

program
  .command('content:publish')
  .description('Publish content by ID')
  .requiredOption('--id <id>', 'Content ID')
  .action(async (options) => {
    try {
      await connectDB();
      
      const { publishContent } = await import('./commands/content-publish');
      await publishContent(options.id);
      
      echo(colors.green, `✓ Content published: ${options.id}`);
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Publishing failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('content:generate-embeddings')
  .description('Generate embeddings for all published content')
  .option('--batch-size <size>', 'Batch size', '10')
  .action(async (options) => {
    try {
      echo(colors.blue, '🧮 Generating embeddings...');
      await connectDB();
      
      const { generateAllEmbeddings } = await import('./commands/content-embeddings');
      const count = await generateAllEmbeddings(parseInt(options.batchSize));
      
      echo(colors.green, `✓ Generated embeddings for ${count} items`);
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Embedding generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('content:reindex')
  .description('Reindex all content in vector database')
  .action(async () => {
    try {
      echo(colors.blue, '🔄 Reindexing content...');
      await connectDB();
      
      const { reindexContent } = await import('./commands/content-reindex');
      const count = await reindexContent();
      
      echo(colors.green, `✓ Reindexed ${count} items`);
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Reindexing failed: ${error.message}`);
      process.exit(1);
    }
  });

// ============================================================
// Cache Management Commands
// ============================================================

program
  .command('cache:clear')
  .description('Clear all caches')
  .option('--pattern <pattern>', 'Clear specific pattern')
  .action(async (options) => {
    try {
      echo(colors.blue, '🧹 Clearing cache...');
      
      const { clearCache } = await import('./commands/cache-clear');
      await clearCache(options.pattern);
      
      echo(colors.green, '✓ Cache cleared');
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Cache clear failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('cache:stats')
  .description('Show cache statistics')
  .action(async () => {
    try {
      const { showCacheStats } = await import('./commands/cache-stats');
      await showCacheStats();
      
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Stats failed: ${error.message}`);
      process.exit(1);
    }
  });

// ============================================================
// Health Data Commands
// ============================================================

program
  .command('health:sync-all')
  .description('Trigger sync for all users')
  .option('--source <source>', 'Specific source (google_fit, fitbit)')
  .action(async (options) => {
    try {
      echo(colors.blue, '🔄 Triggering health syncs...');
      await connectDB();
      
      const { syncAllUsers } = await import('./commands/health-sync-all');
      const count = await syncAllUsers(options.source);
      
      echo(colors.green, `✓ Triggered sync for ${count} users`);
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Sync trigger failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('health:cleanup')
  .description('Clean up old health data')
  .option('--days <days>', 'Delete data older than X days', '365')
  .option('--dry-run', 'Show what would be deleted')
  .action(async (options) => {
    try {
      echo(colors.blue, '🧹 Cleaning up health data...');
      await connectDB();
      
      const { cleanupHealthData } = await import('./commands/health-cleanup');
      const count = await cleanupHealthData(
        parseInt(options.days),
        options.dryRun
      );
      
      if (options.dryRun) {
        echo(colors.yellow, `Would delete ${count} records`);
      } else {
        echo(colors.green, `✓ Deleted ${count} records`);
      }
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Cleanup failed: ${error.message}`);
      process.exit(1);
    }
  });

// ============================================================
// System Commands
// ============================================================

program
  .command('system:check')
  .description('Run system health checks')
  .action(async () => {
    try {
      const { runSystemCheck } = await import('./commands/system-check');
      await runSystemCheck();
      
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ System check failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('system:metrics')
  .description('Show system metrics')
  .option('--period <period>', 'Time period (24h, 7d, 30d)', '24h')
  .action(async (options) => {
    try {
      const { showMetrics } = await import('./commands/system-metrics');
      await showMetrics(options.period);
      
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Metrics failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('system:jobs')
  .description('Show background job status')
  .option('--status <status>', 'Filter by status')
  .action(async (options) => {
    try {
      await connectDB();
      
      const { showJobs } = await import('./commands/system-jobs');
      await showJobs(options.status);
      
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Jobs listing failed: ${error.message}`);
      process.exit(1);
    }
  });

// ============================================================
// Maintenance Commands
// ============================================================

program
  .command('maintenance:enable')
  .description('Enable maintenance mode')
  .option('--message <message>', 'Maintenance message')
  .action(async (options) => {
    try {
      const { enableMaintenance } = await import('./commands/maintenance');
      await enableMaintenance(options.message);
      
      echo(colors.yellow, '⚠️  Maintenance mode enabled');
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('maintenance:disable')
  .description('Disable maintenance mode')
  .action(async () => {
    try {
      const { disableMaintenance } = await import('./commands/maintenance');
      await disableMaintenance();
      
      echo(colors.green, '✓ Maintenance mode disabled');
      process.exit(0);
    } catch (error: any) {
      echo(colors.red, `❌ Failed: ${error.message}`);
      process.exit(1);
    }
  });

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
