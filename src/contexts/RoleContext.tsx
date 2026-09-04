import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Role } from '../types';

interface RoleContextType {
  session: Session | null;
  user: User | null;
  role: Role | null;
  isAdmin: boolean;
  isFaculty: boolean;
  isStudent: boolean;
  signOut: () => Promise<void>;
  loading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('role').eq('id', userId).single();
      if (!error && data) {
        setRole(data.role as Role);
      } else {
        // Automatically insert a student profile if none exists (Fallback for when trigger isn't active)
        const { error: insertError } = await supabase.from('profiles').insert([{ id: userId, full_name: 'New User', role: 'STUDENT' }]);
        if (!insertError) {
          setRole('STUDENT');
        } else {
          setRole('STUDENT'); // Fallback memory state
        }
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <RoleContext.Provider value={{
      session,
      user,
      role,
      isAdmin: role === 'ADMIN',
      isFaculty: role === 'FACULTY' || role === 'ADMIN',
      isStudent: role === 'STUDENT',
      signOut,
      loading
    }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
