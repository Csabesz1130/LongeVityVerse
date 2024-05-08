// File: app/api/posts/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import connectMongo from '@/libs/mongoose';
import Post from '@/models/Post';  // Ensure you have a Post model defined

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectMongo();  // Connect to the database using Mongoose

  if (req.method === 'GET') {
    const posts = await Post.find({});  // Fetch all posts using the Post model
    res.status(200).json(posts);
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
