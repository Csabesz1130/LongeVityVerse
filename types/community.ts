export interface User {
    _id: string;
    name: string;
    email: string;
    image?: string;
    hasAccess: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface Comment {
    _id: string;
    content: string;
    author: User | string;
    post: string;
    likes: string[];
    likeCount: number;
    isEdited: boolean;
    editedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface Post {
    _id: string;
    title?: string;
    content: string;
    author: User | string;
    category: 'general' | 'nutrition' | 'exercise' | 'sleep' | 'mental-health' | 'longevity-research' | 'personal-story';
    tags: string[];
    likes: string[];
    comments: Comment[] | string[];
    likeCount: number;
    commentCount: number;
    isEdited: boolean;
    editedAt?: Date;
    isPinned: boolean;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePostRequest {
    title?: string;
    content: string;
    category?: string;
    tags?: string[];
}

export interface UpdatePostRequest {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
}

export interface CreateCommentRequest {
    content: string;
    postId: string;
}

export interface UpdateCommentRequest {
    content: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export interface PostsResponse extends ApiResponse<Post[]> { }
export interface PostResponse extends ApiResponse<Post> { }
export interface CommentResponse extends ApiResponse<Comment> { }
export interface CommentsResponse extends ApiResponse<Comment[]> { } 