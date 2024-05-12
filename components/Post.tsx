import React, { useState } from 'react';

// Defining the types for props
interface PostProps {
  id: number;
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: string[];
}

// Post component to display a single post
const Post: React.FC<PostProps> = ({ id, author, avatar, content, likes, comments }) => {
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    setLikeCount(likeCount + 1); // Increment like count
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <img src={avatar} alt={`${author}'s avatar`} className="post-avatar" />
        <h3 className="post-author">{author}</h3>
      </div>
      <div className="post-content">{content}</div>
      <div className="post-footer">
        <button className="like-button" onClick={handleLike}>
          Like ({likeCount})
        </button>
        <span className="comments-count">{comments.length} Comments</span>
      </div>
    </div>
  );
};

export default Post;