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
    const users = await User.find({}).select("_id").lean();

    const events = users.map((u: any) => ({ name: "user/weekly-report", data: { userId: String(u._id) } }));
    if (events.length > 0) {
      await inngest.send(events);
    }

    return NextResponse.json({ ok: true, queued: events.length });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}


