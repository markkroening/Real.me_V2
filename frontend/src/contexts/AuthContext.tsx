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
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (real_name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use Supabase auth state changes listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session:', session);
        setIsLoading(true);
        const currentUser = session?.user;
        const currentToken = session?.access_token || null;
        setToken(currentToken);

        if (currentUser) {
          // Fetch profile if user exists
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
              
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching user profile:', profileError);
              setUser(null);
            } else {
              const finalUser: User = {
                id: currentUser.id,
                email: currentUser.email ?? '',
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
          } catch (profileErr) {
             console.error('Caught error fetching profile:', profileErr);
             setUser(null);
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      console.error('Login failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Logout failed:', err);
      throw err;
    }
  };

  const signup = async (real_name: string, email: string, password: string) => {
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;
      if (!signUpData.user) {
        throw new Error('No user was returned by Supabase during signup.');
      }

      const now = new Date().toISOString();

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: signUpData.user.id,
            email: signUpData.user.email,
            real_name: real_name,
            is_verified: false,
            created_at: now,
            updated_at: now,
          },
        ]);
        
      if (insertError) {
          console.warn('Profile insertion failed (maybe RLS?):', insertError);
      }

    } catch (err) {
      console.error('Signup failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        token,
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
