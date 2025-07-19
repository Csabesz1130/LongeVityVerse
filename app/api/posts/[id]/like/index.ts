import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/libs/mongoose';
import Post from '@/models/Post';
import User from '@/models/User';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();

        const postId = params.id;

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            );
        }

        // TODO: Get authenticated user from session
        // For now, we'll use a placeholder user ID
        const userId = '507f1f77bcf86cd799439011'; // Placeholder - replace with actual auth

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user already liked the post
        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            // Unlike the post
            await Post.findByIdAndUpdate(postId, {
                $pull: { likes: userId }
            });
        } else {
            // Like the post
            await Post.findByIdAndUpdate(postId, {
                $addToSet: { likes: userId }
            });
        }

        // Get updated post with populated author
        const updatedPost = await Post.findById(postId)
            .populate('author', 'name image')
            .lean();

        return NextResponse.json({
            success: true,
            data: {
                liked: !alreadyLiked,
                likeCount: updatedPost.likes.length
            },
            message: alreadyLiked ? 'Post unliked successfully' : 'Post liked successfully'
        }, { status: 200 });
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to toggle like' },
            { status: 500 }
        );
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();

        const postId = params.id;

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            );
        }

        // TODO: Get authenticated user from session
        // For now, we'll use a placeholder user ID
        const userId = '507f1f77bcf86cd799439011'; // Placeholder - replace with actual auth

        // Check if user liked the post
        const liked = post.likes.includes(userId);

        return NextResponse.json({
            success: true,
            data: {
                liked,
                likeCount: post.likes.length
            }
        }, { status: 200 });
    } catch (error) {
        console.error('Error checking like status:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to check like status' },
            { status: 500 }
        );
    }
} 