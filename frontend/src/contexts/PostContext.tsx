'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorName: string;
  communityId: string;
  communityName: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
}

interface PostContextType {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  fetchUserPosts: (username: string) => Promise<Post[]>;
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockPosts: Record<string, Post[]> = {
    'johndoe': [
      {
        id: '1',
        title: 'Getting Started with React',
        content: 'React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called "components".',
        createdAt: '2023-05-10T14:30:00Z',
        updatedAt: '2023-05-10T14:30:00Z',
        authorId: '1',
        authorName: 'John Doe',
        communityId: '1',
        communityName: 'Web Development',
        likesCount: 42,
        commentsCount: 12,
        isLiked: false,
      },
      {
        id: '2',
        title: 'TypeScript Best Practices',
        content: 'TypeScript adds static typing to JavaScript, which helps catch errors early in the development process. Here are some best practices for using TypeScript effectively.',
        createdAt: '2023-04-22T09:15:00Z',
        updatedAt: '2023-04-22T09:15:00Z',
        authorId: '1',
        authorName: 'John Doe',
        communityId: '1',
        communityName: 'Web Development',
        likesCount: 28,
        commentsCount: 7,
        isLiked: true,
      },
    ],
    'janedoe': [
      {
        id: '3',
        title: 'Photography Tips for Beginners',
        content: 'Starting your photography journey can be overwhelming. Here are some tips to help you get started and improve your skills.',
        createdAt: '2023-06-05T16:45:00Z',
        updatedAt: '2023-06-05T16:45:00Z',
        authorId: '2',
        authorName: 'Jane Doe',
        communityId: '2',
        communityName: 'Photography',
        likesCount: 67,
        commentsCount: 15,
        isLiked: false,
      },
      {
        id: '4',
        title: 'Travel Photography Equipment Guide',
        content: 'Choosing the right equipment for travel photography can be challenging. This guide will help you select the best gear for your needs and budget.',
        createdAt: '2023-05-18T11:20:00Z',
        updatedAt: '2023-05-18T11:20:00Z',
        authorId: '2',
        authorName: 'Jane Doe',
        communityId: '2',
        communityName: 'Photography',
        likesCount: 53,
        commentsCount: 9,
        isLiked: false,
      },
      {
        id: '5',
        title: 'Editing Photos in Lightroom',
        content: 'Adobe Lightroom is a powerful tool for editing your photos. Learn how to use it effectively to enhance your images.',
        createdAt: '2023-04-30T13:10:00Z',
        updatedAt: '2023-04-30T13:10:00Z',
        authorId: '2',
        authorName: 'Jane Doe',
        communityId: '2',
        communityName: 'Photography',
        likesCount: 89,
        commentsCount: 23,
        isLiked: true,
      },
    ],
    'demo_user': [
      {
        id: '6',
        title: 'My First Post on Real.me',
        content: 'Hello everyone! This is my first post on Real.me. I\'m excited to be part of this community and share my thoughts with you all.',
        createdAt: '2023-06-15T10:00:00Z',
        updatedAt: '2023-06-15T10:00:00Z',
        authorId: '3',
        authorName: 'Demo User',
        communityId: '3',
        communityName: 'General Discussion',
        likesCount: 5,
        commentsCount: 2,
        isLiked: false,
      },
    ],
  };

  const fetchUserPosts = async (username: string): Promise<Post[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (mockPosts[username]) {
        setPosts(mockPosts[username]);
        setIsLoading(false);
        return mockPosts[username];
      }
      
      setError(`No posts found for user: ${username}`);
      setPosts([]);
      setIsLoading(false);
      return [];
    } catch (error) {
      console.error('Error fetching user posts:', error);
      setError('Failed to fetch user posts');
      setPosts([]);
      setIsLoading(false);
      return [];
    }
  };

  const likePost = async (postId: string): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to like posts');
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, likesCount: post.likesCount + 1, isLiked: true } 
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unlikePost = async (postId: string): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to unlike posts');
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setPosts(prev => 
        prev.map(post => 
          post.id === postId 
            ? { ...post, likesCount: post.likesCount - 1, isLiked: false } 
            : post
        )
      );
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        isLoading,
        error,
        fetchUserPosts,
        likePost,
        unlikePost,
      }}
    >
      {children}
    </PostContext.Provider>
  );
}

export function usePost() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
} 