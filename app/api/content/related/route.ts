import { NextResponse } from "next/server";
import { inngest } from "@/lib/tasks/inngest";

export async function POST(request: Request) {
  try {
    const { contentId } = await request.json();
    if (!contentId) return NextResponse.json({ ok: false, error: "Missing contentId" }, { status: 400 });

    await inngest.send({ name: "content/related.compute", data: { contentId } });
    return NextResponse.json({ ok: true, queued: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}


