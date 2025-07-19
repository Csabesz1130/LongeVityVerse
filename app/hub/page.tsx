'use client';

import React, { useState, useEffect } from 'react';
import ClientLayout from "@/components/LayoutClient";
import Post from "@/components/Post";
import CreatePost from "@/components/CreatePost";
import { Post as PostType } from '@/types/community';

const Hub = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    sort: 'createdAt'
  });

  // TODO: Replace with actual user authentication
  const currentUserId = '507f1f77bcf86cd799439011'; // Placeholder user ID

  const fetchPosts = async (page = 1, reset = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        sort: filters.sort
      });

      if (filters.category) {
        params.append('category', filters.category);
      }

      const response = await fetch(`/api/posts?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const result = await response.json();

      if (result.success && result.data) {
        if (reset) {
          setPosts(result.data);
        } else {
          setPosts(prev => [...prev, ...result.data]);
        }

        // Check if there are more posts
        setHasMore(result.data.length === 10);
      } else {
        throw new Error(result.error || 'Failed to fetch posts');
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch posts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(1, true);
  }, [filters]);

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchPosts(nextPage, false);
    }
  };

  const handlePostCreated = (newPost: PostType) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const handlePostEdited = (postId: string, newContent: string) => {
    setPosts(prev => prev.map(post =>
      post._id === postId
        ? { ...post, content: newContent, isEdited: true, editedAt: new Date() }
        : post
    ));
  };

  const handlePostLiked = (postId: string, liked: boolean) => {
    setPosts(prev => prev.map(post =>
      post._id === postId
        ? {
          ...post,
          likes: liked
            ? [...(post.likes || []), currentUserId]
            : (post.likes || []).filter(id => id !== currentUserId),
          likeCount: liked ? (post.likeCount || 0) + 1 : (post.likeCount || 0) - 1
        }
        : post
    ));
  };

  const handlePostCommented = (postId: string, comment: string) => {
    setPosts(prev => prev.map(post =>
      post._id === postId
        ? { ...post, commentCount: (post.commentCount || 0) + 1 }
        : post
    ));
  };

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'general', label: 'General' },
    { value: 'nutrition', label: 'Nutrition' },
    { value: 'exercise', label: 'Exercise' },
    { value: 'sleep', label: 'Sleep' },
    { value: 'mental-health', label: 'Mental Health' },
    { value: 'longevity-research', label: 'Longevity Research' },
    { value: 'personal-story', label: 'Personal Story' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Latest' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'comments', label: 'Most Commented' },
    { value: 'views', label: 'Most Viewed' }
  ];

  return (
    <ClientLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Longevity Hub</h1>
            <p className="text-gray-600">
              Connect with the longevity community. Share your experiences, ask questions, and learn from others.
            </p>
          </div>

          {/* Create Post */}
          <CreatePost
            onPostCreated={handlePostCreated}
            currentUserId={currentUserId}
          />

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  id="sort"
                  value={filters.sort}
                  onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => fetchPosts(1, true)}
                  className="mt-2 text-red-600 hover:text-red-800 underline"
                >
                  Try again
                </button>
              </div>
            )}

            {posts.length === 0 && !isLoading && !error && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                <p className="text-gray-600 mb-4">
                  Be the first to share something with the community!
                </p>
              </div>
            )}

            {posts.map((post) => (
              <Post
                key={post._id}
                post={post}
                currentUserId={currentUserId}
                onLike={handlePostLiked}
                onComment={handlePostCommented}
                onDelete={handlePostDeleted}
                onEdit={handlePostEdited}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Load More Posts'}
                </button>
              </div>
            )}

            {/* Loading State */}
            {isLoading && posts.length === 0 && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center border border-gray-200">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading posts...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Hub;
