import { NextResponse } from "next/server";
import { getDashboardStats } from "../../../../libs/dashboardApi";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ ok: true, stats });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

