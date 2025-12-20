import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface UseSupabaseReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

export const useSupabase = (): UseSupabaseReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle specific auth events
        if (event === 'SIGNED_IN' && session?.user) {
          // Create or update user profile
          await handleUserSignIn(session.user);
        } else if (event === 'SIGNED_OUT') {
          // Clear user data
          setUser(null);
          setSession(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUserSignIn = async (user: User) => {
    try {
      // Import here to avoid circular dependency
      const { default: SupabaseService } = await import('../services/SupabaseService');
      
      // Check if user profile exists
      const profile = await SupabaseService.getUserProfile(user.id);
      
      if (!profile) {
        // Create user profile if it doesn't exist
        await SupabaseService.createUserProfile({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          role: user.user_metadata?.role || 'customer',
          avatar_url: user.user_metadata?.avatar_url || '',
          preferences: {},
          addresses: []
        });
      }
    } catch (error) {
      console.error('Error handling user sign in:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
  };
};

export default useSupabase;
