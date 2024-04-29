import React, { useState } from 'react';

interface CommentProps {
  postId: number;
  addComment: (postId: number, comment: string) => void;
}

const Comment: React.FC<CommentProps> = ({ postId, addComment }) => {
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addComment(postId, commentText);
    setCommentText('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        placeholder="Add a comment..."
      />
      <button type="submit">Post Comment</button>
    </form>
  );
};

export default Comment;
