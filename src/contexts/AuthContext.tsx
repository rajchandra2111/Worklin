import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Role = 'client' | 'freelancer' | null;

interface AuthContextType {
  user: User | null;
  role: Role;
  isLoading: boolean;
  fetchRole: (userId: string, metadataRole?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id, session.user.user_metadata?.role);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsLoading(true);
        fetchRole(session.user.id, session.user.user_metadata?.role);
      } else {
        setRole(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (userId: string, metadataRole?: string) => {
    try {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (data && data.role) {
        setRole(data.role as Role);
      } else if (metadataRole) {
        // Fallback to metadata if DB record hasn't propagated yet
        setRole(metadataRole as Role);
      } else {
        setRole('client'); // Safe default
      }
    } catch (err) {
      console.error('Error fetching role:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, role, isLoading, fetchRole, signOut }}>
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
