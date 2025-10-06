import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import Content from "@/lib/db/models/Content";

export async function GET() {
  try {
    await connectDB();
    // Placeholder: use Content as stand-in for products until marketplace model exists
    const products = await Content.find({ category: { $in: ["guide", "research"] }, status: "published" })
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();
    return NextResponse.json({ ok: true, products });
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}


