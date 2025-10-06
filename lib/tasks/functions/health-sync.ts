import { inngest } from "../inngest";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import HealthData from "@/lib/db/models/HealthData";
import SyncJob from "@/lib/db/models/SyncJob";

// Placeholder integration classes with expected interface
class GoogleFitAPI {
  constructor(public user: any) {}
  async syncAllData(forceRefresh?: boolean) {
    return [] as Array<{ type: string; value: number; unit: string; metadata?: any; timestamp: string | number | Date }>;
  }
}

class FitbitAPI {
  constructor(public user: any) {}
  async syncAllData(forceRefresh?: boolean) {
    return [] as Array<{ type: string; value: number; unit: string; metadata?: any; timestamp: string | number | Date }>;
  }
}

export const healthSyncFunction = inngest.createFunction(
  {
    id: "health-sync",
    name: "Sync Health Data",
    retries: 3,
    concurrency: {
      limit: 10,
    },
  },
  { event: "health/sync.requested" },
  async ({ event, step }) => {
    const { userId, source, forceRefresh } = event.data;

    const job = await step.run("create-sync-job", async () => {
      await connectDB();
      return await SyncJob.create({
        userId,
        jobType: "health_sync",
        source,
        status: "running",
        scheduledAt: new Date(),
        startedAt: new Date(),
      });
    });

    const user = await step.run("fetch-user", async () => {
      await connectDB();
      return await User.findById(userId).select("+healthIntegrations");
    });

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const syncedData = await step.run("sync-health-data", async () => {
      let api: GoogleFitAPI | FitbitAPI;
      switch (source) {
        case "google_fit":
          api = new GoogleFitAPI(user);
          return await api.syncAllData(forceRefresh);
        case "fitbit":
          api = new FitbitAPI(user);
          return await api.syncAllData(forceRefresh);
        default:
          throw new Error(`Unknown source: ${source}`);
      }
    });

    await step.run("save-health-data", async () => {
      await connectDB();
      const healthRecords = (syncedData as any[]).map((item) => ({
        userId,
        organization: (user as any).organization,
        source,
        dataType: item.type,
        value: item.value,
        unit: item.unit,
        metadata: item.metadata || {},
        timestamp: new Date(item.timestamp),
        syncedAt: new Date(),
      }));
      if (healthRecords.length > 0) {
        await HealthData.insertMany(healthRecords, { ordered: false });
      }
      return healthRecords.length;
    });

    await step.run("update-job-status", async () => {
      await connectDB();
      await SyncJob.findByIdAndUpdate(job._id, {
        status: "completed",
        completedAt: new Date(),
        progress: 100,
        result: { recordsProcessed: (syncedData as any[]).length },
      });
    });

    await step.sendEvent("trigger-insights", {
      name: "health/insights.generate",
      data: { userId, period: "daily" },
    });

    return { success: true, recordsSynced: (syncedData as any[]).length, source };
  }
);


