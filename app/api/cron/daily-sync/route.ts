import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { inngest } from "@/lib/tasks/inngest";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

export async function POST() {
  const cronSecret = process.env.CRON_SECRET;
  const headerSecret = headers().get("authorization");
  if (!cronSecret || headerSecret !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const users = await User.find({ "preferences.syncFrequency": { $in: ["daily", "hourly"] } })
      .select("_id healthIntegrations")
      .lean();

    const events: any[] = [];
    for (const u of users) {
      if ((u as any).healthIntegrations?.googleFit?.connected) {
        events.push({ name: "health/sync.requested", data: { userId: String((u as any)._id), source: "google_fit" } });
      }
      if ((u as any).healthIntegrations?.fitbit?.connected) {
        events.push({ name: "health/sync.requested", data: { userId: String((u as any)._id), source: "fitbit" } });
      }
    }

    if (events.length > 0) {
      await inngest.send(events);
    }

    return NextResponse.json({ ok: true, queued: events.length });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}


