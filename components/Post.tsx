import React, { useState, useEffect } from 'react';
import { Post as PostType, Comment as CommentType } from '@/types/community';

interface PostProps {
  post: PostType;
  onLike?: (postId: string, liked: boolean) => void;
  onComment?: (postId: string, comment: string) => void;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string, content: string) => void;
  currentUserId?: string;
}

const Post: React.FC<PostProps> = ({
  post,
  onLike,
  onComment,
  onDelete,
  onEdit,
  currentUserId
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isLoading, setIsLoading] = useState(false);

  // Get author information
  const author = typeof post.author === 'string' ? { name: 'Unknown User', image: '' } : post.author;

  useEffect(() => {
    // Check if current user has liked this post
    if (currentUserId && post.likes) {
      setIsLiked(post.likes.includes(currentUserId));
    }
    setLikeCount(post.likeCount || 0);
  }, [post, currentUserId]);

  const handleLike = async () => {
    if (!currentUserId) {
      alert('Please log in to like posts');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.data.liked);
        setLikeCount(data.data.likeCount);
        if (onLike) {
          onLike(post._id, data.data.liked);
        }
      } else {
        console.error('Failed to like post');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !currentUserId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${post._id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: commentText }),
      });

      if (response.ok) {
        setCommentText('');
        if (onComment) {
          onComment(post._id, commentText);
        }
        // Refresh comments
        setShowComments(true);
      } else {
        console.error('Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editContent.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/posts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: post._id,
          content: editContent
        }),
      });

      if (response.ok) {
        setIsEditing(false);
        if (onEdit) {
          onEdit(post._id, editContent);
        }
      } else {
        console.error('Failed to edit post');
      }
    } catch (error) {
      console.error('Error editing post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts?id=${post._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (onDelete) {
          onDelete(post._id);
        }
      } else {
        console.error('Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const canEdit = currentUserId && (typeof post.author === 'string' ? post.author === currentUserId : post.author._id === currentUserId);
  const canDelete = canEdit;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-gray-200">
      {/* Post Header */}
      <div className="flex items-center mb-4">
        <img
          src={author.image || '/default-avatar.png'}
          alt={`${author.name}'s avatar`}
          className="w-10 h-10 rounded-full mr-3 object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{author.name}</h3>
          <div className="flex items-center text-sm text-gray-500">
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            {post.isEdited && (
              <span className="ml-2 text-xs text-gray-400">(edited)</span>
            )}
            {post.category && (
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {post.category}
              </span>
            )}
          </div>
        </div>
        {(canEdit || canDelete) && (
          <div className="flex space-x-2">
            {canEdit && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-gray-500 hover:text-gray-700 text-sm"
                disabled={isLoading}
              >
                Edit
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-sm"
                disabled={isLoading}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="mb-4">
        {post.title && (
          <h2 className="text-xl font-semibold mb-2 text-gray-900">{post.title}</h2>
        )}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>
        )}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Post Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className={`flex items-center space-x-1 px-3 py-1 rounded-md transition-colors ${isLiked
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } disabled:opacity-50`}
          >
            <span>❤️</span>
            <span>{likeCount}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
          >
            <span>💬</span>
            <span>{post.commentCount || 0}</span>
          </button>
        </div>

        <div className="text-sm text-gray-500">
          {post.viewCount > 0 && `${post.viewCount} views`}
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold mb-3">Comments</h4>

          {/* Comment Form */}
          {currentUserId && (
            <form onSubmit={handleComment} className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  Post
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-3">
            {Array.isArray(post.comments) && post.comments.length > 0 ? (
              post.comments.map((comment) => {
                const commentData = typeof comment === 'string' ? null : comment;
                if (!commentData) return null;

                const commentAuthor = typeof commentData.author === 'string'
                  ? { name: 'Unknown User', image: '' }
                  : commentData.author;

                return (
                  <div key={commentData._id} className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-center mb-2">
                      <img
                        src={commentAuthor.image || '/default-avatar.png'}
                        alt={`${commentAuthor.name}'s avatar`}
                        className="w-6 h-6 rounded-full mr-2 object-cover"
                      />
                      <span className="font-medium text-sm">{commentAuthor.name}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(commentData.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800">{commentData.content}</p>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Post;