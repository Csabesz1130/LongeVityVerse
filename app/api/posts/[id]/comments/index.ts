import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/libs/mongoose';
import Comment from '@/models/Comment';
import Post from '@/models/Post';
import User from '@/models/User';
import { CreateCommentRequest, UpdateCommentRequest, CommentsResponse, CommentResponse } from '@/types/community';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const postId = params.id;

        // Verify post exists
        const post = await Post.findById(postId);
        if (!post) {
            return NextResponse.json(
                { success: false, error: 'Post not found' },
                { status: 404 }
            );
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Fetch comments with populated author
        const comments = await Comment.find({ post: postId })
            .populate('author', 'name image')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const total = await Comment.countDocuments({ post: postId });

        const response: CommentsResponse = {
            success: true,
            data: comments,
            message: 'Comments retrieved successfully'
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();

        const body: CreateCommentRequest = await request.json();
        const { content } = body;
        const postId = params.id;

        // Validate required fields
        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Comment content is required' },
                { status: 400 }
            );
        }

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

        // Create new comment
        const comment = new Comment({
            content: content.trim(),
            author: userId,
            post: postId
        });

        await comment.save();

        // Add comment to post's comments array
        await Post.findByIdAndUpdate(postId, {
            $push: { comments: comment._id }
        });

        // Populate author information
        await comment.populate('author', 'name image');

        const response: CommentResponse = {
            success: true,
            data: comment.toObject(),
            message: 'Comment created successfully'
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();

        const body: UpdateCommentRequest & { commentId: string } = await request.json();
        const { commentId, content } = body;

        if (!commentId) {
            return NextResponse.json(
                { success: false, error: 'Comment ID is required' },
                { status: 400 }
            );
        }

        if (!content || content.trim().length === 0) {
            return NextResponse.json(
                { success: false, error: 'Comment content is required' },
                { status: 400 }
            );
        }

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return NextResponse.json(
                { success: false, error: 'Comment not found' },
                { status: 404 }
            );
        }

        // Verify comment belongs to the specified post
        if (comment.post.toString() !== params.id) {
            return NextResponse.json(
                { success: false, error: 'Comment does not belong to this post' },
                { status: 403 }
            );
        }

        // TODO: Check if user is authorized to edit this comment
        // For now, we'll allow editing (replace with proper auth check)

        // Update comment
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            {
                content: content.trim(),
                isEdited: true,
                editedAt: new Date()
            },
            { new: true, runValidators: true }
        ).populate('author', 'name image');

        const response: CommentResponse = {
            success: true,
            data: updatedComment.toObject(),
            message: 'Comment updated successfully'
        };

        return NextResponse.json(response, { status: 200 });
    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update comment' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectMongo();

        const { searchParams } = new URL(request.url);
        const commentId = searchParams.get('commentId');

        if (!commentId) {
            return NextResponse.json(
                { success: false, error: 'Comment ID is required' },
                { status: 400 }
            );
        }

        // Find the comment
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return NextResponse.json(
                { success: false, error: 'Comment not found' },
                { status: 404 }
            );
        }

        // Verify comment belongs to the specified post
        if (comment.post.toString() !== params.id) {
            return NextResponse.json(
                { success: false, error: 'Comment does not belong to this post' },
                { status: 403 }
            );
        }

        // TODO: Check if user is authorized to delete this comment
        // For now, we'll allow deletion (replace with proper auth check)

        // Remove comment from post's comments array
        await Post.findByIdAndUpdate(params.id, {
            $pull: { comments: commentId }
        });

        // Delete the comment
        await Comment.findByIdAndDelete(commentId);

        return NextResponse.json(
            { success: true, message: 'Comment deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
} 