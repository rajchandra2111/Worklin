import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

type Role = 'client' | 'freelancer' | null;

interface AuthContextType {
  user: User | null;
  role: Role; // Verified DB role
  activeRole: Role; // What they are trying to be
  onlineUsers: Set<string>; // Globally tracked online users
  isLoading: boolean;
  verifyRole: (userId: string, intendedRole: Role) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role>(null);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const [activeRole, setActiveRole] = useState<Role>(() => {
    return (localStorage.getItem('activeRole') as Role) || null;
  });

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        verifyRole(session.user.id, localStorage.getItem('activeRole') as Role || session.user.user_metadata?.role);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsLoading(true);
        verifyRole(session.user.id, localStorage.getItem('activeRole') as Role || session.user.user_metadata?.role);
      } else {
        setRole(null);
        setActiveRole(null);
        localStorage.removeItem('activeRole');
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Global Presence Tracking
  useEffect(() => {
    if (!user) {
      setOnlineUsers(new Set());
      return;
    }

    const presenceChannel = supabase.channel('global-online-users');
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const activeIds = new Set(Object.values(state).flatMap((p: any) => p.map((u: any) => u.user_id)) as string[]);
        setOnlineUsers(activeIds);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ user_id: user.id });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [user]);

  const verifyRole = async (userId: string, intendedRole: Role) => {
    if (!intendedRole) {
      setRole(null);
      setActiveRole(null);
      setIsLoading(false);
      return;
    }

    try {
      const table = intendedRole === 'client' ? 'client_profiles' : 'freelancer_profiles';
      
      const { data } = await supabase
        .from(table)
        .select('id')
        .eq('id', userId)
        .single();
        
      if (data) {
        setRole(intendedRole);
        setActiveRole(intendedRole);
        localStorage.setItem('activeRole', intendedRole);
      } else {
        // They don't have this profile yet! They need onboarding for this role.
        setRole(null);
        setActiveRole(intendedRole); // We remember they want to be this role
      }
    } catch (err) {
      console.error(`Error verifying ${intendedRole} role:`, err);
      setRole(null);
      setActiveRole(intendedRole);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
        user,
        role,
        activeRole,
        onlineUsers,
        isLoading,
        verifyRole,
        signOut,
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
