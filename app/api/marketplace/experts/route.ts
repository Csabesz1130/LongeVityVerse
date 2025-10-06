import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

export async function GET() {
  try {
    await connectDB();
    // Placeholder: return users flagged as experts later; for now, latest users
    const experts = await User.find({}).sort({ createdAt: -1 }).limit(10).lean();
    return NextResponse.json({ ok: true, experts });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}


