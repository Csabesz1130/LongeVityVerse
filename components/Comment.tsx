import React, { useState } from 'react';

interface CommentProps {
  comments: string[]; // Array of comments to display
  postId: number;
  addComment: (postId: number, comment: string) => void;
}

const Comment: React.FC<CommentProps> = ({ comments, postId, addComment }) => {
  const [commentText, setCommentText] = useState('');
  const [isOpen, setIsOpen] = useState(false); // State to toggle comment display

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addComment(postId, commentText);
    setCommentText(''); // Reset the input field after submission
  };

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)} className="comments-toggle">
        {isOpen ? 'Hide Comments' : `View Comments (${comments.length})`}
      </button>

      {isOpen && (
        <div className="comments-container">
          {comments.map((comment, index) => (
            <p key={index} className="comment">{comment}</p>
          ))}

          <form onSubmit={handleSubmit} className="comment-form">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
            />
            <button type="submit" className="submit-comment">Post Comment</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Comment;
