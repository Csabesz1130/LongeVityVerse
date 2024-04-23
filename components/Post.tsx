import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, AwaitedReactNode, Key } from "react";

// Sample Post component to display a single post
const Post = ({ author, avatar, content, likes, comments }: { author: string, avatar: string, content: string, likes: number, comments: string[] }) => {
    return (
      <div className="post">
        <img src={avatar} alt={`${author}'s avatar`} />
        <h3>{author}</h3>
        <p>{content}</p>
        <span>{likes} likes</span>
        <div className="comments">
          {comments.map((comment: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode>, index: Key) => (
            <p key={index}>{comment}</p>
          ))}
        </div>
        {/* Add any additional post functionality */}
      </div>
    );
  };
  
  export default Post;
  