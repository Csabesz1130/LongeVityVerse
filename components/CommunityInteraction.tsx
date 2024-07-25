// File: components/CommunityInteraction.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { ThumbsUp, MessageSquare, Search } from 'lucide-react';
import DashboardApi from '@/libs/dashboardApi';

interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  content: string;
  likes: number;
  comments: number;
  createdAt: string;
  isLiked: boolean;
}

const CommunityInteraction: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await DashboardApi.getCommunityPosts();
        setPosts(data);
      } catch (error) {
        console.error('Error fetching community posts:', error);
      }
    };
    fetchPosts();
  }, []);

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    try {
      const createdPost = await DashboardApi.createCommunityPost(newPost);
      setPosts(prevPosts => [createdPost, ...prevPosts]);
      setNewPost('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await DashboardApi.likePost(postId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked } 
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Interaction</CardTitle>
        <div className="flex items-center">
          <Search className="mr-2" />
          <Input 
            placeholder="Search posts..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Share your thoughts or ask a question..."
            className="mb-2"
          />
          <Button onClick={handleSubmitPost}>Post</Button>
        </div>
        {filteredPosts.map(post => (
          <div key={post.id} className="mb-6 p-4 border rounded">
            <div className="flex items-center mb-2">
            <Avatar alt={post.author.name} fallback={post.author.name[0]} />
              <span className="font-semibold ml-2">{post.author.name}</span>
            </div>
            <p className="mb-2">{post.content}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                <ThumbsUp className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} size={16} />
                {post.likes}
              </Button>
              <div className="ml-4 flex items-center">
                <MessageSquare className="mr-1" size={16} />
                {post.comments} Comments
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CommunityInteraction;