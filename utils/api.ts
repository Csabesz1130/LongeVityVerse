import { ApiResponse } from '@/types/community';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { error: 'An error occurred' };
            }

            throw new ApiError(
                errorData.error || `HTTP error! status: ${response.status}`,
                response.status,
                errorData
            );
        }

        const data = await response.json();
        return data;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            error instanceof Error ? error.message : 'Network error',
            0
        );
    }
}

export async function getPosts(params?: {
    category?: string;
    author?: string;
    tag?: string;
    page?: number;
    limit?: number;
    sort?: string;
}) {
    const searchParams = new URLSearchParams();

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                searchParams.append(key, value.toString());
            }
        });
    }

    return apiRequest<ApiResponse<any[]>>(`/api/posts?${searchParams}`);
}

export async function createPost(postData: {
    title?: string;
    content: string;
    category?: string;
    tags?: string[];
}) {
    return apiRequest<ApiResponse<any>>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(postData),
    });
}

export async function updatePost(postId: string, updateData: {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
}) {
    return apiRequest<ApiResponse<any>>('/api/posts', {
        method: 'PUT',
        body: JSON.stringify({ id: postId, ...updateData }),
    });
}

export async function deletePost(postId: string) {
    return apiRequest<ApiResponse<void>>(`/api/posts?id=${postId}`, {
        method: 'DELETE',
    });
}

export async function likePost(postId: string) {
    return apiRequest<ApiResponse<any>>(`/api/posts/${postId}/like`, {
        method: 'POST',
    });
}

export async function getComments(postId: string, params?: {
    page?: number;
    limit?: number;
}) {
    const searchParams = new URLSearchParams();

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                searchParams.append(key, value.toString());
            }
        });
    }

    return apiRequest<ApiResponse<any[]>>(`/api/posts/${postId}/comments?${searchParams}`);
}

export async function createComment(postId: string, content: string) {
    return apiRequest<ApiResponse<any>>(`/api/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    });
}

export async function updateComment(postId: string, commentId: string, content: string) {
    return apiRequest<ApiResponse<any>>(`/api/posts/${postId}/comments`, {
        method: 'PUT',
        body: JSON.stringify({ commentId, content }),
    });
}

export async function deleteComment(postId: string, commentId: string) {
    return apiRequest<ApiResponse<void>>(`/api/posts/${postId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
    });
} 