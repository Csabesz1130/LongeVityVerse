// File: components/CommunityFeed.tsx

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CommunityPost } from '@/types';

interface CommunityFeedProps {
  posts: CommunityPost[];
}

const CommunityFeed: React.FC<CommunityFeedProps> = ({ posts }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {posts.map((post) => (
          <div key={post.id} className="mb-4">
            <h3>{post.author.name}</h3>
            <p>{post.content}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CommunityFeed;