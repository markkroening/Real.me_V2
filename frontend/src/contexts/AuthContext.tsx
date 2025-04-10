'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface User {
  id: string;
  email: string;
  real_name: string | null;
  location: string | null;
  birth_date: string | null;
  isVerified: boolean;
  created_at: string;
  updated_at: string;
  verification_date: string | null;
  verified_by: string | null;
  verification_notes: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (real_name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for an existing session and fetch the user's profile on mount.
  useEffect(() => {
    const getSessionAndProfile = async () => {
      try {
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error retrieving user:', error);
          return;
        }

        if (supabaseUser) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', supabaseUser.id)
            .single();
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            return;
          }
          
          const finalUser: User = {
            id: supabaseUser.id,
            email: supabaseUser.email ?? '',
            real_name: profileData?.real_name ?? null,
            location: profileData?.location ?? null,
            birth_date: profileData?.birth_date ?? null,
            isVerified: profileData?.is_verified ?? false,
            created_at: profileData?.created_at || new Date().toISOString(),
            updated_at: profileData?.updated_at || new Date().toISOString(),
            verification_date: profileData?.verification_date ?? null,
            verified_by: profileData?.verified_by ?? null,
            verification_notes: profileData?.verification_notes ?? null,
          };

          setUser(finalUser);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSessionAndProfile();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) {
        throw new Error('No user was returned by Supabase.');
      }

      // Fetch the user's profile data from the "profiles" table.
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      if (profileError) throw profileError;

      const finalUser: User = {
        id: data.user.id,
        email: data.user.email ?? '',
        real_name: profileData?.real_name ?? null,
        location: profileData?.location ?? null,
        birth_date: profileData?.birth_date ?? null,
        isVerified: profileData?.is_verified ?? false,
        created_at: profileData?.created_at || new Date().toISOString(),
        updated_at: profileData?.updated_at || new Date().toISOString(),
        verification_date: profileData?.verification_date ?? null,
        verified_by: profileData?.verified_by ?? null,
        verification_notes: profileData?.verification_notes ?? null,
      };

      setUser(finalUser);
      localStorage.setItem('user', JSON.stringify(finalUser));
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      localStorage.removeItem('user');
    } catch (err) {
      console.error('Logout failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (real_name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (!data.user) {
        throw new Error('No user was returned by Supabase during signup.');
      }

      const now = new Date().toISOString();

      // Insert a new profile into the "profiles" table using the provided real name.
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            real_name: real_name,
            location: null,
            birth_date: null,
            is_verified: false,
            created_at: now,
            updated_at: now,
            verification_date: null,
            verified_by: null,
            verification_notes: null,
          },
        ]);
      if (insertError) throw insertError;

      const finalUser: User = {
        id: data.user.id,
        email: data.user.email ?? '',
        real_name,
        location: null,
        birth_date: null,
        isVerified: false,
        created_at: now,
        updated_at: now,
        verification_date: null,
        verified_by: null,
        verification_notes: null,
      };

      setUser(finalUser);
      localStorage.setItem('user', JSON.stringify(finalUser));
    } catch (err) {
      console.error('Signup failed:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signup,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
