# Community Hub - Dynamic Features

This document outlines the dynamic community hub features that have been implemented, including the API endpoints, database models, and frontend components.

## 🚀 Features Implemented

### Core Functionality
- ✅ **Real-time Post Management**: Create, read, update, and delete posts
- ✅ **Comment System**: Add, edit, and delete comments on posts
- ✅ **Like System**: Like and unlike posts with real-time updates
- ✅ **User Authentication**: Placeholder for user authentication (ready for integration)
- ✅ **Category Filtering**: Filter posts by categories (nutrition, exercise, sleep, etc.)
- ✅ **Sorting Options**: Sort by latest, most liked, most commented, or most viewed
- ✅ **Pagination**: Load more posts with infinite scroll support
- ✅ **Tags System**: Add and manage tags for posts
- ✅ **Responsive Design**: Mobile-friendly interface with modern UI

### Advanced Features
- ✅ **Real-time Updates**: Posts update immediately after actions
- ✅ **Error Handling**: Comprehensive error handling and user feedback
- ✅ **Loading States**: Smooth loading indicators for better UX
- ✅ **Form Validation**: Client-side validation for all forms
- ✅ **TypeScript Support**: Full type safety throughout the application

## 📁 File Structure

```
app/
├── api/
│   └── posts/
│       ├── index.ts                    # Main posts API (GET, POST, PUT, DELETE)
│       └── [id]/
│           ├── comments/
│           │   └── index.ts            # Comments API (GET, POST, PUT, DELETE)
│           └── like/
│               └── index.ts            # Like/unlike API (GET, POST)
├── hub/
│   └── page.tsx                        # Main hub page with all features
components/
├── Post.tsx                            # Individual post component
├── CreatePost.tsx                      # Post creation form
└── Comment.tsx                         # Comment component (legacy)
models/
├── Post.ts                             # Post database model
├── Comment.ts                          # Comment database model
└── User.ts                             # User database model
types/
└── community.ts                        # TypeScript interfaces
utils/
└── api.ts                              # API utility functions
```

## 🗄️ Database Models

### Post Model
```typescript
{
  title: String,                    // Optional post title
  content: String,                  // Required post content
  author: ObjectId,                 // Reference to User
  category: String,                 // Post category
  tags: [String],                   // Array of tags
  likes: [ObjectId],                // Array of user IDs who liked
  comments: [ObjectId],             // Array of comment IDs
  isEdited: Boolean,                // Whether post was edited
  editedAt: Date,                   // When post was last edited
  isPinned: Boolean,                // Whether post is pinned
  viewCount: Number,                // Number of views
  createdAt: Date,                  // Creation timestamp
  updatedAt: Date                   // Last update timestamp
}
```

### Comment Model
```typescript
{
  content: String,                  // Comment content
  author: ObjectId,                 // Reference to User
  post: ObjectId,                   // Reference to Post
  likes: [ObjectId],                // Array of user IDs who liked
  isEdited: Boolean,                // Whether comment was edited
  editedAt: Date,                   // When comment was last edited
  createdAt: Date,                  // Creation timestamp
  updatedAt: Date                   // Last update timestamp
}
```

## 🔌 API Endpoints

### Posts API (`/api/posts`)

#### GET `/api/posts`
Fetch posts with filtering and pagination.

**Query Parameters:**
- `category` (optional): Filter by category
- `author` (optional): Filter by author ID
- `tag` (optional): Filter by tag
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10)
- `sort` (optional): Sort by 'createdAt', 'likes', 'comments', or 'views'

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "post_id",
      "title": "Post Title",
      "content": "Post content...",
      "author": {
        "_id": "user_id",
        "name": "User Name",
        "image": "avatar_url"
      },
      "category": "nutrition",
      "tags": ["health", "wellness"],
      "likes": ["user_id1", "user_id2"],
      "likeCount": 2,
      "commentCount": 3,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Posts retrieved successfully"
}
```

#### POST `/api/posts`
Create a new post.

**Request Body:**
```json
{
  "title": "Optional Post Title",
  "content": "Post content...",
  "category": "nutrition",
  "tags": ["health", "wellness"]
}
```

#### PUT `/api/posts`
Update an existing post.

**Request Body:**
```json
{
  "id": "post_id",
  "title": "Updated Title",
  "content": "Updated content...",
  "category": "exercise",
  "tags": ["fitness", "health"]
}
```

#### DELETE `/api/posts?id=post_id`
Delete a post.

### Comments API (`/api/posts/[id]/comments`)

#### GET `/api/posts/[id]/comments`
Fetch comments for a specific post.

#### POST `/api/posts/[id]/comments`
Add a comment to a post.

**Request Body:**
```json
{
  "content": "Comment content..."
}
```

#### PUT `/api/posts/[id]/comments`
Update a comment.

**Request Body:**
```json
{
  "commentId": "comment_id",
  "content": "Updated comment content..."
}
```

#### DELETE `/api/posts/[id]/comments?commentId=comment_id`
Delete a comment.

### Likes API (`/api/posts/[id]/like`)

#### POST `/api/posts/[id]/like`
Toggle like/unlike for a post.

**Response:**
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likeCount": 5
  },
  "message": "Post liked successfully"
}
```

#### GET `/api/posts/[id]/like`
Check if current user has liked the post.

## 🎨 Frontend Components

### Hub Page (`app/hub/page.tsx`)
Main community hub page with:
- Post creation form
- Category and sorting filters
- Post list with pagination
- Real-time updates
- Error handling and loading states

### Post Component (`components/Post.tsx`)
Individual post display with:
- Post content and metadata
- Like/unlike functionality
- Comment system
- Edit/delete options (for post author)
- Responsive design

### CreatePost Component (`components/CreatePost.tsx`)
Post creation form with:
- Title and content fields
- Category selection
- Tag management
- Form validation
- Collapsible interface

## 🔧 Configuration

### Environment Variables
Add these to your `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Authentication Setup
Currently using placeholder user ID. Replace with your authentication system:

```typescript
// In components, replace this:
const currentUserId = '507f1f77bcf86cd799439011';

// With your actual auth system:
const currentUserId = getCurrentUserId(); // Your auth function
```

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up MongoDB**
   - Ensure MongoDB is running
   - Add your connection string to `.env.local`

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Hub**
   - Navigate to `http://localhost:3000/hub`
   - Start creating posts and interacting with the community

## 🔮 Future Enhancements

### Planned Features
- [ ] **Real-time Notifications**: WebSocket integration for live updates
- [ ] **User Profiles**: Detailed user profiles with post history
- [ ] **Post Sharing**: Share posts on social media
- [ ] **Rich Text Editor**: Enhanced content creation with formatting
- [ ] **Image Upload**: Support for images in posts
- [ ] **Search Functionality**: Full-text search across posts
- [ ] **Moderation Tools**: Admin panel for content moderation
- [ ] **Email Notifications**: Email alerts for interactions

### Technical Improvements
- [ ] **Caching**: Redis integration for better performance
- [ ] **Rate Limiting**: API rate limiting for spam prevention
- [ ] **Analytics**: Post and user analytics
- [ ] **SEO Optimization**: Better SEO for public posts
- [ ] **Mobile App**: React Native mobile application

## 🐛 Troubleshooting

### Common Issues

1. **Posts not loading**
   - Check MongoDB connection
   - Verify API endpoints are accessible
   - Check browser console for errors

2. **Authentication errors**
   - Ensure user ID is properly set
   - Check if user exists in database

3. **Database errors**
   - Verify MongoDB is running
   - Check connection string format
   - Ensure models are properly defined

### Debug Mode
Enable debug logging by setting:
```env
DEBUG=true
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

For more information or support, please refer to the main project documentation or contact the development team. 