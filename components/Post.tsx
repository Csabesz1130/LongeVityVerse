import React, { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, Key } from "react";

// Defining the types for props
interface PostProps {
  author: string;
  avatar: string;
  content: string;
  likes: number;
  comments: string[];
  postId: number;
}

// Sample Post component to display a single post
const Post: React.FC<PostProps> = ({ author, avatar, content, likes, comments, postId }) => {
  return (
    <div className="post">
      <img src={avatar} alt={`${author}'s avatar`} />
      <h3>{author}</h3>
      <p>{content}</p>
      <span>{likes} likes</span>
      <div className="comments">
        {comments.map((comment, index) => (
          <p key={index as React.Key}>{comment}</p>
        ))}
      </div>
      {/* Add any additional post functionality */}
    </div>
  );
};

export default Post;
