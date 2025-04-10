'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string | null;
  location: string | null;
  age: number | null;
  bio: string | null;
  isVerified: boolean;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

interface ProfileContextType {
  profiles: Record<string, UserProfile>;
  isLoading: boolean;
  error: string | null;
  fetchProfile: (username: string) => Promise<UserProfile | null>;
  followUser: (username: string) => Promise<void>;
  unfollowUser: (username: string) => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration
  const mockProfiles: Record<string, UserProfile> = {
    'johndoe': {
      id: '1',
      username: 'johndoe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      avatar: null,
      location: 'New York, USA',
      age: 32,
      bio: 'Software developer and tech enthusiast',
      isVerified: true,
      createdAt: '2023-01-15T12:00:00Z',
      followersCount: 124,
      followingCount: 87,
      isFollowing: false,
    },
    'janedoe': {
      id: '2',
      username: 'janedoe',
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      avatar: null,
      location: 'Toronto, Canada',
      age: 28,
      bio: 'Photographer and travel enthusiast',
      isVerified: true,
      createdAt: '2023-02-20T14:30:00Z',
      followersCount: 256,
      followingCount: 142,
      isFollowing: true,
    },
    'demo_user': {
      id: '3',
      username: 'demo_user',
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      avatar: null,
      location: 'London, UK',
      age: 25,
      bio: 'This is a demo account',
      isVerified: false,
      createdAt: '2023-03-10T09:15:00Z',
      followersCount: 12,
      followingCount: 8,
      isFollowing: false,
    },
  };

  // Initialize with mock data
  useEffect(() => {
    setProfiles(mockProfiles);
  }, []);

  const fetchProfile = async (username: string): Promise<UserProfile | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll use mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (mockProfiles[username]) {
        // If the profile is already in state, return it
        if (profiles[username]) {
          setIsLoading(false);
          return profiles[username];
        }
        
        // Otherwise, add it to state and return it
        setProfiles(prev => ({
          ...prev,
          [username]: mockProfiles[username],
        }));
        
        setIsLoading(false);
        return mockProfiles[username];
      }
      
      setError(`Profile not found: ${username}`);
      setIsLoading(false);
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to fetch profile');
      setIsLoading(false);
      return null;
    }
  };

  const followUser = async (username: string): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to follow users');
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProfiles(prev => {
        if (!prev[username]) return prev;
        
        return {
          ...prev,
          [username]: {
            ...prev[username],
            followersCount: prev[username].followersCount + 1,
            isFollowing: true,
          },
        };
      });
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const unfollowUser = async (username: string): Promise<void> => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to unfollow users');
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProfiles(prev => {
        if (!prev[username]) return prev;
        
        return {
          ...prev,
          [username]: {
            ...prev[username],
            followersCount: prev[username].followersCount - 1,
            isFollowing: false,
          },
        };
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        isLoading,
        error,
        fetchProfile,
        followUser,
        unfollowUser,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
} 