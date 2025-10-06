import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("state");
    if (!code || !userId) return NextResponse.json({ ok: false, error: "Missing code or state" }, { status: 400 });

    const tokenResponse = await fetch("https://api.fitbit.com/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        clientId: process.env.FITBIT_CLIENT_ID || "",
        grant_type: "authorization_code",
        redirect_uri: process.env.FITBIT_REDIRECT_URI || "",
        code,
      }),
    });

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      throw new Error(`Fitbit token exchange failed: ${text}`);
    }
    const tokens = await tokenResponse.json();

    await connectDB();
    await User.findByIdAndUpdate(userId, {
      $set: {
        "healthIntegrations.fitbit": {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : new Date(Date.now() + 3600 * 1000),
          connected: true,
        },
      },
    });

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (error) {
    return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
  }
}


