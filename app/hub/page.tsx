'use client';

import React, { useState, useEffect } from 'react';
import ClientLayout from "@/components/LayoutClient";
import Post from "@/components/Post";

// Mock data for generated users
const generatedUsers = [
  { id: 1, name: 'Jane Doe', avatar: '@/components/femavatar.png' },
  { id: 2, name: 'John Smith', avatar: '@/components/manavatar.png' },
  // Add more generated user objects if needed
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
  // Additional generated posts can be added here
];

const Hub = () => {
  const [realPosts, setRealPosts] = useState([]); // State to store real posts fetched from API
  const [isLoading, setIsLoading] = useState(true); // State to handle loading status

  useEffect(() => {
    // Fetch real posts from an API when component mounts
    const fetchPosts = async () => {
      setIsLoading(true); // Set loading to true before fetching data
      try {
        const response = await fetch('/api/posts'); // Replace with your actual API endpoint
        const posts = await response.json(); // Parse JSON response into JS object/array
        setRealPosts(posts); // Set fetched posts to state
      } catch (error) {
        console.error('Failed to load posts:', error); // Handle any errors during fetch
      }
      setIsLoading(false); // Set loading to false after fetch completes
    };

    fetchPosts(); // Call the fetch function
  }, []); // Empty dependency array means this effect runs only once after initial render

  return (
    <ClientLayout>
      <main>
        <h1>Longevity Hub</h1>
        {isLoading ? (
          <p>Loading real posts...</p> // Display loading text while posts are being fetched
        ) : (
          realPosts.map((post) => (
            <Post
              key={post.id}
              id={post.id} // Ensure you pass the `id` prop if required by Post component
              author={post.author.name}
              avatar={post.author.avatar}
              content={post.content}
              likes={post.likes}
              comments={post.comments}
            />
          ))
        )}
        {generatedPosts.map((post) => {
          const user = generatedUsers.find((user) => user.id === post.authorId); // Find user data for each post
          return (
            <Post
              key={`generated-${post.id}`} // Unique key for React list items, using template literals for clarity
              id={post.id} // Pass id for generated posts if required by Post component
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
