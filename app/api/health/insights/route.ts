import { NextResponse } from "next/server";
import { getRecommendations } from "../../../../libs/recommendations";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const insights = await getRecommendations(body?.metrics ?? {});
    return NextResponse.json({ ok: true, insights });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}

