import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectToDatabase from "@/libs/mongoose";
import User from '@/models/User';

export async function GET() {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const connectedPlatforms = Object.keys(user.healthData || {});
    return NextResponse.json({ connectedPlatforms });
  } catch (error) {
    console.error('Error fetching connected platforms:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}