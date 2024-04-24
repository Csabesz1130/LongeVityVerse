import React, { useState, useEffect } from 'react';
import ClientLayout from "@/components/LayoutClient";
import Post from "@/components/Post";

// Mock data for generated users
const generatedUsers = [
  { id: 1, name: 'Jane Doe', avatar: '@/components/femavatar.png' },
  { id: 2, name: 'John Smith', avatar: '@/components/manavatar.png' },
  // Add more generated user objects
];

// Mock data for generated posts
const generatedPosts = [
  {
    id: 1,
    authorId: 1,
    content: 'Excited to join the Longevity Hub! Looking forward to connecting with everyone.',
    likes: 10,
    comments: ['Welcome!', 'Glad to have you with us.']
  },
  {
    id: 2,
    authorId: 2,
    content: 'Check out my latest article on nutrition and longevity!',
    likes: 15,
    comments: ['Interesting read!', 'Thanks for sharing.']
  },
  // Add more generated post objects
];

const Hub = () => {
  const [realPosts, setRealPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching real posts from an API
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        // Replace with a real API call
        const response = await fetch('/api/posts');
        const posts = await response.json();
        setRealPosts(posts);
      } catch (error) {
        console.error('Failed to load posts:', error);
      }
      setIsLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <ClientLayout>
      <main>
        <h1>Longevity Hub</h1>
        {isLoading ? (
          <p>Loading real posts...</p>
        ) : (
          realPosts.map((post) => (
            <Post
              key={post.id}
              author={post.author.name}
              avatar={post.author.avatar}
              content={post.content}
              likes={post.likes}
              comments={post.comments}
            />
          ))
        )}
        {generatedPosts.map((post) => {
          const user = generatedUsers.find((user) => user.id === post.authorId);
          return (
            <Post
              key={`generated-${post.id}`}
              author={user.name}
              avatar={user.avatar}
              content={post.content}
              likes={post.likes}
              comments={post.comments}
            />
          );
        })}
      </main>
    </ClientLayout>
  );
};

export default Hub;
