import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, MessageSquare, Search } from 'lucide-react';
import DashboardApi from '@/libs/dashboardApi';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  author: string;
  content: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  isLiked: boolean;
}

const CommunityInteraction: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      const data = await DashboardApi.getCommunityPosts();
      setPosts(data);
    };
    fetchPosts();
  }, []);

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    const createdPost = await DashboardApi.createCommunityPost(newPost);
    setPosts(prevPosts => [createdPost, ...prevPosts]);
    setNewPost('');
  };

  const handleLike = async (postId: string) => {
    await DashboardApi.likePost(postId);
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked } 
        : post
    ));
  };

  const handleComment = async (postId: string, comment: string) => {
    const newComment = await DashboardApi.addComment(postId, comment);
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, newComment] } 
        : post
    ));
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
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
            placeholder="Share your thoughts..."
            className="mb-2"
          />
          <Button onClick={handleSubmitPost}>Post</Button>
        </div>
        {filteredPosts.map(post => (
          <div key={post.id} className="mb-6 p-4 border rounded">
            <div className="flex items-center mb-2">
              <Avatar className="mr-2">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${post.author}`} />
                <AvatarFallback>{post.author[0]}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{post.author}</span>
            </div>
            <p className="mb-2">{post.content}</p>
            <div className="flex items-center text-sm text-gray-500">
              <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                <ThumbsUp className={`mr-1 ${post.isLiked ? 'text-blue-500' : ''}`} size={16} />
                {post.likes}
              </Button>
              <MessageSquare className="ml-4 mr-1" size={16} />
              {post.comments.length} Comments
            </div>
            <div className="mt-2">
              {post.comments.map(comment => (
                <div key={comment.id} className="ml-4 mt-2 p-2 bg-gray-100 rounded">
                  <span className="font-semibold">{comment.author}: </span>
                  {comment.content}
                </div>
              ))}
            </div>
            <div className="mt-2 flex">
              <Input 
                placeholder="Add a comment..." 
                className="mr-2"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleComment(post.id, (e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button variant="outline" size="sm">Comment</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CommunityInteraction;