import { NextResponse } from "next/server";
import { google } from "googleapis";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("state");
    if (!code || !userId) return NextResponse.json({ ok: false, error: "Missing code or state" }, { status: 400 });

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_FIT_CLIENT_ID,
      process.env.GOOGLE_FIT_CLIENT_SECRET,
      process.env.GOOGLE_FIT_REDIRECT_URI
    );
    const { tokens } = await oauth2Client.getToken(code);

    await connectDB();
    await User.findByIdAndUpdate(userId, {
      $set: {
        "healthIntegrations.googleFit": {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000),
          connected: true,
        },
      },
    });

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}


