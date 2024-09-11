import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import connectToDatabase from "@/libs/mongoose";
import User from '@/models/User';

export async function POST(req: Request) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { platform, data } = await req.json();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { [`healthData.${platform}`]: data } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Health data updated successfully' });
  } catch (error) {
    console.error('Error updating health data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

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

    return NextResponse.json(user.healthData || {});
  } catch (error) {
    console.error('Error fetching health data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}