import { NextRequest, NextResponse } from 'next/server';
import connectMongo from '@/libs/mongoose';
import Post from '@/models/Post';
import User from '@/models/User';
import { CreatePostRequest, UpdatePostRequest, PostsResponse, PostResponse } from '@/types/community';

export async function GET(request: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const author = searchParams.get('author');
    const tag = searchParams.get('tag');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'createdAt';

    // Build query
    const query: any = {};
    if (category) query.category = category;
    if (author) query.author = author;
    if (tag) query.tags = tag;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj: any = {};
    if (sort === 'likes') sortObj.likeCount = -1;
    else if (sort === 'comments') sortObj.commentCount = -1;
    else if (sort === 'views') sortObj.viewCount = -1;
    else sortObj.createdAt = -1;

    // Fetch posts with populated author and comments
    const posts = await Post.find(query)
      .populate('author', 'name image')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name image'
        },
        options: { sort: { createdAt: -1 }, limit: 5 } // Limit comments to 5 most recent
      })
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    const response: PostsResponse = {
      success: true,
      data: posts,
      message: 'Posts retrieved successfully'
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongo();

    const body: CreatePostRequest = await request.json();
    const { title, content, category = 'general', tags = [] } = body;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // TODO: Get authenticated user from session
    // For now, we'll use a placeholder user ID
    // In a real app, you'd get this from the authentication middleware
    const userId = '507f1f77bcf86cd799439011'; // Placeholder - replace with actual auth

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Create new post
    const post = new Post({
      title: title?.trim(),
      content: content.trim(),
      author: userId,
      category,
      tags: tags.filter(tag => tag.trim().length > 0)
    });

    await post.save();

    // Populate author information
    await post.populate('author', 'name image');

    const response: PostResponse = {
      success: true,
      data: post.toObject(),
      message: 'Post created successfully'
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectMongo();

    const body: UpdatePostRequest & { id: string } = await request.json();
    const { id, title, content, category, tags } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Find the post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // TODO: Check if user is authorized to edit this post
    // For now, we'll allow editing (replace with proper auth check)

    // Update fields
    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags.filter(tag => tag.trim().length > 0);

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'No fields to update' },
        { status: 400 }
      );
    }

    updateData.isEdited = true;
    updateData.editedAt = new Date();

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name image');

    const response: PostResponse = {
      success: true,
      data: updatedPost.toObject(),
      message: 'Post updated successfully'
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error updating post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectMongo();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Find the post
    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // TODO: Check if user is authorized to delete this post
    // For now, we'll allow deletion (replace with proper auth check)

    // Delete the post (this will also delete associated comments due to cascade)
    await Post.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Post deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
