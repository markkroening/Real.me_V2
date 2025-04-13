export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio?: string;
  location?: string;
  age?: number;
  avatar?: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  communityId: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    real_name: string;
  };
  community: {
    id: string;
    name: string;
    icon_url?: string | null;
  };
  comment_count: number;
} 