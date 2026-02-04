
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userProfile: Profile | null;
  signUp: (email: string, password: string, fullName: string, role: 'customer' | 'manufacturer') => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateUserRole: (role: 'customer' | 'manufacturer') => Promise<{ error: Error | null }>;
  checkUserExists: (email: string) => Promise<boolean>;
  checkProfileExists: (userId: string) => Promise<{ exists: boolean; profile: Profile | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const profile = await fetchUserProfile(session.user.id);
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only fetch profile if we don't have it or if it's a new user
          if (!userProfile || userProfile.id !== session.user.id) {
             const profile = await fetchUserProfile(session.user.id);
             setUserProfile(profile);
          }
        } else {
          setUserProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      // We can't directly check auth.users from client, so we check profiles
      // This assumes a profile is created on signup (which it should be via triggers)
      const { data } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();
      
      return !!data;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  };

  const checkProfileExists = async (userId: string): Promise<{ exists: boolean; profile: Profile | null }> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        return { exists: false, profile: null };
      }
      
      return { exists: !!data, profile: data };
    } catch (error) {
      return { exists: false, profile: null };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'customer' | 'manufacturer') => {
    // Note: We rely on Supabase to handle "User already exists" errors
    const redirectUrl = `${window.location.origin}/auth-callback`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role
        }
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } else if (data.user && !data.session) {
      toast({
        title: "Account Created!",
        description: "A confirmation link has been sent to your email.",
        duration: 5000
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth-callback`
      }
    });

    if (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const updateUserRole = async (role: 'customer' | 'manufacturer') => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    // Only update role if it doesn't exist (role locking)
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', user.id)
      .is('role', null); // Only update if role is null

    if (error) {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    } 
    
    // Refresh user profile
    const profile = await fetchUserProfile(user.id);
    setUserProfile(profile);
    
    toast({
      title: "Role updated",
      description: "Your account role has been set successfully."
    });
    
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserProfile(null);
    toast({
      title: "Signed out",
      description: "You have been successfully signed out."
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      userProfile,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      updateUserRole,
      checkUserExists,
      checkProfileExists
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
