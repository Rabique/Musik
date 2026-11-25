"use client";

import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const supabase = React.useMemo(() => createClient(), []);

  const fetchProfile = React.useCallback(
    async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", userId)
          .single();

        if (!error && data) {
          setProfile(data as UserProfile);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      }
    },
    [supabase]
  );

  const refreshProfile = React.useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  React.useEffect(() => {
    let isMounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user?.id) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user?.id) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase, fetchProfile]);

  const signInWithGoogle = React.useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/workspace`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      return { error: error ? new Error(error.message) : null };
    } catch (err: unknown) {
      return {
        error:
          err instanceof Error
            ? err
            : new Error("Google 로그인 요청 중 오류가 발생했습니다."),
      };
    }
  }, [supabase]);

  const signOut = React.useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setSession(null);
      return { error: error ? new Error(error.message) : null };
    } catch (err: unknown) {
      return {
        error:
          err instanceof Error
            ? err
            : new Error("로그아웃 중 오류가 발생했습니다."),
      };
    }
  }, [supabase]);

  const value = React.useMemo(
    () => ({
      user,
      profile,
      session,
      isLoading,
      signInWithGoogle,
      signOut,
      refreshProfile,
    }),
    [user, profile, session, isLoading, signInWithGoogle, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
